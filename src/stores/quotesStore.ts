import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid, appendAuditEvent } from '../utils/storeHelpers'

export interface QuoteItem {
  id?: string
  quoteId?: string
  lineNumber?: number
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  taxRate: number
  subtotal: number
  taxAmount: number
}

export interface Quote {
  id: string
  tenantId: string
  number: string
  customerId: string | null
  customerName: string
  status: 'Draft' | 'Sent' | 'Approved' | 'Expired' | 'Converted'
  subtotal: number
  taxTotal: number
  total: number
  date: string
  dueDate: string
  items: QuoteItem[]
  createdAt: string
  updatedAt?: string
}

export const useQuotesStore = defineStore('quotes', () => {
  const root = useStateStore()

  const quotes = ref<Quote[]>([])

  const selections = ref({
    quoteId: null as string | null,
  })

  const activeTenantId = computed(() => root.activeTenantId)

  const tenantQuotes = computed(() =>
    [...(quotes.value || [])]
      .filter((q) => q.tenantId === activeTenantId.value)
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      ),
  )

  const selectedQuote = computed(
    () =>
      (tenantQuotes.value || []).find(
        (q) => q.id === selections.value.quoteId,
      ) ||
      tenantQuotes.value[0] ||
      null,
  )

  const canManageQuotes = computed(() => root.can('manage_billing'))

  async function fetchQuotes() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getQuotes(activeTenantId.value)
      quotes.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching quotes:', error)
      quotes.value = []
    }
  }

  async function createQuote(payload: Record<string, any>) {
    if (!canManageQuotes.value) {
      return { ok: false, message: 'Tu rol actual no permite crear cotizaciones.' }
    }

    try {
      const response = await businessApi.createQuote(
        payload,
        activeTenantId.value,
      )
      const quote = response as Quote
      quotes.value.unshift(quote)
      
      appendAuditEvent(root.$state, { 
        tenantId: quote.tenantId, 
        entity: 'cotización', 
        action: 'Crear', 
        description: `Se creó la cotización ${quote.number} para ${quote.customerName}.`, 
        actor: root.currentUser?.name || 'Sistema', 
        severity: 'info' 
      })

      return { ok: true, message: 'Cotización creada correctamente.', quote }
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : 'Error al crear cotización.',
      }
    }
  }

  async function convertToInvoice(quoteId: string) {
    try {
      const result = await businessApi.convertQuoteToInvoice(quoteId, activeTenantId.value)
      // Update local state
      const index = quotes.value.findIndex(q => q.id === quoteId)
      if (index !== -1) {
        quotes.value[index].status = 'Converted'
      }
      
      appendAuditEvent(root.$state, { 
        tenantId: activeTenantId.value!, 
        entity: 'cotización', 
        action: 'Convertir', 
        description: `Se convirtió la cotización a la factura ${result.invoice.number}.`, 
        actor: root.currentUser?.name || 'Sistema', 
        severity: 'info' 
      })

      return { ok: true, message: 'Conversión exitosa.', invoice: result.invoice }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Error en la conversión.' }
    }
  }

  watch(
    [activeTenantId, () => root.session?.currentUserId],
    ([newId, userId]) => {
      if (newId && userId) fetchQuotes()
    },
    { immediate: true },
  )

  return {
    quotes,
    selections,
    tenantQuotes,
    selectedQuote,
    canManageQuotes,
    fetchQuotes,
    createQuote,
    convertToInvoice,
  }
})
