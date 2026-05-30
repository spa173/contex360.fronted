import { defineStore } from 'pinia'
import { businessApi } from '../services/businessApi'
import { refreshAccessToken } from '../services/authApi'
import { 
  getMembershipForTenant, 
  normalizeRoleAccess,
  Membership,
  RoleAccessHistoryEntry
} from './rbacStore'
import { createInitialState, normalizeState } from './stateNormalization'
import { Product, InventoryMovement, InventoryTransfer } from '../types/inventory'
import { encryptData, decryptData, initEncryptionKey } from '../utils/security'

const STORAGE_KEY = ['contex360', 'mvp', 'state', 'v2'].join('-')

// Types
export interface User {
  id: string; name: string; email: string; status: 'active' | 'inactive'; 
  title: string; isSystemOwner: boolean; [key: string]: any 
}
export interface Tenant { id: string; name: string; prefix: string; [key: string]: any }
export interface AuditEvent { id: string; tenantId: string; entity: string; action: string; description: string; at: string; actor: string; severity: string }
export interface AuditPayload { tenantId?: string; entity: string; action: string; description: string; actor?: string; severity?: string; attachmentUrl?: string }
export interface OcrRun { id: string; tenantId: string; source: string; fields: any; confidence: number; createdAt: string }
export interface Subscription {
  planType: string;
  active: boolean;
  trialEndsAt: string | null;
  invoicesThisMonth: number;
  limits: {
    name: string;
    priceMonthly: number;
    priceAnnual: number;
    maxUsers: number | null;
    maxInvoicesPerMonth: number | null;
    modules: string[];
  };
}

export interface AppState {
  users: User[]; tenants: Tenant[]; memberships: Membership[];
  thirdParties: any[]; products: Product[]; invoices: any[];
  ledgerEntries: any[]; inventoryMovements: InventoryMovement[];
  inventoryTransfers: InventoryTransfer[]; ocrRuns: OcrRun[];
  userSecurity: any[]; userSessions: any[]; invitations: any[];
  auditEvents: AuditEvent[]; roleAccess: any; roleAccessHistory: RoleAccessHistoryEntry[];
  activeTenantId: string | null; activeView: string; 
  subscription: Subscription | null;
  session: { currentUserId: string | null; currentSessionId: string | null };
  selections: { invoiceId: string | null; ocrRunId: string | null };
  [key: string]: any
}

export const useStateStore = defineStore('state', {
  state: (): AppState => createInitialState(),
  getters: {
    currentUser(state): User | null { return state.users.find(u => u.id === state.session.currentUserId) || null },
    activeTenant(state): Tenant | null { return state.tenants.find(t => t.id === state.activeTenantId) || null },
    tenantOcrRuns(state): OcrRun[] { return (state.ocrRuns || []).filter((r: OcrRun) => r.tenantId === state.activeTenantId) },
    selectedOcrRun(state): OcrRun | null { return state.ocrRuns?.find((r: OcrRun) => r.id === state.selections?.ocrRunId) || null },
    tenantInvoices(state): any[] { return (state.invoices || []).filter((i: any) => i.tenantId === state.activeTenantId) },
    tenantProducts(state): Product[] { return (state.products || []).filter((p: Product) => p.tenantId === state.activeTenantId) },
    activeMembership(state): Membership | null {
      if (!state.session.currentUserId || !state.activeTenantId) return null
      const membership = getMembershipForTenant(state.session.currentUserId, state.activeTenantId, state.memberships)
      if (!membership && this.currentUser?.isSystemOwner) {
        return { userId: state.session.currentUserId, tenantId: state.activeTenantId, role: 'Administrador' }
      }
      return membership
    },
    rolePermissions(state): string[] {
      if (this.currentUser?.isSystemOwner) {
        // Full access for root
        return ['all']
      }
      const role = this.activeMembership?.role
      if (!role) return []
      const modules = state.roleAccess[role] || {}
      return Object.values(modules).flat() as string[]
    }
  },
  actions: {
    async saveState() {
      const serialized = JSON.stringify(this.$state)
      const encrypted = await encryptData(serialized)
      localStorage.setItem(STORAGE_KEY, encrypted)
    },
    
    async setActiveView(view: string) {
      this.activeView = view
      await this.saveState()
      return { ok: true }
    },

    async hydrateState() {
      await initEncryptionKey()
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      try {
        const decrypted = await decryptData(raw)
        const parsed = JSON.parse(decrypted)
        this.$patch(normalizeState(parsed) as any)
      } catch {
        // State is unrecoverable (e.g., new session key), start fresh
      }
    },

    async setActiveTenant(tenantId: string) {
      this.activeTenantId = tenantId
      await this.fetchBusinessData()
      await this.saveState()
      return { ok: true }
    },

    async fetchBusinessData() {
      if (!this.activeTenantId || !this.session.currentUserId) return
      try {
        const thirdParties = await businessApi.getThirdParties(undefined, this.activeTenantId)
        this.thirdParties = Array.isArray(thirdParties) ? thirdParties : []
      } catch (error: any) { 
        this.thirdParties = []
        if (error.message?.includes('403') || error.message?.includes('401')) return
        console.error('Error fetching business data:', error) 
      }
      await this.saveState()
    },

    can(permission: string): boolean {
      return (this.rolePermissions || []).includes(permission)
    },

    async fetchOcrRuns() {
      if (!this.activeTenantId) return
      try {
        const runs = await businessApi.getOcrRuns(this.activeTenantId)
        this.ocrRuns = Array.isArray(runs) ? runs : []
        await this.saveState()
      } catch { /* non-critical */ }
    },

    async runOcr(fileOrSource: File | string): Promise<{ ok: boolean; message: string; detail?: string }> {
      if (!this.activeTenantId) {
        return { ok: false, message: 'No hay empresa activa.' }
      }
      try {
        let response: any
        if (fileOrSource instanceof File) {
          // Multipart upload to POST /ocr/upload
          const formData = new FormData()
          formData.append('file', fileOrSource)
          const url = businessApi.getOcrUploadUrl()
          const { getCsrfToken } = await import('../services/csrf')
          const csrf = getCsrfToken()
          const headers: Record<string, string> = { 'x-tenant-id': this.activeTenantId }
          if (csrf) headers['X-CSRF-Token'] = csrf
          const res = await fetch(url, { method: 'POST', headers, credentials: 'include', body: formData })
          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            return { ok: false, message: 'Error OCR', detail: err.message || `HTTP ${res.status}` }
          }
          response = await res.json()
        } else {
          // Legacy text-only path — send as JSON to AI chat endpoint
          const aiResponse = await businessApi.chatWithAi(
            `Analiza este texto OCR de una factura y extrae los datos contables: ${fileOrSource}`
          )
          response = { status: 'processed', fields: aiResponse?.fields || {}, confidence: aiResponse?.confidence || 0 }
        }

        if (response?.ocrRunId) {
          await this.fetchOcrRuns()
          this.selections = { ...this.selections, ocrRunId: response.ocrRunId }
          await this.saveState()
        }
        return { ok: true, message: 'Documento procesado', detail: `Confianza: ${Math.round((response?.confidence || 0) * 100)}%` }
      } catch (e: any) {
        return { ok: false, message: 'Error al procesar', detail: e.message }
      }
    },

    async refreshSessionWithBackend() {
      try {
        const response = await businessApi.me()
        this.activeTenantId = response.activeTenantId
        this.memberships = response.memberships
        this.tenants = response.accessibleTenants
        this.subscription = response.subscription || null
        await this.fetchBusinessData()
        return true
      } catch {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          if (refreshed.user) {
            const existingIndex = this.users.findIndex(u => u.id === refreshed.user.id)
            if (existingIndex !== -1) {
              this.users[existingIndex] = { ...this.users[existingIndex], ...refreshed.user } as any
            } else {
              this.users.unshift(refreshed.user as any)
            }
          }
          this.session.currentUserId = refreshed.user?.id || this.session.currentUserId
          this.session.currentSessionId = refreshed.session?.id || this.session.currentSessionId
          this.activeTenantId = refreshed.activeTenantId
          this.memberships = refreshed.memberships as any
          this.tenants = refreshed.accessibleTenants as any
          this.subscription = refreshed.subscription || null
          await this.fetchBusinessData()
          return true
        }
        this.session.currentUserId = null
        this.session.currentSessionId = null
        this.activeTenantId = null
        await this.saveState()
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
