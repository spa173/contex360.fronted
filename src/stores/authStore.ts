import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRBACStore } from './rbacStore'
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
import { uid, appendAuditEvent } from '../utils/storeHelpers'

export const useAuthStore = defineStore('auth', () => {
  const root = useStateStore()

  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  const currentUser = computed(() => root.currentUser)
  const isAuthenticated = computed(() => !!currentUser.value)
  const activeMembership = computed(() => root.activeMembership)
  const activeView = computed(() => root.activeView)
  const activeTenantId = computed(() => root.activeTenantId)
  const activeTenant = computed(() => root.activeTenant)
  const accessibleTenants = computed(() => root.tenants)

  const visibleViews = computed(() => {
    // Si es System Owner (Root), tiene acceso a TODO por definición
    if (currentUser.value?.isSystemOwner) {
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
    
    const tenantIdForRequest = root.activeTenantId || 'tenant-a'
    
    try {
      // Intentar login con el Backend Real
      try {
        const response = await apiLoginWithBackend(credentials)
        
        if (response.user) {
          const exists = root.users.find(u => u.id === response.user.id)
          if (!exists) {
            root.users.push({
              ...response.user,
              status: response.user.status || 'active',
              isSystemOwner: !!response.user.isSystemOwner,
              isDemoAccount: !!response.user.isDemoAccount
            } as any)
          } else {
            // Actualizar propiedades críticas si cambiaron en el backend
            exists.isSystemOwner = !!response.user.isSystemOwner
            exists.status = response.user.status || 'active'
          }
          
          root.session.currentUserId = response.user.id
          root.session.currentSessionId = response.session?.id || uid('sess')
          root.activeTenantId = response.activeTenantId || tenantIdForRequest
          
          if (response.memberships) {
            root.memberships = response.memberships as any
          }
          
          if (response.accessibleTenants) {
            root.tenants = response.accessibleTenants as any
          }

          root.saveState()
          return { ok: true, user: response.user }
        }
      } catch (backendError: any) {
        // Fallback a login local
        const user = root.users.find(u => u.email === credentials.email)
        if (user && user.isDemoAccount) {
          const isValid = await verifyPassword(user, credentials.password)
          if (isValid) {
            root.session.currentUserId = user.id
            root.session.currentSessionId = uid('sess')
            root.activeTenantId = tenantIdForRequest
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
    root.setActiveView('dashboard')
    root.saveState()
    return { ok: true }
  }

  function setActiveView(viewId: string) {
    if (visibleViews.value.includes(viewId)) {
      root.setActiveView(viewId)
      return { ok: true }
    }
    return { ok: false, message: 'No tienes permisos para ver esta sección.' }
  }

  function setActiveTenant(tenantId: string) {
    root.setActiveTenant(tenantId)
    return { ok: true }
  }

  function checkCurrentSessionHealth() {
    if (!isAuthenticated.value) return { revoked: true, message: 'Sesión expirada' }
    return { revoked: false }
  }

  function processScheduledDeactivations() {
    // Logic for scheduled deactivations if needed
  }

  async function refreshSessionWithBackend() {
    return await root.refreshSessionWithBackend()
  }

  return {
    isLoading,
    authError,
    currentUser,
    isAuthenticated,
    activeTenantId,
    activeTenant,
    accessibleTenants,
    loginWithBackend,
    logout,
    setActiveView,
    setActiveTenant,
    refreshSessionWithBackend,
    checkCurrentSessionHealth,
    processScheduledDeactivations,
    visibleViews,
    activeMembership,
    activeView,
  }
})
