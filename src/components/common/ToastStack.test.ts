import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ToastStack from './ToastStack.vue'
// @ts-expect-error - JS file without types
import { useToasts } from '../../composables/useToasts'

describe('ToastStack', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly and shows toasts', async () => {
    const { pushToast, toasts } = useToasts()
    pushToast('Test Toast')
    
    const wrapper = mount(ToastStack, {
      props: { toasts: toasts.value }
    })
    expect(wrapper.text()).toContain('Test Toast')
  })
})
