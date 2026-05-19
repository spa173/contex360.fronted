export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface TaxConfig {
  id: string
  name: string
  code: string
  type: string
  rate: string
  active: boolean
}

export interface AdminSettings {
  ocrEnabled: boolean
  razonSocial: string
  nit: string
  language: string
  timezone: string
  currency: string
  dateFormat: string
  taxes: TaxConfig[]
}

// --- Admin console (backend) ---

export interface TenantSummary {
  id: string
  name: string
  nit?: string | null
  sector?: string | null
  city?: string | null
  dianStatus?: string | null
  createdAt: string
  _count: { memberships: number; products: number; invoices: number }
}

export interface SystemStats {
  totalTenants: number
  totalUsers: number
  totalInvoices: number
  totalMovements: number
  totalDemoRequests: number
  demoRequestsToday: number
  demoRequestsConverted: number
  totalSubscriptions: number
  activeTrials: number
  systemStatus: string
  version: string
}

export interface AuditLog {
  id: string
  entity: string
  action: string
  description: string
  actor: string
  severity: AuditSeverity
  at: string
  tenant?: { name: string } | null
  actorUser?: { name: string; email: string } | null
}

export interface AccessReviewTotals {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalMemberships: number
  admins: number
  usersWith2FA: number
  usersPending2FA: number
  activeSessions: number
  revokedSessions: number
  staleUsers: number
  staleSessions: number
  inactiveUsersWithAccess: number
  activeSessionsOnInactiveUsers: number
}

export interface AccessReviewFinding {
  severity: AuditSeverity
  title: string
  description: string
  count?: number
}

export interface ComplianceDashboard {
  complianceChecks: {
    key: string
    label: string
    status: 'documented' | 'automated'
    description: string
    evidence: string
    documentUrl: string
  }[]
  businessContinuityPlan: {
    status: 'documented'
    title: string
    owner: string
    version: string
    summary: string
    documentUrl: string
    reviewCadence: string
    testCadence: string
    recoveryObjectives: { label: string; value: string }[]
    controls: string[]
    scenarios: string[]
  }
  accessReview: {
    policy: {
      owner: string
      frequency: string
      schedule: string
      lastRunAt: string | null
      nextReviewAt: string | null
      coverage: { usersReviewed: number; sessionsReviewed: number; percentage: number }
    }
    totals: AccessReviewTotals
    findings: AccessReviewFinding[]
    recommendations: string[]
    byTenant: {
      tenantId: string
      tenantName: string
      totalUsers: number
      activeUsers: number
      adminUsers: number
      usersWith2FA: number
      activeSessions: number
      staleSessions: number
      inactiveUsersWithAccess: number
    }[]
    recentRuns: {
      id: string
      at: string
      actor: string
      severity: AuditSeverity
      description: string
      tenantName: string | null
    }[]
  }
}

export interface CreateCompanyPayload {
  name: string
  adminName: string
  adminEmail: string
  prefix?: string
  plan?: string
  city?: string
  nit?: string
  address?: string
  phone?: string
  sector?: string
}
