import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStateStore } from './stateStore'

describe('useStateStore Deep Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('covers bulkUserAction edge cases', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    
    // Empty userIds
    let result = store.bulkUserAction({ userIds: [], action: 'activate' })
    expect(result.ok).toBe(false)
    expect(result.message).toContain('Selecciona al menos un usuario')
    
    // System owner protection
    store.users.push({ 
      id: 'sys-owner-2', name: 'Other Boss', email: 'boss2@test.com', status: 'active', 
      isSystemOwner: true, title: 'Owner', lastLoginAt: null, isDemoAccount: false 
    })
    result = store.bulkUserAction({ userIds: ['sys-owner-2'], action: 'deactivate' })
    expect(result.ok).toBe(true)
    expect(result.detail).toContain('0 usuarios actualizados')
    
    // Valid actions
    result = store.bulkUserAction({ userIds: ['user-accountant'], action: 'activate' })
    result = store.bulkUserAction({ userIds: ['user-accountant'], action: 'deactivate' })
    result = store.bulkUserAction({ userIds: ['user-accountant'], action: 'require-2fa' })
    result = store.bulkUserAction({ userIds: ['user-accountant'], action: 'force-reset' })
    result = store.bulkUserAction({ userIds: ['user-accountant'], action: 'change-role', role: 'Contador' })
  })

  it('covers createInvitation validation', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    
    // Invalid email
    let result = store.createInvitation({ email: 'bad-email', tenantId: 'tenant-a', role: 'Contador' })
    expect(result.ok).toBe(false)
    
    // Invalid tenant/role
    result = store.createInvitation({ email: 'good@email.com', tenantId: 'invalid', role: 'invalid' })
    expect(result.ok).toBe(false)
    
    // Valid
    result = store.createInvitation({ email: 'new@email.com', tenantId: 'tenant-a', role: 'Contador' })
    expect(result.ok).toBe(true)
  })

  it('covers resendInvitation and panicLogoutAll', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    
    store.invitations.push({ id: 'inv-1', email: 'test@test.com', tenantId: 'tenant-a', role: 'Contador', status: 'pending', expiresAt: '2026-01-01', createdAt: '2026-01-01', createdBy: 'Admin', resendCount: 0, resentAt: null })
    
    store.resendInvitation('inv-1')
    const inv = store.invitations.find(i => i.id === 'inv-1')
    expect(inv?.resendCount).toBe(1)
    
    // Panic logout - revoca todas las sesiones (no las elimina, solo les pone revokedAt)
    store.panicLogoutAll()
    const activeSessions = store.userSessions.filter(s => !s.revokedAt)
    expect(activeSessions.length).toBe(0)
  })

  it('covers removeMembership and session revocation', async () => {
    const store = useStateStore()
    await store.loginDemoUser('user-demo')
    
    // Create a target user with membership and session
    store.users.push({ 
      id: 'target-u', name: 'Target', email: 't@t.com', status: 'active', title: 'T',
      lastLoginAt: null, isDemoAccount: false, isSystemOwner: false
    })
    store.memberships.push({ userId: 'target-u', tenantId: 'tenant-b', role: 'Contador' })
    store.userSessions.push({ 
      id: 's-1', userId: 'target-u', tenantId: 'tenant-b', createdAt: '2026-01-01', ip: '1.1.1.1', 
      location: 'L', device: 'D', browser: 'B', os: 'O', lastSeenAt: '2026-01-01', revokedAt: null,
      fingerprint: 'f1', revokedBy: null
    })
    
    // Remove membership
    const result = store.removeMembership({ userId: 'target-u', tenantId: 'tenant-b' })
    expect(result.ok).toBe(true)
    
    // Verify session revoked
    const session = store.userSessions.find(s => s.id === 's-1')
    expect(session?.revokedAt).toBeDefined()
  })
})
