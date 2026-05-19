import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppShell from './AppShell.vue'
import { usePlanAccess } from '../composables/usePlanAccess'
import { useAuthStore } from '../stores/authStore'

vi.mock('../composables/usePlanAccess', () => ({
  usePlanAccess: vi.fn()
}))

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('../stores/themeStore', () => ({
  useThemeStore: () => ({
    setForceLightMode: vi.fn()
  })
}))

vi.mock('../stores/translationStore', () => ({
  useTranslationStore: () => ({
    initLanguage: vi.fn()
  })
}))

describe('AppShell.vue - Navigation Gating', () => {
  let mockAuthStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    mockAuthStore = {
      currentUser: { name: 'Camilo', isSystemOwner: false },
      activeTenant: { name: 'Empresa Test' },
      activeMembership: {},
      accessibleTenants: [],
      activeView: 'dashboard',
      setActiveView: vi.fn().mockReturnValue({ ok: true }),
      setActiveTenant: vi.fn().mockReturnValue({ ok: true }),
      logout: vi.fn()
    }
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  it('debe permitir navegar a módulos no bloqueados', async () => {
    vi.mocked(usePlanAccess).mockReturnValue({
      plan: { value: 'starter' },
      canAccessModule: () => true,
      canCreateInvoice: () => true,
      canAddUser: () => true,
      isFeatureLocked: () => false
    } as any)

    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          DashboardView: true,
          AppSidebar: true,
          TopNavigation: true,
          ChatAssistant: true,
          SpotlightCommand: true,
          AlertsCenterModal: true
        }
      }
    })

    await wrapper.findComponent({ name: 'AppSidebar' }).vm.$emit('navigate', 'billing')
    expect(mockAuthStore.setActiveView).toHaveBeenCalledWith('billing')
  })

  it('debe redirigir a la vista de planes si el módulo está bloqueado', async () => {
    vi.mocked(usePlanAccess).mockReturnValue({
      plan: { value: 'starter' },
      canAccessModule: () => false,
      canCreateInvoice: () => true,
      canAddUser: () => true,
      isFeatureLocked: (viewId: string) => viewId === 'inventory'
    } as any)

    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          DashboardView: true,
          AppSidebar: true,
          TopNavigation: true,
          ChatAssistant: true,
          SpotlightCommand: true,
          AlertsCenterModal: true
        }
      }
    })

    await wrapper.findComponent({ name: 'AppSidebar' }).vm.$emit('navigate', 'inventory')
    expect(mockAuthStore.setActiveView).toHaveBeenCalledWith('plans')
  })
})
