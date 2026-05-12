import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppTopbar from './AppTopbar.vue'
import { useStateStore } from '../../stores/stateStore'

describe('AppTopbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.removeItem('contex360-theme')
    document.documentElement.classList.remove('dark', 'light')
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
    expect(wrapper.text()).toContain('Tema claro')
  })

  it('toggles the document theme', async () => {
    const wrapper = mount(AppTopbar)

    await wrapper.find('.theme-toggle-button').trigger('click')

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(localStorage.getItem('contex360-theme')).toBe('light')
  })
})
