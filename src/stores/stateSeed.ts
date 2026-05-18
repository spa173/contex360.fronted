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
  return [
    { id: 'user-admin', name: 'Daniel Castro', email: 'daniel.castro@contex360.com', status: 'active', title: 'Administrador', lastLoginAt: null, isDemoAccount: true, isSystemOwner: true, role: 'Administrador' },
    { id: 'user-accountant', name: 'Contador General', email: 'contador@contex360.local', status: 'active', title: 'Contador', lastLoginAt: null, isDemoAccount: true, isSystemOwner: false },
    { id: 'user-visor', name: 'Visor Negocio', email: 'visor@contex360.local', status: 'active', title: 'Consultor', lastLoginAt: null, isDemoAccount: true, isSystemOwner: false },
    { id: 'user-retail-admin', name: 'Admin Tienda', email: 'admin.retail@contex360.local', status: 'active', title: 'Administrador', lastLoginAt: null, isDemoAccount: true, isSystemOwner: false },
    { id: 'user-payroll', name: 'Nomina User', email: 'nomina@contex360.local', status: 'active', title: 'Auxiliar', lastLoginAt: null, isDemoAccount: true, isSystemOwner: false },
  ]
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
  memberships: [
    { userId: 'user-admin', tenantId: 'tenant-a', role: 'Administrador' },
    { userId: 'user-accountant', tenantId: 'tenant-a', role: 'Contador' },
    { userId: 'user-visor', tenantId: 'tenant-b', role: 'Visor' },
    { userId: 'user-retail-admin', tenantId: 'tenant-b', role: 'Administrador' },
    { userId: 'user-payroll', tenantId: 'tenant-a', role: 'Usuario nomina' },
  ],
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
