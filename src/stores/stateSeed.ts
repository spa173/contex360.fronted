import { uid } from '../utils/storeHelpers'

export const DEFAULT_TENANT_SECURITY_SETTINGS = {
  passwordPolicy: {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
    preventReuse: 5,
    failedAttemptsThreshold: 5,
    lockoutMinutes: 30,
  },
  ipWhitelist: [],
  sessionPolicy: {
    singleSessionOnly: false,
  },
}

async function buildSeedUsers() {
  return []
}

export const seedState = {
  activeTenantId: null,
  activeView: 'dashboard',
  session: {
    currentUserId: null,
    currentSessionId: null,
    lastLoginAt: null,
  },
  selections: {
    invoiceId: null,
    ocrRunId: null,
  },
  subscription: null,
  tenants: [],
  users: await buildSeedUsers(),
  memberships: [],
  roleAccess: {}, // Will be populated by rbacStore
  roleAccessHistory: [],
  userOnboardingTasks: [],
  authRateLimit: {},
  userSecurity: [],
  userSessions: [],
  invitations: [],
  thirdParties: [],
  products: [],
  inventoryTransfers: [],
  inventoryMovements: [],
  invoices: [],
  ledgerEntries: [],
  auditEvents: [],
  ocrRuns: [],
}
