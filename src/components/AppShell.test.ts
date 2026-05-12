import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppShell from './AppShell.vue'
import { useStateStore } from '../stores/stateStore'

// Mock Chart.js to avoid canvas errors
vi.mock('chart.js/auto', () => ({
  default: class {
    constructor() {}
    destroy() {}
    update() {}
  }
}))

describe('AppShell', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
  })

  it('renders app shell structure', () => {
    const wrapper = mount(AppShell, {
      global: {
        stubs: {
          DashboardView: true,
          BillingView: true,
          InventoryView: true,
          AccountingView: true,
          ThirdPartiesView: true,
          UsersView: true,
          AiView: true,
          AdminConsoleView: true,
          ChatAssistant: true,
          HeroSummary: true,
          BusinessChart: true,
        }
      }
    })
    
    expect(wrapper.find('.app-shell').exists()).toBe(true)
  })
})
