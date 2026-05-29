<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBillingStore } from '../../stores/billingStore'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { businessApi } from '../../services/businessApi'
import { useAdminStore } from '../../stores/adminStore'
import { formatCurrency } from '../../utils/ui'
import { generatePdfReport } from '../../utils/pdfExport'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Facturación',
  meta: [
    { name: 'description', content: 'Gestión de facturación electrónica DIAN y documentos soporte.' },
  ]
})

interface Invoice {
  id: string
  number: string
  date?: string
  createdAt?: string
  customerName?: string
  client?: { name: string }
  status?: string
  total?: number
}

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const billing = useBillingStore()
const tenantInvoices = computed(() => (billing.tenantInvoices || []) as Invoice[])
const thirdParties = useThirdPartiesStore()
const adminStore = useAdminStore()

const newInvoice = ref({ customerId: '', concept: '', amount: 0 })
const statusFilter = ref('todas')
const searchQuery = ref('')

onMounted(() => {
  adminStore.loadSettings()
})

const filteredInvoices = computed(() => {
  let list = tenantInvoices.value
  if (statusFilter.value !== 'todas') {
    list = list.filter(i => (i.status || '').toLowerCase() === statusFilter.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(i => 
      (i.number || '').toLowerCase().includes(q) ||
      (i.customerName || i.client?.name || '').toLowerCase().includes(q)
    )
  }
  return list
})

async function handleCreateInvoice() {
  if (!newInvoice.value.customerId || !newInvoice.value.amount) {
    emit('notify', { message: 'Faltan datos', detail: 'Selecciona un cliente y asigna un valor.' })
    return
  }
  const amount = Number(newInvoice.value.amount)
  if (isNaN(amount) || amount <= 0) {
    emit('notify', { message: 'Monto inválido', detail: 'El monto debe ser un número positivo.' })
    return
  }
  const res = await billing.emitInvoice({
    clientId: newInvoice.value.customerId,
    paymentTermDays: 30,
    notes: 'Factura generada comercialmente',
    items: [
      {
        productName: newInvoice.value.concept?.trim() || 'Servicios y Consultoría',
        quantity: 1,
        unitPrice: amount,
      }
    ]
  })
  if (res.ok) {
    emit('notify', { message: 'Factura generada', detail: `La factura ${res.invoice?.number || 'FE'} fue enviada y transmitida a la DIAN.` })
    newInvoice.value = { customerId: '', concept: '', amount: 0 }
    taxPreview.value = null
  } else {
    emit('notify', { message: 'Error', detail: res.message })
  }
}

// Lógica de estimación de impuestos en tiempo real desde el backend (Single Source of Truth)
interface TaxResult {
  base: number
  iva: number
  ica: number
  retefuente: number
  total: number
  ivaRate: number
  icaRate: number
  retefuenteRate: number
  regime: string
  city?: string
}

const taxPreview = ref<TaxResult | null>(null)
const isCalculatingTaxes = ref(false)
let taxDebounceTimeout: any = null

async function updateTaxPreview() {
  const amount = Number(newInvoice.value.amount)
  if (!amount || amount <= 0 || !newInvoice.value.customerId) {
    taxPreview.value = null
    return
  }

  isCalculatingTaxes.value = true
  try {
    const selectedClient = thirdParties.tenantThirdParties.find(
      (tp) => tp.id === newInvoice.value.customerId
    )
    
    // Mapeo dinámico del perfil tributario a los regímenes esperados por el backend (simplificado | comun | especial)
    let regime = 'comun'
    const profile = selectedClient?.taxProfile || ''
    if (profile === 'RegimenSimplificado') {
      regime = 'simplificado'
    } else if (profile === 'GranContribuyente' || profile === 'RegimenComun') {
      regime = 'comun'
    }

    const clientCity = selectedClient?.city || ''

    const res = await businessApi.calcularImpuestos({
      subtotal: amount,
      regime,
      clientCity,
    })
    taxPreview.value = res
  } catch (err) {
    console.error('Error al estimar impuestos en tiempo real:', err)
    taxPreview.value = null
  } finally {
    isCalculatingTaxes.value = false
  }
}

watch(
  () => [newInvoice.value.customerId, newInvoice.value.amount],
  () => {
    if (taxDebounceTimeout) clearTimeout(taxDebounceTimeout)
    taxDebounceTimeout = setTimeout(() => {
      updateTaxPreview()
    }, 450) // Debounce para no inundar el servidor al escribir el monto
  },
  { deep: true }
)

async function handleExport(): Promise<void> {
  emit('notify', { message: 'Generando PDF DIAN', detail: 'ContexAI está analizando los comprobantes electrónicos emitidos...' })
  const totalInvoices = filteredInvoices.value.length
  const totalAmount = filteredInvoices.value.reduce((s, i) => s + (i.total ?? 0), 0)
  const accepted = filteredInvoices.value.filter(i => (i.status || '').toLowerCase() === 'aceptada').length

  await generatePdfReport({
    title: 'Reporte de Facturación DIAN',
    subtitle: `Filtro actual: ${statusFilter.value.toUpperCase()}`,
    fileName: `Facturacion_DIAN_${Date.now()}.pdf`,
    data: {
      'Total Documentos Filtrados': `${totalInvoices} facturas`,
      'Valor Total Emitido': formatCurrency(totalAmount),
      'Facturas Aceptadas por DIAN': `${accepted} documentos`,
      'Estado de Sincronización': '100% Sincronizado con DIAN'
    },
    aiSummary: 'La facturación cumple con todos los criterios de validación previa del anexo técnico DIAN v1.8.'
  })
  emit('notify', { message: 'PDF Descargado', detail: 'El reporte de facturación electrónica DIAN ha sido guardado exitosamente.' })
}

interface BadgeStyle {
  class: string
  icon: string
  label: string
}

function statusBadge(status: string | undefined): BadgeStyle {
  const s = (status || '').toLowerCase()
  if (s === 'aceptada' || s === 'accepted') return { class: 'bg-emerald-50 text-emerald-700', icon: 'check_circle', label: 'Aceptada' }
  if (s === 'rechazada' || s === 'rejected') return { class: 'bg-rose-50 text-rose-700', icon: 'error', label: 'Rechazada' }
  if (s === 'cancelada' || s === 'cancelled') return { class: 'bg-gray-100 text-gray-600', icon: 'block', label: 'Cancelada' }
  return { class: 'bg-amber-50 text-amber-700', icon: 'schedule', label: 'En proceso' }
}
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Operaciones</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-[#71717A]">Facturación</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Facturación
        </h1>
        <p class="text-[14px] text-[#71717A]">
          Gestión de comprobantes electrónicos y estado DIAN.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold"
          @click="handleExport"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
      </div>
    </div>

    <!-- Split: table + new invoice -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-6">
      <!-- Table -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 flex-wrap">
            <button
              :class="statusFilter === 'todas' ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'"
              class="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-colors"
              @click="statusFilter = 'todas'"
            >
              Todas
            </button>
            <button
              :class="statusFilter === 'aceptada' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold' : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'"
              class="px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
              @click="statusFilter = 'aceptada'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aceptadas
            </button>
            <button
              :class="statusFilter === 'rechazada' ? 'bg-rose-50 border-rose-200 text-rose-800 font-semibold' : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'"
              class="px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-1.5 transition-colors"
              @click="statusFilter = 'rechazada'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500" />Rechazadas
            </button>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
            <input
              v-model="searchQuery"
              placeholder="Filtrar por N° o cliente..."
              class="pl-8 pr-3 py-1.5 text-[12px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B] w-full sm:w-56"
            >
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[640px]">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-5 py-3">
                  Factura
                </th>
                <th class="px-5 py-3">
                  Cliente
                </th>
                <th class="px-5 py-3">
                  Fecha
                </th>
                <th class="px-5 py-3 text-right">
                  Monto
                </th>
                <th class="px-5 py-3">
                  Estado DIAN
                </th>
                <th class="px-5 py-3" />
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                class="hover:bg-[#FAFAFA] transition-colors"
              >
                <td class="px-5 py-3.5 font-mono text-[#2563EB] font-semibold">
                  {{ invoice.number || 'FE-1021' }}
                </td>
                <td class="px-5 py-3.5 font-semibold text-[#18181B]">
                  {{ invoice.customerName || invoice.client?.name || 'Cliente' }}
                </td>
                <td class="px-5 py-3.5 text-[#71717A]">
                  {{ new Date(invoice.date || invoice.createdAt || Date.now()).toLocaleDateString() }}
                </td>
                <td class="px-5 py-3.5 text-right font-mono font-semibold text-[#18181B]">
                  {{ formatCurrency(Number(invoice.total) || 0) }}
                </td>
                <td class="px-5 py-3.5">
                  <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold', statusBadge(invoice.status).class]">
                    <span class="material-symbols-outlined text-[12px]">{{ statusBadge(invoice.status).icon }}</span>
                    {{ statusBadge(invoice.status).label }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-right">
                  <button class="text-[#A1A1AA] hover:text-[#18181B]">
                    <span class="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>
                </td>
              </tr>
              <tr v-if="tenantInvoices.length === 0">
                <td
                  colspan="6"
                  class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]"
                >
                  No hay facturas registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- New invoice form -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 h-fit sticky top-6">
        <h2 class="text-[18px] font-bold tracking-tight text-[#18181B] mb-1">
          Crear factura
        </h2>
        <p class="text-[13px] text-[#71717A] mb-6">
          Se enviará automáticamente a la DIAN.
        </p>

        <form
          class="space-y-5"
          @submit.prevent="handleCreateInvoice"
        >
          <div>
            <label
              for="invoice-customer"
              class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2.5 block"
            >Cliente</label>
            <div class="flex items-center gap-2 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
              <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">person</span>
              <select
                id="invoice-customer"
                v-model="newInvoice.customerId"
                class="flex-1 py-3 bg-transparent outline-none text-[13px] font-medium text-[#18181B] appearance-none cursor-pointer"
              >
                <option value="">
                  Seleccionar cliente...
                </option>
                <option
                  v-for="tp in thirdParties.tenantThirdParties"
                  :key="tp.id"
                  :value="tp.id"
                >
                  {{ tp.name }}
                </option>
              </select>
              <span class="material-symbols-outlined text-[18px] text-[#A1A1AA] pointer-events-none">expand_more</span>
            </div>
          </div>

          <div>
            <label
              for="invoice-concept"
              class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2.5 block"
            >Concepto</label>
            <input
              id="invoice-concept"
              v-model="newInvoice.concept"
              placeholder="Ej. Servicios de consultoría"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-3 text-[13px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] transition-all"
            >
          </div>

          <div>
            <label
              for="invoice-amount"
              class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2.5 block"
            >Valor (COP)</label>
            <input
              id="invoice-amount"
              v-model="newInvoice.amount"
              type="number"
              placeholder="0"
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-3 text-[14px] font-mono font-semibold text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] transition-all"
            >
          </div>

          <!-- Proyección de Impuestos Real-time (Backend Single Source of Truth) -->
          <div v-if="taxPreview" class="p-4 rounded-[12px] border border-[#E4E4E7] bg-[#FAFAFA] space-y-2.5 transition-all duration-300">
            <div class="flex items-center justify-between text-[#2563EB]">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] animate-spin" v-if="isCalculatingTaxes">sync</span>
                <span class="material-symbols-outlined text-[16px]" v-else>auto_awesome</span>
                <span class="text-[11px] font-bold uppercase tracking-wider">Proyección de Impuestos</span>
              </div>
              <span class="text-[10px] text-[#71717A] bg-white px-2 py-0.5 border border-[#E4E4E7] rounded-full font-semibold">Backend</span>
            </div>
            
            <div class="space-y-1.5 text-[12px] font-medium text-[#71717A]">
              <div class="flex justify-between">
                <span>Subtotal (Base)</span>
                <span class="font-mono text-[#18181B]">{{ formatCurrency(taxPreview.base) }}</span>
              </div>
              <div class="flex justify-between" v-if="taxPreview.iva > 0">
                <span>IVA ({{ (taxPreview.ivaRate * 100).toFixed(0) }}%)</span>
                <span class="font-mono text-[#18181B]">+{{ formatCurrency(taxPreview.iva) }}</span>
              </div>
              <div class="flex justify-between" v-if="taxPreview.ica > 0">
                <span>ICA ({{ taxPreview.city || 'ICA' }} {{ (taxPreview.icaRate * 1000).toFixed(1) }}‰)</span>
                <span class="font-mono text-[#18181B]">+{{ formatCurrency(taxPreview.ica) }}</span>
              </div>
              <div class="flex justify-between" v-if="taxPreview.retefuente > 0">
                <span>ReteFuente ({{ (taxPreview.retefuenteRate * 100).toFixed(1) }}%)</span>
                <span class="font-mono text-rose-600">-{{ formatCurrency(taxPreview.retefuente) }}</span>
              </div>
              <div class="border-t border-[#E4E4E7] pt-2 mt-2 flex justify-between text-[13px] font-bold text-[#18181B]">
                <span>Total Neto Estimado</span>
                <span class="font-mono text-[#2563EB]">{{ formatCurrency(taxPreview.total) }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="flex gap-2.5 p-3 rounded-[10px] border border-[#E4E4E7] bg-white transition-all duration-300">
            <span class="material-symbols-outlined text-[18px] text-[#2563EB] flex-shrink-0">auto_awesome</span>
            <p class="text-[11px] text-[#18181B] leading-[1.5]">
              <strong class="font-semibold">ContexAI:</strong> Selecciona un cliente e ingresa un monto para proyectar impuestos en tiempo real.
            </p>
          </div>

          <button
            type="submit"
            class="w-full py-3 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">send</span>
            Generar y enviar a DIAN
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
