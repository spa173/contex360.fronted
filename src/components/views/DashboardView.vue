<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { useTranslationStore } from '../../stores/translationStore'
import { businessApi } from '../../services/businessApi'

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

const dashboardData = ref({
  totalSales: 0,
  lowStockAlerts: 0,
  pendingInvoices: 0,
  aiInsight: 'Analizando datos en tiempo real...',
})

const isLoading = ref(true)

async function fetchDashboardData() {
  try {
    isLoading.value = true
    const [stats, insights] = await Promise.all([
      businessApi.getDashboardKpis(),
      businessApi.getAiInsights().catch(() => ({ insight: 'No se pudo cargar el insight de IA.' })),
    ])
    
    dashboardData.value = {
      totalSales: stats.totalSales || 0,
      lowStockAlerts: stats.lowStockAlerts || 0,
      pendingInvoices: stats.pendingInvoices || 0,
      aiInsight: insights.insight || 'No hay insights disponibles en este momento.',
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (props.isActive) {
    fetchDashboardData()
  }
})

const totalRevenue = computed(() => dashboardData.value.totalSales)
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

    <!-- AI Insight Banner -->
    <div class="mb-8 bg-gradient-to-r from-[#8455ef]/10 to-[#06B6D4]/10 border border-[#8455ef]/20 rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-top duration-700">
      <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#8455ef]">
        <span class="material-symbols-outlined">psychology</span>
      </div>
      <p class="text-sm font-semibold text-[#1E293B]">
        <span class="text-[#8455ef]">IA Insight:</span> 
        {{ dashboardData.aiInsight }}
      </p>
    </div>

    <!-- Bento Grid Layout -->
    <div class="grid grid-cols-12 gap-6">
      <!-- KPI Cards Row -->
      <div class="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Sales Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Ventas del Día</p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">{{ formatCompact(dashboardData.totalSales) }}</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4] group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span> 15%
            </span>
            <span class="text-[11px] font-medium text-[#64748B]">vs ayer</span>
          </div>
        </div>

        <!-- Inventory Alert Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group border-t-4 border-t-[#F43F5E]">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#F43F5E] uppercase tracking-wider">Estado Inventario</p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">{{ dashboardData.lowStockAlerts > 0 ? 'Crítico' : 'Óptimo' }}</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#F43F5E]/10 flex items-center justify-center text-[#F43F5E] group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span :class="dashboardData.lowStockAlerts > 0 ? 'text-[#F43F5E]' : 'text-emerald-600'" class="text-xs font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">{{ dashboardData.lowStockAlerts > 0 ? 'warning' : 'check_circle' }}</span> {{ dashboardData.lowStockAlerts }} productos
            </span>
            <span class="text-[11px] font-medium text-[#64748B]">bajo stock</span>
          </div>
        </div>

        <!-- Invoices Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Facturación Pendiente</p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">42</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[#F59E0B] text-xs font-bold">15 Vencidas</span>
            <span class="text-[11px] font-medium text-[#64748B]">requieren atención</span>
          </div>
        </div>

        <!-- AI Tasks Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-[#8455ef] group">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[11px] font-bold text-[#8455ef] uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">auto_awesome</span> Tareas de IA
              </p>
              <h3 class="text-2xl font-bold text-[#1E293B] mt-1">8</h3>
            </div>
            <div class="w-10 h-10 rounded-lg bg-[#8455ef]/10 flex items-center justify-center text-[#8455ef] shadow-inner group-hover:scale-110 transition-transform">
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
      <div class="col-span-12 lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 flex flex-col h-[450px]">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-lg font-bold text-[#1E293B]">Flujo de Caja Proyectado</h3>
            <p class="text-xs font-medium text-[#64748B]">Histórico vs Predicción (15 días)</p>
            <div class="mt-4 p-3 bg-[#F8F9FF] border-l-4 border-l-[#8455ef] rounded-r-lg">
              <p class="text-xs text-[#1E293B] leading-relaxed">
                <span class="font-bold text-[#8455ef]">Predicción Logística:</span> Según la tendencia de mayo, la IA estima que necesitarás reabastecer el inventario en <span class="font-bold">4 días</span> para evitar quiebre de stock.
              </p>
            </div>
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
      <div class="col-span-12 lg:col-span-4 grid grid-rows-2 gap-6 h-[450px]">
        <!-- Alerts -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div class="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8F9FF]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#8455ef] text-[18px]">lightbulb</span>
              <h3 class="text-xs font-bold text-[#1E293B]">Alertas de IA</h3>
            </div>
            <span class="bg-[#F43F5E]/10 text-[#F43F5E] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">3 Urgentes</span>
          </div>
          <div class="flex-1 overflow-y-auto p-2">
            <div class="p-2 border-b border-[#F1F5F9] hover:bg-[#F8F9FF] transition-colors cursor-pointer group">
              <h4 class="text-[11px] font-bold text-[#1E293B] group-hover:text-[#8455ef]">Inconsistencia F-203</h4>
              <p class="text-[10px] text-[#64748B] mt-0.5">Diferencia de $450 detectada.</p>
            </div>
            <div class="p-2 hover:bg-[#F8F9FF] transition-colors cursor-pointer group">
              <h4 class="text-[11px] font-bold text-[#1E293B] group-hover:text-[#8455ef]">Stock Crítico</h4>
              <p class="text-[10px] text-[#64748B] mt-0.5">Insumo X bajo nivel mínimo.</p>
            </div>
          </div>
        </div>

        <!-- Logistics Map Placeholder -->
        <div class="bg-white border border-[#E2E8F0] rounded-xl shadow-sm flex flex-col overflow-hidden relative">
          <div class="p-4 border-b border-[#E2E8F0] bg-[#F8F9FF]">
            <h3 class="text-xs font-bold text-[#1E293B] flex items-center gap-2">
              <span class="material-symbols-outlined text-[#06B6D4] text-[18px]">map</span>
              Mapa Logístico
            </h3>
          </div>
          <div class="flex-1 bg-[#F1F5F9] relative overflow-hidden">
            <!-- Simulated Map -->
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div class="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-[#06B6D4] shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse"></div>
            <div class="absolute top-1/2 left-2/3 w-3 h-3 rounded-full bg-[#8455ef] shadow-[0_0_10px_rgba(132,85,239,0.5)]"></div>
            <div class="absolute bottom-1/4 left-1/2 w-3 h-3 rounded-full bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse"></div>
            <div class="absolute bottom-4 left-4 text-[9px] font-bold text-[#64748B] bg-white/80 backdrop-blur px-2 py-1 rounded">
              3 Envíos Activos
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Audit Feed Row -->
    <div class="grid grid-cols-12 gap-6 mt-6">
      <!-- Quick Actions Bento Grid -->
      <div class="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button class="flex flex-col items-center justify-center p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:border-[#8455ef]/50 hover:bg-[#F8F9FF] transition-all group">
          <div class="w-12 h-12 rounded-full bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4] mb-3 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined">add_shopping_cart</span>
          </div>
          <span class="text-xs font-bold text-[#1E293B]">Nueva Venta</span>
        </button>
        <button class="flex flex-col items-center justify-center p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:border-[#8455ef]/50 hover:bg-[#F8F9FF] transition-all group">
          <div class="w-12 h-12 rounded-full bg-[#8455ef]/10 flex items-center justify-center text-[#8455ef] mb-3 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined">inventory</span>
          </div>
          <span class="text-xs font-bold text-[#1E293B]">Entrada Almacén</span>
        </button>
        <button class="flex flex-col items-center justify-center p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:border-[#8455ef]/50 hover:bg-[#F8F9FF] transition-all group">
          <div class="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] mb-3 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined">support_agent</span>
          </div>
          <span class="text-xs font-bold text-[#1E293B]">Soporte IA</span>
        </button>

        <!-- Drag & Drop Zone -->
        <div class="col-span-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center justify-center bg-[#F8F9FF]/50 hover:bg-[#F8F9FF] hover:border-[#8455ef]/30 transition-all cursor-pointer group">
          <div class="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm text-[#64748B] group-hover:text-[#8455ef] transition-colors mb-4">
            <span class="material-symbols-outlined text-[32px]">upload_file</span>
          </div>
          <h4 class="text-sm font-bold text-[#1E293B]">Arrastra archivos para procesar</h4>
          <p class="text-[11px] text-[#64748B] mt-1">Sube PDFs de facturas o Excels de inventario (Procesado por IA)</p>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="col-span-12 lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-5">
        <h3 class="text-sm font-bold text-[#1E293B] mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">history</span>
          Feed de Actividad
        </h3>
        <div class="space-y-4">
          <div class="flex gap-3 pb-3 border-b border-[#F1F5F9]">
            <div class="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[10px] font-bold text-[#64748B]">C</div>
            <div>
              <p class="text-[11px] text-[#1E293B] font-medium"><span class="font-bold">Camilo</span> generó factura #001</p>
              <p class="text-[9px] text-[#64748B]">Hace 5 minutos</p>
            </div>
          </div>
          <div class="flex gap-3 pb-3 border-b border-[#F1F5F9]">
            <div class="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[10px] font-bold text-[#64748B]">S</div>
            <div>
              <p class="text-[11px] text-[#1E293B] font-medium"><span class="font-bold">Sistema</span> Sincronización exitosa</p>
              <p class="text-[9px] text-[#64748B]">Hace 12 minutos</p>
            </div>
          </div>
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[10px] font-bold text-[#64748B]">L</div>
            <div>
              <p class="text-[11px] text-[#1E293B] font-medium"><span class="font-bold">Landing</span> Nueva consulta recibida</p>
              <p class="text-[9px] text-[#64748B]">Hace 1 hora</p>
            </div>
          </div>
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
