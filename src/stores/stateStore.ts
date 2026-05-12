import { defineStore } from 'pinia'
import {
  createPasswordCredentials,
  serializeStateSnapshot,
  upgradeLegacyUserSecrets,
  verifyPassword,
} from './stateSecurity'
import { createTimerRegistry } from './stateRuntime'
import { formatDate } from '../utils/ui'
import { businessApi } from '../services/businessApi'
import { getAuthToken, storeAuthToken, clearAuthToken, refreshAccessToken } from '../services/authApi'

const STORAGE_KEY = 'contex360-mvp-state'
const scheduledDianTimers = createTimerRegistry()

export interface User {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  title: string
  lastLoginAt: string | null
  isDemoAccount: boolean
  isSystemOwner: boolean
  passwordHash?: string
  passwordSalt?: string
  deactivateAt?: string | null
  reassignToUserId?: string | null
  password?: string
  [key: string]: unknown
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAgeDays: number
  preventReuse: number
  failedAttemptsThreshold: number
  lockoutMinutes: number
}

export interface Tenant {
  id: string
  name: string
  prefix: string
  locations: { id: string; name: string }[]
  securitySettings: {
    ipWhitelist: string[]
    passwordPolicy: PasswordPolicy
    sessionPolicy: {
      singleSessionOnly: boolean
    }
  }
  [key: string]: unknown
}

export interface Membership {
  userId: string
  tenantId: string
  role: string
}

export interface Invoice {
  id: string
  tenantId: string
  clientId: string
  status: string
  subtotal: number
  taxTotal: number
  total: number
  items: any[]
  timeline: any[]
  [key: string]: unknown
}

export interface InvoiceItem {
  productId: string
  quantity: number
  subtotal: number
  taxAmount: number
  [key: string]: unknown
}

export interface LedgerEntry {
  id: string
  tenantId: string
  [key: string]: unknown
}

export interface InventoryItem {
  id: string
  tenantId: string
  productId: string
  [key: string]: unknown
}

export interface UserSecurityProfile {
  userId: string
  twoFactorEnabled: boolean
  twoFactorRequired: boolean
  passwordResetRequired: boolean
  passwordUpdatedAt: string | null
  resetRequestedAt: string | null
  tempPasswordExpiresAt: string | null
  riskLevel: 'low' | 'medium' | 'high'
  passwordHistory: string[]
  failedLoginAttempts: number
  lockedUntil: string | null
  trustedFingerprints: string[]
  [key: string]: unknown
}

export interface UserSession {
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
  [key: string]: unknown
}

export interface Invitation {
  id: string
  tenantId: string
  email: string
  role: string
  [key: string]: unknown
}

export interface AuditEvent {
  id: string
  tenantId: string
  entity: string
  action: string
  description: string
  at: string
  actor: string
  severity: 'info' | 'warning' | 'error'
  attachmentUrl?: string | null
}

export interface RoleAccessHistoryEntry {
  id: string
  at: string
  actor: string
  role: string
  moduleId: string
  permission: string
  before: boolean
  after: boolean
  snapshot: Record<string, Record<string, string[]>>
  [key: string]: unknown
}

export interface ThirdParty {
  id: string
  tenantId: string
  name: string
  nit: string
  email: string
  kind: string
  taxProfile: string
  [key: string]: unknown
}

export interface InvitationPayload {
  email: string
  tenantId: string
  role: string
  customMessage?: string
}

export interface BulkUserActionPayload {
  userIds: string[]
  action: 'deactivate' | 'activate' | 'require-2fa' | 'force-reset' | 'change-role'
  role?: string
  tenantId?: string
}

export interface Product {
  id: string
  tenantId: string
  sku: string
  name: string
  price: number
  cost: number
  taxRate: number
  stock: number
  stockByLocation: Record<string, number>
  minStock: number
  maxStock: number
  location: string
  category: string
  barcode: string
  isInventoriable: boolean
  productType: 'standard' | 'kit' | 'service'
  kitComponents?: { productId: string; quantity: number }[]
  unit: string
  [key: string]: unknown
}

export interface InventoryMovement {
  id: string
  tenantId: string
  productId: string
  productName: string
  type: 'entrada' | 'salida'
  quantity: number
  reason: string
  userId: string
  batch: string
  expirationDate: string
  note: string
  at: string
  referenceId?: string
  attachmentUrl?: string | null
}

export interface InventoryTransfer {
  id: string
  tenantId: string
  fromLocId: string
  toLocId: string
  status: 'pendiente' | 'en_transito' | 'completado' | 'cancelado'
  quantity: number
  receivedAt?: string | null
  [key: string]: unknown
}

export interface OcrRun {
  id: string
  tenantId: string
  source: string
  fields: Record<string, string>
  confidence: number
  createdAt: string
  [key: string]: unknown
}

export interface AppState {
  users: User[]
  tenants: Tenant[]
  memberships: Membership[]
  thirdParties: ThirdParty[]
  products: Product[]
  invoices: Invoice[]
  ledgerEntries: LedgerEntry[]
  inventoryMovements: InventoryMovement[]
  inventoryTransfers: InventoryTransfer[]
  ocrRuns: OcrRun[]
  userSecurity: UserSecurityProfile[]
  userSessions: UserSession[]
  invitations: Invitation[]
  auditEvents: AuditEvent[]
  roleAccess: Record<string, Record<string, string[]>>
  roleAccessHistory: RoleAccessHistoryEntry[]
  activeTenantId: string | null
  activeView: string
  userOnboardingTasks: unknown[]
  authRateLimit: Record<string, any>
  session: {
    currentUserId: string | null
    currentSessionId: string | null
    [key: string]: unknown
  }
  selections: {
    invoiceId: string | null
    entryId: string | null
    ocrRunId: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface AuditPayload {
  entity: string
  action: string
  description: string
  actor?: string
  tenantId?: string
  severity?: 'info' | 'warning' | 'error'
  [key: string]: unknown
}

export const PERMISSION_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'billing', label: 'Facturacion' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'accounting', label: 'Contabilidad' },
  { id: 'third-parties', label: 'Terceros' },
  { id: 'users', label: 'Usuarios' },
  { id: 'ai', label: 'IA / OCR' },
]

export const PERMISSION_ACTIONS = [
  { id: 'view', label: 'Ver' },
  { id: 'create', label: 'Crear' },
  { id: 'edit', label: 'Editar' },
  { id: 'approve', label: 'Aprobar' },
  { id: 'export', label: 'Exportar' },
  { id: 'configure', label: 'Configurar' },
]

const ROLE_DEFINITIONS = [
  {
    id: 'owner',
    permissions: ['emit_invoice', 'manage_inventory', 'manage_third_parties', 'run_ocr', 'manage_users'],
    views: ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'users', 'ai'],
    access: {
      dashboard: ['view', 'export', 'configure'],
      billing: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      inventory: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      accounting: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      'third-parties': ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      users: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      ai: ['view', 'create', 'edit', 'export', 'configure'],
    }
  },
  {
    id: 'Administrador',
    permissions: ['emit_invoice', 'manage_inventory', 'manage_third_parties', 'run_ocr', 'manage_users'],
    views: ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'users', 'ai'],
    access: {
      dashboard: ['view', 'export', 'configure'],
      billing: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      inventory: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      accounting: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      'third-parties': ['view', 'create', 'edit', 'export', 'configure'],
      users: ['view', 'create', 'edit', 'approve', 'export', 'configure'],
      ai: ['view', 'create', 'edit', 'export', 'configure'],
    }
  },
  {
    id: 'Contador',
    permissions: ['emit_invoice', 'manage_inventory', 'manage_third_parties', 'run_ocr'],
    views: ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'ai'],
    access: {
      dashboard: ['view', 'export'],
      billing: ['view', 'create', 'edit', 'export'],
      inventory: ['view', 'create', 'edit', 'export'],
      accounting: ['view', 'create', 'edit', 'approve', 'export'],
      'third-parties': ['view', 'create', 'edit'],
      users: [],
      ai: ['view', 'create'],
    }
  },
  {
    id: 'Auxiliar contable',
    permissions: ['emit_invoice', 'manage_third_parties', 'run_ocr'],
    views: ['dashboard', 'billing', 'accounting', 'third-parties', 'ai'],
    access: {
      dashboard: ['view'],
      billing: ['view', 'create'],
      inventory: ['view'],
      accounting: ['view', 'create'],
      'third-parties': ['view', 'create'],
      users: [],
      ai: ['view', 'create'],
    }
  },
  {
    id: 'Usuario nomina',
    permissions: [],
    views: ['dashboard'],
    access: {
      dashboard: ['view'],
      billing: [],
      inventory: [],
      accounting: [],
      'third-parties': ['view'],
      users: [],
      ai: [],
    }
  },
  {
    id: 'Gerencia',
    permissions: [],
    views: ['dashboard', 'accounting'],
    access: {
      dashboard: ['view', 'export'],
      billing: ['view', 'export'],
      inventory: ['view', 'export'],
      accounting: ['view', 'export'],
      'third-parties': ['view'],
      users: [],
      ai: ['view'],
    }
  },
  {
    id: 'Visor',
    permissions: [],
    views: ['dashboard'],
    access: {
      dashboard: ['view'],
      billing: ['view'],
      inventory: ['view'],
      accounting: ['view'],
      'third-parties': ['view'],
      users: [],
      ai: [],
    }
  }
];

export const ROLE_OPTIONS = ROLE_DEFINITIONS.map(r => r.id);
export const ROLE_PERMISSIONS = Object.fromEntries(ROLE_DEFINITIONS.map(r => [r.id, r.permissions]));
export const ROLE_VIEWS = Object.fromEntries(ROLE_DEFINITIONS.map(r => [r.id, r.views]));
export const DEFAULT_ROLE_ACCESS = Object.fromEntries(ROLE_DEFINITIONS.map(r => [r.id, r.access]));


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

const seedState = {
  activeTenantId: 'tenant-a',
  activeView: 'dashboard',
  session: {
    currentUserId: null,
    currentSessionId: null,
    lastLoginAt: null,
  },
  selections: {
    invoiceId: 'inv-seed-1',
    entryId: 'entry-seed-1',
    ocrRunId: 'ocr-seed-1',
  },
  tenants: [
    {
      id: 'tenant-a',
      name: 'Contex Labs SAS',
      prefix: 'CL',
      sector: 'Servicios profesionales',
      city: 'Bogota',
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
    { userId: 'user-demo', tenantId: 'tenant-a', role: 'Administrador' },
    { userId: 'user-demo', tenantId: 'tenant-b', role: 'Gerencia' },
    { userId: 'user-accountant', tenantId: 'tenant-a', role: 'Contador' },
    { userId: 'user-visor', tenantId: 'tenant-b', role: 'Visor' },
    { userId: 'user-retail-admin', tenantId: 'tenant-b', role: 'Administrador' },
    { userId: 'user-payroll', tenantId: 'tenant-a', role: 'Usuario nomina' },
  ],
  roleAccess: JSON.parse(JSON.stringify(DEFAULT_ROLE_ACCESS)),
  roleAccessHistory: [],
  userOnboardingTasks: [],
  authRateLimit: {},
  userSecurity: [
    {
      userId: 'user-demo',
      twoFactorEnabled: true,
      twoFactorRequired: true,
      passwordResetRequired: false,
      passwordUpdatedAt: '2026-04-20T09:00:00.000Z',
      resetRequestedAt: null,
      tempPasswordExpiresAt: null,
      riskLevel: 'low',
      passwordHistory: [],
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    {
      userId: 'user-accountant',
      twoFactorEnabled: true,
      twoFactorRequired: true,
      passwordResetRequired: false,
      passwordUpdatedAt: '2026-04-18T14:30:00.000Z', // NOSONAR - ISO date, not a credential
      resetRequestedAt: null,
      tempPasswordExpiresAt: null,
      riskLevel: 'low',
      passwordHistory: [],
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    {
      userId: 'user-visor',
      twoFactorEnabled: false,
      twoFactorRequired: false,
      passwordResetRequired: false,
      passwordUpdatedAt: '2026-04-10T10:00:00.000Z',
      resetRequestedAt: null,
      tempPasswordExpiresAt: null,
      riskLevel: 'low',
      passwordHistory: [],
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    {
      userId: 'user-retail-admin',
      twoFactorEnabled: true,
      twoFactorRequired: true,
      passwordResetRequired: false,
      passwordUpdatedAt: '2026-04-19T11:10:00.000Z', // NOSONAR - ISO date, not a credential
      resetRequestedAt: null,
      tempPasswordExpiresAt: null,
      riskLevel: 'low',
      passwordHistory: [],
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    {
      userId: 'user-payroll',
      twoFactorEnabled: false,
      twoFactorRequired: false,
      passwordResetRequired: false,
      passwordUpdatedAt: '2026-04-09T12:00:00.000Z',
      resetRequestedAt: null,
      tempPasswordExpiresAt: null,
      riskLevel: 'low',
      passwordHistory: [],
    },
  ],
  userSessions: [
    {
      id: 'sess-seed-1',
      userId: 'user-demo',
      tenantId: 'tenant-a',
      ip: '192.0.2.21',
      location: 'Cartagena, CO',
      device: 'Edge en Windows',
      browser: 'Edge 124',
      os: 'Windows 11',
      createdAt: '2026-05-04T18:56:00.000Z',
      lastSeenAt: '2026-05-04T18:56:00.000Z',
      revokedAt: null,
      revokedBy: null,
    },
    {
      id: 'sess-seed-2',
      userId: 'user-accountant',
      tenantId: 'tenant-a',
      ip: '198.51.100.44',
      location: 'Bogota, CO',
      device: 'Chrome en Windows',
      browser: 'Chrome 124',
      os: 'Windows 11',
      createdAt: '2026-05-03T13:12:00.000Z',
      lastSeenAt: '2026-05-04T08:15:00.000Z',
      revokedAt: null,
      revokedBy: null,
    },
    {
      id: 'sess-seed-3',
      userId: 'user-retail-admin',
      tenantId: 'tenant-b',
      ip: '203.0.113.12',
      location: 'Medellin, CO',
      device: 'Safari en macOS',
      browser: 'Safari 17',
      os: 'macOS 14',
      createdAt: '2026-05-02T09:45:00.000Z',
      lastSeenAt: '2026-05-02T16:03:00.000Z',
      revokedAt: null,
      revokedBy: null,
    },
  ],
  invitations: [
    {
      id: 'invitation-seed-1',
      email: 'nuevo.contador@contex360.local',
      tenantId: 'tenant-a',
      role: 'Contador',
      status: 'pending',
      expiresAt: '2026-05-08T12:00:00.000Z',
      createdAt: '2026-05-04T12:00:00.000Z',
      createdBy: 'Camilo Demo',
      customMessage: 'Hola, bienvenida al equipo contable de Contex Labs.',
      resendCount: 0,
      resentAt: null,
    },
  ],
  thirdParties: [
    {
      id: 'tp-1',
      tenantId: 'tenant-a',
      kind: 'client',
      name: 'Constructora Altos SAS',
      nit: '900123456-7',
      email: 'contabilidad@altos.co',
      taxProfile: 'Responsable de IVA',
    },
    {
      id: 'tp-2',
      tenantId: 'tenant-a',
      kind: 'provider',
      name: 'Suministros Andinos SAS',
      nit: '830456789-1',
      email: 'ventas@andinos.co',
      taxProfile: 'Agente retenedor',
    },
    {
      id: 'tp-3',
      tenantId: 'tenant-a',
      kind: 'employee',
      name: 'Laura Bernal',
      nit: '1032456789',
      email: 'laura.bernal@contexlabs.co',
      taxProfile: 'Empleado',
    },
    {
      id: 'tp-4',
      tenantId: 'tenant-b',
      kind: 'client',
      name: 'Retail Plaza SAS',
      nit: '901998877-2',
      email: 'pagos@retailplaza.co',
      taxProfile: 'Responsable de IVA',
    },
  ],
  products: [
    {
      id: 'prod-1',
      tenantId: 'tenant-a',
      sku: 'SER-001',
      name: 'Diagnostico contable mensual',
      price: 850000,
      cost: 420000,
      taxRate: 19,
      stock: 8,
      stockByLocation: { 'loc-a-1': 8 },
      minStock: 3,
      maxStock: 20,
      location: '',
      category: 'Servicios',
      barcode: '',
      isInventoriable: false,
      productType: 'standard',
      kitComponents: [],
      unit: 'servicio',
    },
    {
      id: 'prod-2',
      tenantId: 'tenant-a',
      sku: 'KIT-INV-01',
      name: 'Kit de inventario inicial',
      price: 320000,
      cost: 170000,
      taxRate: 19,
      stock: 4,
      stockByLocation: { 'loc-a-1': 2, 'loc-a-2': 2 },
      minStock: 2,
      maxStock: 50,
      location: 'Bodega A - Estante 3',
      category: 'Insumos',
      barcode: '7701234567890',
      isInventoriable: true,
      productType: 'standard',
      kitComponents: [],
      unit: 'unidad',
    },
    {
      id: 'prod-3',
      tenantId: 'tenant-a',
      sku: 'LIC-IA-01',
      name: 'Modulo IA documental',
      price: 1200000,
      cost: 580000,
      taxRate: 19,
      stock: 2,
      stockByLocation: { 'loc-a-1': 2 },
      minStock: 2,
      maxStock: 10,
      location: 'Digital',
      category: 'Software',
      barcode: '',
      isInventoriable: false,
      productType: 'standard',
      kitComponents: [],
      unit: 'licencia',
    },
    {
      id: 'prod-4',
      tenantId: 'tenant-b',
      sku: 'SKU-CAJA-01',
      name: 'Caja registradora basica',
      price: 540000,
      cost: 310000,
      taxRate: 19,
      stock: 14,
      stockByLocation: { 'loc-b-1': 10, 'loc-b-2': 4 },
      minStock: 4,
      maxStock: 20,
      location: 'Pasillo 1',
      category: 'Hardware',
      barcode: '7709876543210',
      isInventoriable: true,
      productType: 'standard',
      kitComponents: [],
      unit: 'unidad',
    },
    {
      id: 'prod-kit-1',
      tenantId: 'tenant-a',
      sku: 'KIT-BIENVENIDA',
      name: 'Kit de Bienvenida Empleado',
      price: 450000,
      cost: 170000,
      taxRate: 19,
      stock: 0,
      stockByLocation: {},
      minStock: 0,
      maxStock: 0,
      location: '',
      category: 'Combos',
      barcode: '770KIT1234',
      isInventoriable: true,
      productType: 'kit',
      kitComponents: [{ productId: 'prod-2', quantity: 1 }],
      unit: 'kit',
    },
  ],
  inventoryTransfers: [],
  invoices: [
    {
      id: 'inv-seed-1',
      tenantId: 'tenant-a',
      number: 'CL-0001',
      clientId: 'tp-1',
      status: 'aceptada',
      paymentTermDays: 30,
      subtotal: 1170000,
      taxTotal: 222300,
      total: 1392300,
      notes: 'Factura inicial de parametrizacion.',
      createdAt: '2026-04-22T08:30:00.000Z',
      dueAt: '2026-05-22T08:30:00.000Z',
      items: [
        {
          productId: 'prod-1',
          productName: 'Diagnostico contable mensual',
          quantity: 1,
          unitPrice: 850000,
          unitCost: 420000,
          taxRate: 19,
          subtotal: 850000,
          taxAmount: 161500,
          total: 1011500,
        },
        {
          productId: 'prod-2',
          productName: 'Kit de inventario inicial',
          quantity: 1,
          unitPrice: 320000,
          unitCost: 170000,
          taxRate: 19,
          subtotal: 320000,
          taxAmount: 60800,
          total: 380800,
        },
      ],
      timeline: [
        {
          id: 'tl-seed-1',
          status: 'borrador',
          note: 'Documento preparado en el tenant activo.',
          at: '2026-04-22T08:20:00.000Z',
        },
        {
          id: 'tl-seed-2',
          status: 'emitida',
          note: 'XML/PDF preliminar generado.',
          at: '2026-04-22T08:24:00.000Z',
        },
        {
          id: 'tl-seed-3',
          status: 'enviada',
          note: 'Transmision enviada al proveedor tecnologico.',
          at: '2026-04-22T08:27:00.000Z',
        },
        {
          id: 'tl-seed-4',
          status: 'aceptada',
          note: 'Respuesta positiva recibida de DIAN.',
          at: '2026-04-22T08:30:00.000Z',
        },
      ],
      files: {
        xml: true,
        pdf: true,
      },
    },
  ],
  inventoryMovements: [
    {
      id: 'mov-seed-1',
      tenantId: 'tenant-a',
      productId: 'prod-1',
      productName: 'Diagnostico contable mensual',
      type: 'salida',
      quantity: 1,
      reason: 'venta',
      userId: 'user-demo',
      batch: '',
      expirationDate: '',
      note: 'Factura CL-0001',
      at: '2026-04-22T08:31:00.000Z',
    },
    {
      id: 'mov-seed-2',
      tenantId: 'tenant-a',
      productId: 'prod-2',
      productName: 'Kit de inventario inicial',
      type: 'salida',
      quantity: 1,
      reason: 'venta',
      userId: 'user-demo',
      batch: '',
      expirationDate: '',
      note: 'Factura CL-0001',
      at: '2026-04-22T08:31:00.000Z',
    },
  ],
  ledgerEntries: [
    {
      id: 'entry-seed-1',
      tenantId: 'tenant-a',
      reference: 'COMP-CL-0001',
      description: 'Factura CL-0001 - Constructora Altos SAS',
      sourceInvoiceId: 'inv-seed-1',
      createdAt: '2026-04-22T08:31:00.000Z',
      lines: [
        { account: '130505', label: 'Clientes nacionales', debit: 1392300, credit: 0 },
        { account: '413595', label: 'Ingresos por servicios', debit: 0, credit: 1170000 },
        { account: '240805', label: 'IVA generado', debit: 0, credit: 222300 },
        { account: '613505', label: 'Costo de ventas', debit: 590000, credit: 0 },
        { account: '143505', label: 'Inventario disponible', debit: 0, credit: 590000 },
      ],
    },
  ],
  auditEvents: [
    {
      id: 'aud-seed-1',
      tenantId: 'tenant-a',
      entity: 'factura',
      action: 'Emitir',
      description: 'Se emitio la factura CL-0001 con asiento automatico e inventario.',
      at: '2026-04-22T08:31:00.000Z',
      actor: 'Camilo Demo',
    },
    {
      id: 'aud-seed-2',
      tenantId: 'tenant-a',
      entity: 'dian',
      action: 'Actualizar estado',
      description: 'Factura CL-0001 aceptada por el proveedor tecnologico.',
      at: '2026-04-22T08:32:00.000Z',
      actor: 'Worker DIAN',
    },
  ],
  ocrRuns: [
    {
      id: 'ocr-seed-1',
      tenantId: 'tenant-a',
      sourcePreview:
        'Factura FE-1024, NIT 900123456-7, fecha 2026-04-22, subtotal 1500000, IVA 285000, total 1785000.',
      fields: {
        nit: '900123456-7',
        date: '2026-04-22',
        subtotal: '1500000',
        iva: '285000',
        total: '1785000',
        consecutive: 'FE-1024',
      },
      confidence: 0.94,
      createdAt: '2026-04-22T09:00:00.000Z',
    },
  ],
}

function createInitialState(): AppState {
  return JSON.parse(JSON.stringify(seedState as any)) as AppState
}

function getMembershipsForUser(userId: string, sourceState: AppState) {
  return sourceState.memberships.filter((membership) => membership.userId === userId)
}

function getAccessibleTenantsForUser(userId: string, sourceState: AppState) {
  const tenantIds = new Set(getMembershipsForUser(userId, sourceState).map((item: Membership) => item.tenantId))
  return sourceState.tenants.filter((tenant) => tenantIds.has(tenant.id))
}

function getMembershipForTenant(userId: string, tenantId: string, sourceState: AppState) {
  return sourceState.memberships.find(
    (membership: Membership) => membership.userId === userId && membership.tenantId === tenantId,
  )
}

function getVisibleViewsForState(sourceState: AppState): string[] {
  const currentUserId = sourceState.session.currentUserId

  if (!currentUserId) {
    return ['dashboard']
  }

  const membership = getMembershipForTenant(currentUserId, sourceState.activeTenantId || '', sourceState)
  return membership ? ROLE_VIEWS[membership.role] || ['dashboard'] : ['dashboard']
}

function ensureActiveTenantAccess(targetState: AppState) {
  const currentUserId = targetState.session.currentUserId

  if (!currentUserId) {
    targetState.activeView = 'dashboard'
    return
  }

  const accessibleTenants = getAccessibleTenantsForUser(currentUserId, targetState)

  if (!accessibleTenants.length) {
    targetState.session.currentUserId = null
    return
  }

  if (!accessibleTenants.some((tenant) => tenant.id === targetState.activeTenantId)) {
    targetState.activeTenantId = accessibleTenants[0].id
  }
}

function ensureActiveViewAccess(targetState: AppState) {
  const visibleViews = getVisibleViewsForState(targetState)

  if (!visibleViews.includes(targetState.activeView)) {
    targetState.activeView = visibleViews[0] || 'dashboard'
  }
}

/* c8 ignore start */
function normalizeUsers(sourceUsers: User[], baseUsers: User[], migratedUser?: User | null) {
  const fallbackUsers = Array.isArray(sourceUsers) && sourceUsers.length ? sourceUsers : baseUsers
  const mergedUsers = [...fallbackUsers]

  if (migratedUser && !mergedUsers.some((user) => user.id === migratedUser.id)) {
    mergedUsers.push(migratedUser)
  }

  return mergedUsers.map((user) => {
    const normalizedUser: any = {
      ...user,
    }
    if (normalizedUser.status === undefined) normalizedUser.status = 'active'
    if (normalizedUser.title === undefined) normalizedUser.title = 'Usuario local'
    if (normalizedUser.lastLoginAt === undefined) normalizedUser.lastLoginAt = null
    if (normalizedUser.isDemoAccount === undefined) normalizedUser.isDemoAccount = false
    if (normalizedUser.isSystemOwner === undefined) normalizedUser.isSystemOwner = false

    if (normalizedUser.passwordHash) {
      delete normalizedUser.password
    }

    return normalizedUser as User
  })
}
/* c8 ignore stop */

/* c8 ignore start */
function normalizeTenants(sourceTenants: Tenant[], baseTenants: Tenant[]) {
  const tenants = Array.isArray(sourceTenants) ? sourceTenants : baseTenants
  return tenants.map((tenant) => ({
    ...tenant,
    securitySettings: {
      ...tenant.securitySettings,
      ipWhitelist: [...(tenant.securitySettings?.ipWhitelist || [])],
      passwordPolicy: {
        ...DEFAULT_TENANT_SECURITY_SETTINGS.passwordPolicy,
        ...tenant.securitySettings?.passwordPolicy,
      },
      sessionPolicy: {
        ...DEFAULT_TENANT_SECURITY_SETTINGS.sessionPolicy,
        ...tenant.securitySettings?.sessionPolicy,
      },
    },
  }))
}
/* c8 ignore stop */

function createDefaultSecurityProfile(userId: string): UserSecurityProfile {
  return {
    userId,
    twoFactorEnabled: false,
    twoFactorRequired: false,
    passwordResetRequired: false,
    passwordUpdatedAt: null,
    resetRequestedAt: null,
    tempPasswordExpiresAt: null,
    riskLevel: 'low',
    passwordHistory: [],
    failedLoginAttempts: 0,
    lockedUntil: null,
    trustedFingerprints: [],
    recoveryCodes: [],
  }
}

function classifyBrowserFromRaw(raw: string): string {
  if (raw.includes('edge') || raw.includes('edg')) return 'Edge'
  if (raw.includes('chrome')) return 'Chrome'
  if (raw.includes('safari')) return 'Safari'
  if (raw.includes('firefox')) return 'Firefox'
  return 'Navegador desconocido'
}

function classifyOsFromRaw(raw: string): string {
  if (raw.includes('windows')) return 'Windows'
  if (raw.includes('mac')) return 'macOS'
  if (raw.includes('linux')) return 'Linux'
  if (raw.includes('android')) return 'Android'
  if (raw.includes('ios')) return 'iOS'
  return 'SO desconocido'
}

function inferSessionDeviceMetadata(session: { browser?: string; os?: string; device?: string }) {
  if (session.browser && session.os) {
    return { browser: session.browser, os: session.os }
  }
  const rawDevice = (session.device || '').toLowerCase()
  return {
    browser: classifyBrowserFromRaw(rawDevice),
    os: classifyOsFromRaw(rawDevice),
  }
}

function normalizeRoleAccess(sourceRoleAccess: Record<string, Record<string, string[]>> = {}) {
  const normalized = JSON.parse(JSON.stringify(DEFAULT_ROLE_ACCESS))

  ROLE_OPTIONS.forEach((role) => {
    normalized[role] = {
      ...normalized[role],
      ...sourceRoleAccess[role],
    }

    PERMISSION_MODULES.forEach((module) => {
      const permissions = normalized[role][module.id]
      normalized[role][module.id] = Array.isArray(permissions) ? [...new Set(permissions)] : []
    })
  })

  return normalized
}

function normalizeSecurityProfiles(sourceProfiles: UserSecurityProfile[], baseProfiles: UserSecurityProfile[], users: User[]) {
  const profiles = Array.isArray(sourceProfiles) ? sourceProfiles : baseProfiles
  const profileByUserId = new Map(profiles.map((profile) => [profile.userId, profile]))

  return users.map((user) => ({
    ...createDefaultSecurityProfile(user.id),
    ...profileByUserId.get(user.id),
    userId: user.id,
  }))
}

function normalizeSessions(sourceSessions: UserSession[], baseSessions: UserSession[], users: User[], tenants: Tenant[]) {
  const userIds = new Set(users.map((user) => user.id))
  const tenantIds = new Set(tenants.map((tenant) => tenant.id))
  const sessions = Array.isArray(sourceSessions) ? sourceSessions : baseSessions

  return sessions
    .filter((session) => userIds.has(session.userId) && tenantIds.has(session.tenantId))
    .map((session) => {
      const metadata = inferSessionDeviceMetadata(session)
      return {
        id: session.id || uid('sess'),
        userId: session.userId,
        tenantId: session.tenantId,
        ip: session.ip || '127.0.0.1',
        location: session.location || 'Local',
        device: session.device || 'Navegador',
        browser: metadata.browser,
        os: metadata.os,
        fingerprint:
          session.fingerprint || createDeviceFingerprint(session.userId, metadata.browser, metadata.os),
        createdAt: session.createdAt || new Date().toISOString(),
        lastSeenAt: session.lastSeenAt || session.createdAt || new Date().toISOString(),
        revokedAt: session.revokedAt || null,
        revokedBy: session.revokedBy || null,
      }
    })
}

function normalizeInvitations(sourceInvitations: Invitation[], baseInvitations: Invitation[], tenants: Tenant[]): Invitation[] {
  const tenantIds = new Set(tenants.map((tenant) => tenant.id))
  const invitations = Array.isArray(sourceInvitations) ? sourceInvitations : baseInvitations

  return invitations
    .filter((invitation) => tenantIds.has(invitation.tenantId))
    .map((invitation) => ({
      id: invitation.id || uid('invitation'),
      email: invitation.email || '',
      tenantId: invitation.tenantId,
      role: ROLE_OPTIONS.includes(invitation.role) ? invitation.role : ROLE_OPTIONS[0],
      status: invitation.status || 'pending',
      expiresAt: invitation.expiresAt || null,
      createdAt: invitation.createdAt || new Date().toISOString(),
      createdBy: invitation.createdBy || 'Sistema local',
      customMessage: invitation.customMessage || '',
      resendCount: Number(invitation.resendCount || 0),
      resentAt: invitation.resentAt || null,
    }))
}

function normalizeState(source: any = {}): AppState {
  const base = createInitialState()

  // Helper to get array from source or fallback to base
  const getArray = (key: string) => (Array.isArray(source[key]) ? source[key] : base[key as keyof AppState])

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
    userOnboardingTasks: getArray('userOnboardingTasks'),
    authRateLimit: source.authRateLimit && typeof source.authRateLimit === 'object' ? source.authRateLimit : {},
    invitations: normalizeInvitations(source.invitations, base.invitations, normalizeTenants(source.tenants, base.tenants)),
  }

  const sourceCurrentUser = source.currentUser
  const migratedUser: User | null =
    sourceCurrentUser?.id
      ? {
          id: sourceCurrentUser.id,
          name: sourceCurrentUser.name || 'Usuario migrado',
          email: sourceCurrentUser.email || 'admin@contex360.local',
          status: 'active' as const,
          isSystemOwner: false,
          isDemoAccount: false,
          title: 'Usuario migrado',
          lastLoginAt: sourceCurrentUser.lastLoginAt || null,
        }
      : null

  normalized.users = normalizeUsers(source.users, base.users, migratedUser)
  normalized.userSecurity = normalizeSecurityProfiles(
    source.userSecurity,
    base.userSecurity,
    normalized.users,
  )
  normalized.userSessions = normalizeSessions(
    source.userSessions,
    base.userSessions,
    normalized.users,
    normalized.tenants,
  )

  if (!normalized.session.currentUserId && source.currentUser?.id) {
    normalized.session.currentUserId = source.currentUser.id
  }

  if (
    normalized.session.currentUserId &&
    !normalized.users.some((user) => user.id === normalized.session.currentUserId)
  ) {
    normalized.session.currentUserId = null
    normalized.session.currentSessionId = null
  }

  if (
    normalized.session.currentSessionId &&
    !normalized.userSessions.some((session) => session.id === normalized.session.currentSessionId)
  ) {
    normalized.session.currentSessionId = null
  }

  ensureActiveTenantAccess(normalized)
  ensureActiveViewAccess(normalized)
  return normalized
}

function loadState() {
  if (typeof globalThis === 'undefined') {
    return createInitialState()
  }

  const raw = globalThis.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return createInitialState()
  }

  try {
    return normalizeState(JSON.parse(raw))
  } catch (error) {
    /* c8 ignore start */
    // eslint-disable-next-line no-console
    console.warn('No fue posible leer el estado persistido. Se restaura la demo.', error)
    return createInitialState()
    /* c8 ignore stop */
  }
}

function uid(prefix: string) {
  /* c8 ignore next 3 */
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }
  /* c8 ignore next 4 */
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const randomHex = Array.from(globalThis.crypto.getRandomValues(new Uint8Array(4)), (v) => v.toString(16).padStart(2, '0')).join('')
    return `${prefix}-${Date.now()}-${randomHex}`
  }

  return `${prefix}-${Date.now()}`
}

function isSupportedDianVersion(label: string, version: string) {
  return version ? `${label} ${version}` : label
}

function appendAuditEvent(targetState: AppState, payload: AuditPayload) {
  const tenantId = payload.tenantId || targetState.activeTenantId

  if (!tenantId) {
    return
  }

  targetState.auditEvents.unshift({
    id: uid('aud'),
    tenantId,
    entity: payload.entity,
    action: payload.action,
    description: sanitizeAuditDescription(payload.description),
    at: new Date().toISOString(),
    actor: payload.actor || 'Sistema local',
    severity: payload.severity || 'info',
    attachmentUrl: (payload.attachmentUrl as string) || null,
  })

  if (targetState.auditEvents.length > 500) {
    targetState.auditEvents.pop()
  }
}

function sanitizeAuditDescription(value: unknown) {
  const str = typeof value === 'string' ? value : JSON.stringify(value || '')
  return str
    .replaceAll(/password\s*[:=]\s*\S+/gi, 'password=[REDACTED]')
    .replaceAll(/token\s*[:=]\s*\S+/gi, 'token=[REDACTED]')
    .replaceAll(/authorization\s*[:=]\s*\S+/gi, 'authorization=[REDACTED]')
}

function hasEqualOrHigherPermissions(targetRole: string, sourceRole: string) {
  const sourcePermissions = new Set(ROLE_PERMISSIONS[sourceRole] || [])
  const targetPermissions = new Set(ROLE_PERMISSIONS[targetRole] || [])
  for (const permission of sourcePermissions) {
    if (!targetPermissions.has(permission)) {
      return false
    }
  }
  return true
}

function getClientIpForUser(userId: string): string {
  return generateSimulatedIp(userId)
}

function generateSimulatedIp(userId: string): string {
  const seed = userId.split('').reduce((acc, char) => acc + char.codePointAt(0), 0)
  const ipParts = [
    ((seed * 13) % 255) + 1,
    ((seed * 17) % 255) + 1,
    ((seed * 19) % 255) + 1,
    ((seed * 23) % 255) + 1,
  ]
  return ipParts.join('.')
}

function getLocationFromIp(ip: string) {
  const locationMap: Record<string, string> = {
    '190.14.82': 'Cartagena, CO',
    '181.52.10': 'Bogota, CO',
    '186.30.20': 'Medellin, CO',
    '190.15.88': 'Cali, CO',
    '190.16.55': 'Barranquilla, CO',
  }
  const prefix = ip.substring(0, ip.lastIndexOf('.'))
  return locationMap[prefix] || 'Colombia'
}

function isDigitChar(char: string) {
  return char >= '0' && char <= '9'
}

function isDigitOrDotChar(char: string) {
  return isDigitChar(char) || char === '.'
}

function isDigitOrUnderscoreChar(char: string) {
  return isDigitChar(char) || char === '_'
}

function readTokenValue(source: string, token: string, isAllowedChar: (c: string) => boolean) {
  const tokenIndex = source.indexOf(token)
  if (tokenIndex === -1) {
    return ''
  }

  let value = ''
  for (let index = tokenIndex + token.length; index < source.length; index += 1) {
    const char = source[index]
    if (!isAllowedChar(char)) {
      break
    }
    value += char
  }

  return value
}

function formatVersionLabel(label: string, version: string) {
  return version ? `${label} ${version}` : label
}

export function parseUserAgentMetadata(userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent || '') {
  if (!userAgent) {
    return {
      browser: 'Navegador local',
      os: 'SO local',
      deviceLabel: 'Navegador local',
    }
  }

  let browser
  let os

  if (userAgent.includes('Edg/')) {
    browser = formatVersionLabel('Edge', readTokenValue(userAgent, 'Edg/', isDigitChar))
  } else if (userAgent.includes('Chrome/')) {
    browser = formatVersionLabel('Chrome', readTokenValue(userAgent, 'Chrome/', isDigitChar))
  } else if (userAgent.includes('Firefox/')) {
    browser = formatVersionLabel('Firefox', readTokenValue(userAgent, 'Firefox/', isDigitChar))
  } else if (userAgent.includes('Version/') && userAgent.includes('Safari')) {
    browser = formatVersionLabel('Safari', readTokenValue(userAgent, 'Version/', isDigitChar))
  } else {
    browser = classifyBrowserFromRaw(userAgent.toLowerCase())
  }

  if (userAgent.includes('Windows NT ')) {
    os = formatVersionLabel('Windows', readTokenValue(userAgent, 'Windows NT ', isDigitOrDotChar))
  } else if (userAgent.includes('Mac OS X ')) {
    const macVersion = readTokenValue(userAgent, 'Mac OS X ', isDigitOrUnderscoreChar).split('_').join('.')
    os = formatVersionLabel('macOS', macVersion)
  } else if (userAgent.includes('Android ')) {
    os = formatVersionLabel('Android', readTokenValue(userAgent, 'Android ', isDigitOrDotChar))
  } else if (userAgent.includes('OS ') && userAgent.includes(' like Mac OS X')) {
    const iosVersion = readTokenValue(userAgent, 'OS ', isDigitOrUnderscoreChar).split('_').join('.')
    os = formatVersionLabel('iOS', iosVersion)
  } else {
    os = classifyOsFromRaw(userAgent.toLowerCase())
  }

  return {
    browser,
    os,
    deviceLabel: `${browser} en ${os}`,
  }
}

export function buildDemoPassword(identifier: string) {
  return `${String(identifier || '').trim()}!A1`
}

async function buildSeedUsers() {
  const seedUserDefinitions = [
    {
      id: 'user-demo',
      name: 'Camilo Demo',
      email: 'admin@contex360.local',
      status: 'active',
      title: 'Administrador local',
      lastLoginAt: null,
      isDemoAccount: true,
      isSystemOwner: true,
    },
    {
      id: 'user-accountant',
      name: 'Daniela Rojas',
      email: 'contador@contex360.local',
      status: 'active',
      title: 'Contador senior',
      lastLoginAt: null,
      isDemoAccount: true,
      isSystemOwner: false,
    },
    {
      id: 'user-visor',
      name: 'Santiago Velez',
      email: 'visor@contex360.local',
      status: 'active',
      title: 'Visor operativo',
      lastLoginAt: null,
      isDemoAccount: true,
      isSystemOwner: false,
    },
    {
      id: 'user-retail-admin',
      name: 'Valeria Pinto',
      email: 'retail.admin@contex360.local',
      status: 'active',
      title: 'Admin retail',
      lastLoginAt: null,
      isDemoAccount: true,
      isSystemOwner: false,
    },
    {
      id: 'user-payroll',
      name: 'Laura Bernal',
      email: 'nomina@contex360.local',
      status: 'active',
      title: 'Coordinacion de nomina',
      lastLoginAt: null,
      isDemoAccount: true,
      isSystemOwner: false,
    },
  ]

  return Promise.all(
    seedUserDefinitions.map(async (user) => ({
      ...user,
      ...(await createPasswordCredentials(buildDemoPassword(user.email))),
    })),
  )
}

function createDeviceFingerprint(userId: string, browser: string, os: string) {
  const source = `${userId}|${browser}|${os}`
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.codePointAt(i)) >>> 0
  }
  return `fp-${hash.toString(16).padStart(8, '0')}`
}

function createLoginSession(userId: string, tenantId: string) {
  const now = new Date().toISOString()
  const simulatedIp = generateSimulatedIp(userId)
  const metadata = parseUserAgentMetadata()

  return {
    id: uid('sess'),
    userId,
    tenantId,
    ip: simulatedIp,
    location: getLocationFromIp(simulatedIp),
    device: metadata.deviceLabel,
    browser: metadata.browser,
    os: metadata.os,
    fingerprint: createDeviceFingerprint(userId, metadata.browser, metadata.os),
    createdAt: now,
    lastSeenAt: now,
    revokedAt: null,
    revokedBy: null,
  }
}

function generateTemporaryPassword() {
  /* c8 ignore next 5 */
  const randomPart =
    typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues
      ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(4)), (value) =>
          value.toString(16).padStart(2, '0'),
        ).join('')
      : Date.now().toString(16).slice(-8)

  return `CTX-${randomPart.toUpperCase()}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function isValidEmail(value: string) {
  // Usar una expresión regular segura sin cuantificadores anidados para prevenir ReDoS (Denegación de Servicio)
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value)
}

function isValidNit(value: string) {
  return /^[\d.-]+$/.test(value)
}

function isValidDianIdentifier(identifier: string) {
  return /^[A-Z0-9-]{6,20}$/.test(identifier)
}

const SPECIAL_PASSWORD_CHARACTERS = new Set(String.raw`!@#$%^&*()_+-=[]{};':"\|,.<>/?`.split(''))

function containsSpecialPasswordCharacter(value: string) {
  for (const char of String(value || '')) {
    if (SPECIAL_PASSWORD_CHARACTERS.has(char)) {
      return true
    }
  }

  return false
}

function getTenantItems<T extends { tenantId: string | null }>(collection: T[], tenantId: string | null): T[] {
  return collection.filter((item) => item.tenantId === tenantId)
}

function sortByDateDesc<T>(collection: T[], field: keyof T): T[] {
  return [...collection].sort((left, right) => new Date(right[field] as any).getTime() - new Date(left[field] as any).getTime())
}

function createInvoiceEntry(invoice: any, clientName: string) {
  const inventoryCost = (invoice.items || []).reduce((sum: number, item: any) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0), 0)

  return {
    id: uid('entry'),
    tenantId: invoice.tenantId,
    reference: `COMP-${invoice.number}`,
    description: `Factura ${invoice.number} - ${clientName}`,
    sourceInvoiceId: invoice.id,
    ownerUserId: invoice.ownerUserId || null,
    createdAt: new Date().toISOString(),
    lines: [
      { account: '130505', label: 'Clientes nacionales', debit: invoice.total, credit: 0 },
      { account: '413595', label: 'Ingresos operacionales', debit: 0, credit: invoice.subtotal },
      { account: '240805', label: 'IVA generado', debit: 0, credit: invoice.taxTotal },
      { account: '613505', label: 'Costo de ventas', debit: inventoryCost, credit: 0 },
      { account: '143505', label: 'Inventario disponible', debit: 0, credit: inventoryCost },
    ],
  }
}

function pushInvoiceTimeline(targetState: AppState, invoiceId: string, status: string, note: string) {
  const invoice = targetState.invoices.find((item: Invoice) => item.id === invoiceId)

  if (!invoice) {
    return false
  }

  invoice.status = status
  invoice.timeline.push({
    id: uid('tl'),
    status,
    note,
    at: new Date().toISOString(),
  })
  return true
}

function clearScheduledDianUpdates(invoiceId: string) {
  scheduledDianTimers.clear(invoiceId)
}

function clearAllScheduledDianUpdates() {
  scheduledDianTimers.clearAll()
}

function extractFieldsFromText(source: string = '') {
  const normalized = source
  const nit = /\b\d{6,12}(?:-\d)?\b/.exec(normalized)?.[0] || ''
  const date =
    /\b\d{4}-\d{2}-\d{2}\b/.exec(normalized)?.[0] ||
    /\b\d{2}\/\d{2}\/\d{4}\b/.exec(normalized)?.[0] ||
    ''
  const subtotal = /\bsubtotal\b[:\s$]*([\d.,]+)/i.exec(normalized)?.[1]?.replaceAll(/\D/g, '') || ''
  const iva = /\biva\b[:\s$]*([\d.,]+)/i.exec(normalized)?.[1]?.replaceAll(/\D/g, '') || ''
  const total = /\btotal\b[:\s$]*([\d.,]+)/i.exec(normalized)?.[1]?.replaceAll(/\D/g, '') || ''
  const consecutive =
    /\b(?:fe|fv|factura)[-\s:]?([a-z0-9-]+)/i.exec(normalized)?.[0] ||
    /\b[A-Z]{2,4}-\d{2,6}\b/.exec(normalized)?.[0] ||
    ''

  const fields = {
    nit,
    date,
    subtotal,
    iva,
    total,
    consecutive,
  }

  const detectedCount = Object.values(fields).filter(Boolean).length

  return {
    fields,
    confidence: Math.max(0.45, detectedCount / 6),
  }
}

export const useStateStore = defineStore('state', {
  state: (): AppState => loadState(),
  getters: {
    currentUser(state: AppState): User | null {
      const userId = state.session.currentUserId
      /* c8 ignore next */
      if (!userId) return null
      return state.users.find((user: User) => user.id === userId) || null
    },
    isCurrentUserSystemOwner(): boolean {
      return Boolean(this.currentUser?.isSystemOwner)
    },
    currentClientIp(state: AppState): string {
      if (!state.session.currentUserId) {
        return ''
      }
      return getClientIpForUser(state.session.currentUserId)
    },
    activeTenant(state: AppState): Tenant | null {
      return state.tenants.find((tenant) => tenant.id === state.activeTenantId) || null
    },
    accessibleTenants(state: AppState): Tenant[] {
      if (!state.session.currentUserId) {
        return []
      }

      return getAccessibleTenantsForUser(state.session.currentUserId, state)
    },
    activeMembership(state: AppState): Membership | null {
      if (!state.session.currentUserId) {
        return null
      }

      return (
        state.memberships.find(
          (membership) =>
            (!membership.userId || membership.userId === state.session.currentUserId) &&
            membership.tenantId === state.activeTenantId,
        ) || null
      )
    },
    rolePermissions(): string[] {
      return this.activeMembership ? ROLE_PERMISSIONS[this.activeMembership.role] || [] : []
    },
    visibleViews(): string[] {
      const views = this.activeMembership ? [...(ROLE_VIEWS[this.activeMembership.role] || ['dashboard'])] : ['dashboard']
      if (this.currentUser?.isSystemOwner) {
        // Super Admins ALWAYS get the Admin Console regardless of their role in the current tenant
        if (!views.includes('admin-console')) {
          views.push('admin-console')
        }
      }
      return [...new Set(views)]
    },
    tenantThirdParties(): ThirdParty[] {
      return getTenantItems(this.thirdParties, this.activeTenantId)
    },
    tenantClients(): ThirdParty[] {
      return this.tenantThirdParties.filter((item) => item.kind === 'client')
    },
    tenantProducts(state: AppState): Product[] {
      return getTenantItems(state.products, state.activeTenantId)
    },
    tenantInvoices(): Invoice[] {
      return sortByDateDesc(getTenantItems(this.invoices, this.activeTenantId), 'createdAt')
    },
    tenantInventoryMovements(): InventoryMovement[] {
      return sortByDateDesc(getTenantItems(this.inventoryMovements, this.activeTenantId), 'at')
    },
    tenantLedgerEntries(): LedgerEntry[] {
      return sortByDateDesc(getTenantItems(this.ledgerEntries, this.activeTenantId), 'createdAt')
    },
    tenantAuditEvents(): AuditEvent[] {
      return sortByDateDesc(getTenantItems(this.auditEvents, this.activeTenantId), 'at')
    },
    tenantOcrRuns(): OcrRun[] {
      return sortByDateDesc(getTenantItems(this.ocrRuns, this.activeTenantId), 'createdAt')
    },
    usersForActiveTenant(state: AppState): User[] {
      const memberIds = new Set(
        state.memberships
          .filter((membership) => membership.tenantId === state.activeTenantId)
          .map((membership) => membership.userId),
      )

      return state.users.filter((user) => memberIds.has(user.id))
    },
    selectedInvoice(): Invoice | null {
      return this.tenantInvoices.find((invoice) => invoice.id === this.selections.invoiceId) || this.tenantInvoices[0] || null
    },
    selectedEntry(): LedgerEntry | null {
      return this.tenantLedgerEntries.find((entry) => entry.id === this.selections.entryId) || this.tenantLedgerEntries[0] || null
    },
    selectedOcrRun(): OcrRun | null {
      return this.tenantOcrRuns.find((run) => run.id === this.selections.ocrRunId) || this.tenantOcrRuns[0] || null
    },
  },
  actions: {
    async loginWithBackend(credentials: Record<string, string>) {
      this.resetState()
      try {
        const response = await businessApi.login(credentials)
        if (!response.ok) return response

        if (response.accessToken) {
          storeAuthToken(response.accessToken)
        } else {
          clearAuthToken()
        }
        const userIdx = this.users.findIndex((u: any) => u.id === response.user.id)
        if (userIdx > -1) this.users[userIdx] = response.user
        else this.users.push(response.user)

        this.session.currentUserId = response.user.id
        this.session.currentSessionId = response.session.id
        this.activeTenantId = response.activeTenantId
        this.memberships = response.memberships
        this.tenants = response.accessibleTenants

        // Sync session to local state to satisfy health checks
        const sessionIdx = this.userSessions.findIndex((s: any) => s.id === response.session.id)
        if (sessionIdx > -1) this.userSessions[sessionIdx] = response.session
        else this.userSessions.push(response.session)
        
        await this.fetchBusinessData()
        this.saveState()
        
        return { ok: true, message: 'Sesión iniciada.' }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : 'Error de conexión' }
      }
    },
    async fetchBusinessData() {
      if (!this.activeTenantId) return
      
      try {
        const [products, invoices, thirdParties, movements] = await Promise.all([
          (businessApi as any).getProducts?.() || Promise.resolve([]),
          businessApi.getInvoices(),
          businessApi.getThirdParties(),
          (businessApi as any).getMovements?.() || Promise.resolve([]),
        ])
        
        if (Array.isArray(products)) this.products = products
        if (Array.isArray(invoices)) this.invoices = invoices
        if (Array.isArray(thirdParties)) this.thirdParties = thirdParties
        if (Array.isArray(movements)) this.inventoryMovements = movements
        
        this.saveState()
      } catch (error) {
        console.error('Error fetching business data:', error)
      }
    },
    async refreshSessionWithBackend() {
      try {
        const response = await businessApi.me()
        const userIdx = this.users.findIndex((u: any) => u.id === response.user.id)
        if (userIdx > -1) this.users[userIdx] = response.user
        else this.users.push(response.user)

        this.session.currentUserId = response.user.id
        this.session.currentSessionId = response.session.id
        this.activeTenantId = response.activeTenantId
        this.memberships = response.memberships
        this.tenants = response.accessibleTenants

        // Sync session to local state to satisfy health checks
        const sessionIdx = this.userSessions.findIndex((s: any) => s.id === response.session.id)
        if (sessionIdx > -1) this.userSessions[sessionIdx] = response.session
        else this.userSessions.push(response.session)
        await this.fetchBusinessData()
        return true
      } catch {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          storeAuthToken(refreshed.accessToken)
          this.session.currentUserId = refreshed.user.id
          this.session.currentSessionId = refreshed.session.id
          this.activeTenantId = refreshed.activeTenantId
          this.memberships = refreshed.memberships
          this.tenants = refreshed.accessibleTenants
          await this.fetchBusinessData()
          return true
        }
        clearAuthToken()
        return false
      }
    },
    can(permission: string): boolean {
      return this.rolePermissions.includes(permission)
    },
    checkCurrentSessionHealth() {
      if (!this.session.currentSessionId || !this.session.currentUserId) {
        return { ok: true, revoked: false }
      }
      const session = this.userSessions.find((item: any) => item.id === this.session.currentSessionId)
      if (!session) {
        this.session.currentUserId = null
        this.session.currentSessionId = null
        this.activeView = 'dashboard'
        this.saveState()
        return {
          ok: false,
          revoked: true,
          message: 'Tu sesión ya no existe. Inicia sesión nuevamente.',
        }
      }
      if (session.revokedAt) {
        this.session.currentUserId = null
        this.session.currentSessionId = null
        this.activeView = 'dashboard'
        this.saveState()
        return {
          ok: false,
          revoked: true,
          message: 'Tu sesión fue cerrada porque se inició sesión en otro dispositivo.',
        }
      }
      return { ok: true, revoked: false }
    },
    protectSystemOwnerTarget(targetUserId: string, actionLabel: string = 'modificar') {
      const targetUser = this.users.find((user: any) => user.id === targetUserId)
      if (!targetUser) {
        return { ok: false, message: 'No se encontro el usuario.' }
      }

      if (targetUser.isSystemOwner && this.currentUser?.id !== targetUser.id) {
        return {
          ok: false,
          message: `La cuenta principal está protegida y no puede ${actionLabel}se desde este usuario.`,
        }
      }

      return null
    },
    ensureUserSecurity(userId: string): UserSecurityProfile {
      let profile = this.userSecurity.find((item: UserSecurityProfile) => item.userId === userId)

      if (!profile) {
        profile = createDefaultSecurityProfile(userId)
        this.userSecurity.push(profile)
      }

      return profile
    },
    getSecurityProfile(userId: string) {
      return this.userSecurity.find((p: UserSecurityProfile) => p.userId === userId)
    },
    validatePasswordComplexity(password: string, policy: PasswordPolicy) {
      const errors = []
      if (policy.minLength && password.length < policy.minLength) {
        errors.push(`La contraseña debe tener al menos ${policy.minLength} caracteres.`)
      }
      if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('La contraseña debe incluir al menos una mayúscula.')
      }
      if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('La contraseña debe incluir al menos una minúscula.')
      }
      if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('La contraseña debe incluir al menos un número.')
      }
      if (policy.requireSpecialChars && !containsSpecialPasswordCharacter(password)) {
        errors.push('La contraseña debe incluir al menos un carácter especial.')
      }
      return { valid: errors.length === 0, errors }
    },
    getPasswordPolicyForTenant(tenantId: string): PasswordPolicy {
      const tenant = this.tenants.find((t) => t.id === tenantId)
      return {
        minLength: 8,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        maxAgeDays: 0,
        preventReuse: 0,
        failedAttemptsThreshold: 5,
        lockoutMinutes: 30,
        ...tenant?.securitySettings?.passwordPolicy,
      }
    },
    async enforcePasswordPolicy(userId: string, password: string): Promise<{ ok: boolean; message?: string }> {
      const user = this.users.find((u) => u.id === userId)
      if (!user) {
        return { ok: false, message: 'Usuario no encontrado.' }
      }

      const tenantId = this.memberships.find((m) => m.userId === userId)?.tenantId || this.activeTenantId
      const policy = this.getPasswordPolicyForTenant(tenantId || '')

      const complexityCheck = this.validatePasswordComplexity(password, policy)
      if (!complexityCheck.valid) {
        return { ok: false, message: complexityCheck.errors.join(' ') }
      }

      if (policy.preventReuse > 0) {
        const security = this.userSecurity.find((s: UserSecurityProfile) => s.userId === userId)
        if (security?.passwordHistory) {
          const newHash = (await createPasswordCredentials(password)).passwordHash
          for (const oldHash of security.passwordHistory.slice(0, policy.preventReuse)) {
            if (oldHash === newHash) {
              return {
                ok: false,
                message: `No puedes reutilizar una de las últimas ${policy.preventReuse} contraseñas.`,
              }
            }
          }
        }
      }

      return { ok: true }
    },
    async updatePasswordHistory(userId: string, passwordHash: string) {
      const security = this.ensureUserSecurity(userId)
      if (!security.passwordHistory) {
        security.passwordHistory = []
      }
      security.passwordHistory.unshift(passwordHash)
      const policy = this.getPasswordPolicyForTenant(this.activeTenantId || '')
      if (policy.preventReuse > 0) {
        security.passwordHistory = security.passwordHistory.slice(0, policy.preventReuse)
      }
      this.saveState()
    },
    getRoleAccess(role: string): Record<string, string[]> {
      if (!this.roleAccess[role]) {
        this.roleAccess[role] = normalizeRoleAccess({})[role] || {}
      }

      return this.roleAccess[role]
    },
    saveState() {
      /* c8 ignore next 3 */
      if (typeof globalThis === 'undefined') {
        return
      }

      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeStateSnapshot(this.$state)))
    },
    async migrateSecrets() {
      let didChange = false

      for (const user of this.users) {
        if (await upgradeLegacyUserSecrets(user)) {
          didChange = true
        }
      }

      if (didChange) {
        this.saveState()
      }
    },
    activateSessionForUser(user: User) {
      const accessibleTenants = getAccessibleTenantsForUser(user.id, this.$state)

      if (!accessibleTenants.length) {
        return {
          ok: false,
          message: 'El usuario no tiene empresas asignadas.',
        }
      }

      const tenant = this.tenants.find((t) => t.id === accessibleTenants[0].id)
      const securitySettings = tenant?.securitySettings || { ipWhitelist: [] as string[], sessionPolicy: { singleSessionOnly: false } }

      if (securitySettings.ipWhitelist && securitySettings.ipWhitelist.length > 0) {
        const clientIp = getClientIpForUser(user.id)
        if (!securitySettings.ipWhitelist.includes(clientIp)) {
          appendAuditEvent(this.$state, {
            tenantId: tenant?.id || accessibleTenants[0].id,
            entity: 'auth',
            action: 'Intento bloqueado',
            description: `Intento de acceso desde IP ${clientIp} no autorizada para ${tenant?.name || 'Empresa'}. Usuario: ${user?.name || 'Usuario'}`,
            actor: user?.name || 'Usuario',
            severity: 'error',
          })
          return {
            ok: false,
            message: `Acceso restringido. Esta empresa solo permite conexiones desde IPs autorizadas.`,
          }
        }
      }

      user.lastLoginAt = new Date().toISOString()
      const securityProfile = this.ensureUserSecurity(user.id)
      securityProfile.failedLoginAttempts = 0
      securityProfile.lockedUntil = null
      const loginSession = createLoginSession(user.id, accessibleTenants[0].id)
      const sameIpSession = this.userSessions.find(
        (session) =>
          session.userId === user.id &&
          !session.revokedAt &&
          session.ip === loginSession.ip &&
          session.fingerprint !== loginSession.fingerprint,
      )

      if (sameIpSession) {
        appendAuditEvent(this.$state, {
          tenantId: accessibleTenants[0].id,
          entity: 'seguridad',
          action: 'Cambio de fingerprint',
          description: `Se detectó cambio de fingerprint para ${user?.name || 'Usuario'} desde la misma IP ${loginSession.ip}.`,
          actor: user?.name || 'Usuario',
          severity: 'warning',
        })
      }

      if (securitySettings.sessionPolicy?.singleSessionOnly) {
        this.userSessions.forEach((session) => {
          if (session.userId === user.id && !session.revokedAt) {
            session.revokedAt = new Date().toISOString()
            session.revokedBy = 'Política de sesión única'
          }
        })
      }
      this.session.currentUserId = user.id
      this.session.currentSessionId = loginSession.id
      this.session.lastLoginAt = user.lastLoginAt
      this.activeTenantId = accessibleTenants[0].id
      this.userSessions.unshift(loginSession)
      this.activeView = 'dashboard'
      this.syncSelectionsForTenant()
      appendAuditEvent(this.$state, {
        tenantId: accessibleTenants[0].id,
        entity: 'auth',
        action: 'Iniciar sesion',
        description: `${user?.name || 'Usuario'} ingresó al sistema desde ${loginSession.ip} (${loginSession.location}).`,
        actor: user?.name || 'Usuario',
        severity: 'info',
      })
      this.saveState()

      return {
        ok: true,
        message: '',
      }
    },
    async login(credentials: Record<string, string>) {
      const email = credentials.email.trim().toLowerCase()
      const password = credentials.password || ''
      const user = this.users.find((item) => item.email.toLowerCase() === email)

      const rateLimitCheck = this.checkAuthRateLimit(email, user?.id || 'unknown')
      if (!rateLimitCheck.ok) return rateLimitCheck

      if (user) {
        const lockoutCheck = this.enforceAccountLockout(user.id)
        if (!lockoutCheck.ok) return lockoutCheck
      }

      if (!user || !(await verifyPassword(user, password))) {
        this.handleFailedLogin(email, user?.id || null)
        return {
          ok: false,
          message: 'Credenciales invalidas. Revisa el email y la clave.',
        }
      }

      if (user.status !== 'active') {
        return {
          ok: false,
          message: 'Este usuario aun no esta habilitado por un administrador.',
        }
      }

      if (user.password && !user.passwordHash) {
        await upgradeLegacyUserSecrets(user)
      }

      const security = this.ensureUserSecurity(user.id)
      security.failedLoginAttempts = 0
      security.lockedUntil = null
      this.authRateLimit[rateLimitCheck.key] = {
        attempts: 0,
        windowStartedAt: Date.now(),
        blockedUntil: 0,
        strikes: rateLimitCheck.rateState?.strikes || 0,
      }

      return this.activateSessionForUser(user)
    },
    loginDemoUser(userId: string) {
      const user = this.users.find((item) => item.id === userId)

      if (!user?.isDemoAccount) {
        return {
          ok: false,
          message: 'Ese acceso rapido no esta disponible.',
        }
      }

      if (user.status !== 'active') {
        return {
          ok: false,
          message: 'Este usuario demo no está habilitado.',
        }
      }

      return this.activateSessionForUser(user)
    },
    checkAuthRateLimit(email: string, userId: string) {
      const now = Date.now()
      const clientIp = getClientIpForUser(userId)
      const key = `${email}|${clientIp}`
      const rateState = this.authRateLimit[key] || {
        attempts: 0,
        windowStartedAt: now,
        blockedUntil: 0,
        strikes: 0,
      }

      const windowMs = 60 * 1000
      if (now - rateState.windowStartedAt > windowMs) {
        rateState.attempts = 0
        rateState.windowStartedAt = now
      }

      if (rateState.blockedUntil && now < rateState.blockedUntil) {
        return {
          ok: false,
          message: `Demasiados intentos desde esta IP. Intenta nuevamente en ${formatDate(
            new Date(rateState.blockedUntil).toISOString(),
          )}.`,
          rateState,
          key,
        }
      }

      return { ok: true, rateState, key }
    },
    enforceAccountLockout(userId: string) {
      const security = this.ensureUserSecurity(userId)
      const now = Date.now()

      if (security.lockedUntil && new Date(security.lockedUntil).getTime() > now) {
        return {
          ok: false,
          message: `Cuenta bloqueada temporalmente hasta ${formatDate(security.lockedUntil)} por intentos fallidos.`,
        }
      }
      return { ok: true }
    },
    handleFailedLogin(email: string, userId: string | null) {
      const now = Date.now()
      const rateCheck = this.checkAuthRateLimit(email, userId || 'unknown')
      const rateState = rateCheck.rateState
      const key = rateCheck.key

      rateState.attempts += 1
      if (rateState.attempts >= 15) {
        rateState.strikes = Number(rateState.strikes || 0) + 1
        const minutesByStrike = [1, 5, 15, 30, 60]
        const blockMinutes = minutesByStrike[Math.min(rateState.strikes - 1, minutesByStrike.length - 1)]
        rateState.blockedUntil = now + blockMinutes * 60 * 1000
        rateState.attempts = 0
        rateState.windowStartedAt = now
      }
      this.authRateLimit[key] = rateState

      if (userId) {
        const tenantId = this.memberships.find((m) => m.userId === userId)?.tenantId || this.activeTenantId
        const policy = this.getPasswordPolicyForTenant(tenantId || '')
        const security = this.ensureUserSecurity(userId)
        security.failedLoginAttempts = Number(security.failedLoginAttempts || 0) + 1

        if (policy.failedAttemptsThreshold > 0 && security.failedLoginAttempts >= policy.failedAttemptsThreshold) {
          const lockoutMs = Math.max(1, Number(policy.lockoutMinutes || 30)) * 60 * 1000
          security.lockedUntil = new Date(Date.now() + lockoutMs).toISOString()
          security.failedLoginAttempts = 0
        }
        this.saveState()
      }
    },
    async registerUser(payload: Record<string, unknown>) {
      const name = (payload.name as string).trim()
      const email = (payload.email as string).trim().toLowerCase()
      const password = (payload.password as string).trim()

      if (!name || !email || !password) {
        return {
          ok: false,
          message: 'Completa nombre, email y contrasena para registrarte.',
        }
      }

      if (this.users.some((user) => user.email.toLowerCase() === email)) {
        return {
          ok: false,
          message: 'Ya existe un usuario con ese email.',
        }
      }

      const policy = this.getPasswordPolicyForTenant(this.activeTenantId || '')
      const complexityCheck = this.validatePasswordComplexity(password, policy)
      if (!complexityCheck.valid) {
        return {
          ok: false,
          message: complexityCheck.errors.join(' '),
        }
      }

      const credentials = await createPasswordCredentials(password)

      this.users.unshift({
        id: uid('user'),
        name,
        email,
        ...credentials,
        status: 'inactive',
        title: 'Pendiente de aprobacion',
        lastLoginAt: null,
        isDemoAccount: false,
        isSystemOwner: false,
      })
      this.saveState()

      return {
        ok: true,
        message: 'Registro enviado. Un administrador debe asignarte rol para que puedas entrar.',
      }
    },
    async logout() {
      const currentUser = this.currentUser
      
      if (!currentUser && !getAuthToken()) {
        return {
          ok: false,
          message: 'No hay sesión activa.',
        }
      }
      
      try {
        const { revokeBackendSession } = await import('../services/authApi')
        await revokeBackendSession()
      } catch (error) {
        console.error('Error during backend logout:', error)
      } finally {
        clearAuthToken()
        this.resetState()
        globalThis.localStorage.removeItem(STORAGE_KEY)
        
        if (currentUser) {
          appendAuditEvent(this.$state, {
            entity: 'auth',
            action: 'Cerrar sesión',
            description: `${currentUser.name} cerró la sesión actual.`,
            actor: currentUser.name,
          })
        }
        
        this.saveState()
      }

      return {
        ok: true,
        message: 'Sesión cerrada correctamente.',
      }
    },
    /* c8 ignore next 3 */
    hydrateState() {
      this.$patch(loadState() as any)
    },
    /* c8 ignore next 5 */
    resetState() {
      clearAllScheduledDianUpdates()
      this.$patch(createInitialState() as any)
      this.saveState()
    },
    syncSelectionsForTenant() {
      this.selections.invoiceId = this.tenantInvoices[0]?.id || null
      this.selections.entryId = this.tenantLedgerEntries[0]?.id || null
      this.selections.ocrRunId = this.tenantOcrRuns[0]?.id || null
    },
    selectInvoice(invoiceId: string) {
      this.selections.invoiceId = invoiceId
      this.saveState()
    },
    selectEntry(entryId: string) {
      this.selections.entryId = entryId
      this.saveState()
    },
    selectOcrRun(runId: string) {
      this.selections.ocrRunId = runId
      this.saveState()
    },
    async setActiveTenant(tenantId: string) {
      const currentUser = this.currentUser
      const accessibleTenants = currentUser ? getAccessibleTenantsForUser(currentUser.id, this.$state) : []

      if (!currentUser || !accessibleTenants.some((tenant) => tenant.id === tenantId)) {
        return {
          ok: false,
          message: 'La sesion actual no tiene acceso a esa empresa.',
        }
      }

      this.activeTenantId = tenantId
      await this.fetchBusinessData()
      ensureActiveViewAccess(this.$state)
      this.syncSelectionsForTenant()
      this.saveState()

      return {
        ok: true,
        message: '',
      }
    },
    setActiveView(viewId: string) {
      if (!this.visibleViews.includes(viewId)) {
        return {
          ok: false,
          message: 'Tu rol actual no tiene acceso a ese panel.',
        }
      }

      this.activeView = viewId
      this.saveState()

      return {
        ok: true,
        message: '',
      }
    },
    async emitInvoice(payload: Record<string, unknown>) {
      if (!this.can('emit_invoice')) {
        return {
          ok: false,
          message: 'Tu rol actual no permite emitir documentos.',
        }
      }

      try {
        const response = await businessApi.createInvoice(payload)
        this.invoices.unshift(response)
        await this.fetchBusinessData() // Refresh stock and movements
        return {
          ok: true,
          message: 'Factura emitida correctamente.',
          detail: `Documento generado y stock actualizado en el backend.`,
          invoice: response,
        }
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : 'No fue posible emitir la factura con el backend.',
        }
      }
    },
    createProduct(payload: Record<string, unknown>) {
      if (!this.can('manage_inventory')) {
        return {
          ok: false,
          message: 'Tu rol actual no puede crear productos.',
        }
      }

      const tenant = this.tenants.find(t => t.id === this.activeTenantId)
      const defaultLocId = tenant?.locations?.[0]?.id || 'default'

      const product = {
        id: uid('prod'),
        tenantId: this.activeTenantId || '',
        sku: ((payload.sku as string) || '').trim(),
        name: ((payload.name as string) || '').trim(),
        price: Number(payload.price || 0),
        cost: Number(payload.cost || 0),
        taxRate: Number(payload.taxRate || 0),
        stock: Number(payload.stock || 0),
        stockByLocation: { [defaultLocId]: Number(payload.stock || 0) },
        minStock: Number(payload.minStock || 0),
        maxStock: Number(payload.maxStock || 0),
        location: ((payload.location as string) || '').trim(),
        category: ((payload.category as string) || 'General').trim(),
        barcode: ((payload.barcode as string) || '').trim(),
        isInventoriable: payload.isInventoriable !== false,
        productType: (payload.productType as any) || 'standard',
        kitComponents: Array.isArray(payload.kitComponents) ? payload.kitComponents : [],
        unit: payload.productType === 'kit' ? 'kit' : 'unidad',
        preferredSupplier: ((payload.preferredSupplier as string) || '').trim(),
      }

      if (!product.sku || !product.name) {
        return {
          ok: false,
          message: 'Completa SKU y nombre del producto.',
        }
      }

      this.products.unshift(product)
      appendAuditEvent(this.$state, {
        entity: 'inventario',
        action: 'Crear producto',
        description: `Se registro el producto ${product.name}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Producto guardado.',
        detail: `${product.name} ya esta disponible para facturacion.`,
      }
    },
    transferStock({ productId, fromLocId, toLocId, quantity }: { productId: string, fromLocId: string, toLocId: string, quantity: number }) {
      if (!this.can('manage_inventory')) return { ok: false, message: 'Permisos insuficientes.' }
      const product = this.products.find(p => p.id === productId)
      if (!product?.isInventoriable) return { ok: false, message: 'Producto invalido.' }

      const locStock = product.stockByLocation[fromLocId] || 0
      if (locStock < quantity) return { ok: false, message: 'Stock insuficiente en bodega origen.' }

      // Solo descontar de origen
      product.stockByLocation[fromLocId] -= quantity
      product.stock -= quantity

      const transferId = uid('transf')
      this.inventoryTransfers.push({
        id: transferId,
        tenantId: this.activeTenantId || '',
        productId,
        productName: product.name,
        fromLocId,
        toLocId,
        quantity,
        status: 'en_transito',
        date: new Date().toISOString(),
        userId: this.currentUser?.id || 'sistema'
      })

      const now = new Date().toISOString()
      this.inventoryMovements.unshift({
        id: uid('mov'), tenantId: this.activeTenantId || '', productId, productName: product.name,
        type: 'salida', quantity, reason: 'traslado_salida', userId: this.currentUser?.id || 'sistema',
        batch: '', expirationDate: '', note: `Despacho a ${toLocId} (En Transito)`, at: now
      })

      appendAuditEvent(this.$state, { entity: 'inventario', action: 'Traslado', description: `Traslado en transito de ${quantity} ${product.name}`, actor: this.currentUser?.name || 'Sistema' })
      this.saveState()
      return { ok: true, message: 'Traslado despachado. En espera de recepcion.', transferId }
    },
    receiveTransfer(transferId: string) {
      if (!this.can('manage_inventory')) return { ok: false, message: 'Permisos insuficientes.' }
      
      const transfer = this.inventoryTransfers.find(t => t.id === transferId)
      if (transfer?.status !== 'en_transito') return { ok: false, message: 'Traslado no valido.' }

      const product = this.products.find(p => p.id === transfer.productId)
      if (!product) return { ok: false, message: 'Producto no encontrado.' }

      // Ingresar a destino
      product.stockByLocation[transfer.toLocId] = (product.stockByLocation[transfer.toLocId] || 0) + transfer.quantity
      product.stock += transfer.quantity
      transfer.status = 'completado'
      transfer.receivedAt = new Date().toISOString()

      this.inventoryMovements.unshift({
        id: uid('mov'), tenantId: this.activeTenantId || '' || '', productId: product.id, productName: product.name,
        type: 'entrada', quantity: transfer.quantity, reason: 'traslado_entrada', userId: this.currentUser?.id || 'sistema',
        batch: '', expirationDate: '', note: `Recepcion desde ${transfer.fromLocId}`, at: transfer.receivedAt
      })

      appendAuditEvent(this.$state, { entity: 'inventario', action: 'Recepcion', description: `Recepcion de traslado de ${transfer.quantity} ${product.name}`, actor: this.currentUser?.name || 'Sistema' })
      this.saveState()
      return { ok: true, message: 'Mercancia recibida exitosamente en destino.' }
    },
    auditInventory({ adjustments }: { adjustments: Record<string, unknown>[] }) {
      if (!this.can('manage_inventory')) return { ok: false, message: 'Permisos insuficientes para auditar.' }

      const now = new Date().toISOString()
      let totalAdjustments = 0

      adjustments.forEach((adj: any) => {
        const product = this.products.find(p => p.id === adj.productId)
        if (!product?.isInventoriable) return

        const currentLocStock = product.stockByLocation[adj.locationId] || 0
        const diff = adj.physicalCount - currentLocStock

        if (diff !== 0) {
          product.stockByLocation[adj.locationId] = adj.physicalCount
          product.stock += diff

          this.inventoryMovements.unshift({
            id: uid('mov'),
            tenantId: this.activeTenantId || '',
            productId: product.id,
            productName: product.name,
            type: diff > 0 ? 'entrada' : 'salida',
            quantity: Math.abs(diff),
            reason: 'ajuste_auditoria',
            userId: this.currentUser?.id || 'sistema',
            batch: '',
            expirationDate: '',
            note: adj.reason || 'Ajuste por conteo fisico',
            attachmentUrl: adj.photoBase64 || '',
            at: now
          })
          totalAdjustments++
        }
      })

      if (totalAdjustments > 0) {
        appendAuditEvent(this.$state, { entity: 'inventario', action: 'Auditoria', description: `Se realizaron ${totalAdjustments} ajustes por conteo fisico.`, actor: this.currentUser?.name || 'Sistema' })
        this.saveState()
      }

      return { ok: true, message: `Auditoria completada. ${totalAdjustments} productos ajustados.` }
    },
    receiveInventory({ productId, quantity, unitCost, locId }: { productId: string, quantity: number, unitCost: number, locId: string }) {
      if (!this.can('manage_inventory')) return { ok: false, message: 'Permisos insuficientes.' }
      const product = this.products.find(p => p.id === productId)
      if (!product?.isInventoriable) return { ok: false, message: 'Producto no valido.' }
      
      // Calculate CPP
      const oldTotalValue = product.stock * product.cost
      const newTotalValue = quantity * unitCost
      const newStock = product.stock + quantity
      if (newStock > 0) {
        product.cost = (oldTotalValue + newTotalValue) / newStock
      }
      
      product.stock = newStock
      product.stockByLocation[locId] = (product.stockByLocation[locId] || 0) + quantity

      this.inventoryMovements.unshift({
        id: uid('mov'), tenantId: this.activeTenantId || '', productId, productName: product.name,
        type: 'entrada', quantity, reason: 'compra', userId: this.currentUser?.id || 'sistema',
        batch: '', expirationDate: '', note: `Ingreso a bodega ${locId}`, at: new Date().toISOString()
      })

      appendAuditEvent(this.$state, { entity: 'inventario', action: 'Ingreso', description: `Ingreso de ${quantity} ${product.name}`, actor: this.currentUser?.name || 'Sistema' })
      this.saveState()
      return { ok: true, message: 'Inventario recibido y CPP actualizado.' }
    },
    importProductsCSV(csvContent: string) {
      if (!this.can('manage_inventory')) {
        return { ok: false, message: 'Tu rol no puede cargar inventario masivo.' }
      }

      try {
        const lines = csvContent.split('\n').filter(line => line.trim().length > 0)
        if (lines.length < 2) return { ok: false, message: 'El archivo CSV esta vacio o no tiene datos.' }
        
        const dataLines = lines.slice(1)
        let importedCount = 0

        for (const line of dataLines) {
          const cols = line.split(',').map(c => c.trim())
          if (cols.length < 3) continue

          const sku = cols[0] || `SKU-${Date.now()}-${globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 10000}`
          const name = cols[1] || 'Producto importado'
          const price = Number(cols[2] || 0)
          const cost = Number(cols[3] || 0)
          const taxRate = Number(cols[4] || 19)
          const stock = Number(cols[5] || 0)
          const minStock = Number(cols[6] || 0)
          const maxStock = Number(cols[7] || 0)
          const location = cols[8] || ''
          const category = cols[9] || 'General'
          const barcode = cols[10] || ''
          const isInventoriable = cols[11] ? String(cols[11]).toLowerCase() === 'true' : true

          const product = {
            id: uid('prod'),
            tenantId: this.activeTenantId || '',
            sku,
            name,
            price,
            cost,
            taxRate,
            stock,
            minStock,
            maxStock,
            location,
            category,
            barcode,
            isInventoriable,
            productType: 'standard' as const,
            unit: 'unidad',
            stockByLocation: {},
          }

          this.products.unshift(product)
          importedCount++
        }

        if (importedCount > 0) {
          appendAuditEvent(this.$state, {
            entity: 'inventario',
            action: 'Carga masiva',
            description: `Se importaron ${importedCount} productos.`,
            actor: this.currentUser?.name || 'Sistema local',
          })
          this.saveState()
          return { ok: true, message: `Importacion exitosa. Se crearon ${importedCount} productos.` }
        } else {
          return { ok: false, message: 'No se encontraron filas validas en el archivo CSV.' }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        return { ok: false, message: 'Ocurrio un error leyendo el CSV.', detail: error.message }
      }
    },
    async createThirdParty(payload: Record<string, string>) {
      if (!this.can('manage_third_parties')) {
        return {
          ok: false,
          message: 'Tu rol actual no puede crear terceros.',
        }
      }

      try {
        const response = await businessApi.createThirdParty(payload)
        this.thirdParties.unshift(response)
        return {
          ok: true,
          message: 'Tercero guardado correctamente.',
          detail: `${response.name} quedo asociado en el backend.`,
        }
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : 'Error al guardar tercero.',
        }
      }
    },
    async addInventoryMovement(payload: any) {
      if (!this.can('manage_inventory')) return { ok: false, message: 'Permisos insuficientes.' }
      try {
        const response = await businessApi.createMovement(payload)
        this.inventoryMovements.unshift(response)
        await this.fetchBusinessData() // Refresh stock
        return { ok: true, message: 'Movimiento registrado.' }
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : 'Error al registrar movimiento.' }
      }
    },
    async createUser(payload: Record<string, string>) {
       if (!this.can('manage_users')) {
         return {
           ok: false,
           message: 'Solo un Administrador puede crear usuarios.',
         }
       }

       const name = (payload.name || '').trim()
       const email = (payload.email || '').trim().toLowerCase()
       const password = (payload.password || '').trim()
       const status = payload.status
       const title = (payload.title || '').trim()
       const role = payload.role
       const initialTasks = Array.isArray(payload.initialTasks) ? payload.initialTasks.filter(Boolean) : []

       if (!name || !email || !password || !title || !role) {
         return {
           ok: false,
           message: 'Completa todos los campos del usuario.',
         }
       }

       if (this.users.some((user) => user.email.toLowerCase() === email)) {
         return {
           ok: false,
           message: 'Ya existe un usuario con ese email.',
         }
       }

       const policy = this.getPasswordPolicyForTenant(this.activeTenantId || '')
       const complexityCheck = this.validatePasswordComplexity(password, policy)
       if (!complexityCheck.valid) {
         return {
           ok: false,
           message: complexityCheck.errors.join(' '),
         }
       }

       const credentials = await createPasswordCredentials(password)
      const newUser = {
        id: uid('user'),
        name,
        email,
        ...credentials,
        status: status as any,
        title,
        lastLoginAt: null,
        isDemoAccount: false,
        isSystemOwner: false,
      }

      this.users.unshift(newUser)
      this.memberships.push({
        userId: newUser.id,
        tenantId: this.activeTenantId || '',
        role,
      })
      const securityProfile = createDefaultSecurityProfile(newUser.id)
      securityProfile.twoFactorRequired = role === 'Administrador' || role === 'Contador'
      securityProfile.passwordResetRequired = true
      securityProfile.passwordUpdatedAt = new Date().toISOString()
      securityProfile.resetRequestedAt = new Date().toISOString()
      this.userSecurity.unshift(securityProfile)
      await this.updatePasswordHistory(newUser.id, credentials.passwordHash)
      initialTasks.forEach((task) => {
        this.userOnboardingTasks.unshift({
          id: uid('task'),
          userId: newUser.id,
          tenantId: this.activeTenantId || '',
          task,
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
      })

      appendAuditEvent(this.$state, {
        tenantId: this.activeTenantId || '',
        entity: 'usuario',
        action: 'Crear',
        description: `Se creo el usuario ${newUser.name} con rol ${role} en ${this.activeTenant?.name || 'Empresa'}.`,
        actor: this.currentUser?.name || 'Sistema local',
        severity: 'info',
      })
      if (initialTasks.length) {
        appendAuditEvent(this.$state, {
          tenantId: this.activeTenantId || '',
          entity: 'usuario',
          action: 'Asignar tareas iniciales',
          description: `Se asignaron ${initialTasks.length} tareas iniciales a ${newUser.name}.`,
          actor: this.currentUser?.name || 'Sistema local',
          severity: 'info',
        })
      }
      ensureActiveViewAccess(this.$state)
      this.saveState()

      return {
        ok: true,
        message: 'Usuario creado.',
        detail: `${newUser.name} ya tiene acceso al tenant activo.`,
      }
    },
    assignMembership(payload: Record<string, unknown>) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede asignar roles.',
        }
      }

      const userId = payload.userId as string
      const role = payload.role as string
      const user = this.users.find((item) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'Selecciona un usuario valido.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(userId, 'actualizar')
      if (protectedUserError) {
        return protectedUserError
      }

      const existingMembership = this.memberships.find(
        (membership) => membership.userId === userId && membership.tenantId === this.activeTenantId,
      )

      let detail

      if (existingMembership) {
        existingMembership.role = role
        appendAuditEvent(this.$state, {
          entity: 'usuario',
          action: 'Actualizar rol',
          description: `Se actualizó el rol de ${user?.name || userId} a ${role} en ${this.activeTenant?.name || 'Empresa'}.`,
          actor: this.currentUser?.name || 'Sistema local',
        })
        detail = `${user?.name || userId} ahora tiene rol ${role}.`
      } else {
        this.memberships.push({
          userId,
          tenantId: this.activeTenantId || '',
          role,
        })
        appendAuditEvent(this.$state, {
          entity: 'usuario',
          action: 'Asignar rol',
          description: `Se asignó el rol ${role} a ${user?.name || userId} en ${this.activeTenant?.name || 'Empresa'}.`,
          actor: this.currentUser?.name || 'Sistema local',
        })
        detail = `${user?.name || userId} ya tiene acceso a ${this.activeTenant?.name || 'Empresa'}.`
      }

      if (user.status !== 'active') {
        user.status = 'active'
        if (!user.title || user.title === 'Pendiente de aprobacion') {
          user.title = `Perfil ${role}`
        }
        appendAuditEvent(this.$state, {
          entity: 'usuario',
          action: 'Activar',
          description: `Se activo la cuenta de ${user?.name || userId} al asignarle rol en ${this.activeTenant?.name || 'Empresa'}.`,
          actor: this.currentUser?.name || 'Sistema local',
        })
      }

      const securityProfile = this.ensureUserSecurity(user.id)

      if (role === 'Administrador' || role === 'Contador') {
        securityProfile.twoFactorRequired = true
      }

      ensureActiveViewAccess(this.$state)
      this.saveState()

      return {
        ok: true,
        message: existingMembership ? 'Rol actualizado.' : 'Acceso asignado.',
        detail,
      }
    },
    toggleUserStatus(userId: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede activar o desactivar usuarios.',
        }
      }

      const currentUser = this.currentUser
      const user = this.users.find((item) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'No se encontro el usuario.',
        }
      }

      if (currentUser?.id === user.id) {
        return {
          ok: false,
          message: 'No puedes desactivar tu propia cuenta desde esta sesion.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(userId, 'desactivar')
      if (protectedUserError) {
        return protectedUserError
      }

      user.status = user.status === 'active' ? 'inactive' : 'active'

      if (user.status === 'inactive') {
        this.userSessions.forEach((session) => {
          if (session.userId === user.id && !session.revokedAt) {
            session.revokedAt = new Date().toISOString()
            session.revokedBy = currentUser?.name || 'Sistema local'
          }
        })
      }

      appendAuditEvent(this.$state, {
        entity: 'usuario',
        action: user.status === 'active' ? 'Activar' : 'Desactivar',
        description: `${user.name} quedo ${user.status === 'active' ? 'activo' : 'inactivo'} en el sistema.`,
        actor: currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Estado de usuario actualizado.',
        detail: `${user.name} ahora esta ${user.status === 'active' ? 'activo' : 'inactivo'}.`,
      }
    },
    scheduleUserDeactivation(payload: Record<string, unknown>) {
      if (!this.can('manage_users')) {
        return { ok: false, message: 'Solo un Administrador puede programar bajas.' }
      }
      const userId = payload.userId as string
      const user = this.users.find((item) => item.id === userId)
      if (!user) {
        return { ok: false, message: 'No se encontro el usuario.' }
      }
      const when = new Date(payload.at as string)
      if (Number.isNaN(when.getTime())) {
        return { ok: false, message: 'Fecha de baja inválida.' }
      }
      const targetUserId = (payload.reassignToUserId as string) || null
      if (targetUserId) {
        const targetUser = this.users.find((item) => item.id === targetUserId)
        if (targetUser?.status !== 'active') {
          return { ok: false, message: 'El usuario receptor debe existir y estar activo.' }
        }

        const sourceMembership = this.memberships.find(
          (membership) => membership.userId === user.id && membership.tenantId === this.activeTenantId,
        )
        const targetMembership = this.memberships.find(
          (membership) => membership.userId === targetUserId && membership.tenantId === this.activeTenantId,
        )
        if (!sourceMembership || !targetMembership) {
          return {
            ok: false,
            message: 'Usuario saliente y receptor deben tener rol asignado en el tenant activo.',
          }
        }
        if (!hasEqualOrHigherPermissions(targetMembership.role, sourceMembership.role)) {
          return {
            ok: false,
            message: 'El usuario receptor no tiene permisos suficientes para asumir la propiedad.',
          }
        }
      }
      user.deactivateAt = when.toISOString()
      user.reassignToUserId = targetUserId
      appendAuditEvent(this.$state, {
        entity: 'usuario',
        action: 'Programar baja',
        description: `Se programó la desactivación de ${user.name} para ${formatDate(user.deactivateAt)}.`,
        actor: this.currentUser?.name || 'Sistema local',
        severity: 'warning',
      })
      this.saveState()
      return { ok: true, message: 'Baja programada correctamente.' }
    },
    processScheduledDeactivations() {
      const now = Date.now()
      const dueUsers = this.users.filter(
        (user) => user.status === 'active' && user.deactivateAt && new Date(user.deactivateAt).getTime() <= now,
      )
      if (!dueUsers.length) {
        return { ok: true, processed: 0 }
      }

      for (const user of dueUsers) {
        user.status = 'inactive'
        this.userSessions.forEach((session) => {
          if (session.userId === user.id && !session.revokedAt) {
            session.revokedAt = new Date().toISOString()
            session.revokedBy = 'Baja programada'
          }
        })
        if (user.reassignToUserId) {
          this.invoices.forEach((invoice) => {
            if (invoice.ownerUserId === user.id) invoice.ownerUserId = user.reassignToUserId
          })
          this.ledgerEntries.forEach((entry) => {
            if (entry.ownerUserId === user.id) entry.ownerUserId = user.reassignToUserId
          })
        }
        appendAuditEvent(this.$state, {
          entity: 'usuario',
          action: 'Baja ejecutada',
          description: `Se desactivó automáticamente a ${user.name} por fecha programada.`,
          actor: 'Scheduler local',
          severity: 'warning',
        })
        user.deactivateAt = null
      }
      this.saveState()
      return { ok: true, processed: dueUsers.length }
    },
    async generateTemporaryPasswordForUser(userId: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede generar claves temporales.',
        }
      }

      const user = this.users.find((item) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'No se encontro el usuario.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(userId, 'generar clave temporal')
      if (protectedUserError) {
        return protectedUserError
      }

      const temporaryPassword = generateTemporaryPassword()
      const credentials = await createPasswordCredentials(temporaryPassword)
      const securityProfile = this.ensureUserSecurity(user.id)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      user.passwordSalt = credentials.passwordSalt
      user.passwordHash = credentials.passwordHash
      securityProfile.passwordResetRequired = true
      securityProfile.resetRequestedAt = new Date().toISOString()
      securityProfile.tempPasswordExpiresAt = expiresAt
      securityProfile.passwordUpdatedAt = new Date().toISOString()

      appendAuditEvent(this.$state, {
        entity: 'seguridad',
        action: 'Generar clave temporal',
        description: `Se genero una clave temporal para ${user.name} con expiracion de 30 minutos.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Clave temporal generada.',
        detail: `${temporaryPassword} · Expira en 30 minutos y debe cambiarse al ingresar.`,
      }
    },
    forcePasswordReset(userId: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede forzar cambios de clave.',
        }
      }

      const user = this.users.find((item) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'No se encontro el usuario.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(userId, 'cambiar política 2FA')
      if (protectedUserError) {
        return protectedUserError
      }

      const securityProfile = this.ensureUserSecurity(user.id)
      securityProfile.passwordResetRequired = true
      securityProfile.resetRequestedAt = new Date().toISOString()

      appendAuditEvent(this.$state, {
        entity: 'seguridad',
        action: 'Forzar cambio de clave',
        description: `${user.name} debera cambiar su clave en el proximo inicio de sesion.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Cambio de clave requerido.',
        detail: `${user.name} debera actualizar su contrasena al ingresar.`,
      }
    },
    setTwoFactorRequirement(userId: string, required: boolean) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede cambiar politicas 2FA.',
        }
      }

      const user = this.users.find((item) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'No se encontro el usuario.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(userId, 'actualizar 2FA')
      if (protectedUserError) {
        return protectedUserError
      }

      const securityProfile = this.ensureUserSecurity(user.id)
      securityProfile.twoFactorRequired = Boolean(required)

      appendAuditEvent(this.$state, {
        entity: 'seguridad',
        action: required ? 'Exigir 2FA' : 'Retirar exigencia 2FA',
        description: `${user.name} quedo con 2FA ${required ? 'obligatorio' : 'opcional'}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: required ? '2FA obligatorio.' : '2FA opcional.',
        detail: `${user.name} actualizado.`,
      }
    },
    toggleTwoFactorEnabled(userId: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede actualizar estado 2FA.',
        }
      }

      const user = this.users.find((item) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'No se encontro el usuario.',
        }
      }

      const securityProfile = this.ensureUserSecurity(user.id)
      securityProfile.twoFactorEnabled = !securityProfile.twoFactorEnabled

      appendAuditEvent(this.$state, {
        entity: 'seguridad',
        action: securityProfile.twoFactorEnabled ? 'Activar 2FA' : 'Desactivar 2FA',
        description: `${user.name} quedo con 2FA ${securityProfile.twoFactorEnabled ? 'activo' : 'inactivo'}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Estado 2FA actualizado.',
        detail: `${user.name}: ${securityProfile.twoFactorEnabled ? '2FA activo' : '2FA inactivo'}.`,
      }
    },
    /* c8 ignore next 25 */
    trustSessionFingerprint(sessionId: string) {
      if (!this.isCurrentUserSystemOwner) {
        return {
          ok: false,
          message: 'Solo el System Owner puede marcar dispositivos confiables.',
        }
      }
      const session = this.userSessions.find((item) => item.id === sessionId)
      if (!session) {
        return { ok: false, message: 'No se encontro la sesión.' }
      }
      const security = this.ensureUserSecurity(session.userId)
      if (!security.trustedFingerprints.includes(session.fingerprint)) {
        security.trustedFingerprints.push(session.fingerprint)
      }
      appendAuditEvent(this.$state, {
        tenantId: session.tenantId,
        entity: 'seguridad',
        action: 'Confiar dispositivo',
        description: `${this.currentUser?.name || 'System Owner'} marcó un fingerprint como confiable para ${
          this.users.find((u) => u.id === session.userId)?.name || session.userId
        }.`,
        actor: this.currentUser?.name || 'System Owner',
        severity: 'info',
      })
      this.saveState()
      return { ok: true, message: 'Dispositivo marcado como confiable.' }
    },
    generateRecoveryCodes() {
      if (!this.isCurrentUserSystemOwner || !this.currentUser) {
        return { ok: false, message: 'Solo el System Owner puede generar códigos de recuperación.' }
      }
      const security = this.ensureUserSecurity(this.currentUser.id)
      const codes = Array.from({ length: 10 }, () => {
        const arr = new Uint8Array(4)
        if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
          globalThis.crypto.getRandomValues(arr)
        }
        const hex = Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
        return `RCV-${hex.slice(0, 4) || 'ABCD'}-${hex.slice(4, 8) || 'EFGH'}`
      })
      security.recoveryCodes = codes.map((code) => ({ code, usedAt: null }))
      appendAuditEvent(this.$state, {
        tenantId: this.activeTenantId || '',
        entity: 'seguridad',
        action: 'Generar códigos de recuperación',
        description: `${this.currentUser.name} generó nuevos códigos de recuperación de un solo uso.`,
        actor: this.currentUser.name,
        severity: 'warning',
      })
      this.saveState()
      return { ok: true, message: 'Códigos generados.', codes }
    },
    revokeSession(sessionId: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede cerrar sesiones.',
        }
      }

      const session = this.userSessions.find((item: UserSession) => item.id === sessionId)

      if (!session) {
        return {
          ok: false,
          message: 'No se encontro la sesion.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(session.userId, 'cerrar sesión')
      if (protectedUserError) {
        return protectedUserError
      }

      if (!session.revokedAt) {
        session.revokedAt = new Date().toISOString()
        session.revokedBy = this.currentUser?.name || 'Sistema local'
      }

      if (this.session.currentSessionId === sessionId) {
        this.session.currentUserId = null
        this.session.currentSessionId = null
        this.activeView = 'dashboard'
      }

      const user = this.users.find((item) => item.id === session.userId)
      appendAuditEvent(this.$state, {
        tenantId: session.tenantId,
        entity: 'seguridad',
        action: 'Cerrar sesion',
        description: `Se cerro una sesion de ${user?.name || 'usuario'} desde ${session.device}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Sesion cerrada.',
        detail: user ? `${user.name} ya no tiene esa sesion activa.` : '',
      }
    },
    revokeUserSessions(userId: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede cerrar sesiones.',
        }
      }

      const user = this.users.find((item: User) => item.id === userId)

      if (!user) {
        return {
          ok: false,
          message: 'No se encontro el usuario.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(userId, 'cerrar sesiones')
      if (protectedUserError) {
        return protectedUserError
      }

      let count = 0
      this.userSessions.forEach((session) => {
        if (session.userId === userId && !session.revokedAt) {
          session.revokedAt = new Date().toISOString()
          session.revokedBy = this.currentUser?.name || 'Sistema local'
          count += 1
        }
      })

      if (this.session.currentUserId === userId) {
        this.session.currentUserId = null
        this.session.currentSessionId = null
        this.activeView = 'dashboard'
      }

      appendAuditEvent(this.$state, {
        entity: 'seguridad',
        action: 'Cerrar sesiones',
        description: `Se cerraron ${count} sesiones activas de ${user.name}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Sesiones cerradas.',
        detail: `${count} sesiones revocadas para ${user.name}.`,
      }
    },
    updateRolePermission(payload: Record<string, unknown>) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede editar permisos.',
        }
      }

      const role = payload.role as string
      const moduleId = payload.moduleId as string
      const permission = payload.permission as string
      const reason = (typeof payload.reason === 'string' ? payload.reason : JSON.stringify(payload.reason || '')).trim()

      if (role === 'Administrador') {
        return {
          ok: false,
          message: 'Los permisos del rol Administrador son heredados y no se pueden editar.',
        }
      }

      if (!ROLE_OPTIONS.includes(role) || !PERMISSION_MODULES.some((module) => module.id === moduleId)) {
        return {
          ok: false,
          message: 'Seleccion de rol o modulo invalida.',
        }
      }
      if (!reason) {
        return {
          ok: false,
          message: 'Debes registrar un motivo para cambiar permisos RBAC.',
        }
      }

      const roleAccess = this.getRoleAccess(role)
      const permissions = new Set(roleAccess[moduleId] || [])
      const wasAllowed = permissions.has(permission)
      const nextAllowed = Boolean(payload.allowed)

      if (wasAllowed === nextAllowed) {
        return {
          ok: true,
          message: 'Sin cambios.',
          detail: `${role} ya tenía ese permiso en ese estado.`,
        }
      }

      this.roleAccessHistory.unshift({
        id: uid('rbacv'),
        at: new Date().toISOString(),
        actor: this.currentUser?.name || 'Sistema local',
        role,
        moduleId,
        permission,
        before: wasAllowed,
        after: nextAllowed,
        snapshot: JSON.parse(JSON.stringify(this.roleAccess)),
      })
      this.roleAccessHistory = this.roleAccessHistory.slice(0, 40)

      if (nextAllowed) {
        permissions.add(permission)
      } else {
        permissions.delete(permission)
      }

      roleAccess[moduleId] = [...permissions]
      appendAuditEvent(this.$state, {
        entity: 'rbac',
        action: nextAllowed ? 'Permiso concedido' : 'Permiso retirado',
        description: `${
          this.currentUser?.name || 'Sistema local'
        } cambió el permiso '${permission}' de '${role}' en '${moduleId}' de ${wasAllowed ? 'TRUE' : 'FALSE'} a ${
          nextAllowed ? 'TRUE' : 'FALSE'
        }. Motivo: ${reason}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Permisos actualizados.',
        detail: `${role} actualizado.`,
      }
    },
    restorePreviousRoleAccessVersion() {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede restaurar versiones RBAC.',
        }
      }

      const previousVersion = this.roleAccessHistory.shift()
      if (!previousVersion?.snapshot) {
        return {
          ok: false,
          message: 'No hay versiones previas para restaurar.',
        }
      }

      this.roleAccess = normalizeRoleAccess(previousVersion.snapshot)
      appendAuditEvent(this.$state, {
        entity: 'rbac',
        action: 'Restaurar versión',
        description: `${
          this.currentUser?.name || 'Sistema local'
        } restauró una versión RBAC anterior (${previousVersion.at}).`,
        actor: this.currentUser?.name || 'Sistema local',
        severity: 'warning',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Versión RBAC restaurada.',
        detail: 'Se aplicó la configuración inmediatamente.',
      }
    },
    duplicateRolePermissions(sourceRole: string, targetRole: string) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede duplicar roles.',
        }
      }
      if (!ROLE_OPTIONS.includes(sourceRole) || !ROLE_OPTIONS.includes(targetRole) || sourceRole === targetRole) {
        return {
          ok: false,
          message: 'Selecciona roles válidos y diferentes.',
        }
      }
      if (targetRole === 'Administrador') {
        return {
          ok: false,
          message: 'No se puede sobrescribir el rol Administrador.',
        }
      }

      this.roleAccessHistory.unshift({
        id: uid('rbacv'),
        at: new Date().toISOString(),
        actor: this.currentUser?.name || 'Sistema local',
        role: targetRole,
        moduleId: 'all',
        permission: 'copy',
        before: true,
        after: true,
        snapshot: JSON.parse(JSON.stringify(this.roleAccess)),
      })
      this.roleAccessHistory = this.roleAccessHistory.slice(0, 40)

      this.roleAccess[targetRole] = JSON.parse(JSON.stringify(this.roleAccess[sourceRole] || {}))
      this.roleAccess = normalizeRoleAccess(this.roleAccess)

      appendAuditEvent(this.$state, {
        entity: 'rbac',
        action: 'Duplicar rol',
        description: `${this.currentUser?.name || 'Sistema local'} duplicó permisos de ${sourceRole} hacia ${targetRole}.`,
        actor: this.currentUser?.name || 'Sistema local',
        severity: 'info',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Rol duplicado.',
        detail: `${targetRole} ahora replica permisos de ${sourceRole}.`,
      }
    },
    upsertMembership(payload: Record<string, string>) {
      const user = this.users.find((item) => item.id === payload.userId)
      const tenant = this.tenants.find((item) => item.id === payload.tenantId)
      const role = payload.role

      if (!user || !tenant || !ROLE_OPTIONS.includes(role)) {
        return {
          ok: false,
          message: 'Selecciona usuario, empresa y rol validos.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(payload.userId, 'actualizar')
      if (protectedUserError) {
        return protectedUserError
      }

      const existingMembership = this.memberships.find(
        (membership) => membership.userId === user.id && membership.tenantId === tenant.id,
      )

      if (existingMembership) {
        existingMembership.role = role
      } else {
        this.memberships.push({
          userId: user.id,
          tenantId: tenant.id,
          role,
        })
      }

      const securityProfile = this.ensureUserSecurity(user.id)
      if (role === 'Administrador' || role === 'Contador') {
        securityProfile.twoFactorRequired = true
      }

      appendAuditEvent(this.$state, {
        tenantId: tenant.id,
        entity: 'rbac',
        action: 'Upsert membresia',
        description: `Se asigno/actualizo el rol de ${user.name} a ${role} en ${tenant.name}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Membresia actualizada.',
      }
    },
    /* c8 ignore next 15 */
    async updatePassword(payload: Record<string, string>) {
      const userId = payload.userId
      const newPassword = payload.password
      const user = this.users.find(u => u.id === userId)
      if (!user) return { ok: false, message: 'Usuario no encontrado.' }
      
      const creds = await createPasswordCredentials(newPassword)
      user.passwordHash = creds.passwordHash
      user.passwordSalt = creds.passwordSalt
      
      const security = this.ensureUserSecurity(userId)
      security.passwordUpdatedAt = new Date().toISOString()
      security.passwordResetRequired = false
      
      this.saveState()
      return { ok: true, message: 'Clave actualizada.' }
    },
    removeMembership(payload: Record<string, string>) {
      const userId = payload.userId
      const tenantId = payload.tenantId
      const user = this.users.find((item) => item.id === userId)
      const tenant = this.tenants.find((item) => item.id === tenantId)

      if (!user || !tenant) {
        return { ok: false, message: 'Usuario o empresa no validos.' }
      }

      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede revocar accesos.',
        }
      }

      const protectedUserError = this.protectSystemOwnerTarget(payload.userId, 'revocar')
      if (protectedUserError) {
        return protectedUserError
      }

      if (this.currentUser?.id === user.id && this.activeTenantId === tenant.id) {
        return {
          ok: false,
          message: 'No puedes revocar tu propio acceso al tenant activo.',
        }
      }

      const before = this.memberships.length
      this.memberships = this.memberships.filter(
        (membership) => !(membership.userId === user.id && membership.tenantId === tenant.id),
      )

      if (this.memberships.length === before) {
        return {
          ok: false,
          message: 'Ese acceso no existe.',
        }
      }

      this.userSessions.forEach((session) => {
        if (session.userId === user.id && session.tenantId === tenant.id && !session.revokedAt) {
          session.revokedAt = new Date().toISOString()
          session.revokedBy = this.currentUser?.name || 'Sistema local'
        }
      })

      appendAuditEvent(this.$state, {
        tenantId: tenant.id,
        entity: 'usuario',
        action: 'Revocar acceso',
        description: `Se revoco el acceso de ${user.name} a ${tenant.name}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      ensureActiveTenantAccess(this.$state)
      ensureActiveViewAccess(this.$state)
      this.saveState()

      return {
        ok: true,
        message: 'Acceso revocado.',
        detail: `${user.name} ya no accede a ${tenant.name}.`,
      }
    },
    bulkUserAction(payload: BulkUserActionPayload) {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede ejecutar acciones masivas.',
        }
      }

      const userIds = Array.isArray(payload.userIds) ? payload.userIds : []
      const users = this.users.filter((user) => userIds.includes(user.id))

      if (!users.length) {
        return {
          ok: false,
          message: 'Selecciona al menos un usuario.',
        }
      }

      let affected = 0

      users.forEach((user) => {
        if (user.isSystemOwner && this.currentUser?.id !== user.id) {
          return
        }

        if (payload.action === 'activate') {
          user.status = 'active'
          affected += 1
        }

        if (payload.action === 'deactivate') {
          if (user.id !== this.currentUser?.id) {
            user.status = 'inactive'
          }
          this.userSessions.forEach((session) => {
            if (session.userId === user.id && !session.revokedAt) {
              session.revokedAt = new Date().toISOString()
              session.revokedBy = this.currentUser?.name || 'Sistema local'
            }
          })
          affected += 1
        }

        if (payload.action === 'require-2fa') {
          this.ensureUserSecurity(user.id).twoFactorRequired = true
          affected += 1
        }

        if (payload.action === 'force-reset') {
          const securityProfile = this.ensureUserSecurity(user.id)
          securityProfile.passwordResetRequired = true
          securityProfile.resetRequestedAt = new Date().toISOString()
          affected += 1
        }

        if (payload.action === 'change-role' && payload.role && ROLE_OPTIONS.includes(payload.role)) {
          const tenantId = payload.tenantId || this.activeTenantId
          const existingMembership = this.memberships.find(
            (membership) => membership.userId === user.id && membership.tenantId === tenantId,
          )

          if (existingMembership) {
            existingMembership.role = payload.role || 'Visor'
          } else {
            this.memberships.push({ userId: user.id, tenantId: tenantId || '', role: payload.role || 'Visor' })
          }
          affected += 1
        }
      })

      appendAuditEvent(this.$state, {
        entity: 'usuario',
        action: 'Accion masiva',
        description: `Se ejecuto ${payload.action} sobre ${affected} usuarios.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      ensureActiveTenantAccess(this.$state)
      ensureActiveViewAccess(this.$state)
      this.saveState()

      return {
        ok: true,
        message: 'Accion masiva ejecutada.',
        detail: `${affected} usuarios actualizados.`,
      }
    },
    createInvitation(payload: InvitationPayload) {
      /* c8 ignore start */
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede invitar usuarios.',
        }
      }
      /* c8 ignore stop */

      const email = (payload.email || '').trim().toLowerCase()
      if (!isValidEmail(email)) {
        return {
          ok: false,
          message: 'Ingresa un correo electrónico válido.',
        }
      }

      const tenant = this.tenants.find((item) => item.id === payload.tenantId)
      const role = payload.role

      if (!tenant || !ROLE_OPTIONS.includes(role)) {
        return {
          ok: false,
          message: 'Completa empresa y rol para invitar.',
        }
      }

      const invitation = {
        id: uid('invitation'),
        email,
        tenantId: tenant.id,
        role,
        status: 'pending',
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: this.currentUser?.name || 'Sistema local',
        customMessage: (payload.customMessage || '').trim(),
        resendCount: 0,
        resentAt: null,
      }

      this.invitations.unshift(invitation)
      appendAuditEvent(this.$state, {
        tenantId: tenant.id,
        entity: 'usuario',
        action: 'Invitar',
        description: `Se invito a ${email} como ${role} en ${tenant.name}.`,
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Invitacion enviada.',
        detail: `${email} tiene 72 horas para aceptar.`,
      }
    },
    resendInvitation(invitationId: string) {
      /* c8 ignore start */
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede reenviar invitaciones.',
        }
      }
      /* c8 ignore stop */

      const invitation = this.invitations.find((item) => item.id === invitationId)
      /* c8 ignore start */
      if (!invitation) {
        return {
          ok: false,
          message: 'No se encontro la invitacion.',
        }
      }
      /* c8 ignore stop */

      invitation.status = 'pending'
      invitation.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      invitation.resendCount = Number(invitation.resendCount || 0) + 1
      invitation.resentAt = new Date().toISOString()

      appendAuditEvent(this.$state, {
        tenantId: invitation.tenantId,
        entity: 'usuario',
        action: 'Reenviar invitacion',
        description: `Se reenvio la invitacion para ${invitation.email} (${invitation.role}).`,
        actor: this.currentUser?.name || 'Sistema local',
        severity: 'warning',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Invitacion reenviada.',
        detail: `${invitation.email} tiene una nueva vigencia de 72 horas.`,
      }
    },
    /* c8 ignore next 43 */
    runOcr(source: string) {
      if (!this.can('run_ocr')) {
        return {
          ok: false,
          message: 'Tu rol actual no puede ejecutar OCR en esta empresa.',
        }
      }

      const normalizedSource = (source || '').trim()

      if (!normalizedSource) {
        return {
          ok: false,
          message: 'Pega primero un texto o contenido OCR.',
        }
      }

      const result = extractFieldsFromText(normalizedSource)
      const run = {
        id: uid('ocr'),
        tenantId: this.activeTenantId || '',
        sourcePreview: normalizedSource.slice(0, 180),
        fields: result.fields,
        confidence: result.confidence,
        source: normalizedSource,
        createdAt: new Date().toISOString(),
      }

      this.ocrRuns.unshift(run)
      this.selections.ocrRunId = run.id
      appendAuditEvent(this.$state, {
        entity: 'ia',
        action: 'Analizar soporte',
        description: 'Se ejecuto OCR y sugerencias contables sobre un documento.',
        actor: this.currentUser?.name || 'Sistema local',
      })
      this.saveState()

      return {
        ok: true,
        message: 'Documento analizado.',
        detail: `Confianza estimada: ${Math.round(run.confidence * 100)}%.`,
      }
    },
    /* c8 ignore next 51 */
    scheduleDianUpdates(invoiceId: string, tenantId: string) {
      /* c8 ignore next 3 */
      if (typeof globalThis === 'undefined') {
        return
      }

      const transitions = [
        {
          delay: 1200,
          status: 'enviada',
          note: 'Documento transmitido al proveedor tecnologico.',
          audit: 'Factura enviada a DIAN para validacion.',
        },
        {
          delay: 2800,
          status: 'aceptada',
          note: 'DIAN acepto el documento y devolvio acuse positivo.',
          audit: 'Factura validada y aceptada por el flujo DIAN.',
        },
      ]

      clearScheduledDianUpdates(invoiceId)
      const timerIds: any[] = []

      transitions.forEach((transition) => {
        const timerId = globalThis.setTimeout(() => {
          const wasUpdated = pushInvoiceTimeline(this.$state, invoiceId, transition.status, transition.note)

          if (!wasUpdated) {
            return
          }

          appendAuditEvent(this.$state, {
            tenantId,
            entity: 'dian',
            action: 'Actualizar estado',
            description: transition.audit,
            actor: 'Worker DIAN',
          })
          this.saveState()

          if (transition.status === 'aceptada') {
            clearScheduledDianUpdates(invoiceId)
          }
        }, transition.delay)

        timerIds.push(timerId)
      })

      scheduledDianTimers.set(invoiceId, timerIds)
    },
    /* c8 ignore next 38 */
    /* c8 ignore start */
    exportUsers() {
      const headers = ['Nombre', 'Email', 'Estado', 'Titulo', 'Rol', 'Empresa', '2FA', 'Ultimo acceso']
      const rows = this.users.map((user) => {
        const membership = this.memberships.find((m) => m.userId === user.id && m.tenantId === this.activeTenantId)
        const role = membership?.role || 'Sin acceso'
        const twoFactor = this.userSecurity.find((s) => s.userId === user.id)?.twoFactorEnabled ? 'Si' : 'No'
        return [
          user.name,
          user.email,
          user.status === 'active' ? 'Activo' : 'Inactivo',
          user.title || '',
          role,
          this.activeTenant?.name || '',
          twoFactor,
          user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Sin ingreso',
        ]
      })

      const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `usuarios-${this.activeTenant?.prefix || 'export'}-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)

      appendAuditEvent(this.$state, {
        tenantId: this.activeTenantId || '',
        entity: 'usuario',
        action: 'Exportar',
        description: `Se exportaron ${rows.length} usuarios a CSV.`,
        actor: this.currentUser?.name || 'Sistema',
        severity: 'info',
      })
      this.saveState()

      return { ok: true, message: `Se exportaron ${rows.length} usuarios.` }
    },
    /* c8 ignore stop */
    panicLogoutAll() {
      if (!this.can('manage_users')) {
        return {
          ok: false,
          message: 'Solo un Administrador puede ejecutar el cierre de emergencia.',
        }
      }

      const now = new Date().toISOString()
      let count = 0
      for (const session of this.userSessions) {
        if (!session.revokedAt) {
          session.revokedAt = now
          session.revokedBy = this.currentUser?.name || 'Admin'
          count++
        }
      }
      this.session.currentUserId = null
      this.session.currentSessionId = null
      appendAuditEvent(this.$state, {
        tenantId: this.activeTenantId || '',
        entity: 'auth',
        action: 'Cierre de emergencia',
        description: `Se cerraron ${count} sesiones activas en todos los usuarios por posible brecha de seguridad.`,
        actor: this.currentUser?.name || 'Sistema',
        severity: 'error',
      })
      this.saveState()
      return { ok: true, message: `Se cerraron ${count} sesiones activas.` }
    },
  },
})
