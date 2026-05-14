import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid, appendAuditEvent } from '../utils/storeHelpers'
import { Invoice } from '../types/billing'
import { useAccountingStore } from './accountingStore'
import { invoiceSchema } from '../schemas/invoice.schema'

const scheduledDianTimers = new Map<string, any[]>()

export const useBillingStore = defineStore('billing', () => {
  const root = useStateStore()
  const accounting = useAccountingStore()

  const invoices = ref<Invoice[]>([])

  const selections = ref({
    invoiceId: null as string | null,
  })

  const activeTenantId = computed(() => root.activeTenantId)
  
  const tenantInvoices = computed(() => 
    [...(invoices.value || [])]
      .filter(inv => inv.tenantId === activeTenantId.value)
      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime())
  )

  const selectedInvoice = computed(() => 
    (tenantInvoices.value || []).find(inv => inv.id === selections.value.invoiceId) || tenantInvoices.value[0] || null
  )

  const canEmitInvoice = computed(() => root.can('emit_invoice'))

  async function fetchInvoices() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getInvoices(activeTenantId.value)
      invoices.value = Array.isArray(data) ? data : []
    } catch (error) { 
      console.error('Error fetching invoices:', error)
      invoices.value = []
    }
  }

  async function emitInvoice(payload: Record<string, any>) {
    if (!canEmitInvoice.value) return { ok: false, message: 'Tu rol actual no permite emitir documentos.' }
    
    try {
      invoiceSchema.parse(payload)

      const response = await businessApi.createInvoice(payload)
      const invoice = response as Invoice
      invoices.value.unshift(invoice)
      const client = root.thirdParties.find(tp => tp.id === invoice.clientId)
      const entry = createInvoiceEntry(invoice, client?.name || 'Cliente Genérico')
      accounting.addEntry(entry)
      appendAuditEvent(root.$state, { tenantId: invoice.tenantId, entity: 'factura', action: 'Emitir', description: `Se emitió la factura ${invoice.number} por ${invoice.total}.`, actor: root.currentUser?.name || 'Sistema', severity: 'info' })
      scheduleDianUpdates(invoice.id, invoice.tenantId)
      return { ok: true, message: 'Factura emitida correctamente.', invoice }
    } catch (error) { 
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return { ok: false, message: 'Datos de factura inválidos. Revisa los campos obligatorios.' }
      }
      return { ok: false, message: error instanceof Error ? error.message : 'Error al emitir factura.' } 
    }
  }

  function createInvoiceEntry(invoice: Invoice, clientName: string) {
    return { id: uid('entry'), tenantId: invoice.tenantId, reference: `COMP-${invoice.number}`, description: `Factura ${invoice.number} - ${clientName}`, sourceInvoiceId: invoice.id, ownerUserId: invoice.ownerUserId || null, createdAt: new Date().toISOString(), lines: [{ account: '130505', label: 'Clientes nacionales', debit: invoice.total, credit: 0 }, { account: '413595', label: 'Ingresos operacionales', debit: 0, credit: invoice.subtotal }, { account: '240805', label: 'IVA generado', debit: 0, credit: invoice.taxTotal }] }
  }

  function scheduleDianUpdates(invoiceId: string, tenantId: string) {
    const transitions = [{ delay: 2000, status: 'enviada', note: 'Documento transmitido a la DIAN.', audit: 'Factura enviada a DIAN.' }, { delay: 5000, status: 'aceptada', note: 'DIAN aceptó el documento.', audit: 'Factura aceptada por DIAN.' }]
    clearScheduledDianUpdates(invoiceId)
    const timerIds: any[] = []
    transitions.forEach((transition) => {
      const timerId = setTimeout(() => {
        const inv = invoices.value.find(i => i.id === invoiceId)
        if (!inv) return
        inv.status = transition.status
        inv.timeline.push({ id: uid('tl'), status: transition.status, note: transition.note, at: new Date().toISOString() })
        appendAuditEvent(root.$state, { tenantId, entity: 'dian', action: 'Actualizar estado', description: transition.audit, actor: 'Worker DIAN' })
        root.saveState()
      }, transition.delay)
      timerIds.push(timerId)
    })
    scheduledDianTimers.set(invoiceId, timerIds)
  }

  function clearScheduledDianUpdates(invoiceId: string) {
    const timers = scheduledDianTimers.get(invoiceId)
    if (timers) {
      timers.forEach(clearTimeout)
      scheduledDianTimers.delete(invoiceId)
    }
  }

  watch(invoices, () => { (root.$state as any).invoices = invoices.value; }, { deep: true, immediate: true })

  watch([activeTenantId, () => root.session.currentUserId], ([newId, userId]) => {
    if (newId && userId) fetchInvoices()
  }, { immediate: true })

  return { invoices, selectedInvoice, canEmitInvoice, fetchInvoices, emitInvoice, scheduleDianUpdates, clearScheduledDianUpdates }
})
