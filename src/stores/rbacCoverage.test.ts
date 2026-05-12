// @ts-nocheck
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { buildDemoPassword, useStateStore } from './stateStore'

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

async function loginAsAdmin(store: any) {
  return store.login({
    email: 'admin@contex360.local',
    password: buildDemoPassword('admin@contex360.local'),
  })
}

describe('RBAC and Session Coverage', () => {
  let store: any

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useStateStore()
  })

  afterEach(() => {
    store?.resetState()
  })

  it('maneja el ciclo de vida de sesiones: revokeSession y revokeUserSessions', async () => {
    // Manually set admin state to avoid login dependencies
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'
    
    // Create a dummy session for an existing user
    const dummySessionId = 'dummy-s'
    store.userSessions.push({
      id: dummySessionId,
      userId: 'user-accountant',
      tenantId: 'tenant-a',
      device: 'Test Device',
      revokedAt: null
    })

    // Revoke specific session
    const r1 = store.revokeSession(dummySessionId)
    expect(r1.ok).toBe(true)
    expect(store.userSessions.find(s => s.id === dummySessionId).revokedAt).toBeDefined()

    // Revoke all user sessions
    const r2 = store.revokeUserSessions('user-accountant')
    expect(r2.ok).toBe(true)

    // Unauthorized access
    store.logout()
    expect(store.revokeSession(dummySessionId).ok).toBe(false)
    expect(store.revokeUserSessions('user-b-1').ok).toBe(false)
  })

  it('permite actualizar permisos de roles y restaurar versiones', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'
    
    const payload = {
      role: 'Contador',
      moduleId: 'billing',
      permission: 'delete', // New permission
      allowed: true,
      reason: 'Prueba de cobertura'
    }

    const r1 = store.updateRolePermission(payload)
    expect(r1.ok).toBe(true)
    expect(store.getRoleAccess('Contador').billing).toContain('delete')

    // Restore previous version
    const r2 = store.restorePreviousRoleAccessVersion()
    expect(r2.ok).toBe(true)
    expect(store.getRoleAccess('Contador').billing).not.toContain('delete')

    // Duplicate role
    const r3 = store.duplicateRolePermissions('Contador', 'Auxiliar contable')
    expect(r3.ok).toBe(true)
  })

  it('validaciones de seguridad en RBAC', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'
    
    // No se puede editar Administrador
    const r1 = store.updateRolePermission({ role: 'Administrador', moduleId: 'billing', permission: 'view', allowed: false, reason: 'Fail' })
    expect(r1.ok).toBe(false)

    // No se puede duplicar a Administrador
    const r2 = store.duplicateRolePermissions('Contador', 'Administrador')
    expect(r2.ok).toBe(false)

    // Falta motivo
    const r3 = store.updateRolePermission({ role: 'Contador', moduleId: 'billing', permission: 'view', allowed: false, reason: '' })
    expect(r3.ok).toBe(false)
  })

  it('gestiona membresias: assignMembership y removeMembership', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    // Assign membership
    const r1 = store.assignMembership({ userId: 'user-visor', tenantId: 'tenant-a', role: 'Visor' })
    expect(r1.ok).toBe(true)
    expect(store.memberships.some(m => m.userId === 'user-visor' && m.tenantId === 'tenant-a')).toBe(true)

    // Remove membership
    const r2 = store.removeMembership({ userId: 'user-visor', tenantId: 'tenant-a' })
    expect(r2.ok).toBe(true)
    expect(store.memberships.some(m => m.userId === 'user-visor' && m.tenantId === 'tenant-a')).toBe(false)
  })

  it('ejecuta acciones masivas: bulkUserAction', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const userIds = ['user-accountant', 'user-visor']
    const r1 = store.bulkUserAction({ userIds, action: 'require-2fa' })
    expect(r1.ok).toBe(true)
    expect(r1.detail).toContain('2 usuarios')
    
    expect(store.getSecurityProfile('user-accountant').twoFactorRequired).toBe(true)
    expect(store.getSecurityProfile('user-visor').twoFactorRequired).toBe(true)

    // Deactivate
    const r2 = store.bulkUserAction({ userIds, action: 'deactivate' })
    expect(r2.ok).toBe(true)
    expect(store.users.find(u => u.id === 'user-accountant').status).toBe('inactive')
  })

  it('gestiona invitaciones: createInvitation y resendInvitation', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const r1 = store.createInvitation({ email: 'new@test.com', tenantId: 'tenant-a', role: 'Contador' })
    expect(r1.ok).toBe(true)
    const invId = store.invitations[0].id

    const r2 = store.resendInvitation(invId)
    expect(r2.ok).toBe(true)
    expect(store.invitations[0].resendCount).toBe(1)
  })

  it('permite registrar un usuario nuevo', async () => {
    const r = await store.registerUser({
      name: 'New User',
      email: 'newbie@test.com',
      password: 'StrongPass123!'
    })
    expect(r.ok).toBe(true)
    expect(store.users.some(u => u.email === 'newbie@test.com')).toBe(true)
  })

  it('permite cambiar de tenant activo', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const r = await store.setActiveTenant('tenant-b')
    // Wait, does admin have access to tenant-b in seed?
    // memberships: [{ userId: 'user-demo', tenantId: 'tenant-a', role: 'Administrador' }, { userId: 'user-demo', tenantId: 'tenant-b', role: 'Gerencia' }]
    // user-demo is admin@contex360.local
    expect(r.ok).toBe(true)
    expect(store.activeTenantId).toBe('tenant-b')
  })

  it('valida email duplicado al crear usuario', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const r = await store.createUser({
      name: 'Duplicate',
      email: 'admin@contex360.local', // Existing
      password: 'StrongPass123!',
      title: 'X',
      role: 'Visor'
    })
    expect(r.ok).toBe(false)
    expect(r.message).toContain('email')
  })

  it('bloquea cuenta tras multiples intentos fallidos', async () => {
    const user = store.users.find(u => u.id === 'user-accountant')
    
    // Simulate 5 failed attempts (default threshold is 5 in seed)
    for (let i = 0; i < 6; i++) {
      await store.login({
        email: user.email,
        password: 'wrong-password'
      })
    }

    const security = store.getSecurityProfile(user.id)
    expect(security.lockedUntil).not.toBeNull()

    const r = await store.login({
      email: user.email,
      password: buildDemoPassword(user.email)
    })
    expect(r.ok).toBe(false)
    expect(r.message).toContain('bloqueada')
  })

  it('importa productos desde CSV', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const csv = "sku,nombre,precio,costo,stock,categoria,unidad\nTEST-CSV-01,Test Product,100,50,10,Testing,unidad"
    const r = store.importProductsCSV(csv)
    expect(r.ok).toBe(true)
    expect(store.tenantProducts.some(p => p.sku === 'TEST-CSV-01')).toBe(true)
  })

  it('emite una factura', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const payload = {
      clientId: 'tp-1',
      items: [
        { productId: 'prod-1', subtotal: 100, taxAmount: 19 }
      ],
      paymentTermDays: 30
    }
    const r = await store.emitInvoice(payload)
    expect(r.ok).toBe(true)
  })

  it('gestiona seguridad de usuario: forzar reset, 2FA, clave temporal', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'
    const user = store.users.find(u => u.id === 'user-accountant')

    // Force Reset
    store.forcePasswordReset(user.id)
    expect(store.getSecurityProfile(user.id).passwordResetRequired).toBe(true)

    // Set 2FA Requirement
    store.setTwoFactorRequirement(user.id, true)
    expect(store.getSecurityProfile(user.id).twoFactorRequired).toBe(true)

    // Toggle 2FA Enabled
    const initial = store.getSecurityProfile(user.id).twoFactorEnabled
    store.toggleTwoFactorEnabled(user.id)
    expect(store.getSecurityProfile(user.id).twoFactorEnabled).toBe(!initial)

    // Temp Password
    const r = await store.generateTemporaryPasswordForUser(user.id)
    expect(r.ok).toBe(true)
    expect(r.detail).toBeDefined()
  })

  it('procesa desactivaciones programadas', async () => {
    const user = store.users.find(u => u.id === 'user-accountant')
    user.status = 'active'
    user.deactivateAt = new Date(Date.now() - 1000).toISOString() // Past

    const r = store.processScheduledDeactivations()
    expect(r.processed).toBeGreaterThan(0)
    expect(user.status).toBe('inactive')
  })

  it('bloquea login de usuario inactivo', async () => {
    const user = store.users.find(u => u.id === 'user-accountant')
    user.status = 'inactive'

    const r = await store.login({
      email: user.email,
      password: buildDemoPassword(user.email)
    })
    expect(r.ok).toBe(false)
    expect(r.message).toContain('habilitado')
  })

  it('ejecuta bulkUserAction: activate y change-role', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const userIds = ['user-accountant']
    // Deactivate first
    store.users.find(u => u.id === 'user-accountant').status = 'inactive'
    
    // Activate
    store.bulkUserAction({ userIds, action: 'activate' })
    expect(store.users.find(u => u.id === 'user-accountant').status).toBe('active')

    // Change Role
    store.bulkUserAction({ userIds, action: 'change-role', role: 'Gerencia' })
    expect(store.memberships.find(m => m.userId === 'user-accountant' && m.tenantId === 'tenant-a').role).toBe('Gerencia')
  })

  it('ejecuta panicLogoutAll', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    // Add some active sessions
    store.userSessions.push({ id: 's1', userId: 'u1', revokedAt: null })
    store.userSessions.push({ id: 's2', userId: 'u2', revokedAt: null })

    const r = store.panicLogoutAll()
    expect(r.ok).toBe(true)
    expect(store.userSessions.every(s => s.revokedAt)).toBe(true)
    expect(store.session.currentUserId).toBeNull()
  })

  it('ejecuta runOcr', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    const r1 = store.runOcr('FACTURA FE-123\nNIT: 900123456-1\nTOTAL: 150000')
    expect(r1.ok).toBe(true)
    expect(store.ocrRuns.length).toBeGreaterThan(0)
    expect(store.ocrRuns[0].fields.nit).toContain('900123456')

    // Error: empty source
    const r2 = store.runOcr('')
    expect(r2.ok).toBe(false)
  })

  it('proteccion de System Owner', async () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'
    
    // Find system owner (usually the first user in seed)
    const owner = store.users.find(u => u.isSystemOwner)
    const otherUser = store.users.find(u => !u.isSystemOwner)

    // Login as other user
    store.session.currentUserId = otherUser.id
    
    const error = store.protectSystemOwnerTarget(owner.id)
    expect(error.ok).toBe(false)
    expect(error.message).toContain('protegida')
  })

  it('should resend an invitation', () => {
    const admin = store.users.find(u => u.email === 'admin@contex360.local')
    store.session.currentUserId = admin.id
    store.activeTenantId = 'tenant-a'

    store.invitations = [{
      id: 'inv-1',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      role: 'Contador',
      status: 'pending',
      expiresAt: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      createdBy: 'Admin',
      resendCount: 0,
      resentAt: null
    }]
    const result = store.resendInvitation('inv-1')
    expect(result.ok).toBe(true)
    expect(store.invitations[0].resendCount).toBe(1)
    expect(store.invitations[0].resentAt).toBeDefined()
  })

  it('should perform bulk actions: force-reset and change-role', () => {
    const admin = store.users.find(u => u.id === 'user-demo')!
    store.session.currentUserId = admin.id
    
    // Test force-reset
    store.bulkUserAction({
      userIds: ['user-accountant'],
      action: 'force-reset'
    })
    const profile = store.ensureUserSecurity('user-accountant')
    expect(profile.passwordResetRequired).toBe(true)
    
    // Test change-role for a user without membership in a specific tenant
    store.bulkUserAction({
      userIds: ['user-visor'],
      action: 'change-role',
      role: 'Administrador',
      tenantId: 'tenant-new'
    })
    const membership = store.memberships.find(m => m.userId === 'user-visor' && m.tenantId === 'tenant-new')
    expect(membership?.role).toBe('Administrador')
  })
})
