import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTreasuryStore } from './treasuryStore'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'

// Mock dependencies
vi.mock('../services/businessApi', () => ({
  businessApi: {
    getTransactions: vi.fn(),
    getTreasuryBalance: vi.fn(),
    getAlerts: vi.fn(),
    getPurchases: vi.fn(),
    getCashFlowTrend: vi.fn(),
    getAiInsights: vi.fn(),
    createTransaction: vi.fn(),
  }
}))

describe('Treasury Store', () => {
  let treasuryStore: ReturnType<typeof useTreasuryStore>
  let stateStore: ReturnType<typeof useStateStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    stateStore = useStateStore()
    
    // Setup state before init
    stateStore.activeTenantId = 'tenant-1'
    
    treasuryStore = useTreasuryStore()
    vi.clearAllMocks()
  })

  it('should fetch treasury data on init', async () => {
    vi.mocked(businessApi.getTransactions).mockResolvedValue([
      { id: 'tx-1', type: 'INCOME', amount: 500, date: '2023-01-01' }
    ] as any)
    vi.mocked(businessApi.getTreasuryBalance).mockResolvedValue({
      balance: 1500, incomeMonth: 500, expenseMonth: 0
    })
    
    vi.mocked(businessApi.getAlerts).mockResolvedValue({ pendingInvoices: 0 } as any)
    vi.mocked(businessApi.getPurchases).mockResolvedValue([] as any)
    vi.mocked(businessApi.getCashFlowTrend).mockResolvedValue(null as any)
    vi.mocked(businessApi.getAiInsights).mockResolvedValue([] as any)
    
    await treasuryStore.fetchAll()
    
    expect(businessApi.getTransactions).toHaveBeenCalledWith('tenant-1')
    expect(treasuryStore.transactions.length).toBe(1)
    expect(treasuryStore.totalBalance).toBe(1500)
    expect(treasuryStore.incomeTransactions.length).toBe(1)
    expect(treasuryStore.expenseTransactions.length).toBe(0)
  })

  it('should create transaction successfully', async () => {
    const payload = {
      type: 'INCOME',
      amount: 1000,
      description: 'Test Income',
      date: new Date().toISOString()
    }
    
    vi.mocked(businessApi.createTransaction).mockResolvedValue({ id: 'tx-new', ...payload } as any)
    vi.mocked(businessApi.getTreasuryBalance).mockResolvedValue({
      balance: 2500, incomeMonth: 1500, expenseMonth: 0
    })
    
    const response = await treasuryStore.createTransaction(payload as any)
    
    expect(response.ok).toBe(true)
    expect(treasuryStore.transactions[0].id).toBe('tx-new')
    expect(businessApi.createTransaction).toHaveBeenCalled()
    expect(treasuryStore.balance.balance).toBe(2500)
  })

  it('should fail transaction creation if invalid payload', async () => {
    const response = await treasuryStore.createTransaction({} as any)
    expect(response.ok).toBe(false)
    expect(response.message).toContain('inválidos')
  })
})
