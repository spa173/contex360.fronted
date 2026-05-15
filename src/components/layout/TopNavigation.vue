<script setup>
import { computed } from 'vue'
import { viewLabels } from '../../utils/ui'

const props = defineProps({
  user: { type: Object, default: null },
  activeTenant: { type: Object, default: null },
  accessibleTenants: { type: Array, default: () => [] },
  activeMembership: { type: Object, default: null },
  activeView: { type: String, default: 'dashboard' },
  sidebarOpen: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false },
  canSwitchTenant: { type: Boolean, default: false }
})

const emit = defineEmits(['tenant-change', 'logout', 'toggle-sidebar', 'open-admin-panel', 'toggle-theme', 'navigate'])

const isOwner = computed(() =>
  props.activeMembership?.role === 'owner' ||
  props.activeMembership?.role === 'Administrador' ||
  props.user?.isSystemOwner
)

const isSystemActive = computed(() => !!props.activeTenant?.id)

const viewSubtitles = {
  dashboard: 'Control central y métricas clave',
  billing: 'Facturación electrónica y gestión DIAN',
  inventory: 'Control de existencias y logística',
  accounting: 'Asientos contables y libro diario',
  'third-parties': 'Gestión de clientes y proveedores',
  users: 'Administración de accesos y roles',
  ai: 'Automatización OCR e inteligencia de datos',
}

const pageTitle = computed(() => viewLabels[props.activeView] || 'Dashboard')

function handleTenantChange(event) {
  emit('tenant-change', event.target.value)
}
</script>

<template>
  <header class="h-16 bg-[#131926] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-50">
    <!-- Left: Navigation & Context -->
    <div class="flex items-center gap-6">
      <button
        @click="emit('toggle-sidebar')"
        class="text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <svg v-if="!sidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="flex items-center gap-3">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1">Empresa</span>
          <div class="flex items-center gap-2">
            <select
              :disabled="!canSwitchTenant"
              :value="activeTenant?.id"
              @change="handleTenantChange"
              class="bg-transparent border-none text-white font-bold text-sm p-0 focus:ring-0 cursor-pointer hover:text-emerald-400 transition-colors appearance-none pr-6"
            >
              <option v-for="tenant in accessibleTenants" :key="tenant.id" :value="tenant.id" class="bg-[#131926] text-white">
                {{ tenant.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="h-8 w-px bg-white/10 mx-2"></div>

      <div class="flex flex-col">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] leading-none mb-1">Módulo</span>
        <h1 class="text-sm font-bold text-white tracking-tight">{{ pageTitle }}</h1>
      </div>
    </div>

    <!-- Right: Identity & Actions -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3 bg-white/5 rounded-full pl-4 pr-1 py-1 border border-white/10">
        <div class="flex flex-col items-end">
          <span class="text-[11px] font-bold text-white leading-none">{{ user?.name || 'Invitado' }}</span>
          <span class="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{{ activeMembership?.role || 'Sin Rol' }}</span>
        </div>

        <div v-if="isOwner" class="h-6 px-2 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex items-center">
          <span class="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Owner</span>
        </div>
        <div v-if="isSystemActive" class="h-6 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Sistema activo</span>
        </div>

        <button @click="emit('logout')" class="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-rose-400 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="user?.isSystemOwner"
          @click="emit('open-admin-panel')"
          class="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20"
          title="Administración Global"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button
          @click="emit('navigate', 'two-factor')"
          class="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors border border-white/10"
          title="Seguridad"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2310b981' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
