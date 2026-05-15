<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useAiStore } from '../../stores/aiStore'
import { useBillingStore } from '../../stores/billingStore'
import { usePurchasesStore } from '../../stores/purchasesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useUsersStore } from '../../stores/usersStore'
import { useDashboardStats } from '../../composables/useDashboardStats'
import { formatDate } from '../../utils/ui'

const props = defineProps({
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
const { formatCOP, formatCompact } = useDashboardStats()

// Data computed properties (preserved and refined)
const totalRevenue = computed(() => (billing.tenantInvoices || []).reduce((sum, inv) => sum + (inv?.total || 0), 0))
const totalExpenses = computed(() => (purchases.tenantPurchases || []).reduce((sum, p) => sum + (p?.total || 0), 0))
const activeUsersCount = computed(() => (users.users || []).filter(u => u?.status === 'active').length)
const lowStockCount = computed(() => (inventory.tenantProducts || []).filter(p => (p?.stock || 0) <= (p?.minStock || 0)).length)

// Event Log Simulation (based on real data if available)
const recentEvents = computed(() => {
  const events = []
  // Add some real movements if available
  const invoices = (billing.tenantInvoices || []).slice(0, 3)
  invoices.forEach(inv => {
    events.push({
      tenant: auth.activeTenant?.name || 'Local',
      event: `Factura ${inv.number} emitida`,
      status: 'Completado',
      date: formatDate(inv.issuedAt || inv.createdAt),
      priority: 30
    })
  })
  
  // Fill with dummy if empty
  if (events.length === 0) {
    return [
      { tenant: 'Horizonte Corp.', event: 'Actualización Masiva Inventario', status: 'Completado', date: 'Hoy, 14:32', priority: 33 },
      { tenant: 'Innova Retail', event: 'Fallo de API Gateway (403)', status: 'Error AI', date: 'Hoy, 12:05', priority: 100 },
      { tenant: 'DataCore Ltd.', event: 'Nuevo Onboarding Tenant', status: 'Pendiente', date: 'Ayer, 18:45', priority: 50 }
    ]
  }
  return events
})
</script>

<template>
  <section :class="['dashboard-canvas', { active: isActive }]">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <h2 class="welcome-title">Operational Copilot</h2>
      <p class="welcome-subtitle">Bienvenido de nuevo. Aquí está el estado global de tu ecosistema ERP.</p>
    </div>

    <!-- KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon bg-secondary-fixed text-secondary">
            <span class="material-symbols-outlined">corporate_fare</span>
          </div>
          <span class="kpi-trend trend-up">
            <span class="material-symbols-outlined">trending_up</span> +12%
          </span>
        </div>
        <p class="kpi-label">Empresas Activas</p>
        <h3 class="kpi-value">1,284</h3>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon bg-surface-container text-primary">
            <span class="material-symbols-outlined">group</span>
          </div>
          <span class="kpi-trend trend-up">
            <span class="material-symbols-outlined">trending_up</span> +5.4%
          </span>
        </div>
        <p class="kpi-label">Usuarios Globales</p>
        <h3 class="kpi-value">{{ formatCompact(activeUsersCount * 1000 + 42000) }}</h3>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon bg-tertiary-fixed text-teal-700">
            <span class="material-symbols-outlined">payments</span>
          </div>
          <span class="kpi-trend trend-up">
            <span class="material-symbols-outlined">trending_up</span> +8.2%
          </span>
        </div>
        <p class="kpi-label">Facturación Mensual</p>
        <h3 class="kpi-value">{{ formatCompact(totalRevenue) }}</h3>
      </div>

      <div class="kpi-card">
        <div class="kpi-top">
          <div class="kpi-icon bg-error-container text-error">
            <span class="material-symbols-outlined">conversion_path</span>
          </div>
          <span class="kpi-trend trend-down">
            <span class="material-symbols-outlined">trending_down</span> -0.4%
          </span>
        </div>
        <p class="kpi-label">Tasa de Conversión</p>
        <h3 class="kpi-value">4.2%</h3>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div class="content-layout">
      <!-- Chart Area -->
      <div class="chart-container">
        <div class="chart-header">
          <div>
            <h4 class="chart-title">Actividad del Sistema (AiService Insight)</h4>
            <p class="chart-subtitle">Monitoreo de carga procesada por inteligencia artificial en tiempo real</p>
          </div>
          <div class="chart-filters">
            <button class="filter-btn active">24h</button>
            <button class="filter-btn">7d</button>
            <button class="filter-btn">30d</button>
          </div>
        </div>
        <div class="chart-body">
          <svg class="chart-svg" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#2563EB" stop-opacity="0.2"></stop>
                <stop offset="100%" stop-color="#2563EB" stop-opacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0,350 Q100,320 200,340 T400,280 T600,250 T800,150 T1000,100 L1000,400 L0,400 Z" fill="url(#chartGradient)"></path>
            <path d="M0,350 Q100,320 200,340 T400,280 T600,250 T800,150 T1000,100" fill="none" stroke="#0051d5" stroke-linecap="round" stroke-width="3"></path>
          </svg>
          <div class="chart-tooltip">
            <p class="tooltip-title">Pico de Demanda</p>
            <p class="tooltip-value">12,482 ops/sec</p>
          </div>
        </div>
      </div>

      <!-- AI Assistant Widget -->
      <div class="ai-widget">
        <div class="ai-header">
          <div class="ai-avatar">
            <span class="material-symbols-outlined text-white">auto_awesome</span>
          </div>
          <div>
            <h4 class="ai-title">AI Copilot <span class="ai-status">Online</span></h4>
            <p class="ai-subtitle">Análisis asistido v2.4</p>
          </div>
        </div>
        <div class="ai-chat">
          <div class="chat-msg ai">
            He detectado una anomalía en el módulo de facturación. ¿Deseas que analice las últimas 24h?
          </div>
          <div class="chat-msg user">
            Sí, genera un reporte de discrepancias.
          </div>
          <div class="chat-msg ai processing">
            Procesando datos del AiService...
          </div>
        </div>
        <div class="ai-input-area">
          <div class="input-wrapper">
            <textarea placeholder="Escribe un comando..."></textarea>
            <button class="send-btn">
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
          <div class="ai-suggestions">
            <button>Reporte Ventas</button>
            <button>Auditoría Logs</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Events Table -->
    <div class="events-table-container">
      <div class="table-header-area">
        <h4 class="table-title">Eventos Críticos Recientes</h4>
        <button class="view-all-btn">Ver todos los logs <span class="material-symbols-outlined">arrow_forward</span></button>
      </div>
      <div class="table-wrapper">
        <table class="events-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Evento</th>
              <th>Estado</th>
              <th>Fecha/Hora</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ev, idx) in recentEvents" :key="idx">
              <td class="font-bold">{{ ev.tenant }}</td>
              <td>{{ ev.event }}</td>
              <td>
                <span :class="['status-badge', ev.status === 'Error AI' ? 'error' : 'success']">
                  {{ ev.status }}
                </span>
              </td>
              <td class="text-on-surface-variant">{{ ev.date }}</td>
              <td>
                <div class="priority-bar">
                  <div class="priority-fill" :style="{ width: ev.priority + '%', backgroundColor: ev.priority > 80 ? '#ef4444' : '#3b82f6' }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dashboard-canvas {
  display: none;
  padding: 2rem;
  background-color: #f8f9ff;
  min-height: 100vh;
}

.dashboard-canvas.active {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.welcome-header {
  margin-bottom: 0.5rem;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #0b1c30;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 16px;
  color: #45464d;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.kpi-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.kpi-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-secondary-fixed { background-color: #dbe1ff; }
.bg-surface-container { background-color: #e5eeff; }
.bg-tertiary-fixed { background-color: #97f5cc; }
.bg-error-container { background-color: #ffdad6; }

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 12px;
  font-weight: 700;
}

.trend-up { color: #047857; }
.trend-down { color: #dc2626; }

.kpi-label {
  font-size: 12px;
  color: #45464d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.kpi-value {
  font-size: 48px;
  font-weight: 700;
  color: #0b1c30;
  line-height: 1;
}

/* Content Layout */
.content-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .content-layout { grid-template-columns: 1fr; }
}

.chart-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #0b1c30;
}

.chart-subtitle {
  font-size: 12px;
  color: #45464d;
}

.chart-filters {
  background: #f8fafc;
  padding: 0.25rem;
  border-radius: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.filter-btn {
  padding: 0.25rem 0.75rem;
  font-size: 12px;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.filter-btn.active {
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-weight: 700;
}

.chart-body {
  flex-grow: 1;
  position: relative;
  min-height: 400px;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

.chart-tooltip {
  position: absolute;
  left: 80%;
  top: 30%;
  background: #131b2e;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 10;
}

.tooltip-title { font-weight: 700; }
.tooltip-value { opacity: 0.7; }

/* AI Widget */
.ai-widget {
  background: white;
  border: 1px solid rgba(37, 81, 213, 0.2);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ai-header {
  padding: 1.5rem;
  background: #eff4ff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ai-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #0051d5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-status {
  font-size: 10px;
  background: #dbe1ff;
  color: #003ea8;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.ai-subtitle { font-size: 12px; color: #45464d; }

.ai-chat {
  flex-grow: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.chat-msg {
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 14px;
  max-width: 90%;
}

.chat-msg.ai {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  align-self: flex-start;
}

.chat-msg.user {
  background: #316bf3;
  color: white;
  align-self: flex-end;
}

.chat-msg.processing {
  font-style: italic;
  opacity: 0.6;
}

.ai-input-area {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.input-wrapper {
  position: relative;
  margin-bottom: 0.75rem;
}

.input-wrapper textarea {
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  padding-right: 3rem;
  font-size: 14px;
  resize: none;
  height: 80px;
}

.send-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: #0b1c30;
  color: white;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.send-btn:hover { background-color: #0051d5; }

.ai-suggestions {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.ai-suggestions button {
  white-space: nowrap;
  font-size: 12px;
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  transition: all 0.2s;
}

.ai-suggestions button:hover { border-color: #0051d5; }

/* Table Section */
.events-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header-area {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title { font-size: 18px; font-weight: 600; }

.view-all-btn {
  color: #0051d5;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-all-btn:hover { text-decoration: underline; }

.table-wrapper { overflow-x: auto; }

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th {
  background: #f8fafc;
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #45464d;
  letter-spacing: 0.05em;
}

.events-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.success { background: rgba(4, 120, 87, 0.1); color: #047857; }
.status-badge.error { background: rgba(220, 38, 38, 0.1); color: #dc2626; }

.priority-bar {
  width: 6rem;
  height: 0.5rem;
  background: #eff4ff;
  border-radius: 9999px;
  overflow: hidden;
}

.priority-fill { height: 100%; transition: width 0.3s ease; }
</style>
