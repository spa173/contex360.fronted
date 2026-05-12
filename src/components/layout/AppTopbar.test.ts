import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppTopbar from './AppTopbar.vue'
import { useStateStore } from '../../stores/stateStore'

describe('AppTopbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
  })

  it('renders correctly and shows active tenant', () => {
    const wrapper = mount(AppTopbar)
    expect(wrapper.text()).toContain('Contex Labs SAS')
  })

  it('shows user menu', async () => {
    const wrapper = mount(AppTopbar)
    expect(wrapper.text()).toContain('Camilo Demo')
  })
})
