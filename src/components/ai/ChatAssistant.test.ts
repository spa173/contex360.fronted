import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ChatAssistant from './ChatAssistant.vue'
import { useStateStore } from '../../stores/stateStore'

describe('ChatAssistant', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const state = useStateStore()
    state.activeTenantId = 'tenant-a'
    state.session.currentUserId = 'user-demo'
  })

  it('renders trigger button initially', () => {
    const wrapper = mount(ChatAssistant)
    expect(wrapper.text()).toContain('✨')
    expect(wrapper.find('.chat-window').exists()).toBe(false)
  })

  it('opens chat on click', async () => {
    const wrapper = mount(ChatAssistant)
    const trigger = wrapper.find('.chat-trigger')
    await trigger.trigger('click')
    
    expect(wrapper.find('.chat-window').exists()).toBe(true)
    expect(wrapper.text()).toContain('Asistente Contex360')
    expect(wrapper.text()).toContain('¿Cómo puedo ayudarte hoy')
  })
})
