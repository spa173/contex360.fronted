import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  loginWithBackend,
  getAuthToken,
  storeAuthToken,
  clearAuthToken,
  refreshAccessToken,
} from '../services/authApi'
import { businessApi } from '../services/businessApi'
import { useStateStore } from './stateStore'
import { useTenantStore } from './tenantStore'

/**
 * Auth Store - Maneja la lógica de JWT, Login, Logout y TOTP
 * Extraído de stateStore.ts para mejorar mantenibilidad
 */

export interface AuthState {
  currentUserId: string | null
  currentSessionId: string | null
  lastLoginAt: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // Composición con otros stores
  const stateStore = useStateStore()
  const tenantStore = useTenantStore()

  // State local
  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  // Getters
  const currentUser = computed(() => stateStore.currentUser)
  const isAuthenticated = computed(() => !!currentUser.value)
  const currentUserId = computed(() => stateStore.session?.currentUserId || null)

  /**
   * Login con credenciales locales o backend
   */
  async function login(credentials: { email: string; password: string; totpCode?: string }) {
    isLoading.value = true
    authError.value = null

    try {
      const result = await stateStore.login(credentials)
      if (result.ok) {
        // Sincronizar con tenantStore
        tenantStore.switchToDefaultTenant()
      }
      return result
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'Error de autenticación'
      return { ok: false, message: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login con backend remoto (JWT)
   */
  async function loginWithBackendJWT(credentials: Record<string, string>) {
    isLoading.value = true
    authError.value = null

    try {
      const result = await stateStore.loginWithBackend(credentials)
      if (result.ok) {
        tenantStore.switchToDefaultTenant()
      }
      return result
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'Error de conexión'
      return { ok: false, message: authError.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login como usuario demo
   */
  function loginDemo(userId: string) {
    return stateStore.loginDemoUser(userId)
  }

  /**
   * Refrescar sesión con backend
   */
  async function refreshSession() {
    return await stateStore.refreshSessionWithBackend()
  }

  /**
   * Verificar health de la sesión actual
   */
  async function checkSessionHealth(): Promise<{ ok: boolean; message: string }> {
    const result = await stateStore.checkCurrentSessionHealth()
    return { ok: Boolean(result), message: result ? 'Sesión activa' : 'Sesión inválida' }
  }

  /**
   * Logout - limpia tokens y estado
   */
  async function logout() {
    // Revocar sesión en backend si existe
    try {
      const { revokeBackendSession } = await import('../services/authApi')
      await revokeBackendSession()
    } catch (error) {
      console.error('Error during backend logout:', error)
    } finally {
      // Limpiar token JWT
      clearAuthToken()
      // Resetear estado
      stateStore.resetState()
      tenantStore.clearTenantState()
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async function register(payload: {
    name: string
    email: string
    password: string
    tenantId?: string
  }) {
    return await stateStore.registerUser(payload)
  }

  /**
   * Actualizar datos del usuario actual
   */
  function updateCurrentUser(data: Record<string, unknown>) {
    stateStore.updateCurrentUser(data)
  }

  /**
   * Verificar si tiene permiso específico
   */
  function can(permission: string): boolean {
    return stateStore.can(permission)
  }

  /**
   * Verificar si es rol de solo lectura
   */
  function isReadOnly(): boolean {
    return stateStore.isReadOnly()
  }

  // TOTP / Two Factor Authentication helpers

  /**
   * Verificar si 2FA es requerido para el usuario
   */
  function isTwoFactorRequired(): boolean {
    const currentUserId = stateStore.session?.currentUserId
    if (!currentUserId) return false
    const securityProfile = stateStore.userSecurity.find((s: any) => s.userId === currentUserId)
    return securityProfile?.twoFactorRequired || false
  }

  /**
   * Verificar si 2FA está habilitado para el usuario
   */
  function isTwoFactorEnabled(): boolean {
    const currentUserId = stateStore.session?.currentUserId
    if (!currentUserId) return false
    const securityProfile = stateStore.userSecurity.find((s: any) => s.userId === currentUserId)
    return securityProfile?.twoFactorEnabled || false
  }

  /**
   * Habilitar/deshabilitar 2FA
   */
  async function toggleTwoFactor(userId: string) {
    return stateStore.toggleTwoFactorEnabled(userId)
  }

  /**
   * Establecer requerimiento de 2FA
   */
  async function setTwoFactorRequirement(userId: string, required: boolean) {
    return stateStore.setTwoFactorRequirement(userId, required)
  }

  // Compatibilidad temporal: re-exportar funciones del stateStore
  return {
    // State
    isLoading: computed(() => isLoading.value),
    authError: computed(() => authError.value),
    // Getters
    currentUser,
    currentUserId,
    isAuthenticated,
    // Core Auth
    login,
    loginWithBackend: loginWithBackendJWT,
    loginDemoUser: loginDemo,
    refreshSessionWithBackend: refreshSession,
    checkCurrentSessionHealth: checkSessionHealth,
    logout,
    registerUser: register,
    updateCurrentUser,
    can,
    isReadOnly,
    // 2FA / TOTP
    isTwoFactorRequired,
    isTwoFactorEnabled,
    toggleTwoFactorEnabled: toggleTwoFactor,
    setTwoFactorRequirement,
    // Legacy compatibility
    setActiveTenant: stateStore.setActiveTenant,
    setActiveView: stateStore.setActiveView,
    resetState: stateStore.resetState,
    processScheduledDeactivations: stateStore.processScheduledDeactivations,
    // Direct access to composed stores (for advanced use)
    stateStore,
    tenantStore,
  }
})
