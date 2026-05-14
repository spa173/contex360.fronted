<script setup>
import { computed } from 'vue'
import { useAiStore } from '../../stores/aiStore'
import { useBillingStore } from '../../stores/billingStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useUsersStore } from '../../stores/usersStore'
import { formatCurrency, formatDate, moduleRows } from '../../utils/ui'
import BusinessChart from '../analytics/BusinessChart.vue'

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
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      fill: 'start',
      borderWidth: 2.5,
      pointBackgroundColor: '#15232D',
      pointBorderColor: '#10b981',
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
      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Control operativo</p>
            <h3>Alertas y prioridades</h3>
          </div>
        </div>
        <div v-if="lowStockProducts.length" class="list-grid">
          <div v-for="product in lowStockProducts.slice(0, 4)" :key="product.id" class="alert-row">
            <div>
              <p>{{ product.name }}</p>
              <p class="label-soft">SKU {{ product.sku }} - minimo {{ product.minStock }}</p>
            </div>
            <span class="status-badge status-danger">Stock {{ product.stock }}</span>
          </div>
        </div>
        <p v-else class="empty-state">
          No hay alertas activas. El inventario esta por encima del minimo configurado.
        </p>
      </article>

      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Logistica</p>
            <h3>Valor del Stock por Categoria</h3>
          </div>
        </div>
        <div class="list-grid">
           <BusinessChart 
             type="bar" 
             :data="stockValueData" 
             :options="{ 
               indexAxis: 'y',
               scales: { x: { ticks: { callback: (v) => '$' + v.toLocaleString() } } },
               plugins: { legend: { display: false } }
             }" 
           />
        </div>
      </article>

      <article class="panel-card" style="grid-column: span 2;">
        <div class="card-head">
          <div>
            <p class="eyebrow">Desempeño</p>
            <h3>Tendencia de Ventas (Ultimos 6 meses)</h3>
          </div>
        </div>
        <div class="list-grid">
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
        </div>
      </article>

      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Cumplimiento</p>
            <h3>Pipeline DIAN</h3>
          </div>
        </div>
        <div class="list-grid">
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
        </div>
      </article>

      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Resumen</p>
            <h3>Estado de modulos</h3>
          </div>
        </div>
        <div class="list-grid">
          <div v-for="[name, status, note] in moduleRows" :key="name" class="module-row">
            <div>
              <p>{{ name }}</p>
              <p class="label-soft">{{ note }}</p>
            </div>
            <span class="small-pill">{{ status }}</span>
          </div>
        </div>
      </article>

      <article class="panel-card">
        <div class="card-head">
          <div>
            <p class="eyebrow">Actividad reciente</p>
            <h3>Bitacora del tenant</h3>
          </div>
        </div>
        <div v-if="users.auditEvents.length" class="activity-list">
          <div v-for="event in users.auditEvents.slice(0, 4)" :key="event.id" class="activity-item">
            <div class="activity-header">
              <strong>{{ event.action }} - {{ event.entity }}</strong>
              <span class="label-soft">{{ formatDate(event.at) }}</span>
            </div>
            <p>{{ event.description }}</p>
            <p class="label-soft">Actor: {{ event.actor }}</p>
          </div>
        </div>
        <p v-else class="empty-state">Todavia no hay actividad registrada en este tenant.</p>
      </article>
    </div>
  </section>
</template>
