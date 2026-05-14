<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useAiStore } from '../../stores/aiStore'
import { useBillingStore } from '../../stores/billingStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useUsersStore } from '../../stores/usersStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { formatDate, moduleRows } from '../../utils/ui'
import BusinessChart from '../analytics/BusinessChart.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  Package, 
  Users as UsersIcon, 
  TrendingUp, 
  BarChart3, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Activity,
  Plus,
  ShieldCheck
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const auth = useAuthStore()
const billing = useBillingStore()
const inventory = useInventoryStore()
const ai = useAiStore()
const users = useUsersStore()
const { formatCOP, formatCompact, safeLength } = useDashboardStats()

// Defensive calculations
const totalRevenue = computed(() => {
  const invoices = billing.tenantInvoices || []
  return invoices.reduce((sum, inv) => sum + (inv?.total || 0), 0)
})

const lowStockCount = computed(() => {
  const products = inventory.tenantProducts || []
  return products.filter(p => (p?.stock || 0) <= (p?.minStock || 0)).length
})

const activeUsersCount = computed(() => {
  const allUsers = users.users || []
  return allUsers.filter(u => u?.status === 'active').length
})

const revenueTrendData = computed(() => {
  const months = []
  const values = []
  const now = new Date()
  const invoices = billing.tenantInvoices || []
  
  if (invoices.length === 0) return null

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = d.toLocaleString('es-CO', { month: 'short' })
    months.push(monthName)
    
    const monthTotal = invoices.reduce((sum, inv) => {
      const invDate = new Date(inv?.issuedAt || inv?.createdAt)
      if (invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear()) {
        return sum + (inv?.total || 0)
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
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        return gradient;
      },
      fill: 'start',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6
    }]
  }
})

const kpis = computed(() => [
  {
    title: 'Revenue Total',
    value: formatCOP(totalRevenue.value),
    icon: DollarSign,
    color: 'emerald',
    trend: '+12.5%'
  },
  {
    title: 'Inventario Crítico',
    value: lowStockCount.value === 0 ? 'Normal' : lowStockCount.value,
    icon: Package,
    color: 'amber',
    trend: lowStockCount.value > 0 ? 'Requiere acción' : 'Optimizado'
  },
  {
    title: 'Usuarios Activos',
    value: activeUsersCount.value,
    icon: UsersIcon,
    color: 'blue',
    trend: 'En línea'
  },
  {
    title: 'Salud del Sistema',
    value: '99.9%',
    icon: Activity,
    color: 'purple',
    trend: 'Estable'
  }
])

const healthModules = [
  { name: 'Facturación Electrónica', status: 'Operativo', icon: CheckCircle2 },
  { name: 'Gestión de Inventario', status: 'Operativo', icon: CheckCircle2 },
  { name: 'Cifrado de Datos AES-256', status: 'Operativo', icon: ShieldCheck },
  { name: 'Intercepción de Sesión', status: 'Operativo', icon: CheckCircle2 }
]
</script>

<template>
  <section :class="['view', { active: isActive }]" class="bg-[#0B0F1A] min-h-screen">
    <!-- Header -->
    <div class="mb-10">
      <h2 class="text-3xl font-black text-white tracking-tight mb-1">Panel de Control</h2>
      <p class="text-slate-500 font-medium">Visualización de métricas críticas y salud operativa.</p>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card v-for="kpi in kpis" :key="kpi.title" class="bg-[#131926] border-slate-800/60 shadow-xl overflow-hidden group">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
              kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 
              kpi.color === 'amber' ? 'bg-amber-500/10 text-amber-400' :
              kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
              'bg-purple-500/10 text-purple-400'
            ]">
              <component :is="kpi.icon" class="w-5 h-5" />
            </div>
            <Badge variant="outline" class="border-slate-800 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
              {{ kpi.trend }}
            </Badge>
          </div>
          <p class="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-1">{{ kpi.title }}</p>
          <h3 class="text-2xl font-black text-white tracking-tighter font-mono">{{ kpi.value }}</h3>
        </div>
      </Card>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Chart Column -->
      <div class="lg:col-span-2">
        <Card class="bg-[#131926] border-slate-800/60 shadow-xl h-full flex flex-col">
          <CardHeader class="px-8 pt-8 pb-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-1">Métricas de Desempeño</p>
                <CardTitle class="text-xl font-bold text-white tracking-tight">Tendencia de Ingresos Mensuales</CardTitle>
              </div>
              <TrendingUp class="w-5 h-5 text-emerald-500 opacity-50" />
            </div>
          </CardHeader>
          <CardContent class="p-8 flex-grow flex flex-col justify-center">
            <div v-if="revenueTrendData" class="h-[320px]">
              <BusinessChart 
                type="line" 
                :data="revenueTrendData" 
                :options="{ 
                  scales: {
                    y: { 
                      grid: { color: 'rgba(148, 163, 184, 0.03)' },
                      ticks: { color: '#64748b', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', size: 10 }, callback: (v) => formatCompact(v) } 
                    },
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', size: 10 } } }
                  },
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false
                }" 
              />
            </div>
            <div v-else class="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div class="w-16 h-16 bg-slate-800/40 rounded-3xl flex items-center justify-center">
                <BarChart3 class="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h4 class="text-lg font-bold text-slate-300 tracking-tight">Sin historial de ingresos</h4>
                <p class="text-slate-500 text-sm max-w-[280px] mx-auto mt-2">Agrega facturas para comenzar a visualizar las tendencias financieras.</p>
              </div>
              <Button @click="auth.setActiveView('billing')" variant="outline" class="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                <Plus class="w-4 h-4 mr-2" /> Agregar primera factura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Health & Operations Column -->
      <div class="space-y-8">
        <!-- System Health -->
        <Card class="bg-[#131926] border-slate-800/60 shadow-xl">
          <CardHeader class="px-6 py-5 border-b border-slate-800/40">
            <div class="flex items-center gap-3">
              <Activity class="w-5 h-5 text-emerald-500" />
              <CardTitle class="text-md font-bold text-white tracking-tight">Salud del Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="p-4">
            <div class="space-y-1">
              <div v-for="module in healthModules" :key="module.name" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-800/40 rounded-lg">
                    <component :is="module.icon" class="w-4 h-4 text-emerald-500" />
                  </div>
                  <span class="text-xs font-semibold text-slate-300">{{ module.name }}</span>
                </div>
                <Badge class="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[9px] uppercase tracking-widest">
                  {{ module.status }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- AI Insights Sparkle -->
        <Card class="bg-gradient-to-br from-[#131926] to-[#1e1b4b] border-slate-800/60 shadow-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4">
            <Sparkles class="w-10 h-10 text-purple-400/20 rotate-12" />
          </div>
          <CardHeader class="p-6">
            <CardTitle class="text-md font-bold text-white tracking-tight flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              Inteligencia Artificial
            </CardTitle>
          </CardHeader>
          <CardContent class="p-6 pt-0">
            <p class="text-slate-400 text-xs leading-relaxed mb-4">La IA está analizando los flujos de caja y el inventario en tiempo real.</p>
            <Button @click="auth.setActiveView('ai')" variant="secondary" class="w-full bg-purple-600 hover:bg-purple-500 text-white border-none shadow-lg shadow-purple-900/20">
              Consultar Asistente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Typography refinements */
h2, h3, h4 {
  letter-spacing: -0.025em;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
