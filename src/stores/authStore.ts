import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  loginWithBackend as apiLoginWithBackend,
  revokeBackendSession,
  acceptPrivacyPolicy as apiAcceptPrivacy,
} from '../services/authApi'
import { encryptData } from '../utils/security'
import { useStateStore } from './stateStore'
import { uid } from '../utils/storeHelpers'

export const useAuthStore = defineStore('auth', () => {
  const root = useStateStore()

  const isLoading = ref(false)
  const authError = ref<string | null>(null)
  const isSessionExpired = ref(false)
  const requiresPrivacyConsent = ref(false)

  const currentUser = computed(() => root.currentUser)
  const isAuthenticated = computed(() => !!currentUser.value)
  const activeMembership = computed(() => root.activeMembership)
  const activeTenant = computed(() => root.activeTenant)
  const accessibleTenants = computed(() => root.tenants || [])
  const activeView = computed(() => root.activeView)
  const subscription = computed(() => root.subscription)
  const isSystemOwner = computed(() => !!currentUser.value?.isSystemOwner)
  const isAdmin = computed(() => isSystemOwner.value || activeMembership.value?.role === 'Administrador')

  const visibleViews = computed(() => {
    if (isSystemOwner.value) {
      return ['dashboard', 'billing', 'purchases', 'quotes', 'treasury', 'inventory', 'accounting', 'third-parties', 'users', 'reports', 'ai', 'admin-console', 'help-center', 'subscription', 'profile', 'about']
    }
    const role = activeMembership.value?.role
    if (!role) return ['dashboard', 'help-center', 'subscription', 'profile', 'about']
    const definitions: any = {
      'Administrador': ['dashboard', 'billing', 'purchases', 'quotes', 'treasury', 'inventory', 'accounting', 'third-parties', 'users', 'reports', 'ai', 'admin-console', 'help-center', 'subscription', 'profile', 'about'],
      'Contador': ['dashboard', 'billing', 'purchases', 'quotes', 'treasury', 'inventory', 'accounting', 'third-parties', 'reports', 'help-center', 'subscription', 'profile', 'about'],
      'Visor': ['dashboard', 'billing', 'purchases', 'quotes', 'inventory', 'accounting', 'third-parties', 'reports', 'help-center', 'subscription', 'profile', 'about'],
      'Operador': ['dashboard', 'billing', 'inventory', 'third-parties', 'help-center', 'subscription', 'profile', 'about']
    }
    return definitions[role] || ['dashboard', 'help-center', 'subscription', 'profile', 'about']
  })

  async function loginWithBackend(credentials: { 
    email: string; 
    password: string; 
    totpCode?: string;
    privacyAccepted?: boolean;
    rememberMe?: boolean;
  }) {
    isLoading.value = true
    authError.value = null
    const activeTenantId = root.activeTenantId || 'tenant-a'

    // Handle "Remember Me" persistence
    if (credentials.rememberMe) {
      try {
        const encrypted = await encryptData(credentials.email)
        localStorage.setItem('contex360-remember-email', encrypted)
      } catch {
        localStorage.removeItem('contex360-remember-email')
      }
    } else {
      localStorage.removeItem('contex360-remember-email')
    }

    try {
      const response = await apiLoginWithBackend(credentials)
      if ((response as any).requiresTotp) {
        return { ok: false, requiresTotp: true, message: response.message }
      }
      if ((response as any).requiresPasswordChange) {
        return { ok: false, requiresPasswordChange: true, message: response.message, resetToken: (response as any).resetToken }
      }
      if ((response as any).requiresPrivacyConsent) {
        requiresPrivacyConsent.value = true
        return { ok: false, requiresPrivacyConsent: true, message: response.message }
      }

      if (response.user) {
        const existingIndex = root.users.findIndex(u => u.id === response.user.id)
        if (existingIndex !== -1) {
          root.users[existingIndex] = { ...root.users[existingIndex], ...response.user } as any
        } else {
          root.users.push(response.user as any)
        }
        root.session.currentUserId = response.user.id
        root.session.currentSessionId = response.session?.id || uid('sess')
        root.activeTenantId = response.activeTenantId || activeTenantId
        if (response.memberships) root.memberships = response.memberships as any
        root.subscription = (response as any).subscription || null
        isSessionExpired.value = false
        await root.saveState()
        return { ok: true, user: response.user }
      }
      return { ok: false, message: response.message || 'Usuario no encontrado.' }
    } catch (error: any) {
      authError.value = error.message || 'Error de conexión con el servidor'
      return { ok: false, message: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  async function reauthenticate(password: string) {
    if (!currentUser.value) return { ok: false, message: 'No hay una sesión activa para recuperar.' }
    isLoading.value = true
    try {
      const response = await apiLoginWithBackend({
        email: currentUser.value.email,
        password
      })
      if (response.user) {
        isSessionExpired.value = false
        await root.saveState()
        return { ok: true }
      }
      return { ok: false, message: 'Contraseña incorrecta.' }
    } catch (error: any) {
      return { ok: false, message: error.message || 'Error al re-autenticar.' }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await revokeBackendSession()
    } catch {
      // Best effort: still clear the local app state even if the backend call fails.
    } finally {
      root.session.currentUserId = null
      root.session.currentSessionId = null
      isSessionExpired.value = false
      await root.setActiveView('dashboard')
      await root.saveState()
    }
  }

  async function refreshSessionWithBackend() {
    const ok = await root.refreshSessionWithBackend()
    if (!ok) isSessionExpired.value = true
    return ok
  }

  async function acceptPrivacyPolicy(version: string) {
    try {
      const result = await apiAcceptPrivacy(version)
      if (result.ok) {
        requiresPrivacyConsent.value = false
        return { ok: true, message: result.message }
      }
      return { ok: false, message: result.message }
    } catch (error: any) {
      return { ok: false, message: error.message || 'Error al aceptar la política.' }
    }
  }

  return {
    isLoading,
    authError,
    isSessionExpired,
    requiresPrivacyConsent,
    currentUser,
    isAuthenticated,
    loginWithBackend,
    reauthenticate,
    logout,
    refreshSessionWithBackend,
    acceptPrivacyPolicy,
    visibleViews,
    activeMembership,
    activeView,
    isSystemOwner,
    isAdmin,
    activeTenant,
    accessibleTenants,
    subscription,
    checkCurrentSessionHealth: () => root.checkCurrentSessionHealth(),
    processScheduledDeactivations: () => root.processScheduledDeactivations(),
    setActiveView: (view: string) => root.setActiveView(view),
    setActiveTenant: (tenantId: string) => root.setActiveTenant(tenantId),
  }
})
