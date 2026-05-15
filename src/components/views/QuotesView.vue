<script setup>
import { ref, computed } from 'vue'
import { useQuotesStore } from '../../stores/quotesStore'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const quotes = useQuotesStore()

const selectedQuote = ref(null)

function getStatusClass(status) {
  switch (status?.toLowerCase()) {
    case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'expired': return 'bg-rose-50 text-rose-700 border-rose-100'
    default: return 'bg-slate-50 text-slate-700 border-slate-100'
  }
}

function handleConvertToInvoice(quote) {
  emit('notify', { message: 'Conversión Iniciada', detail: `Convirtiendo cotización ${quote.number} a factura electrónica...` })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header Section -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-bold text-slate-900">Cotizaciones</h2>
        <p class="text-sm text-slate-500 mt-1">Gestión de ofertas comerciales y conversión de ventas.</p>
      </div>
      <div class="flex space-x-3">
        <button class="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center text-xs font-bold shadow-sm">
          <span class="material-symbols-outlined mr-2 text-[18px]">download</span>
          Exportar
        </button>
        <button class="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all text-xs font-bold shadow-md shadow-violet-200 flex items-center">
          <span class="material-symbols-outlined mr-2 text-[18px]">add</span>
          Nueva Cotización
        </button>
      </div>
    </div>

    <!-- AI Insight Banner -->
    <div class="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-start gap-4 mb-8">
      <div class="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
        <span class="material-symbols-outlined text-[20px]">lightbulb</span>
      </div>
      <div>
        <h4 class="text-[11px] font-bold text-violet-700 uppercase tracking-wider mb-1">ContexAI Insight</h4>
        <p class="text-xs text-violet-900 leading-relaxed">
          Basado en el historial reciente, la cotización <span class="font-mono font-bold">#COT-1025</span> tiene un <strong>85% de probabilidad de cierre</strong>. Se recomienda seguimiento comercial en las próximas 24 horas.
        </p>
      </div>
    </div>

    <div class="flex flex-col xl:flex-row gap-6">
      <!-- Data Table Section -->
      <div class="flex-grow border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div class="relative w-64">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">filter_list</span>
            <input class="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-violet-500/20 outline-none" placeholder="Filtrar cotizaciones..." type="text"/>
          </div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {{ quotes.tenantQuotes.length }} Registros Encontrados
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                <th class="px-6 py-3">ID</th>
                <th class="px-6 py-3">Cliente</th>
                <th class="px-6 py-3">Fecha</th>
                <th class="px-6 py-3">Vencimiento</th>
                <th class="px-6 py-3 text-right">Monto Total</th>
                <th class="px-6 py-3 text-center">Estado</th>
                <th class="px-6 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
              <tr v-for="quote in quotes.tenantQuotes" :key="quote.id" 
                class="hover:bg-slate-50 transition-colors cursor-pointer"
                @click="selectedQuote = quote"
              >
                <td class="px-6 py-4 font-mono text-violet-600 font-semibold">{{ quote.number }}</td>
                <td class="px-6 py-4 font-bold">{{ quote.customerName }}</td>
                <td class="px-6 py-4 text-slate-500">{{ new Date(quote.date).toLocaleDateString() }}</td>
                <td class="px-6 py-4" :class="{'text-rose-500 font-bold': quote.status === 'Expired'}">
                  {{ new Date(quote.dueDate).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 text-right font-mono font-bold">{{ formatCurrency(quote.total) }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border', getStatusClass(quote.status)]">
                    {{ quote.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button 
                    v-if="quote.status === 'Approved'"
                    @click.stop="handleConvertToInvoice(quote)"
                    class="text-violet-600 hover:text-violet-800 text-[10px] font-bold underline uppercase tracking-tighter"
                  >
                    Convertir a Factura
                  </button>
                  <button v-else class="text-slate-300 hover:text-slate-600">
                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </td>
              </tr>
              <tr v-if="quotes.tenantQuotes.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-slate-400">No hay cotizaciones registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Version History Side Panel -->
      <div v-if="selectedQuote" class="w-full xl:w-80 shrink-0 border border-slate-200 rounded-xl bg-white p-6 shadow-sm animate-in slide-in-from-right-4 duration-300">
        <div class="flex justify-between items-center mb-6 pb-2 border-b border-slate-50">
          <h3 class="text-sm font-bold text-slate-900">Historial de Versiones</h3>
          <span class="font-mono text-violet-600 text-xs font-bold">{{ selectedQuote.number }}</span>
        </div>
        <div class="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
          <div class="relative pl-6">
            <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-violet-600 ring-4 ring-white"></div>
            <div class="flex justify-between items-start">
              <h4 class="text-[11px] font-bold text-slate-900 uppercase">Versión 2 <span class="bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded text-[8px] ml-1">Actual</span></h4>
              <span class="text-[9px] text-slate-400 font-bold uppercase">Hoy, 14:30</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-2">Monto ajustado: +{{ formatCurrency(selectedQuote.total * 0.1) }}</p>
            <p class="text-[11px] text-slate-500 italic">"Se agregó soporte extendido solicitado por cliente."</p>
          </div>
          <div class="relative pl-6">
            <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></div>
            <div class="flex justify-between items-start">
              <h4 class="text-[11px] font-bold text-slate-400 uppercase">Versión 1</h4>
              <span class="text-[9px] text-slate-400 font-bold uppercase">Oct 10, 09:15</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-2">Creación inicial: {{ formatCurrency(selectedQuote.total) }}</p>
          </div>
        </div>
        <button class="w-full mt-6 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
          Ver Comparación Detallada
        </button>
      </div>
      <div v-else class="hidden xl:flex w-80 shrink-0 border border-dashed border-slate-200 rounded-xl items-center justify-center p-6 text-center">
        <p class="text-xs text-slate-400 font-medium">Selecciona una cotización para ver su historial de versiones y auditoría.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
