import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App.vue'
import { useStateStore } from './stores/stateStore'

describe('App integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the login screen before authentication', () => {
    const wrapper = mount(App, {
      global: {
        stubs: ['router-link', 'router-view']
      },
    })

    expect(wrapper.text()).toContain('Iniciar sesión')
  })

  it('shows the main shell after authentication', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    
    const wrapper = mount(App, {
      global: {
        stubs: ['router-link', 'router-view']
      },
    })
    
    await wrapper.vm.$nextTick()
    // It should render AppShell now
    expect(wrapper.html()).toContain('shell')
  })
})
