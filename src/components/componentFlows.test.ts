import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthScreen from './AuthScreen.vue'
import BillingView from './views/BillingView.vue'
import UsersView from './views/UsersView.vue'
import { buildDemoPassword, useStateStore } from '../stores/stateStore'

function createContext() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const state = useStateStore(pinia)

  return {
    pinia,
    state,
  }
}

async function loginAsAdmin(state: any) {
  return state.login({
    email: 'admin@contex360.local',
    password: buildDemoPassword('admin@contex360.local'),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('component flows', () => {
  it('AuthScreen autentica contra el backend y guarda la sesion', async () => {
    const { pinia, state } = createContext()
    const loginResponse = {
      ok: true,
      message: 'Sesion iniciada.',
      accessToken: 'token-123',
      user: {
        id: 'user-demo',
        name: 'Camilo Demo',
        email: 'admin@contex360.local',
        title: 'Administrador local',
        status: 'active',
        lastLoginAt: '2026-05-06T10:00:00.000Z',
        isSystemOwner: true,
        isDemoAccount: true,
      },
      session: {
        id: 'sess-login-1',
        userId: 'user-demo',
        tenantId: 'tenant-a',
        ip: '127.0.0.1',
        location: 'Local',
        device: 'Navegador web',
        browser: 'Chrome',
        os: 'Windows',
        fingerprint: 'fingerprint-1',
        createdAt: '2026-05-06T10:00:00.000Z',
        lastSeenAt: '2026-05-06T10:00:00.000Z',
        revokedAt: null,
        revokedBy: null,
      },
      activeTenantId: 'tenant-a',
      accessibleTenants: [
        {
          id: 'tenant-a',
          name: 'Contex Labs SAS',
          prefix: 'CL',
          sector: 'Servicios profesionales',
          city: 'Bogota',
          allowNegativeStock: false,
          dianStatus: 'Configurado',
        },
      ],
      memberships: [{ tenantId: 'tenant-a', role: 'Administrador' }],
    }
    const fetchMock = vi.fn(async (url) => {
      // console.log('FETCH URL:', url)
      if (url.toString().includes('/auth/login')) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: async () => loginResponse,
        }
      }
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => [],
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(AuthScreen, {
      global: {
        plugins: [pinia],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[autocomplete="on"]')
    const passwordToggle = wrapper.find('button[aria-label="Mostrar contrasena"]')

    expect(wrapper.text()).toContain('Iniciar sesion')
    expect(wrapper.text()).toContain('¿Olvidaste tu contrasena?')
    expect(wrapper.text()).not.toContain('Crear una cuenta')
    expect((emailInput.element as HTMLInputElement).value).toBe('')
    expect(passwordInput.attributes('type')).toBe('password')

    expect(wrapper.findAll('a.auth-sso-button')).toHaveLength(0)

    await passwordToggle.trigger('click')
    await nextTick()

    expect(wrapper.find('input[autocomplete="on"]').attributes('type')).toBe('text')

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Olvidaste tu contrasena'))
      ?.trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('Contacta a tu administrador')

    await emailInput.setValue('admin@contex360.local')
    await passwordInput.setValue(buildDemoPassword('admin@contex360.local'))
    await (wrapper.vm as any).handleSubmit()
    await flushPromises()
    await nextTick()

    expect(state.currentUser?.id).toBe('user-demo')
    expect(wrapper.text()).toContain('Sesión iniciada.')
  })

  it('BillingView muestra advertencia agregada cuando un producto duplicado supera el stock', async () => {
    const { pinia, state } = createContext()
    await loginAsAdmin(state)

    const wrapper = mount(BillingView, {
      props: {
        isActive: true,
      },
      global: {
        plugins: [pinia],
      },
    })

    const addItemButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Agregar item')

    await wrapper.find('.invoice-line select').setValue('prod-3')
    await wrapper.find('.invoice-line input[type="number"]').setValue('2')
    await addItemButton?.trigger('click')
    await nextTick()

    const productSelects = wrapper.findAll('.invoice-line select')
    const quantityInputs = wrapper.findAll('.invoice-line input[type="number"]')

    await productSelects[1].setValue('prod-3')
    await quantityInputs[1].setValue('2')
    await nextTick()

    expect(wrapper.text()).toContain('Sin stock suficiente para Modulo IA documental.')
    expect(wrapper.text()).toContain('Solicitado: 4.')
    expect(wrapper.text()).toContain('Bloquea emision')
  })

  it('BillingView emite notify cuando intentan quitar el ultimo item', async () => {
    const { pinia, state } = createContext()
    await loginAsAdmin(state)

    const wrapper = mount(BillingView, {
      props: {
        isActive: true,
      },
      global: {
        plugins: [pinia],
      },
    })

    await wrapper.find('button.line-remove').trigger('click')

    expect(wrapper.emitted('notify')).toBeTruthy()
    expect((wrapper.emitted('notify') as any)[0][0]).toEqual({
      message: 'La factura necesita al menos un item.',
      detail: '',
    })
  })

  it('UsersView refleja usuarios creados y mantiene la clave oculta', async () => {
    const { pinia, state } = createContext()
    await loginAsAdmin(state)

    const wrapper = mount(UsersView, {
      props: {
        isActive: true,
      },
      global: {
        plugins: [pinia],
      },
    })

    const passwordInput = wrapper.find('input[autocomplete="new-password"]')

    expect(passwordInput.attributes('type')).toBe('password')
    expect(wrapper.text()).not.toContain('ClaveTemporal123')

    await state.createUser({
      name: 'Ana Gomez',
      email: 'ana@contex360.local',
      password: buildDemoPassword('ana@contex360.local'),
      status: 'active',
      title: 'Analista contable',
      role: 'Contador',
    })

    await flushPromises()
    await nextTick()

    expect(state.users.some((user) => user.email === 'ana@contex360.local')).toBe(true)
    expect(wrapper.text()).toContain('ana@contex360.local')
  })
})
