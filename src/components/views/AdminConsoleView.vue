<script setup>
import { ref, onMounted, computed } from 'vue'
import { businessApi } from '../../services/businessApi'
import { formatDate } from '../../utils/ui'
import TenantSettingsView from '../root/TenantSettingsView.vue'

defineProps({
  isActive: { type: Boolean, default: false },
})

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tenants', label: 'Empresas (Tenants)' },
  { id: 'users', label: 'Usuarios Globales' },
  { id: 'logs', label: 'Logs de Auditoria' },
  { id: 'compliance', label: 'Cumplimiento ISO' },
  { id: 'breach', label: 'Alertas de Brecha' },
  { id: 'demo', label: 'Solicitudes Demo' },
]

const stats = ref(null)
const compliance = ref(null)
const loading = ref(true)
const runningReview = ref(false)
const activeSubView = ref('tenants')
const tenants = ref([])
const globalUsers = ref([])
const logs = ref([])
const breachAlerts = ref([])
const demoRequests = ref([])
const erasingUserId = ref(null)
const notifyingId = ref(null)
const selectedTenantId = ref(null)

const normalizeCompliance = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value
}

const fetchAdminData = async () => {
  loading.value = true
  try {
    const [s, t, u, l, c, b, d] = await Promise.all([
      businessApi.getAdminStats(),
      businessApi.getAdminTenants(),
      businessApi.getAdminUsers(),
      businessApi.getAdminLogs(),
      businessApi.getComplianceDashboard().catch(() => null),
      businessApi.getBreachAlerts().catch(() => []),
      businessApi.getDemoRequests().catch(() => []),
    ])

    stats.value = s
    tenants.value = t
    globalUsers.value = u
    logs.value = l
    compliance.value = normalizeCompliance(c)
    breachAlerts.value = Array.isArray(b) ? b : []
    demoRequests.value = Array.isArray(d) ? d : []
  } catch (error) {
    console.error('Error fetching admin data:', error)
  } finally {
    loading.value = false
  }
}

const eraseUser = async (userId) => {
  if (!confirm('¿Confirmas anonimizar permanentemente los datos de este usuario? Esta accion no se puede deshacer.')) return
  erasingUserId.value = userId
  try {
    await businessApi.eraseUserData(userId)
    globalUsers.value = globalUsers.value.filter((u) => u.id !== userId)
    breachAlerts.value = await businessApi.getBreachAlerts().catch(() => [])
  } catch (err) {
    console.error('Error erasing user:', err)
  } finally {
    erasingUserId.value = null
  }
}

const sendBreachNotification = async (eventId) => {
  notifyingId.value = eventId
  try {
    await businessApi.notifyBreach(eventId)
    breachAlerts.value = await businessApi.getBreachAlerts().catch(() => [])
  } catch (err) {
    console.error('Error sending notification:', err)
  } finally {
    notifyingId.value = null
  }
}

const updateDemoStatus = async (id, newStatus) => {
  try {
    await businessApi.updateDemoRequestStatus(id, newStatus)
    demoRequests.value = await businessApi.getDemoRequests()
  } catch (err) {
    console.error('Error updating demo status:', err)
  }
}

const convertToCustomer = async (id) => {
  if (!confirm('¿Convertir esta solicitud en cliente? Esto creará una empresa, usuario administrador y enviará credenciales por Telegram.')) return
  try {
    await businessApi.convertToCustomer(id)
    demoRequests.value = await businessApi.getDemoRequests()
    alert('Cliente creado exitosamente. Las credenciales fueron enviadas por Telegram.')
  } catch (err) {
    console.error('Error converting to customer:', err)
    alert('Error al convertir en cliente: ' + (err.message || 'Error desconocido'))
  }
}

const executeAccessReview = async () => {
  runningReview.value = true
  try {
    const [updatedCompliance, updatedLogs] = await Promise.all([
      businessApi.runAccessReview().catch(() => null),
      businessApi.getAdminLogs().catch(() => []),
    ])

    compliance.value = normalizeCompliance(updatedCompliance) || compliance.value
    logs.value = updatedLogs
  } catch (error) {
    console.error('Error running access review:', error)
  } finally {
    runningReview.value = false
  }
}

onMounted(fetchAdminData)

const statCards = computed(() => [
  { label: 'Empresas Activas', value: stats.value?.totalTenants || 0, icon: 'business', color: 'blue' },
  { label: 'Usuarios Globales', value: stats.value?.totalUsers || 0, icon: 'people', color: 'purple' },
  { label: 'Facturas Emitidas', value: stats.value?.totalInvoices || 0, icon: 'description', color: 'green' },
  { label: 'Movimientos', value: stats.value?.totalMovements || 0, icon: 'swap_horiz', color: 'orange' },
])

const complianceChecks = computed(() => compliance.value?.complianceChecks ?? [])
const businessContinuityPlan = computed(() => compliance.value?.businessContinuityPlan ?? null)
const accessReview = computed(() => compliance.value?.accessReview ?? null)
const criticalBreaches = computed(() => breachAlerts.value.filter((e) => e.severity === 'critical' || e.severity === 'error'))
</script>

<template>
  <section :class="['view', { active: isActive }]">
  <div class="admin-console">
    <header class="admin-header">
      <div class="header-content">
        <h1>Consola de Administracion</h1>
        <p class="subtitle">Gestion de infraestructura, control global y evidencias de cumplimiento</p>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando datos maestros...</p>
    </div>

    <div v-else class="admin-content">
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

      <div class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeSubView === tab.id }]"
          @click="activeSubView = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeSubView === 'dashboard'" class="dashboard-grid">
          <div class="metric-card">
            <span class="metric-label">Empresas Totales</span>
            <span class="metric-value">{{ stats?.totalTenants || 0 }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Usuarios Totales</span>
            <span class="metric-value">{{ stats?.totalUsers || 0 }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Solicitudes Demo</span>
            <span class="metric-value">{{ stats?.totalDemoRequests || 0 }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Solicitudes Hoy</span>
            <span class="metric-value">{{ stats?.demoRequestsToday || 0 }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Leads Convertidos</span>
            <span class="metric-value">{{ stats?.demoRequestsConverted || 0 }}</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Trials Activos</span>
            <span class="metric-value">{{ stats?.activeTrials || 0 }}</span>
          </div>
        </div>

        <div v-if="activeSubView === 'tenants'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Prefijo</th>
                <th>Ubicacion</th>
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
                  <button class="action-btn-sm" @click="selectedTenantId = tenant.id">⚙️ Configurar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeSubView === 'users'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Empresas</th>
                <th>Estado</th>
                <th>Ultimo Acceso</th>
                <th>Acciones</th>
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
                <td>
                  <button
                    v-if="!user.isSystemOwner"
                    class="erase-btn"
                    :disabled="erasingUserId === user.id"
                    :title="'Derecho al olvido — Ley 1581 Art. 15'"
                    @click="eraseUser(user.id)"
                  >
                    {{ erasingUserId === user.id ? '...' : 'Borrar datos' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeSubView === 'breach'" class="compliance-grid">
          <article class="compliance-card wide">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Ley 1581 · ISO 27001 A.16</p>
                <h3>Alertas de brecha de seguridad</h3>
              </div>
              <span v-if="criticalBreaches.length" class="severity-pill critical">{{ criticalBreaches.length }} criticas</span>
            </div>
            <p class="card-meta" style="margin-bottom:1rem">
              Eventos con severidad <strong>error</strong> o <strong>critical</strong>. Puedes notificar a los administradores del sistema por email.
              Conforme a la Ley 1581, las brechas que afecten datos personales deben notificarse a la SIC dentro de 72 horas.
            </p>
            <div v-if="!breachAlerts.length" class="empty-state">
              <p>Sin alertas de brecha registradas.</p>
            </div>
            <table v-else class="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Severidad</th>
                  <th>Accion</th>
                  <th>Actor</th>
                  <th>Descripcion</th>
                  <th>Notificar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alert in breachAlerts" :key="alert.id">
                  <td>{{ formatDate(alert.at) }}</td>
                  <td><span class="severity-pill" :class="alert.severity">{{ alert.severity }}</span></td>
                  <td>{{ alert.action }}</td>
                  <td>{{ alert.actorUser?.name || alert.actor }}</td>
                  <td class="description-cell">{{ alert.description }}</td>
                  <td>
                    <button
                      class="action-btn"
                      :disabled="notifyingId === alert.id"
                      @click="sendBreachNotification(alert.id)"
                    >
                      {{ notifyingId === alert.id ? 'Enviando...' : 'Notificar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>

        <div v-else-if="activeSubView === 'demo'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>NIT</th>
                <th>Ciudad</th>
                <th>Sector</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Mensaje</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in demoRequests" :key="req.id">
                <td>{{ req.empresa }}</td>
                <td>{{ req.nombre }}</td>
                <td>{{ req.correo }}</td>
                <td>{{ req.nit || '-' }}</td>
                <td>{{ req.ciudad || '-' }}</td>
                <td>{{ req.sector || '-' }}</td>
                <td>{{ req.direccion || '-' }}</td>
                <td>{{ req.telefono || '-' }}</td>
                <td class="truncate-cell">{{ req.mensaje || '-' }}</td>
                <td>
                  <span class="status-pill" :class="req.estado">{{ req.estado }}</span>
                </td>
                <td>{{ formatDate(req.createdAt) }}</td>
                <td>
                  <div class="demo-actions">
                    <select
                      class="status-select"
                      @change="updateDemoStatus(req.id, $event.target.value)"
                    >
                      <option value="nuevo" :selected="req.estado === 'nuevo'">Nuevo</option>
                      <option value="contactado" :selected="req.estado === 'contactado'">Contactado</option>
                      <option value="demo_agendada" :selected="req.estado === 'demo_agendada'">Demo agendada</option>
                      <option value="aprobado" :selected="req.estado === 'aprobado'">Aprobado</option>
                      <option value="convertido" :selected="req.estado === 'convertido'">Convertido</option>
                      <option value="cliente" :selected="req.estado === 'cliente'">Cliente</option>
                    </select>
                    <button
                      v-if="req.estado !== 'convertido'"
                      class="action-btn-sm action-btn-sm--convert"
                      @click="convertToCustomer(req.id)"
                    >
                      Convertir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!demoRequests.length" class="empty-note">
            No hay solicitudes de demo registradas.
          </p>
        </div>

        <div v-else-if="activeSubView === 'logs'" class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actor</th>
                <th>Entidad</th>
                <th>Accion</th>
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

        <div v-else-if="activeSubView === 'compliance'" class="compliance-grid">
          <article class="compliance-card">
            <div class="section-heading">
              <div>
                <p class="eyebrow">ISO 27000</p>
                <h3>Controles documentados</h3>
              </div>
              <button class="action-btn" :disabled="runningReview" @click="executeAccessReview">
                {{ runningReview ? 'Ejecutando revision...' : 'Ejecutar revision ahora' }}
              </button>
            </div>

            <div v-if="complianceChecks.length" class="check-grid">
              <article v-for="check in complianceChecks" :key="check.key" class="check-card">
                <div class="check-card-head">
                  <span class="material-icons check-icon">
                    {{ check.status === 'documented' ? 'description' : 'schedule' }}
                  </span>
                  <span class="status-pill" :class="check.status">
                    {{ check.status === 'documented' ? 'Documentado' : 'Automatizado' }}
                  </span>
                </div>
                <h4>{{ check.label }}</h4>
                <p class="card-copy">{{ check.description }}</p>
                <p class="check-evidence">{{ check.evidence }}</p>
                <a class="inline-link" :href="check.documentUrl" target="_blank" rel="noreferrer">
                  Abrir documento
                </a>
              </article>
            </div>

            <p v-else class="empty-note">
              No se pudo cargar la evidencia automatica. Reintenta en un momento.
            </p>
          </article>

          <article v-if="businessContinuityPlan" class="compliance-card wide">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Plan de continuidad</p>
                <h3>{{ businessContinuityPlan.title }}</h3>
              </div>
              <span class="status-pill documented">Documentado</span>
            </div>

            <p class="card-copy">{{ businessContinuityPlan.summary }}</p>

            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Responsable</span>
                <strong>{{ businessContinuityPlan.owner }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Version</span>
                <strong>{{ businessContinuityPlan.version }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Revision</span>
                <strong>{{ businessContinuityPlan.reviewCadence }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Prueba</span>
                <strong>{{ businessContinuityPlan.testCadence }}</strong>
              </div>
            </div>

            <div class="objective-grid">
              <div v-for="objective in businessContinuityPlan.recoveryObjectives" :key="objective.label" class="objective-card">
                <span class="detail-label">{{ objective.label }}</span>
                <strong>{{ objective.value }}</strong>
              </div>
            </div>

            <div class="pill-row">
              <span v-for="scenario in businessContinuityPlan.scenarios" :key="scenario" class="detail-pill">
                {{ scenario }}
              </span>
            </div>

            <ul class="bullet-list">
              <li v-for="control in businessContinuityPlan.controls" :key="control">{{ control }}</li>
            </ul>

            <div class="link-row">
              <a class="inline-link" :href="businessContinuityPlan.documentUrl" target="_blank" rel="noreferrer">
                Ver plan completo
              </a>
              <span class="card-meta">El plan se revisa de forma semestral y tras cambios mayores.</span>
            </div>
          </article>

          <article v-if="accessReview" class="compliance-card wide">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Revision de accesos</p>
                <h3>Control automatizado y auditable</h3>
              </div>
              <span class="status-pill automated">Automatizado</span>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Frecuencia</span>
                <strong>{{ accessReview.policy.frequency }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Programacion</span>
                <strong>{{ accessReview.policy.schedule }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Ultima ejecucion</span>
                <strong>{{ accessReview.policy.lastRunAt ? formatDate(accessReview.policy.lastRunAt) : 'Sin ejecucion' }}</strong>
              </div>
              <div class="detail-item">
                <span class="detail-label">Siguiente revision</span>
                <strong>{{ accessReview.policy.nextReviewAt ? formatDate(accessReview.policy.nextReviewAt) : 'Pendiente' }}</strong>
              </div>
            </div>

            <div class="metric-grid">
              <div class="metric-card">
                <span class="detail-label">Cobertura</span>
                <strong>{{ accessReview.policy.coverage.percentage }}%</strong>
                <p>{{ accessReview.policy.coverage.usersReviewed }} usuarios y {{ accessReview.policy.coverage.sessionsReviewed }} sesiones revisadas</p>
              </div>
              <div class="metric-card">
                <span class="detail-label">Usuarios activos</span>
                <strong>{{ accessReview.totals.activeUsers }}</strong>
                <p>Usuarios con acceso vigente en la plataforma</p>
              </div>
              <div class="metric-card">
                <span class="detail-label">Accesos inactivos</span>
                <strong>{{ accessReview.totals.inactiveUsersWithAccess }}</strong>
                <p>Cuentas inactivas que aun conservan membresias</p>
              </div>
              <div class="metric-card">
                <span class="detail-label">2FA pendiente</span>
                <strong>{{ accessReview.totals.usersPending2FA }}</strong>
                <p>Usuarios activos que aun no tienen 2FA</p>
              </div>
            </div>

            <div class="finding-grid">
              <article v-for="finding in accessReview.findings" :key="finding.title" class="finding-card">
                <div class="finding-head">
                  <h4>{{ finding.title }}</h4>
                  <span class="severity-pill" :class="finding.severity">{{ finding.severity }}</span>
                </div>
                <p>{{ finding.description }}</p>
                <span v-if="finding.count !== undefined" class="finding-count">{{ finding.count }}</span>
              </article>
            </div>

            <div class="split-grid">
              <section>
                <h4>Recomendaciones</h4>
                <ul class="bullet-list tight">
                  <li v-for="item in accessReview.recommendations" :key="item">{{ item }}</li>
                </ul>
              </section>

              <section>
                <h4>Revision por empresa</h4>
                <div class="mini-table">
                  <table class="admin-table compact">
                    <thead>
                      <tr>
                        <th>Empresa</th>
                        <th>Usuarios</th>
                        <th>Admin</th>
                        <th>2FA</th>
                        <th>Inactivos</th>
                        <th>Sesiones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="tenant in accessReview.byTenant" :key="tenant.tenantId">
                        <td>{{ tenant.tenantName }}</td>
                        <td>{{ tenant.totalUsers }}</td>
                        <td>{{ tenant.adminUsers }}</td>
                        <td>{{ tenant.usersWith2FA }}</td>
                        <td>{{ tenant.inactiveUsersWithAccess }}</td>
                        <td>{{ tenant.activeSessions }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <section class="timeline-section">
              <h4>Ultimas ejecuciones</h4>
              <div class="mini-table">
                <table class="admin-table compact">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Actor</th>
                      <th>Severidad</th>
                      <th>Descripcion</th>
                      <th>Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="run in accessReview.recentRuns" :key="run.id">
                      <td>{{ formatDate(run.at) }}</td>
                      <td>{{ run.actor }}</td>
                      <td><span class="severity-pill" :class="run.severity">{{ run.severity }}</span></td>
                      <td>{{ run.description }}</td>
                      <td>{{ run.tenantName || 'Sistema' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div class="link-row">
              <a class="inline-link" href="/compliance/access-review-procedure.md" target="_blank" rel="noreferrer">
                Abrir procedimiento de revision
              </a>
              <span class="card-meta">Cada ejecucion deja evidencia en auditoria y queda visible en esta consola.</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>

  <!-- Tenant Settings Drawer -->
  <Teleport to="body">
    <div v-if="selectedTenantId" class="tenant-drawer-overlay" @click.self="selectedTenantId = null">
      <div class="tenant-drawer">
        <TenantSettingsView
          :tenant-id="selectedTenantId"
          @back="selectedTenantId = null"
        />
      </div>
    </div>
  </Teleport>
  </section>
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
  gap: 1rem;
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
  white-space: nowrap;
}

.system-badge.healthy { color: #10b981; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.version { opacity: 0.5; font-size: 0.75rem; margin-left: 0.5rem; }

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

.stat-card.blue .stat-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.stat-card.purple .stat-icon { color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
.stat-card.green .stat-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.stat-card.orange .stat-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 0.875rem; color: var(--text-secondary); }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #fff; }

.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1rem;
}

.tab-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.tab-btn.active { background: #10b981; color: #fff; }

.tab-content {
  min-width: 0;
}

.table-container {
  background: var(--card-bg, #1e293b);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 760px;
}

.admin-table.compact {
  min-width: 680px;
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
  background: #10b981;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-value {
  color: #10b981;
  font-size: 2rem;
  font-weight: 700;
}

.status-pill,
.severity-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-pill.inactive { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-pill.documented { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-pill.automated { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.severity-pill.info { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.severity-pill.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
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

.action-btn-sm,
.action-btn {
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-sm {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 0.75rem;
}

.action-btn {
  background: #10b981;
  border: 1px solid #10b981;
  color: #fff;
  font-weight: 600;
}

.action-btn:hover,
.action-btn-sm:hover {
  transform: translateY(-1px);
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn-sm--convert {
  background: #10b981;
  border-color: #10b981;
}

.action-btn-sm--convert:hover {
  background: #059669;
  border-color: #059669;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
}

.log-date {
  font-family: monospace;
  opacity: 0.7;
}

.erase-btn {
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 4px 10px;
  transition: background 0.2s;
  white-space: nowrap;
}

.erase-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.22);
}

.erase-btn:disabled {
  cursor: wait;
  opacity: 0.5;
}

.severity-pill.critical {
  background: rgba(220, 38, 38, 0.18);
  color: #fca5a5;
  border-color: rgba(220, 38, 38, 0.3);
}

.description-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.compliance-card {
  background: var(--card-bg, #1e293b);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
}

.compliance-card.wide {
  grid-column: 1 / -1;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #60a5fa;
}

.section-heading h3,
.finding-head h4 {
  margin: 0;
}

.card-copy {
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.check-grid,
.metric-grid,
.detail-grid,
.objective-grid,
.finding-grid,
.split-grid {
  display: grid;
  gap: 1rem;
}

.check-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.check-card {
  padding: 1rem;
  border-radius: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.24);
}

.check-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.check-icon {
  color: #60a5fa;
}

.check-card h4 {
  margin: 0 0 0.5rem;
}

.check-card p {
  margin: 0 0 0.65rem;
  color: var(--text-secondary);
}

.check-evidence {
  font-size: 0.85rem;
}

.inline-link {
  color: #10b981;
  font-weight: 600;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.empty-note {
  margin: 0;
  color: var(--text-secondary);
}

.detail-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin: 1rem 0;
}

.detail-item,
.metric-card,
.objective-card,
.finding-card {
  border-radius: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.24);
  padding: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.detail-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.objective-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  margin-bottom: 1rem;
}

.objective-card strong,
.metric-card strong {
  display: block;
  font-size: 1.1rem;
  margin-top: 0.35rem;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #6ee7b7;
  font-size: 0.8rem;
}

.bullet-list {
  margin: 0 0 1rem;
  padding-left: 1.2rem;
  color: var(--text-secondary);
}

.bullet-list.tight {
  margin-bottom: 0;
}

.bullet-list li + li {
  margin-top: 0.35rem;
}

.link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.card-meta {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.metric-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin: 1rem 0;
}

.metric-card p {
  margin: 0.4rem 0 0;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.finding-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-bottom: 1rem;
}

.finding-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 0.65rem;
}

.finding-card p {
  margin: 0;
  color: var(--text-secondary);
}

.finding-count {
  display: inline-flex;
  margin-top: 0.65rem;
  font-size: 0.8rem;
  color: #bfdbfe;
}

.split-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  margin-bottom: 1rem;
}

.split-grid h4,
.timeline-section h4 {
  margin: 0 0 0.75rem;
}

.mini-table {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  overflow-x: auto;
  background: rgba(15, 23, 42, 0.24);
}

.timeline-section {
  margin-top: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .admin-console {
    padding: 1rem;
  }

  .admin-header {
    flex-direction: column;
    align-items: stretch;
  }

  .system-badge {
    width: fit-content;
  }

  .tab-btn {
    width: 100%;
    text-align: center;
  }

  .check-grid,
  .metric-grid,
  .detail-grid,
  .objective-grid,
  .finding-grid,
  .split-grid {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .link-row,
  .finding-head {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}

.tenant-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.tenant-drawer {
  width: min(780px, 100vw);
  height: 100%;
  background: var(--bg, #0d1117);
  border-left: 1px solid var(--border, rgba(255,255,255,0.08));
  overflow-y: auto;
  padding: 28px;
  animation: slide-in 220ms ease;
}

@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
</style>
