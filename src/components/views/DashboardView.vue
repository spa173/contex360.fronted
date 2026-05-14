<script setup>
import { computed } from 'vue'
import { useAiStore } from '../../stores/aiStore'
import { useBillingStore } from '../../stores/billingStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useUsersStore } from '../../stores/usersStore'
import { formatCurrency, formatDate, moduleRows } from '../../utils/ui'
import BusinessChart from '../analytics/BusinessChart.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Package, 
  Users as UsersIcon, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const billing = useBillingStore()
const inventory = useInventoryStore()
const ai = useAiStore()
const users = useUsersStore()

const totalRevenue = computed(() =>
  billing.tenantInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
)

const lowStockCount = computed(() =>
  inventory.tenantProducts.filter((p) => p.stock <= p.minStock).length
)

const activeUsersCount = computed(() =>
  rootUsers.value.filter(u => u.status === 'active').length
)

const rootUsers = computed(() => users.users || [])

const pipeline = computed(() => {
  const total = Math.max(billing.tenantInvoices.length, 1)
  const counts = billing.tenantInvoices.reduce((accumulator, invoice) => {
    accumulator[invoice.status] = (accumulator[invoice.status] || 0) + 1
    return accumulator
  }, {})

  return [
    ['Borrador', 'borrador'],
    ['Emitida', 'emitida'],
    ['Enviada', 'enviada'],
    ['Aceptada', 'aceptada'],
    ['Rechazada', 'rechazada'],
  ].map(([label, key]) => ({
    label,
    count: counts[key] || 0,
    progress: ((counts[key] || 0) / total) * 100,
  }))
})

const pipelineChartData = computed(() => ({
  labels: pipeline.value.map(p => p.label),
  datasets: [{
    data: pipeline.value.map(p => p.count),
    backgroundColor: [
      '#4b5563', // Borrador
      '#06b6d4', // Emitida
      '#f59e0b', // Enviada
      '#10b981', // Aceptada
      '#f43f5e'  // Rechazada
    ],
    borderWidth: 0,
    hoverOffset: 8
  }]
}))

const revenueTrendData = computed(() => {
  const months = []
  const values = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = d.toLocaleString('es-CO', { month: 'short' })
    months.push(monthName)
    
    const monthTotal = billing.tenantInvoices.reduce((sum, inv) => {
      const invDate = new Date(inv.issuedAt || inv.createdAt)
      if (invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear()) {
        return sum + inv.total
      }
      return sum
    }, 0)
    values.push(monthTotal)
  }

  return {
    labels: months,
    datasets: [{
      label: 'Ventas mensuales',
      data: values,
      borderColor: '#10b981',
      backgroundColor: (context) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        return gradient;
      },
      fill: 'start',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#10b981',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2
    }]
  }
})

const stockValueData = computed(() => {
  const categoryMap = inventory.tenantProducts.reduce((acc, p) => {
    const value = (p.stock || 0) * (p.cost || 0)
    acc[p.category] = (acc[p.category] || 0) + value
    return acc
  }, {})

  const labels = Object.keys(categoryMap)
  const values = Object.values(categoryMap)

  return {
    labels,
    datasets: [{
      label: 'Valor total',
      data: values,
      backgroundColor: '#10b981',
      borderRadius: 4,
      borderWidth: 0,
      barThickness: 12
    }]
  }
})

const kpis = computed(() => [
  {
    title: 'Ingresos Totales',
    value: formatCurrency(totalRevenue.value),
    trend: '+14.2%',
    trendUp: true,
    icon: DollarSign,
    color: 'emerald'
  },
  {
    title: 'Stock Crítico',
    value: lowStockCount.value,
    trend: 'Bajo control',
    trendUp: true,
    icon: Package,
    color: 'amber'
  },
  {
    title: 'Usuarios Activos',
    value: activeUsersCount.value,
    trend: '+2 nuevos',
    trendUp: true,
    icon: UsersIcon,
    color: 'blue'
  },
  {
    title: 'Eficiencia Operativa',
    value: '94%',
    trend: '+1.5% v. mes ant.',
    trendUp: true,
    icon: BarChart3,
    color: 'purple'
  }
])
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <!-- KPI Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card v-for="kpi in kpis" :key="kpi.title" class="bg-[#131926] border border-slate-800/50 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">{{ kpi.title }}</p>
              <h3 class="text-2xl font-bold text-white tracking-tight">{{ kpi.value }}</h3>
            </div>
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300',
              kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 
              kpi.color === 'amber' ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20' :
              kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20' :
              'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'
            ]">
              <component :is="kpi.icon" class="w-5 h-5" />
            </div>
          </div>
          <div class="flex items-center gap-1.5 mt-2">
            <TrendingUp v-if="kpi.trendUp" class="w-3.5 h-3.5 text-emerald-400" />
            <TrendingDown v-else class="w-3.5 h-3.5 text-rose-400" />
            <span :class="['text-xs font-medium', kpi.trendUp ? 'text-emerald-400' : 'text-rose-400']">
              {{ kpi.trend }}
            </span>
            <span class="text-xs text-slate-500 ml-1">este mes</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column (Main Charts) -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Sales Trend -->
        <Card class="bg-[#131926] border border-slate-800/50 shadow-sm overflow-hidden">
          <CardHeader class="border-b border-slate-800/50 px-8 py-5">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Desempeño</p>
                <CardTitle class="text-lg font-bold text-white">Tendencia de Ingresos</CardTitle>
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">6 Meses</button>
                <button class="px-3 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-800/50 rounded-md">12 Meses</button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="p-8">
             <BusinessChart 
               type="line" 
               :data="revenueTrendData" 
               :options="{ 
                 scales: {
                   y: { 
                     grid: { color: 'rgba(148, 163, 184, 0.05)' },
                     ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => '$' + (v/1000000).toFixed(1) + 'M' } 
                   },
                   x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                 },
                 plugins: { legend: { display: false } },
                 maintainAspectRatio: false
               }" 
               class="h-[300px]"
             />
          </CardContent>
        </Card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Stock Value -->
          <Card class="bg-[#131926] border border-slate-800/50 shadow-sm">
            <CardHeader class="border-b border-slate-800/50 px-6 py-4">
              <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Logística</p>
              <CardTitle class="text-md font-bold text-white">Valor del Stock</CardTitle>
            </CardHeader>
            <CardContent class="p-6">
               <BusinessChart 
                 type="bar" 
                 :data="stockValueData" 
                 :options="{ 
                   indexAxis: 'y',
                   scales: { 
                     x: { 
                       grid: { color: 'rgba(148, 163, 184, 0.05)' },
                       ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => '$' + (v/1000).toFixed(0) + 'k' } 
                     },
                     y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                   },
                   plugins: { legend: { display: false } }
                 }" 
               />
            </CardContent>
          </Card>

          <!-- Module Status -->
          <Card class="bg-[#131926] border border-slate-800/50 shadow-sm">
            <CardHeader class="border-b border-slate-800/50 px-6 py-4 flex flex-row justify-between items-end">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Resumen</p>
                <CardTitle class="text-md font-bold text-white">Estado de Módulos</CardTitle>
              </div>
              <Sparkles class="w-5 h-5 text-purple-400 animate-pulse" />
            </CardHeader>
            <CardContent class="p-4">
              <div class="space-y-1">
                <div v-for="[name, status, note] in moduleRows" :key="name" 
                  class="flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors duration-200 hover:bg-slate-800/40 group">
                  <div class="flex items-center gap-3">
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <div>
                      <p class="text-sm font-semibold text-slate-200">{{ name }}</p>
                      <p class="text-[10px] text-slate-500 leading-none">{{ note }}</p>
                    </div>
                  </div>
                  <div class="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                    Operativo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Right Column (Alerts & Activity) -->
      <div class="space-y-8">
        <!-- Alerts -->
        <Card class="bg-[#131926] border border-slate-800/50 shadow-sm">
          <CardHeader class="border-b border-slate-800/50 px-6 py-4">
            <div class="flex items-center gap-2">
              <AlertCircle class="w-4 h-4 text-rose-400" />
              <CardTitle class="text-md font-bold text-white">Alertas Prioritarias</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="p-4">
            <div v-if="lowStockProducts.length" class="space-y-3">
              <div v-for="product in lowStockProducts.slice(0, 3)" :key="product.id" class="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                <div class="flex justify-between items-start mb-1">
                  <p class="text-xs font-bold text-rose-200">{{ product.name }}</p>
                  <span class="text-[10px] font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded border border-rose-400/20">BAJO STOCK</span>
                </div>
                <p class="text-[10px] text-slate-500">Quedan {{ product.stock }} unidades. El mínimo es {{ product.minStock }}.</p>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 class="w-8 h-8 text-emerald-500/30 mb-2" />
              <p class="text-xs text-slate-500">Sin alertas críticas activas.</p>
            </div>
          </CardContent>
        </Card>

        <!-- Pipeline DIAN -->
        <Card class="bg-[#131926] border border-slate-800/50 shadow-sm">
          <CardHeader class="border-b border-slate-800/50 px-6 py-4">
            <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Cumplimiento</p>
            <CardTitle class="text-md font-bold text-white">Pipeline DIAN</CardTitle>
          </CardHeader>
          <CardContent class="p-6">
             <div class="relative">
               <BusinessChart 
                 type="doughnut" 
                 :data="pipelineChartData" 
                 :options="{ 
                   plugins: { legend: { display: false } },
                   cutout: '82%',
                   maintainAspectRatio: true
                 }" 
                 class="h-[180px]"
               />
               <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span class="text-2xl font-bold text-white">{{ billing.tenantInvoices.length }}</span>
                 <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facturas</span>
               </div>
             </div>
             <div class="mt-6 grid grid-cols-2 gap-y-3 gap-x-4">
                <div v-for="p in pipeline" :key="p.label" class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: pipelineChartData.datasets[0].backgroundColor[pipeline.indexOf(p)] }"></div>
                  <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{{ p.label }}</span>
                  <span class="text-[10px] font-bold text-slate-200 ml-auto">{{ p.count }}</span>
                </div>
             </div>
          </CardContent>
        </Card>

        <!-- Audit Log -->
        <Card class="bg-[#131926] border border-slate-800/50 shadow-sm">
          <CardHeader class="border-b border-slate-800/50 px-6 py-4">
            <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-1">Seguridad</p>
            <CardTitle class="text-md font-bold text-white">Bitácora de Auditoría</CardTitle>
          </CardHeader>
          <CardContent class="p-4">
            <div v-if="users.auditEvents.length" class="space-y-4">
              <div v-for="event in users.auditEvents.slice(0, 3)" :key="event.id" class="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-slate-700">
                <p class="text-xs font-bold text-slate-300 leading-tight mb-0.5">{{ event.action }} {{ event.entity }}</p>
                <p class="text-[10px] text-slate-500 truncate mb-1">{{ event.description }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-bold text-slate-600 uppercase">{{ event.actor }}</span>
                  <span class="text-[9px] text-slate-600">{{ formatDate(event.at) }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-slate-600 text-center py-4">Sin actividad reciente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-grid {
  /* Layout is handled by Tailwind grid classes in the template */
}

/* Custom shadow for cards */
.card {
  box-shadow: var(--shadow-sm);
}

.card:hover {
  box-shadow: var(--shadow);
}
</style>
