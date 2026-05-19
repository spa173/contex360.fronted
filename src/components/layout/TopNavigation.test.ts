import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TopNavigation from './TopNavigation.vue'
import { useStateStore } from '../../stores/stateStore'

vi.mock('../../services/businessApi', () => ({
  businessApi: {
    getAlerts: vi.fn().mockResolvedValue({ lowStockAlerts: 0, pendingInvoices: 0, ocrRunsCount: 0 }),
    getAiInsights: vi.fn().mockResolvedValue({ insight: '' })
  }
}))

describe('TopNavigation.vue - Trial Warning Banner', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debe mostrar el banner cuando el trial expira en menos de 5 días', async () => {
    const store = useStateStore()
    
    // Set a date 3 days in the future
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    store.subscription = {
      planType: 'starter',
      active: true,
      trialEndsAt: threeDaysFromNow.toISOString(),
      limits: { name: 'Starter', priceMonthly: 89000, priceAnnual: 801000, maxUsers: 1, maxInvoicesPerMonth: 50, modules: ['dashboard', 'billing'] },
      invoicesThisMonth: 0
    }

    const wrapper = mount(TopNavigation, {
      props: {
        activeTenant: { name: 'Empresa Test' },
        accessibleTenants: [],
        user: { name: 'Camilo' },
        activeView: 'dashboard'
      }
    })

    // Expect the banner text to be present
    expect(wrapper.text()).toContain('Tu trial vence en 3 días')

    // Click "Ver planes" button
    const btn = wrapper.find('button.underline')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    // It should emit navigate event
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['plans'])
  })

  it('no debe mostrar el banner si quedan 5 días o más', async () => {
    const store = useStateStore()

    // Set a date 6 days in the future
    const sixDaysFromNow = new Date()
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6)

    store.subscription = {
      planType: 'starter',
      active: true,
      trialEndsAt: sixDaysFromNow.toISOString(),
      limits: { name: 'Starter', priceMonthly: 89000, priceAnnual: 801000, maxUsers: 1, maxInvoicesPerMonth: 50, modules: ['dashboard', 'billing'] },
      invoicesThisMonth: 0
    }

    const wrapper = mount(TopNavigation, {
      props: {
        activeTenant: { name: 'Empresa Test' },
        accessibleTenants: [],
        user: { name: 'Camilo' },
        activeView: 'dashboard'
      }
    })

    expect(wrapper.text()).not.toContain('Tu trial vence en')
  })

  it('no debe mostrar el banner si no hay trialEndsAt', async () => {
    const store = useStateStore()
    store.subscription = {
      planType: 'starter',
      active: true,
      trialEndsAt: null,
      limits: { name: 'Starter', priceMonthly: 89000, priceAnnual: 801000, maxUsers: 1, maxInvoicesPerMonth: 50, modules: ['dashboard', 'billing'] },
      invoicesThisMonth: 0
    }

    const wrapper = mount(TopNavigation, {
      props: {
        activeTenant: { name: 'Empresa Test' },
        accessibleTenants: [],
        user: { name: 'Camilo' },
        activeView: 'dashboard'
      }
    })

    expect(wrapper.text()).not.toContain('Tu trial vence en')
  })
})
