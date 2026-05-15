import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid, appendAuditEvent } from '../utils/storeHelpers'
import { Invoice, InvoiceStatus } from '../types/billing'
import { useAccountingStore } from './accountingStore'
import { invoiceSchema } from '../schemas/invoice.schema'

const scheduledDianTimers = new Map<string, any[]>()

export const useBillingStore = defineStore('billing', () => {
  const root = useStateStore()
  const accounting = useAccountingStore()

  const invoices = ref<Invoice[]>([])
  const nextInvoiceNumber = ref<{ prefix: string; nextNumber: number; preview: string } | null>(null)

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

  async function fetchNextNumber() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getNextInvoiceNumber(activeTenantId.value)
      nextInvoiceNumber.value = data
    } catch (error) {
      console.error('Error fetching next invoice number:', error)
      nextInvoiceNumber.value = null
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
      businessApi.createLedgerEntry(
        {
          referenceType: entry.referenceType,
          referenceId:   entry.referenceId,
          description:   entry.description,
          amount:        entry.amount,
          entryAt:       entry.entryAt,
          lines:         entry.lines.map((l) => ({
            account: l.account,
            label:   l.label,
            debit:   l.debit,
            credit:  l.credit,
          })),
        },
        invoice.tenantId,
      ).catch((err) => console.warn('[ledger] sync failed (non-blocking):', err.message))
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

  async function cancelInvoice(invoiceId: string, reason?: string) {
    if (!canEmitInvoice.value) return { ok: false, message: 'Tu rol actual no permite cancelar documentos.' }
    
    try {
      const cancelled = await businessApi.cancelInvoice(invoiceId, reason)
      const index = invoices.value.findIndex(inv => inv.id === invoiceId)
      if (index !== -1) {
        invoices.value[index] = { ...invoices.value[index], ...cancelled, status: 'cancelled' as InvoiceStatus }
      }
      appendAuditEvent(root.$state, { tenantId: root.activeTenantId, entity: 'factura', action: 'Cancelar', description: `Se canceló la factura ${cancelled.number}. Motivo: ${reason || 'No especificado'}`, actor: root.currentUser?.name || 'Sistema', severity: 'warning' })
      return { ok: true, message: 'Factura cancelada correctamente. El inventario ha sido restaurado.' }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Error al cancelar factura.' }
    }
  }

  async function sendToDian(invoiceId: string) {
    if (!canEmitInvoice.value) return { ok: false, message: 'Tu rol actual no permite enviar a DIAN.' }
    
    try {
      const result = await businessApi.sendInvoiceToDian(invoiceId)
      if (result.success) {
        const index = invoices.value.findIndex(inv => inv.id === invoiceId)
        if (index !== -1) {
          // Actualizar timeline con evento DIAN
          const timeline = (invoices.value[index].timeline || []) as any[]
          timeline.push({
            id: uid('tl'),
            status: result.status === 'accepted' ? 'aceptada' : result.status,
            note: result.message,
            at: new Date().toISOString(),
            cufe: result.cufe,
            qrCode: result.qrCode,
          })
          invoices.value[index] = { 
            ...invoices.value[index], 
            timeline,
            status: (result.status === 'accepted' ? 'accepted' : invoices.value[index].status) as InvoiceStatus
          }
        }
        appendAuditEvent(root.$state, { 
          tenantId: root.activeTenantId, 
          entity: 'dian', 
          action: 'Enviar', 
          description: `Factura enviada a DIAN. CUFE: ${result.cufe}`, 
          actor: root.currentUser?.name || 'Sistema', 
          severity: 'info' 
        })
      }
      return { ok: result.success, message: result.message, data: result }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Error al enviar a DIAN.' }
    }
  }

  async function checkDianStatus(invoiceId: string) {
    try {
      const result = await businessApi.checkDianInvoiceStatus(invoiceId)
      if (result.success && result.status) {
        const index = invoices.value.findIndex(inv => inv.id === invoiceId)
        if (index !== -1) {
          const timeline = (invoices.value[index].timeline || []) as any[]
          const lastEvent = timeline[timeline.length - 1]
          const newStatus = result.status === 'accepted' ? 'aceptada' : 
                           result.status === 'rejected' ? 'rechazada' : 
                           result.status
          if (!lastEvent || lastEvent.status !== newStatus) {
            timeline.push({
              id: uid('tl'),
              status: newStatus,
              note: result.message,
              at: new Date().toISOString(),
              cufe: result.cufe,
            })
            const mappedStatus: InvoiceStatus = result.status === 'accepted' ? 'accepted' : 
                                                 result.status === 'rejected' ? 'emitted' : 
                                                 invoices.value[index].status
            invoices.value[index] = { 
              ...invoices.value[index], 
              timeline,
              status: mappedStatus
            }
          }
        }
      }
      return { ok: true, message: result.message, status: result.status, cufe: result.cufe }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Error al consultar DIAN.' }
    }
  }

  function createInvoiceEntry(invoice: Invoice, clientName: string) {
    return { id: uid('entry'), tenantId: invoice.tenantId, referenceType: 'invoice', referenceId: invoice.id, description: `Factura ${invoice.number} - ${clientName}`, amount: invoice.total, entryAt: new Date().toISOString(), createdAt: new Date().toISOString(), lines: [{ account: '130505', label: 'Clientes nacionales', debit: invoice.total, credit: 0 }, { account: '413595', label: 'Ingresos operacionales', debit: 0, credit: invoice.subtotal }, { account: '240805', label: 'IVA generado', debit: 0, credit: invoice.taxTotal }] }
  }

  function scheduleDianUpdates(invoiceId: string, tenantId: string) {
    const transitions = [{ delay: 2000, status: 'enviada', note: 'Documento transmitido a la DIAN.', audit: 'Factura enviada a DIAN.' }, { delay: 5000, status: 'aceptada', note: 'DIAN aceptó el documento.', audit: 'Factura aceptada por DIAN.' }]
    clearScheduledDianUpdates(invoiceId)
    const timerIds: any[] = []
    transitions.forEach((transition) => {
      const timerId = setTimeout(() => {
        const inv = invoices.value.find(i => i.id === invoiceId)
        if (!inv) return
        inv.status = transition.status as InvoiceStatus
        if (!inv.timeline) inv.timeline = []
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

  return { invoices, nextInvoiceNumber, selectedInvoice, canEmitInvoice, fetchInvoices, fetchNextNumber, emitInvoice, cancelInvoice, sendToDian, checkDianStatus, scheduleDianUpdates, clearScheduledDianUpdates }
})
