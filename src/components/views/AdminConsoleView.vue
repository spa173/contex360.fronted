
<script setup>
import { ref, onMounted, computed } from 'vue'
import { Menu, CheckCircle, Copy, AlertTriangle, Check } from 'lucide-vue-next'
import { businessApi } from '../../services/businessApi'
import { formatDate } from '../../utils/ui'
import TenantSettingsView from '../root/TenantSettingsView.vue'

// Nuevos componentes del rediseño
import Sidebar from '../admin_new/Sidebar.vue'
import Dashboard from '../admin_new/Dashboard.vue'
import EmpresasTable from '../admin_new/EmpresasTable.vue'
import UsersTable from '../admin_new/UsersTable.vue'
import LeadsTable from '../admin_new/LeadsTable.vue'
import LogsTable from '../admin_new/LogsTable.vue'
import ComplianceView from '../admin_new/ComplianceView.vue'
import BreachView from '../admin_new/BreachView.vue'

defineProps({
  isActive: { type: Boolean, default: false },
})

// Estado Global
const stats = ref(null)
const compliance = ref(null)
const loading = ref(true)
const runningReview = ref(false)
const activeSubView = ref('dashboard') // Cambiado a dashboard por defecto
const tenants = ref([])
const globalUsers = ref([])
const logs = ref([])
const breachAlerts = ref([])
const demoRequests = ref([])
const newCustomerCredentials = ref(null)
const erasingUserId = ref(null)
const notifyingId = ref(null)
const selectedTenantId = ref(null)

const normalizeCompliance = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
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
    demoRequests.value = d?.data || []
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
    const fresh = await businessApi.getDemoRequests()
    demoRequests.value = fresh?.data || fresh || []
  } catch (err) {
    console.error('Error updating demo status:', err)
  }
}

const convertToCustomer = async (id) => {
  if (!confirm('¿Convertir esta solicitud en cliente? Esto creará una empresa y un usuario administrador, y enviará credenciales por correo electrónico.')) return
  try {
    const result = await businessApi.convertToCustomer(id)
    
    // Update local list
    const fresh = await businessApi.getDemoRequests()
    demoRequests.value = fresh?.data || fresh || []
    
    // Set credentials for modal
    if (result && (result.data || result.tempPassword)) {
      newCustomerCredentials.value = result.data || result
    } else {
      alert('Cliente creado, pero no se pudieron recuperar las credenciales para mostrar. Revisa el correo enviado.')
    }
  } catch (err) {
    console.error('Error converting to customer:', err)
    alert('Error al convertir en cliente: ' + (err.message || 'Error desconocido'))
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('Copiado al portapapeles')
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

// Mapeos para los sub-componentes
const complianceChecks = computed(() => compliance.value?.complianceChecks ?? [])
const accessReview = computed(() => compliance.value?.accessReview ?? null)

</script>

<template>
  <section :class="['view-container', { active: isActive }]">
    <div class="flex h-screen bg-[#0B0F1A] text-slate-300 font-sans selection:bg-emerald-500/30">
      
      <!-- Sidebar SaaS -->
      <Sidebar :active-view="activeSubView" @view-change="(v) => activeSubView = v" />

      <!-- Contenido Principal -->
      <main class="flex-1 overflow-auto bg-[#0B0F1A]">
        <!-- Mobile Header -->
        <header class="md:hidden flex items-center justify-between p-4 border-b border-slate-800/50 bg-[#131926]">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">C</div>
            <span class="text-sm font-bold text-slate-50 tracking-tight">Contex360</span>
          </div>
          <button class="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
             <Menu class="w-6 h-6" />
          </button>
        </header>

        <div v-if="loading" class="h-full flex flex-col items-center justify-center space-y-6">
          <div class="relative">
            <div class="w-14 h-14 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
            <div class="absolute inset-0 w-14 h-14 border-4 border-emerald-500/5 rounded-full animate-ping opacity-20"></div>
          </div>
          <p class="text-slate-500 font-medium animate-pulse">Sincronizando infraestructura...</p>
        </div>

        <div v-else class="max-w-[1600px] mx-auto p-6 lg:p-10 animate-in fade-in duration-500">
          
          <!-- Vistas Dinámicas -->
          <Dashboard 
            v-if="activeSubView === 'dashboard'" 
            :stats="stats" 
            :demo-requests="demoRequests"
            :compliance-checks="complianceChecks"
          />

          <EmpresasTable 
            v-else-if="activeSubView === 'tenants'" 
            :tenants="tenants" 
            @configure="(id) => selectedTenantId = id"
          />

          <UsersTable 
            v-else-if="activeSubView === 'users'" 
            :users="globalUsers" 
            :erasing-id="erasingUserId"
            @erase="eraseUser"
          />

          <LeadsTable 
            v-else-if="activeSubView === 'demo'" 
            :demo-requests="demoRequests"
            @update-status="updateDemoStatus"
            @convert="convertToCustomer"
          />

          <LogsTable 
            v-else-if="activeSubView === 'logs'" 
            :logs="logs" 
          />

          <ComplianceView 
            v-else-if="activeSubView === 'compliance'" 
            :compliance-checks="complianceChecks"
            :access-review="accessReview"
            :running-review="runningReview"
            @run-review="executeAccessReview"
          />

          <BreachView 
            v-else-if="activeSubView === 'breach'" 
            :breach-alerts="breachAlerts"
            :notifying-id="notifyingId"
            @notify="sendBreachNotification"
          />

        </div>
      </main>
    </div>

    <!-- Tenant Settings Drawer (Teleportado) -->
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

    <!-- Modal credenciales nuevo cliente (Teleportado) -->
    <Teleport to="body">
      <div v-if="newCustomerCredentials" class="cred-overlay" @click.self="newCustomerCredentials = null">
        <div class="cred-modal" role="dialog" aria-modal="true">
          <div class="cred-header">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 class="cred-title">Cliente creado exitosamente</h2>
              <p class="cred-subtitle">Guarda estas credenciales — también se enviaron al correo del cliente</p>
            </div>
          </div>
          <div class="cred-body">
            <div class="cred-row">
              <span class="cred-label">Empresa</span>
              <span class="cred-value">{{ newCustomerCredentials.tenant?.name || newCustomerCredentials.companyName }}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Prefijo</span>
              <code class="cred-code">{{ newCustomerCredentials.tenant?.prefix || newCustomerCredentials.prefix }}</code>
            </div>
            <div class="cred-row">
              <span class="cred-label">Admin</span>
              <span class="cred-value">{{ newCustomerCredentials.user?.name || newCustomerCredentials.name }}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Correo</span>
              <code class="cred-code">{{ newCustomerCredentials.user?.email || newCustomerCredentials.email }}</code>
            </div>
            <div class="cred-row cred-row--highlight">
              <span class="cred-label">Contraseña temporal</span>
              <div class="cred-value-group">
                <code class="cred-code cred-code--password">{{ newCustomerCredentials.tempPassword }}</code>
                <button class="copy-btn" @click="copyToClipboard(newCustomerCredentials.tempPassword)" title="Copiar contraseña">
                  <Copy class="w-4 h-4" />
                </button>
              </div>
            </div>
            <p class="cred-note">
              <AlertTriangle class="w-4 h-4 text-amber-400 flex-shrink-0" />
              El cliente deberá cambiar esta contraseña en su primer inicio de sesión.
            </p>
          </div>
          <div class="cred-footer">
            <button class="cred-close-btn" @click="newCustomerCredentials = null">
              <Check class="w-4 h-4" />
              Entendido
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.view-container {
  display: none;
  height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
}

.view-container.active {
  display: block;
}

/* Modal Credenciales Styles (kept from previous implementation) */
.cred-overlay {
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 9999;
}

.cred-modal {
  background: #131926;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  overflow: hidden;
  width: 100%;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.6);
}

.cred-header {
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  gap: 16px;
  padding: 28px 28px 20px;
}

.cred-title {
  color: #f8fafc;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.cred-subtitle {
  color: #64748b;
  font-size: 0.8rem;
  margin: 0;
}

.cred-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 28px;
}

.cred-row {
  align-items: center;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(11, 15, 26, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.cred-row--highlight {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.cred-label {
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.cred-value {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 600;
}

.cred-code {
  background: rgba(11, 15, 26, 0.8);
  border-radius: 6px;
  color: #10b981;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.85rem;
  padding: 4px 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.cred-code--password {
  color: #34d399;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.cred-value-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.copy-btn {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  color: #10b981;
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.copy-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #34d399;
}

.cred-note {
  color: #fbbf24;
  font-size: 0.75rem;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(251, 191, 36, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

.cred-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: flex-end;
  padding: 20px 28px;
}

.cred-close-btn {
  background: linear-gradient(to right, #059669, #10b981);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 24px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cred-close-btn:hover { 
  transform: translateY(-1px); 
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35); 
}

/* Tenant Drawer Overlay */
.tenant-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.tenant-drawer {
  width: min(850px, 100vw);
  height: 100%;
  background: #0B0F1A;
  border-left: 1px solid rgba(148, 163, 184, 0.1);
  overflow-y: auto;
  padding: 0;
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
