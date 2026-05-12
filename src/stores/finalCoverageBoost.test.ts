import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStateStore } from './stateStore'

describe('Global Store - Impulso Final de Cobertura', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
  })

  it('bloquea la cuenta después de múltiples intentos fallidos', () => {
    const store = useStateStore()
    const userId = 'user-demo'
    const email = 'admin@contex360.local'
    
    // Simular múltiples fallos
    for (let i = 0; i < 10; i++) {
      store.handleFailedLogin(email, userId)
    }
    
    const security = store.ensureUserSecurity(userId)
    expect(security.lockedUntil).not.toBeNull()
  })

  it('valida formatos de email a través de invitaciones', async () => {
    const store = useStateStore()
    vi.spyOn(store, 'can').mockReturnValue(true)
    
    // Email inválido
    const res = store.createInvitation({ email: 'malo', tenantId: 'tenant-a', role: 'Visor' })
    expect(res.message).toContain('correo electrónico válido')
  })
  
  it('cubre sanitización en logs de auditoría', () => {
    const store = useStateStore()
    vi.spyOn(store, 'can').mockReturnValue(true)
    
    // Trigger appendAuditEvent through createInvitation
    // Forzamos un valor que parezca password en el email (aunque sea inválido para la regex, appendAuditEvent lo procesará)
    // Pero isValidEmail lo detendrá antes. 
    // Usaremos una acción que no valide el email tan estrictamente si existe, o saltamos el check.
    
    // @ts-ignore - Usando un valor que pase el check pero contenga el patrón
    store.createInvitation({ email: 'password=123@test.com', tenantId: 'tenant-a', role: 'Visor' })
    
    const lastEvent = store.auditEvents[0] 
    expect(lastEvent.description).toContain('[REDACTED]')
  })

  it('ejecuta panicLogoutAll correctamente', () => {
    const store = useStateStore()
    vi.spyOn(store, 'can').mockReturnValue(true)
    
    // Usar as any para evitar errores de tipo en campos no esenciales para esta prueba
    store.userSessions = [{ 
      id: 's1', 
      userId: 'u1', 
      tenantId: 't1', 
      revokedAt: null 
    } as any]
    
    const res = store.panicLogoutAll()
    expect(res.ok).toBe(true)
    expect(store.userSessions[0].revokedAt).not.toBeNull()
  })
})
