<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { useTranslationStore } from '../../stores/translationStore'
import { businessApi } from '../../services/businessApi'

const props = defineProps({ isActive: { type: Boolean, required: true } })

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
      aiInsight: insights.insight || 'No hay insights disponibles.',
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
  <section v-if="isActive" class="animate-in fade-in duration-500">
    <!-- Page header -->
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#A1A1AA]">Visión general</span>
          <span class="text-[#A1A1AA]">·</span>
          <span class="text-[11px] font-medium text-[#71717A]">Hoy</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Buenos días, {{ auth.currentUser?.name?.split(' ')[0] || 'Bienvenido' }}
        </h1>
        <p class="text-[14px] text-[#71717A]">Aquí están los movimientos importantes de las últimas 24 horas.</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors">
          <span class="material-symbols-outlined text-[18px]">calendar_today</span>
          Este mes
          <span class="material-symbols-outlined text-[16px] text-[#A1A1AA]">expand_more</span>
        </button>
        <button class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold transition-colors">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>
      </div>
    </div>

    <!-- AI Insight -->
    <div class="mb-6 bg-white border border-[#E4E4E7] rounded-[14px] p-4 flex items-start gap-3">
      <div class="w-9 h-9 rounded-[10px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0">
        <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
      </div>
      <div class="flex-1">
        <p class="text-[12px] font-semibold text-[#2563EB] uppercase tracking-wider mb-0.5">Insight de IA</p>
        <p class="text-[14px] text-[#18181B] leading-[1.5] font-medium">{{ dashboardData.aiInsight }}</p>
      </div>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="flex items-start justify-between mb-5">
          <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
            <span class="material-symbols-outlined text-[12px]">arrow_upward</span>15%
          </span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Ventas del día</p>
        <p class="text-[24px] font-bold text-[#18181B] tracking-[-0.02em] mb-1">{{ formatCompact(dashboardData.totalSales) }}</p>
        <p class="text-[12px] text-[#71717A]">vs ayer</p>
      </div>

      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="flex items-start justify-between mb-5">
          <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <span class="inline-flex px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold">15 vencidas</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Facturas pendientes</p>
        <p class="text-[24px] font-bold text-[#18181B] tracking-[-0.02em] mb-1">{{ dashboardData.pendingInvoices || 42 }}</p>
        <p class="text-[12px] text-[#71717A]">requieren atención</p>
      </div>

      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="flex items-start justify-between mb-5">
          <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
          <span v-if="dashboardData.lowStockAlerts > 0" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{{ dashboardData.lowStockAlerts }}
          </span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Stock bajo</p>
        <p class="text-[24px] font-bold text-[#18181B] tracking-[-0.02em] mb-1">{{ dashboardData.lowStockAlerts }} SKUs</p>
        <p class="text-[12px] text-[#71717A]">requieren reabastecer</p>
      </div>

      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="flex items-start justify-between mb-5">
          <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[20px]">document_scanner</span>
          </div>
          <span class="inline-flex px-1.5 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[11px] font-semibold">OCR listo</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Tareas de IA</p>
        <p class="text-[24px] font-bold text-[#18181B] tracking-[-0.02em] mb-1">8</p>
        <p class="text-[12px] text-[#71717A]">listas para revisar</p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <button class="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[14px] hover:border-[#18181B] hover:shadow-[0_8px_24px_-12px_rgba(10,10,10,0.12)] transition-all text-left group">
        <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white transition-all">
          <span class="material-symbols-outlined">add_shopping_cart</span>
        </div>
        <div>
          <p class="text-[13px] font-semibold text-[#18181B]">Nueva venta</p>
          <p class="text-[11px] text-[#71717A]">Generar factura</p>
        </div>
      </button>
      <button class="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[14px] hover:border-[#18181B] hover:shadow-[0_8px_24px_-12px_rgba(10,10,10,0.12)] transition-all text-left group">
        <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white transition-all">
          <span class="material-symbols-outlined">inventory</span>
        </div>
        <div>
          <p class="text-[13px] font-semibold text-[#18181B]">Entrada almacén</p>
          <p class="text-[11px] text-[#71717A]">Registrar ingreso</p>
        </div>
      </button>
      <button class="flex items-center gap-3 p-4 bg-white border border-[#E4E4E7] rounded-[14px] hover:border-[#18181B] hover:shadow-[0_8px_24px_-12px_rgba(10,10,10,0.12)] transition-all text-left group">
        <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] group-hover:bg-[#2563EB] group-hover:text-white transition-all">
          <span class="material-symbols-outlined">auto_awesome</span>
        </div>
        <div>
          <p class="text-[13px] font-semibold text-[#18181B]">Procesar OCR</p>
          <p class="text-[11px] text-[#71717A]">Subir PDFs</p>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
