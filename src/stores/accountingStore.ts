import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { uid, appendAuditEvent } from '../utils/storeHelpers'
import { businessApi } from '../services/businessApi'
import { LedgerEntry, BalanceSheet, ProfitAndLoss } from '../types/accounting'

export const useAccountingStore = defineStore('accounting', () => {
  const root = useStateStore()

  // State
  const ledgerEntries = ref<LedgerEntry[]>([])

  const selections = ref({
    entryId: null as string | null,
  })

  const isLoading = ref(false)

  const balanceSheetData = ref<BalanceSheet | null>(null)
  const profitAndLossData = ref<ProfitAndLoss | null>(null)

  // Getters
  const activeTenantId = computed(() => root.activeTenantId)

  const tenantLedgerEntries = computed(() => 
    [...ledgerEntries.value]
      .filter(entry => !activeTenantId.value || entry.tenantId === activeTenantId.value)
      .sort((a, b) => new Date((b as any).entryAt || b.createdAt).getTime() - new Date((a as any).entryAt || a.createdAt).getTime())
  )

  const selectedEntry = computed(() => 
    tenantLedgerEntries.value.find(entry => entry.id === selections.value.entryId) || tenantLedgerEntries.value[0] || null
  )

  const balanceSheet = computed(() => balanceSheetData.value || {
    at: new Date().toISOString(), assets: [], liabilities: [], equity: [], totalAssets: 0, totalLiabilities: 0, totalEquity: 0
  })

  const profitAndLoss = computed(() => profitAndLossData.value || {
    from: '2026-01-01', to: new Date().toISOString(), revenue: [], costs: [], expenses: [], grossProfit: 0, operatingProfit: 0, netProfit: 0
  })

  // Actions
  function selectEntry(id: string) {
    selections.value.entryId = id
  }

  async function fetchLedgerEntries() {
    if (!activeTenantId.value) return
    isLoading.value = true
    try {
      const data = await businessApi.getLedgerEntries(activeTenantId.value)
      ledgerEntries.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching ledger entries:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReports() {
    if (!activeTenantId.value) return
    try {
      const [bs, pl] = await Promise.all([
        businessApi.getBalanceSheet(activeTenantId.value),
        businessApi.getProfitAndLoss(activeTenantId.value)
      ])
      balanceSheetData.value = bs
      profitAndLossData.value = pl
    } catch (error) {
      console.error('Error fetching accounting reports:', error)
    }
  }

  async function createLedgerEntry(payload: Record<string, any>) {
    isLoading.value = true
    try {
      const created = await businessApi.createLedgerEntry(payload, activeTenantId.value!)
      await fetchLedgerEntries()
      await fetchReports()
      return { ok: true, message: 'Asiento contable creado exitosamente.', entry: created }
    } catch (error) {
      console.error('Error creating ledger entry:', error)
      return { ok: false, message: error instanceof Error ? error.message : 'Error al crear asiento.' }
    } finally {
      isLoading.value = false
    }
  }

  watch(activeTenantId, (newId) => {
    if (newId) {
      fetchLedgerEntries()
      fetchReports()
    }
  }, { immediate: true })

  return { 
    ledgerEntries, 
    selections, 
    isLoading, 
    tenantLedgerEntries, 
    selectedEntry, 
    selectEntry, 
    fetchLedgerEntries, 
    fetchReports,
    createLedgerEntry, 
    balanceSheet, 
    profitAndLoss 
  }
})
