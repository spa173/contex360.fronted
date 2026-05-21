<script setup>
import { ref, computed } from 'vue'
import { useQuotesStore } from '../../stores/quotesStore'
import { formatCurrency } from '../../utils/ui'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const quotes = useQuotesStore()
const tenantQuotes = computed(() => quotes.tenantQuotes || [])
const selectedQuote = ref(null)
const searchQuery = ref('')

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

function handleExport() {
  emit('notify', { message: 'Exportación iniciada', detail: 'Generando archivo de cotizaciones...' })
}

function handleNewQuote() {
  emit('notify', { message: 'Nueva cotización', detail: 'Abre el formulario de cotización comercial.' })
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
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
