<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useAiStore } from '../../stores/aiStore'
import { useBillingStore } from '../../stores/billingStore'
import { usePurchasesStore } from '../../stores/purchasesStore'
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
  ShieldCheck,
  TrendingDown,
  Zap,
  ShoppingCart,
  UserPlus,
  BookOpen
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const auth = useAuthStore()
const billing = useBillingStore()
const purchases = usePurchasesStore()
const inventory = useInventoryStore()
const ai = useAiStore()
const users = useUsersStore()
const { formatCOP, formatCompact, safeLength } = useDashboardStats()

// Defensive calculations
const totalRevenue = computed(() => {
  const invoices = billing.tenantInvoices || []
  return invoices.reduce((sum, inv) => sum + (inv?.total || 0), 0)
})

const totalExpenses = computed(() => {
  const ps = purchases.tenantPurchases || []
  return ps.reduce((sum, p) => sum + (p?.total || 0), 0)
})

const netProfit = computed(() => totalRevenue.value - totalExpenses.value)

const thisMonthExpenses = computed(() => {
  const ps = purchases.tenantPurchases || []
  const now = new Date()
  return ps
    .filter((p) => {
      const d = new Date(p?.issuedAt || p?.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + (p?.total || 0), 0)
})

const lowStockCount = computed(() => {
  const products = inventory.tenantProducts || []
  return products.filter(p => (p?.stock || 0) <= (p?.minStock || 0)).length
})

const activeUsersCount = computed(() => {
  const allUsers = users.users || []
  return allUsers.filter(u => u?.status === 'active').length
})

const cashFlowData = computed(() => {
  const now = new Date()
  const months = []
  const inflows = []
  const outflows = []
  const invoices = billing.tenantInvoices || []
  const ps = purchases.tenantPurchases || []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.toLocaleString('es-CO', { month: 'short' }))
    inflows.push(
      invoices.reduce((sum, inv) => {
        const dt = new Date(inv?.issuedAt || inv?.createdAt)
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear()
          ? sum + (inv?.total || 0) : sum
      }, 0)
    )
    outflows.push(
      ps.reduce((sum, p) => {
        const dt = new Date(p?.issuedAt || p?.createdAt)
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear()
          ? sum + (p?.total || 0) : sum
      }, 0)
    )
  }

  if (inflows.every(v => v === 0) && outflows.every(v => v === 0)) return null

  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        data: inflows,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.10)',
        fill: true,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Gastos',
        data: outflows,
        borderColor: '#F87171',
        backgroundColor: 'rgba(248,113,113,0.08)',
        fill: true,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }
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
      borderColor: '#2563EB',
      backgroundColor: (context) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.20)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
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
    title: 'Ingresos Totales',
    value: formatCOP(totalRevenue.value),
    icon: TrendingUp,
    trend: 'Ventas acumuladas',
    trendOk: true
  },
  {
    title: 'Gastos del Mes',
    value: formatCOP(thisMonthExpenses.value),
    icon: TrendingDown,
    trend: thisMonthExpenses.value > 0 ? 'Compras registradas' : 'Sin gastos',
    trendOk: thisMonthExpenses.value === 0
  },
  {
    title: 'Utilidad Neta',
    value: formatCOP(netProfit.value),
    icon: DollarSign,
    trend: netProfit.value >= 0 ? 'Positiva' : 'Negativa',
    trendOk: netProfit.value >= 0
  },
  {
    title: 'Inventario Crítico',
    value: lowStockCount.value === 0 ? 'Normal' : lowStockCount.value,
    icon: Package,
    trend: lowStockCount.value > 0 ? 'Requiere acción' : 'Optimizado',
    trendOk: lowStockCount.value === 0
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
      <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 mb-1">Resumen ejecutivo</p>
      <h2 class="text-2xl font-black text-slate-100 tracking-tight mb-0.5">Panel de Control</h2>
      <p class="text-slate-500 text-sm">Visualización de métricas críticas y salud operativa.</p>
    </div>

    <!-- KPI Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <Card v-for="kpi in kpis" :key="kpi.title" class="bg-[#1E293B] border border-blue-500/15 shadow-none overflow-hidden group hover:border-blue-500/35 transition-all duration-200">
        <div class="p-5">
          <div class="flex justify-between items-start mb-5">
            <div :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300', kpi.trendOk ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400']">
              <TrendingUp v-if="kpi.icon === TrendingUp" class="w-4 h-4" />
              <TrendingDown v-else-if="kpi.icon === TrendingDown" class="w-4 h-4" />
              <DollarSign v-else-if="kpi.icon === DollarSign" class="w-4 h-4" />
              <Package v-else class="w-4 h-4" />
            </div>
            <span :class="[
              'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest',
              kpi.trendOk
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                : 'bg-rose-900/30 text-rose-300 border border-rose-700/30'
            ]">
              {{ kpi.trend }}
            </span>
          </div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 mb-1.5">{{ kpi.title }}</p>
          <h3 class="text-2xl font-black text-slate-100 tracking-tight">{{ kpi.value }}</h3>
        </div>
      </Card>
    </div>

    <!-- Accesos Rápidos -->
    <div class="mb-6">
      <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-3">Accesos rápidos</p>
      <div class="flex flex-wrap gap-3">
        <button
          @click="auth.setActiveView('billing')"
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/30"
        >
          <Plus class="w-3.5 h-3.5" /> Nueva Factura
        </button>
        <button
          @click="auth.setActiveView('purchases')"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <ShoppingCart class="w-3.5 h-3.5 text-blue-400" /> Nueva Compra
        </button>
        <button
          @click="auth.setActiveView('third-parties')"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <UserPlus class="w-3.5 h-3.5 text-blue-400" /> Nuevo Tercero
        </button>
        <button
          @click="auth.setActiveView('accounting')"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          <BookOpen class="w-3.5 h-3.5 text-blue-400" /> Ver Contabilidad
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Column -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Flujo de Caja -->
        <Card class="bg-[#1E293B] border border-blue-500/15 shadow-none flex flex-col">
          <CardHeader class="px-6 pt-6 pb-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 mb-1">Proyección de Caja</p>
                <CardTitle class="text-base font-bold text-slate-100 tracking-tight">Flujo de Caja — Entradas vs Salidas</CardTitle>
              </div>
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1.5 text-[10px] text-slate-500"><span class="w-2.5 h-0.5 rounded bg-blue-500 inline-block"></span>Ingresos</span>
                <span class="flex items-center gap-1.5 text-[10px] text-slate-500"><span class="w-2.5 h-0.5 rounded bg-red-400 inline-block"></span>Gastos</span>
              </div>
            </div>
          </CardHeader>
          <CardContent class="px-6 pb-6 flex-grow flex flex-col justify-center">
            <div v-if="cashFlowData" class="h-[220px]">
              <BusinessChart
                type="line"
                :data="cashFlowData"
                :options="{
                  scales: {
                    y: {
                      grid: { color: 'rgba(148, 163, 184, 0.04)' },
                      ticks: { color: '#64748B', font: { family: 'Inter, Geist, system-ui, sans-serif', size: 10 }, callback: (v) => formatCompact(v) }
                    },
                    x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Inter, Geist, system-ui, sans-serif', size: 10 } } }
                  },
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false
                }"
              />
            </div>
            <div v-else class="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <Zap class="w-8 h-8 text-slate-700" />
              <p class="text-slate-500 text-xs">Sin movimientos para mostrar el flujo de caja.</p>
            </div>
          </CardContent>
        </Card>

        <!-- Tendencia Ingresos -->
        <Card class="bg-[#1E293B] border border-blue-500/15 shadow-none flex flex-col">
          <CardHeader class="px-6 pt-6 pb-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500 mb-1">Métricas de Desempeño</p>
                <CardTitle class="text-base font-bold text-slate-100 tracking-tight">Tendencia de Ingresos Mensuales</CardTitle>
              </div>
              <div class="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp class="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent class="px-6 pb-6 flex-grow flex flex-col justify-center">
            <div v-if="revenueTrendData" class="h-[200px]">
              <BusinessChart 
                type="line" 
                :data="revenueTrendData" 
                :options="{ 
                  scales: {
                    y: { 
                      grid: { color: 'rgba(148, 163, 184, 0.04)' },
                      ticks: { color: '#64748B', font: { family: 'Inter, Geist, system-ui, sans-serif', size: 10 }, callback: (v) => formatCompact(v) } 
                    },
                    x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Inter, Geist, system-ui, sans-serif', size: 10 } } }
                  },
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false
                }" 
              />
            </div>
            <div v-else class="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div class="w-14 h-14 bg-[#0F172A]/80 rounded-2xl flex items-center justify-center">
                <BarChart3 class="w-7 h-7 text-slate-600" />
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-300 tracking-tight">Sin historial de ingresos</h4>
                <p class="text-slate-500 text-xs max-w-[260px] mx-auto mt-1.5">Agrega facturas para visualizar tendencias financieras.</p>
              </div>
              <Button @click="auth.setActiveView('billing')" variant="outline" class="border-blue-500/25 text-blue-400 hover:bg-blue-500/10 text-xs">
                <Plus class="w-3.5 h-3.5 mr-1.5" /> Agregar primera factura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Health & Operations Column -->
      <div class="space-y-5">
        <!-- System Health -->
        <Card class="bg-[#1E293B] border border-blue-500/15 shadow-none">
          <CardHeader class="px-5 py-4 border-b border-blue-500/10">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity class="w-3.5 h-3.5 text-blue-400" />
              </div>
              <CardTitle class="text-sm font-bold text-slate-100 tracking-tight">Salud del Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="p-3">
            <div class="space-y-0.5">
              <div v-for="module in healthModules" :key="module.name" class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#0F172A]/50 transition-colors">
                <div class="flex items-center gap-2.5">
                  <div class="w-6 h-6 bg-blue-500/10 rounded-md flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 v-if="module.name !== 'Cifrado de Datos AES-256'" class="w-3 h-3 text-blue-400" />
                    <ShieldCheck v-else class="w-3 h-3 text-blue-400" />
                  </div>
                  <span class="text-[11px] font-medium text-slate-400">{{ module.name }}</span>
                </div>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {{ module.status }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- AI Card -->
        <Card class="bg-[#1E293B] border border-blue-500/15 shadow-none relative overflow-hidden">
          <div class="absolute top-2 right-3 pointer-events-none">
            <Sparkles class="w-12 h-12 text-blue-500 opacity-[0.07] rotate-12" />
          </div>
          <CardHeader class="px-5 pt-5 pb-3">
            <CardTitle class="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Inteligencia Artificial
            </CardTitle>
          </CardHeader>
          <CardContent class="px-5 pb-5 pt-0">
            <p class="text-slate-500 text-xs leading-relaxed mb-4">La IA analiza flujos de caja e inventario en tiempo real.</p>
            <Button @click="auth.setActiveView('ai')" variant="default" class="w-full bg-blue-600 hover:bg-blue-700 text-white border-none text-xs font-semibold shadow-lg shadow-blue-900/40">
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
