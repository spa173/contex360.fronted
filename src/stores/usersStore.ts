import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export {
  DEFAULT_ROLE_ACCESS,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_OPTIONS,
} from './rbacStore'

export const useUsersStore = defineStore('users', () => {
  const state = useStateStore()

  return {
    activeTenantId: computed(() => state.activeTenantId),
    activeTenant: computed(() => state.activeTenant),
    currentUser: computed(() => state.currentUser),
    currentClientIp: computed(() => state.currentClientIp),
    isCurrentUserSystemOwner: computed(() => state.isCurrentUserSystemOwner),
    activeMembership: computed(() => state.activeMembership),
    users: computed(() => state.users),
    memberships: computed(() => state.memberships),
    roleAccess: computed(() => state.roleAccess),
    roleAccessHistory: computed(() => state.roleAccessHistory),
    userOnboardingTasks: computed(() => state.userOnboardingTasks),
    userSecurity: computed(() => state.userSecurity),
    userSessions: computed(() => state.userSessions),
    invitations: computed(() => state.invitations),
    auditEvents: computed(() => state.auditEvents),
    usersForActiveTenant: computed(() => state.usersForActiveTenant),
    tenants: computed(() => state.tenants),
    createUser: state.createUser,
    assignMembership: state.assignMembership,
    upsertMembership: state.upsertMembership,
    removeMembership: state.removeMembership,
    toggleUserStatus: state.toggleUserStatus,
    forcePasswordReset: state.forcePasswordReset,
    generateTemporaryPasswordForUser: state.generateTemporaryPasswordForUser,
    setTwoFactorRequirement: state.setTwoFactorRequirement,
    toggleTwoFactorEnabled: state.toggleTwoFactorEnabled,
    revokeSession: state.revokeSession,
    revokeUserSessions: state.revokeUserSessions,
    updateRolePermission: state.updateRolePermission,
    restorePreviousRoleAccessVersion: state.restorePreviousRoleAccessVersion,
    duplicateRolePermissions: state.duplicateRolePermissions,
    trustSessionFingerprint: state.trustSessionFingerprint,
    generateRecoveryCodes: state.generateRecoveryCodes,
    scheduleUserDeactivation: state.scheduleUserDeactivation,
    bulkUserAction: state.bulkUserAction,
    createInvitation: state.createInvitation,
    resendInvitation: state.resendInvitation,
    panicLogoutAll: state.panicLogoutAll,
    exportUsers: state.exportUsers,
    hydrateState: state.hydrateState,
    saveState: state.saveState,
    canManageUsers: computed(() => state.can('manage_users')),
  }
})
