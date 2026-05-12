import { getApiBaseUrl } from './apiBase'

const AUTH_TOKEN_KEY = 'contex360-auth-token'
const OAUTH_CALLBACK_PATH = '/auth/callback'

export type OAuthProvider = 'google'

export interface BackendAuthUser {
  id: string
  name: string
  email: string
  title: string
  status: 'active' | 'inactive' | 'pending'
  lastLoginAt: string | null
  isSystemOwner: boolean
  isDemoAccount: boolean
}

export interface BackendAuthSession {
  id: string
  userId: string
  tenantId: string
  ip: string
  location: string
  device: string
  browser: string
  os: string
  fingerprint: string
  createdAt: string
  lastSeenAt: string
  revokedAt: string | null
  revokedBy: string | null
}

export interface BackendTenantSnapshot {
  id: string
  name: string
  prefix: string
  sector: string | null
  city: string | null
  allowNegativeStock: boolean
  dianStatus: string | null
}

export interface BackendMembershipSnapshot {
  tenantId: string
  role: string
  permissions: string[]
  accessibleViews: string[]
  access: Record<string, string[]>
}

export interface BackendAuthResponse {
  ok: true
  message: string
  accessToken: string
  user: BackendAuthUser
  session: BackendAuthSession
  activeTenantId: string
  accessibleTenants: BackendTenantSnapshot[]
  memberships: BackendMembershipSnapshot[]
}

export interface BackendMessageResponse {
  ok: true
  message: string
}

export function getAuthToken() {
  if (typeof globalThis === 'undefined') {
    return ''
  }

  return globalThis.localStorage.getItem(AUTH_TOKEN_KEY) || ''
}

export function storeAuthToken(token: string) {
  if (typeof globalThis === 'undefined') {
    return
  }

  globalThis.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  if (typeof globalThis === 'undefined') {
    return
  }

  globalThis.localStorage.removeItem(AUTH_TOKEN_KEY)
}

function getFrontendAuthCallbackUrl() {
  if (typeof globalThis === 'undefined' || typeof window === 'undefined') {
    return OAUTH_CALLBACK_PATH
  }

  return `${window.location.origin}${OAUTH_CALLBACK_PATH}`
}

export function getOAuthLoginUrl(provider: OAuthProvider) {
  const url = new URL(`/auth/oauth/${provider}`, getApiBaseUrl())
  url.searchParams.set('redirectTo', getFrontendAuthCallbackUrl())
  return url.toString()
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

function extractErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

async function requestJson<T>(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const headers: Record<string, string> = {}

  if (init.body !== undefined) {
    headers['content-type'] = 'application/json'
  }

  if (init.token) {
    headers.authorization = `Bearer ${init.token}`
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: init.method || 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: 'include',
  })

  const responseBody = await readResponseBody(response)

  if (!response.ok) {
    throw new Error(extractErrorMessage(responseBody, `HTTP ${response.status}`))
  }

  return responseBody as T
}

export async function loginWithBackend(credentials: { email: string; password: string }) {
  const response = await requestJson<BackendAuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  })

  if ('accessToken' in response && response.accessToken) {
    storeAuthToken(response.accessToken)
  } else {
    clearAuthToken()
  }

  return response
}

export async function fetchCurrentAuthSession() {
  const token = getAuthToken()
  return requestJson<Omit<BackendAuthResponse, 'accessToken'>>('/auth/me', token ? { token } : {})
}

export async function revokeBackendSession() {
  const token = getAuthToken()

  try {
    try {
      await requestJson<BackendMessageResponse>('/auth/logout', {
        method: 'POST',
        token: token || undefined,
      })
    } catch {
      if (token) {
        throw new Error('No fue posible cerrar la sesion en el backend.')
      }
    }

    return { ok: true, message: 'Sesion cerrada.' } as BackendMessageResponse
  } finally {
    clearAuthToken()
  }
}

