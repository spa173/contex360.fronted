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
  activeTenantId: 'tenant-a',
  activeView: 'dashboard',
  session: {
    currentUserId: 'user-admin',
    currentSessionId: 'sess-seed-1',
    lastLoginAt: new Date().toISOString(),
  },
  selections: {
    invoiceId: 'inv-seed-1',
    ocrRunId: 'ocr-seed-1',
  },
  subscription: null,
  tenants: [
    {
      id: 'tenant-a',
      name: 'Andina Cargo SAS',
      prefix: 'AC',
      sector: 'Logística y Transporte',
      city: 'Bogotá',
      allowNegativeStock: false,
      costMethod: 'Promedio ponderado',
      dianStatus: 'Configurado',
      securitySettings: DEFAULT_TENANT_SECURITY_SETTINGS,
      locations: [
        { id: 'loc-a-1', name: 'Bodega Principal' },
        { id: 'loc-a-2', name: 'Punto de Venta Centro' }
      ]
    },
    {
      id: 'tenant-b',
      name: 'Nova Retail SAS',
      prefix: 'NR',
      sector: 'Comercio minorista',
      city: 'Medellin',
      allowNegativeStock: true,
      costMethod: 'FIFO',
      dianStatus: 'Pendiente revision',
      securitySettings: DEFAULT_TENANT_SECURITY_SETTINGS,
      locations: [
        { id: 'loc-b-1', name: 'Bodega Norte' },
        { id: 'loc-b-2', name: 'Almacen Externo' }
      ]
    },
  ],
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
