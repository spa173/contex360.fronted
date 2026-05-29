import { getApiBaseUrl } from './apiBase'
import { getCsrfToken } from './csrf'

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = init.method || 'GET'
  const headers: Record<string, string> = {}

  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const SAFE = new Set(['GET', 'HEAD', 'OPTIONS'])
  if (!SAFE.has(method.toUpperCase())) {
    const csrf = getCsrfToken()
    if (csrf) headers['X-CSRF-Token'] = csrf
  }

  const bodyJson = init.body === undefined ? undefined : JSON.stringify(init.body)

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: bodyJson,
    credentials: 'include',
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.message || `HTTP ${response.status}`)
  }

  return response.json() as T
}

export interface OnboardingStatusResponse {
  completed: boolean
  checklist?: {
    companyData: boolean
    dianSetup: boolean
    firstProduct: boolean
    welcomeEmail: boolean
    planSelected: boolean
  }
}

export interface OnboardingCompletionRequest {
  companyName: string
  nit?: string
  address?: string
  phone?: string
  city?: string
  sector?: string
}

export const onboardingApi = {
  async getStatus(): Promise<OnboardingStatusResponse> {
    return request<OnboardingStatusResponse>('/onboarding/status')
  },

  async complete(data: OnboardingCompletionRequest): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/onboarding/complete', {
      method: 'POST',
      body: data,
    })
  },
}
