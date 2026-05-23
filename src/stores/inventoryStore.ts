import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { Product, InventoryMovement, InventoryTransfer } from '@/types/inventory'
import { businessApi } from '../services/businessApi'

export const useInventoryStore = defineStore('inventory', () => {
  const root = useStateStore()

  const products = ref<Product[]>([])

  // Analytics state
  const deadInventory = ref<Product[]>([])
  const reorderSuggestions = ref<Record<string, any[]>>({})
  const abcAnalysis = ref<Record<string, string>>({})

  // Getters
  const activeTenantId = computed(() => root.activeTenantId)
  
  const tenantProducts = computed(() => 
    products.value.filter(p => p.tenantId === activeTenantId.value)
  )

  const tenantLocations = computed(() => {
    const t = root.tenants.find(tenant => tenant.id === activeTenantId.value)
    return t?.locations || []
  })

  const canManageInventory = computed(() => root.can('manage_inventory'))

  // Actions
  async function createProduct(payload: Partial<Product>) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    const productData = {
      sku: (payload.sku || '').trim(),
      name: (payload.name || '').trim(),
      price: Number(payload.price || 0),
      cost: Number(payload.cost || 0),
      taxRate: Number(payload.taxRate || 0),
      stock: Number(payload.stock || 0),
      minStock: Number(payload.minStock || 0),
      maxStock: Number(payload.maxStock || 0),
      location: (payload.location || '').trim(),
      category: (payload.category || 'General').trim(),
      barcode: (payload.barcode || '').trim(),
      isInventoriable: payload.isInventoriable !== false,
      productType: payload.productType || 'standard',
      kitComponents: payload.kitComponents || [],
      preferredSupplier: (payload.preferredSupplier || '').trim(),
    }
    if (!productData.name) return { ok: false, message: 'El nombre del producto es requerido.' }
    
    try {
      const product = await businessApi.createProduct(productData, activeTenantId.value!)
      products.value.unshift(product)
      return { ok: true, message: 'Producto guardado.', detail: `${product.name} ya está disponible.` }
    } catch (e: any) {
      return { ok: false, message: 'Error en servidor', detail: e.message }
    }
  }

  async function transferStock({ productId, fromLocId, toLocId, quantity }: any) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    try {
      const transfer = await businessApi.transferStock({ productId, fromLocId, toLocId, quantity }, activeTenantId.value!)
      await fetchProducts()
      return { ok: true, message: 'Traslado despachado.', transferId: transfer.id }
    } catch (e: any) {
      return { ok: false, message: 'Error', detail: e.message }
    }
  }

  async function receiveTransfer(transferId: string) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    try {
      await businessApi.receiveTransfer(transferId, activeTenantId.value!)
      await fetchProducts()
      return { ok: true, message: 'Mercancia recibida.' }
    } catch (e: any) {
      return { ok: false, message: 'Error', detail: e.message }
    }
  }

  async function auditInventory({ adjustments }: any) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    try {
      const res = await businessApi.auditInventory({ adjustments }, activeTenantId.value!)
      await fetchProducts()
      return { ok: true, message: res.message }
    } catch (e: any) {
      return { ok: false, message: 'Error', detail: e.message }
    }
  }

  async function receiveInventory({ productId, quantity, unitCost, locId }: any) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    try {
      const res = await businessApi.receiveInventory({ productId, quantity, unitCost, locId }, activeTenantId.value!)
      await fetchProducts()
      return { ok: true, message: 'Inventario recibido.' }
    } catch (e: any) {
      return { ok: false, message: 'Error', detail: e.message }
    }
  }

  function importProductsCSV(csvContent: string) {
    // Left as is since we don't have a backend endpoint for CSV yet
    return { ok: false, message: 'No implementado en backend aun.' }
  }

  async function fetchProducts() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getProducts(activeTenantId.value)
      products.value = data as Product[]
    } catch (e) { console.error('Error fetching products', e) }
  }

  async function fetchAnalytics() {
    if (!activeTenantId.value) return
    try {
      const [dead, reorder, abc] = await Promise.all([
        businessApi.getDeadInventory(activeTenantId.value),
        businessApi.getReorderSuggestions(activeTenantId.value),
        businessApi.getAbcAnalysis(activeTenantId.value)
      ])
      deadInventory.value = dead
      reorderSuggestions.value = reorder
      abcAnalysis.value = abc
    } catch (e) { console.error('Error fetching inventory analytics', e) }
  }

  // Auto-fetch
  watch([activeTenantId, () => root.session.currentUserId], ([newId, userId]) => {
    if (newId && userId) {
      fetchProducts()
      fetchAnalytics()
    }
  }, { immediate: true })

  return { 
    products, 
    tenantProducts, 
    tenantLocations, 
    deadInventory, 
    reorderSuggestions, 
    abcAnalysis, 
    createProduct, 
    transferStock, 
    receiveTransfer, 
    auditInventory, 
    receiveInventory, 
    importProductsCSV, 
    canManageInventory, 
    fetchProducts,
    fetchAnalytics
  }
})
