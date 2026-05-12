<script setup>
import { ref, onMounted, computed } from 'vue'
import { businessApi } from '../../services/businessApi'
import { formatDate } from '../../utils/ui'

const stats = ref(null)
const loading = ref(true)
const activeSubView = ref('tenants')
const tenants = ref([])
const globalUsers = ref([])
const logs = ref([])

const fetchAdminData = async () => {
  loading.value = true
  try {
    const [s, t, u, l] = await Promise.all([
      businessApi.getAdminStats(),
      businessApi.getAdminTenants(),
      businessApi.getAdminUsers(),
      businessApi.getAdminLogs(),
    ])
    stats.value = s
    tenants.value = t
    globalUsers.value = u
    logs.value = l
  } catch (error) {
    console.error('Error fetching admin data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAdminData)

const statCards = computed(() => [
  { label: 'Empresas Activas', value: stats.value?.totalTenants || 0, icon: 'business', color: 'blue' },
  { label: 'Usuarios Globales', value: stats.value?.totalUsers || 0, icon: 'people', color: 'purple' },
  { label: 'Facturas Emitidas', value: stats.value?.totalInvoices || 0, icon: 'description', color: 'green' },
  { label: 'Movimientos', value: stats.value?.totalMovements || 0, icon: 'swap_horiz', color: 'orange' },
])
</script>

<template>
  <div class="admin-console">
    <header class="admin-header">
      <div class="header-content">
        <h1>Consola de Administración</h1>
        <p class="subtitle">Gestión de infraestructura y control global del sistema</p>
      </div>
      <div class="system-badge" :class="stats?.systemStatus">
        <span class="dot"></span>
        {{ stats?.systemStatus === 'healthy' ? 'Sistema Saludable' : 'Atención Requerida' }}
        <span class="version">v{{ stats?.version }}</span>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos maestros...</p>
    </div>

    <div v-else class="admin-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div v-for="card in statCards" :key="card.label" class="stat-card" :class="card.color">
          <div class="stat-icon">
            <span class="material-icons">{{ card.icon }}</span>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ card.label }}</span>
            <span class="stat-value">{{ card.value }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="admin-tabs">
        <button 
          v-for="tab in ['tenants', 'users', 'logs']" 
          :key="tab"
          :class="['tab-btn', { active: activeSubView === tab }]"
          @click="activeSubView = tab"
        >
          {{ tab === 'tenants' ? 'Empresas (Tenants)' : tab === 'users' ? 'Usuarios Globales' : 'Logs de Auditoría' }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="tab-content">
        <!-- Tenants Table -->
        <div v-if="activeSubView === 'tenants'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Prefijo</th>
                <th>Ubicación</th>
                <th>Usuarios</th>
                <th>Facturas</th>
                <th>Estado DIAN</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tenant in tenants" :key="tenant.id">
                <td>
                  <div class="tenant-name">
                    <div class="tenant-avatar">{{ tenant.name[0] }}</div>
                    <span>{{ tenant.name }}</span>
                  </div>
                </td>
                <td><code class="prefix">{{ tenant.prefix }}</code></td>
                <td>{{ tenant.city || 'No definida' }}</td>
                <td>{{ tenant._count?.memberships }}</td>
                <td>{{ tenant._count?.invoices }}</td>
                <td>
                  <span class="status-pill" :class="tenant.dianStatus">
                    {{ tenant.dianStatus || 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <button class="action-btn-sm">Configurar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Users Table -->
        <div v-else-if="activeSubView === 'users'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Empresas</th>
                <th>Estado</th>
                <th>Último Acceso</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in globalUsers" :key="user.id">
                <td>{{ user.name }} <span v-if="user.isSystemOwner" class="owner-tag">ROOT</span></td>
                <td>{{ user.email }}</td>
                <td>
                  <div class="membership-list">
                    <span v-for="m in user.memberships" :key="m.id" class="m-tag">
                      {{ m.tenant.name }} ({{ m.role }})
                    </span>
                  </div>
                </td>
                <td><span class="status-pill" :class="user.status">{{ user.status }}</span></td>
                <td>{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Logs Table -->
        <div v-else-if="activeSubView === 'logs'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actor</th>
                <th>Entidad</th>
                <th>Acción</th>
                <th>Empresa</th>
                <th>Severidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td class="log-date">{{ formatDate(log.at) }}</td>
                <td>{{ log.actorUser?.name || log.actor }}</td>
                <td>{{ log.entity }}</td>
                <td>{{ log.action }}</td>
                <td>{{ log.tenant?.name || 'Sistema' }}</td>
                <td>
                  <span class="severity-pill" :class="log.severity">{{ log.severity }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-console {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary, #fff);
}

.subtitle {
  color: var(--text-secondary, #94a3b8);
  margin-top: 0.5rem;
}

.system-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 500;
}

.system-badge.healthy { color: #10b981; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.version { opacity: 0.5; font-size: 0.75rem; margin-left: 0.5rem; }

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--card-bg, #1e293b);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s;
}

.stat-card:hover { transform: translateY(-2px); }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.stat-card.blue .stat-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.stat-card.purple .stat-icon { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
.stat-card.green .stat-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.stat-card.orange .stat-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 0.875rem; color: var(--text-secondary); }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #fff; }

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.tab-btn.active { background: #3b82f6; color: #fff; }

/* Table */
.table-container {
  background: var(--card-bg, #1e293b);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.admin-table th {
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.admin-table td {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.875rem;
}

.tenant-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tenant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}

.prefix {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-pill, .severity-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.severity-pill.info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.severity-pill.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.owner-tag {
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.m-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-right: 0.4rem;
}

.action-btn-sm {
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
}

.action-btn-sm:hover { background: rgba(255, 255, 255, 0.05); }

.log-date {
  font-family: monospace;
  opacity: 0.7;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
