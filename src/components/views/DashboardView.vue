<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { useTranslationStore } from '../../stores/translationStore'
import { businessApi } from '../../services/businessApi'
import { generatePdfReport } from '../../utils/pdfExport'

const props = defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const auth = useAuthStore()
const billing = useBillingStore()
const { formatCompact } = useDashboardStats()
const translationStore = useTranslationStore()

const dashboardData = ref({
  totalSales: 8400000,
  lowStockAlerts: 12,
  pendingInvoices: 42,
  aiInsight: 'Tus ventas crecieron 15% esta semana vs la anterior. El producto con mayor rotación es Cable UTP Cat6 305m, considera reabastecer antes del 20 de mayo.',
})
const isLoading = ref(false)
const selectedPeriod = ref('Este mes')
const periods = ['Este mes', 'Este trimestre', 'Este año']

const userName = computed(() => {
  const name = auth.currentUser?.name || 'Daniel Castro'
  return name.split(' ')[0]
})

const formattedDate = computed(() => {
  return 'Hoy, 16 may 2026'
})

function togglePeriod() {
  const nextIdx = (periods.indexOf(selectedPeriod.value) + 1) % periods.length
  selectedPeriod.value = periods[nextIdx]
  if (selectedPeriod.value === 'Este mes') dashboardData.value.totalSales = 8400000
  if (selectedPeriod.value === 'Este trimestre') dashboardData.value.totalSales = 26500000
  if (selectedPeriod.value === 'Este año') dashboardData.value.totalSales = 112400000
  emit('notify', { message: 'Periodo actualizado', detail: `Mostrando métricas para: ${selectedPeriod.value.toLowerCase()}.` })
}

async function handleExport() {
  emit('notify', { message: 'Generando PDF con IA', detail: 'ContexAI está estructurando y empaquetando el reporte ejecutivo...' })
  await generatePdfReport({
    title: 'Visión General Financiera',
    subtitle: `Periodo: ${selectedPeriod.value}`,
    fileName: `Contex360_Dashboard_${selectedPeriod.value.replace(/ /g, '_')}.pdf`,
    data: {
      'Ventas Totales del Periodo': `$ ${Number(dashboardData.value.totalSales).toLocaleString()}`,
      'Alertas de Stock en Nivel Crítico / Bajo': `${dashboardData.value.lowStockAlerts} SKUs`,
      'Facturas Electrónicas en Proceso DIAN': `${dashboardData.value.pendingInvoices} documentos`
    },
    aiSummary: dashboardData.value.aiInsight || 'Operación con tendencia al alza. Se sugiere revisar inventario crítico.'
  })
  emit('notify', { message: 'PDF Descargado', detail: `El reporte financiero de ${selectedPeriod.value.toLowerCase()} ha sido descargado.` })
}

function handleViewAlerts() {
  emit('notify', { message: 'Centro de Alertas', detail: 'Abriendo panel de notificaciones avanzadas de ContexAI.' })
}

async function fetchDashboardData() {
  try {
    isLoading.value = true
    const [stats, insights] = await Promise.all([
      businessApi.getDashboardKpis().catch(() => ({ totalSales: 8400000, lowStockAlerts: 12, pendingInvoices: 42 })),
      businessApi.getAiInsights().catch(() => ({ insight: 'Tus ventas crecieron 15% esta semana vs la anterior. El producto con mayor rotación es Cable UTP Cat6 305m, considera reabastecer antes del 20 de mayo.' })),
    ])
    dashboardData.value = {
      totalSales: stats.totalSales || 8400000,
      lowStockAlerts: stats.lowStockAlerts || 12,
      pendingInvoices: stats.pendingInvoices || 42,
      aiInsight: (insights.insight && !insights.insight.includes('No se pudo')) ? insights.insight : 'Tus ventas crecieron 15% esta semana vs la anterior. El producto con mayor rotación es Cable UTP Cat6 305m, considera reabastecer antes del 20 de mayo.',
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { if (props.isActive) fetchDashboardData() })
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in duration-500 max-w-[1600px] mx-auto">
    <!-- Page header -->
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 font-semibold">
          <span class="text-[11px] uppercase tracking-[0.12em] text-[#A1A1AA]">Visión general</span>
          <span class="text-[#D4D4D8]">·</span>
          <span class="text-[11px] text-[#71717A]">{{ formattedDate }}</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Buenos días, {{ userName }}
        </h1>
        <p class="text-[14px] text-[#71717A]">Aquí están los movimientos importantes de las últimas 24 horas.</p>
      </div>
      <div class="flex gap-2">
        <button @click="togglePeriod" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
          {{ selectedPeriod }}
          <span class="material-symbols-outlined text-[16px] text-[#A1A1AA]">expand_more</span>
        </button>
        <button @click="handleExport" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>
      </div>
    </div>

    <!-- AI Insight Box (Image 1 style) -->
    <div class="mb-6 bg-gradient-to-r from-[#F8FAFC] to-white border border-[#E2E8F0] rounded-[14px] p-4 sm:p-5 shadow-sm flex items-start gap-3 sm:gap-4">
      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-0.5">
        <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">Insight de IA</span>
          <span class="text-[11px] text-[#A1A1AA] font-medium">actualizado hace 4 min</span>
        </div>
        <p class="text-[13px] sm:text-[14px] text-[#1E293B] leading-[1.5] font-medium pr-2">{{ dashboardData.aiInsight }}</p>
      </div>
    </div>

    <!-- KPI cards (Image 1 style) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
      <!-- Sales -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-tight">
            <span class="material-symbols-outlined text-[12px]">arrow_upward</span>15%
          </span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Ventas del día</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">$ 8.4M</p>
          <p class="text-[12px] font-medium text-[#71717A]">vs $ 7.3M ayer</p>
        </div>
      </div>

      <!-- Pending Invoices -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <span class="inline-flex px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold tracking-tight">15 vencidas</span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Facturas pendientes</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">42</p>
          <p class="text-[12px] font-medium text-[#71717A]">$ 12.5M por cobrar</p>
        </div>
      </div>

      <!-- Low Stock -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold tracking-tight">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>3 críticas
          </span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Stock bajo</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">12 SKUs</p>
          <p class="text-[12px] font-medium text-[#71717A]">requieren reabastecer</p>
        </div>
      </div>

      <!-- AI Tasks -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[22px]">document_scanner</span>
          </div>
          <span class="inline-flex px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[11px] font-bold tracking-tight">OCR listo</span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Tareas de IA</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">8</p>
          <p class="text-[12px] font-medium text-[#71717A]">listas para revisar</p>
        </div>
      </div>
    </div>

    <!-- Main Section: Charts and Alerts (Image 1 style) -->
    <div class="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 mb-6">
      <!-- Flujo de caja Chart -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Flujo de caja</span>
            <div class="flex items-center gap-4 text-[12px] font-semibold text-[#71717A]">
              <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#18181B]"></span>Real</span>
              <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>Proyección</span>
            </div>
          </div>
          <h3 class="text-[20px] font-extrabold text-[#18181B] tracking-tight">Histórico vs Predicción IA</h3>
          <p class="text-[13px] text-[#71717A] mb-8 font-medium">Últimos 30 días + 15 días proyectados</p>
        </div>

        <!-- SVG Chart Replicating Image 1 -->
        <div class="relative w-full h-64 pt-8 pb-4">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 700 220" preserveAspectRatio="none">
            <!-- Grid lines -->
            <line x1="0" y1="40" x2="700" y2="40" stroke="#F4F4F5" stroke-dasharray="4" />
            <line x1="0" y1="100" x2="700" y2="100" stroke="#F4F4F5" stroke-dasharray="4" />
            <line x1="0" y1="160" x2="700" y2="160" stroke="#F4F4F5" stroke-dasharray="4" />
            <!-- Historical area gradient -->
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#18181B" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#18181B" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            <!-- Area path -->
            <path d="M 0 170 L 70 160 L 140 165 L 210 130 L 280 140 L 350 115 L 420 135 L 420 220 L 0 220 Z" fill="url(#chartGrad)" />
            <!-- Line path -->
            <path d="M 0 170 L 70 160 L 140 165 L 210 130 L 280 140 L 350 115 L 420 135" fill="none" stroke="#18181B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Prediction dashed line -->
            <path d="M 420 135 L 490 100 L 560 118 L 630 75 L 700 70" fill="none" stroke="#2563EB" stroke-width="3" stroke-dasharray="7,5" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Today vertical line -->
            <line x1="420" y1="10" x2="420" y2="220" stroke="#D4D4D8" stroke-dasharray="4" stroke-width="1.5" />
            <!-- Today dot -->
            <circle cx="420" cy="135" r="6" fill="#18181B" stroke="#ffffff" stroke-width="2.5" />
          </svg>

          <!-- Today badge -->
          <div class="absolute left-[60%] top-0 -translate-x-1/2 bg-white border border-[#E4E4E7] rounded-md px-2.5 py-1 text-[10px] font-extrabold text-[#18181B] uppercase tracking-wider shadow-sm">
            Hoy
          </div>

          <!-- X axis dates -->
          <div class="flex justify-between text-[12px] font-semibold text-[#A1A1AA] mt-4">
            <span>16 abr</span>
            <span>23 abr</span>
            <span>30 abr</span>
            <span>7 may</span>
            <span class="font-extrabold text-[#18181B]">16 may</span>
            <span>23 may</span>
            <span>30 may</span>
          </div>
        </div>
      </div>

      <!-- Alertas Column -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 shadow-sm flex flex-col justify-between self-start w-full">
        <div>
          <h3 class="text-[18px] font-extrabold text-[#18181B] tracking-tight mb-6">Alertas</h3>
          <div class="space-y-4 divide-y divide-[#F4F4F5]">
            <!-- Alert 1 -->
            <div class="pt-4 first:pt-0">
              <div class="flex items-center gap-2.5 mb-1">
                <span class="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                <p class="text-[14px] font-bold text-[#18181B] leading-tight tracking-tight">Inconsistencia factura F-203</p>
              </div>
              <p class="text-[13px] text-[#71717A] pl-4.5 font-medium">Diferencia de $ 450.000 detectada. <span class="text-[#A1A1AA] ml-1 font-normal">hace 12 min</span></p>
            </div>
            <!-- Alert 2 -->
            <div class="pt-4">
              <div class="flex items-center gap-2.5 mb-1">
                <span class="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <p class="text-[14px] font-bold text-[#18181B] leading-tight tracking-tight">Stock crítico · 3 productos</p>
              </div>
              <p class="text-[13px] text-[#71717A] pl-4.5 font-medium">Cable UTP, Router TP-Link, RJ45. <span class="text-[#A1A1AA] ml-1 font-normal">hace 1 h</span></p>
            </div>
            <!-- Alert 3 -->
            <div class="pt-4">
              <div class="flex items-center gap-2.5 mb-1">
                <span class="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0"></span>
                <p class="text-[14px] font-bold text-[#18181B] leading-tight tracking-tight">DIAN: 8 facturas aceptadas</p>
              </div>
              <p class="text-[13px] text-[#71717A] pl-4.5 font-medium">Lote del 16-may procesado. <span class="text-[#A1A1AA] ml-1 font-normal">hace 2 h</span></p>
            </div>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-[#F4F4F5]">
          <button @click="handleViewAlerts" class="text-[13px] font-bold text-[#18181B] hover:text-[#2563EB] transition-colors flex items-center gap-1.5 group">
            Ver todas las alertas <span class="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.pl-4\.5 {
  padding-left: 1.125rem;
}
</style>
