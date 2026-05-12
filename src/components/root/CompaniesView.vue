<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { getAuthToken } from '../../services/authApi'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const companies = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const showModal = ref(false)
const saving = ref(false)
const emit = defineEmits(['configure'])
const createdCredentials = ref<{ name: string; email: string; password: string } | null>(null)

function openSettings(id: string) {
  emit('configure', id)
}

const form = ref({
  name: '',
  adminName: '',
  adminEmail: '',
  prefix: '',
  plan: 'trial',
  city: '',
})

const searchQuery = ref('')
const filteredCompanies = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return companies.value
  return companies.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.prefix?.toLowerCase().includes(q),
  )
})

function getToken() {
  return getAuthToken()
}

async function fetchCompanies() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(`${API}/admin/tenants`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    companies.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Error cargando empresas'
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  saving.value = true
  try {
    const { data } = await axios.post(`${API}/admin/companies`, form.value, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    createdCredentials.value = {
      name: data.tenant.name,
      email: data.user.email,
      password: data.tempPassword,
    }
    await fetchCompanies()
    resetForm()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Error creando empresa')
  } finally {
    saving.value = false
  }
}

async function handleSuspend(id: string, currentStatus: string) {
  const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
  const label = newStatus === 'suspended' ? 'suspender' : 'reactivar'
  if (!confirm(`¿Confirmas ${label} esta empresa?`)) return
  try {
    await axios.patch(
      `${API}/admin/tenants/${id}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${getToken()}` } },
    )
    await fetchCompanies()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Error actualizando estado')
  }
}

function resetForm() {
  form.value = { name: '', adminName: '', adminEmail: '', prefix: '', plan: 'trial', city: '' }
  showModal.value = false
}

function closeCredentials() {
  createdCredentials.value = null
}

onMounted(fetchCompanies)
</script>

<template>
  <div class="companies-view">
    <div class="companies-header">
      <div>
        <h2 class="section-title">Empresas</h2>
        <p class="section-sub">{{ companies.length }} empresas registradas en la plataforma</p>
      </div>
      <button class="btn-emerald" @click="showModal = true">+ Registrar nuevo Tenant</button>
    </div>

    <div class="search-bar">
      <input v-model="searchQuery" class="search-input" placeholder="Buscar empresa..." type="text" />
    </div>

    <div v-if="loading" class="state-empty">Cargando empresas...</div>
    <div v-else-if="error" class="state-empty error-text">{{ error }}</div>
    <div v-else class="companies-table-wrap">
      <table class="companies-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Usuarios</th>
            <th>Facturas</th>
            <th>Productos</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>Creada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredCompanies.length === 0">
            <td colspan="8" class="state-empty">No se encontraron empresas</td>
          </tr>
          <tr v-for="c in filteredCompanies" :key="c.id">
            <td>
              <div class="company-name-cell">
                <span class="company-avatar">{{ c.prefix || (c.name ? c.name.slice(0, 2).toUpperCase() : '??') }}</span>
                <div>
                  <div class="company-name">{{ c.name }}</div>
                  <div class="company-id">{{ c.id }}</div>
                </div>
              </div>
            </td>
            <td>{{ c._count?.memberships ?? '—' }}</td>
            <td>{{ c._count?.invoices ?? '—' }}</td>
            <td>{{ c._count?.products ?? '—' }}</td>
            <td>{{ c.city || '—' }}</td>
            <td>
              <span :class="['status-pill', c.dianStatus === 'suspended' ? 'suspended' : 'active']">
                {{ c.dianStatus === 'suspended' ? 'Suspendida' : 'Activa' }}
              </span>
            </td>
            <td>{{ new Date(c.createdAt).toLocaleDateString('es-CO') }}</td>
            <td>
              <div class="action-row">
                <button class="btn-action btn-configure" @click="openSettings(c.id)">
                  ⚙️ Configurar
                </button>
                <button
                  class="btn-action"
                  :class="c.dianStatus === 'suspended' ? 'btn-activate' : 'btn-suspend'"
                  @click="handleSuspend(c.id, c.dianStatus)"
                >
                  {{ c.dianStatus === 'suspended' ? '✅ Activar' : '🔒 Suspender' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear empresa -->
    <div v-if="showModal" class="modal-overlay" @click.self="resetForm">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Nueva Empresa</h3>
          <button class="modal-close" @click="resetForm">✕</button>
        </div>
        <form class="modal-form" @submit.prevent="handleCreate">
          <div class="field-group">
            <label>Nombre de la empresa *</label>
            <input v-model="form.name" required placeholder="Ej: Fuego Burger SAS" />
          </div>
          <div class="field-row">
            <div class="field-group">
              <label>Prefijo (3-4 letras) *</label>
              <input v-model="form.prefix" required maxlength="4" placeholder="Ej: FGB" />
            </div>
            <div class="field-group">
              <label>Ubicación / Ciudad</label>
              <input v-model="form.city" placeholder="Ej: Sogamoso" />
            </div>
          </div>
          <div class="field-group">
            <label>Nombre del administrador *</label>
            <input v-model="form.adminName" required placeholder="Ej: Carlos García" />
          </div>
          <div class="field-group">
            <label>Correo del administrador *</label>
            <input v-model="form.adminEmail" required type="email" placeholder="admin@empresa.com" />
          </div>
          <div class="field-row">
            <div class="field-group">
              <label>Plan</label>
              <select v-model="form.plan">
                <option value="trial">Trial (30 días)</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="resetForm">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Creando...' : 'Crear Empresa' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Credenciales creadas -->
    <div v-if="createdCredentials" class="modal-overlay" @click.self="closeCredentials">
      <div class="modal-box credentials-box">
        <div class="modal-header">
          <h3>✅ Empresa creada</h3>
          <button class="modal-close" @click="closeCredentials">✕</button>
        </div>
        <p class="cred-intro">Comparte estas credenciales con el administrador de <strong>{{ createdCredentials.name }}</strong>:</p>
        <div class="cred-row"><span>Email</span><code>{{ createdCredentials.email }}</code></div>
        <div class="cred-row"><span>Contraseña temporal</span><code>{{ createdCredentials.password }}</code></div>
        <p class="cred-warning">⚠️ El usuario deberá cambiar su contraseña en el primer inicio de sesión.</p>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeCredentials">Entendido</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.companies-view { display: flex; flex-direction: column; gap: 20px; }
.companies-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.section-title { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0; }
.section-sub { font-size: 0.85rem; color: var(--muted); margin: 4px 0 0; }

.search-bar { max-width: 360px; }
.search-input {
  width: 100%; background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text); font-size: 0.9rem; padding: 10px 14px;
}
.search-input:focus { border-color: var(--accent); outline: none; }

.companies-table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); }
.companies-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.companies-table th {
  background: var(--surface); color: var(--muted); font-weight: 600;
  padding: 12px 16px; text-align: left; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em;
}
.companies-table td { padding: 14px 16px; border-top: 1px solid var(--border); color: var(--text); }
.companies-table tr:hover td { background: rgba(255,255,255,0.02); }

.company-name-cell { display: flex; align-items: center; gap: 10px; }
.company-avatar {
  width: 34px; height: 34px; border-radius: 8px; background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 0.72rem;
  font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.company-name { font-weight: 600; }
.company-id { font-size: 0.72rem; color: var(--muted); font-family: monospace; }

.status-pill { padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.status-pill.active { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
.status-pill.suspended { background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }

.action-row { display: flex; gap: 6px; }
.btn-action { padding: 5px 12px; border-radius: 7px; font-size: 0.78rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; }
.btn-configure { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.25); }
.btn-configure:hover { background: rgba(245,158,11,0.2); }
.btn-suspend { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.25); }
.btn-suspend:hover { background: rgba(239,68,68,0.2); }
.btn-activate { background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.25); }
.btn-activate:hover { background: rgba(16,185,129,0.2); }

.state-empty { text-align: center; padding: 40px; color: var(--muted); font-size: 0.9rem; }
.error-text { color: #ef4444; }

.btn-primary {
  background: var(--accent); border: none; border-radius: 10px; color: #fff;
  cursor: pointer; font-size: 0.9rem; font-weight: 600; padding: 10px 20px;
}
.btn-primary:hover { background: var(--accent-strong); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-emerald {
  background: #10b981; border: none; border-radius: 10px; color: #fff;
  cursor: pointer; font-size: 0.9rem; font-weight: 600; padding: 10px 20px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  transition: all 0.2s ease;
}
.btn-emerald:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3); }
.btn-emerald:active { transform: translateY(0); }
.btn-ghost {
  background: transparent; border: 1px solid var(--border); border-radius: 10px;
  color: var(--text); cursor: pointer; font-size: 0.9rem; padding: 10px 20px;
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex;
  align-items: center; justify-content: center; z-index: 100; padding: 20px;
}
.modal-box {
  background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
  padding: 28px; width: 100%; max-width: 480px;
}
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--text); margin: 0; }
.modal-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1.1rem; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-group label { font-size: 0.82rem; color: var(--muted); font-weight: 500; }
.field-group input, .field-group select {
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 9px;
  color: var(--text); font-size: 0.9rem; padding: 10px 12px;
}
.field-group input:focus, .field-group select:focus { border-color: var(--accent); outline: none; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.credentials-box .cred-intro { color: var(--text); font-size: 0.9rem; margin-bottom: 16px; }
.cred-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface-alt); border-radius: 9px; padding: 12px 16px; margin-bottom: 8px;
}
.cred-row span { font-size: 0.82rem; color: var(--muted); }
.cred-row code { font-family: monospace; color: #10b981; font-size: 0.95rem; font-weight: 600; }
.cred-warning { font-size: 0.8rem; color: #f59e0b; margin-top: 12px; }
</style>
