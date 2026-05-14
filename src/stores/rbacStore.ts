
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

export const ROLE_DEFINITIONS = [
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
    views: ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'users', 'ai', 'profile'],
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
    views: ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'ai', 'profile'],
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
    views: ['dashboard', 'billing', 'accounting', 'third-parties', 'ai', 'profile'],
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
    views: ['dashboard', 'accounting', 'profile'],
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
    views: ['dashboard', 'billing', 'inventory', 'accounting', 'third-parties', 'profile'],
    access: {
      dashboard: ['view', 'export'],
      billing: ['view', 'export'],
      inventory: ['view', 'export'],
      accounting: ['view', 'export'],
      'third-parties': ['view', 'export'],
      users: [],
      ai: [],
    }
  }
];

export const ROLE_OPTIONS = ROLE_DEFINITIONS.map(r => r.id);
export const ROLE_PERMISSIONS = Object.fromEntries(ROLE_DEFINITIONS.map(r => [r.id, r.permissions]));
export const ROLE_VIEWS = Object.fromEntries(ROLE_DEFINITIONS.map(r => [r.id, r.views]));
export const DEFAULT_ROLE_ACCESS = Object.fromEntries(ROLE_DEFINITIONS.map(r => [r.id, r.access]));

export function hasEqualOrHigherPermissions(targetRole: string, sourceRole: string) {
  const sourcePermissions = new Set(ROLE_PERMISSIONS[sourceRole] || [])
  const targetPermissions = new Set(ROLE_PERMISSIONS[targetRole] || [])
  for (const permission of sourcePermissions) {
    if (!targetPermissions.has(permission)) {
      return false
    }
  }
  return true
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

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

export interface Membership {
  userId: string
  tenantId: string
  role: string
}

// ============================================================================
// PURE RBAC ACCESS FUNCTIONS
// ============================================================================

/**
 * Get visible views for a specific role
 * Pure function - no dependencies on global state
 */
export function getVisibleViewsForRole(role: string | null | undefined): string[] {
  if (!role) return ['dashboard']
  return ROLE_VIEWS[role] || ['dashboard']
}

/**
 * Check if a role has a specific permission on a module
 * Pure function for permission checks
 */
export function hasRolePermission(role: string, moduleId: string, action: string): boolean {
  const access = (DEFAULT_ROLE_ACCESS as Record<string, Record<string, string[]>>)[role]
  if (!access) return false
  const modulePermissions = access[moduleId]
  if (!Array.isArray(modulePermissions)) return false
  return modulePermissions.includes(action)
}

/**
 * Get all permissions for a role on a specific module
 */
export function getRoleModulePermissions(role: string, moduleId: string): string[] {
  const access = (DEFAULT_ROLE_ACCESS as Record<string, Record<string, string[]>>)[role]
  if (!access) return []
  const modulePermissions = access[moduleId]
  return Array.isArray(modulePermissions) ? [...modulePermissions] : []
}

/**
 * Normalize role access object with defaults
 * Ensures all roles and modules have valid permission arrays
 */
export function normalizeRoleAccess(
  sourceRoleAccess: Record<string, Record<string, string[]>> = {}
): Record<string, Record<string, string[]>> {
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

// ============================================================================
// MEMBERSHIP HELPERS
// ============================================================================

/**
 * Get all memberships for a user
 * Pure function - operates on provided memberships array
 */
export function getMembershipsForUser(userId: string, memberships: Membership[]): Membership[] {
  return memberships.filter((membership) => membership.userId === userId)
}

/**
 * Get membership for a user in a specific tenant
 * Returns null if no membership exists
 */
export function getMembershipForTenant(
  userId: string,
  tenantId: string,
  memberships: Membership[]
): Membership | null {
  return memberships.find(
    (membership) => membership.userId === userId && membership.tenantId === tenantId
  ) || null
}

/**
 * Get tenant IDs accessible to a user
 */
export function getAccessibleTenantIdsForUser(userId: string, memberships: Membership[]): string[] {
  const tenantIds = new Set(
    getMembershipsForUser(userId, memberships).map((item) => item.tenantId)
  )
  return Array.from(tenantIds)
}

/**
 * Check if user has access to a specific tenant
 */
export function hasTenantAccess(userId: string, tenantId: string, memberships: Membership[]): boolean {
  return memberships.some(
    (membership) => membership.userId === userId && membership.tenantId === tenantId
  )
}

// ============================================================================
// VIEW ACCESS HELPERS
// ============================================================================

/**
 * Build complete visible views list including system owner override
 * Use this for computed properties in stores/components
 */
export function buildVisibleViews(
  role: string | null | undefined,
  isSystemOwner: boolean = false
): string[] {
  const views = new Set(getVisibleViewsForRole(role))

  // Always include profile for authenticated users
  views.add('profile')

  // System owners always get admin console
  if (isSystemOwner) {
    views.add('admin-console')
  }

  return Array.from(views)
}

/**
 * Check if a view is accessible for a given role
 */
export function canAccessView(role: string | null | undefined, viewId: string, isSystemOwner: boolean = false): boolean {
  const visibleViews = buildVisibleViews(role, isSystemOwner)
  return visibleViews.includes(viewId)
}

// ============================================================================
// RBAC STORE COMPOSABLE (for use in Pinia stores)
// ============================================================================

export interface RBACState {
  roleAccess: Record<string, Record<string, string[]>>
  roleAccessHistory: RoleAccessHistoryEntry[]
}

export function createDefaultRBACState(): RBACState {
  return {
    roleAccess: JSON.parse(JSON.stringify(DEFAULT_ROLE_ACCESS)),
    roleAccessHistory: [],
  }
}
