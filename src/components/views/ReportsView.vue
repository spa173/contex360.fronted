<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStateStore } from '@/stores/stateStore'
import { businessApi } from '@/services/businessApi'
import { formatCurrency, formatDate, formatDateOnly } from '@/utils/ui'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  Package,
  Receipt,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useStateStore()

// Date filters
const dateRange = ref({
  from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0],
})

const quickRanges = [
  { label: 'Este mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
  { label: 'Este año', days: 365 },
  { label: 'Todo', days: 0 },
]

function setQuickRange(days) {
  const to = new Date()
  const from = days === 0 ? new Date(2020, 0, 1) : new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
  dateRange.value = {
    to: to.toISOString().split('T')[0],
    from: from.toISOString().split('T')[0],
  }
  loadData()
}

// Data state
const loading = ref(false)
const salesReport = ref(null)
const topProducts = ref([])
const monthlySales = ref([])
const agingReport = ref(null)

async function loadData() {
  if (!store.activeTenantId) return
  
  loading.value = true
  try {
    const [report, products, monthly, aging] = await Promise.all([
      businessApi.getSalesReport(dateRange.value.from, dateRange.value.to, store.activeTenantId),
      businessApi.getTopProducts(10, store.activeTenantId),
      businessApi.getSalesByMonth(store.activeTenantId),
      businessApi.getInvoiceAging(store.activeTenantId),
    ])
    
    salesReport.value = report
    topProducts.value = products
    monthlySales.value = monthly
    agingReport.value = aging
  } catch (error) {
    emit('notify', {
      message: 'Error al cargar reportes',
      detail: error.message,
    })
  } finally {
    loading.value = false
  }
}

function handleExport() {
  const url = businessApi.getExportInvoicesUrl()
  window.open(url, '_blank')
}

// Computed metrics
const metrics = computed(() => {
  if (!salesReport.value?.summary) return null
  
  const s = salesReport.value.summary
  const growth = salesReport.value.growth
  
  return [
    {
      label: 'Ventas Totales',
      value: formatCurrency(s.totalSales),
      change: growth?.percentage || 0,
      trend: growth?.trend || 'neutral',
      icon: Receipt,
      color: 'emerald',
    },
    {
      label: 'Facturas Emitidas',
      value: s.invoiceCount.toString(),
      change: 0,
      trend: 'neutral',
      icon: BarChart3,
      color: 'blue',
    },
    {
      label: 'Ticket Promedio',
      value: formatCurrency(s.averageInvoice),
      change: 0,
      trend: 'neutral',
      icon: Users,
      color: 'amber',
    },
    {
      label: 'Impuestos',
      value: formatCurrency(s.totalTax),
      change: 0,
      trend: 'neutral',
      icon: TrendingUp,
      color: 'purple',
    },
  ]
})

// Chart data preparation
const chartData = computed(() => {
  if (!monthlySales.value?.length) return []
  return monthlySales.value.slice(-12).map(item => ({
    name: item.name,
    value: item.total,
  }))
})

const maxChartValue = computed(() => {
  if (!chartData.value.length) return 0
  return Math.max(...chartData.value.map(d => d.value))
})

watch(() => store.activeTenantId, () => {
  if (store.activeTenantId) loadData()
}, { immediate: true })

onMounted(() => {
  if (store.activeTenantId) loadData()
})
</script>

<template>
  <section v-if="isActive" class="min-h-full p-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 class="w-6 h-6 text-emerald-400" />
          Reportes y Análisis
        </h1>
        <p class="text-slate-400 text-sm mt-1">Métricas de ventas, productos y rendimiento</p>
      </div>
      
      <div class="flex items-center gap-3">
        <button
          @click="handleExport"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
        >
          <Download class="w-4 h-4" />
          Exportar CSV
        </button>
      </div>
    </div>

    <!-- Date Filters -->
    <div class="mb-6 bg-[#131926] border border-slate-800/50 rounded-xl p-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-slate-400" />
          <span class="text-sm text-slate-400">Período:</span>
        </div>
        
        <div class="flex items-center gap-2">
          <input
            v-model="dateRange.from"
            type="date"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
            @change="loadData"
          />
          <span class="text-slate-500">-</span>
          <input
            v-model="dateRange.to"
            type="date"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all outline-none"
            @change="loadData"
          />
        </div>
        
        <div class="flex items-center gap-2 ml-auto">
          <button
            v-for="range in quickRanges"
            :key="range.label"
            @click="setQuickRange(range.days)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
            :class="[
              dateRange.to === new Date().toISOString().split('T')[0] && 
              dateRange.from === (range.days === 0 ? '2020-01-01' : new Date(new Date().getTime() - range.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 text-emerald-400 animate-spin" />
      <span class="ml-3 text-slate-400">Cargando reportes...</span>
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="bg-[#131926] border border-slate-800/50 rounded-xl p-5 hover:border-slate-700/50 transition-all"
        >
          <div class="flex items-start justify-between mb-4">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', `bg-${metric.color}-500/10`]">
              <component :is="metric.icon" :class="['w-5 h-5', `text-${metric.color}-400`]" />
            </div>
            <div v-if="metric.change !== 0" class="flex items-center gap-1 text-xs">
              <component
                :is="metric.trend === 'up' ? ArrowUpRight : ArrowDownRight"
                :class="['w-3 h-3', metric.trend === 'up' ? 'text-emerald-400' : 'text-rose-400']"
              />
              <span :class="metric.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'">
                {{ Math.abs(metric.change).toFixed(1) }}%
              </span>
            </div>
          </div>
          <div class="text-2xl font-bold text-white mb-1">{{ metric.value }}</div>
          <div class="text-sm text-slate-400">{{ metric.label }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sales Chart -->
        <div class="lg:col-span-2 bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden">
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20">
            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-emerald-400" />
              Ventas por Mes
            </h2>
          </div>
          <div class="p-6">
            <div v-if="chartData.length" class="space-y-4">
              <div
                v-for="item in chartData"
                :key="item.name"
                class="flex items-center gap-4"
              >
                <div class="w-16 text-xs text-slate-400 font-mono">{{ item.name }}</div>
                <div class="flex-1 h-8 bg-slate-800/50 rounded-lg overflow-hidden relative">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg transition-all duration-500"
                    :style="{ width: `${(item.value / maxChartValue) * 100}%` }"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                    {{ formatCurrency(item.value) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-slate-500">
              No hay datos de ventas para mostrar
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden">
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20">
            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Package class="w-4 h-4 text-amber-400" />
              Top Productos
            </h2>
          </div>
          <div class="max-h-[400px] overflow-y-auto">
            <div v-if="topProducts.length" class="divide-y divide-slate-800/50">
              <div
                v-for="(product, index) in topProducts"
                :key="product.productId"
                class="p-4 hover:bg-slate-800/30 transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                    {{ index + 1 }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ product.name }}</p>
                    <p class="text-xs text-slate-400">
                      {{ product.totalQuantity }} unidades vendidas
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-semibold text-emerald-400">{{ formatCurrency(product.totalRevenue) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="p-12 text-center text-slate-500">
              No hay datos de productos
            </div>
          </div>
        </div>
      </div>

      <!-- Aging Report —— Cartera por Antigüedad -->
      <div v-if="agingReport?.buckets" class="mt-6 bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <TrendingDown class="w-4 h-4 text-rose-400" />
            Antigüedad de Cartera
          </h2>
          <span class="text-xs text-slate-400">Total: {{ formatCurrency(agingReport.totalPortfolio) }}</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 divide-x divide-slate-800/50">
          <div
            v-for="bucket in agingReport.buckets"
            :key="bucket.label"
            class="p-5 text-center"
          >
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{{ bucket.label }}</p>
            <p :class="['text-xl font-black', bucket.label === 'Al día' ? 'text-emerald-400' : 'text-rose-400']">{{ formatCurrency(bucket.total) }}</p>
            <p class="text-xs text-slate-600 mt-1">{{ bucket.count }} factura(s)</p>
          </div>
        </div>
      </div>

      <!-- Recent Invoices -->
      <div v-if="salesReport?.invoices?.length" class="mt-6 bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden">
        <div class="p-5 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Receipt class="w-4 h-4 text-blue-400" />
            Facturas del Período
          </h2>
          <span class="text-xs text-slate-400">{{ salesReport.invoices.length }} facturas</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-800/30">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Número</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fecha</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cliente</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Items</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              <tr
                v-for="invoice in salesReport.invoices.slice(0, 10)"
                :key="invoice.id"
                class="hover:bg-slate-800/30 transition-all"
              >
                <td class="px-4 py-3 text-sm font-mono text-slate-300">{{ invoice.number }}</td>
                <td class="px-4 py-3 text-sm text-slate-400">{{ formatDate(invoice.date) }}</td>
                <td class="px-4 py-3 text-sm text-white">{{ invoice.client }}</td>
                <td class="px-4 py-3 text-sm text-slate-400">{{ invoice.itemCount }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-emerald-400 text-right">{{ formatCurrency(invoice.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
