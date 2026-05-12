import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStateStore } from './stateStore'

describe('Global Store - Cobertura de Acciones Masivas', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Simular el almacenamiento para evitar efectos secundarios
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
  })

  it('maneja correctamente las acciones masivas de usuario usando datos de semilla', async () => {
    const store = useStateStore()
    
    // Asegurar que tenemos un usuario actual de la semilla
    const targetUserId = 'user-demo'
    store.session.currentUserId = targetUserId
    store.activeTenantId = 'tenant-a'

    // Simular permisos de administrador
    vi.spyOn(store, 'can').mockReturnValue(true)

    // 1. Acción: Desactivar a otro usuario (user-accountant)
    const otherUserId = 'user-accountant'
    store.bulkUserAction({ action: 'deactivate', userIds: [otherUserId] })
    expect(store.users.find(u => u.id === otherUserId)?.status).toBe('inactive')

    // 2. Acción: Desactivar a uno mismo (debe estar protegido)
    store.bulkUserAction({ action: 'deactivate', userIds: [targetUserId] })
    expect(store.users.find(u => u.id === targetUserId)?.status).toBe('active')

    // 3. Acción: Protección del dueño del sistema
    const owner = store.users.find(u => u.isSystemOwner)
    if (owner && owner.id !== targetUserId) {
      store.bulkUserAction({ action: 'deactivate', userIds: [owner.id] })
      expect(owner.status).toBe('active')
    }

    // 4. Acción: Cambiar rol
    store.bulkUserAction({ action: 'change-role', userIds: [otherUserId], role: 'Visor', tenantId: 'tenant-a' })
    expect(store.memberships.some(m => m.userId === otherUserId && m.tenantId === 'tenant-a' && m.role === 'Visor')).toBe(true)
  })
})
