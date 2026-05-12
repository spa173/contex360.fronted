import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'
import { useStateStore } from './stateStore'

describe('authStore', () => {
  it('proxies the state store auth accessors and actions', () => {
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    const stateStore = useStateStore()

    expect(authStore.activeTenantId).toBe(stateStore.activeTenantId)
    expect(authStore.activeView).toBe(stateStore.activeView)
    expect(authStore.currentUser).toBe(stateStore.currentUser)
    expect(authStore.login).toBe(stateStore.login)
    expect(authStore.loginWithBackend).toBe(stateStore.loginWithBackend)
    expect(authStore.loginDemoUser).toBe(stateStore.loginDemoUser)
    expect(authStore.logout).toBe(stateStore.logout)
    expect(authStore.resetState).toBe(stateStore.resetState)
  })
})
