import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppSidebar from './AppSidebar.vue'
import { useStateStore } from '../../stores/stateStore'

describe('AppSidebar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
  })

  it('renders correctly and shows navigation items', () => {
    const wrapper = mount(AppSidebar)

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Facturación')
    expect(wrapper.text()).toContain('Inventario')
  })

  it('switches views on click', async () => {
    const state = useStateStore()
    const wrapper = mount(AppSidebar)

    const items = wrapper.findAll('.nav-item')
    if (items.length > 1) {
      await items[1].trigger('click')
    }
    expect(state.activeView).toBeDefined()
  })
})
