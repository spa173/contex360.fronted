import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'

export const useTreasuryStore = defineStore('treasury', () => {
  const root = useStateStore()

  const transactions = ref<any[]>([])
  const balance = ref<{ balance: number; incomeMonth: number; expenseMonth: number }>({
    balance: 0,
    incomeMonth: 0,
    expenseMonth: 0,
  })
  const isLoading = ref(false)
  const isSaving = ref(false)

  const activeTenantId = computed(() => root.activeTenantId)

  const incomeTransactions = computed(() =>
    transactions.value.filter((t) => t.type === 'INCOME').sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
  )

  const expenseTransactions = computed(() =>
    transactions.value.filter((t) => t.type === 'EXPENSE').sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
  )

  async function fetchAll() {
    if (!activeTenantId.value) return
    isLoading.value = true
    try {
      const [txs, bal] = await Promise.all([
        businessApi.getTransactions(activeTenantId.value),
        businessApi.getTreasuryBalance(activeTenantId.value),
      ])
      transactions.value = Array.isArray(txs) ? txs : []
      balance.value = bal
    } catch (err) {
      console.error('[treasury] fetch failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTransaction(payload: {
    type: 'INCOME' | 'EXPENSE'
    amount: number
    description: string
    category: 'CAJA' | 'BANCO' | 'PETTY_CASH'
    date?: string
    reference?: string
    invoiceId?: string
    purchaseId?: string
  }) {
    isSaving.value = true
    try {
      const created = await businessApi.createTransaction(payload, activeTenantId.value)
      transactions.value.unshift(created)
      // Refresh balance from backend
      const bal = await businessApi.getTreasuryBalance(activeTenantId.value)
      balance.value = bal
      return { ok: true, message: 'Movimiento registrado y asiento contable creado.' }
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Error al registrar movimiento.' }
    } finally {
      isSaving.value = false
    }
  }

  watch(activeTenantId, (id) => { if (id) fetchAll() }, { immediate: true })

  return {
    transactions,
    balance,
    isLoading,
    isSaving,
    incomeTransactions,
    expenseTransactions,
    fetchAll,
    createTransaction,
  }
})
