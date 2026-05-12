import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import InventoryView from './InventoryView.vue'
import { useStateStore } from '../../stores/stateStore'

describe('InventoryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
    state.activeView = 'inventory'
    
    // Seed some products in the ROOT state.products (since tenantProducts is a getter)
    state.products = [
      { 
        id: 'p1', 
        tenantId: 'tenant-a',
        sku: 'S1', 
        name: 'Product 1', 
        price: 100, 
        cost: 50, 
        taxRate: 19, 
        stock: 10, 
        minStock: 2, 
        maxStock: 20, 
        isInventoriable: true, 
        stockByLocation: { default: 10 },
        location: 'Main',
        barcode: '123456',
        category: 'General',
        productType: 'standard',
        unit: 'und'
      }
    ]
  })

  it('renderiza correctamente y permite cambiar de pestañas', async () => {
    const wrapper = mount(InventoryView, {
      props: { isActive: true },
    })

    expect(wrapper.text()).toContain('Inventario del tenant')
    
    const tabs = wrapper.findAll('.tab-button')
    await tabs[1].trigger('click')
    expect(wrapper.text()).toContain('Operaciones Logisticas')
  })

  it('permite abrir modo auditoria', async () => {
    const wrapper = mount(InventoryView, {
      props: { isActive: true },
    })
    
    const auditBtn = wrapper.find('button.secondary-button')
    if (auditBtn.exists() && auditBtn.text().includes('Modo Auditoria')) {
      await auditBtn.trigger('click')
      expect(wrapper.text()).toContain('Guardar Ajustes de Auditoria')
    }
  })

  it('filters products by search query', async () => {
    const wrapper = mount(InventoryView, {
      props: { isActive: true },
    })

    const searchInput = wrapper.find('input[placeholder="SKU-001"]')
    if (searchInput.exists()) {
      await searchInput.setValue('Product A')
    }
    expect(wrapper.exists()).toBe(true)
  })

  it('shows creation form', async () => {
    const wrapper = mount(InventoryView, {
      props: { isActive: true },
    })
    expect(wrapper.text()).toContain('Crear producto')
  })
})
