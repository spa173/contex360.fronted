import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { Product, InventoryMovement, InventoryTransfer } from '@/types/inventory'
import { uid, appendAuditEvent } from '@/utils/storeHelpers'

export const useInventoryStore = defineStore('inventory', () => {
  const root = useStateStore()

  // State
  const products = ref<Product[]>([
    {
      id: 'prod-1',
      tenantId: 'tenant-a',
      sku: 'SER-001',
      name: 'Diagnostico contable mensual',
      price: 850000,
      cost: 420000,
      taxRate: 19,
      stock: 8,
      stockByLocation: { 'loc-a-1': 8 },
      minStock: 3,
      maxStock: 20,
      location: '',
      category: 'Servicios',
      barcode: '',
      isInventoriable: false,
      productType: 'standard',
      kitComponents: [],
      unit: 'servicio',
    },
    {
      id: 'prod-2',
      tenantId: 'tenant-a',
      sku: 'KIT-INV-01',
      name: 'Kit de inventario inicial',
      price: 320000,
      cost: 170000,
      taxRate: 19,
      stock: 4,
      stockByLocation: { 'loc-a-1': 2, 'loc-a-2': 2 },
      minStock: 2,
      maxStock: 50,
      location: 'Bodega A - Estante 3',
      category: 'Insumos',
      barcode: '7701234567890',
      isInventoriable: true,
      productType: 'standard',
      kitComponents: [],
      unit: 'unidad',
    },
    {
      id: 'prod-3',
      tenantId: 'tenant-a',
      sku: 'LIC-IA-01',
      name: 'Modulo IA documental',
      price: 1200000,
      cost: 580000,
      taxRate: 19,
      stock: 2,
      stockByLocation: { 'loc-a-1': 2 },
      minStock: 2,
      maxStock: 10,
      location: 'Digital',
      category: 'Software',
      barcode: '',
      isInventoriable: false,
      productType: 'standard',
      kitComponents: [],
      unit: 'licencia',
    },
    {
      id: 'prod-4',
      tenantId: 'tenant-b',
      sku: 'SKU-CAJA-01',
      name: 'Caja registradora basica',
      price: 540000,
      cost: 310000,
      taxRate: 19,
      stock: 14,
      stockByLocation: { 'loc-b-1': 10, 'loc-b-2': 4 },
      minStock: 4,
      maxStock: 20,
      location: 'Pasillo 1',
      category: 'Hardware',
      barcode: '7709876543210',
      isInventoriable: true,
      productType: 'standard',
      kitComponents: [],
      unit: 'unidad',
    },
    {
      id: 'prod-kit-1',
      tenantId: 'tenant-a',
      sku: 'KIT-BIENVENIDA',
      name: 'Kit de Bienvenida Empleado',
      price: 450000,
      cost: 170000,
      taxRate: 19,
      stock: 0,
      stockByLocation: {},
      minStock: 0,
      maxStock: 0,
      location: '',
      category: 'Combos',
      barcode: '770KIT1234',
      isInventoriable: true,
      productType: 'kit',
      kitComponents: [{ productId: 'prod-2', quantity: 1 }],
      unit: 'kit',
    },
  ])

  const inventoryMovements = ref<InventoryMovement[]>([
    {
      id: 'mov-seed-1',
      tenantId: 'tenant-a',
      productId: 'prod-1',
      productName: 'Diagnostico contable mensual',
      type: 'salida',
      quantity: 1,
      reason: 'venta',
      userId: 'user-accountant',
      batch: '',
      expirationDate: '',
      note: 'Factura CL-0001',
      at: '2026-04-22T08:31:00.000Z',
    },
    {
      id: 'mov-seed-2',
      tenantId: 'tenant-a',
      productId: 'prod-2',
      productName: 'Kit de inventario inicial',
      type: 'salida',
      quantity: 1,
      reason: 'venta',
      userId: 'user-accountant',
      batch: '',
      expirationDate: '',
      note: 'Factura CL-0001',
      at: '2026-04-22T08:31:00.000Z',
    },
  ])

  const inventoryTransfers = ref<InventoryTransfer[]>([])

  // Getters
  const activeTenantId = computed(() => root.activeTenantId)
  
  const tenantProducts = computed(() => 
    products.value.filter(p => p.tenantId === activeTenantId.value)
  )

  const tenantInventoryMovements = computed(() => 
    inventoryMovements.value.filter(m => m.tenantId === activeTenantId.value)
  )

  const activeTenantTransfers = computed(() => 
    inventoryTransfers.value.filter(t => t.tenantId === activeTenantId.value)
  )

  const tenantLocations = computed(() => {
    const t = root.tenants.find(tenant => tenant.id === activeTenantId.value)
    return t?.locations || []
  })

  const deadInventory = computed(() => {
    const now = new Date()
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    return tenantProducts.value.filter(p => {
      if (!p.isInventoriable || p.productType === 'kit') return false
      const lastMovement = tenantInventoryMovements.value.find(m => m.productId === p.id && m.type === 'salida')
      if (!lastMovement) return true
      const lastDate = new Date(lastMovement.at)
      return lastDate < ninetyDaysAgo
    })
  })

  const reorderSuggestions = computed(() => {
    const suggestions = tenantProducts.value
      .filter(p => p.isInventoriable && p.productType !== 'kit' && p.stock <= p.minStock && p.maxStock > 0)
      .map(p => ({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        minStock: p.minStock,
        maxStock: p.maxStock,
        quantityToOrder: p.maxStock - p.stock,
        preferredSupplier: p.preferredSupplier || 'Sin Proveedor'
      }))

    return suggestions.reduce((acc: any, curr) => {
      const sup = curr.preferredSupplier
      if (!acc[sup]) acc[sup] = []
      acc[sup].push(curr)
      return acc
    }, {})
  })

  const abcAnalysis = computed(() => {
    const sales = tenantInventoryMovements.value.filter(m => m.type === 'salida' && m.reason === 'venta' && m.referenceId)
    const revenueByProduct: Record<string, number> = {}
    
    sales.forEach(m => {
      if (!revenueByProduct[m.productId]) revenueByProduct[m.productId] = 0
      const invoice = root.invoices.find(i => i.id === m.referenceId)
      if (invoice) {
        const item = invoice.items.find((i: any) => i.productId === m.productId)
        if (item) revenueByProduct[m.productId] += item.price * m.quantity
      }
    })

    const totalRevenue = Object.values(revenueByProduct).reduce((a, b) => a + b, 0)
    if (totalRevenue === 0) return {}

    const sorted = Object.entries(revenueByProduct).sort((a, b) => b[1] - a[1])
    
    let accum = 0
    const abc: Record<string, string> = {}
    sorted.forEach(([prodId, rev]) => {
      accum += rev
      const pct = accum / totalRevenue
      if (pct <= 0.8) abc[prodId] = 'A'
      else if (pct <= 0.95) abc[prodId] = 'B'
      else abc[prodId] = 'C'
    })
    return abc
  })

  const canManageInventory = computed(() => root.can('manage_inventory'))

  // Actions
  function createProduct(payload: Partial<Product>) {
    if (!canManageInventory.value) {
      return { ok: false, message: 'Tu rol actual no puede crear productos.' }
    }

    const defaultLocId = tenantLocations.value[0]?.id || 'default'

    const product: Product = {
      id: uid('prod'),
      tenantId: activeTenantId.value || '',
      sku: (payload.sku || '').trim(),
      name: (payload.name || '').trim(),
      price: Number(payload.price || 0),
      cost: Number(payload.cost || 0),
      taxRate: Number(payload.taxRate || 0),
      stock: Number(payload.stock || 0),
      stockByLocation: { [defaultLocId]: Number(payload.stock || 0) },
      minStock: Number(payload.minStock || 0),
      maxStock: Number(payload.maxStock || 0),
      location: (payload.location || '').trim(),
      category: (payload.category || 'General').trim(),
      barcode: (payload.barcode || '').trim(),
      isInventoriable: payload.isInventoriable !== false,
      productType: (payload.productType as any) || 'standard',
      kitComponents: payload.kitComponents || [],
      unit: payload.productType === 'kit' ? 'kit' : 'unidad',
      preferredSupplier: (payload.preferredSupplier || '').trim(),
    }

    if (!product.sku || !product.name) {
      return { ok: false, message: 'Completa SKU y nombre del producto.' }
    }

    products.value.unshift(product)
    appendAuditEvent(root.$state, {
      entity: 'inventario',
      action: 'Crear producto',
      description: `Se registro el producto ${product.name}.`,
      actor: root.currentUser?.name || 'Sistema local',
    })
    root.saveState()

    return { ok: true, message: 'Producto guardado.', detail: `${product.name} ya esta disponible.` }
  }

  function transferStock({ productId, fromLocId, toLocId, quantity }: any) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    const product = products.value.find(p => p.id === productId)
    if (!product?.isInventoriable) return { ok: false, message: 'Producto invalido.' }

    const locStock = product.stockByLocation[fromLocId] || 0
    if (locStock < quantity) return { ok: false, message: 'Stock insuficiente en bodega origen.' }

    product.stockByLocation[fromLocId] -= quantity
    product.stock -= quantity

    const transferId = uid('transf')
    inventoryTransfers.value.push({
      id: transferId,
      tenantId: activeTenantId.value || '',
      productId,
      productName: product.name,
      fromLocId,
      toLocId,
      quantity,
      status: 'en_transito',
      date: new Date().toISOString(),
      userId: root.currentUser?.id || 'sistema'
    } as any)

    inventoryMovements.value.unshift({
      id: uid('mov'), tenantId: activeTenantId.value || '', productId, productName: product.name,
      type: 'salida', quantity, reason: 'traslado_salida', userId: root.currentUser?.id || 'sistema',
      batch: '', expirationDate: '', note: `Despacho a ${toLocId}`, at: new Date().toISOString()
    })

    appendAuditEvent(root.$state, { entity: 'inventario', action: 'Traslado', description: `Traslado de ${quantity} ${product.name}`, actor: root.currentUser?.name || 'Sistema' })
    root.saveState()
    return { ok: true, message: 'Traslado despachado.', transferId }
  }

  function receiveTransfer(transferId: string) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    const transfer = inventoryTransfers.value.find(t => t.id === transferId)
    if (transfer?.status !== 'en_transito') return { ok: false, message: 'Traslado no valido.' }

    const product = products.value.find(p => p.id === transfer.productId)
    if (!product) return { ok: false, message: 'Producto no encontrado.' }

    product.stockByLocation[transfer.toLocId] = (product.stockByLocation[transfer.toLocId] || 0) + transfer.quantity
    product.stock += transfer.quantity
    transfer.status = 'completado'
    transfer.receivedAt = new Date().toISOString()

    inventoryMovements.value.unshift({
      id: uid('mov'), tenantId: activeTenantId.value || '', productId: product.id, productName: product.name,
      type: 'entrada', quantity: transfer.quantity, reason: 'traslado_entrada', userId: root.currentUser?.id || 'sistema',
      batch: '', expirationDate: '', note: `Recepcion desde ${transfer.fromLocId}`, at: transfer.receivedAt
    })

    appendAuditEvent(root.$state, { entity: 'inventario', action: 'Recepcion', description: `Recepcion de ${transfer.quantity} ${product.name}`, actor: root.currentUser?.name || 'Sistema' })
    root.saveState()
    return { ok: true, message: 'Mercancia recibida.' }
  }

  function auditInventory({ adjustments }: any) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }

    let totalAdjustments = 0
    adjustments.forEach((adj: any) => {
      const product = products.value.find(p => p.id === adj.productId)
      if (!product?.isInventoriable) return

      const currentLocStock = product.stockByLocation[adj.locationId] || 0
      const diff = adj.physicalCount - currentLocStock

      if (diff !== 0) {
        product.stockByLocation[adj.locationId] = adj.physicalCount
        product.stock += diff

        inventoryMovements.value.unshift({
          id: uid('mov'), tenantId: activeTenantId.value || '', productId: product.id, productName: product.name,
          type: diff > 0 ? 'entrada' : 'salida', quantity: Math.abs(diff), reason: 'ajuste_auditoria',
          userId: root.currentUser?.id || 'sistema', batch: '', expirationDate: '', note: adj.reason || 'Ajuste fisico',
          attachmentUrl: adj.photoBase64 || '', at: new Date().toISOString()
        })
        totalAdjustments++
      }
    })

    if (totalAdjustments > 0) {
      appendAuditEvent(root.$state, { entity: 'inventario', action: 'Auditoria', description: `${totalAdjustments} ajustes realizados.`, actor: root.currentUser?.name || 'Sistema' })
      root.saveState()
    }
    return { ok: true, message: `Auditoria completada. ${totalAdjustments} ajustes.` }
  }

  function receiveInventory({ productId, quantity, unitCost, locId }: any) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    const product = products.value.find(p => p.id === productId)
    if (!product?.isInventoriable) return { ok: false, message: 'Producto no valido.' }
    
    const oldTotalValue = product.stock * product.cost
    const newTotalValue = quantity * unitCost
    const newStock = product.stock + quantity
    if (newStock > 0) product.cost = (oldTotalValue + newTotalValue) / newStock
    
    product.stock = newStock
    product.stockByLocation[locId] = (product.stockByLocation[locId] || 0) + quantity

    inventoryMovements.value.unshift({
      id: uid('mov'), tenantId: activeTenantId.value || '', productId, productName: product.name,
      type: 'entrada', quantity, reason: 'compra', userId: root.currentUser?.id || 'sistema',
      batch: '', expirationDate: '', note: `Ingreso a ${locId}`, at: new Date().toISOString()
    })

    appendAuditEvent(root.$state, { entity: 'inventario', action: 'Ingreso', description: `Ingreso de ${quantity} ${product.name}`, actor: root.currentUser?.name || 'Sistema' })
    root.saveState()
    return { ok: true, message: 'Inventario recibido.' }
  }

  function importProductsCSV(csvContent: string) {
    if (!canManageInventory.value) return { ok: false, message: 'Permisos insuficientes.' }
    try {
      const lines = csvContent.split('\n').filter(line => line.trim().length > 0)
      if (lines.length < 2) return { ok: false, message: 'CSV vacio.' }
      const dataLines = lines.slice(1)
      let importedCount = 0
      for (const line of dataLines) {
        const cols = line.split(',').map(c => c.trim())
        if (cols.length < 3) continue
        const product: Product = {
          id: uid('prod'), tenantId: activeTenantId.value || '', sku: cols[0], name: cols[1],
          price: Number(cols[2] || 0), cost: Number(cols[3] || 0), taxRate: Number(cols[4] || 19),
          stock: Number(cols[5] || 0), minStock: Number(cols[6] || 0), maxStock: Number(cols[7] || 0),
          location: cols[8] || '', category: cols[9] || 'General', barcode: cols[10] || '',
          isInventoriable: cols[11] === 'true', productType: 'standard', unit: 'unidad', stockByLocation: {}
        }
        products.value.unshift(product)
        importedCount++
      }
      if (importedCount > 0) {
        appendAuditEvent(root.$state, { entity: 'inventario', action: 'Importacion', description: `${importedCount} productos importados.`, actor: root.currentUser?.name || 'Sistema' })
        root.saveState()
        return { ok: true, message: `${importedCount} productos importados.` }
      }
      return { ok: false, message: 'No hay datos validos.' }
    } catch (e) { return { ok: false, message: 'Error en CSV' } }
  }

  async function fetchProducts() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getProducts()
      products.value = data as Product[]
    } catch (e) { console.error('Error fetching products', e) }
  }

  // Sync to root state for backward compatibility and global persistence
  watch([products, inventoryMovements, inventoryTransfers], () => {
    (root.$state as any).products = products.value;
    (root.$state as any).inventoryMovements = inventoryMovements.value;
    (root.$state as any).inventoryTransfers = inventoryTransfers.value;
  }, { deep: true, immediate: true })

  // Auto-fetch when tenant changes
  watch(activeTenantId, (newId) => {
    if (newId) fetchProducts()
  }, { immediate: true })

  return {
    products,
    inventoryMovements,
    inventoryTransfers,
    tenantProducts,
    tenantInventoryMovements,
    activeTenantTransfers,
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
  }
})
