<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useStateStore } from '../../stores/stateStore'
import { useThemeStore } from '../../stores/themeStore'
import { viewLabels } from '../../utils/ui'

const store = useAuthStore()
const stateStore = useStateStore()
const themeStore = useThemeStore()

const canSwitchTenant = computed(
  () => store.accessibleTenants.length > 1 && stateStore.can('manage_users'),
)

const props = defineProps({ sidebarOpen: { type: Boolean, default: false } })
const emit = defineEmits(['tenant-change', 'logout', 'toggle-sidebar', 'open-admin-panel', 'exit-erp'])

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
      <button :class="['hamburger', { 'is-open': props.sidebarOpen }]" aria-label="Abrir menu" type="button" @click="emit('toggle-sidebar')">
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
          :disabled="!canSwitchTenant"
          :title="!canSwitchTenant ? 'Tu rol no permite cambiar de empresa' : 'Cambiar empresa activa'"
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

      <button
        v-if="stateStore.currentUser?.isSystemOwner"
        class="btn-root"
        type="button"
        title="Ir al Panel de Administracion SaaS"
        @click="emit('open-admin-panel')"
      >⚙ Panel Admin</button>
      <button class="btn-outline" type="button" @click="store.setActiveView('two-factor')" title="Configurar 2FA">🔐 2FA</button>
      <button
        class="theme-toggle-button"
        type="button"
        :title="themeStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        :aria-label="themeStore.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        @click="themeStore.toggleTheme()"
      >
        <svg v-if="themeStore.isDark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.8"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="btn-primary" type="button" @click="emit('logout')">Cerrar sesion</button>
    </div>
  </header>
</template>

<style scoped>
.hamburger.is-open span:nth-child(1) {
  transform: translateY(5.5px) rotate(45deg);
}
.hamburger.is-open span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.hamburger.is-open span:nth-child(3) {
  transform: translateY(-5.5px) rotate(-45deg);
}

.btn-root {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 14px;
  transition: background 150ms;
}
.btn-root:hover {
  background: rgba(16, 185, 129, 0.22);
}

.theme-toggle-button {
  background: none;
  border: none;
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: color 150ms ease, transform 200ms ease;
}
.theme-toggle-button:hover {
  color: var(--accent);
  transform: rotate(20deg);
}
.theme-toggle-button svg {
  height: 20px;
  width: 20px;
}
</style>
