import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import InventoryView from './InventoryView.vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useStateStore } from '../../stores/stateStore'

describe('InventoryView Deep Logic', () => {
  let state: ReturnType<typeof useStateStore>;
  let invStore: ReturnType<typeof useInventoryStore>;

  beforeEach(() => {
    setActivePinia(createPinia())
    state = useStateStore()
    invStore = useInventoryStore()
    
    state.activeTenantId = 'tenant-a'
    // Correctly seed the root state so getters work
    state.products = [
      { 
        id: 'p1', 
        tenantId: 'tenant-a', 
        name: 'Product 1', 
        sku: 'S1', 
        category: 'C1', 
        stock: 10, 
        minStock: 5, 
        maxStock: 20, 
        price: 100, 
        cost: 50, 
        taxRate: 19,
        isInventoriable: true, 
        productType: 'standard', 
        unit: 'und', 
        stockByLocation: { 'loc-1': 10 },
        location: 'loc-1',
        barcode: '123'
      }
    ]
    state.tenants = [{ 
      id: 'tenant-a', 
      name: 'T1', 
      prefix: 'T',
      locations: [{ id: 'loc-1', name: 'Main' }],
      securitySettings: {
        ipWhitelist: [],
        passwordPolicy: {
          minLength: 10, requireUppercase: true, requireLowercase: true, requireNumbers: true,
          requireSpecialChars: true, maxAgeDays: 90, preventReuse: 5, failedAttemptsThreshold: 5, lockoutMinutes: 30
        },
        sessionPolicy: { singleSessionOnly: false }
      }
    }]
    
    // Login para obtener permisos de manage_inventory
    state.loginDemoUser('user-demo')
    
    vi.stubGlobal('open', vi.fn(() => ({
       document: {
          write: vi.fn(),
          close: vi.fn()
       },
       focus: vi.fn(),
       print: vi.fn(),
       close: vi.fn()
    })))
  })

  it('covers product creation including kit components', async () => {
    const wrapper = mount(InventoryView, { props: { isActive: true } })
    wrapper.vm.productForm.name = 'Test Kit'
    wrapper.vm.productForm.productType = 'kit'
    
    wrapper.vm.newComponent.productId = 'p1'
    wrapper.vm.newComponent.quantity = 2
    wrapper.vm.addKitComponent()
    expect(wrapper.vm.productForm.kitComponents.length).toBe(1)
    
    wrapper.vm.handleSubmit()
  })

  it('covers audit mode and photo upload', async () => {
    const wrapper = mount(InventoryView, { props: { isActive: true } })
    
    // Ensure data is there before toggle
    expect(invStore.tenantProducts.length).toBe(1)

    wrapper.vm.toggleAuditMode()
    expect(wrapper.vm.auditMode).toBe(true)
    expect(wrapper.vm.auditData['p1']).toBeDefined()

    const mockFileReader: any = {
      readAsDataURL: vi.fn(function(this: any) {
        setTimeout(() => {
          if (this.onload) this.onload({ target: { result: 'data:image/png;base64,mock' } })
        }, 0)
      }),
      onload: null
    }
    vi.stubGlobal('FileReader', vi.fn().mockImplementation(function() { return mockFileReader; }))
    
    const file = new File([''], 'test.png', { type: 'image/png' })
    const event = { target: { files: [file] } }
    
    wrapper.vm.handlePhotoUpload(event, 'p1')
    
    await new Promise(resolve => setTimeout(resolve, 50))
    
    expect(wrapper.vm.auditData['p1'].photoBase64).toBe('data:image/png;base64,mock')
    
    wrapper.vm.auditData['p1'].count = 20
    wrapper.vm.saveAudit()
  })

  it('covers transfer receipt and printing', async () => {
    const wrapper = mount(InventoryView, { props: { isActive: true } })
    state.inventoryTransfers.push({
       id: 'tr-1',
       tenantId: 'tenant-a',
       productId: 'p1',
       productName: 'P1',
       quantity: 5,
       fromLocId: 'loc-1',
       fromLoc: 'L1',
       toLocId: 'loc-2',
       toLoc: 'L2',
       status: 'en_transito',
       date: '2026-01-01'
    })
    
    wrapper.vm.activeTab = 'operaciones'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.activeTab).toBe('operaciones')
    
    wrapper.vm.confirmReceiveTransfer('tr-1')
    expect(state.inventoryTransfers[0].status).toBe('completado')
    
    wrapper.vm.lastTransfer = { id: 'tr-1', productName: 'P1', quantity: 5, fromLoc: 'L1', toLoc: 'L2', date: new Date() }
    wrapper.vm.printRemision()
    expect(vi.mocked(globalThis.open)).toHaveBeenCalled()
  })
})
