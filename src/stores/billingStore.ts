import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid } from '../utils/storeHelpers'
import { Invoice, InvoiceStatus } from '../types/billing'
import { useAccountingStore } from './accountingStore'

const scheduledDianTimers = new Map<string, any[]>()

function safeLogMessage(value: unknown) {
  let message = ''

  if (value instanceof Error) {
    message = value.message || value.name
  } else if (typeof value === 'string') {
    message = value
  } else if (value && typeof value === 'object' && 'message' in value && typeof (value as { message?: unknown }).message === 'string') {
    message = (value as { message: string }).message
  } else {
    message = String(value ?? '')
  }

  return message.replace(/[\r\n]+/g, ' ').trim().slice(0, 240)
}

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

  const canEmitInvoice = computed(() => root.can('manage_billing'))

  async function fetchInvoices() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getInvoices(activeTenantId.value)
      invoices.value = Array.isArray(data) ? data : []
    } catch (error) { 
      console.error('Error fetching invoices:', safeLogMessage(error))
      invoices.value = []
    }
  }

  async function fetchNextNumber() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getNextInvoiceNumber(activeTenantId.value)
      nextInvoiceNumber.value = data
    } catch (error) {
      console.error('Error fetching next invoice number:', safeLogMessage(error))
      nextInvoiceNumber.value = null
    }
  }

  async function emitInvoice(payload: Record<string, any>) {
    if (!canEmitInvoice.value) return { ok: false, message: 'Tu rol actual no permite emitir documentos.' }
    
    try {
      const response = await businessApi.createInvoice(payload, activeTenantId.value)
      const invoice = response as Invoice
      invoices.value.unshift(invoice)
      accounting.fetchLedgerEntries()
      
      // Llamada real al backend para transmitir la factura a la DIAN (en segundo plano)
      sendToDian(invoice.id).catch(err => console.error('Error enviando a DIAN en segundo plano:', safeLogMessage(err)))
      
      return { ok: true, message: 'Factura emitida correctamente.', invoice }
    } catch (error) { 
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

  function scheduleDianUpdates(invoiceId: string, tenantId: string) {
    clearScheduledDianUpdates(invoiceId)
    // Consultar el estado real de la DIAN a los 3 y 10 segundos
    const timerIds: any[] = []
    
    const timer1 = setTimeout(() => {
      checkDianStatus(invoiceId)
    }, 3000)
    
    const timer2 = setTimeout(() => {
      checkDianStatus(invoiceId)
    }, 10000)
    
    timerIds.push(timer1, timer2)
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

  return { invoices, nextInvoiceNumber, tenantInvoices, selectedInvoice, canEmitInvoice, fetchInvoices, fetchNextNumber, emitInvoice, cancelInvoice, sendToDian, checkDianStatus, scheduleDianUpdates, clearScheduledDianUpdates }
})
