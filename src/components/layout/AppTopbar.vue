<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { viewLabels } from '../../utils/ui'

const store = useAuthStore()

const emit = defineEmits(['tenant-change', 'logout', 'toggle-sidebar'])

const sessionPill = computed(
  () => `${store.currentUser?.name || 'Sin sesion'} - ${store.currentUser?.title || '-'}`,
)

const rolePill = computed(
  () => `${store.activeMembership?.role || 'Sin rol'} - ${store.activeTenant?.city || '-'}`,
)

const viewSubtitles = {
  dashboard: 'Resumen financiero y alertas del tenant',
  billing: 'Facturacion, impuestos, DIAN y cartera',
  inventory: 'Productos, stock y movimientos recientes',
  accounting: 'Libro diario, comprobantes y balance rapido',
  'third-parties': 'Clientes, proveedores y perfiles tributarios',
  users: 'Roles, permisos y acceso multiempresa',
  ai: 'OCR, extraccion y sugerencias contables',
}

const pageTitle = computed(() => viewLabels[store.activeView] || 'Dashboard')
const pageSubtitle = computed(() => viewSubtitles[store.activeView] || 'Operacion del sistema')

function handleTenantChange(event) {
  emit('tenant-change', event.target.value)
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-title">
      <button class="hamburger" aria-label="Abrir menu" type="button" @click="emit('toggle-sidebar')">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div>
        <div class="page-title">{{ pageTitle }}</div>
        <div class="page-sub">{{ pageSubtitle }}</div>
      </div>
    </div>

    <div class="topbar-right topbar-actions">
      <span class="badge badge-success">Sistema activo</span>

      <label class="topbar-select">
        <span class="sr-only">Empresa activa</span>
        <select
          :disabled="store.accessibleTenants.length <= 1"
          :value="store.activeTenantId"
          @change="handleTenantChange"
        >
          <option v-for="tenant in store.accessibleTenants" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }}
          </option>
        </select>
      </label>

      <span class="badge badge-info">{{ rolePill }}</span>
      <span class="badge badge-muted">{{ sessionPill }}</span>

      <button class="btn-primary" type="button" @click="emit('logout')">Cerrar sesion</button>
    </div>
  </header>
</template>
