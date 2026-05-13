import { getAuthToken } from './authApi'
import { getApiBaseUrl } from './apiBase'

async function request<T>(path: string, init: { method?: string; body?: unknown } = {}) {
  const token = getAuthToken()
  const headers: Record<string, string> = {}

  if (token) {
    headers['authorization'] = `Bearer ${token}`
  }

  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const bodyJson = init.body === undefined ? undefined : JSON.stringify(init.body)

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: init.method || 'GET',
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

export const businessApi = {
  // Auth
  async login(credentials: any) {
    return request<any>('/auth/login', { method: 'POST', body: credentials })
  },
  async me() {
    return request<any>('/auth/me')
  },

  // Third Parties
  async getThirdParties(kind?: string) {
    const query = kind ? `?kind=${kind}` : ''
    return request<any[]>(`/third-parties${query}`)
  },
  async createThirdParty(data: any) {
    return request<any>('/third-parties', { method: 'POST', body: data })
  },

  // Invoices
  async getInvoices() {
    return request<any[]>('/invoices')
  },
  async createInvoice(data: any) {
    return request<any>('/invoices', { method: 'POST', body: data })
  },

  // Products
  async getProducts() {
    return request<any[]>('/products')
  },

  // Inventory
  async getMovements(productId?: string) {
    const query = productId ? `?productId=${productId}` : ''
    return request<any[]>(`/inventory/movements${query}`)
  },
  async createMovement(data: any) {
    return request<any>('/inventory/movements', { method: 'POST', body: data })
  },

  // Analytics
  async getDashboardKpis() {
    return request<any>('/analytics/dashboard')
  },
  async getSalesByMonth() {
    return request<any[]>('/analytics/sales-by-month')
  },
  getExportInvoicesUrl() {
    return `${getApiBaseUrl()}/analytics/export/invoices`
  },

  // AI
  async chatWithAi(message: string) {
    return request<any>('/ai/chat', { method: 'POST', body: { message } })
  },
  
  // 2FA / TOTP
  async totpSetup() {
    return request<{ secret: string; qrCodeUrl: string; otpauthUrl: string }>('/auth/totp/setup')
  },
  async totpConfirm(code: string) {
    return request<{ ok: boolean; message: string }>('/auth/totp/confirm', { method: 'POST', body: { code } })
  },
  async totpDisable(code: string) {
    return request<{ ok: boolean; message: string }>('/auth/totp/disable', { method: 'POST', body: { code } })
  },

  // Admin Console
  async getAdminStats() {
    return request<any>('/admin/stats')
  },
  async getAdminTenants() {
    return request<any[]>('/admin/tenants')
  },
  async getAdminUsers() {
    return request<any[]>('/admin/users')
  },
  async getAdminLogs() {
    return request<any[]>('/admin/audit-logs')
  },
  async getComplianceDashboard() {
    return request<any>('/admin/compliance')
  },
  async runAccessReview() {
    return request<any>('/admin/compliance/access-review', { method: 'POST' })
  },
  async eraseUserData(userId: string) {
    return request<any>(`/admin/users/${userId}/data`, { method: 'DELETE' })
  },
  async getBreachAlerts() {
    return request<any[]>('/admin/breach-alerts')
  },
  async notifyBreach(eventId: string) {
    return request<any>(`/admin/breach-alerts/${eventId}/notify`, { method: 'POST' })
  },
  async getDemoRequests() {
    return request<any[]>('/demo')
  },
  async updateDemoRequestStatus(id: string, estado: string) {
    return request<any>(`/demo/${id}/status`, { method: 'PUT', body: { estado } })
  },
  async convertToCustomer(id: string) {
    return request<any>(`/demo/${id}/convert`, { method: 'POST' })
  },
  async changePassword(currentPassword: string, newPassword: string) {
    return request<any>('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })
  },
  async updateProfile(data: { name?: string; title?: string }) {
    return request<any>('/auth/profile', { method: 'PATCH', body: data })
  },
}
