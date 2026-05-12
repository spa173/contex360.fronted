import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStateStore } from './stateStore'

describe('DIAN Worker Coverage', () => {
  let store: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useStateStore()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('procesa actualizaciones programadas de la DIAN', async () => {
    const admin = store.users.find((u: any) => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const invoiceId = 'inv-seed-1'
    store.scheduleDianUpdates(invoiceId, 'tenant-a')

    // Initially accepted in seed, let's change to borrador first to see transitions
    const inv = store.invoices.find((i: any) => i.id === invoiceId)
    inv.status = 'borrador'

    // Advance 1.5s (should trigger 'enviada')
    await vi.advanceTimersByTimeAsync(1500)
    expect(inv.status).toBe('enviada')

    // Advance 3s more (should trigger 'aceptada')
    await vi.advanceTimersByTimeAsync(3000)
    expect(inv.status).toBe('aceptada')
  })
})
