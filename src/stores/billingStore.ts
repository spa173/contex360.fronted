import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid, appendAuditEvent } from '../utils/storeHelpers'
import { Invoice } from '../types/billing'
import { useAccountingStore } from './accountingStore'

// Timer registry for DIAN updates (simulated)
const scheduledDianTimers = new Map<string, any[]>()

export const useBillingStore = defineStore('billing', () => {
  const root = useStateStore()
  const accounting = useAccountingStore()

  // State
  const invoices = ref<Invoice[]>(root.invoices?.length ? [...root.invoices] : [
    {
      id: 'inv-seed-1',
      tenantId: 'tenant-a',
      number: 'CL-0001',
      clientId: 'tp-1',
      status: 'aceptada',
      paymentTermDays: 30,
      subtotal: 1170000,
      taxTotal: 222300,
      total: 1392300,
      notes: 'Factura inicial de parametrizacion.',
      createdAt: '2026-04-22T08:30:00.000Z',
      dueAt: '2026-05-22T08:30:00.000Z',
      items: [
        {
          productId: 'prod-1',
          productName: 'Diagnostico contable mensual',
          quantity: 1,
          unitPrice: 850000,
          unitCost: 420000,
          taxRate: 19,
          subtotal: 850000,
          taxAmount: 161500,
          total: 1011500,
        },
        {
          productId: 'prod-2',
          productName: 'Kit de inventario inicial',
          quantity: 1,
          unitPrice: 320000,
          unitCost: 170000,
          taxRate: 19,
          subtotal: 320000,
          taxAmount: 60800,
          total: 380800,
        },
      ],
      timeline: [
        { id: 'tl-seed-1', status: 'borrador', note: 'Documento preparado.', at: '2026-04-22T08:20:00.000Z' },
        { id: 'tl-seed-2', status: 'emitida', note: 'XML/PDF generado.', at: '2026-04-22T08:24:00.000Z' },
        { id: 'tl-seed-3', status: 'enviada', note: 'Enviada al proveedor.', at: '2026-04-22T08:27:00.000Z' },
        { id: 'tl-seed-4', status: 'aceptada', note: 'Aceptada por DIAN.', at: '2026-04-22T08:30:00.000Z' },
      ],
      files: { xml: true, pdf: true },
    }
  ])

  // ledgerEntries state moved to accountingStore.ts

  const selections = ref({
    invoiceId: null as string | null,
  })

  // Getters
  const activeTenantId = computed(() => root.activeTenantId)
  
  const tenantInvoices = computed(() => 
    [...invoices.value]
      .filter(inv => inv.tenantId === activeTenantId.value)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )

  // tenantLedgerEntries moved to accountingStore.ts

  const selectedInvoice = computed(() => 
    tenantInvoices.value.find(inv => inv.id === selections.value.invoiceId) || tenantInvoices.value[0] || null
  )

  // selectedEntry moved to accountingStore.ts

  const canEmitInvoice = computed(() => root.can('emit_invoice'))

  // Actions
  async function fetchInvoices() {
    if (!activeTenantId.value) return
    try {
      const data = await businessApi.getInvoices()
      invoices.value = data as Invoice[]
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  async function emitInvoice(payload: Record<string, any>) {
    if (!canEmitInvoice.value) {
      return { ok: false, message: 'Tu rol actual no permite emitir documentos.' }
    }

    try {
      const response = await businessApi.createInvoice(payload)
      const invoice = response as Invoice
      invoices.value.unshift(invoice)
      
      const client = root.thirdParties.find(tp => tp.id === invoice.clientId)
      const entry = createInvoiceEntry(invoice, client?.name || 'Cliente Genérico')
      accounting.addEntry(entry)

      appendAuditEvent(root.$state, {
        tenantId: invoice.tenantId,
        entity: 'factura',
        action: 'Emitir',
        description: `Se emitió la factura ${invoice.number} por ${invoice.total}.`,
        actor: root.currentUser?.name || 'Sistema',
        severity: 'info'
      })

      scheduleDianUpdates(invoice.id, invoice.tenantId)

      return { ok: true, message: 'Factura emitida correctamente.', invoice }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Error al emitir factura.' }
    }
  }

  function createInvoiceEntry(invoice: Invoice, clientName: string) {
    return {
      id: uid('entry'),
      tenantId: invoice.tenantId,
      reference: `COMP-${invoice.number}`,
      description: `Factura ${invoice.number} - ${clientName}`,
      sourceInvoiceId: invoice.id,
      ownerUserId: invoice.ownerUserId || null,
      createdAt: new Date().toISOString(),
      lines: [
        { account: '130505', label: 'Clientes nacionales', debit: invoice.total, credit: 0 },
        { account: '413595', label: 'Ingresos operacionales', debit: 0, credit: invoice.subtotal },
        { account: '240805', label: 'IVA generado', debit: 0, credit: invoice.taxTotal },
      ],
    }
  }

  function scheduleDianUpdates(invoiceId: string, tenantId: string) {
    const transitions = [
      { delay: 2000, status: 'enviada', note: 'Documento transmitido a la DIAN.', audit: 'Factura enviada a DIAN.' },
      { delay: 5000, status: 'aceptada', note: 'DIAN aceptó el documento.', audit: 'Factura aceptada por DIAN.' },
    ]

    clearScheduledDianUpdates(invoiceId)
    const timerIds: any[] = []

    transitions.forEach((transition) => {
      const timerId = setTimeout(() => {
        const inv = invoices.value.find(i => i.id === invoiceId)
        if (!inv) return

        inv.status = transition.status
        inv.timeline.push({
          id: uid('tl'),
          status: transition.status,
          note: transition.note,
          at: new Date().toISOString()
        })

        appendAuditEvent(root.$state, {
          tenantId,
          entity: 'dian',
          action: 'Actualizar estado',
          description: transition.audit,
          actor: 'Worker DIAN',
        })
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

  // Sync back to root for persistence
  watch(invoices, () => {
    (root.$state as any).invoices = invoices.value;
  }, { deep: true, immediate: true })

  // Auto-fetch when tenant changes
  watch(activeTenantId, (newId) => {
    if (newId) fetchInvoices()
  }, { immediate: true })

  return {
    invoices,
    selectedInvoice,
    canEmitInvoice,
    fetchInvoices,
    emitInvoice,
    scheduleDianUpdates,
    clearScheduledDianUpdates,
  }
})
