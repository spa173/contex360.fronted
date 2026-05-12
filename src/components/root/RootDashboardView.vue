<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { getAuthToken } from '../../services/authApi'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const stats = ref<any>(null)
const loading = ref(true)

function getToken() {
  return getAuthToken()
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    stats.value = data
  } catch {
    stats.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="root-dashboard">
    <h2 class="section-title">Dashboard SaaS</h2>
    <p class="section-sub">Vista general de la plataforma Contex360</p>

    <div v-if="loading" class="state-loading">Cargando métricas...</div>

    <div v-else-if="stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">🏢</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalTenants }}</div>
          <div class="stat-label">Empresas totales</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalUsers }}</div>
          <div class="stat-label">Usuarios totales</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">📋</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalDemoRequests }}</div>
          <div class="stat-label">Demos solicitadas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.demoRequestsConverted }}</div>
          <div class="stat-label">Convertidas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">🔄</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.activeTrials }}</div>
          <div class="stat-label">Trials activos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📄</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalInvoices }}</div>
          <div class="stat-label">Facturas emitidas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teal">📦</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalMovements }}</div>
          <div class="stat-label">Movimientos inventario</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber">📬</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.demoRequestsToday }}</div>
          <div class="stat-label">Demos hoy</div>
        </div>
      </div>
    </div>

    <div class="system-status">
      <span class="status-dot"></span>
      Sistema: <strong>{{ stats?.systemStatus || 'desconocido' }}</strong>
      &nbsp;·&nbsp; Versión: {{ stats?.version || '—' }}
    </div>
  </div>
</template>

<style scoped>
.root-dashboard { display: flex; flex-direction: column; gap: 24px; }
.section-title { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0; }
.section-sub { font-size: 0.85rem; color: var(--muted); margin: 4px 0 0; }
.state-loading { color: var(--muted); font-size: 0.9rem; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat-icon {
  width: 44px; height: 44px; border-radius: 11px; font-size: 1.3rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon.green  { background: rgba(16,185,129,0.12); }
.stat-icon.teal   { background: rgba(20,184,166,0.12); }
.stat-icon.amber  { background: rgba(245,158,11,0.12); }
.stat-icon.purple { background: rgba(139,92,246,0.12); }
.stat-icon.blue   { background: rgba(59,130,246,0.12); }

.stat-value { font-size: 1.6rem; font-weight: 700; color: var(--text); line-height: 1; }
.stat-label { font-size: 0.78rem; color: var(--muted); margin-top: 4px; }

.system-status {
  font-size: 0.82rem; color: var(--muted);
  display: flex; align-items: center; gap: 6px;
}
.status-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #10b981;
  box-shadow: 0 0 6px #10b981;
}
</style>
