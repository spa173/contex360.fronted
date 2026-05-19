import { getAuthToken } from './authApi'
import { getApiBaseUrl } from './apiBase'

async function request<T>(path: string, init: { method?: string; body?: unknown; tenantId?: string | null } = {}) {
  const token = getAuthToken()
  const headers: Record<string, string> = {}

  if (token) {
    headers['authorization'] = `Bearer ${token}`
  }

  if (init.tenantId) {
    headers['x-tenant-id'] = init.tenantId
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

  // Lead Conversion
  async convertLeadToTenant(leadId: string) {
    // Placeholder para conversión de demo a empresa real
    // Backend endpoint: POST /leads/:leadId/convert-to-tenant
    return request<any>(`/leads/${leadId}/convert-to-tenant`, { method: 'POST' })
  },

  // Third Parties
  async getThirdParties(kind?: string, tenantId?: string | null) {
    const query = kind ? `?kind=${kind}` : ''
    return request<any[]>(`/third-parties${query}`, { tenantId })
  },
  async createThirdParty(data: any, tenantId?: string | null) {
    return request<any>('/third-parties', { method: 'POST', body: data, tenantId })
  },

  // Ledger
  async createLedgerEntry(data: any, tenantId?: string | null) {
    return request<any>('/ledger', { method: 'POST', body: data, tenantId })
  },
  async getLedgerEntries(tenantId?: string | null) {
    return request<any[]>('/ledger', { tenantId })
  },

  // Invoices
  async getInvoices(tenantId?: string | null) {
    return request<any[]>('/invoices', { tenantId })
  },
  async getNextInvoiceNumber(tenantId?: string | null) {
    return request<{ prefix: string; nextNumber: number; preview: string }>('/invoices/next-number', { tenantId })
  },
  async createInvoice(data: any, tenantId?: string | null) {
    return request<any>('/invoices', { method: 'POST', body: data, tenantId })
  },
  async updateInvoiceStatus(id: string, status: string, tenantId?: string | null) {
    return request<any>(`/invoices/${id}/status`, { method: 'PATCH', body: { status }, tenantId })
  },
  async cancelInvoice(id: string, reason?: string, tenantId?: string | null) {
    return request<any>(`/invoices/${id}/cancel`, { method: 'POST', body: { reason }, tenantId })
  },

  // Purchases
  async getPurchases(tenantId?: string | null) {
    return request<any[]>('/purchases', { tenantId })
  },
  async getNextPurchaseNumber(tenantId?: string | null) {
    return request<{ prefix: string; nextNumber: number; preview: string }>('/purchases/next-number', { tenantId })
  },
  async createPurchase(data: any, tenantId?: string | null) {
    return request<any>('/purchases', { method: 'POST', body: data, tenantId })
  },
  async deletePurchase(id: string, tenantId?: string | null) {
    return request<any>(`/purchases/${id}`, { method: 'DELETE', tenantId })
  },
  async updatePurchaseStatus(id: string, status: string, tenantId?: string | null) {
    return request<any>(`/purchases/${id}/status`, { method: 'PATCH', body: { status }, tenantId })
  },
  async getOverdueInvoices(tenantId?: string | null) {
    return request<any>('/invoices/overdue', { tenantId })
  },
  async getInvoiceAging(tenantId?: string | null) {
    return request<any>('/invoices/aging', { tenantId })
  },

  // Treasury
  async getTransactions(tenantId?: string | null) {
    return request<any[]>('/treasury', { tenantId })
  },
  async getTreasuryBalance(tenantId?: string | null) {
    return request<{ balance: number; incomeMonth: number; expenseMonth: number }>('/treasury/balance', { tenantId })
  },
  async createTransaction(data: any, tenantId?: string | null) {
    return request<any>('/treasury/transactions', { method: 'POST', body: data, tenantId })
  },

  // Quotes
  async getQuotes(tenantId?: string | null) {
    return request<any[]>('/quotes', { tenantId })
  },
  async createQuote(data: any, tenantId?: string | null) {
    return request<any>('/quotes', { method: 'POST', body: data, tenantId })
  },
  async updateQuoteStatus(quoteId: string, status: string, tenantId?: string | null) {
    return request<any>(`/quotes/${quoteId}/status`, { method: 'PATCH', body: { status }, tenantId })
  },
  async convertQuoteToInvoice(quoteId: string, tenantId?: string | null) {
    return request<{ quote: any; invoice: any }>(`/quotes/${quoteId}/convert`, { method: 'POST', tenantId })
  },
  async deleteQuote(quoteId: string, tenantId?: string | null) {
    return request<any>(`/quotes/${quoteId}`, { method: 'DELETE', tenantId })
  },

  // Products
  async getProducts(tenantId?: string | null) {
    return request<any[]>('/products', { tenantId })
  },

  // Inventory
  async getMovements(productId?: string, tenantId?: string | null) {
    const query = productId ? `?productId=${productId}` : ''
    return request<any[]>(`/inventory/movements${query}`, { tenantId })
  },
  async createMovement(data: any, tenantId?: string | null) {
    return request<any>('/inventory/movements', { method: 'POST', body: data, tenantId })
  },

  // Analytics
  async getDashboardKpis(tenantId?: string | null) {
    return request<any>('/analytics/dashboard', { tenantId })
  },
  async getAlerts(tenantId?: string | null) {
    return request<{ lowStockAlerts: number; pendingInvoices: number }>('/analytics/alerts', { tenantId })
  },
  async getCashFlowTrend(tenantId?: string | null) {
    return request<{
      historical: { date: string; balance: number }[]
      projected: { date: string; balance: number }[]
    }>('/analytics/cash-flow-trend', { tenantId })
  },
  async getSalesByMonth(tenantId?: string | null) {
    return request<any[]>('/analytics/sales-by-month', { tenantId })
  },
  async getSalesReport(from?: string, to?: string, tenantId?: string | null) {
    const query = new URLSearchParams()
    if (from) query.append('from', from)
    if (to) query.append('to', to)
    return request<any>(`/analytics/sales-report?${query.toString()}`, { tenantId })
  },
  async getTopProducts(limit?: number, tenantId?: string | null) {
    const query = limit ? `?limit=${limit}` : ''
    return request<any[]>(`/analytics/top-products${query}`, { tenantId })
  },
  getExportInvoicesUrl() {
    return `${getApiBaseUrl()}/analytics/export/invoices`
  },

  // DIAN Integration
  async sendInvoiceToDian(invoiceId: string, tenantId?: string | null) {
    return request<any>(`/dian/invoices/${invoiceId}/send`, { method: 'POST', tenantId })
  },
  async checkDianInvoiceStatus(invoiceId: string, tenantId?: string | null) {
    return request<any>(`/dian/invoices/${invoiceId}/status`, { tenantId })
  },
  async validateDianConfig(tenantId?: string | null) {
    return request<{ valid: boolean; errors: string[]; warnings: string[] }>('/dian/config/validate', { tenantId })
  },
  async getDianConfig(tenantId?: string | null) {
    return request<any>('/dian/config', { tenantId })
  },
  async updateDianConfig(config: any, tenantId?: string | null) {
    return request<any>('/dian/config', { method: 'POST', body: config, tenantId })
  },

  // AI
  async chatWithAi(message: string, history: any[] = [], attachment?: string | null) {
    return request<any>('/ai/chat', { method: 'POST', body: { message, history, attachment } })
  },
  async getAiInsights() {
    return request<any>('/ai/insights')
  },
  async getAiHealth() {
    return request<any>('/ai/health')
  },
  async getOcrRuns(tenantId?: string | null) {
    return request<any[]>('/analytics/ocr-runs', { tenantId })
  },
  async simulateOcrRun(tenantId?: string | null) {
    return request<any>('/analytics/ocr-runs/simulate', { method: 'POST', tenantId })
  },
  async approveOcrRun(id: string, tenantId?: string | null) {
    return request<any>(`/analytics/ocr-runs/${id}/approve`, { method: 'POST', tenantId })
  },
  async deleteOcrRun(id: string, tenantId?: string | null) {
    return request<any>(`/analytics/ocr-runs/${id}`, { method: 'DELETE', tenantId })
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
    return request<{ ok: boolean; data: any[] }>('/demo')
  },
  async createDemoRequest(data: any) {
    return request<any>('/demo', { method: 'POST', body: data })
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
  async createSupportTicket(data: { subject: string; description: string; priority?: 'baja' | 'media' | 'alta' | 'critica' }) {
    return request<{ ok: boolean; message: string; data: any }>('/support/tickets', { method: 'POST', body: data })
  },
  async getSupportTickets() {
    return request<{ ok: boolean; data: any[] }>('/support/tickets')
  },
  async updateSupportTicketStatus(id: string, status: string) {
    return request<any>(`/support/tickets/${id}/status`, { method: 'PUT', body: { status } })
  },
}
