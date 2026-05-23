import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBillingStore } from './billingStore'
import { useStateStore } from './stateStore'
import { useAccountingStore } from './accountingStore'
import { businessApi } from '../services/businessApi'

// Mock dependencies
vi.mock('../services/businessApi', () => ({
  businessApi: {
    getInvoices: vi.fn(),
    getNextInvoiceNumber: vi.fn(),
    createInvoice: vi.fn(),
    cancelInvoice: vi.fn(),
    sendInvoiceToDian: vi.fn(),
    checkDianInvoiceStatus: vi.fn(),
  }
}))

describe('Billing Store', () => {
  let billingStore: ReturnType<typeof useBillingStore>
  let stateStore: ReturnType<typeof useStateStore>
  let accountingStore: ReturnType<typeof useAccountingStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    stateStore = useStateStore()
    accountingStore = useAccountingStore()
    
    // Setup state before initializing billingStore because of watchers
    stateStore.activeTenantId = 'tenant-1'
    stateStore.session.currentUserId = 'user-1'
    stateStore.can = vi.fn().mockReturnValue(true) // Mock permissions
    
    billingStore = useBillingStore()
    vi.clearAllMocks()
  })

  it('should fetch invoices on init if tenant and user exist', async () => {
    const mockInvoices = [{ id: 'inv-99', number: 'FE-99', total: 100 }]
    vi.mocked(businessApi.getInvoices).mockResolvedValue(mockInvoices as any)
    
    await billingStore.fetchInvoices()
    
    expect(businessApi.getInvoices).toHaveBeenCalledWith('tenant-1')
    expect(billingStore.invoices.length).toBe(1)
    expect(billingStore.invoices[0].number).toBe('FE-99')
  })

  it('should compute tenantInvoices correctly', () => {
    billingStore.invoices = [
      { id: '1', tenantId: 'tenant-1', createdAt: '2023-01-02T00:00:00Z' },
      { id: '2', tenantId: 'tenant-2', createdAt: '2023-01-01T00:00:00Z' },
      { id: '3', tenantId: 'tenant-1', createdAt: '2023-01-03T00:00:00Z' },
    ] as any
    
    const result = billingStore.tenantInvoices
    expect(result.length).toBe(2)
    // Should be sorted by createdAt descending
    expect(result[0].id).toBe('3')
    expect(result[1].id).toBe('1')
  })

  it('should emit invoice successfully', async () => {
    const payload = {
      number: 'FE-100',
      total: 1000,
      subtotal: 800,
      taxTotal: 200,
      clientId: 'cli-1',
      date: new Date().toISOString(),
      items: [{ productName: 'Item 1', quantity: 1, unitPrice: 800, taxRate: 19, subtotal: 800, taxAmount: 152, total: 952 }]
    }
    
    const createdInvoice = { ...payload, id: 'inv-new', tenantId: 'tenant-1' }
    vi.mocked(businessApi.createInvoice).mockResolvedValue(createdInvoice as any)
    vi.mocked(businessApi.sendInvoiceToDian).mockResolvedValue({ success: true, cufe: '123' } as any)
    accountingStore.fetchLedgerEntries = vi.fn()
    
    const response = await billingStore.emitInvoice(payload)
    
    expect(response.ok).toBe(true)
    expect(billingStore.invoices[0].id).toBe('inv-new')
    expect(businessApi.createInvoice).toHaveBeenCalled()
    expect(accountingStore.fetchLedgerEntries).toHaveBeenCalled()
  })

  it('should fail emit if permission denied', async () => {
    stateStore.can = vi.fn().mockReturnValue(false)
    
    const response = await billingStore.emitInvoice({})
    expect(response.ok).toBe(false)
    expect(response.message).toContain('no permite')
  })

  it('should cancel invoice successfully', async () => {
    billingStore.invoices = [{ id: 'inv-1', status: 'accepted' }] as any
    
    vi.mocked(businessApi.cancelInvoice).mockResolvedValue({ id: 'inv-1', status: 'cancelled' } as any)
    
    const response = await billingStore.cancelInvoice('inv-1', 'Error')
    
    expect(response.ok).toBe(true)
    expect(billingStore.invoices[0].status).toBe('cancelled')
  })
})
