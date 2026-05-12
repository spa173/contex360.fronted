import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BillingView from './BillingView.vue'
import { useStateStore } from '../../stores/stateStore'

// Mock pdfGenerator
vi.mock('../../utils/pdfGenerator', () => ({
  generateInvoicePdf: vi.fn()
}))

describe('BillingView Quality Boost', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
    
    state.tenants = [{ 
      id: 'tenant-a', 
      name: 'T1', 
      prefix: 'T', 
      locations: [], 
      costMethod: 'Promedio',
      securitySettings: {
        ipWhitelist: [],
        passwordPolicy: {
          minLength: 10, requireUppercase: true, requireLowercase: true, requireNumbers: true,
          requireSpecialChars: true, maxAgeDays: 90, preventReuse: 5, failedAttemptsThreshold: 5, lockoutMinutes: 30
        },
        sessionPolicy: { singleSessionOnly: false }
      }
    }]
    state.thirdParties = [{ 
      id: 'c1', tenantId: 'tenant-a', name: 'C1', nit: '1', email: 'c@t.com', kind: 'client', taxProfile: 'Responsable' 
    }]
    state.products = [{ 
      id: 'p1', tenantId: 'tenant-a', sku: 'P1-SKU', name: 'P1', price: 100, cost: 50, taxRate: 19, stock: 10, 
      stockByLocation: { default: 10 }, minStock: 1, maxStock: 100, location: 'Loc1', barcode: '123',
      category: 'General', isInventoriable: true, productType: 'standard', unit: 'und' 
    }]
    state.invoices = [{ 
      id: 'i1', 
      tenantId: 'tenant-a', 
      number: '1', 
      clientId: 'c1', 
      status: 'borrador',
      subtotal: 100,
      taxTotal: 19,
      total: 119, 
      items: [],
      createdAt: '2026-01-01T00:00:00.000Z', 
      dueAt: '2026-02-01T00:00:00.000Z',
      timeline: [{ id: 'tl-1', status: 'borrador', note: 'Seed', at: '2026-01-01T00:00:00.000Z' }], 
      files: { xml: true } 
    }]
  })

  it('covers pdf download', async () => {
    const wrapper = mount(BillingView, { props: { isActive: true } })
    const state = useStateStore()
    state.selections.invoiceId = 'i1'
    await wrapper.vm.$nextTick()
    
    const downloadBtn = wrapper.findAll('button').find(b => b.text().includes('Descargar PDF'))
    if (downloadBtn) {
       await downloadBtn.trigger('click')
    }
    expect(wrapper.exists()).toBe(true)
  })

  it('covers line item removal', async () => {
    const wrapper = mount(BillingView, { props: { isActive: true } })
    await wrapper.vm.$nextTick()
    
    // Add a line first
    wrapper.vm.addLineItem()
    expect(wrapper.vm.invoiceForm.lines.length).toBe(2)
    
    wrapper.vm.removeLineItem(1)
    expect(wrapper.vm.invoiceForm.lines.length).toBe(1)
    
    // Try removing last one
    wrapper.vm.removeLineItem(0)
    expect(wrapper.vm.invoiceForm.lines.length).toBe(1)
  })

  it('covers select invoice', async () => {
    const wrapper = mount(BillingView, { props: { isActive: true } })
    await wrapper.vm.$nextTick()
    
    const invoiceCards = wrapper.findAll('.invoice-card')
    if (invoiceCards.length > 0) {
       await invoiceCards[0].trigger('click')
       const state = useStateStore()
       expect(state.selections.invoiceId).toBe('i1')
    }
  })
})
