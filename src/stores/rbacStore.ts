import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

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

export const ROLE_OPTIONS = ['owner', 'Administrador', 'Contador', 'Auxiliar contable', 'Gerencia', 'Visor', 'Operador']

export interface RoleAccessHistoryEntry {
  id: string; at: string; actor: string; role: string; moduleId: string; 
  permission: string; before: boolean; after: boolean; snapshot: any
}

export interface Membership { userId: string; tenantId: string; role: string }

export function getMembershipForTenant(userId: string, tenantId: string, memberships: Membership[]) {
  return memberships.find(m => m.userId === userId && m.tenantId === tenantId) || null
}

export function getMembershipsForUser(userId: string, memberships: Membership[]) {
  return memberships.filter(m => m.userId === userId)
}

export function normalizeRoleAccess(access: any) { return access || {} }

export const useRBACStore = defineStore('rbac', () => {
  const root = useStateStore()

  function updateRolePermission(payload: { role: string, moduleId: string, permission: string, allowed: boolean, reason: string }) {
    if (!root.roleAccess[payload.role]) root.roleAccess[payload.role] = {}
    if (!root.roleAccess[payload.role][payload.moduleId]) root.roleAccess[payload.role][payload.moduleId] = []
    
    const perms = new Set(Array.isArray(root.roleAccess?.[payload.role]?.[payload.moduleId]) ? root.roleAccess[payload.role][payload.moduleId] : [])
    if (payload.allowed) perms.add(payload.permission)
    else perms.delete(payload.permission)
    
    root.roleAccess[payload.role][payload.moduleId] = Array.from(perms)
    
    root.saveState()
    return { ok: true, message: 'Permisos actualizados. Los cambios se sincronizarán con el backend.' }
  }

  function restorePreviousRoleAccessVersion() {
    const prev = root.roleAccessHistory[0]
    if (prev?.snapshot) {
      root.roleAccess = JSON.parse(JSON.stringify(prev.snapshot))
      root.saveState()
      return { ok: true, message: 'Versión previa restaurada.' }
    }
    return { ok: false, message: 'No hay versión previa.' }
  }

  function duplicateRolePermissions(sourceRole: string, targetRole: string) {
    if (root.roleAccess?.[sourceRole]) {
      root.roleAccess[targetRole] = JSON.parse(JSON.stringify(root.roleAccess[sourceRole]))
      root.saveState()
      return { ok: true, message: `Permisos copiados de ${sourceRole} a ${targetRole}.` }
    }
    return { ok: false, message: 'Rol origen no tiene configuración.' }
  }

  return {
    updateRolePermission,
    restorePreviousRoleAccessVersion,
    duplicateRolePermissions,
  }
})
