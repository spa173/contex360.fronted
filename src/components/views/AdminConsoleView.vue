
<script setup>
import { ref, onMounted, computed } from 'vue'
import { Menu, CheckCircle, Copy, AlertTriangle, Check } from 'lucide-vue-next'
import { businessApi } from '../../services/businessApi'
import { useAuthStore } from '../../stores/authStore'
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

// Shadcn UI components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

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
const isCredentialsDialogOpen = ref(false)

// Auth Store
const authStore = useAuthStore()

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
  // Usar authStore para validar permisos y generar credenciales
  const result = await authStore.generateInitialCredentials(id)

  if (!result.ok) {
    toast.error(result.message)
    return
  }

  // Update local list
  const fresh = await businessApi.getDemoRequests()
  demoRequests.value = fresh?.data || fresh || []

  // Set credentials for modal
  if (result.credentials) {
    newCustomerCredentials.value = result.credentials
    isCredentialsDialogOpen.value = true
    toast.success('Empresa convertida exitosamente. Credenciales generadas.')
  } else {
    toast.error('Cliente creado, pero no se pudieron recuperar las credenciales para mostrar. Revisa el correo enviado.')
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  toast.success('Copiado al portapapeles')
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

    <!-- Dialog credenciales nuevo cliente -->
    <Dialog v-model:open="isCredentialsDialogOpen">
      <DialogContent class="bg-[#131926] border border-slate-800/50 text-slate-200">
        <DialogHeader>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <DialogTitle class="text-slate-50">Cliente creado exitosamente</DialogTitle>
              <DialogDescription class="text-slate-500">
                Guarda estas credenciales — también se enviaron al correo del cliente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div class="space-y-3 py-4">
          <div class="flex items-center justify-between p-3 bg-[#0B0F1A] rounded-lg border border-slate-800/30">
            <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Empresa</span>
            <span class="text-sm font-medium text-slate-200">{{ newCustomerCredentials?.tenant?.name || newCustomerCredentials?.companyName }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-[#0B0F1A] rounded-lg border border-slate-800/30">
            <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Prefijo</span>
            <code class="text-sm text-emerald-400 bg-[#0B0F1A] px-2 py-1 rounded border border-emerald-500/20">{{ newCustomerCredentials?.tenant?.prefix || newCustomerCredentials?.prefix }}</code>
          </div>
          <div class="flex items-center justify-between p-3 bg-[#0B0F1A] rounded-lg border border-slate-800/30">
            <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admin</span>
            <span class="text-sm font-medium text-slate-200">{{ newCustomerCredentials?.user?.name || newCustomerCredentials?.name }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-[#0B0F1A] rounded-lg border border-slate-800/30">
            <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Correo</span>
            <code class="text-sm text-emerald-400 bg-[#0B0F1A] px-2 py-1 rounded border border-emerald-500/20">{{ newCustomerCredentials?.user?.email || newCustomerCredentials?.email }}</code>
          </div>
          <div class="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/25">
            <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Contraseña temporal</span>
            <div class="flex items-center gap-2">
              <code class="text-emerald-400 bg-[#0B0F1A] px-2 py-1 rounded border border-emerald-500/20 font-bold tracking-wider">{{ newCustomerCredentials?.tempPassword }}</code>
              <button class="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all" @click="copyToClipboard(newCustomerCredentials?.tempPassword)" title="Copiar contraseña">
                <Copy class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/15">
            <AlertTriangle class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-amber-400">
              El cliente deberá cambiar esta contraseña en su primer inicio de sesión.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button @click="isCredentialsDialogOpen = false" class="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white">
            <Check class="w-4 h-4 mr-2" />
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
