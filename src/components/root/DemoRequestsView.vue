<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { businessApi } from '../../services/businessApi'

const requests = ref<any[]>([])
const loading = ref(true)
const error = ref('')

async function fetchRequests() {
  loading.value = true
  error.value = ''
  try {
    const response = await businessApi.getDemoRequests()
    requests.value = response.data ?? response
  } catch (e: any) {
    error.value = 'Error cargando solicitudes de demo'
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: string, estado: string) {
  try {
    await businessApi.updateDemoRequestStatus(id, estado)
    await fetchRequests()
  } catch (e: any) {
    alert('Error actualizando estado')
  }
}

async function convertToCustomer(id: string) {
  if (!confirm('¿Estás seguro de convertir esta solicitud en un cliente activo? Se creará la empresa y el usuario administrador automáticamente.')) return
  
  try {
    const response = await businessApi.convertToCustomer(id)
    alert(response.message || '✅ Solicitud convertida a cliente exitosamente.')
    await fetchRequests()
  } catch (e: any) {
    alert(e.message || 'Error al convertir a cliente')
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'nuevo': return 'status-new'
    case 'contactado': return 'status-contacted'
    case 'aprobado': return 'status-approved'
    case 'convertido': return 'status-converted'
    default: return ''
  }
}

onMounted(fetchRequests)
</script>

<template>
  <div class="demo-requests">
    <div class="view-header">
      <div>
        <h2 class="section-title">Solicitudes de Demo</h2>
        <p class="section-sub">Gestiona los leads y prospectos interesados en Contex360</p>
      </div>
      <button class="btn-refresh" @click="fetchRequests">🔄 Actualizar</button>
    </div>

    <div v-if="loading" class="state-loading">Cargando solicitudes...</div>
    <div v-else-if="error" class="state-error">{{ error }}</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Empresa / Prospecto</th>
            <th>Contacto</th>
            <th>NIT / Ciudad</th>
            <th>Sector</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="requests.length === 0">
            <td colspan="5" class="state-empty">No hay solicitudes pendientes</td>
          </tr>
          <tr v-for="r in requests" :key="r.id">
            <td class="date-cell">{{ new Date(r.createdAt).toLocaleDateString('es-CO') }}</td>
            <td>
              <div class="prospect-info">
                <span class="prospect-name">{{ r.empresa }}</span>
                <span class="prospect-contact">{{ r.nombre }}</span>
              </div>
            </td>
            <td>
              <div class="contact-links">
                <a :href="'mailto:' + r.correo" class="link">{{ r.correo }}</a>
                <span class="phone">{{ r.telefono || 'Sin teléfono' }}</span>
              </div>
            </td>
            <td>
              <div class="extra-info">
                <span class="nit-val">{{ r.nit || '—' }}</span>
                <span class="city-val">{{ r.ciudad || '—' }}</span>
              </div>
            </td>
            <td><span class="sector-tag">{{ r.sector || '—' }}</span></td>
            <td>
              <span :class="['status-pill', getStatusClass(r.estado)]">
                {{ r.estado.toUpperCase() }}
              </span>
            </td>
            <td>
              <div class="actions">
                <select 
                  :value="r.estado" 
                  @change="(e) => updateStatus(r.id, (e.target as HTMLSelectElement).value)"
                  class="status-select"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
                <button 
                  v-if="r.estado === 'aprobado'" 
                  class="btn-convert"
                  @click="convertToCustomer(r.id)"
                >
                  🚀 Convertir a Cliente
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.demo-requests { display: flex; flex-direction: column; gap: 24px; }
.view-header { display: flex; justify-content: space-between; align-items: flex-start; }
.section-title { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0; }
.section-sub { font-size: 0.85rem; color: var(--muted); margin-top: 4px; }

.btn-refresh {
  background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
  color: var(--text); padding: 8px 16px; font-size: 0.85rem; cursor: pointer;
}

.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow-x: auto; max-width: 100%; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th { background: rgba(255,255,255,0.02); padding: 12px 16px; text-align: left; color: var(--muted); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
.data-table td { padding: 16px; border-top: 1px solid var(--border); color: var(--text); }

.prospect-info { display: flex; flex-direction: column; }
.prospect-name { font-weight: 600; }
.prospect-contact { font-size: 0.8rem; color: var(--muted); }

.contact-links { display: flex; flex-direction: column; gap: 2px; }
.link { color: var(--accent); text-decoration: none; font-size: 0.85rem; }
.phone { font-size: 0.8rem; color: var(--muted); }

.status-pill { padding: 4px 10px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
.status-new { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
.status-contacted { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.status-approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.status-converted { background: rgba(16, 185, 129, 0.12); color: #10b981; }

.actions { display: flex; gap: 8px; align-items: center; }
.status-select {
  background: var(--surface-alt); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); padding: 4px 8px; font-size: 0.8rem;
}

.btn-convert {
  background: #10b981; border: none; border-radius: 6px; color: white;
  padding: 6px 12px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
  transition: transform 0.2s;
}
.btn-convert:hover { transform: scale(1.02); background: #059669; }

.extra-info { display: flex; flex-direction: column; gap: 2px; }
.nit-val { font-family: monospace; font-size: 0.8rem; color: var(--text); }
.city-val { font-size: 0.78rem; color: var(--muted); }
.sector-tag {
  background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.18);
  border-radius: 6px; color: var(--muted); font-size: 0.75rem; padding: 2px 8px; text-transform: capitalize;
}

.state-loading, .state-empty { padding: 40px; text-align: center; color: var(--muted); }
.state-error { padding: 20px; color: #ef4444; background: rgba(239, 68, 68, 0.05); border-radius: 8px; text-align: center; }
</style>
