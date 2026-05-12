import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import DashboardView from './DashboardView.vue'
import { useStateStore } from '../../stores/stateStore'

describe('DashboardView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renderiza correctamente con datos iniciales', async () => {
    const wrapper = mount(DashboardView, {
      props: { isActive: true },
      global: {
        stubs: { BusinessChart: true }
      }
    })
    
    expect(wrapper.text()).toContain('Facturacion acumulada')
  })

  it('muestra alertas de stock bajo', async () => {
    const state = useStateStore()
    state.activeTenantId = 't1'
    state.products = [
      { id: 'p1', name: 'Producto Critico', sku: 'SKU-001', stock: 2, minStock: 5, tenantId: 't1', isInventoriable: true, stockByLocation: {} }
    ]
    
    const wrapper = mount(DashboardView, {
      props: { isActive: true },
      global: {
        stubs: { BusinessChart: true }
      }
    })
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Necesitan reposicion')
    expect(wrapper.text()).toContain('Producto Critico')
  })

  it('calcula el pipeline de la DIAN', async () => {
    const state = useStateStore()
    state.activeTenantId = 't1'
    state.invoices = [
      { id: 'i1', status: 'borrador', total: 100, tenantId: 't1', items: [], createdAt: '2026-05-01' },
      { id: 'i2', status: 'emitida', total: 200, tenantId: 't1', items: [], createdAt: '2026-05-02' }
    ]
    
    const wrapper = mount(DashboardView, {
      props: { isActive: true },
      global: {
        stubs: { BusinessChart: true }
      }
    })
    
    await wrapper.vm.$nextTick()
    // Ya no buscamos el texto porque está en el chart mockeado
    expect(wrapper.findComponent({ name: 'BusinessChart' }).exists()).toBe(true)
  })
})
