import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { useAccountingStore } from './accountingStore'

export interface PurchaseItem {
  id?: string
  purchaseId?: string
  lineNumber?: number
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  taxRate: number
  subtotal: number
  taxAmount: number
  createdAt?: string
  updatedAt?: string
}

export interface Purchase {
  id: string
  tenantId: string
  number: string
  providerId: string | null
  status: 'draft' | 'registered' | 'paid' | 'cancelled'
  subtotal: number
  taxTotal: number
  total: number
  paymentTermDays: number
  notes?: string | null
  issuedAt: string
  dueAt?: string | null
  items: PurchaseItem[]
  createdAt: string
  updatedAt?: string
}

export const usePurchasesStore = defineStore('purchases', () => {
  const root = useStateStore()
  const accounting = useAccountingStore()

  const purchases = ref<any[]>([])

  const selections = ref({
    purchaseId: null as string | null,
  })

  const activeTenantId = computed(() => root.activeTenantId)

  const tenantPurchases = computed(() =>
    [...(purchases.value || [])]
      .filter((p) => p.tenantId === activeTenantId.value)
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      ),
  )

  const selectedPurchase = computed(
    () =>
      (tenantPurchases.value || []).find(
        (p) => p.id === selections.value.purchaseId,
      ) ||
      tenantPurchases.value[0] ||
      null,
  )

  const canRegisterPurchase = computed(() => root.can('manage_billing'))

  async function fetchPurchases() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getPurchases(activeTenantId.value)
      purchases.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching purchases:', error)
      purchases.value = []
    }
  }

  async function registerPurchase(payload: Record<string, any>) {
    if (!canRegisterPurchase.value) {
      return { ok: false, message: 'Tu rol actual no permite registrar compras.' }
    }

    try {
      const response = await businessApi.createPurchase(
        payload,
        activeTenantId.value,
      )
      const purchase = response as Purchase
      purchases.value.unshift(purchase)

      accounting.fetchLedgerEntries()

      return { ok: true, message: 'Compra registrada correctamente.', purchase }
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : 'Error al registrar compra.',
      }
    }
  }

  watch(
    [activeTenantId, () => (root as any).session?.currentUserId],
    ([newId, userId]) => {
      if (newId && userId) fetchPurchases()
    },
    { immediate: true },
  )

  return {
    purchases,
    selections,
    tenantPurchases,
    selectedPurchase,
    canRegisterPurchase,
    fetchPurchases,
    registerPurchase,
  }
})
