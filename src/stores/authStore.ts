import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getAuthToken,
  storeAuthToken,
  clearAuthToken,
  refreshAccessToken,
} from '../services/authApi'
import { businessApi } from '../services/businessApi'
import { useStateStore } from './stateStore'
import { verifyPassword, createPasswordCredentials } from './stateSecurity'
import { uid, appendAuditEvent } from '../utils/storeHelpers'

export const useAuthStore = defineStore('auth', () => {
  const root = useStateStore()

  const isLoading = ref(false)
  const authError = ref<string | null>(null)

  const currentUser = computed(() => root.currentUser)
  const isAuthenticated = computed(() => !!currentUser.value)

  async function login(credentials: { email: string; password: string; totpCode?: string }) {
    isLoading.value = true
    authError.value = null
    try {
      const user = root.users.find(u => u.email === credentials.email)
      if (!user) return { ok: false, message: 'Usuario no encontrado.' }

      const isValid = await verifyPassword(user, credentials.password)
      if (!isValid) return { ok: false, message: 'Credenciales inválidas.' }

      if (user.status === 'inactive') return { ok: false, message: 'Tu cuenta está desactivada.' }

      // Check 2FA if needed
      const security = root.userSecurity.find(s => s.userId === user.id)
      if (security?.twoFactorEnabled && !credentials.totpCode) {
        return { ok: true, requiresTwoFactor: true, userId: user.id }
      }

      root.session.currentUserId = user.id
      root.session.currentSessionId = uid('sess')
      
      const session = {
        id: root.session.currentSessionId,
        userId: user.id,
        tenantId: root.activeTenantId || 'tenant-a',
        ip: '127.0.0.1',
        device: 'Web Browser',
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      }
      root.userSessions.push(session)
      
      appendAuditEvent(root.$state, {
        entity: 'auth',
        action: 'Login',
        description: `Inicio de sesión exitoso para ${user.name}.`,
        actor: user.name,
      })
      
      root.saveState()
      return { ok: true, user }
    } catch (error) {
      authError.value = 'Error de autenticación'
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
    login,
    logout,
    refreshSessionWithBackend,
  }
})
