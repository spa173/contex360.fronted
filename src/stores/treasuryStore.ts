import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import type { Transaction, TreasuryBalance, CreateTransactionPayload, ProgrammedPayment } from '../types/treasury'
import { transactionSchema } from '../schemas/transaction.schema'

export const useTreasuryStore = defineStore('treasury', () => {
  const root = useStateStore()

  const transactions = ref<Transaction[]>([])
  const balance = ref<TreasuryBalance>({
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

  const programmedPayments = ref<ProgrammedPayment[]>([])

  const cashFlowTrend = ref<any>(null)
  const aiInsights = ref<any>(null)

  function applyInsightOptimization() {
    // In a real flow, this would call an API, but for now we apply it locally for the UI effect
    const firstPayment = programmedPayments.value[0]
    if (firstPayment) {
      firstPayment.dueDate = new Date(Date.now() + 86400000 * 9).toISOString()
      firstPayment.priority = 'Optimizada'
    }
  }

  async function schedulePayment(payment: any) {
    if (!activeTenantId.value) return
    isSaving.value = true
    try {
      const providers = await businessApi.getThirdParties('provider', activeTenantId.value)
      let providerId = providers.length > 0 ? providers[0].id : null
      
      if (!providerId) {
        const newProvider = await businessApi.createThirdParty({
          name: payment.vendorName || 'Nuevo Proveedor SAS',
          documentType: 'NIT',
          documentNumber: '900' + (globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).toString().padStart(6, '0'),
          kind: 'provider',
        }, activeTenantId.value)
        providerId = newProvider.id
      }

      await businessApi.createPurchase({
        providerId,
        paymentTermDays: 15,
        items: [
          {
            productId: 'temp-service',
            productName: 'Pago programado desde Tesorería',
            quantity: 1,
            unitPrice: Number(payment.amount) || 1000000,
            taxRate: 0,
          }
        ]
      }, activeTenantId.value)

      await fetchAll()
    } catch (err) {
      console.error('[treasury] schedule payment failed:', err)
    } finally {
      isSaving.value = false
    }
  }

  const totalBalance = computed(() => balance.value.balance ?? 0)
  const pendingPaymentsCount = computed(() => programmedPayments.value.length)
  const pendingCollectionsCount = ref(0)

  async function fetchAll() {
    if (!activeTenantId.value) return
    isLoading.value = true
    try {
      const [txs, bal, alerts, purchases, cashFlow, insights] = await Promise.all([
        businessApi.getTransactions(activeTenantId.value).catch(() => []),
        businessApi.getTreasuryBalance(activeTenantId.value).catch(() => ({ balance: 0, incomeMonth: 0, expenseMonth: 0 })),
        businessApi.getAlerts(activeTenantId.value).catch(() => ({ pendingInvoices: 0 })),
        businessApi.getPurchases(activeTenantId.value).catch(() => []),
        businessApi.getCashFlowTrend(activeTenantId.value).catch(() => null),
        businessApi.getAiInsights(activeTenantId.value).catch(() => [])
      ])
      transactions.value = Array.isArray(txs) ? txs : []
      balance.value = bal
      pendingCollectionsCount.value = alerts?.pendingInvoices ?? 0
      programmedPayments.value = (purchases || []).filter((p: any) => p.status === 'registered').map((p: any) => ({
        id: p.id,
        vendorName: p.provider?.name || 'Proveedor General',
        dueDate: p.dueAt || p.issuedAt || new Date().toISOString(),
        priority: p.total > 10000000 ? 'Alta' : p.total > 2000000 ? 'Media' : 'Baja',
        amount: Number(p.total),
        status: 'Programado',
      }))
      cashFlowTrend.value = cashFlow
      aiInsights.value = insights
    } catch (err) {
      console.error('[treasury] fetch failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createTransaction(payload: CreateTransactionPayload) {
    isSaving.value = true
    try {
      transactionSchema.parse(payload)

      const created = await businessApi.createTransaction(payload, activeTenantId.value)
      transactions.value.unshift(created)
      // Refresh balance from backend
      const bal = await businessApi.getTreasuryBalance(activeTenantId.value)
      balance.value = bal
      return { ok: true, message: 'Movimiento registrado y asiento contable creado.' }
    } catch (err) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'ZodError') {
        return { ok: false, message: 'Datos del movimiento inválidos. Revisa los campos obligatorios.' }
      }
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
    programmedPayments,
    totalBalance,
    pendingPaymentsCount,
    pendingCollectionsCount,
    cashFlowTrend,
    aiInsights,
    fetchAll,
    createTransaction,
    applyInsightOptimization,
    schedulePayment,
  }
})
