<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const props = defineProps<{ tenantId: string }>()
const emit = defineEmits(['back'])

const tenant = ref<any>(null)
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('general')

const tabs = [
  { id: 'general',   label: 'General',      icon: '🏢' },
  { id: 'users',     label: 'Usuarios',     icon: '👥' },
  { id: 'plan',      label: 'Plan',         icon: '💳' },
  { id: 'status',    label: 'Estado',       icon: '🔘' },
  { id: 'danger',    label: 'Danger Zone',  icon: '⚠️' },
]

const generalForm = ref({ name: '', sector: '', city: '', costMethod: '', allowNegativeStock: false })
const planForm = ref({ planType: 'trial', active: true, trialEndsAt: '' })

const statusLabel = computed(() => {
  const s = tenant.value?.dianStatus
  if (s === 'suspended') return { text: 'Suspendida', cls: 'danger' }
  if (s === 'expired')   return { text: 'Expirada',   cls: 'warn' }
  return { text: 'Activa', cls: 'success' }
})

const trialDaysLeft = computed(() => {
  const d = tenant.value?.subscription?.trialEndsAt
  if (!d) return null
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  return diff
})

async function fetchTenant() {
  loading.value = true
  try {
    const { data } = await axios.get(`${API}/admin/tenants/${props.tenantId}`, {
      withCredentials: true,
    })
    tenant.value = data
    generalForm.value = {
      name: data.name || '',
      sector: data.sector || '',
      city: data.city || '',
      costMethod: data.costMethod || '',
      allowNegativeStock: data.allowNegativeStock || false,
    }
    planForm.value = {
      planType: data.subscription?.planType || 'trial',
      active: data.subscription?.active ?? true,
      trialEndsAt: data.subscription?.trialEndsAt
        ? new Date(data.subscription.trialEndsAt).toISOString().split('T')[0]
        : '',
    }
  } catch (e: any) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function saveGeneral() {
  saving.value = true
  try {
    const { data } = await axios.patch(`${API}/admin/tenants/${props.tenantId}`, generalForm.value, {
      withCredentials: true,
    })
    tenant.value = { ...tenant.value, ...data }
    alert('✅ Información actualizada')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Error guardando')
  } finally {
    saving.value = false
  }
}

async function savePlan() {
  saving.value = true
  try {
    await axios.patch(`${API}/admin/tenants/${props.tenantId}/subscription`, {
      planType: planForm.value.planType,
      active: planForm.value.active,
      trialEndsAt: planForm.value.trialEndsAt || null,
    }, { withCredentials: true })
    await fetchTenant()
    alert('✅ Plan actualizado')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Error guardando plan')
  } finally {
    saving.value = false
  }
}

async function setStatus(status: 'active' | 'suspended') {
  const label = status === 'suspended' ? 'suspender' : 'reactivar'
  if (!confirm(`¿Confirmas ${label} esta empresa?`)) return
  try {
    await axios.patch(`${API}/admin/tenants/${props.tenantId}/status`, { status }, {
      withCredentials: true,
    })
    await fetchTenant()
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Error')
  }
}

async function renewTrial() {
  const days = prompt('¿Cuántos días adicionales de trial?', '30')
  if (!days || isNaN(Number(days))) return
  const newDate = new Date(Date.now() + Number(days) * 86400000).toISOString().split('T')[0]
  planForm.value.trialEndsAt = newDate
  planForm.value.active = true
  savePlan()
}

async function handleDeleteTenant() {
  const password = prompt(`⚠️ ACCIÓN IRREVERSIBLE: Se eliminarán todos los datos de "${tenant.value.name}" (facturas, inventario, usuarios).\n\n🔐 Para autorizar esta acción, ingresa tu contraseña de ROOT / Administrador:`)
  
  if (!password) {
    if (password !== null) alert('Se requiere la contraseña para autorizar la operación.')
    return
  }

  saving.value = true
  try {
    await axios.post(`${API}/admin/tenants/${props.tenantId}/delete`, {
      password: password.trim()
    }, {
      withCredentials: true,
    })
    alert('✅ Empresa eliminada correctamente.')
    emit('back')
  } catch (e: any) {
    alert(e?.response?.data?.message || 'Error eliminando empresa. Verifica tu contraseña.')
  } finally {
    saving.value = false
  }
}

watch(() => props.tenantId, fetchTenant)
onMounted(fetchTenant)
</script>

<template>
  <div class="tenant-settings">
    <!-- Header -->
    <div class="ts-header">
      <button class="btn-back" @click="emit('back')">← Volver a Empresas</button>
      <div v-if="tenant" class="ts-title-row">
        <div class="ts-avatar">{{ tenant.prefix || tenant.name?.slice(0,2).toUpperCase() }}</div>
        <div>
          <h2 class="ts-title">{{ tenant.name }}</h2>
          <span :class="['ts-status', statusLabel.cls]">{{ statusLabel.text }}</span>
          <span v-if="tenant.subscription" class="ts-plan">{{ tenant.subscription.planType }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="state-loading">Cargando configuración...</div>

    <div v-else-if="tenant" class="ts-body">
      <!-- Tabs -->
      <div class="ts-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['ts-tab', { active: activeTab === tab.id }, { danger: tab.id === 'danger' }]"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- ── GENERAL ── -->
      <div v-if="activeTab === 'general'" class="tab-panel">
        <h3 class="panel-title">Información general</h3>
        <div class="form-grid">
          <div class="field-group">
            <label>Nombre empresa</label>
            <input v-model="generalForm.name" placeholder="Nombre" />
          </div>
          <div class="field-group">
            <label>Ciudad</label>
            <input v-model="generalForm.city" placeholder="Bogotá" />
          </div>
          <div class="field-group">
            <label>Sector</label>
            <input v-model="generalForm.sector" placeholder="Retail, Salud..." />
          </div>
          <div class="field-group">
            <label>Método de costeo</label>
            <select v-model="generalForm.costMethod">
              <option value="">No definido</option>
              <option value="FIFO">FIFO</option>
              <option value="PEPS">PEPS</option>
              <option value="UEPS">UEPS</option>
              <option value="CPP">Costo promedio</option>
            </select>
          </div>
          <div class="field-group field-group--full">
            <label class="checkbox-label">
              <input v-model="generalForm.allowNegativeStock" type="checkbox" />
              Permitir stock negativo
            </label>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item"><span>ID</span><code>{{ tenant.id }}</code></div>
          <div class="info-item"><span>Prefijo</span><code>{{ tenant.prefix }}</code></div>
          <div class="info-item"><span>Creada</span><code>{{ new Date(tenant.createdAt).toLocaleDateString('es-CO') }}</code></div>
          <div class="info-item"><span>Facturas</span><code>{{ tenant._count?.invoices ?? 0 }}</code></div>
          <div class="info-item"><span>Productos</span><code>{{ tenant._count?.products ?? 0 }}</code></div>
          <div class="info-item"><span>OCR runs</span><code>{{ tenant._count?.ocrRuns ?? 0 }}</code></div>
        </div>
        <button class="btn-primary" :disabled="saving" @click="saveGeneral">
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </div>

      <!-- ── USUARIOS ── -->
      <div v-else-if="activeTab === 'users'" class="tab-panel">
        <h3 class="panel-title">Usuarios del tenant <span class="count-badge">{{ tenant.memberships?.length ?? 0 }}</span></h3>
        <div class="table-scroll-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!tenant.memberships?.length">
                <td colspan="5" class="empty-row">Sin usuarios</td>
              </tr>
              <tr v-for="m in tenant.memberships" :key="m.id">
                <td>
                  <div class="user-cell">
                    <div class="user-mini-avatar">{{ m.user?.name?.slice(0,1)?.toUpperCase() }}</div>
                    {{ m.user?.name }}
                  </div>
                </td>
                <td class="mono">{{ m.user?.email }}</td>
                <td><span class="role-pill">{{ m.role }}</span></td>
                <td>
                  <span :class="['status-dot', m.user?.status]">{{ m.user?.status }}</span>
                </td>
                <td>{{ m.user?.createdAt ? new Date(m.user.createdAt).toLocaleDateString('es-CO') : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── PLAN ── -->
      <div v-else-if="activeTab === 'plan'" class="tab-panel">
        <h3 class="panel-title">Suscripción y plan</h3>
        <div v-if="tenant.subscription" class="plan-summary">
          <div class="plan-card">
            <div class="plan-name">{{ tenant.subscription.planType }}</div>
            <div :class="['plan-status', tenant.subscription.active ? 'active' : 'inactive']">
              {{ tenant.subscription.active ? 'Activo' : 'Inactivo' }}
            </div>
          </div>
          <div v-if="trialDaysLeft !== null" class="trial-alert" :class="{ warn: trialDaysLeft < 7 }">
            <span v-if="trialDaysLeft > 0">⏱ {{ trialDaysLeft }} días de trial restantes</span>
            <span v-else>⚠️ Trial expirado hace {{ Math.abs(trialDaysLeft) }} días</span>
          </div>
        </div>
        <div v-else class="empty-plan">Sin suscripción activa</div>

        <div class="form-grid mt-20">
          <div class="field-group">
            <label>Plan</label>
            <select v-model="planForm.planType">
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div class="field-group">
            <label>Trial expira</label>
            <input v-model="planForm.trialEndsAt" type="date" />
          </div>
          <div class="field-group field-group--full">
            <label class="checkbox-label">
              <input v-model="planForm.active" type="checkbox" />
              Suscripción activa
            </label>
          </div>
        </div>

        <div class="btn-row">
          <button class="btn-primary" :disabled="saving" @click="savePlan">
            {{ saving ? 'Guardando...' : 'Actualizar plan' }}
          </button>
          <button class="btn-secondary" @click="renewTrial">🔄 Renovar trial</button>
        </div>
      </div>

      <!-- ── ESTADO ── -->
      <div v-else-if="activeTab === 'status'" class="tab-panel">
        <h3 class="panel-title">Estado del tenant</h3>
        <div class="status-current">
          Estado actual:
          <span :class="['ts-status', 'lg', statusLabel.cls]">{{ statusLabel.text }}</span>
        </div>
        <p class="status-desc">
          Suspender un tenant bloquea el acceso de todos sus usuarios al ERP. Los datos se conservan.
        </p>
        <div class="status-actions">
          <button
            v-if="tenant.dianStatus !== 'suspended'"
            class="btn-danger"
            @click="setStatus('suspended')"
          >🔒 Suspender tenant</button>
          <button
            v-if="tenant.dianStatus === 'suspended'"
            class="btn-activate"
            @click="setStatus('active')"
          >✅ Reactivar tenant</button>
        </div>
      </div>

      <!-- ── DANGER ZONE ── -->
      <div v-else-if="activeTab === 'danger'" class="tab-panel danger-panel">
        <h3 class="panel-title danger-title">⚠️ Zona de peligro</h3>
        <p class="danger-desc">Las acciones en esta sección son irreversibles o de alto impacto. Procede con cuidado.</p>

        <div class="danger-action-card">
          <div>
            <div class="danger-action-title">Suspender acceso</div>
            <div class="danger-action-desc">Bloquea todos los usuarios del tenant sin eliminar datos.</div>
          </div>
          <button class="btn-danger" @click="setStatus('suspended')">Suspender</button>
        </div>

        <div class="danger-action-card">
          <div>
            <div class="danger-action-title">Entrar como administrador</div>
            <div class="danger-action-desc">Accede al ERP del tenant para soporte (próximamente).</div>
          </div>
          <button class="btn-ghost" disabled>🔑 Impersonar (próximo)</button>
        </div>

        <div class="danger-action-card danger-action-card--red">
          <div>
            <div class="danger-action-title red">Eliminar empresa</div>
            <div class="danger-action-desc">Elimina permanentemente la empresa y todos sus datos. Irreversible.</div>
          </div>
          <button class="btn-delete-active" :disabled="saving" @click="handleDeleteTenant">
            {{ saving ? 'Eliminando...' : '🗑 Eliminar empresa definitivamente' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tenant-settings { display: flex; flex-direction: column; gap: 0; }

/* Header */
.ts-header { margin-bottom: 24px; }
.btn-back {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 0.85rem; padding: 0 0 12px; display: flex; align-items: center; gap: 4px;
}
.btn-back:hover { color: var(--text); }
.ts-title-row { display: flex; align-items: center; gap: 14px; }
.ts-avatar {
  width: 48px; height: 48px; border-radius: 12px; background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3); color: #10b981; font-size: 0.9rem;
  font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ts-title { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0 0 6px; }
.ts-status {
  display: inline-block; padding: 3px 10px; border-radius: 999px;
  font-size: 0.75rem; font-weight: 600; margin-right: 6px;
}
.ts-status.success { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
.ts-status.danger  { background: rgba(239,68,68,0.12);  color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }
.ts-status.warn    { background: rgba(245,158,11,0.12);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
.ts-status.lg { font-size: 0.9rem; padding: 5px 14px; }
.ts-plan {
  display: inline-block; padding: 3px 10px; border-radius: 999px;
  font-size: 0.75rem; font-weight: 600;
  background: rgba(6,182,212,0.1); color: #06b6d4; border: 1px solid rgba(6,182,212,0.25);
}

/* Tabs */
.ts-body { display: flex; flex-direction: column; gap: 0; }
.ts-tabs {
  display: flex; gap: 4px; border-bottom: 1px solid var(--border);
  margin-bottom: 28px; flex-wrap: wrap; padding-bottom: 0;
}
.ts-tab {
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--muted); cursor: pointer; font-size: 0.875rem; font-weight: 500;
  padding: 10px 16px; margin-bottom: -1px; transition: all 150ms;
}
.ts-tab:hover { color: var(--text); }
.ts-tab.active { color: #10b981; border-bottom-color: #10b981; font-weight: 600; }
.ts-tab.danger { color: #ef4444; }
.ts-tab.danger.active { border-bottom-color: #ef4444; }

/* Panel */
.tab-panel { display: flex; flex-direction: column; gap: 20px; }
.panel-title { font-size: 1.05rem; font-weight: 700; color: var(--text); margin: 0; }
.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%; background: rgba(16,185,129,0.15);
  color: #10b981; font-size: 0.75rem; font-weight: 700; margin-left: 6px;
}

/* Form */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-group--full { grid-column: 1 / -1; }
.field-group label { font-size: 0.8rem; color: var(--muted); font-weight: 500; }
.field-group input, .field-group select {
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 9px;
  color: var(--text); font-size: 0.9rem; padding: 10px 12px;
}
.field-group input:focus, .field-group select:focus { border-color: var(--accent); outline: none; }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text); font-size: 0.9rem; }

/* Info grid */
.info-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
  background: var(--surface-alt); border-radius: 12px; padding: 16px;
  border: 1px solid var(--border);
}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item span { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
.info-item code { font-family: monospace; font-size: 0.85rem; color: var(--text); }

/* Table */
.table-scroll-wrap { overflow-x: auto; max-width: 100%; border-radius: 12px; border: 1px solid var(--border); }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.data-table th { background: var(--surface-alt); color: var(--muted); font-weight: 600; padding: 10px 14px; text-align: left; font-size: 0.75rem; text-transform: uppercase; }
.data-table td { padding: 12px 14px; border-top: 1px solid var(--border); color: var(--text); }
.user-cell { display: flex; align-items: center; gap: 8px; }
.user-mini-avatar {
  width: 28px; height: 28px; border-radius: 6px; background: rgba(16,185,129,0.12);
  color: #10b981; font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.role-pill { padding: 2px 8px; border-radius: 6px; background: rgba(6,182,212,0.1); color: #06b6d4; font-size: 0.75rem; font-weight: 600; }
.status-dot { font-size: 0.78rem; font-weight: 600; }
.status-dot.active  { color: #10b981; }
.status-dot.inactive { color: #ef4444; }
.mono { font-family: monospace; font-size: 0.82rem; color: var(--muted); }
.empty-row { text-align: center; padding: 32px; color: var(--muted); }

/* Plan */
.plan-summary { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.plan-card {
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 12px;
  padding: 16px 20px; display: flex; align-items: center; gap: 12px;
}
.plan-name { font-size: 1rem; font-weight: 700; color: var(--text); text-transform: capitalize; }
.plan-status { padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.plan-status.active  { background: rgba(16,185,129,0.12); color: #10b981; }
.plan-status.inactive{ background: rgba(239,68,68,0.12);  color: #ef4444; }
.trial-alert { padding: 10px 16px; border-radius: 10px; font-size: 0.85rem; background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.trial-alert.warn    { background: rgba(245,158,11,0.1);  color: #f59e0b; border-color: rgba(245,158,11,0.2); }
.empty-plan { color: var(--muted); font-size: 0.9rem; }
.mt-20 { margin-top: 4px; }

/* Status */
.status-current { font-size: 1rem; color: var(--text); display: flex; align-items: center; gap: 10px; }
.status-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.6; }
.status-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* Buttons */
.btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-primary {
  background: var(--accent); border: none; border-radius: 10px; color: #fff;
  cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 10px 20px;
}
.btn-primary:hover { background: var(--accent-strong); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
  border-radius: 10px; color: #10b981; cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 10px 20px;
}
.btn-secondary:hover { background: rgba(16,185,129,0.2); }
.btn-danger {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px; color: #ef4444; cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 10px 20px;
}
.btn-danger:hover { background: rgba(239,68,68,0.2); }
.btn-activate {
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
  border-radius: 10px; color: #10b981; cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 10px 20px;
}
.btn-ghost {
  background: transparent; border: 1px solid var(--border);
  border-radius: 10px; color: var(--muted); cursor: not-allowed; font-size: 0.875rem; padding: 10px 20px; opacity: 0.5;
}
.btn-delete {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px; color: #ef4444; cursor: not-allowed; font-size: 0.875rem; padding: 10px 20px; opacity: 0.5;
}
.btn-delete-active {
  background: #ef4444; border: none;
  border-radius: 10px; color: #fff; cursor: pointer; font-size: 0.875rem; font-weight: 600; padding: 10px 20px;
  transition: all 0.2s;
}
.btn-delete-active:hover { background: #dc2626; transform: scale(1.02); }
.btn-delete-active:disabled { opacity: 0.6; cursor: not-allowed; }

/* Danger panel */
.danger-panel { gap: 16px; }
.danger-title { color: #ef4444; }
.danger-desc { font-size: 0.875rem; color: var(--muted); background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px; padding: 12px 16px; }
.danger-action-card {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px;
}
.danger-action-card--red { border-color: rgba(239,68,68,0.25); background: rgba(239,68,68,0.04); }
.danger-action-title { font-weight: 600; color: var(--text); font-size: 0.9rem; }
.danger-action-title.red { color: #ef4444; }
.danger-action-desc { font-size: 0.8rem; color: var(--muted); margin-top: 3px; }

.state-loading { color: var(--muted); font-size: 0.9rem; padding: 40px 0; }

@media (max-width: 639px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
