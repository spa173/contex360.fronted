<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
  totalSales: 0,
  lowStockAlerts: 0,
  pendingInvoices: 0,
  ocrRunsCount: 0,
  aiInsight: '',
})
const isLoading = ref(false)
const selectedPeriod = ref('Este mes')
const presets = [
  { value: 'Este mes', label: 'Este mes' },
  { value: 'Este trimestre', label: 'Este trimestre' },
  { value: 'Este año', label: 'Este año' }
]

const isDropdownOpen = ref(false)
const customFromDate = ref('')
const customToDate = ref('')

const userName = computed(() => {
  const name = auth.currentUser?.name || 'Usuario'
  return name.split(' ')[0]
})

const formattedDate = computed(() => {
  return 'Hoy, 16 may 2026'
})

const displayPeriod = computed(() => {
  if (selectedPeriod.value !== 'custom') {
    return selectedPeriod.value
  }
  if (!customFromDate.value || !customToDate.value) {
    return 'Rango personalizado'
  }
  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${d.getDate()} ${months[d.getMonth()]}`
  }
  return `${formatDateLabel(customFromDate.value)} - ${formatDateLabel(customToDate.value)}`
})

function toggleDropdown(e) {
  e.stopPropagation()
  isDropdownOpen.value = !isDropdownOpen.value
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function selectPreset(p) {
  selectedPeriod.value = p.value
  if (p.value !== 'custom') {
    isDropdownOpen.value = false
    fetchDashboardData()
    emit('notify', { message: 'Periodo actualizado', detail: `Mostrando métricas para: ${p.label.toLowerCase()}.` })
  }
}

function applyCustomRange() {
  if (!customFromDate.value || !customToDate.value) {
    emit('notify', { message: 'Error', detail: 'Por favor selecciona ambas fechas.' })
    return
  }
  if (new Date(customFromDate.value) > new Date(customToDate.value)) {
    emit('notify', { message: 'Error', detail: 'La fecha de inicio no puede ser posterior a la fecha final.' })
    return
  }
  isDropdownOpen.value = false
  fetchDashboardData()
  emit('notify', { message: 'Periodo actualizado', detail: 'Mostrando métricas para el rango personalizado.' })
}

function formatDate(date) {
  const d = new Date(date)
  const month = '' + (d.getMonth() + 1)
  const day = '' + d.getDate()
  const year = d.getFullYear()
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
}

function getPresetDates(preset) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  if (preset === 'Este mes') {
    const from = new Date(year, month, 1)
    const to = now
    return { from: formatDate(from), to: formatDate(to) }
  } else if (preset === 'Este trimestre') {
    const quarterStartMonth = Math.floor(month / 3) * 3
    const from = new Date(year, quarterStartMonth, 1)
    const to = now
    return { from: formatDate(from), to: formatDate(to) }
  } else if (preset === 'Este año') {
    const from = new Date(year, 0, 1)
    const to = now
    return { from: formatDate(from), to: formatDate(to) }
  }
  return { from: '', to: '' }
}

async function handleExport() {
  emit('notify', { message: 'Generando PDF con IA', detail: 'ContexAI está estructurando y empaquetando el reporte ejecutivo...' })
  await generatePdfReport({
    title: 'Visión General Financiera',
    subtitle: `Periodo: ${displayPeriod.value}`,
    fileName: `Contex360_Dashboard_${displayPeriod.value.replace(/ /g, '_')}.pdf`,
    data: {
      'Ventas Totales del Periodo': `$ ${Number(dashboardData.value.totalSales).toLocaleString()}`,
      'Alertas de Stock en Nivel Crítico / Bajo': `${dashboardData.value.lowStockAlerts} SKUs`,
      'Facturas Electrónicas en Proceso DIAN': `${dashboardData.value.pendingInvoices} documentos`
    },
    aiSummary: dashboardData.value.aiInsight || 'Operación con tendencia al alza. Se sugiere revisar inventario crítico.'
  })
  emit('notify', { message: 'PDF Descargado', detail: `El reporte financiero de ${displayPeriod.value.toLowerCase()} ha sido descargado.` })
}

function handleViewAlerts() {
  window.dispatchEvent(new CustomEvent('open-alerts-modal'))
}

const alertsList = computed(() => {
  const list = []
  if (dashboardData.value.lowStockAlerts > 0) {
    list.push({
      id: 'low-stock',
      type: 'error',
      color: 'bg-rose-500',
      title: `Stock bajo · ${dashboardData.value.lowStockAlerts} productos`,
      description: 'Productos con stock por debajo del mínimo establecido.',
      time: 'Ahora mismo',
    })
  }
  if (dashboardData.value.pendingInvoices > 0) {
    list.push({
      id: 'pending-invoices',
      type: 'warning',
      color: 'bg-amber-500',
      title: `Facturación · ${dashboardData.value.pendingInvoices} pendientes`,
      description: 'Facturas emitidas pendientes de pago.',
      time: 'Ahora mismo',
    })
  }
  return list
})

const cashFlowData = ref({
  historical: [],
  projected: [],
})

const maxBalance = computed(() => {
  const allBalances = [
    ...cashFlowData.value.historical.map(p => p.balance),
    ...cashFlowData.value.projected.map(p => p.balance)
  ]
  const max = Math.max(...allBalances, 0)
  return max > 0 ? max : 1000000
})

const svgPaths = computed(() => {
  const hist = cashFlowData.value.historical
  const proj = cashFlowData.value.projected

  if (hist.length === 0) {
    return {
      area: 'M 0 170 L 420 170 L 420 220 L 0 220 Z',
      line: 'M 0 170 L 420 170',
      projection: 'M 420 170 L 700 170',
      todayY: 170,
    }
  }

  const maxVal = maxBalance.value

  const histPoints = hist.map((p, index) => {
    const x = (index / (hist.length - 1)) * 420
    const y = 200 - (p.balance / maxVal) * 160
    return { x, y }
  })

  const lastHistPoint = histPoints[histPoints.length - 1]

  const projPoints = proj.map((p, index) => {
    const x = 420 + ((index + 1) / proj.length) * 280
    const y = 200 - (p.balance / maxVal) * 160
    return { x, y }
  })

  const linePath = histPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L 420 220 L 0 220 Z`

  const projPath = `M ${lastHistPoint.x.toFixed(1)} ${lastHistPoint.y.toFixed(1)} ` +
    projPoints.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  return {
    area: areaPath,
    line: linePath,
    projection: projPath,
    todayY: lastHistPoint.y,
  }
})

const dateLabels = computed(() => {
  const hist = cashFlowData.value.historical
  const proj = cashFlowData.value.projected

  if (hist.length === 0) {
    return {
      start: 'Hace 30d',
      midPast: 'Hace 15d',
      today: 'Hoy',
      midFuture: 'En 7d',
      end: 'En 15d'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    return `${d.getDate()} ${months[d.getMonth()]}`
  }

  return {
    start: formatDate(hist[0]?.date),
    midPast: formatDate(hist[Math.floor(hist.length / 2)]?.date),
    today: formatDate(hist[hist.length - 1]?.date),
    midFuture: formatDate(proj[Math.floor(proj.length / 2)]?.date),
    end: formatDate(proj[proj.length - 1]?.date),
  }
})

const showOcrModal = ref(false)
const ocrRuns = ref([])
const isOcrLoading = ref(false)
const selectedOcrRun = ref(null)

async function openOcrModal() {
  showOcrModal.value = true
  await loadOcrRuns()
}

async function loadOcrRuns() {
  try {
    isOcrLoading.value = true
    const list = await businessApi.getOcrRuns()
    ocrRuns.value = list
  } catch (err) {
    console.error('Error cargando tareas OCR:', err)
  } finally {
    isOcrLoading.value = false
  }
}

async function simulateOcr() {
  try {
    emit('notify', { message: 'Iniciando OCR de IA', detail: 'Analizando estructura del documento de compras...' })
    await businessApi.simulateOcrRun()
    await Promise.all([
      loadOcrRuns(),
      fetchDashboardData()
    ])
    emit('notify', { message: 'OCR Completado', detail: 'Se ha procesado y extraído la información de la factura con éxito.' })
  } catch (err) {
    console.error('Error simulando OCR:', err)
  }
}

async function approveOcr(run) {
  try {
    emit('notify', { message: 'Registrando compra...', detail: 'Sincronizando factura con cuentas por pagar y libro diario...' })
    await businessApi.approveOcrRun(run.id)
    await Promise.all([
      loadOcrRuns(),
      fetchDashboardData()
    ])
    selectedOcrRun.value = null
    emit('notify', { message: 'Compra Registrada', detail: `La factura de ${run.fields?.vendor || 'proveedor'} se guardó como gasto/compra.` })
  } catch (err) {
    console.error('Error aprobando OCR:', err)
  }
}

async function deleteOcr(run) {
  try {
    await businessApi.deleteOcrRun(run.id)
    await Promise.all([
      loadOcrRuns(),
      fetchDashboardData()
    ])
    selectedOcrRun.value = null
    emit('notify', { message: 'Tarea eliminada', detail: 'Se ha descartado el documento del flujo de revisión.' })
  } catch (err) {
    console.error('Error descartando OCR:', err)
  }
}

async function fetchDashboardData() {
  try {
    isLoading.value = true

    let from = undefined
    let to = undefined

    if (selectedPeriod.value !== 'custom') {
      const dates = getPresetDates(selectedPeriod.value)
      from = dates.from
      to = dates.to
    } else {
      from = customFromDate.value
      to = customToDate.value
    }

    const [stats, alerts, insights, trend] = await Promise.all([
      businessApi.getDashboardKpis(from, to).catch(() => ({ totalSales: 0, lowStockAlerts: 0, pendingInvoices: 0 })),
      businessApi.getAlerts().catch(() => ({ lowStockAlerts: 0, pendingInvoices: 0 })),
      businessApi.getAiInsights().catch(() => ({ insight: 'Bienvenido a Contex360. El sistema está listo para operar.' })),
      businessApi.getCashFlowTrend().catch(() => ({ historical: [], projected: [] })),
    ])

    dashboardData.value = {
      totalSales: stats.totalSales ?? 0,
      lowStockAlerts: alerts.lowStockAlerts ?? stats.lowStockAlerts ?? 0,
      pendingInvoices: alerts.pendingInvoices ?? stats.pendingInvoices ?? 0,
      ocrRunsCount: alerts.ocrRunsCount ?? 0,
      aiInsight: (insights.insight && !insights.insight.includes('No se pudo')) ? insights.insight : 'Bienvenido a Contex360. El sistema está listo para operar.',
    }
    cashFlowData.value = {
      historical: trend.historical ?? [],
      projected: trend.projected ?? [],
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

function handleOpenOcrModalEvent() {
  openOcrModal()
}

onMounted(() => {
  if (props.isActive) fetchDashboardData()
  window.addEventListener('open-ocr-runs-modal', handleOpenOcrModalEvent)
  window.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  window.removeEventListener('open-ocr-runs-modal', handleOpenOcrModalEvent)
  window.removeEventListener('click', closeDropdown)
})
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
        <div class="relative inline-block text-left" @click.stop>
          <button @click="toggleDropdown" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors shadow-sm">
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>{{ displayPeriod }}</span>
            <span class="material-symbols-outlined text-[16px] text-[#A1A1AA] transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }">expand_more</span>
          </button>

          <!-- Dropdown Menu -->
          <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-72 bg-white border border-[#E4E4E7] rounded-xl shadow-lg z-50 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <div class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider px-2 mb-1">Periodo</div>
            
            <button v-for="p in presets" :key="p.value" @click="selectPreset(p)"
              :class="['w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-colors text-left', 
                        selectedPeriod === p.value ? 'bg-[#18181B] text-white' : 'text-[#3F3F46] hover:bg-[#F4F4F5]']">
              <span>{{ p.label }}</span>
              <span v-if="selectedPeriod === p.value" class="material-symbols-outlined text-[16px]">done</span>
            </button>
            
            <div class="border-t border-[#F4F4F5] my-2"></div>
            
            <button @click="selectPreset({ value: 'custom', label: 'Rango personalizado' })"
              :class="['w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-semibold transition-colors text-left', 
                        selectedPeriod === 'custom' ? 'bg-[#18181B] text-white' : 'text-[#3F3F46] hover:bg-[#F4F4F5]']">
              <span>Rango personalizado</span>
              <span v-if="selectedPeriod === 'custom'" class="material-symbols-outlined text-[16px]">done</span>
            </button>

            <!-- Custom Range Inputs -->
            <div v-if="selectedPeriod === 'custom'" class="p-2.5 space-y-3.5 bg-[#FAFAFA] rounded-lg mt-2 border border-[#E4E4E7]">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">Desde</label>
                <input type="date" v-model="customFromDate" 
                  class="w-full px-2.5 py-1.5 border border-[#E4E4E7] rounded-md bg-white text-[12px] font-semibold text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B] transition-shadow shadow-sm" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">Hasta</label>
                <input type="date" v-model="customToDate" 
                  class="w-full px-2.5 py-1.5 border border-[#E4E4E7] rounded-md bg-white text-[12px] font-semibold text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B] transition-shadow shadow-sm" />
              </div>
              <button @click="applyCustomRange" 
                class="w-full py-2 bg-[#18181B] hover:bg-[#27272A] text-white rounded-lg text-[12px] font-extrabold tracking-tight transition-colors shadow-sm flex items-center justify-center gap-1.5">
                Aplicar rango
              </button>
            </div>
          </div>
        </div>
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
          <span v-if="dashboardData.totalSales > 0" class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold tracking-tight">
            <span class="material-symbols-outlined text-[12px]">arrow_upward</span>15%
          </span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Ventas del día</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">$ {{ formatCompact(dashboardData.totalSales) }}</p>
          <p class="text-[12px] font-medium text-[#71717A]">{{ dashboardData.totalSales > 0 ? 'Operación activa' : 'Sin ventas registradas' }}</p>
        </div>
      </div>

      <!-- Pending Invoices -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
          <span v-if="dashboardData.pendingInvoices > 0" class="inline-flex px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold tracking-tight">Por cobrar</span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Facturas pendientes</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">{{ dashboardData.pendingInvoices }}</p>
          <p class="text-[12px] font-medium text-[#71717A]">{{ dashboardData.pendingInvoices > 0 ? 'Documentos pendientes' : 'Al día con las cuentas' }}</p>
        </div>
      </div>

      <!-- Low Stock -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
            <span class="material-symbols-outlined text-[22px]">inventory_2</span>
          </div>
          <span v-if="dashboardData.lowStockAlerts > 0" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold tracking-tight">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Stock bajo
          </span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Stock bajo</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">{{ dashboardData.lowStockAlerts }} SKUs</p>
          <p class="text-[12px] font-medium text-[#71717A]">{{ dashboardData.lowStockAlerts > 0 ? 'Requieren reabastecer' : 'Nivel de inventario óptimo' }}</p>
        </div>
      </div>

      <!-- AI Tasks -->
      <div @click="openOcrModal" class="bg-white border border-[#E4E4E7] rounded-[14px] p-5 shadow-sm flex flex-col justify-between hover:border-[#D4D4D8] transition-colors cursor-pointer group">
        <div class="flex items-start justify-between mb-6">
          <div class="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white transition-colors">
            <span class="material-symbols-outlined text-[22px]">document_scanner</span>
          </div>
          <span class="inline-flex px-2 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[11px] font-bold tracking-tight">OCR listo</span>
        </div>
        <div>
          <p class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">Tareas de IA</p>
          <p class="text-[26px] sm:text-[28px] font-extrabold text-[#18181B] tracking-[-0.03em] leading-none mb-1.5">{{ dashboardData.ocrRunsCount }}</p>
          <p class="text-[12px] font-medium text-[#71717A]">{{ dashboardData.ocrRunsCount > 0 ? 'listas para revisar' : 'sin documentos pendientes' }}</p>
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
            <path :d="svgPaths.area" fill="url(#chartGrad)" />
            <!-- Line path -->
            <path :d="svgPaths.line" fill="none" stroke="#18181B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Prediction dashed line -->
            <path :d="svgPaths.projection" fill="none" stroke="#2563EB" stroke-width="3" stroke-dasharray="7,5" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Today vertical line -->
            <line x1="420" y1="10" x2="420" y2="220" stroke="#D4D4D8" stroke-dasharray="4" stroke-width="1.5" />
            <!-- Today dot -->
            <circle cx="420" :cy="svgPaths.todayY" r="6" fill="#18181B" stroke="#ffffff" stroke-width="2.5" />
          </svg>

          <!-- Today badge -->
          <div class="absolute left-[60%] top-0 -translate-x-1/2 bg-white border border-[#E4E4E7] rounded-md px-2.5 py-1 text-[10px] font-extrabold text-[#18181B] uppercase tracking-wider shadow-sm">
            Hoy
          </div>

          <!-- X axis dates -->
          <div class="flex justify-between text-[12px] font-semibold text-[#A1A1AA] mt-4">
            <span>{{ dateLabels.start }}</span>
            <span>{{ dateLabels.midPast }}</span>
            <span class="font-extrabold text-[#18181B]">{{ dateLabels.today }}</span>
            <span>{{ dateLabels.midFuture }}</span>
            <span>{{ dateLabels.end }}</span>
          </div>
        </div>
      </div>

      <!-- Alertas Column -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 shadow-sm flex flex-col justify-between self-start w-full">
        <div>
          <h3 class="text-[18px] font-extrabold text-[#18181B] tracking-tight mb-6">Alertas</h3>
          <div v-if="alertsList.length > 0" class="space-y-4 divide-y divide-[#F4F4F5]">
            <div v-for="alert in alertsList" :key="alert.id" class="pt-4 first:pt-0">
              <div class="flex items-center gap-2.5 mb-1">
                <span :class="['w-2 h-2 rounded-full flex-shrink-0', alert.color]"></span>
                <p class="text-[14px] font-bold text-[#18181B] leading-tight tracking-tight">{{ alert.title }}</p>
              </div>
              <p class="text-[13px] text-[#71717A] pl-4.5 font-medium">{{ alert.description }} <span class="text-[#A1A1AA] ml-1 font-normal">{{ alert.time }}</span></p>
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center py-8 text-center">
            <span class="material-symbols-outlined text-[36px] text-emerald-500 mb-2">check_circle</span>
            <p class="text-[14px] font-bold text-[#18181B]">Sin alertas pendientes</p>
            <p class="text-[12px] text-[#71717A]">Tu negocio está funcionando perfectamente.</p>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-[#F4F4F5]">
          <button @click="handleViewAlerts" class="text-[13px] font-bold text-[#18181B] hover:text-[#2563EB] transition-colors flex items-center gap-1.5 group">
            Ver todas las alertas <span class="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>

    <!-- AI OCR Runs Modal -->
    <div v-if="showOcrModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div @click="showOcrModal = false" class="absolute inset-0 bg-[#09090B]/40 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal Card -->
      <div class="relative bg-white border border-[#E4E4E7] rounded-[18px] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-[#F4F4F5]">
          <div>
            <h3 class="text-[18px] font-extrabold text-[#18181B] tracking-tight">Tareas de OCR con IA</h3>
            <p class="text-[12px] text-[#71717A] font-medium">Revisa, edita y aprueba las facturas extraídas automáticamente por la inteligencia artificial</p>
          </div>
          <div class="flex items-center gap-3">
            <button @click="simulateOcr" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] text-white hover:bg-[#27272A] rounded-lg text-[12px] font-extrabold tracking-tight transition-colors shadow-sm">
              <span class="material-symbols-outlined text-[16px]">add_circle</span> Simular Recibo / Factura
            </button>
            <button @click="showOcrModal = false" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4F4F5] text-[#71717A] transition-colors">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 min-h-0">
          <!-- Left side: List of runs -->
          <div class="flex-1 flex flex-col min-w-0">
            <div v-if="isOcrLoading" class="flex flex-col items-center justify-center py-12">
              <span class="animate-spin w-8 h-8 border-2 border-[#18181B] border-t-transparent rounded-full mb-3"></span>
              <p class="text-[13px] font-medium text-[#71717A]">Procesando documentos...</p>
            </div>
            <div v-else-if="ocrRuns.length === 0" class="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#E4E4E7] rounded-xl px-4">
              <span class="material-symbols-outlined text-[42px] text-[#A1A1AA] mb-3">folder_open</span>
              <h4 class="text-[14px] font-bold text-[#18181B]">Bandeja de Entrada Limpia</h4>
              <p class="text-[12px] text-[#71717A] max-w-[280px] mt-1 mb-5">No tienes facturas ni recibos pendientes de revisión por parte de la IA.</p>
              <button @click="simulateOcr" class="inline-flex items-center gap-1.5 px-4 py-2 border border-[#E4E4E7] rounded-lg text-[12px] font-extrabold text-[#18181B] hover:bg-[#F4F4F5] transition-all">
                <span class="material-symbols-outlined text-[16px]">bolt</span> Generar Demo de Factura
              </button>
            </div>
            <div v-else class="space-y-3.5">
              <div v-for="run in ocrRuns" :key="run.id" 
                @click="selectedOcrRun = run"
                :class="['border rounded-xl p-4 cursor-pointer transition-all hover:border-[#18181B] hover:shadow-sm flex items-start gap-4', selectedOcrRun?.id === run.id ? 'border-[#18181B] bg-[#F8F8F8]' : 'border-[#E4E4E7] bg-white']"
              >
                <div class="w-10 h-10 rounded-[8px] bg-[#F4F4F5] flex items-center justify-center text-[#71717A] flex-shrink-0">
                  <span class="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 mb-1">
                    <h5 class="text-[14px] font-bold text-[#18181B] truncate">{{ run.fields?.vendor || 'Factura Sin Nombre' }}</h5>
                    <span :class="['inline-flex px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-tight flex-shrink-0', run.confidence > 0.95 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
                      {{ Math.round(run.confidence * 100) }}% precisión
                    </span>
                  </div>
                  <p class="text-[12px] text-[#71717A] font-semibold truncate">{{ run.source }}</p>
                  <div class="flex items-center justify-between mt-3 text-[12px] font-bold">
                    <span class="text-[#71717A]">Total Extraído:</span>
                    <span class="text-[#18181B]">$ {{ Number(run.fields?.total || 0).toLocaleString('es-CO') }} COP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side: Detail view -->
          <div class="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-[#F4F4F5] pt-6 lg:pt-0 lg:pl-6 flex flex-col flex-shrink-0 min-w-0">
            <div v-if="selectedOcrRun" class="flex flex-col h-full justify-between min-h-0">
              <div>
                <div class="flex items-center gap-3 mb-5">
                  <div class="w-12 h-12 rounded-[10px] bg-[#2563EB]/5 border border-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                    <span class="material-symbols-outlined text-[24px]">receipt_long</span>
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-[15px] font-extrabold text-[#18181B] leading-none mb-1 truncate">{{ selectedOcrRun.fields?.vendor }}</h4>
                    <p class="text-[11px] text-[#71717A] font-semibold">NIT: {{ selectedOcrRun.fields?.nit }}</p>
                  </div>
                </div>

                <!-- Extracted fields list -->
                <div class="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  <div class="grid grid-cols-2 gap-4 border-b border-[#F4F4F5] pb-3">
                    <div>
                      <span class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-0.5">Fecha Documento</span>
                      <span class="text-[13px] font-bold text-[#18181B]">{{ selectedOcrRun.fields?.date || 'N/A' }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-0.5">Precisión de Extracción</span>
                      <span class="text-[13px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <span class="material-symbols-outlined text-[14px]">verified</span> {{ Math.round(selectedOcrRun.confidence * 100) }}%
                      </span>
                    </div>
                  </div>

                  <!-- Table of extracted items -->
                  <div>
                    <span class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-2">Items Extraídos ({{ selectedOcrRun.fields?.items?.length || 0 }})</span>
                    <div class="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      <div v-for="(item, idx) in selectedOcrRun.fields?.items" :key="idx" class="bg-[#F9F9F9] rounded-lg p-2 flex items-center justify-between text-[11px] font-semibold text-[#1E293B]">
                        <div class="min-w-0 flex-1">
                          <p class="truncate font-bold text-[#18181B]">{{ item.description }}</p>
                          <p class="text-[10px] text-[#71717A]">{{ item.qty }} x $ {{ Number(item.price).toLocaleString('es-CO') }}</p>
                        </div>
                        <span class="font-extrabold text-[#18181B] ml-2">$ {{ Number(item.total).toLocaleString('es-CO') }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Financial totals -->
                  <div class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 text-[12px] font-bold">
                    <div class="flex justify-between text-[#475569]">
                      <span>Subtotal:</span>
                      <span>$ {{ Number(selectedOcrRun.fields?.subtotal || 0).toLocaleString('es-CO') }} COP</span>
                    </div>
                    <div class="flex justify-between text-[#475569]">
                      <span>IVA (19%):</span>
                      <span>$ {{ Number(selectedOcrRun.fields?.tax || 0).toLocaleString('es-CO') }} COP</span>
                    </div>
                    <div class="flex justify-between text-[#1E293B] text-[13px] border-t border-[#E2E8F0] pt-2 mt-1">
                      <span>Total Factura:</span>
                      <span class="text-[#2563EB]">$ {{ Number(selectedOcrRun.fields?.total || 0).toLocaleString('es-CO') }} COP</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-3 pt-6 mt-6 border-t border-[#F4F4F5]">
                <button @click="deleteOcr(selectedOcrRun)" class="flex-1 py-2 px-3 border border-[#E4E4E7] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-[12px] font-extrabold text-[#71717A] transition-all">
                  Descartar
                </button>
                <button @click="approveOcr(selectedOcrRun)" class="flex-[1.5] py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-[12px] font-extrabold tracking-tight transition-colors shadow-sm flex items-center justify-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">done</span> Aprobar e Ingresar
                </button>
              </div>
            </div>
            <div v-else class="flex-1 flex flex-col items-center justify-center py-12 text-center text-[#A1A1AA]">
              <span class="material-symbols-outlined text-[36px] mb-2">touch_app</span>
              <p class="text-[13px] font-bold text-[#18181B]">Ninguna tarea seleccionada</p>
              <p class="text-[11px] text-[#71717A] max-w-[200px] mt-0.5">Selecciona una factura de la lista de la izquierda para ver su análisis.</p>
            </div>
          </div>
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
