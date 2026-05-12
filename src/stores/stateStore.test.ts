import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { buildDemoPassword, parseUserAgentMetadata, useStateStore } from './stateStore'

vi.mock('../services/businessApi', () => ({
  businessApi: {
    createInvoice: vi.fn().mockImplementation((payload) => Promise.resolve({ ...payload, id: 'inv-mock-1', status: 'aceptada', tenantId: 'tenant-a' })),
    login: vi.fn().mockResolvedValue({ token: 'mock-token' }),
    me: vi.fn().mockResolvedValue({ id: 'user-demo' }),
    getInvoices: vi.fn().mockResolvedValue([]),
    getMovements: vi.fn().mockResolvedValue([]),
    getThirdParties: vi.fn().mockResolvedValue([]),
  }
}))

const STORAGE_KEY = 'contex360-mvp-state'

function createInvoiceItem(product: any, quantity: number) {
  const subtotal = product.price * quantity
  const taxAmount = subtotal * (product.taxRate / 100)

  return {
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    unitCost: product.cost,
    taxRate: product.taxRate,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  }
}

async function loginAsAdmin(store: any) {
  return store.login({
    email: 'admin@contex360.local',
    password: buildDemoPassword('admin@contex360.local'),
  })
}

describe('useStateStore', () => {
  let store: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useStateStore()
  })

  afterEach(() => {
    store?.resetState()
  })

  it('permite iniciar sesion con credenciales hash y persiste usuarios sin clave en texto plano', async () => {
    const result = await loginAsAdmin(store)

    expect(result.ok).toBe(true)
    expect(store.currentUser?.id).toBe('user-demo')

    const snapshot = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) || '{}')
    const persistedUser = snapshot.users.find((user: any) => user.id === 'user-demo')

    expect(persistedUser.password).toBeUndefined()
    expect(typeof persistedUser.passwordHash).toBe('string')
    expect(typeof persistedUser.passwordSalt).toBe('string')
  })

  it('detecta navegador y sistema operativo desde el user agent sin regex costosas', () => {
    expect(
      parseUserAgentMetadata(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      ),
    ).toEqual({
      browser: 'Safari 17',
      os: 'iOS 17.4',
      deviceLabel: 'Safari 17 en iOS 17.4',
    })
  })

  it('cambia de tenant y ajusta la vista activa cuando el nuevo rol no puede ver el panel actual', async () => {
    await loginAsAdmin(store)

    expect(store.setActiveView('billing').ok).toBe(true)

    const result = await store.setActiveTenant('tenant-b')

    expect(result.ok).toBe(true)
    expect(store.activeTenantId).toBe('tenant-b')
    expect(store.activeMembership?.role).toBe('Gerencia')
    expect(store.activeView).toBe('dashboard')
    expect(store.visibleViews).toEqual(['dashboard', 'accounting', 'admin-console'])
    expect(store.selections.invoiceId).toBeNull()
  })

  it('crea usuarios nuevos con hash y membresia en el tenant activo', async () => {
    await loginAsAdmin(store)

    const result = await store.createUser({
      name: 'Ana Gomez',
      email: 'ana@contex360.local',
      password: buildDemoPassword('ana@contex360.local'),
      status: 'active',
      title: 'Analista contable',
      role: 'Contador',
    })

    const createdUser = store.users.find((user: any) => user.email === 'ana@contex360.local')
    const membership = store.memberships.find((item: any) => item.userId === createdUser?.id)

    expect(result.ok).toBe(true)
    expect(createdUser).toBeTruthy()
    expect(createdUser.password).toBeUndefined()
    expect(typeof createdUser.passwordHash).toBe('string')
    expect(typeof createdUser.passwordSalt).toBe('string')
    expect(membership?.tenantId).toBe('tenant-a')
    expect(membership?.role).toBe('Contador')
  })

  it('activa usuarios registrados al asignarles rol en la empresa activa', async () => {
    await loginAsAdmin(store)

    const registerResult = await store.registerUser({
      name: 'Usuario Pendiente',
      email: 'pendiente@contex360.local',
      password: buildDemoPassword('pendiente@contex360.local'),
    })
    const pendingUser = store.users.find((user: any) => user.email === 'pendiente@contex360.local')

    const assignResult = store.assignMembership({
      userId: pendingUser.id,
      role: 'Auxiliar contable',
    })

    expect(registerResult.ok).toBe(true)
    expect(assignResult.ok).toBe(true)
    expect(pendingUser.status).toBe('active')
    expect(pendingUser.title).toBe('Perfil Auxiliar contable')
    expect(
      store.memberships.some(
        (membership: any) =>
          membership.userId === pendingUser.id &&
          membership.tenantId === 'tenant-a' &&
          membership.role === 'Auxiliar contable',
      ),
    ).toBe(true)
  })

  it('ejecuta OCR, selecciona el analisis nuevo y registra auditoria', async () => {
    await loginAsAdmin(store)

    const previousRuns = store.ocrRuns.length
    const result = store.runOcr(
      'Factura FE-2026, NIT 900123456-7, fecha 2026-04-28, subtotal 100000, IVA 19000, total 119000.',
    )

    expect(result.ok).toBe(true)
    expect(store.ocrRuns).toHaveLength(previousRuns + 1)
    expect(store.selectedOcrRun?.fields.nit).toBe('900123456-7')
    expect(store.selectedOcrRun?.fields.total).toBe('119000')
    expect(
      store.auditEvents.some(
        (event: any) =>
          event.entity === 'ia' &&
          event.action === 'Analizar soporte' &&
          event.tenantId === store.activeTenantId,
      ),
    ).toBe(true)
  })
})
