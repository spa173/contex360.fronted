<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useDashboardStats } from '../../composables/useDashboardStats'

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const auth = useAuthStore()
const billing = useBillingStore()
const { formatCompact } = useDashboardStats()

const totalRevenue = computed(() => (billing.tenantInvoices || []).reduce((sum, inv) => sum + (inv?.total || 0), 0))
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in duration-300">
    <!-- Dashboard Header -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold text-slate-900 mb-1">Dashboard</h2>
        <p class="text-sm text-slate-500">Overview financiero y alertas operativas al {{ new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) }}</p>
      </div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
          Este Mes
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-xs font-semibold shadow-sm shadow-cyan-200">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar Reporte
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="kpi-card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos (MTD)</p>
            <h3 class="text-2xl font-bold text-slate-900 mt-1">{{ formatCompact(totalRevenue) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
            <span class="material-symbols-outlined">trending_up</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-emerald-600 text-xs font-bold flex items-center"><span class="material-symbols-outlined text-[14px]">arrow_upward</span> 12.5%</span>
          <span class="text-[10px] text-slate-500">vs mes anterior</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Egresos (MTD)</p>
            <h3 class="text-2xl font-bold text-slate-900 mt-1">$0.0</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <span class="material-symbols-outlined">trending_down</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-rose-600 text-xs font-bold flex items-center"><span class="material-symbols-outlined text-[14px]">arrow_upward</span> 4.2%</span>
          <span class="text-[10px] text-slate-500">vs mes anterior</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facturas Pendientes</p>
            <h3 class="text-2xl font-bold text-slate-900 mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <span class="material-symbols-outlined">receipt_long</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-amber-600 text-xs font-bold">0 Vencidas</span>
          <span class="text-[10px] text-slate-500">requieren atención</span>
        </div>
      </div>

      <div class="kpi-card border-l-4 border-l-violet-500">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-[10px] font-bold text-violet-600 uppercase tracking-wider flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">auto_awesome</span> Tareas de IA
            </p>
            <h3 class="text-2xl font-bold text-slate-900 mt-1">0</h3>
          </div>
          <div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm shadow-violet-100">
            <span class="material-symbols-outlined">document_scanner</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700">OCR completado</span>
          <span class="text-[10px] text-slate-500">listas para revisión</span>
        </div>
      </div>
    </div>

    <!-- Charts & Alerts Row -->
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[400px]">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Flujo de Caja Proyectado</h3>
            <p class="text-xs text-slate-500">Histórico vs Predicción (15 días)</p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span class="text-[10px] font-bold text-slate-500 uppercase">Real</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full border-2 border-dashed border-violet-500"></div>
              <span class="text-[10px] font-bold text-slate-500 uppercase">Proyección IA</span>
            </div>
          </div>
        </div>
        <div class="flex-1 relative chart-area border-l border-b border-slate-100">
          <svg class="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,240 Q150,200 300,220 T600,150" fill="none" stroke="#06B6D4" stroke-width="3" />
            <path d="M600,150 Q750,100 900,120 T1000,50" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-dasharray="8,5" />
          </svg>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
        <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-violet-500">lightbulb</span>
            <h3 class="text-lg font-bold text-slate-900">Alertas de IA</h3>
          </div>
          <span class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">0 URGENTES</span>
        </div>
        <div class="p-6 flex-1 flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-slate-300 text-3xl">task_alt</span>
          </div>
          <p class="text-sm font-bold text-slate-900">Todo en orden</p>
          <p class="text-xs text-slate-500 mt-1">No hay discrepancias detectadas por la IA en este momento.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kpi-card {
  background-color: white;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.kpi-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.chart-area {
  background-size: 40px 40px;
  background-image: linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                    linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
}
</style>
