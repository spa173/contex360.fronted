<script setup>
import { ref, computed } from 'vue'
import { useQuotesStore } from '../../stores/quotesStore'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { formatCurrency } from '../../utils/ui'
import { generatePdfReport } from '../../utils/pdfExport'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const quotes = useQuotesStore()
const tenantQuotes = computed(() => quotes.tenantQuotes || [])
const selectedQuote = ref(null)
const searchQuery = ref('')

const thirdPartiesStore = useThirdPartiesStore()
const inventoryStore = useInventoryStore()

const tenantClients = computed(() => thirdPartiesStore.tenantClients)
const tenantProducts = computed(() => inventoryStore.tenantProducts)

const filteredQuotes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return tenantQuotes.value
  return tenantQuotes.value.filter(item => 
    (item.number || '').toLowerCase().includes(q) ||
    (item.customerName || item.client?.name || '').toLowerCase().includes(q)
  )
})

function statusBadge(status) {
  const s = (status || '').toLowerCase()
  if (s === 'approved' || s === 'aprobada') return { class: 'bg-emerald-50 text-emerald-700', label: 'Aprobada' }
  if (s === 'sent' || s === 'enviada') return { class: 'bg-[#2563EB]/10 text-[#2563EB]', label: 'Enviada' }
  if (s === 'expired' || s === 'vencida') return { class: 'bg-rose-50 text-rose-700', label: 'Vencida' }
  if (s === 'converted' || s === 'convertida') return { class: 'bg-purple-50 text-purple-700', label: 'Convertida' }
  return { class: 'bg-[#F4F4F5] text-[#71717A]', label: status || '—' }
}

async function handleConvertToInvoice(quote) {
  emit('notify', { message: 'Conversión iniciada', detail: `Convirtiendo cotización ${quote.number} a factura...` })
  const res = await quotes.convertToInvoice(quote.id)
  if (res.ok) {
    emit('notify', { message: 'Cotización convertida', detail: `Se generó la factura ${res.invoice?.number || 'electrónica'}.` })
  } else {
    emit('notify', { message: 'Error', detail: res.message })
  }
}

async function handleExport() {
  emit('notify', { message: 'Exportación iniciada', detail: 'Generando archivo de cotizaciones...' })
  
  const totalCotizaciones = tenantQuotes.value.length
  const montoTotal = tenantQuotes.value.reduce((acc, q) => acc + Number(q.total || 0), 0)
  const aprobadas = tenantQuotes.value.filter(q => (q.status || '').toLowerCase().startsWith('appro')).length
  const convertidas = tenantQuotes.value.filter(q => (q.status || '').toLowerCase() === 'converted').length

  const res = await generatePdfReport({
    title: 'Reporte de Cotizaciones',
    subtitle: 'Resumen Gerencial',
    fileName: 'Cotizaciones_Contex360.pdf',
    aiSummary: 'El historial muestra una visión general de todas las ofertas comerciales generadas en el sistema. Puedes analizar el volumen de cotizaciones enviadas, aprobadas y aquellas que ya han sido convertidas exitosamente en ventas/facturas.',
    data: {
      'Total Cotizaciones': totalCotizaciones,
      'Cotizaciones Aprobadas': aprobadas,
      'Cotizaciones Convertidas a Factura': convertidas,
      'Valor Total Cotizado': formatCurrency(montoTotal)
    }
  })

  if (res.ok) {
    emit('notify', { message: 'Exportación exitosa', detail: 'El reporte se ha descargado correctamente.' })
  } else {
    emit('notify', { message: 'Error de exportación', detail: res.message })
  }
}

// New Quote Modal State
const showNewQuoteModal = ref(false)
const isSubmitting = ref(false)
const quoteForm = ref({
  clientId: '',
  validUntil: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
  notes: '',
  terms: 'Válido por 30 días. Pago del 50% al aceptar y 50% al entregar.',
  items: [
    { productId: '', productName: '', quantity: 1, unitPrice: 0, taxRate: 19 }
  ]
})

function handleNewQuote() {
  thirdPartiesStore.fetchThirdParties()
  inventoryStore.fetchProducts()
  quoteForm.value = {
    clientId: '',
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
    notes: '',
    terms: 'Válido por 30 días. Pago del 50% al aceptar y 50% al entregar.',
    items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, taxRate: 19 }]
  }
  showNewQuoteModal.value = true
}

function addItem() {
  quoteForm.value.items.push({ productId: '', productName: '', quantity: 1, unitPrice: 0, taxRate: 19 })
}

function removeItem(idx) {
  if (quoteForm.value.items.length > 1) {
    quoteForm.value.items.splice(idx, 1)
  }
}

function onProductSelect(item) {
  if (!item.productId) return
  const product = tenantProducts.value.find(p => p.id === item.productId)
  if (product) {
    item.productName = product.name
    item.unitPrice = product.price || 0
    item.taxRate = product.taxRate || 19
  }
}

const quoteSubtotal = computed(() => quoteForm.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))
const quoteTax = computed(() => quoteForm.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0))
const quoteTotal = computed(() => quoteSubtotal.value + quoteTax.value)

async function submitNewQuote() {
  if (!quoteForm.value.clientId) {
    emit('notify', { message: 'Falta cliente', detail: 'Por favor selecciona un cliente.' })
    return
  }
  for (const item of quoteForm.value.items) {
    if (!item.productName) {
      emit('notify', { message: 'Ítem inválido', detail: 'Todos los ítems deben tener un nombre o descripción.' })
      return
    }
  }

  isSubmitting.value = true
  try {
    const payload = {
      clientId: quoteForm.value.clientId,
      validUntil: new Date(quoteForm.value.validUntil).toISOString(),
      notes: quoteForm.value.notes,
      terms: quoteForm.value.terms,
      items: quoteForm.value.items.map(i => ({
        productId: i.productId || null,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: i.taxRate,
        subtotal: i.quantity * i.unitPrice,
        taxAmount: i.quantity * i.unitPrice * (i.taxRate / 100)
      }))
    }
    const res = await quotes.createQuote(payload)
    if (res.ok) {
      emit('notify', { message: 'Cotización creada', detail: 'La cotización se generó y guardó con éxito.' })
      showNewQuoteModal.value = false
    } else {
      emit('notify', { message: 'Error', detail: res.message })
    }
  } catch (e) {
    emit('notify', { message: 'Error', detail: e.message })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Operaciones</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Cotizaciones</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Cotizaciones</h1>
        <p class="text-[14px] text-[#71717A]">Gestión de ofertas comerciales y conversión a factura.</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
        <button @click="handleNewQuote" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">add</span>Nueva cotización
        </button>
      </div>
    </div>

    <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
      <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
          <input v-model="searchQuery" placeholder="Filtrar cotizaciones..." class="pl-8 pr-3 py-1.5 text-[12px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B] w-56" />
        </div>
        <span class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">{{ filteredQuotes.length }} registros</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[600px]">
          <thead>
            <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
              <th class="px-5 py-3">ID</th>
              <th class="px-5 py-3">Cliente</th>
              <th class="px-5 py-3">Vence</th>
              <th class="px-5 py-3 text-right">Monto</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3">Acción</th>
            </tr>
          </thead>
          <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
            <tr v-for="q in filteredQuotes" :key="q.id" @click="selectedQuote = q" class="hover:bg-[#FAFAFA] cursor-pointer">
              <td class="px-5 py-3.5 font-mono text-[#2563EB] font-semibold">{{ q.number }}</td>
              <td class="px-5 py-3.5 font-semibold text-[#18181B]">{{ q.customerName || q.client?.name || 'Cliente' }}</td>
              <td class="px-5 py-3.5 text-[#71717A]">{{ new Date(q.dueDate || q.createdAt).toLocaleDateString() }}</td>
              <td class="px-5 py-3.5 text-right font-mono font-semibold">{{ formatCurrency(q.total) }}</td>
              <td class="px-5 py-3.5"><span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold', statusBadge(q.status).class]">{{ statusBadge(q.status).label }}</span></td>
              <td class="px-5 py-3.5">
                <button v-if="(q.status || '').toLowerCase().startsWith('appro')" @click.stop="handleConvertToInvoice(q)" class="text-[11px] font-semibold text-[#2563EB] hover:underline">
                  Convertir a factura →
                </button>
                <span v-else-if="(q.status || '').toLowerCase() === 'converted'" class="text-[11px] text-purple-700 font-semibold">Convertida ✓</span>
                <button v-else class="text-[#A1A1AA] hover:text-[#18181B]"><span class="material-symbols-outlined text-[16px]">more_horiz</span></button>
              </td>
            </tr>
            <tr v-if="filteredQuotes.length === 0">
              <td colspan="6" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No hay cotizaciones registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- New Quote Modal -->
    <div v-if="showNewQuoteModal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showNewQuoteModal = false"></div>
      <div class="relative bg-white rounded-[16px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-[#F4F4F5] flex justify-between items-center bg-[#FAFAFA] shrink-0">
          <div>
            <h3 class="text-[18px] font-bold text-[#18181B] tracking-tight">Nueva Cotización</h3>
            <p class="text-[13px] text-[#71717A] mt-0.5">Elabora una propuesta comercial para un cliente.</p>
          </div>
          <button @click="showNewQuoteModal = false" class="text-[#A1A1AA] hover:text-[#18181B] transition-colors rounded-full p-1 hover:bg-[#F4F4F5]">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div class="overflow-y-auto p-6 space-y-6 flex-1">
          <!-- Header info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Cliente *</label>
              <select v-model="quoteForm.clientId" class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]">
                <option value="" disabled>Selecciona un cliente</option>
                <option v-for="tp in tenantClients" :key="tp.id" :value="tp.id">{{ tp.name }} ({{ tp.nit }})</option>
              </select>
            </div>
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Válido Hasta *</label>
              <input v-model="quoteForm.validUntil" type="date" required class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
            </div>
          </div>

          <!-- Items list -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider block">Ítems Cotizados *</label>
              <button @click="addItem" class="text-[12px] font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">add</span> Añadir fila
              </button>
            </div>
            
            <div class="border border-[#E4E4E7] rounded-[12px] overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-[#FAFAFA] border-b border-[#E4E4E7]">
                  <tr>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Producto / Servicio</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[100px]">Cant</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[140px]">Precio Unit.</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[100px]">% IVA</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[140px] text-right">Subtotal</th>
                    <th class="px-3 py-2 w-[40px]"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F4F4F5]">
                  <tr v-for="(item, idx) in quoteForm.items" :key="idx" class="bg-white">
                    <td class="px-3 py-2">
                      <div class="flex flex-col gap-1">
                        <select v-model="item.productId" @change="onProductSelect(item)" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]">
                          <option value="">-- Servicio o ítem libre --</option>
                          <option v-for="p in tenantProducts" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                        <input v-if="!item.productId" v-model="item.productName" placeholder="Descripción de la oferta" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
                      </div>
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="item.quantity" type="number" min="1" step="any" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="item.unitPrice" type="number" min="0" step="any" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
                    </td>
                    <td class="px-3 py-2">
                      <select v-model.number="item.taxRate" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]">
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="19">19%</option>
                      </select>
                    </td>
                    <td class="px-3 py-2 text-right font-mono text-[12px] font-semibold text-[#18181B]">
                      {{ formatCurrency(item.quantity * item.unitPrice) }}
                    </td>
                    <td class="px-3 py-2 text-right">
                      <button @click="removeItem(idx)" :disabled="quoteForm.items.length <= 1" class="text-[#A1A1AA] hover:text-red-500 disabled:opacity-30">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Totals -->
            <div class="mt-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div class="w-full md:w-1/2 space-y-4">
                <div>
                  <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-1 block">Términos Comerciales</label>
                  <textarea v-model="quoteForm.terms" rows="2" class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2 text-[13px] bg-[#FAFAFA] outline-none focus:border-[#18181B] resize-none"></textarea>
                </div>
                <div>
                  <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-1 block">Notas Privadas</label>
                  <textarea v-model="quoteForm.notes" rows="1" placeholder="Ej. Margen especial, competencia..." class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2 text-[13px] bg-[#FAFAFA] outline-none focus:border-[#18181B] resize-none"></textarea>
                </div>
              </div>
              <div class="w-full md:w-1/2 max-w-[280px] bg-[#FAFAFA] rounded-[10px] p-4 border border-[#E4E4E7]">
                <div class="flex justify-between mb-2 text-[12px] text-[#71717A]">
                  <span>Subtotal</span>
                  <span class="font-mono font-semibold">{{ formatCurrency(quoteSubtotal) }}</span>
                </div>
                <div class="flex justify-between mb-3 text-[12px] text-[#71717A]">
                  <span>Impuestos (IVA)</span>
                  <span class="font-mono font-semibold">{{ formatCurrency(quoteTax) }}</span>
                </div>
                <div class="flex justify-between pt-3 border-t border-[#E4E4E7] text-[14px] font-bold text-[#18181B]">
                  <span>Gran Total</span>
                  <span class="font-mono text-[#2563EB]">{{ formatCurrency(quoteTotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="px-6 py-4 border-t border-[#F4F4F5] bg-[#FAFAFA] flex justify-end gap-3 shrink-0">
          <button @click="showNewQuoteModal = false" class="px-4 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">Cancelar</button>
          <button @click="submitNewQuote" :disabled="isSubmitting" class="px-6 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold flex items-center gap-2 disabled:opacity-50">
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            {{ isSubmitting ? 'Guardando...' : 'Guardar Cotización' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
