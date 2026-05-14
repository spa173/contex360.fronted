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

  const visibleViews = computed(() => {
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
    
    console.log('[DEBUG] Login Request:', {
      email: credentials.email,
      password: '***',
      activeTenantId: activeTenantId,
      hasTotp: !!credentials.totpCode
    })

    try {
      // Intentar login con el Backend Real
      try {
        const response = await apiLoginWithBackend(credentials)
        console.log('[DEBUG] Backend Login Success:', response)
        
        // Actualizar estado local con datos del backend
        if (response.user) {
          // Si el usuario no existe localmente lo agregamos para la reactividad
          const exists = root.users.find(u => u.id === response.user.id)
          if (!exists) root.users.push(response.user as any)
          
          root.session.currentUserId = response.user.id
          root.session.currentSessionId = response.session?.id || uid('sess')
          root.activeTenantId = response.activeTenantId || activeTenantId
          
          // Sincronizar membresias si vienen del backend
          if (response.memberships) {
            root.memberships = response.memberships as any
          }

          root.saveState()
          return { ok: true, user: response.user }
        }
      } catch (backendError: any) {
        console.warn('[DEBUG] Backend Login Failed:', backendError.message)
        
        // Si el error es 401 o Not Found, limpiar tenant por si es basura antigua
        if (backendError.message.includes('401') || backendError.message.toLowerCase().includes('not found') || backendError.message.toLowerCase().includes('no encontrado')) {
           console.log('[DEBUG] Cleaning legacy tenant state due to auth failure')
           localStorage.removeItem('contex360-active-tenant')
           root.activeTenantId = 'tenant-a' 
        }

        // Fallback a login local si el backend falla o es una cuenta de seed
        const user = root.users.find(u => u.email === credentials.email)
        if (user && user.isDemoAccount) {
          const isValid = await verifyPassword(user, credentials.password)
          if (isValid) {
            root.session.currentUserId = user.id
            root.session.currentSessionId = uid('sess')
            root.activeTenantId = activeTenantId
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
  }

  async function refreshSessionWithBackend() {
    return await root.refreshSessionWithBackend()
  }

  return {
    isLoading,
    authError,
    currentUser,
    isAuthenticated,
    loginWithBackend,
    logout,
    refreshSessionWithBackend,
    visibleViews,
    activeMembership,
    activeView,
  }
})
