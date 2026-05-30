import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import LandingPage from './LandingPage.vue'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('../stores/stateStore', () => ({
  useStateStore: () => ({
    currentUser: null,
    activeTenantId: null,
  })
}))

vi.mock('../services/businessApi', () => ({
  businessApi: {}
}))

vi.mock('vue-sonner', () => ({
  toast: {}
}))

vi.mock('@unhead/vue', () => ({
  useHead: () => {}
}))

describe('LandingPage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggles mobileNavOpen when hamburger menu is clicked', async () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          Teleport: true
        }
      }
    })

    const btn = wrapper.find('.nav-hamburger')
    expect(btn.exists()).toBe(true)

    expect((wrapper.vm as any).mobileNavOpen).toBe(false)

    await btn.trigger('click')

    expect((wrapper.vm as any).mobileNavOpen).toBe(true)
  })
})
