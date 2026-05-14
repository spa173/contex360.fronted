import { defineStore } from 'pinia'
import { businessApi } from '../services/businessApi'
import { refreshAccessToken, storeAuthToken, clearAuthToken } from '../services/authApi'
import { 
  getMembershipForTenant, 
  normalizeRoleAccess,
  Membership,
  RoleAccessHistoryEntry
} from './rbacStore'
import { createInitialState, normalizeState } from './stateNormalization'
import { Product, InventoryMovement, InventoryTransfer } from '../types/inventory'
import { encryptData, decryptData } from '../utils/security'

const STORAGE_KEY = 'contex360-mvp-state-v2'

// Types
export interface User {
  id: string; name: string; email: string; status: 'active' | 'inactive'; 
  title: string; isSystemOwner: boolean; [key: string]: any 
}
export interface Tenant { id: string; name: string; prefix: string; [key: string]: any }
export interface AuditEvent { id: string; tenantId: string; entity: string; action: string; description: string; at: string; actor: string; severity: string }
export interface OcrRun { id: string; tenantId: string; source: string; fields: any; confidence: number; createdAt: string }

export interface AppState {
  users: User[]; tenants: Tenant[]; memberships: Membership[];
  thirdParties: any[]; products: Product[]; invoices: any[];
  ledgerEntries: any[]; inventoryMovements: InventoryMovement[];
  inventoryTransfers: InventoryTransfer[]; ocrRuns: OcrRun[];
  userSecurity: any[]; userSessions: any[]; invitations: any[];
  auditEvents: AuditEvent[]; roleAccess: any; roleAccessHistory: RoleAccessHistoryEntry[];
  activeTenantId: string | null; activeView: string; 
  session: { currentUserId: string | null; currentSessionId: string | null };
  selections: { invoiceId: string | null; ocrRunId: string | null };
  [key: string]: any
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return createInitialState()
  
  try {
    const decrypted = decryptData(raw)
    const parsed = JSON.parse(decrypted || raw)
    return normalizeState(parsed)
  } catch {
    return createInitialState()
  }
}

export const useStateStore = defineStore('state', {
  state: (): AppState => loadState(),
  getters: {
    currentUser(state): User | null { return state.users.find(u => u.id === state.session.currentUserId) || null },
    activeTenant(state): Tenant | null { return state.tenants.find(t => t.id === state.activeTenantId) || null },
    activeMembership(state): Membership | null {
      if (!state.session.currentUserId || !state.activeTenantId) return null
      return getMembershipForTenant(state.session.currentUserId, state.activeTenantId, state.memberships)
    },
    rolePermissions(state): string[] {
      const role = this.activeMembership?.role
      if (!role) return []
      const modules = state.roleAccess[role] || {}
      return Object.values(modules).flat() as string[]
    }
  },
  actions: {
    saveState() {
      const serialized = JSON.stringify(this.$state)
      const encrypted = encryptData(serialized)
      localStorage.setItem(STORAGE_KEY, encrypted)
    },
    
    setActiveView(view: string) {
      this.activeView = view
      this.saveState()
    },

    hydrateState() {
      const state = loadState()
      this.$patch(state)
    },

    async setActiveTenant(tenantId: string) {
      this.activeTenantId = tenantId
      await this.fetchBusinessData()
      this.saveState()
      return { ok: true }
    },

    async fetchBusinessData() {
      if (!this.activeTenantId || !this.session.currentUserId) return
      try {
        const thirdParties = await businessApi.getThirdParties()
        this.thirdParties = Array.isArray(thirdParties) ? thirdParties : []
      } catch (error: any) { 
        this.thirdParties = []
        if (error.message?.includes('403') || error.message?.includes('401')) return
        console.error('Error fetching business data:', error) 
      }
      this.saveState()
    },

    can(permission: string): boolean { 
      return (this.rolePermissions || []).includes(permission) 
    },

    async refreshSessionWithBackend() {
      try {
        const response = await businessApi.me()
        this.activeTenantId = response.activeTenantId
        this.memberships = response.memberships
        this.tenants = response.accessibleTenants
        await this.fetchBusinessData()
        return true
      } catch {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          storeAuthToken(refreshed.accessToken)
          await this.fetchBusinessData()
          return true
        }
        this.session.currentUserId = null
        this.activeTenantId = null
        clearAuthToken()
        return false
      }
    },

    checkCurrentSessionHealth() {
      const session = this.userSessions.find(s => s.id === this.session.currentSessionId)
      if (session?.revokedAt) {
        return { revoked: true, message: 'Tu sesion ha sido revocada por un administrador.' }
      }
      return { revoked: false }
    },

    processScheduledDeactivations() {
      // Logic for scheduled deactivations
    }
  }
})
