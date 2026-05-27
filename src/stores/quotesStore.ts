import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import type { Quote, CreateQuotePayload, QuoteStatus } from '../types/quotes'

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

  async function createQuote(payload: CreateQuotePayload) {
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
      const index = quotes.value.findIndex(q => q.id === quoteId)
      if (index !== -1) {
        quotes.value[index].status = 'converted'
      }

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
