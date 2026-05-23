import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore'
import { useStateStore } from './stateStore'
import * as authApi from '../services/authApi'

// Mock dependencies
vi.mock('../services/authApi', () => ({
  loginWithBackend: vi.fn(),
  revokeBackendSession: vi.fn(),
}))

vi.mock('../utils/security', () => ({
  encryptData: vi.fn((data) => `encrypted_${data}`),
}))

describe('Auth Store', () => {
  let authStore: ReturnType<typeof useAuthStore>
  let stateStore: ReturnType<typeof useStateStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    stateStore = useStateStore()
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with no user', () => {
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.currentUser).toBeNull()
    expect(authStore.isLoading).toBe(false)
  })

  it('should handle successful login', async () => {
    const mockUser = { id: 'u1', name: 'Test User', email: 'test@example.com' }
    const mockResponse = {
      ok: true,
      user: mockUser,
      session: { id: 's1' },
      activeTenantId: 't1',
      memberships: [{ role: 'Administrador' }]
    }
    
    vi.mocked(authApi.loginWithBackend).mockResolvedValue(mockResponse as any)

    const result = await authStore.loginWithBackend({
      email: 'test@example.com',
      password: 'password123'
    })

    expect(result.ok).toBe(true)
    expect(authApi.loginWithBackend).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
    
    expect(stateStore.session.currentUserId).toBe('u1')
    expect(stateStore.activeTenantId).toBe('t1')
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.currentUser?.email).toBe('test@example.com')
  })

  it('should handle login failure', async () => {
    vi.mocked(authApi.loginWithBackend).mockRejectedValue(new Error('Invalid credentials'))

    const result = await authStore.loginWithBackend({
      email: 'test@example.com',
      password: 'wrongpassword'
    })

    expect(result.ok).toBe(false)
    expect(result.message).toBe('Invalid credentials')
    expect(authStore.authError).toBe('Invalid credentials')
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should handle logout correctly', async () => {
    // Setup initial state
    stateStore.session.currentUserId = 'u1'
    stateStore.session.currentSessionId = 's1'
    
    vi.mocked(authApi.revokeBackendSession).mockResolvedValue({ ok: true, message: 'Logged out' })

    await authStore.logout()

    expect(authApi.revokeBackendSession).toHaveBeenCalled()
    expect(stateStore.session.currentUserId).toBeNull()
    expect(stateStore.session.currentSessionId).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
  })

  it('should determine correct visible views for Owner', () => {
    stateStore.users = [{ id: 'u1', isSystemOwner: true }] as any
    stateStore.session.currentUserId = 'u1'
    
    expect(authStore.isSystemOwner).toBe(true)
    expect(authStore.visibleViews).toContain('admin-console')
  })
})
