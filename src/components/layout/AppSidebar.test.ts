import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppSidebar from './AppSidebar.vue'
import { usePlanAccess } from '../../composables/usePlanAccess'

vi.mock('../../composables/usePlanAccess', () => ({
  usePlanAccess: vi.fn()
}))

describe('AppSidebar.vue - Module Gating', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debe mostrar candados y deshabilitar navegación en módulos bloqueados', async () => {
    vi.mocked(usePlanAccess).mockReturnValue({
      plan: { value: 'starter' },
      canAccessModule: (id: string) => !['inventory', 'accounting'].includes(id),
      canCreateInvoice: () => true,
      canAddUser: () => true,
      isFeatureLocked: (id: string) => ['inventory', 'accounting'].includes(id)
    } as any)

    const wrapper = mount(AppSidebar, {
      props: {
        isOpen: true,
        activeTenant: { name: 'Empresa Test', idNumber: '123' },
        accessibleTenants: [],
        activeView: 'dashboard'
      }
    })

    const buttons = wrapper.findAll('button')
    
    // Find the inventory button
    const inventoryButton = buttons.find(b => b.text().includes('Inventario'))
    expect(inventoryButton).toBeDefined()
    
    // It should have title attribute "Plan Enterprise requerido"
    expect(inventoryButton?.attributes('title')).toBe('Plan Enterprise requerido')
    
    // It should contain the lock icon
    expect(inventoryButton?.html()).toContain('lock')
    expect(inventoryButton?.classes()).toContain('cursor-not-allowed')

    // Find dashboard button (which is not locked)
    const dashboardButton = buttons.find(b => b.text().includes('Dashboard'))
    expect(dashboardButton).toBeDefined()
    expect(dashboardButton?.attributes('title')).toBeFalsy()
    expect(dashboardButton?.html()).not.toContain('lock')
    expect(dashboardButton?.classes()).not.toContain('cursor-not-allowed')

    // Click on inventory button should emit navigate event so the shell can gate/redirect
    await inventoryButton?.trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['inventory'])

    // Click on dashboard button should also emit navigate event
    await dashboardButton?.trigger('click')
    expect(wrapper.emitted('navigate')?.[1]).toEqual(['dashboard'])
  })
})
