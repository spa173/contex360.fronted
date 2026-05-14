import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { uid, appendAuditEvent } from '../utils/storeHelpers'
import { createPasswordCredentials } from './stateSecurity'
import { 
  ROLE_OPTIONS, 
  PERMISSION_MODULES, 
  PERMISSION_ACTIONS,
  getMembershipsForUser, 
  getMembershipForTenant 
} from './rbacStore'

export { ROLE_OPTIONS, PERMISSION_MODULES, PERMISSION_ACTIONS }

export const useUsersStore = defineStore('users', () => {
  const root = useStateStore()

  // Getters
  const users = computed(() => root.users)
  const memberships = computed(() => root.memberships)
  const userSecurity = computed(() => root.userSecurity)
  const userSessions = computed(() => root.userSessions)
  const invitations = computed(() => root.invitations)
  const activeTenantId = computed(() => root.activeTenantId)
  const roleAccess = computed(() => root.roleAccess)
  const roleAccessHistory = computed(() => root.roleAccessHistory)
  const currentUser = computed(() => root.currentUser)

  // Actions
  function toggleUserStatus(userId: string) {
    const user = root.users.find(u => u.id === userId)
    if (!user) return { ok: false, message: 'Usuario no encontrado.' }
    user.status = user.status === 'active' ? 'inactive' : 'active'
    appendAuditEvent(root.$state, {
      entity: 'usuario',
      action: user.status === 'active' ? 'Activar' : 'Desactivar',
      description: `Estado de ${user.name} cambiado a ${user.status}.`,
      actor: root.currentUser?.name || 'Sistema',
    })
    root.saveState()
    return { ok: true, message: 'Estado actualizado.' }
  }

  function forcePasswordReset(userId: string) {
    const sec = root.userSecurity.find(s => s.userId === userId)
    if (sec) sec.passwordResetRequired = true
    root.saveState()
    return { ok: true, message: 'Reinicio de contraseña forzado.' }
  }

  async function generateTemporaryPasswordForUser(userId: string) {
    const user = root.users.find(u => u.id === userId)
    if (!user) return { ok: false, message: 'Usuario no encontrado.' }
    const tempPass = Math.random().toString(36).slice(-8)
    const creds = await createPasswordCredentials(tempPass)
    const sec = root.userSecurity.find(s => s.userId === userId)
    if (sec) {
      sec.passwordHash = creds.passwordHash
      sec.passwordSalt = creds.passwordSalt
      sec.tempPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
    root.saveState()
    return { ok: true, message: `Contraseña temporal: ${tempPass}`, detail: 'Válida por 24h.' }
  }

  function setTwoFactorRequirement(userId: string, required: boolean) {
    const sec = root.userSecurity.find(s => s.userId === userId)
    if (sec) sec.twoFactorRequired = required
    root.saveState()
    return { ok: true, message: required ? '2FA requerido.' : '2FA opcional.' }
  }

  function toggleTwoFactorEnabled(userId: string) {
    const sec = root.userSecurity.find(s => s.userId === userId)
    if (sec) sec.twoFactorEnabled = !sec.twoFactorEnabled
    root.saveState()
    return { ok: true, message: 'Estado 2FA cambiado.' }
  }

  function revokeUserSessions(userId: string) {
    root.userSessions.forEach(s => {
      if (s.userId === userId && !s.revokedAt) s.revokedAt = new Date().toISOString()
    })
    root.saveState()
    return { ok: true, message: 'Sesiones revocadas.' }
  }

  function revokeSession(sessionId: string) {
    const sess = root.userSessions.find(s => s.id === sessionId)
    if (sess) sess.revokedAt = new Date().toISOString()
    root.saveState()
    return { ok: true, message: 'Sesión terminada.' }
  }

  function upsertMembership(payload: { userId: string, tenantId: string, role: string }) {
    const existing = root.memberships.find(m => m.userId === payload.userId && m.tenantId === payload.tenantId)
    if (existing) existing.role = payload.role
    else root.memberships.push(payload)
    root.saveState()
    return { ok: true, message: 'Membresía actualizada.' }
  }

  function removeMembership(payload: { userId: string, tenantId: string }) {
    root.memberships = root.memberships.filter(m => !(m.userId === payload.userId && m.tenantId === payload.tenantId))
    root.saveState()
    return { ok: true, message: 'Acceso revocado.' }
  }

  function bulkUserAction(payload: { userIds: string[], action: string, role?: string, tenantId?: string }) {
    let affected = 0
    payload.userIds.forEach(id => {
      if (payload.action === 'activate' || payload.action === 'deactivate') toggleUserStatus(id)
      else if (payload.action === 'require-2fa') setTwoFactorRequirement(id, true)
      affected++
    })
    root.saveState()
    return { ok: true, message: `${affected} usuarios procesados.` }
  }

  function createInvitation(payload: any) {
    const inv = {
      id: uid('inv'),
      ...payload,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    }
    root.invitations.unshift(inv)
    root.saveState()
    return { ok: true, message: 'Invitación enviada.' }
  }

  function resendInvitation(invitationId: string) {
    const inv = root.invitations.find(i => i.id === invitationId)
    if (inv) inv.createdAt = new Date().toISOString()
    root.saveState()
    return { ok: true, message: 'Invitación reenviada.' }
  }

  function trustSessionFingerprint(sessionId: string) {
    const sess = root.userSessions.find(s => s.id === sessionId)
    if (sess) {
      const sec = root.userSecurity.find(s => s.userId === sess.userId)
      if (sec) {
        if (!sec.trustedFingerprints) sec.trustedFingerprints = []
        sec.trustedFingerprints.push(sess.fingerprint)
      }
    }
    root.saveState()
    return { ok: true, message: 'Dispositivo marcado como confiable.' }
  }

  function generateRecoveryCodes() {
    const codes = Array.from({ length: 8 }, () => Math.random().toString(36).slice(-10).toUpperCase())
    root.saveState()
    return { ok: true, message: 'Nuevos códigos generados.', codes }
  }

  function scheduleUserDeactivation(payload: any) {
    appendAuditEvent(root.$state, {
      entity: 'usuario',
      action: 'Programar Baja',
      description: `Baja programada para usuario ${payload.userId} el ${payload.at}.`,
      actor: root.currentUser?.name || 'Sistema',
    })
    root.saveState()
    return { ok: true, message: 'Desactivación programada.' }
  }

  function exportUsers() {
    const content = "Nombre,Email,Status\n" + root.users.map(u => `${u.name},${u.email},${u.status}`).join("\n")
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'usuarios.csv'
    a.click()
    return { ok: true, message: 'Exportación iniciada.' }
  }

  function panicLogoutAll() {
    root.userSessions.forEach(s => { if (!s.revokedAt) s.revokedAt = new Date().toISOString() })
    root.saveState()
    return { ok: true, message: 'Todas las sesiones revocadas.' }
  }

  return {
    users,
    memberships,
    userSecurity,
    userSessions,
    invitations,
    activeTenantId,
    roleAccess,
    roleAccessHistory,
    currentUser,
    toggleUserStatus,
    forcePasswordReset,
    generateTemporaryPasswordForUser,
    setTwoFactorRequirement,
    toggleTwoFactorEnabled,
    revokeUserSessions,
    revokeSession,
    upsertMembership,
    removeMembership,
    bulkUserAction,
    createInvitation,
    resendInvitation,
    trustSessionFingerprint,
    generateRecoveryCodes,
    scheduleUserDeactivation,
    exportUsers,
    panicLogoutAll,
    canManageUsers: computed(() => root.can('manage_users')),
  }
})
