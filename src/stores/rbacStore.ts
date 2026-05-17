import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { uid, appendAuditEvent } from '../utils/storeHelpers'

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
    permissions: ['view_dashboard','export_dashboard','manage_dashboard','view_billing','create_billing','manage_billing','view_inventory','manage_inventory','view_third_parties','manage_third_parties','view_accounting','manage_accounting','run_ocr','manage_users','manage_settings'],
    views: ['dashboard','billing','inventory','accounting','third-parties','users','ai','profile'],
    access: { dashboard:['view','export','configure'], billing:['view','create','edit','approve','export','configure'], inventory:['view','create','edit','approve','export','configure'], accounting:['view','create','edit','approve','export','configure'], 'third-parties':['view','create','edit','export','configure'], users:['view','create','edit','approve','export','configure'], ai:['view','create','edit','export','configure'] },
  },
  {
    id: 'Administrador',
    permissions: ['view_dashboard','export_dashboard','manage_dashboard','view_billing','create_billing','manage_billing','view_inventory','manage_inventory','view_third_parties','manage_third_parties','view_accounting','manage_accounting','run_ocr','manage_users'],
    views: ['dashboard','billing','inventory','accounting','third-parties','users','ai','profile'],
    access: { dashboard:['view','export','configure'], billing:['view','create','edit','approve','export','configure'], inventory:['view','create','edit','approve','export','configure'], accounting:['view','create','edit','approve','export','configure'], 'third-parties':['view','create','edit','export','configure'], users:['view','create','edit','approve','export','configure'], ai:['view','create','edit','export','configure'] },
  },
  {
    id: 'Contador',
    permissions: ['view_dashboard','export_dashboard','view_billing','create_billing','manage_billing','view_inventory','manage_inventory','view_third_parties','manage_third_parties','view_accounting','manage_accounting','run_ocr'],
    views: ['dashboard','billing','inventory','accounting','third-parties','ai','profile'],
    access: { dashboard:['view','export'], billing:['view','create','edit','export'], inventory:['view','create','edit','export'], accounting:['view','create','edit','approve','export'], 'third-parties':['view','create','edit'], users:[], ai:['view','create'] },
  },
  {
    id: 'Auxiliar contable',
    permissions: ['view_dashboard','view_billing','create_billing','view_accounting','create_accounting','view_third_parties','manage_third_parties','run_ocr'],
    views: ['dashboard','billing','accounting','third-parties','ai','profile'],
    access: { dashboard:['view'], billing:['view','create'], inventory:['view'], accounting:['view','create'], 'third-parties':['view','create'], users:[], ai:['view','create'] },
  },
  {
    id: 'Gerencia',
    permissions: ['view_dashboard','export_dashboard','view_billing','export_billing','view_inventory','export_inventory','view_accounting','export_accounting','view_third_parties'],
    views: ['dashboard','accounting','profile'],
    access: { dashboard:['view','export'], billing:['view','export'], inventory:['view','export'], accounting:['view','export'], 'third-parties':['view'], users:[], ai:['view'] },
  },
  {
    id: 'Visor',
    permissions: ['view_dashboard','export_dashboard','view_billing','export_billing','view_inventory','export_inventory','view_accounting','export_accounting','view_third_parties'],
    views: ['dashboard','billing','inventory','accounting','third-parties','profile'],
    access: { dashboard:['view','export'], billing:['view','export'], inventory:['view','export'], accounting:['view','export'], 'third-parties':['view','export'], users:[], ai:[] },
  },
  {
    id: 'Operador',
    permissions: ['view_dashboard','view_billing','create_billing','view_inventory','manage_inventory','view_third_parties'],
    views: ['dashboard','billing','inventory','third-parties','profile'],
    access: { dashboard:['view'], billing:['view','create'], inventory:['view','create','edit'], 'third-parties':['view','create'], users:[], ai:[] },
  },
]

export const ROLE_OPTIONS = ROLE_DEFINITIONS.map(r => r.id)

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
    
    appendAuditEvent(root.$state, {
      entity: 'rbac',
      action: 'Cambio Permiso',
      description: `Rol ${payload.role} -> ${payload.moduleId}.${payload.permission} = ${payload.allowed}. Motivo: ${payload.reason}`,
      actor: root.currentUser?.name || 'Sistema',
    })
    root.saveState()
    return { ok: true, message: 'Permisos actualizados.' }
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
