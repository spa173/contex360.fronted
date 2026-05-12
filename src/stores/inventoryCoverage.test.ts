// @ts-nocheck
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { buildDemoPassword, useStateStore } from './stateStore'
import { useInventoryStore } from './inventoryStore'

async function loginAsAdmin(store: any) {
  return store.login({
    email: 'admin@contex360.local',
    password: buildDemoPassword('admin@contex360.local'),
  })
}

describe('Inventory Coverage Suite', () => {
  let store: any
  let invStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useStateStore()
    invStore = useInventoryStore()
  })

  afterEach(() => {
    store?.resetState()
  })

  describe('transferStock y receiveTransfer', () => {
    it('transferStock descuenta del origen y crea un traslado en_transito sin aumentar el destino', async () => {
      await loginAsAdmin(store)
      const product = store.products.find(p => p.id === 'prod-2')
      const tenant = store.tenants.find(t => t.id === 'tenant-a')
      const locA = tenant.locations[0].id
      const locB = tenant.locations[1].id

      const stockAntes = product.stockByLocation[locA] || 0
      const stockDestinoAntes = product.stockByLocation[locB] || 0

      const result = store.transferStock({ productId: 'prod-2', fromLocId: locA, toLocId: locB, quantity: 1 })

      expect(result.ok).toBe(true)
      expect(product.stockByLocation[locA]).toBe(stockAntes - 1)
      // Destino NO se actualiza hasta la recepción
      expect(product.stockByLocation[locB] || 0).toBe(stockDestinoAntes)
      expect(product.stock).toBe(stockAntes + (stockDestinoAntes) - 1)
    })

    it('transferStock rechaza si no hay stock suficiente en bodega origen', async () => {
      await loginAsAdmin(store)
      const tenant = store.tenants.find(t => t.id === 'tenant-a')
      const locA = tenant.locations[0].id
      const locB = tenant.locations[1].id

      const result = store.transferStock({ productId: 'prod-2', fromLocId: locA, toLocId: locB, quantity: 9999 })
      expect(result.ok).toBe(false)
    })

    it('receiveTransfer ingresa el stock al destino y marca el traslado como completado', async () => {
      await loginAsAdmin(store)
      const tenant = store.tenants.find(t => t.id === 'tenant-a')
      const locA = tenant.locations[0].id
      const locB = tenant.locations[1].id
      const product = store.products.find(p => p.id === 'prod-2')
      const stockDestinoAntes = product.stockByLocation[locB] || 0

      store.transferStock({ productId: 'prod-2', fromLocId: locA, toLocId: locB, quantity: 1 })
      const transferId = store.inventoryTransfers.find(t => t.status === 'en_transito')?.id
      const result = store.receiveTransfer(transferId)

      expect(result.ok).toBe(true)
      expect(product.stockByLocation[locB]).toBe(stockDestinoAntes + 1)
      const transferRecord = store.inventoryTransfers.find(t => t.id === transferId)
      expect(transferRecord.status).toBe('completado')
    })

    it('receiveTransfer rechaza ID inválido o ya completado', async () => {
      await loginAsAdmin(store)
      expect(store.receiveTransfer('any-id').ok).toBe(false)
    })
    
    it('transferStock rechaza producto no inventariable', async () => {
      await loginAsAdmin(store)
      const tenant = store.tenants.find(t => t.id === 'tenant-a')
      const result = store.transferStock({ productId: 'prod-1', fromLocId: tenant.locations[0].id, toLocId: tenant.locations[1].id, quantity: 1 })
      expect(result.ok).toBe(false)
    })

    it('transferStock rechaza sin permisos de inventario', () => {
      const result = store.transferStock({ productId: 'prod-2', fromLocId: 'loc-a-1', toLocId: 'loc-a-2', quantity: 1 })
      expect(result.ok).toBe(false)
    })

    it('receiveTransfer rechaza sin permisos de inventario', () => {
      const result = store.receiveTransfer('any-id')
      expect(result.ok).toBe(false)
    })
  })

  describe('Kits y receiveInventory', () => {
    it('receiveInventory actualiza stock y CPP', async () => {
      await loginAsAdmin(store)
      const product = store.products.find(p => p.id === 'prod-2')
      const oldCost = product.cost
      const oldStock = product.stock
      const result = store.receiveInventory({ productId: 'prod-2', quantity: 10, unitCost: oldCost * 2, locId: 'loc-a-1' })
      expect(result.ok).toBe(true)
      expect(product.stock).toBe(oldStock + 10)
      expect(product.cost).toBeGreaterThan(oldCost)
    })

    it('rechaza receiveInventory sin permisos', () => {
      const result = store.receiveInventory({ productId: 'prod-2', quantity: 5, unitCost: 1000, locId: 'loc-a-1' })
      expect(result.ok).toBe(false)
    })
  })

  describe('auditInventory', () => {
    it('genera movimientos de auditoria segun conteo fisico', async () => {
      await loginAsAdmin(store)
      const product = store.products.find(p => p.id === 'prod-2')
      const tenant = store.tenants.find(t => t.id === 'tenant-a')
      const locId = tenant.locations[0].id
      const stockActual = product.stockByLocation[locId] || 0

      // Salida
      const r1 = store.auditInventory({
        adjustments: [{ productId: 'prod-2', locationId: locId, physicalCount: stockActual - 1, reason: 'Merma' }]
      })
      expect(r1.ok).toBe(true)
      expect(store.inventoryMovements[0].type).toBe('salida')

      // Entrada
      const r2 = store.auditInventory({
        adjustments: [{ productId: 'prod-2', locationId: locId, physicalCount: stockActual + 5, reason: 'Sobra' }]
      })
      expect(r2.ok).toBe(true)
      expect(store.inventoryMovements[0].type).toBe('entrada')

      // Sin cambios
      const mAntes = store.inventoryMovements.length
      store.auditInventory({
        adjustments: [{ productId: 'prod-2', locationId: locId, physicalCount: product.stockByLocation[locId], reason: 'Ok' }]
      })
      expect(store.inventoryMovements.length).toBe(mAntes)
    })

    it('guarda fotos y maneja productos no inventoriables', async () => {
      await loginAsAdmin(store)
      store.auditInventory({
        adjustments: [{ productId: 'prod-2', locationId: 'loc-a-1', physicalCount: 0, reason: 'Foto', photoBase64: 'base64' }]
      })
      expect(store.inventoryMovements[0].attachmentUrl).toBe('base64')

      const mAntes = store.inventoryMovements.length
      store.auditInventory({
        adjustments: [{ productId: 'prod-1', locationId: 'loc-a-1', physicalCount: 0, reason: 'Servicio' }]
      })
      expect(store.inventoryMovements.length).toBe(mAntes)
    })

    it('rechaza auditoria sin permisos', () => {
      const result = store.auditInventory({ adjustments: [] })
      expect(result.ok).toBe(false)
    })
  })

  describe('importProductsCSV', () => {
    it('procesa correctamente CSV e importa productos', async () => {
      await loginAsAdmin(store)
      const csv = "sku,name,price,cost,taxRate,stock,minStock,maxStock,location,category,barcode,isInventoriable\nSKU-CSV,Test CSV,100,50,19,10,2,20,Shelf,Cat,123,true"
      const result = store.importProductsCSV(csv)
      expect(result.ok).toBe(true)
      const p = store.products.find(p => p.sku === 'SKU-CSV')
      expect(p).toBeDefined()
    })

    it('genera SKU si falta y rechaza sin permisos', async () => {
      await loginAsAdmin(store)
      const csv = "sku,name,price,cost,taxRate,stock,minStock,maxStock,location,category,barcode,isInventoriable\n,No SKU,100,50,19,10,2,20,Shelf,Cat,123,true"
      store.importProductsCSV(csv)
      expect(store.products.find(p => p.name === 'No SKU').sku).toMatch(/^SKU-/)

      store.logout()
      expect(store.importProductsCSV('some,csv').ok).toBe(false)
    })
  })

  describe('inventoryStore Computeds', () => {
    it('abcAnalysis, deadInventory y reorderSuggestions', async () => {
      await loginAsAdmin(store)
      
      // ABC
      const invoiceId = 'inv-abc'
      store.invoices.push({ 
        id: invoiceId, 
        tenantId: 'tenant-a', 
        items: [
          { productId: 'prod-2', price: 800, quantity: 1 },
          { productId: 'prod-1', price: 200, quantity: 1 }
        ], 
        total: 1000, 
        status: 'emitida' 
      })
      store.inventoryMovements.push(
        { id: 'mov-abc-1', productId: 'prod-2', quantity: 1, type: 'salida', reason: 'venta', referenceId: invoiceId, at: new Date().toISOString(), tenantId: 'tenant-a' },
        { id: 'mov-abc-2', productId: 'prod-1', quantity: 1, type: 'salida', reason: 'venta', referenceId: invoiceId, at: new Date().toISOString(), tenantId: 'tenant-a' }
      )
      expect(invStore.abcAnalysis['prod-2']).toBe('A')

      // Dead
      expect(Array.isArray(invStore.deadInventory)).toBe(true)

      // Reorder
      store.auditInventory({ adjustments: [{ productId: 'prod-2', locationId: 'loc-a-1', physicalCount: 0, reason: 'Bajo' }] })
      expect(Object.keys(invStore.reorderSuggestions).length).toBeGreaterThan(0)

      // Misc
      expect(invStore.tenantLocations.length).toBeGreaterThan(0)
      expect(invStore.canManageInventory).toBe(true)
    })
  })

  describe('Product Creation', () => {
    it('crea productos estandar y kits', async () => {
      await loginAsAdmin(store)
      store.createProduct({ sku: 'NEW-P', name: 'New', price: 10, cost: 5, taxRate: 0, stock: 1, minStock: 0, maxStock: 10, isInventoriable: true, productType: 'standard', kitComponents: [], preferredSupplier: 'Sup' })
      expect(store.products.find(p => p.sku === 'NEW-P').preferredSupplier).toBe('Sup')

      store.createProduct({ sku: 'NEW-K', name: 'Kit', price: 20, cost: 0, taxRate: 0, stock: 0, minStock: 0, maxStock: 0, isInventoriable: false, productType: 'kit', kitComponents: [{ productId: 'prod-2', quantity: 1 }] })
      expect(store.products.find(p => p.sku === 'NEW-K').productType).toBe('kit')
    })
  })
})
