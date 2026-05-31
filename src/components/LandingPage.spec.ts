import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
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

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  static lastInstance: MockIntersectionObserver | null = null

  constructor(public callback: any, public options: any) {
    MockIntersectionObserver.lastInstance = this
  }
}
window.IntersectionObserver = MockIntersectionObserver as any

describe('LandingPage.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    MockIntersectionObserver.lastInstance = null
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = ''
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

  it('renders placeholders initially and loads content when intersecting', async () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          Teleport: true
        }
      }
    })

    // Initially, lazy sections should not be visible (only placeholders are in the DOM)
    expect(wrapper.find('#testimonios section').exists()).toBe(false)
    expect(wrapper.find('#precios section').exists()).toBe(false)
    expect(wrapper.find('#faq section').exists()).toBe(false)

    // Retrieve observer instance
    const observerInstance = MockIntersectionObserver.lastInstance
    expect(observerInstance).not.toBeNull()
    
    // Simulate intersection for testimonials
    observerInstance!.callback([
      { isIntersecting: true, target: { dataset: { section: 'testimonials' } } }
    ])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#testimonios section').exists()).toBe(true)

    // Simulate intersection for pricing
    observerInstance!.callback([
      { isIntersecting: true, target: { dataset: { section: 'pricing' } } }
    ])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#precios section').exists()).toBe(true)

    // Simulate intersection for faq
    observerInstance!.callback([
      { isIntersecting: true, target: { dataset: { section: 'faq' } } }
    ])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#faq section').exists()).toBe(true)

    // Simulate intersection for footer
    observerInstance!.callback([
      { isIntersecting: true, target: { dataset: { section: 'footer' } } }
    ])
    await wrapper.vm.$nextTick()
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('forces rendering when direct hash links are accessed', async () => {
    window.location.hash = '#precios'
    
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          Teleport: true
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Testimonials and Pricing should render immediately, but FAQ and Footer should not
    expect(wrapper.find('#testimonios section').exists()).toBe(true)
    expect(wrapper.find('#precios section').exists()).toBe(true)
    expect(wrapper.find('#faq section').exists()).toBe(false)
  })

  it('loads all sections immediately when user agent belongs to a search engine bot', async () => {
    const originalUserAgent = navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      configurable: true
    })

    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          Teleport: true
        }
      }
    })

    // All sections should be rendered immediately
    expect(wrapper.find('#testimonios section').exists()).toBe(true)
    expect(wrapper.find('#precios section').exists()).toBe(true)
    expect(wrapper.find('#faq section').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)

    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true
    })
  })
})
