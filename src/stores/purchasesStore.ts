import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid } from '../utils/storeHelpers'
import { useAccountingStore } from './accountingStore'
import { purchaseSchema } from '../schemas/purchase.schema'

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
      purchaseSchema.parse(payload)

      const response = await businessApi.createPurchase(
        payload,
        activeTenantId.value,
      )
      const purchase = response as Purchase
      purchases.value.unshift(purchase)

      // Create local ledger entry mirror (IVA descontable)
      const providerName =
        (root as any).thirdParties?.find(
          (tp: any) => tp.id === purchase.providerId,
        )?.name ?? 'Proveedor'

      const entry = {
        id: uid('entry'),
        tenantId: purchase.tenantId,
        referenceType: 'purchase',
        referenceId: purchase.id,
        description: `Compra ${purchase.number || purchase.id} - ${providerName}`,
        amount: purchase.total,
        entryAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lines: [
          {
            account: '510000',
            label: 'Gastos operacionales de compra',
            debit: purchase.subtotal,
            credit: 0,
          },
          {
            account: '240810',
            label: 'IVA descontable',
            debit: purchase.taxTotal,
            credit: 0,
          },
          {
            account: '220500',
            label: 'Proveedores nacionales',
            debit: 0,
            credit: purchase.total,
          },
        ],
      }

      accounting.addEntry(entry)

      return { ok: true, message: 'Compra registrada correctamente.', purchase }
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return { ok: false, message: 'Datos de compra inválidos. Revisa los campos obligatorios.' }
      }
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
