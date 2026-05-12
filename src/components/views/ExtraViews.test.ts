import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AiView from './AiView.vue'
import AccountingView from './AccountingView.vue'
import { useAiStore } from '../../stores/aiStore'
import { useAccountingStore } from '../../stores/accountingStore'
import { useStateStore } from '../../stores/stateStore'

describe('Extra Views Coverage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
  })

  it('AiView renders correctly', async () => {
    const aiStore = useAiStore()
    aiStore.runOcr = vi.fn()
    
    const wrapper = mount(AiView, {
      props: { isActive: true },
    })

    expect(wrapper.text()).toContain('OCR y sugerencias')
  })

  it('AccountingView renders correctly', () => {
    const wrapper = mount(AccountingView, {
      props: { isActive: true },
    })

    expect(wrapper.text()).toContain('Libro diario')
  })
})
