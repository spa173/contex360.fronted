// @ts-nocheck
import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export const useInventoryStore = defineStore('inventory', () => {
  const state = useStateStore()

  return {
    tenantLocations: computed(() => {
      const t = state.tenants.find(tenant => tenant.id === state.activeTenantId)
      return t?.locations || []
    }),
    tenantProducts: computed(() => state.tenantProducts),
    deadInventory: computed(() => {
      const now = new Date()
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      return state.tenantProducts.filter(p => {
        if (!p.isInventoriable || p.productType === 'kit') return false
        const lastMovement = state.tenantInventoryMovements.find(m => m.productId === p.id && m.type === 'salida')
        if (!lastMovement) return true // No sales ever
        const lastDate = new Date(lastMovement.at)
        return lastDate < ninetyDaysAgo
      })
    }),
    reorderSuggestions: computed(() => {
      const suggestions = state.tenantProducts
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

      // Group by supplier
      return suggestions.reduce((acc, curr) => {
        const sup = curr.preferredSupplier
        if (!acc[sup]) acc[sup] = []
        acc[sup].push(curr)
        return acc
      }, {})
    }),
    abcAnalysis: computed(() => {
      const sales = state.tenantInventoryMovements.filter(m => m.type === 'salida' && m.reason === 'venta' && m.referenceId)
      const revenueByProduct = {}
      
      sales.forEach(m => {
        if (!revenueByProduct[m.productId]) revenueByProduct[m.productId] = 0
        const invoice = state.invoices.find(i => i.id === m.referenceId)
        if (invoice) {
          const item = invoice.items.find(i => i.productId === m.productId)
          if (item) revenueByProduct[m.productId] += item.price * m.quantity
        }
      })

      const totalRevenue = Object.values(revenueByProduct).reduce((a, b) => a + b, 0)
      if (totalRevenue === 0) return {}

      const sorted = Object.entries(revenueByProduct).sort((a, b) => b[1] - a[1])
      
      let accum = 0
      const abc = {}
      sorted.forEach(([prodId, rev]) => {
        accum += rev
        const pct = accum / totalRevenue
        if (pct <= 0.8) abc[prodId] = 'A'
        else if (pct <= 0.95) abc[prodId] = 'B'
        else abc[prodId] = 'C'
      })
      return abc
    }),
    tenantInventoryMovements: computed(() => state.tenantInventoryMovements),
    inventoryTransfers: computed(() => state.inventoryTransfers.filter(t => t.tenantId === state.activeTenantId)),
    activeTenantId: computed(() => state.activeTenantId),
    createProduct: state.createProduct,
    importProductsCSV: state.importProductsCSV,
    receiveInventory: state.receiveInventory,
    transferStock: state.transferStock,
    receiveTransfer: state.receiveTransfer,
    auditInventory: state.auditInventory,
    canManageInventory: computed(() => state.can('manage_inventory')),
  }
})
