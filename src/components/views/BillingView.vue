<script setup>
import { computed, reactive, watch, onMounted } from 'vue'
import { useBillingStore } from '@/stores/billingStore'
import { useStateStore } from '@/stores/stateStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useThirdPartiesStore } from '@/stores/thirdPartiesStore'
import { formatCurrency, formatDate, formatDateOnly } from '@/utils/ui'
import { generateInvoicePdf } from '@/utils/pdfGenerator'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileDown,
  LayoutDashboard,
  Receipt,
  X,
  Send,
  RefreshCw
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const billingStore = useBillingStore()
const rootStore = useStateStore()
const inventoryStore = useInventoryStore()
const thirdPartiesStore = useThirdPartiesStore()

// Initialize bridge on mount
onMounted(() => {
  if (typeof billingStore.initializeBridge === 'function') {
    billingStore.initializeBridge()
  }
  billingStore.fetchNextNumber()
})

const invoiceForm = reactive({
  clientId: '',
  paymentTermDays: 30,
  notes: '',
  lines: [],
})

let lineIdCounter = 0

function createEmptyLine() {
  return {
    id: `line-${Date.now()}-${lineIdCounter++}`,
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
  () => rootStore.activeTenantId,
  () => {
    resetForm()
    billingStore.fetchNextNumber()
  },
  { immediate: true },
)

const canBilling = computed(() => billingStore.canEmitInvoice)

const billingPermissionNote = computed(() =>
  canBilling.value
    ? 'Tu rol puede emitir facturas en esta empresa.'
    : 'Modo solo lectura. Tu rol activo no puede emitir facturas en esta empresa.',
)

const draftInvoiceItems = computed(() =>
  invoiceForm.lines
    .map((line) => {
      const product = inventoryStore.tenantProducts.find((item) => item.id === line.productId)
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
    const product = inventoryStore.tenantProducts.find((p) => p.id === productId)

    if (product && !rootStore.activeTenant?.allowNegativeStock && product.stock < quantity) {
      warnings.push(`Sin stock suficiente para ${product.name}. Disponible: ${product.stock}. Solicitado: ${quantity}.`)
    }
  })

  return warnings
})

const selectedInvoiceClient = computed(() =>
  billingStore.selectedInvoice
    ? thirdPartiesStore.thirdParties.find((item) => item.id === billingStore.selectedInvoice.clientId) || null
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
  const result = await billingStore.emitInvoice({
    clientId: invoiceForm.clientId,
    paymentTermDays: invoiceForm.paymentTermDays,
    notes: invoiceForm.notes,
    items: draftInvoiceItems.value,
  })

  notify(result)

  if (result.ok) {
    resetForm()
    billingStore.fetchNextNumber() // Refresh next invoice number
  }
}

function handleDownloadPdf() {
  if (!billingStore.selectedInvoice) return
  const client = thirdPartiesStore.thirdParties.find(tp => tp.id === billingStore.selectedInvoice.clientId)
  generateInvoicePdf({
    ...billingStore.selectedInvoice,
    consecutive: billingStore.selectedInvoice.number,
    client: client
  }, rootStore.activeTenant)
}

function getStatusColor(status) {
  const colors = {
    aceptada: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    emitida: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    enviada: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    borrador: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    rechazada: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    cancelled: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  }
  return colors[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

const showCancelDialog = reactive({
  open: false,
  reason: '',
})

async function handleCancelInvoice() {
  if (!billingStore.selectedInvoice) return
  
  const result = await billingStore.cancelInvoice(
    billingStore.selectedInvoice.id,
    showCancelDialog.reason || undefined
  )
  
  emit('notify', {
    message: result.message,
    detail: result.ok ? 'El inventario ha sido restaurado.' : ''
  })
  
  if (result.ok) {
    showCancelDialog.open = false
    showCancelDialog.reason = ''
  }
}

async function handleSendToDian() {
  if (!billingStore.selectedInvoice) return
  
  const result = await billingStore.sendToDian(billingStore.selectedInvoice.id)
  
  emit('notify', {
    message: result.message,
    detail: result.ok && result.data?.cufe ? `CUFE: ${result.data.cufe.substring(0, 20)}...` : ''
  })
}

async function handleCheckDianStatus() {
  if (!billingStore.selectedInvoice) return
  
  const result = await billingStore.checkDianStatus(billingStore.selectedInvoice.id)
  
  emit('notify', {
    message: result.message,
    detail: result.cufe ? `CUFE: ${result.cufe.substring(0, 20)}...` : ''
  })
}

// Check if invoice has been sent to DIAN
function hasDianCufe(invoice) {
  if (!invoice?.timeline) return false
  return invoice.timeline.some((event) => event.cufe)
}
</script>

<template>
  <section v-if="isActive" class="min-h-full p-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <Receipt class="w-6 h-6 text-emerald-400" />
          Facturación Electrónica
        </h1>
        <p class="text-slate-400 text-sm mt-1">Gestión de documentos tributarios y ciclos DIAN</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', canBilling ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500']"></div>
          <span class="text-xs font-medium text-slate-300">{{ billingPermissionNote }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Form -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <div class="p-6 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <Plus class="w-5 h-5 text-emerald-400" />
              Nueva Factura
            </h2>
          </div>

          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Invoice Number Preview -->
            <div v-if="billingStore.nextInvoiceNumber" class="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 uppercase tracking-wider">Próxima Factura</span>
                <span class="text-sm font-mono font-bold text-emerald-400">{{ billingStore.nextInvoiceNumber.preview }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">Cliente</label>
                <select 
                  v-model="invoiceForm.clientId" 
                  required
                  class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                  :disabled="!canBilling"
                >
                  <option value="">Selecciona un cliente</option>
                  <option v-for="client in thirdPartiesStore.tenantClients" :key="client.id" :value="client.id">
                    {{ client.name }} - {{ client.nit }}
                  </option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">Condición de Pago</label>
                <select 
                  v-model.number="invoiceForm.paymentTermDays"
                  class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
                  :disabled="!canBilling"
                >
                  <option :value="30">Crédito 30 días</option>
                  <option :value="15">Crédito 15 días</option>
                  <option :value="0">Contado (Efectivo)</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wider">Notas Comerciales</label>
              <textarea
                v-model="invoiceForm.notes"
                placeholder="Observaciones visibles en el documento..."
                rows="2"
                class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none resize-none"
                :disabled="!canBilling"
              ></textarea>
            </div>

            <!-- Items Section -->
            <div class="pt-4 border-t border-slate-800/50">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-slate-200">Items de la Factura</h3>
                <button 
                  type="button" 
                  @click="addLineItem"
                  class="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                >
                  <Plus class="w-4 h-4" /> Agregar Item
                </button>
              </div>

              <div class="space-y-3">
                <div v-for="(line, index) in invoiceForm.lines" :key="line.id" 
                  class="group flex flex-col md:flex-row gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <div class="flex-grow space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Producto/Servicio</label>
                    <select 
                      v-model="line.productId"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                    >
                      <option value="">Selecciona un producto</option>
                      <option v-for="product in inventoryStore.tenantProducts" :key="product.id" :value="product.id">
                        {{ product.name }} (Stock: {{ product.stock }})
                      </option>
                    </select>
                  </div>

                  <div class="md:w-32 space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>
                    <input 
                      v-model.number="line.quantity" 
                      min="1" 
                      type="number"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div class="flex items-end pb-1">
                    <button 
                      type="button" 
                      @click="removeLineItem(index)"
                      class="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <button 
                type="submit"
                :disabled="!canBilling || draftInvoiceItems.length === 0 || draftInvoiceWarnings.length > 0"
                class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <Receipt class="w-5 h-5" />
                Emitir Factura Electrónica
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Column: Previews & History -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Totals Card -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20">
            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest">Resumen de Liquidación</h2>
          </div>
          
          <div class="p-6 space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Subtotal</span>
              <span class="text-slate-200 font-medium">{{ formatCurrency(draftInvoiceTotals.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">IVA (19%)</span>
              <span class="text-emerald-400 font-medium">+ {{ formatCurrency(draftInvoiceTotals.tax) }}</span>
            </div>
            <div class="pt-4 border-t border-slate-800/50 flex justify-between items-center">
              <span class="text-base font-bold text-white">Total a Pagar</span>
              <span class="text-xl font-bold text-white">{{ formatCurrency(draftInvoiceTotals.total) }}</span>
            </div>

            <div v-if="draftInvoiceWarnings.length" class="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex gap-3">
              <AlertCircle class="w-5 h-5 text-rose-500 shrink-0" />
              <div class="text-xs text-rose-200 leading-relaxed">
                <p v-for="warning in draftInvoiceWarnings" :key="warning">{{ warning }}</p>
              </div>
            </div>
            <div v-else-if="draftInvoiceItems.length > 0" class="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex gap-3">
              <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
              <p class="text-xs text-emerald-200">El documento cumple con las validaciones de stock y DIAN.</p>
            </div>
          </div>
        </div>

        <!-- History Card -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest">Últimas Facturas</h2>
            <FileText class="w-4 h-4 text-slate-500" />
          </div>

          <div class="max-h-[300px] overflow-y-auto">
            <div v-if="billingStore.tenantInvoices.length" class="divide-y divide-slate-800/50">
              <div 
                v-for="invoice in billingStore.tenantInvoices" 
                :key="invoice.id"
                @click="billingStore.selections.invoiceId = invoice.id"
                :class="[
                  'p-4 cursor-pointer hover:bg-slate-800/30 transition-all relative group',
                  invoice.id === billingStore.selections.invoiceId ? 'bg-slate-800/50' : ''
                ]"
              >
                <!-- Active Indicator -->
                <div v-if="invoice.id === billingStore.selections.invoiceId" class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{{ invoice.number }}</span>
                  <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tighter', getStatusColor(invoice.status)]">
                    {{ invoice.status }}
                  </span>
                </div>
                <div class="flex justify-between items-end">
                  <div class="text-xs text-slate-400">
                    <p class="text-slate-300 font-medium">{{ rootStore.thirdParties.find(tp => tp.id === invoice.clientId)?.name }}</p>
                    <p>{{ formatDate(invoice.createdAt) }}</p>
                  </div>
                  <span class="text-sm font-semibold text-white">{{ formatCurrency(invoice.total) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-12 text-center">
              <Receipt class="w-12 h-12 text-slate-800 mx-auto mb-3" />
              <p class="text-slate-500 text-sm">No hay facturas emitidas</p>
            </div>
          </div>
        </div>

        <!-- DIAN Workflow Card -->
        <div v-if="billingStore.selectedInvoice" class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20 animate-in slide-in-from-bottom-4">
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Trazabilidad DIAN</h2>
            <div class="flex items-center gap-2">
              <!-- Send to DIAN button -->
              <button
                v-if="billingStore.selectedInvoice.status !== 'cancelled' && billingStore.selectedInvoice.status !== 'draft' && canBilling && !hasDianCufe(billingStore.selectedInvoice)"
                @click="handleSendToDian"
                class="p-2 hover:bg-emerald-900/30 rounded-lg text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-2 text-xs"
              >
                <Send class="w-4 h-4" /> Enviar DIAN
              </button>
              <!-- Check DIAN status button -->
              <button
                v-if="hasDianCufe(billingStore.selectedInvoice)"
                @click="handleCheckDianStatus"
                class="p-2 hover:bg-blue-900/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2 text-xs"
              >
                <RefreshCw class="w-4 h-4" /> Verificar
              </button>
              <button
                v-if="billingStore.selectedInvoice.status !== 'cancelled' && canBilling"
                @click="showCancelDialog.open = true"
                class="p-2 hover:bg-rose-900/30 rounded-lg text-rose-400 hover:text-rose-300 transition-all flex items-center gap-2 text-xs"
              >
                <X class="w-4 h-4" /> Cancelar
              </button>
              <button
                @click="handleDownloadPdf"
                class="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs"
              >
                <FileDown class="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <!-- CUFE Display -->
          <div v-if="hasDianCufe(billingStore.selectedInvoice)" class="px-5 py-3 bg-slate-800/10 border-b border-slate-800/50">
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-500 uppercase">CUFE:</span>
              <code class="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                {{ billingStore.selectedInvoice.timeline.find(e => e.cufe)?.cufe?.substring(0, 32) }}...
              </code>
            </div>
          </div>

          <div class="p-6">
            <div class="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
              <div v-for="event in [...(billingStore.selectedInvoice.timeline || [])].reverse()" :key="event.id" class="relative pl-8">
                <div :class="[
                  'absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 border-[#131926] z-10 flex items-center justify-center',
                  event.status === 'aceptada' ? 'bg-emerald-500' : 'bg-slate-700'
                ]">
                  <CheckCircle2 v-if="event.status === 'aceptada'" class="w-2.5 h-2.5 text-white" />
                  <Clock v-else class="w-2.5 h-2.5 text-white" />
                </div>
                <div class="flex items-center justify-between mb-1">
                  <span :class="['text-[10px] font-bold uppercase', event.status === 'aceptada' ? 'text-emerald-400' : 'text-slate-400']">
                    {{ event.status }}
                  </span>
                  <span class="text-[10px] text-slate-500 font-mono">{{ formatDate(event.at) }}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed">{{ event.note }}</p>
                <!-- QR Code link if available -->
                <a v-if="event.qrCode" :href="event.qrCode" target="_blank" class="text-[10px] text-blue-400 hover:text-blue-300 mt-1 inline-block">
                  Ver en DIAN →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <div v-if="showCancelDialog.open" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-[#131926] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <AlertCircle class="w-5 h-5 text-rose-500" />
            </div>
            <h3 class="text-lg font-semibold text-white">Cancelar Factura</h3>
          </div>
          <p class="text-slate-400 text-sm mb-4">
            Estás a punto de cancelar la factura <span class="text-white font-mono">{{ billingStore.selectedInvoice?.number }}</span>.
            Esta acción reversará el inventario y no se puede deshacer.
          </p>
          <div class="space-y-2">
            <label class="text-xs font-medium text-slate-400 uppercase">Motivo de cancelación (opcional)</label>
            <textarea
              v-model="showCancelDialog.reason"
              placeholder="Ej: Error en datos del cliente, duplicado, etc."
              rows="2"
              class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all outline-none resize-none"
            ></textarea>
          </div>
        </div>
        <div class="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-end gap-3">
          <button
            @click="showCancelDialog.open = false; showCancelDialog.reason = ''"
            class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Volver
          </button>
          <button
            @click="handleCancelInvoice"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
          >
            <X class="w-4 h-4" />
            Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom scrollbar for history list */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
