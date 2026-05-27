import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { 
  ROLE_OPTIONS, 
  PERMISSION_MODULES, 
  PERMISSION_ACTIONS,
} from './rbacStore'

export { ROLE_OPTIONS, PERMISSION_MODULES, PERMISSION_ACTIONS }

export const useUsersStore = defineStore('users', () => {
  const root = useStateStore()

  const users = computed(() => root.users || [])
  const memberships = computed(() => root.memberships || [])
  const userSecurity = computed(() => root.userSecurity || [])
  const userSessions = computed(() => root.userSessions || [])
  const invitations = computed(() => root.invitations || [])
  const activeTenantId = computed(() => root.activeTenantId)
  const roleAccess = computed(() => root.roleAccess || {})
  const roleAccessHistory = computed(() => root.roleAccessHistory || [])
  const currentUser = computed(() => root.currentUser)
  const tenants = computed(() => root.tenants || [])
  const activeTenant = computed(() => root.activeTenant)
  const tenantUsers = computed(() => {
    const currentTenant = root.activeTenantId || (root.tenants[0]?.id || 'tenant-a')
    return (root.users || [])
      .filter(u => u.isSystemOwner || (root.memberships || []).some(m => m.userId === u.id && m.tenantId === currentTenant))
      .map(u => {
        const m = (root.memberships || []).find(mb => mb.userId === u.id && mb.tenantId === currentTenant) || (root.memberships || []).find(mb => mb.userId === u.id)
        return {
          ...u,
          role: m ? m.role : (u.isSystemOwner ? 'Super Admin' : 'Usuario local'),
          active: u.status === 'active'
        }
      })
  })

  async function fetchUsers(tenantId?: string) {
    if (!root.currentUser?.isSystemOwner) {
      if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
      try {
        const fetched = await businessApi.getUsers(root.activeTenantId)
        root.users = fetched
        await root.saveState()
        return { ok: true }
      } catch (err: any) {
        return { ok: false, message: err?.message || 'Error al obtener usuarios' }
      }
    }
    try {
      const fetchedUsers = await businessApi.getAdminUsers(tenantId)
      const adminUsers = ref<any[]>([])
      adminUsers.value = fetchedUsers
      const newRootUsers = [...root.users]
      fetchedUsers.forEach((fu: any) => {
        const idx = newRootUsers.findIndex(u => u.id === fu.id)
        if (idx >= 0) newRootUsers[idx] = fu
        else newRootUsers.push(fu)
      })
      root.users = newRootUsers
      await root.saveState()
      return { ok: true, adminUsers: adminUsers.value }
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al obtener usuarios' }
    }
  }

  async function toggleUserStatus(userId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      const result = await businessApi.toggleUserStatus(userId, root.activeTenantId)
      await fetchUsers()
      return result
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al cambiar estado.' }
    }
  }

  async function forcePasswordReset(userId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.forcePasswordReset(userId, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al forzar reinicio.' }
    }
  }

  async function generateTemporaryPasswordForUser(userId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.generateTempPassword(userId, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al generar contraseña.' }
    }
  }

  async function setTwoFactorRequirement(userId: string, required: boolean) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.setTwoFactorRequirement(userId, required, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al configurar 2FA.' }
    }
  }

  async function toggleTwoFactorEnabled(userId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.toggleTwoFactor(userId, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al cambiar 2FA.' }
    }
  }

  async function revokeUserSessions(userId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.revokeUserSessions(userId, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al revocar sesiones.' }
    }
  }

  async function revokeSession(sessionId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.revokeSession(sessionId, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al revocar sesión.' }
    }
  }

  async function upsertMembership(payload: { userId: string; tenantId: string; role: string }) {
    try {
      return await businessApi.upsertMembership(payload.userId, payload.tenantId, payload.role)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al actualizar membresía.' }
    }
  }

  async function removeMembership(payload: { userId: string; tenantId: string }) {
    try {
      return await businessApi.removeMembership(payload.userId, payload.tenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al revocar acceso.' }
    }
  }

  async function createInvitation(payload: any) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.createInvitation(payload.email, payload.role, payload.tenantId || root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al crear invitación.' }
    }
  }

  async function resendInvitation(invitationId: string) {
    try {
      return await businessApi.resendInvitation(invitationId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al reenviar invitación.' }
    }
  }

  async function trustSessionFingerprint(sessionId: string) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.trustSessionFingerprint(sessionId, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al confiar dispositivo.' }
    }
  }

  async function generateRecoveryCodes() {
    try {
      return await businessApi.generateRecoveryCodes()
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al generar códigos.' }
    }
  }

  async function scheduleUserDeactivation(payload: any) {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    try {
      return await businessApi.scheduleUserDeactivation(payload.userId, payload.at, root.activeTenantId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error al programar baja.' }
    }
  }

  function panicLogoutAll() {
    if (!root.activeTenantId) return { ok: false, message: 'No hay tenant activo.' }
    businessApi.panicRevokeAll(root.activeTenantId).catch(() => {})
    return { ok: true, message: 'Todas las sesiones están siendo revocadas.' }
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

  async function createUser(payload: any) {
    try {
      const response = await businessApi.createUser(payload)
      if (response && response.ok && response.user) {
        root.users.push(response.user as any)
        if (payload.tenantId && payload.role) {
          root.memberships.push({
            userId: response.user.id,
            tenantId: payload.tenantId,
            role: payload.role,
          })
        }
        await root.saveState()
        return {
          ok: true,
          message: 'Usuario creado.',
          detail: 'Se requiere cambio de contraseña en el primer ingreso.',
          tempPassword: response.tempPassword,
          user: response.user,
        }
      }
      return { ok: false, message: response?.message || 'Error al crear usuario.' }
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error de red.' }
    }
  }

  async function anonymizeUser(userId: string) {
    try {
      return await businessApi.anonymizeUser(userId)
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Error de red.' }
    }
  }

  function bulkUserAction(payload: { userIds: string[]; action: string; role?: string; tenantId?: string }) {
    Promise.all(payload.userIds.map(async (id) => {
      try {
        if (payload.action === 'activate' || payload.action === 'deactivate') {
          if (payload.action === 'deactivate') {
            return businessApi.toggleUserStatus(id, payload.tenantId || root.activeTenantId)
          }
        }
        if (payload.action === 'require-2fa') {
          return businessApi.setTwoFactorRequirement(id, true, payload.tenantId || root.activeTenantId)
        }
      } catch { /* best effort */ }
    }))
    return { ok: true, message: `${payload.userIds.length} usuarios procesados.` }
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
    tenants,
    activeTenant,
    tenantUsers,
    fetchUsers,
    createUser,
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
    saveState: async () => await root.saveState(),
    canManageUsers: computed(() => root.can('manage_users')),
  }
})
