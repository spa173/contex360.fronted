/* eslint-disable @typescript-eslint/no-explicit-any */
import { getApiBaseUrl } from './apiBase'
import { getCsrfToken } from './csrf'

async function request<T>(path: string, init: { method?: string; body?: unknown; tenantId?: string | null } = {}) {
  const method = init.method || 'GET'
  const headers: Record<string, string> = {}

  if (init.tenantId) {
    headers['x-tenant-id'] = init.tenantId
  }

  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  // Adjuntar CSRF token en requests mutantes (Double Submit Cookie)
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

export interface BancolombiaIntegrationConfig {
  integrationMode: 'open_finance' | 'treasury_feed'
  environment: 'sandbox' | 'production'
  accountNumber: string
  accountType: 'Ahorros' | 'Corriente'
  clientId: string
  statementFormat: 'MT940' | 'CAMT053'
  authorizationStatus: 'draft' | 'ready' | 'connected' | 'paused'
  lastSyncAt: string | null
}

export interface BancolombiaIntegrationUpdateResponse {
  ok: boolean
  data: BancolombiaIntegrationConfig
  connectUrl?: string | null
  needsConsent?: boolean
  message?: string
}

export interface BancolombiaStatementFileInput {
  fileName: string
  contentType: string
  text: string
  format?: 'MT940' | 'CAMT053'
}

export interface BancolombiaSyncRequest {
  statementFile?: BancolombiaStatementFileInput
  entries?: Array<{
    date?: string
    description?: string
    amount?: number | string
    type?: 'INCOME' | 'EXPENSE' | 'credit' | 'debit' | 'income' | 'expense'
    reference?: string
  }>
}

export interface DianIntegrationConfig {
  dianEnvironment: 'test' | 'production'
  dianSoftwareId: string | null
  dianSoftwarePin: string | null
  dianNit: string | null
  dianTestSetId: string | null
  invoiceResolution: string | null
  resolutionFrom: string | null
  resolutionTo: string | null
  dianOperationCode: string | null
  hasCertificate?: boolean
}

export interface DianIntegrationUpdateRequest {
  dianEnvironment?: 'test' | 'production'
  dianSoftwareId?: string
  dianSoftwarePin?: string
  dianNit?: string
  dianTestSetId?: string
  invoiceResolution?: string
  resolutionFrom?: string
  resolutionTo?: string
  dianOperationCode?: string
  dianCertificate?: string
  dianCertificatePassword?: string
}

export interface SubscriptionCurrentResponse {
  planType: string
  active: boolean
  trialDaysRemaining: number
  trialEndsAt: string | null
  renewsAt: string | null
  invoicesThisMonth: number
  limits: {
    name: string
    priceMonthly: number
    priceAnnual: number
    maxUsers: number | null
    maxInvoicesPerMonth: number | null
    modules: string[]
  }
}

export interface SubscriptionUsageResponse {
  planType: string
  invoicesThisMonth: number
  usersCount: number
  renewsAt: string | null
  limits: {
    name: string
    priceMonthly: number
    priceAnnual: number
    maxUsers: number | null
    maxInvoicesPerMonth: number | null
    modules: string[]
  }
}

export interface SubscriptionCheckoutResponse {
  redirectUrl: string
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
  async getDashboardKpis(from?: string, to?: string, tenantId?: string | null) {
    const queryParams = new URLSearchParams()
    if (from) queryParams.append('from', from)
    if (to) queryParams.append('to', to)
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return request<any>(`/analytics/dashboard${queryString}`, { tenantId })
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
    return request<DianIntegrationConfig>('/dian/config', { tenantId })
  },
  async updateDianConfig(config: DianIntegrationUpdateRequest, tenantId?: string | null) {
    return request<any>('/dian/config', { method: 'POST', body: config, tenantId })
  },

  // Bancolombia Integration
  async getBancolombiaConfig(tenantId?: string | null) {
    return request<BancolombiaIntegrationConfig>('/integrations/bancolombia/config', { tenantId })
  },
  async updateBancolombiaConfig(config: Partial<BancolombiaIntegrationConfig>, tenantId?: string | null) {
    return request<BancolombiaIntegrationUpdateResponse>('/integrations/bancolombia/config', { method: 'POST', body: config, tenantId })
  },
  async startBancolombiaOAuth(tenantId?: string | null) {
    return request<{ ok: boolean; url: string }>('/integrations/bancolombia/connect', { method: 'POST', tenantId })
  },
  async disconnectBancolombia(tenantId?: string | null) {
    return request<{ ok: boolean }>('/integrations/bancolombia/disconnect', { method: 'DELETE', tenantId })
  },
  async syncBancolombia(tenantId?: string | null, body?: BancolombiaSyncRequest) {
    return request<{ ok: boolean; lastSyncAt: string; message: string; imported: number; skipped: number }>('/integrations/bancolombia/sync', { method: 'POST', body, tenantId })
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
  async updateTenant(tenantId: string, data: any) {
    return request<any>(`/admin/tenants/${tenantId}`, { method: 'PATCH', body: data })
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

  async getHelpCategories() {
    return request<any[]>('/help-center/categories')
  },

  async getHelpArticles() {
    return request<any[]>('/help-center/articles')
  },

  async getHelpFaqs() {
    return request<any[]>('/help-center/faqs')
  },

  async getSupportTickets() {
    return request<{ ok: boolean; data: any[] }>('/support/tickets')
  },
  async updateSupportTicketStatus(id: string, status: string) {
    return request<any>(`/support/tickets/${id}/status`, { method: 'PUT', body: { status } })
  },
  async getGmailConnectUrl() {
    return request<{ ok: boolean; url: string }>('/integrations/gmail/connect')
  },
  async getGmailStatus() {
    return request<{ connected: boolean; email: string | null }>('/integrations/gmail/status')
  },
  async disconnectGmail() {
    return request<{ ok: boolean }>('/integrations/gmail/disconnect', { method: 'DELETE' })
  },
  async sendViaGmail(data: { to: string; subject: string; html: string }) {
    return request<{ ok: boolean; sentFrom: string }>('/integrations/gmail/send', { method: 'POST', body: data })
  },
  // Subscriptions
  async getSubscriptionUsage(tenantId?: string | null) {
    return request<SubscriptionUsageResponse>('/subscriptions/usage', { tenantId })
  },
  async getSubscriptionCurrent(tenantId?: string | null) {
    return request<SubscriptionCurrentResponse>('/subscriptions/current', { tenantId })
  },
  async createSubscriptionCheckout(
    data: { planType: 'starter' | 'pyme' | 'enterprise'; billing: 'monthly' | 'annual' },
    tenantId?: string | null,
  ) {
    return request<SubscriptionCheckoutResponse>('/subscriptions/checkout', {
      method: 'POST',
      body: data,
      tenantId,
    })
  },
  async cancelSubscription(tenantId?: string | null) {
    return request<{ ok: boolean; message: string }>('/subscriptions/cancel', {
      method: 'POST',
      tenantId,
    })
  },
}
