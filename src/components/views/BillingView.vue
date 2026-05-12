<script setup>
import { computed, reactive, watch } from 'vue'
import { useBillingStore } from '../../stores/billingStore'
import { formatCurrency, formatDate, formatDateOnly } from '../../utils/ui'
import { generateInvoicePdf } from '../../utils/pdfGenerator'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useBillingStore()

const invoiceForm = reactive({
  clientId: '',
  paymentTermDays: 30,
  notes: '',
  lines: [],
})
let lineIdCounter = 0

function createEmptyLine() {
  return {
    id: `line-${lineIdCounter++}`,
    productId: '',
    quantity: 1,
  }
}

function resetForm() {
  invoiceForm.clientId = ''
  invoiceForm.paymentTermDays = 30
  invoiceForm.notes = ''
  invoiceForm.lines = [createEmptyLine()]
}

watch(
  () => store.activeTenantId,
  () => {
    resetForm()
  },
  { immediate: true },
)

const canBilling = computed(() => store.canEmitInvoice)

const billingPermissionNote = computed(() =>
  canBilling.value
    ? 'Tu rol puede emitir facturas en esta empresa.'
    : 'Modo solo lectura. Tu rol activo no puede emitir facturas en esta empresa.',
)

const draftInvoiceItems = computed(() =>
  invoiceForm.lines
    .map((line) => {
      const product = store.tenantProducts.find((item) => item.id === line.productId)
      const quantity = Number(line.quantity || 0)

      if (!product || quantity <= 0) {
        return null
      }

      const subtotal = product.price * quantity
      const taxAmount = subtotal * (product.taxRate / 100)

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        unitCost: product.cost,
        taxRate: product.taxRate,
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
      }
    })
    .filter(Boolean),
)

const draftInvoiceTotals = computed(() =>
  draftInvoiceItems.value.reduce(
    (accumulator, item) => {
      accumulator.subtotal += item.subtotal
      accumulator.tax += item.taxAmount
      accumulator.total += item.total
      return accumulator
    },
    { subtotal: 0, tax: 0, total: 0 },
  ),
)

const draftInvoiceWarnings = computed(() => {
  const warnings = []
  const requestedByProduct = draftInvoiceItems.value.reduce((accumulator, item) => {
    accumulator.set(item.productId, (accumulator.get(item.productId) || 0) + item.quantity)
    return accumulator
  }, new Map())

  requestedByProduct.forEach((quantity, productId) => {
    const product = store.tenantProducts.find((productItem) => productItem.id === productId)

    if (product && !store.activeTenant.allowNegativeStock && product.stock < quantity) {
      warnings.push(`Sin stock suficiente para ${product.name}. Disponible: ${product.stock}. Solicitado: ${quantity}.`)
    }
  })

  return warnings
})

const selectedInvoiceClient = computed(() =>
  store.selectedInvoice
    ? store.thirdParties.find((item) => item.id === store.selectedInvoice.clientId) || null
    : null,
)

function notify(result) {
  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })
}

function addLineItem() {
  invoiceForm.lines.push(createEmptyLine())
}

function removeLineItem(index) {
  if (invoiceForm.lines.length === 1) {
    notify({
      message: 'La factura necesita al menos un item.',
    })
    return
  }

  invoiceForm.lines.splice(index, 1)
}

async function handleSubmit() {
  const result = await store.emitInvoice({
    clientId: invoiceForm.clientId,
    paymentTermDays: invoiceForm.paymentTermDays,
    notes: invoiceForm.notes,
    items: draftInvoiceItems.value,
  })

  notify(result)

  if (result.ok) {
    resetForm()
  }
}

function handleDownloadPdf() {
  if (!store.selectedInvoice) return
  const client = store.thirdParties.find(tp => tp.id === store.selectedInvoice.clientId)
  generateInvoicePdf({
    ...store.selectedInvoice,
    consecutive: store.selectedInvoice.number,
    client: client
  }, store.activeTenant)
}
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <div class="two-column">
      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Flujo nucleo</p>
            <h3>Crear factura electronica</h3>
          </div>
        </div>

        <p class="permission-note">{{ billingPermissionNote }}</p>

        <form class="form-layout" @submit.prevent="handleSubmit">
          <fieldset class="form-fieldset" :disabled="!canBilling">
            <div class="field-grid two">
              <label class="field">
                <span>Cliente</span>
                <select v-model="invoiceForm.clientId" required>
                  <option value="">Selecciona un cliente</option>
                  <option v-for="client in store.tenantClients" :key="client.id" :value="client.id">
                    {{ client.name }} - {{ client.nit }}
                  </option>
                </select>
              </label>

              <label class="field">
                <span>Condicion de pago</span>
                <select v-model.number="invoiceForm.paymentTermDays">
                  <option :value="30">Credito 30 dias</option>
                  <option :value="15">Credito 15 dias</option>
                  <option :value="0">Contado</option>
                </select>
              </label>
            </div>

            <label class="field">
              <span>Notas comerciales</span>
              <textarea
                v-model="invoiceForm.notes"
                placeholder="Observaciones visibles en el documento y la auditoria."
                rows="3"
              ></textarea>
            </label>

            <div class="card-subsection">
              <div class="split-head">
                <div>
                  <p class="eyebrow">Items</p>
                  <h4>Detalle de productos</h4>
                </div>
                <button class="ghost-button" type="button" @click="addLineItem">Agregar item</button>
              </div>

              <div class="stack-list">
                <div v-for="(line, index) in invoiceForm.lines" :key="line.id" class="invoice-line">
                  <label class="field">
                    <span>Producto</span>
                    <select v-model="line.productId">
                      <option value="">Selecciona un producto</option>
                      <option v-for="product in store.tenantProducts" :key="product.id" :value="product.id">
                        {{ product.name }} - stock {{ product.stock }}
                      </option>
                    </select>
                  </label>

                  <label class="field">
                    <span>Cantidad</span>
                    <input v-model.number="line.quantity" min="1" step="1" type="number" />
                  </label>

                  <button class="line-remove" type="button" @click="removeLineItem(index)">Quitar</button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="primary-button" type="submit">Emitir factura</button>
            </div>
          </fieldset>
        </form>
      </article>

      <div class="stack-column">
        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Vista previa</p>
              <h3>Totales y validaciones</h3>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-row">
              <span class="label-soft">Subtotal</span>
              <strong class="value-strong">{{ formatCurrency(draftInvoiceTotals.subtotal) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">IVA</span>
              <strong class="value-strong">{{ formatCurrency(draftInvoiceTotals.tax) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">Total estimado</span>
              <strong class="value-strong">{{ formatCurrency(draftInvoiceTotals.total) }}</strong>
            </div>
            <div class="summary-row">
              <span class="label-soft">Metodo de costo</span>
              <strong class="value-strong">{{ store.activeTenant?.costMethod }}</strong>
            </div>
          </div>

          <div class="card-subsection">
            <div class="split-head">
              <div>
                <p class="eyebrow">Items calculados</p>
                <h4>Detalle</h4>
              </div>
            </div>
            <div v-if="draftInvoiceItems.length" class="list-grid">
              <div v-for="item in draftInvoiceItems" :key="`${item.productId}-${item.quantity}`" class="mini-row">
                <span>{{ item.productName }} x {{ item.quantity }}</span>
                <strong>{{ formatCurrency(item.total) }}</strong>
              </div>
            </div>
            <p v-else class="empty-state">Agrega productos para ver el calculo del documento.</p>
          </div>

          <div class="card-subsection">
            <div class="split-head">
              <div>
                <p class="eyebrow">Validaciones</p>
                <h4>Revision previa</h4>
              </div>
            </div>
            <div v-if="draftInvoiceWarnings.length" class="list-grid">
              <div v-for="warning in draftInvoiceWarnings" :key="warning" class="alert-row">
                <p>{{ warning }}</p>
                <span class="status-badge status-danger">Bloquea emision</span>
              </div>
            </div>
            <p v-else class="empty-state">
              La factura esta lista para emitirse con las reglas configuradas del tenant.
            </p>
          </div>
        </article>

        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Trazabilidad</p>
              <h3>Facturas emitidas</h3>
            </div>
          </div>

          <div v-if="store.tenantInvoices.length" class="list-grid">
            <article
              v-for="invoice in store.tenantInvoices"
              :key="invoice.id"
              :class="['invoice-card', { active: invoice.id === store.selections.invoiceId }]"
              @click="store.selectInvoice(invoice.id)"
            >
              <div class="invoice-card-head">
                <div>
                  <p>{{ invoice.number }}</p>
                  <p class="label-soft">
                    {{ store.thirdParties.find((item) => item.id === invoice.clientId)?.name || 'Cliente no disponible' }}
                  </p>
                </div>
                <span :class="`status-badge status-${invoice.status}`">{{ invoice.status }}</span>
              </div>
              <div class="mini-row">
                <span class="label-soft">{{ formatDate(invoice.createdAt) }}</span>
                <strong>{{ formatCurrency(invoice.total) }}</strong>
              </div>
            </article>
          </div>
          <p v-else class="empty-state">Todavia no hay facturas emitidas para esta empresa.</p>
        </article>

        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">DIAN</p>
              <h3>Timeline del documento</h3>
            </div>
          </div>

          <template v-if="store.selectedInvoice">
            <div class="summary-grid">
              <div class="summary-row">
                <span class="label-soft">Documento</span>
                <strong class="value-strong">{{ store.selectedInvoice.number }}</strong>
              </div>
              <div class="summary-row">
                <span class="label-soft">Cliente</span>
                <strong class="value-strong">{{ selectedInvoiceClient?.name || 'Sin cliente' }}</strong>
              </div>
              <div class="summary-row">
                <span class="label-soft">Vencimiento</span>
                <strong class="value-strong">{{ formatDateOnly(store.selectedInvoice.dueAt) }}</strong>
              </div>
              <div class="summary-row">
                <span class="label-soft">Archivos</span>
                <strong class="value-strong">
                  <button 
                    v-if="store.selectedInvoice"
                    type="button" 
                    class="ghost-button" 
                    style="padding: 2px 8px; font-size: 12px; height: auto;"
                    @click="handleDownloadPdf"
                  >
                    Descargar PDF
                  </button>
                  <span v-else>-</span> /
                  {{ store.selectedInvoice?.files.xml ? 'XML' : '-' }}
                </strong>
              </div>
            </div>

            <div class="timeline-list">
              <article
                v-for="event in [...store.selectedInvoice.timeline].slice().reverse()"
                :key="event.id"
                class="timeline-item"
              >
                <div class="timeline-header">
                  <span :class="`status-badge status-${event.status}`">{{ event.status }}</span>
                  <span class="label-soft">{{ formatDate(event.at) }}</span>
                </div>
                <p>{{ event.note }}</p>
              </article>
            </div>
          </template>
          <p v-else class="empty-state">Selecciona o crea una factura para ver la trazabilidad.</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.form-fieldset {
  border: 0;
  display: grid;
  gap: 20px;
  margin: 0;
  min-inline-size: 0;
  padding: 0;
}

.stack-list {
  display: grid;
  gap: 12px;
}
</style>
