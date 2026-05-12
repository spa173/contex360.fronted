import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.vue'
import { useStateStore } from './stores/stateStore'

function buildJsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: {
      get: () => 'application/json',
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

function installFetchMock(responses: Record<string, unknown>) {
  const fetchMock = vi.fn(async (input) => {
    const url = input.toString()

    if (url.includes('/auth/me')) {
      return responses.me as Response
    }

    if (url.includes('/products')) {
      return responses.products as Response
    }

    if (url.includes('/invoices')) {
      return responses.invoices as Response
    }

    if (url.includes('/third-parties')) {
      return responses.thirdParties as Response
    }

    if (url.includes('/inventory/movements')) {
      return responses.movements as Response
    }

    throw new Error(`Unexpected fetch call: ${url}`)
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('App integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.removeItem('contex360-theme')
    document.documentElement.classList.remove('dark', 'light')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the login screen before authentication', async () => {
    installFetchMock({
      me: buildJsonResponse({ message: 'No autenticado' }, false, 401),
    })

    const wrapper = mount(App, {
      global: {
        stubs: ['router-link', 'router-view'],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Iniciar sesi')
  })

  it('shows the main shell after authentication', async () => {
    const store = useStateStore()
    const fetchMock = installFetchMock({
      me: buildJsonResponse({
        ok: true,
        message: 'Sesion activa.',
        user: {
          id: 'user-demo',
          name: 'Camilo Demo',
          email: 'admin@contex360.local',
          title: 'Administrador local',
          status: 'active',
          lastLoginAt: '2026-05-06T10:00:00.000Z',
          isSystemOwner: true,
          isDemoAccount: true,
        },
        session: {
          id: 'sess-1',
          userId: 'user-demo',
          tenantId: 'tenant-a',
          ip: '127.0.0.1',
          location: 'Local',
          device: 'Navegador web',
          browser: 'Chrome',
          os: 'Windows',
          fingerprint: 'fingerprint-1',
          createdAt: '2026-05-06T10:00:00.000Z',
          lastSeenAt: '2026-05-06T10:00:00.000Z',
          revokedAt: null,
          revokedBy: null,
        },
        activeTenantId: 'tenant-a',
        accessibleTenants: [
          {
            id: 'tenant-a',
            name: 'Contex Labs SAS',
            prefix: 'CL',
            sector: 'Servicios profesionales',
            city: 'Bogota',
            allowNegativeStock: false,
            dianStatus: 'Configurado',
          },
        ],
        memberships: [{ tenantId: 'tenant-a', role: 'Administrador' }],
      }),
      products: buildJsonResponse([]),
      invoices: buildJsonResponse([]),
      thirdParties: buildJsonResponse([]),
      movements: buildJsonResponse([]),
    })

    const wrapper = mount(App, {
      global: {
        stubs: ['router-link', 'router-view'],
      },
    })

    await flushPromises()

    expect(fetchMock).toHaveBeenCalled()
    expect(store.currentUser?.id).toBe('user-demo')
    expect(wrapper.find('.app-shell').exists()).toBe(true)
  })
})
