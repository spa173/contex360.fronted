import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export const useAuthStore = defineStore('auth', () => {
  const state = useStateStore()

  return {
    activeTenantId: computed(() => state.activeTenantId),
    activeView: computed(() => state.activeView),
    currentUser: computed(() => state.currentUser),
    activeTenant: computed(() => state.activeTenant),
    users: computed(() => state.users),
    memberships: computed(() => state.memberships),
    tenants: computed(() => state.tenants),
    accessibleTenants: computed(() => state.accessibleTenants),
    activeMembership: computed(() => state.activeMembership),
    rolePermissions: computed(() => state.rolePermissions),
    visibleViews: computed(() => state.visibleViews),
    login: state.login,
    loginWithBackend: state.loginWithBackend,
    refreshSessionWithBackend: state.refreshSessionWithBackend,
    loginDemoUser: state.loginDemoUser,
    registerUser: state.registerUser,
    logout: state.logout,
    setActiveTenant: state.setActiveTenant,
    setActiveView: state.setActiveView,
    updateCurrentUser: state.updateCurrentUser,
    resetState: state.resetState,
    can: state.can,
    checkCurrentSessionHealth: state.checkCurrentSessionHealth,
    processScheduledDeactivations: state.processScheduledDeactivations,
  }
})
