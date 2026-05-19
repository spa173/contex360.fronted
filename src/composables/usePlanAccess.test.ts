import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStateStore } from '../stores/stateStore'
import { usePlanAccess } from './usePlanAccess'

describe('usePlanAccess composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debe devolver plan starter y limites por defecto si no hay subscription', () => {
    const store = useStateStore()
    store.subscription = null

    const { plan, canAccessModule, canCreateInvoice, canAddUser, isFeatureLocked } = usePlanAccess()

    expect(plan.value).toBe('starter')
    expect(canAccessModule('billing')).toBe(true)
    expect(canAccessModule('inventory')).toBe(false)
    expect(isFeatureLocked('inventory')).toBe(true)
    
    // Con Starter, limit es 50 facturas. invoicesThisMonth es 0 por defecto.
    expect(canCreateInvoice()).toBe(true)
  })

  it('debe aplicar limites correctos segun la suscripcion activa', () => {
    const store = useStateStore()
    store.subscription = {
      planType: 'starter',
      active: true,
      trialEndsAt: null,
      invoicesThisMonth: 50,
      limits: {
        name: 'Starter',
        priceMonthly: 89000,
        priceAnnual: 801000,
        maxUsers: 1,
        maxInvoicesPerMonth: 50,
        modules: ['dashboard', 'billing', 'quotes', 'third-parties']
      }
    }

    const { plan, canCreateInvoice } = usePlanAccess()
    expect(plan.value).toBe('starter')
    expect(canCreateInvoice()).toBe(false) // 50 >= 50
  })

  it('debe permitir facturas ilimitadas si no hay limite (null)', () => {
    const store = useStateStore()
    store.subscription = {
      planType: 'pyme',
      active: true,
      trialEndsAt: null,
      invoicesThisMonth: 120,
      limits: {
        name: 'Pyme',
        priceMonthly: 189000,
        priceAnnual: 1701000,
        maxUsers: 5,
        maxInvoicesPerMonth: null,
        modules: ['*']
      }
    }

    const { canCreateInvoice } = usePlanAccess()
    expect(canCreateInvoice()).toBe(true)
  })
})
