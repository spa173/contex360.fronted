import { describe, expect, it, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'
import { useStateStore } from './stateStore'
import { loginWithBackend } from '../services/authApi'
import { businessApi } from '../services/businessApi'

vi.mock('../services/authApi', () => ({
  loginWithBackend: vi.fn(),
  revokeBackendSession: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

vi.mock('../services/businessApi', () => ({
  businessApi: {
    me: vi.fn(),
    getThirdParties: vi.fn(),
  },
}))

describe('authStore - subscription integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('debe guardar la subscription al hacer login con backend', async () => {
    const mockResponse = {
      ok: true,
      user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
      session: { id: 'sess-1' },
      activeTenantId: 'tenant-1',
      memberships: [],
      subscription: {
        planType: 'pyme',
        active: true,
        trialEndsAt: null,
        limits: {
          name: 'Pyme',
          priceMonthly: 189000,
          priceAnnual: 1701000,
          maxUsers: 5,
          maxInvoicesPerMonth: null,
          modules: ['dashboard', 'billing']
        }
      }
    }

    vi.mocked(loginWithBackend).mockResolvedValue(mockResponse as any)

    const authStore = useAuthStore()
    const stateStore = useStateStore()

    const result = await authStore.loginWithBackend({ email: 'test@test.com', password: 'password' })

    expect(result.ok).toBe(true)
    expect(stateStore.subscription).toEqual(mockResponse.subscription)
    expect(authStore.subscription).toEqual(mockResponse.subscription)
  })

  it('debe guardar la subscription al refrescar la sesion con backend', async () => {
    const mockMeResponse = {
      activeTenantId: 'tenant-1',
      memberships: [],
      accessibleTenants: [],
      subscription: {
        planType: 'starter',
        active: true,
        trialEndsAt: null,
        limits: {
          name: 'Starter',
          priceMonthly: 89000,
          priceAnnual: 801000,
          maxUsers: 1,
          maxInvoicesPerMonth: 50,
          modules: ['dashboard']
        }
      }
    }

    vi.mocked(businessApi.me).mockResolvedValue(mockMeResponse as any)

    const authStore = useAuthStore()
    const stateStore = useStateStore()

    const ok = await authStore.refreshSessionWithBackend()

    expect(ok).toBe(true)
    expect(stateStore.subscription).toEqual(mockMeResponse.subscription)
    expect(authStore.subscription).toEqual(mockMeResponse.subscription)
  })
})
