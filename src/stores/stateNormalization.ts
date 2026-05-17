import { AppState, User, Tenant } from './stateStore'
import { seedState } from './stateSeed'
import { uid } from '../utils/storeHelpers'
import { normalizeRoleAccess } from './rbacStore'

export function createInitialState(): AppState {
  return JSON.parse(JSON.stringify(seedState as any)) as AppState
}

export function normalizeState(source: any = {}): AppState {
  const base = createInitialState()
  const getArray = (key: string) => {
    const val = source?.[key]
    return Array.isArray(val) ? val : (base[key as keyof AppState] || [])
  }

  const normalized: AppState = {
    ...base,
    ...source,
    session: { ...base.session, ...source.session },
    selections: { ...base.selections, ...source.selections },
    tenants: normalizeTenants(source.tenants, base.tenants),
    memberships: getArray('memberships'),
    thirdParties: getArray('thirdParties'),
    products: getArray('products'),
    inventoryTransfers: getArray('inventoryTransfers'),
    invoices: getArray('invoices'),
    inventoryMovements: getArray('inventoryMovements'),
    ledgerEntries: getArray('ledgerEntries'),
    auditEvents: getArray('auditEvents'),
    ocrRuns: getArray('ocrRuns'),
    roleAccess: normalizeRoleAccess(source.roleAccess || base.roleAccess),
    roleAccessHistory: getArray('roleAccessHistory'),
  }

  normalized.users = normalizeUsers(source.users, base.users)
  normalized.userSecurity = normalizeSecurityProfiles(source.userSecurity, base.userSecurity, normalized.users)
  normalized.userSessions = normalizeSessions(source.userSessions, base.userSessions, normalized.users, normalized.tenants)
  
  return normalized
}

function normalizeUsers(sourceUsers: User[], baseUsers: User[]) {
  const users = Array.isArray(sourceUsers) ? sourceUsers : baseUsers
  return users.map(user => ({
    ...user,
    status: user.status || 'active',
    title: user.title || 'Usuario local',
    isDemoAccount: !!user.isDemoAccount,
    isSystemOwner: !!user.isSystemOwner
  }))
}

function normalizeTenants(sourceTenants: Tenant[], baseTenants: Tenant[]) {
  const tenants = Array.isArray(sourceTenants) ? sourceTenants : baseTenants
  return tenants.map(tenant => ({
    ...tenant,
    securitySettings: { ...tenant.securitySettings }
  }))
}

function normalizeSecurityProfiles(source: any[], base: any[], users: User[]) {
  const profiles = Array.isArray(source) ? source : base
  const map = new Map(profiles.map(p => [p.userId, p]))
  return users.map(user => ({
    userId: user.id,
    twoFactorEnabled: false,
    twoFactorRequired: false,
    passwordResetRequired: false,
    ...map.get(user.id)
  }))
}

function normalizeSessions(source: any[], base: any[], users: User[], tenants: Tenant[]) {
  const userIds = new Set(users.map(u => u.id))
  const tenantIds = new Set(tenants.map(t => t.id))
  const sessions = Array.isArray(source) ? source : base
  return sessions.filter(s => userIds.has(s.userId) && tenantIds.has(s.tenantId))
}
