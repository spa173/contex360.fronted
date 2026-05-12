import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AdminConsoleView from './AdminConsoleView.vue'
import { useStateStore } from '../../stores/stateStore'

vi.mock('../../services/businessApi', () => {
  const complianceMock = {
    complianceChecks: [],
    businessContinuityPlan: null,
    accessReview: null,
  }

  const mockApi = new Proxy(
    {},
    {
      get: (_, key) => {
        if (key === 'getComplianceDashboard') {
          return vi.fn().mockResolvedValue(complianceMock)
        }

        if (key === 'runAccessReview') {
          return vi.fn().mockResolvedValue(complianceMock)
        }

        return vi.fn().mockResolvedValue([])
      },
    },
  )

  return { businessApi: mockApi }
})

describe('AdminConsoleView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
    state.activeView = 'admin-console'
  })

  it('renders correctly and shows tabs', async () => {
    const wrapper = mount(AdminConsoleView, {
      props: { isActive: true },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Consola de Administracion')
    expect(wrapper.text()).toContain('Empresas (Tenants)')
  })

  it('has tab buttons', async () => {
    const wrapper = mount(AdminConsoleView, {
      props: { isActive: true },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Usuarios Globales')
    expect(wrapper.text()).toContain('Logs de Auditoria')
    expect(wrapper.text()).toContain('Cumplimiento ISO')
  })
})
