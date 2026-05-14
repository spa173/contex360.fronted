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

const receivable = computed(() =>
  billing.tenantInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
)

const lowStockProducts = computed(() =>
  inventory.tenantProducts.filter((product) => product.stock <= product.minStock),
)

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
      '#4b5563', // Borrador (Gris oscuro)
      '#06b6d4', // Emitida (Cian)
      '#f59e0b', // Enviada (Ambar)
      '#10b981', // Aceptada (Esmeralda)
      '#f43f5e'  // Rechazada (Coral)
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
    
    // Sum invoices for this month/year
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
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: 'start',
      borderWidth: 2.5,
      pointBackgroundColor: '#020617',
      pointBorderColor: '#3B82F6',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
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
      backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#f43f5e', '#a78bfa'],
      borderRadius: 6,
      borderWidth: 0
    }]
  }
})
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <div class="dashboard-grid">
      <Card class="bg-[#131926] border border-slate-800/60 rounded-xl px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30">
        <CardHeader class="pb-4">
          <p class="text-slate-500 font-medium text-sm uppercase tracking-wider">Control operativo</p>
          <CardTitle class="text-slate-50 font-bold text-2xl">Alertas y prioridades</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="lowStockProducts.length" class="grid gap-3">
            <div v-for="product in lowStockProducts.slice(0, 4)" :key="product.id" class="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-3 border border-slate-700/30">
              <div>
                <p class="text-slate-300 font-medium">{{ product.name }}</p>
                <p class="text-slate-500 text-sm">SKU {{ product.sku }} - minimo {{ product.minStock }}</p>
              </div>
              <Badge class="bg-rose-500/15 text-rose-500 border-none">Stock {{ product.stock }}</Badge>
            </div>
          </div>
          <p v-else class="text-slate-500 text-sm">
            No hay alertas activas. El inventario esta por encima del minimo configurado.
          </p>
        </CardContent>
      </Card>

      <Card class="bg-[#131926] border border-slate-800/60 rounded-xl px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30">
        <CardHeader class="pb-4">
          <p class="text-slate-500 font-medium text-sm uppercase tracking-wider">Logistica</p>
          <CardTitle class="text-slate-50 font-bold text-2xl">Valor del Stock por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
           <BusinessChart 
             type="bar" 
             :data="stockValueData" 
             :options="{ 
               indexAxis: 'y',
               scales: { x: { ticks: { callback: (v) => '$' + v.toLocaleString() } } },
               plugins: { legend: { display: false } }
             }" 
           />
        </CardContent>
      </Card>

      <Card class="bg-[#131926] border border-slate-800/60 rounded-xl px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30 col-span-2">
        <CardHeader class="pb-4">
          <p class="text-slate-500 font-medium text-sm uppercase tracking-wider">Desempeño</p>
          <CardTitle class="text-slate-50 font-bold text-2xl">Tendencia de Ventas (Ultimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
           <BusinessChart 
             type="line" 
             :data="revenueTrendData" 
             :options="{ 
               scales: {
                 y: { beginAtZero: true, ticks: { callback: (v) => '$' + v.toLocaleString() } }
               },
               plugins: { legend: { display: false } },
               tension: 0.4
             }" 
           />
        </CardContent>
      </Card>

      <Card class="bg-[#131926] border border-slate-800/60 rounded-xl px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30">
        <CardHeader class="pb-4">
          <p class="text-slate-500 font-medium text-sm uppercase tracking-wider">Cumplimiento</p>
          <CardTitle class="text-slate-50 font-bold text-2xl">Pipeline DIAN</CardTitle>
        </CardHeader>
        <CardContent>
           <BusinessChart 
             type="doughnut" 
             :data="pipelineChartData" 
             :options="{ 
               plugins: { 
                 legend: { position: 'bottom' } 
               },
               cutout: '70%'
             }" 
           />
        </CardContent>
      </Card>

      <Card class="bg-[#131926] border border-slate-800/60 rounded-xl px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30">
        <CardHeader class="pb-4">
          <p class="text-slate-500 font-medium text-sm uppercase tracking-wider">Resumen</p>
          <CardTitle class="text-slate-50 font-bold text-2xl">Estado de modulos</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-3">
          <div v-for="[name, status, note] in moduleRows" :key="name" class="flex items-center justify-between bg-slate-800/30 rounded-lg px-4 py-3 border border-slate-700/30">
            <div>
              <p class="text-slate-300 font-medium">{{ name }}</p>
              <p class="text-slate-500 text-sm">{{ note }}</p>
            </div>
            <Badge variant="outline" class="border-slate-600 text-slate-400">{{ status }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-[#131926] border border-slate-800/60 rounded-xl px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30">
        <CardHeader class="pb-4">
          <p class="text-slate-500 font-medium text-sm uppercase tracking-wider">Actividad reciente</p>
          <CardTitle class="text-slate-50 font-bold text-2xl">Bitacora del tenant</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="users.auditEvents.length" class="grid gap-3">
            <div v-for="event in users.auditEvents.slice(0, 4)" :key="event.id" class="bg-slate-800/30 rounded-lg px-4 py-3 border border-slate-700/30">
              <div class="flex items-center justify-between mb-1">
                <strong class="text-slate-300 font-medium">{{ event.action }} - {{ event.entity }}</strong>
                <span class="text-slate-500 text-sm">{{ formatDate(event.at) }}</span>
              </div>
              <p class="text-slate-400 text-sm">{{ event.description }}</p>
              <p class="text-slate-500 text-sm mt-1">Actor: {{ event.actor }}</p>
            </div>
          </div>
          <p v-else class="text-slate-500 text-sm">Todavia no hay actividad registrada en este tenant.</p>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
