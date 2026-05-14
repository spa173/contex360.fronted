import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getAuthToken,
  storeAuthToken,
  clearAuthToken,
  refreshAccessToken,
  loginWithBackend as apiLoginWithBackend
} from '../services/authApi'
import { businessApi } from '../services/businessApi'
import { useStateStore } from './stateStore'
import { verifyPassword } from './stateSecurity'
import { uid } from '../utils/storeHelpers'

export const useAuthStore = defineStore('auth', () => {
  const root = useStateStore()

  const isLoading = ref(false)
  const authError = ref<string | null>(null)
  const isSessionExpired = ref(false)

  const currentUser = computed(() => root.currentUser)
  const isAuthenticated = computed(() => !!currentUser.value)
  const activeMembership = computed(() => root.activeMembership)
  const activeView = computed(() => root.activeView)
  const isSystemOwner = computed(() => !!currentUser.value?.isSystemOwner)
  const isAdmin = computed(() => isSystemOwner.value || activeMembership.value?.role === 'Administrador')

  const visibleViews = computed(() => {
    if (isSystemOwner.value) {
      return ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'users', 'ai', 'admin-console', 'profile']
    }
    const role = activeMembership.value?.role
    if (!role) return ['dashboard', 'profile']
    const definitions: any = {
      'Administrador': ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'users', 'ai', 'admin-console', 'profile'],
      'Contador': ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'profile'],
      'Visor': ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'profile']
    }
    return definitions[role] || ['dashboard', 'profile']
  })

  async function loginWithBackend(credentials: { email: string; password: string; totpCode?: string }) {
    isLoading.value = true
    authError.value = null
    const activeTenantId = root.activeTenantId || 'tenant-a'

    try {
      try {
        const response = await apiLoginWithBackend(credentials)
        if (response.user) {
          const exists = root.users.find(u => u.id === response.user.id)
          if (!exists) root.users.push(response.user as any)
          root.session.currentUserId = response.user.id
          root.session.currentSessionId = response.session?.id || uid('sess')
          root.activeTenantId = response.activeTenantId || activeTenantId
          if (response.memberships) root.memberships = response.memberships as any
          isSessionExpired.value = false
          root.saveState()
          return { ok: true, user: response.user }
        }
      } catch (backendError: any) {
        const user = root.users.find(u => u.email === credentials.email)
        if (user && user.isDemoAccount) {
          const isValid = await verifyPassword(user, credentials.password)
          if (isValid) {
            root.session.currentUserId = user.id
            root.session.currentSessionId = uid('sess')
            root.activeTenantId = activeTenantId
            isSessionExpired.value = false
            root.saveState()
            return { ok: true, user }
          }
        }
        return { ok: false, message: backendError.message || 'Usuario no encontrado.' }
      }
      return { ok: false, message: 'Usuario no encontrado.' }
    } catch (error: any) {
      authError.value = error.message || 'Error de conexión con el servidor'
      return { ok: false, message: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    root.session.currentUserId = null
    root.session.currentSessionId = null
    clearAuthToken()
    isSessionExpired.value = false
    root.setActiveView('dashboard')
    root.saveState()
  }

  async function refreshSessionWithBackend() {
    const ok = await root.refreshSessionWithBackend()
    if (!ok) isSessionExpired.value = true
    return ok
  }

  return {
    isLoading,
    authError,
    isSessionExpired,
    currentUser,
    isAuthenticated,
    loginWithBackend,
    logout,
    refreshSessionWithBackend,
    visibleViews,
    activeMembership,
    activeView,
    isSystemOwner,
    isAdmin,
    checkCurrentSessionHealth: () => root.checkCurrentSessionHealth(),
    processScheduledDeactivations: () => root.processScheduledDeactivations(),
    setActiveView: (view: string) => root.setActiveView(view),
    setActiveTenant: (tenantId: string) => root.setActiveTenant(tenantId),
  }
})
