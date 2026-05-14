import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { uid, appendAuditEvent } from '../utils/storeHelpers'
import { LedgerEntry, AccountNode, BalanceSheet, ProfitAndLoss } from '../types/accounting'

export const useAccountingStore = defineStore('accounting', () => {
  const root = useStateStore()

  // State
  const ledgerEntries = ref<LedgerEntry[]>(root.ledgerEntries?.length ? [...root.ledgerEntries] : [
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
    }
  ])

  const selections = ref({
    entryId: null as string | null,
  })

  // Getters
  const activeTenantId = computed(() => root.activeTenantId)

  const tenantLedgerEntries = computed(() => 
    [...ledgerEntries.value]
      .filter(entry => entry.tenantId === activeTenantId.value)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  const selectedEntry = computed(() => 
    tenantLedgerEntries.value.find(entry => entry.id === selections.value.entryId) || tenantLedgerEntries.value[0] || null
  )

  // Actions
  function addEntry(entry: LedgerEntry) {
    ledgerEntries.value.unshift(entry)
  }

  function selectEntry(id: string) {
    selections.value.entryId = id
  }

  // Report Generators (Simulated logic based on account prefixes)
  const balanceSheet = computed((): BalanceSheet => {
    const entries = tenantLedgerEntries.value
    const accounts: Record<string, number> = {}

    entries.forEach(entry => {
      entry.lines.forEach(line => {
        accounts[line.account] = (accounts[line.account] || 0) + (line.debit - line.credit)
      })
    })

    const createNode = (code: string, name: string, type: any): AccountNode => ({
      code,
      name,
      balance: accounts[code] || 0,
      children: [],
      type
    })

    const assets = [createNode('110505', 'Caja General', 'asset'), createNode('130505', 'Clientes', 'asset')]
    const liabilities = [createNode('240805', 'IVA por Pagar', 'liability')]
    const equity = [createNode('310505', 'Capital Social', 'equity')]

    return {
      at: new Date().toISOString(),
      assets,
      liabilities,
      equity,
      totalAssets: assets.reduce((s, n) => s + n.balance, 0),
      totalLiabilities: liabilities.reduce((s, n) => s + n.balance, 0),
      totalEquity: equity.reduce((s, n) => s + n.balance, 0),
    }
  })

  const profitAndLoss = computed((): ProfitAndLoss => {
    const entries = tenantLedgerEntries.value
    const accounts: Record<string, number> = {}

    entries.forEach(entry => {
      entry.lines.forEach(line => {
        // For P&L, revenue and equity usually have credit balance as positive
        accounts[line.account] = (accounts[line.account] || 0) + (line.credit - line.debit)
      })
    })

    const revenue = [{ code: '413595', name: 'Ingresos Operacionales', balance: accounts['413595'] || 0, children: [], type: 'revenue' as const }]
    const costs = [{ code: '613505', name: 'Costo de Ventas', balance: -(accounts['613505'] || 0), children: [], type: 'cost' as const }]
    const expenses = [{ code: '510505', name: 'Gastos de Personal', balance: -(accounts['510505'] || 0), children: [], type: 'expense' as const }]

    const gross = revenue[0].balance - costs[0].balance
    const net = gross - expenses[0].balance

    return {
      from: '2026-01-01',
      to: new Date().toISOString(),
      revenue,
      costs,
      expenses,
      grossProfit: gross,
      operatingProfit: gross,
      netProfit: net
    }
  })

  // Sync back to root for persistence
  watch(ledgerEntries, (newVal) => {
    (root.$state as any).ledgerEntries = newVal;
  }, { deep: true, immediate: true })

  return {
    ledgerEntries,
    selections,
    tenantLedgerEntries,
    selectedEntry,
    addEntry,
    selectEntry,
    balanceSheet,
    profitAndLoss
  }
})
