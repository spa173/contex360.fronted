import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HeroSummary from './HeroSummary.vue'
import { useStateStore } from '../../stores/stateStore'

describe('HeroSummary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
    state.activeView = 'dashboard'
  })

  it('renders correctly and shows metrics', () => {
    const wrapper = mount(HeroSummary)
    expect(wrapper.text()).toContain('Ingresos acumulados')
    expect(wrapper.text()).toContain('DIAN aceptados')
    expect(wrapper.text()).toContain('Stock minimo')
  })
})
