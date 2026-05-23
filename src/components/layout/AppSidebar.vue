<script setup>
import { usePlanAccess } from '../../composables/usePlanAccess'

defineProps({
  isOpen: { type: Boolean, default: false },
  activeTenant: Object,
  accessibleTenants: Array,
  activeView: String,
})

const emit = defineEmits(['navigate', 'tenant-change', 'close', 'open-ai-chat'])

const { isFeatureLocked } = usePlanAccess()

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'billing', label: 'Facturación', icon: 'receipt_long' },
  { id: 'purchases', label: 'Compras', icon: 'shopping_cart' },
  { id: 'quotes', label: 'Cotizaciones', icon: 'request_quote' },
  { id: 'inventory', label: 'Inventario', icon: 'inventory_2' },
  { id: 'accounting', label: 'Contabilidad', icon: 'account_balance' },
  { id: 'treasury', label: 'Tesorería', icon: 'payments' },
  { id: 'third-parties', label: 'Terceros', icon: 'groups' },
  { id: 'users', label: 'Usuarios', icon: 'manage_accounts' },
  { id: 'reports', label: 'Reportes', icon: 'bar_chart' },
  { id: 'admin-console', label: 'Consola Admin', icon: 'settings_applications' },
]

function tenantInitials(name) {
  if (!name) return 'C3'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function handleItemClick(itemId) {
  emit('navigate', itemId)
}
</script>

<template>
  <aside
    :class="[
      'fixed lg:sticky top-0 left-0 z-50 w-[260px] h-screen bg-white border-r border-[#E4E4E7] flex flex-col transition-transform',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Brand -->
    <div class="px-5 pt-6 pb-5 border-b border-[#F4F4F5]">
      <div class="flex items-center gap-2.5">
        <svg
          class="c360-mark"
          width="32"
          height="32"
          viewBox="0 0 56 56"
        >
          <rect
            width="56"
            height="56"
            rx="12"
            fill="#18181B"
          />
          <g class="rotor">
            <path
              d="M44 18 A 16 16 0 1 0 44 38"
              stroke="#fff"
              stroke-width="5.5"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M44 18 A 16 16 0 0 1 44 38"
              stroke="#2563EB"
              stroke-width="5.5"
              stroke-linecap="round"
              fill="none"
            />
          </g>
        </svg>
        <div>
          <p class="text-[14px] font-bold tracking-tight text-[#18181B] leading-tight">
            Contex360
          </p>
          <p class="text-[10px] text-[#A1A1AA] uppercase font-semibold tracking-wider">
            Enterprise
          </p>
        </div>
      </div>
    </div>

    <!-- Tenant switcher -->
    <div class="px-3 pt-3">
      <div class="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-[#FAFAFA] cursor-pointer transition-colors">
        <div class="w-7 h-7 bg-[#2563EB] rounded-md flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0">
          {{ tenantInitials(activeTenant?.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[12px] font-semibold text-[#18181B] truncate">
            {{ activeTenant?.name || 'Sin workspace' }}
          </p>
          <p class="text-[10px] text-[#A1A1AA] truncate">
            {{ activeTenant?.idNumber || '' }}
          </p>
        </div>
        <span class="material-symbols-outlined text-[16px] text-[#A1A1AA]">unfold_more</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
      <button
        v-for="item in menuItems"
        :key="item.id"
        :title="isFeatureLocked(item.id) ? 'Plan Enterprise requerido' : ''"
        :class="[
          'w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors text-left',
          isFeatureLocked(item.id)
            ? 'opacity-50 cursor-not-allowed text-[#A1A1AA]'
            : activeView === item.id
              ? 'bg-[#18181B] text-white'
              : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FAFAFA]'
        ]"
        @click="handleItemClick(item.id)"
      >
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </div>
        <span
          v-if="isFeatureLocked(item.id)"
          class="material-symbols-outlined text-[16px] text-[#A1A1AA]"
        >lock</span>
      </button>
    </nav>

    <!-- Bottom: AI + Settings -->
    <div class="px-3 py-3 border-t border-[#F4F4F5] space-y-1">
      <button
        class="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-[13px] font-semibold text-white bg-[#18181B] hover:bg-[#27272A] transition-colors"
        @click="emit('open-ai-chat')"
      >
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        Asistente IA
      </button>
      <button
        :title="isFeatureLocked('admin-console') ? 'Plan Enterprise requerido' : ''"
        :class="[
          'w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors text-left',
          isFeatureLocked('admin-console')
            ? 'opacity-50 cursor-not-allowed text-[#A1A1AA]'
            : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FAFAFA]'
        ]"
        @click="handleItemClick('admin-console')"
      >
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[18px]">settings</span>
          <span>Configuración</span>
        </div>
        <span
          v-if="isFeatureLocked('admin-console')"
          class="material-symbols-outlined text-[16px] text-[#A1A1AA]"
        >lock</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
