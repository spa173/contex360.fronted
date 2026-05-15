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
      borderColor: '#AC8C49',
      backgroundColor: (context) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(172, 140, 73, 0.18)');
        gradient.addColorStop(1, 'rgba(172, 140, 73, 0)');
        return gradient;
      },
      fill: 'start',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 5
    }]
  }
})

const kpis = computed(() => [
  {
    title: 'Revenue Total',
    value: formatCOP(totalRevenue.value),
    icon: DollarSign,
    color: 'gold',
    trend: '+12.5%',
    trendOk: true
  },
  {
    title: 'Inventario Crítico',
    value: lowStockCount.value === 0 ? 'Normal' : lowStockCount.value,
    icon: Package,
    color: lowStockCount.value > 0 ? 'warn' : 'gold',
    trend: lowStockCount.value > 0 ? 'Requiere acción' : 'Optimizado',
    trendOk: lowStockCount.value === 0
  },
  {
    title: 'Usuarios Activos',
    value: activeUsersCount.value,
    icon: UsersIcon,
    color: 'gold',
    trend: 'En línea',
    trendOk: true
  },
  {
    title: 'Salud del Sistema',
    value: '99.9%',
    icon: Activity,
    color: 'gold',
    trend: 'Estable',
    trendOk: true
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
  <section :class="['view', { active: isActive }, 'bg-[var(--bg)]', 'min-h-screen']">
    <!-- Header -->
    <div class="mb-6">
      <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#AC8C49] mb-1">Resumen ejecutivo</p>
      <h2 class="text-2xl font-black text-[#F5EDDC] tracking-tight mb-0.5">Panel de Control</h2>
      <p class="text-[#78694A] text-sm">Visualización de métricas críticas y salud operativa.</p>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <Card v-for="kpi in kpis" :key="kpi.title" class="bg-[#454138] border border-[#AC8C49]/15 shadow-none overflow-hidden group hover:border-[#AC8C49]/35 transition-all duration-200">
        <div class="p-5">
          <div class="flex justify-between items-start mb-5">
            <div class="w-9 h-9 rounded-xl bg-[#AC8C49]/12 text-[#AC8C49] flex items-center justify-center transition-all duration-300">
              <DollarSign v-if="kpi.icon === DollarSign" class="w-4 h-4" />
              <Package v-else-if="kpi.icon === Package" class="w-4 h-4" />
              <UsersIcon v-else-if="kpi.icon === UsersIcon" class="w-4 h-4" />
              <Activity v-else class="w-4 h-4" />
            </div>
            <span :class="[
              'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest',
              kpi.trendOk
                ? 'bg-[#AC8C49]/12 text-[#E8C97A] border border-[#AC8C49]/25'
                : 'bg-rose-900/30 text-rose-300 border border-rose-700/30'
            ]">
              {{ kpi.trend }}
            </span>
          </div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#78694A] mb-1.5">{{ kpi.title }}</p>
          <h3 class="text-2xl font-black text-[#F5EDDC] tracking-tight">{{ kpi.value }}</h3>
        </div>
      </Card>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Column -->
      <div class="lg:col-span-2">
        <Card class="bg-[#454138] border border-[#AC8C49]/15 shadow-none h-full flex flex-col">
          <CardHeader class="px-6 pt-6 pb-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#AC8C49] mb-1">Métricas de Desempeño</p>
                <CardTitle class="text-base font-bold text-[#F5EDDC] tracking-tight">Tendencia de Ingresos Mensuales</CardTitle>
              </div>
              <div class="w-8 h-8 rounded-xl bg-[#AC8C49]/12 flex items-center justify-center">
                <TrendingUp class="w-4 h-4 text-[#AC8C49]" />
              </div>
            </div>
          </CardHeader>
          <CardContent class="px-6 pb-6 flex-grow flex flex-col justify-center">
            <div v-if="revenueTrendData" class="h-[280px]">
              <BusinessChart 
                type="line" 
                :data="revenueTrendData" 
                :options="{ 
                  scales: {
                    y: { 
                      grid: { color: 'rgba(148, 163, 184, 0.04)' },
                      ticks: { color: '#78694A', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', size: 10 }, callback: (v) => formatCompact(v) } 
                    },
                    x: { grid: { display: false }, ticks: { color: '#78694A', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', size: 10 } } }
                  },
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false
                }" 
              />
            </div>
            <div v-else class="flex flex-col items-center justify-center py-16 text-center space-y-5">
              <div class="w-14 h-14 bg-[#332F28]/80 rounded-2xl flex items-center justify-center">
                <BarChart3 class="w-7 h-7 text-[#78694A]" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-[#B8A98A] tracking-tight">Sin historial de ingresos</h4>
                <p class="text-[#78694A] text-xs max-w-[260px] mx-auto mt-1.5">Agrega facturas para visualizar tendencias financieras.</p>
              </div>
              <Button @click="auth.setActiveView('billing')" variant="outline" class="border-[#AC8C49]/25 text-[#AC8C49] hover:bg-[#AC8C49]/10 text-xs">
                <Plus class="w-3.5 h-3.5 mr-1.5" /> Agregar primera factura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Health & Operations Column -->
      <div class="space-y-5">
        <!-- System Health -->
        <Card class="bg-[#454138] border border-[#AC8C49]/15 shadow-none">
          <CardHeader class="px-5 py-4 border-b border-[#AC8C49]/10">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-[#AC8C49]/12 flex items-center justify-center">
                <Activity class="w-3.5 h-3.5 text-[#AC8C49]" />
              </div>
              <CardTitle class="text-sm font-bold text-[#F5EDDC] tracking-tight">Salud del Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="p-3">
            <div class="space-y-0.5">
              <div v-for="module in healthModules" :key="module.name" class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#332F28]/50 transition-colors">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 bg-[#AC8C49]/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 v-if="module.name !== 'Cifrado de Datos AES-256'" class="w-3 h-3 text-[#AC8C49]" />
                    <ShieldCheck v-else class="w-3 h-3 text-[#AC8C49]" />
                  </div>
                  <span class="text-[11px] font-medium text-[#B8A98A]">{{ module.name }}</span>
                </div>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#AC8C49]/12 text-[#E8C97A] border border-[#AC8C49]/22">
                  {{ module.status }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- AI Card -->
        <Card class="bg-[#454138] border border-[#AC8C49]/15 shadow-none relative overflow-hidden">
          <div class="absolute top-2 right-3 pointer-events-none">
            <Sparkles class="w-12 h-12 text-[#AC8C49] opacity-[0.07] rotate-12" />
          </div>
          <CardHeader class="px-5 pt-5 pb-3">
            <CardTitle class="text-sm font-bold text-[#F5EDDC] tracking-tight flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#AC8C49] animate-pulse"></span>
              Inteligencia Artificial
            </CardTitle>
          </CardHeader>
          <CardContent class="px-5 pb-5 pt-0">
            <p class="text-[#78694A] text-xs leading-relaxed mb-4">La IA analiza flujos de caja e inventario en tiempo real.</p>
            <Button @click="auth.setActiveView('ai')" variant="default" class="w-full bg-[#AC8C49] hover:bg-[#78694A] text-[#1C1710] border-none text-xs font-semibold shadow-lg shadow-black/30">
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
