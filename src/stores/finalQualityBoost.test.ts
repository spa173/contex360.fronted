import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAccountingStore } from './accountingStore'
import { useAiStore } from './aiStore'
import { useBillingStore } from './billingStore'
import { useStateStore } from './stateStore'
import { useThirdPartiesStore } from './thirdPartiesStore'
import { useUsersStore } from './usersStore'
import { generateInvoicePdf } from '../utils/pdfGenerator'

// Mock jsPDF
vi.mock('jspdf', () => {
  return {
    jsPDF: class {
      setFillColor() {}
      rect() {}
      setFontSize() {}
      setTextColor() {}
      setFont() {}
      text() {}
      splitTextToSize() { return ['line1'] }
      addPage() {}
      setDrawColor() {}
      line() {}
      save() {}
    }
  }
})

// Mock crypto for CUFE generation
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {
    getRandomValues: (arr: Uint8Array) => arr.fill(0),
  }
}

describe('Final Quality Boost Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('AccountingStore reflects state correctly', () => {
    const state = useStateStore()
    const accounting = useAccountingStore()
    
    expect(accounting.tenantLedgerEntries).toEqual(state.tenantLedgerEntries)
    expect(accounting.selectedEntry).toEqual(state.selectedEntry)
  })

  it('AiStore reflects state and permissions', () => {
    const state = useStateStore()
    const ai = useAiStore()
    
    expect(ai.tenantOcrRuns).toEqual(state.tenantOcrRuns)
    expect(ai.canRunOcr).toBe(state.can('run_ocr'))
  })

  it('BillingStore reflects state correctly', () => {
    const state = useStateStore()
    const billing = useBillingStore()
    
    expect(billing.tenantInvoices).toEqual(state.tenantInvoices)
    expect(billing.selectedInvoice).toEqual(state.selectedInvoice)
  })

  it('ThirdPartiesStore reflects state correctly', () => {
    const state = useStateStore()
    const tp = useThirdPartiesStore()
    
    expect(tp.tenantThirdParties).toEqual(state.tenantThirdParties)
    expect(tp.canManageThirdParties).toBe(state.can('manage_third_parties'))
  })

  it('UsersStore reflects state correctly', () => {
    const state = useStateStore()
    const users = useUsersStore()
    
    expect(users.usersForActiveTenant).toEqual(state.usersForActiveTenant)
    expect(users.canManageUsers).toBe(state.can('manage_users'))
  })

  it('pdfGenerator creates a document correctly', () => {
    const mockInvoice = {
      consecutive: 'FE-123',
      client: { name: 'Client A', nit: '123' },
      items: [{ productName: 'Item 1', quantity: 1, unitPrice: 100, total: 100 }],
      subtotal: 100,
      taxTotal: 19,
      total: 119,
      issuedAt: '2026-05-01',
      notes: 'Some notes',
    }
    const mockTenant = { name: 'Tenant A', city: 'Bogota' }
    
    expect(() => generateInvoicePdf(mockInvoice, mockTenant)).not.toThrow()
  })
})
