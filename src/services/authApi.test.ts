import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthToken,
  fetchCurrentAuthSession,
  getAuthToken,
  loginWithBackend,
  revokeBackendSession,
  storeAuthToken,
} from './authApi'

function buildJsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: {
      get: () => 'application/json',
    },
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

describe('authApi', () => {
  beforeEach(() => {
    globalThis.localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    globalThis.localStorage.clear()
  })

  it('stores, reads and clears the auth token', () => {
    storeAuthToken('token-123')
    expect(getAuthToken()).toBe('token-123')
    clearAuthToken()
    expect(getAuthToken()).toBe('')
  })

  it('logs in with the backend and parses the response', async () => {
    const fetchMock = vi.fn(async () =>
      buildJsonResponse({
        ok: true,
        message: 'Sesion iniciada.',
        accessToken: 'token-123',
        user: {
          id: 'user-demo',
          name: 'Camilo Demo',
          email: 'admin@contex360.local',
          title: 'Administrador local',
          status: 'active',
          lastLoginAt: '2026-05-06T10:00:00.000Z',
          isSystemOwner: true,
          isDemoAccount: true,
        },
        session: {
          id: 'sess-1',
          userId: 'user-demo',
          tenantId: 'tenant-a',
          ip: '127.0.0.1',
          location: 'Local',
          device: 'Navegador web',
          browser: 'Chrome',
          os: 'Windows',
          fingerprint: 'fingerprint-1',
          createdAt: '2026-05-06T10:00:00.000Z',
          lastSeenAt: '2026-05-06T10:00:00.000Z',
          revokedAt: null,
          revokedBy: null,
        },
        activeTenantId: 'tenant-a',
        accessibleTenants: [],
        memberships: [],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await loginWithBackend({
      email: 'admin@contex360.local',
      password: 'admin@contex360.local!A1',
    })

    expect(response.accessToken).toBe('token-123')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    )
  })

  it('surfaces backend errors when the login fails', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 401,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ message: 'Credenciales invalidas.' }),
      text: async () => JSON.stringify({ message: 'Credenciales invalidas.' }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      loginWithBackend({
        email: 'admin@contex360.local',
        password: 'wrong',
      }),
    ).rejects.toThrow('Credenciales invalidas.')
  })

  it('loads the current auth session when a token exists', async () => {
    storeAuthToken('token-123')
    const fetchMock = vi.fn(async () =>
      buildJsonResponse({
        ok: true,
        message: 'Sesion activa.',
        user: {
          id: 'user-demo',
          name: 'Camilo Demo',
          email: 'admin@contex360.local',
          title: 'Administrador local',
          status: 'active',
          lastLoginAt: '2026-05-06T10:00:00.000Z',
          isSystemOwner: true,
          isDemoAccount: true,
        },
        session: {
          id: 'sess-1',
          userId: 'user-demo',
          tenantId: 'tenant-a',
          ip: '127.0.0.1',
          location: 'Local',
          device: 'Navegador web',
          browser: 'Chrome',
          os: 'Windows',
          fingerprint: 'fingerprint-1',
          createdAt: '2026-05-06T10:00:00.000Z',
          lastSeenAt: '2026-05-06T10:00:00.000Z',
          revokedAt: null,
          revokedBy: null,
        },
        activeTenantId: 'tenant-a',
        accessibleTenants: [],
        memberships: [],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await fetchCurrentAuthSession()

    expect(response.message).toBe('Sesion activa.')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/me',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          authorization: 'Bearer token-123',
        }),
      }),
    )
  })

  it('loads the current auth session with cookie credentials even without a token', async () => {
    const fetchMock = vi.fn(async () =>
      buildJsonResponse({
        ok: true,
        message: 'Sesion activa.',
        user: {
          id: 'user-demo',
          name: 'Camilo Demo',
          email: 'admin@contex360.local',
          title: 'Administrador local',
          status: 'active',
          lastLoginAt: '2026-05-06T10:00:00.000Z',
          isSystemOwner: true,
          isDemoAccount: true,
        },
        session: {
          id: 'sess-1',
          userId: 'user-demo',
          tenantId: 'tenant-a',
          ip: '127.0.0.1',
          location: 'Local',
          device: 'Navegador web',
          browser: 'Chrome',
          os: 'Windows',
          fingerprint: 'fingerprint-1',
          createdAt: '2026-05-06T10:00:00.000Z',
          lastSeenAt: '2026-05-06T10:00:00.000Z',
          revokedAt: null,
          revokedBy: null,
        },
        activeTenantId: 'tenant-a',
        accessibleTenants: [],
        memberships: [],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await fetchCurrentAuthSession()

    expect(response.message).toBe('Sesion activa.')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    )
  })

  it('clears the token even if there is no backend session to revoke', async () => {
    const fetchMock = vi.fn(async () =>
      buildJsonResponse({
        ok: true,
        message: 'Sesion cerrada.',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const response = await revokeBackendSession()

    expect(response.message).toBe('Sesion cerrada.')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    )
    expect(getAuthToken()).toBe('')
  })

  it('revokes the backend session when a token exists', async () => {
    storeAuthToken('token-123')
    const fetchMock = vi.fn(async () => buildJsonResponse({ ok: true, message: 'Sesion cerrada.' }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await revokeBackendSession()

    expect(response.message).toBe('Sesion cerrada.')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          authorization: 'Bearer token-123',
        }),
      }),
    )
    expect(getAuthToken()).toBe('')
  })
})
