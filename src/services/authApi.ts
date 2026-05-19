import { getApiBaseUrl } from './apiBase'

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
  refreshToken: string
  user: BackendAuthUser
  session: BackendAuthSession
  activeTenantId: string
  accessibleTenants: BackendTenantSnapshot[]
  memberships: BackendMembershipSnapshot[]
  subscription?: any
}

export interface BackendMessageResponse {
  ok: true
  message: string
}

export async function refreshAccessToken(): Promise<BackendAuthResponse | null> {
  try {
    return await requestJson<BackendAuthResponse>('/auth/refresh', {
      method: 'POST',
    })
  } catch {
    return null
  }
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

async function requestJson<T>(path: string, init: { method?: string; body?: unknown } = {}) {
  const headers: Record<string, string> = {}

  if (init.body !== undefined) {
    headers['content-type'] = 'application/json'
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

export async function loginWithBackend(credentials: { 
  email: string; 
  password: string; 
  totpCode?: string;
  privacyAccepted?: boolean;
  rememberMe?: boolean;
}) {
  const response = await requestJson<BackendAuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  })

  return response
}

async function fetchCurrentAuthSession() {
  return requestJson<Omit<BackendAuthResponse, 'accessToken'>>('/auth/me')
}

export async function revokeBackendSession() {
  try {
    await requestJson<BackendMessageResponse>('/auth/logout', {
      method: 'POST',
    })
  } catch {
    // Best effort: the UI will clear local session state even if the backend request fails.
  }

  return { ok: true, message: 'Sesion cerrada.' } as BackendMessageResponse
}

export async function requestPasswordReset(email: string) {
  return requestJson<BackendMessageResponse>('/auth/forgot-password', {
    method: 'POST',
    body: { email }
  })
}

export async function resetPassword(token: string, newPassword: string) {
  return requestJson<BackendMessageResponse>('/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword }
  })
}
