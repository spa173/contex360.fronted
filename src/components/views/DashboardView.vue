<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { useTranslationStore } from '../../stores/translationStore'

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const auth = useAuthStore()
const billing = useBillingStore()
const { formatCompact } = useDashboardStats()
const translationStore = useTranslationStore()

const totalRevenue = computed(() => (billing.tenantInvoices || []).reduce((sum, inv) => sum + (inv?.total || 0), 0))
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in duration-500 max-w-[1440px] mx-auto w-full p-8">
    <!-- Dashboard Header -->
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-bold text-[#1E293B] mb-1">{{ translationStore.t('Dashboard', 'Dashboard') }}</h2>
        <p class="text-sm font-medium text-[#64748B]">{{ translationStore.t('Financial overview and operational insights', 'Overview financiero y alertas operativas') }}</p>
      </div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-lg text-[#1E293B] hover:bg-[#F8F9FF] transition-colors text-xs font-semibold">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
          Este Mes
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white rounded-lg hover:bg-[#0891B2] transition-colors text-xs font-semibold shadow-md">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar Reporte
        </button>
      </div>
    </div>

    <!-- Bento Grid Layout -->
    <div class="grid grid-cols-12 gap-6">
      <!-- KPI Cards Row -->
      <div class="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Revenue Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Ingresos (MTD)</p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">{{ formatCompact(totalRevenue) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
              <span class="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span> 12.5%
            </span>
            <span class="text-[11px] font-medium text-[#64748B]">vs mes anterior</span>
          </div>
        </div>

        <!-- Expenditures Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Egresos (MTD)</p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">$842,300</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#F43F5E]/10 flex items-center justify-center text-[#F43F5E]">
              <span class="material-symbols-outlined">trending_down</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[#F43F5E] text-xs font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span> 4.2%
            </span>
            <span class="text-[11px] font-medium text-[#64748B]">vs mes anterior</span>
          </div>
        </div>

        <!-- Invoices Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Facturas Pendientes</p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">42</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[#F59E0B] text-xs font-bold">15 Vencidas</span>
            <span class="text-[11px] font-medium text-[#64748B]">requieren atención</span>
          </div>
        </div>

        <!-- AI Tasks Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#8455ef]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#8455ef] uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">auto_awesome</span> Tareas de IA
              </p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">8</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#8455ef]/10 flex items-center justify-center text-[#8455ef] shadow-inner">
              <span class="material-symbols-outlined">document_scanner</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-[#1E293B]">OCR completado</span>
            <span class="text-[11px] font-medium text-[#64748B]">listas para revisión</span>
          </div>
        </div>
      </div>

      <!-- Main Chart: Projected Cash Flow -->
      <div class="col-span-12 lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 flex flex-col h-[400px]">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-lg font-bold text-[#1E293B]">Flujo de Caja Proyectado</h3>
            <p class="text-xs font-medium text-[#64748B]">Histórico vs Predicción (15 días)</p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[#06B6D4]"></div>
              <span class="text-[10px] font-bold text-[#64748B] uppercase">Real</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full border-2 border-dashed border-[#8B5CF6]"></div>
              <span class="text-[10px] font-bold text-[#8B5CF6] uppercase">Proyección IA</span>
            </div>
          </div>
        </div>
        <div class="flex-1 relative chart-grid border-l border-b border-[#E2E8F0]">
          <!-- Simulated Area Chart -->
          <div class="absolute inset-0 flex items-end opacity-10">
            <div class="w-3/5 h-1/2 bg-gradient-to-t from-[#06B6D4] to-transparent" style="clip-path: polygon(0 100%, 10% 80%, 30% 85%, 50% 60%, 70% 70%, 90% 40%, 100% 50%, 100% 100%);"></div>
            <div class="w-2/5 h-2/3 bg-gradient-to-t from-[#8B5CF6] to-transparent border-t-2 border-dashed border-[#8B5CF6] opacity-50" style="clip-path: polygon(0 50%, 20% 30%, 50% 40%, 80% 20%, 100% 10%, 100% 100%, 0 100%);"></div>
          </div>
          <svg class="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,80 L10,60 L30,65 L50,40 L60,50" fill="none" stroke="#06B6D4" stroke-width="2" vector-effect="non-scaling-stroke" />
            <path d="M60,50 L70,30 L85,40 L100,20" fill="none" stroke="#8B5CF6" stroke-dasharray="4,4" stroke-width="2" vector-effect="non-scaling-stroke" />
          </svg>
          <!-- Current Date Marker -->
          <div class="absolute top-0 bottom-0 left-[60%] border-l border-dashed border-[#E2E8F0] z-0"></div>
          <div class="absolute -bottom-8 left-0 right-0 flex justify-between text-[10px] font-bold text-[#64748B] px-2 font-mono">
            <span>Oct 01</span>
            <span>Oct 10</span>
            <span class="text-[#1E293B]">Hoy</span>
            <span>Nov 01</span>
            <span>Nov 08</span>
          </div>
        </div>
      </div>

      <!-- IA Alerts Panel -->
      <div class="col-span-12 lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col h-[400px]">
        <div class="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8F9FF] rounded-t-xl">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#8455ef]">lightbulb</span>
            <h3 class="text-base font-bold text-[#1E293B]">Alertas de IA</h3>
          </div>
          <span class="bg-[#F43F5E]/10 text-[#F43F5E] px-2 py-0.5 rounded text-[10px] font-bold uppercase">3 Urgentes</span>
        </div>
        <div class="p-2 flex-1 overflow-y-auto">
          <div class="p-3 border-b border-[#E2E8F0] hover:bg-[#F8F9FF] transition-colors cursor-pointer group">
            <div class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-[#F43F5E] mt-1.5 flex-shrink-0"></div>
              <div>
                <h4 class="text-xs font-bold text-[#1E293B] group-hover:text-[#8455ef] transition-colors">Inconsistencia en Factura F-203</h4>
                <p class="text-[11px] font-medium text-[#64748B] mt-1">Monto OCR ($4,500) difiere de orden de compra ($4,050).</p>
                <button class="text-[10px] text-[#8455ef] font-bold hover:underline mt-2">Revisar Ahora</button>
              </div>
            </div>
          </div>
          <div class="p-3 border-b border-[#E2E8F0] hover:bg-[#F8F9FF] transition-colors cursor-pointer group">
            <div class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0"></div>
              <div>
                <h4 class="text-xs font-bold text-[#1E293B] group-hover:text-[#8455ef] transition-colors">Déficit de caja proyectado</h4>
                <p class="text-[11px] font-medium text-[#64748B] mt-1">Se prevé brecha de liquidez para el 5 de Noviembre por pago a 'TechCorp'.</p>
              </div>
            </div>
          </div>
          <div class="p-3 hover:bg-[#F8F9FF] transition-colors cursor-pointer group">
            <div class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-[#06B6D4] mt-1.5 flex-shrink-0"></div>
              <div>
                <h4 class="text-xs font-bold text-[#1E293B] group-hover:text-[#8455ef] transition-colors">5 Documentos Clasificados</h4>
                <p class="text-[11px] font-medium text-[#64748B] mt-1">El motor OCR ha categorizado 5 gastos operativos nuevos.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-[#E2E8F0] text-center">
          <button class="text-xs font-bold text-[#8455ef] hover:text-[#7c3aed] transition-colors">Ver todas las alertas</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chart-grid {
  background-size: 40px 40px;
  background-image: linear-gradient(to right, #E2E8F0 1px, transparent 1px),
                    linear-gradient(to bottom, #E2E8F0 1px, transparent 1px);
}
</style>
