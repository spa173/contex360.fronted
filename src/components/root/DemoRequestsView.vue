<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { businessApi } from '../../services/businessApi'

const requests = ref<any[]>([])
const loading = ref(true)
const error = ref('')

// States for success modal
const showSuccessModal = ref(false)
const convertedInfo = ref<{
  tenant: { id: string; name: string; prefix: string }
  user: { id: string; name: string; email: string }
  tempPassword?: string
} | null>(null)
const copied = ref(false)

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
    if (response.ok && response.data) {
      convertedInfo.value = {
        tenant: response.data.tenant,
        user: response.data.user,
        tempPassword: response.data.tempPassword
      }
      showSuccessModal.value = true
    } else {
      alert(response.message || '✅ Solicitud convertida a cliente exitosamente.')
    }
    await fetchRequests()
  } catch (e: any) {
    alert(e.message || 'Error al convertir a cliente')
  }
}

async function copyPassword() {
  if (!convertedInfo.value?.tempPassword) return
  try {
    await navigator.clipboard.writeText(convertedInfo.value.tempPassword)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error copying text: ', err)
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  convertedInfo.value = null
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
        <h2 class="section-title">
          Solicitudes de Demo
        </h2>
        <p class="section-sub">
          Gestiona los leads y prospectos interesados en Contex360
        </p>
      </div>
      <button
        class="btn-refresh"
        @click="fetchRequests"
      >
        🔄 Actualizar
      </button>
    </div>

    <div
      v-if="loading"
      class="state-loading"
    >
      Cargando solicitudes...
    </div>
    <div
      v-else-if="error"
      class="state-error"
    >
      {{ error }}
    </div>
    <div
      v-else
      class="table-wrap"
    >
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
            <td
              colspan="5"
              class="state-empty"
            >
              No hay solicitudes pendientes
            </td>
          </tr>
          <tr
            v-for="r in requests"
            :key="r.id"
          >
            <td class="date-cell">
              {{ new Date(r.createdAt).toLocaleDateString('es-CO') }}
            </td>
            <td>
              <div class="prospect-info">
                <span class="prospect-name">{{ r.empresa }}</span>
                <span class="prospect-contact">{{ r.nombre }}</span>
              </div>
            </td>
            <td>
              <div class="contact-links">
                <a
                  :href="'mailto:' + r.correo"
                  class="link"
                >{{ r.correo }}</a>
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
                  class="status-select"
                  @change="(e) => updateStatus(r.id, (e.target as HTMLSelectElement).value)"
                >
                  <option value="nuevo">
                    Nuevo
                  </option>
                  <option value="contactado">
                    Contactado
                  </option>
                  <option value="aprobado">
                    Aprobado
                  </option>
                  <option value="rechazado">
                    Rechazado
                  </option>
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

    <!-- Modal de Éxito de Conversión -->
    <div
      v-if="showSuccessModal"
      class="modal-overlay"
      @click.self="closeSuccessModal"
    >
      <div class="modal-card">
        <div class="modal-header">
          <div class="success-icon-wrap">
            <span class="success-icon">✓</span>
          </div>
          <h3 class="modal-title">
            ¡Cliente Creado Exitosamente!
          </h3>
          <p class="modal-subtitle">
            Se ha configurado la empresa y el usuario administrador en el sistema.
          </p>
        </div>

        <div class="modal-body">
          <div class="info-group">
            <h4 class="info-group-title">
              🏢 Datos de la Empresa
            </h4>
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ convertedInfo?.tenant?.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Prefijo:</span>
              <span class="info-value prefix-tag">{{ convertedInfo?.tenant?.prefix }}</span>
            </div>
          </div>

          <div class="info-group">
            <h4 class="info-group-title">
              👤 Administrador Inicial
            </h4>
            <div class="info-row">
              <span class="info-label">Nombre:</span>
              <span class="info-value">{{ convertedInfo?.user?.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Correo:</span>
              <span class="info-value font-mono">{{ convertedInfo?.user?.email }}</span>
            </div>
          </div>

          <div class="password-box">
            <span class="password-box-label">Clave Temporal del Administrador</span>
            <div class="password-input-wrap">
              <input 
                type="text" 
                readonly 
                :value="convertedInfo?.tempPassword" 
                class="password-input"
              >
              <button
                class="btn-copy"
                @click="copyPassword"
              >
                <span v-if="copied">Copiado ✓</span>
                <span v-else>📋 Copiar</span>
              </button>
            </div>
            <p class="password-warning">
              ⚠️ <strong>Importante:</strong> Por razones de seguridad, esta clave solo se mostrará una vez. Cópiala ahora para entregársela al cliente.
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn-close-modal"
            @click="closeSuccessModal"
          >
            Entendido
          </button>
        </div>
      </div>
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

/* Modal overlay and card styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  background: #182235;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 24px 16px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.success-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  border: 2px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 1.5rem;
  font-weight: bold;
  animation: pulseIcon 2s infinite;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-group {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-group-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
}

.info-label {
  color: #94a3b8;
}

.info-value {
  color: #f1f5f9;
  font-weight: 500;
}

.prefix-tag {
  font-family: monospace;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.password-box {
  background: rgba(16, 185, 129, 0.03);
  border: 1px dashed rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.password-box-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #10b981;
}

.password-input-wrap {
  display: flex;
  gap: 8px;
}

.password-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-family: monospace;
  font-size: 1rem;
  padding: 10px 12px;
  letter-spacing: 0.05em;
  text-align: center;
}

.btn-copy {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.btn-copy:hover {
  background: #1d4ed8;
}

.password-warning {
  font-size: 0.78rem;
  color: #fca5a5;
  margin: 0;
  line-height: 1.4;
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ffffff;
  padding: 10px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulseIcon {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}
</style>
