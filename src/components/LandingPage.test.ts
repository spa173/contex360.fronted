import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingPage from './LandingPage.vue'

describe('LandingPage.vue - Pricing Section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('debe renderizar la seccion de precios y el toggle mensual/anual', async () => {
    const wrapper = mount(LandingPage)

    const section = wrapper.find('#precios')
    expect(section.exists()).toBe(true)
    expect(section.text()).toContain('Tarifas Transparentes')
    expect(section.text()).toContain('Elige el plan ideal para tu negocio')

    // Initial state: monthly pricing
    expect(section.text()).toContain('$ 89.000') // Starter monthly
    expect(section.text()).toContain('$ 189.000') // Pyme monthly

    // Click toggle
    const toggle = section.find('button.w-12')
    expect(toggle.exists()).toBe(true)
    await toggle.trigger('click')

    // After toggle: annual pricing
    expect(section.text()).toContain('$ 801.000') // Starter annual
    expect(section.text()).toContain('$ 1.701.000') // Pyme annual
  })

  it('debe emitir request-demo al pulsar "Comenzar prueba gratis"', async () => {
    const wrapper = mount(LandingPage)

    const btn = wrapper.findAll('#precios button').filter(b => b.text().includes('Comenzar prueba gratis'))[0]
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    expect(wrapper.emitted('request-demo')).toBeTruthy()
  })

  it('debe abrir la pasarela Wompi al pulsar "Comprar ahora"', async () => {
    const wrapper = mount(LandingPage)

    const btn = wrapper.findAll('#precios button').filter(b => b.text().includes('Comprar ahora'))[0]
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    const bodyHtml = document.body.innerHTML
    expect(bodyHtml).toContain('Checkout Seguro')
    expect(bodyHtml).toContain('Pasarela de pagos enlazada')

    // Submit payment
    const form = document.querySelector('form')
    expect(form).toBeTruthy()
    form!.dispatchEvent(new Event('submit'))

    // Verify event emission
    expect(wrapper.emitted('purchase-plan')).toBeTruthy()
    expect(wrapper.emitted('purchase-plan')![0][0]).toEqual({
      planType: 'starter',
      billing: 'monthly'
    })
  })
})
