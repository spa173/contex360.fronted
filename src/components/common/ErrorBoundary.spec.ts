import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary.vue'
import { nextTick, defineComponent } from 'vue'

describe('ErrorBoundary', () => {
  it('renders default slot when there is no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div class="child">Hello World</div>'
      }
    })

    expect(wrapper.find('.child').exists()).toBe(true)
    expect(wrapper.text()).toContain('Hello World')
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  it('renders error boundary when child throws error on action', async () => {
    // Suppress console.error for this test as we expect an error
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const ChildComponent = defineComponent({
      template: '<button class="trigger-error" @click="throwError">Throw Error</button>',
      methods: {
        throwError() {
          throw new Error('Test Error')
        }
      }
    })

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: ChildComponent
      }
    })

    // Find the button inside the child and click it
    await wrapper.find('.trigger-error').trigger('click')
    await nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Algo salió mal')
    expect(wrapper.text()).toContain('Test Error')

    consoleError.mockRestore()
  })

  it('reloads page when reload button is clicked', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const originalLocation = window.location
    delete (window as any).location
    ;(window as any).location = { ...originalLocation, reload: vi.fn() } as any

    const ChildComponent = defineComponent({
      template: '<button class="trigger-error" @click="throwError">Throw Error</button>',
      methods: {
        throwError() {
          throw new Error('Test Error')
        }
      }
    })

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: ChildComponent
      }
    })

    await wrapper.find('.trigger-error').trigger('click')
    await nextTick()

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(window.location.reload).toHaveBeenCalled()

    ;(window as any).location = originalLocation as any
    consoleError.mockRestore()
  })
})
