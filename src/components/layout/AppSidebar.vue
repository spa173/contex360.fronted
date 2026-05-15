<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useStateStore } from '../../stores/stateStore'
import { viewLabels } from '../../utils/ui'

const store = useAuthStore()
const stateStore = useStateStore()

const isReadOnly = computed(() => stateStore.activeMembership?.role === 'Visor')

const emit = defineEmits(['navigate'])

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const navBlueprint = [
  {
    label: 'Principal',
    items: [{ id: 'dashboard', icon: 'dashboard' }],
  },
  {
    label: 'Modulos',
    items: [
      { id: 'billing', icon: 'invoice' },
      { id: 'purchases', icon: 'cart' },
      { id: 'quotes', icon: 'file-text' },
      { id: 'inventory', icon: 'inventory' },
      { id: 'accounting', icon: 'ledger' },
      { id: 'treasury', icon: 'treasury' },
      { id: 'third-parties', icon: 'people' },
    ],
  },
  {
    label: 'Control',
    items: [
      { id: 'users', icon: 'user' },
      { id: 'reports', icon: 'chart' },
      { id: 'ai', icon: 'spark' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { id: 'admin-console', icon: 'settings' },
    ],
  },
  {
    label: 'Información',
    items: [
      { id: 'about', icon: 'info' },
    ],
  },
]

const navGroups = computed(() =>
  navBlueprint
    .map((group) => ({
      ...group,
      items: (group.items || []).filter((item) => (store.visibleViews || []).includes(item.id)),
    }))
    .filter((group) => group.items.length),
)

const userInitials = computed(() => {
  const name = store.currentUser?.name || 'Usuario'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})
</script>

<template>
  <aside :class="['sidebar', { 'mobile-open': isOpen }]">
    <div class="logo">
      <div class="flex items-center gap-2.5 px-4 pb-5">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
          <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/><rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity=".6"/><rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity=".6"/><rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/></svg>
        </div>
        <div>
          <div class="logo-mark">Contex<span class="text-blue-400">360</span></div>
          <div class="logo-sub">Sistema contable</div>
        </div>
      </div>
    </div>

    <nav class="nav-links" aria-label="Navegacion principal">
      <section v-for="group in navGroups" :key="group.label" class="nav-section">
        <div class="nav-label">{{ group.label }}</div>
        <button
          v-for="item in group.items"
          :key="item.id"
          :class="['nav-item', { active: store.activeView === item.id }]"
          type="button"
          @click="emit('navigate', item.id)"
        >
          <svg v-if="item.icon === 'dashboard'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.72" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.72" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.72" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.72" />
          </svg>
          <svg v-else-if="item.icon === 'invoice'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2.5" y="1.5" width="11" height="13" rx="1.4" stroke="currentColor" stroke-width="1.4" />
            <path d="M5 5h6M5 8h4M5 11h5" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'cart'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1.5 1.5h1.8l1.5 7h7.4l1.3-5H4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="6.5" cy="13" r="1" fill="currentColor" />
            <circle cx="11.5" cy="13" r="1" fill="currentColor" />
          </svg>
          <svg v-else-if="item.icon === 'file-text'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5L9 1.5z" stroke="currentColor" stroke-width="1.4" />
            <path d="M9 1.5v3.5a1 1 0 0 0 1 1h3M5 8h6M5 11h6" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'treasury'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="5.5" width="13" height="9" rx="1.4" stroke="currentColor" stroke-width="1.4" />
            <path d="M4 5.5V4a4 4 0 0 1 8 0v1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <circle cx="8" cy="10" r="1.5" fill="currentColor" opacity="0.8" />
          </svg>
          <svg v-else-if="item.icon === 'inventory'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.8" y="5" width="12.4" height="9" rx="1.4" stroke="currentColor" stroke-width="1.4" />
            <path d="M5 5V3.7A3 3 0 0 1 8 1a3 3 0 0 1 3 2.7V5" stroke="currentColor" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'ledger'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h9M2 12h6" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
          </svg>
          <svg v-else-if="item.icon === 'people'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M1.8 13c.5-2.6 2.2-4 4.2-4s3.7 1.4 4.2 4" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
            <path d="M10.5 6.2a2 2 0 0 1 0-3.9M11.5 9.2c1.3.4 2.3 1.6 2.7 3.5" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'user'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4" />
            <path d="M2.5 14c.5-3.2 2.6-5 5.5-5s5 1.8 5.5 5" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'settings'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="currentColor" opacity="0.72" />
            <path d="M14 7.5c0-.3-.2-.5-.5-.5h-1c-.1-.4-.2-.8-.4-1.2l.7-.7c.2-.2.2-.5 0-.7l-.7-.7c-.2-.2-.5-.2-.7 0l-.7.7c-.4-.2-.8-.3-1.2-.4v-1c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5v1c-.4.1-.8.2-1.2.4l-.7-.7c-.2-.2-.5-.2-.7 0l-.7.7c-.2.2-.2.5 0 .7l.7.7c-.2.4-.3.8-.4 1.2h-1c-.3 0-.5.2-.5.5v1c0 .3.2.5.5.5h1c.1.4.2.8.4 1.2l-.7.7c-.2.2-.2.5 0 .7l.7.7c.2.2.5.2.7 0l.7-.7c.4.2.8.3 1.2.4v1c0 .3.2.5.5.5h1c.3 0 .5-.2.5-.5v-1c.4-.1.8-.2 1.2-.4l.7.7c.2.2.5.2.7 0l.7-.7c.2-.2.2-.5 0-.7l-.7-.7c.2-.4.3-.8.4-1.2h1c.3 0 .5-.2.5-.5v-1z" stroke="currentColor" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'spark'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.7v2M8 12.3v2M1.7 8h2M12.3 8h2M3.6 3.6 5 5M11 11l1.4 1.4M3.6 12.4 5 11M11 5l1.4-1.4" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
            <circle cx="8" cy="8" r="2.4" stroke="currentColor" stroke-width="1.4" />
          </svg>
          <svg v-else-if="item.icon === 'chart'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="9" width="3" height="5" rx="1" fill="currentColor" opacity="0.6" />
            <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" opacity="0.8" />
            <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
          </svg>
          <svg v-else-if="item.icon === 'info'" class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4" />
            <path d="M8 7v4M8 5v1" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
          </svg>
          <span class="nav-item-label">{{ viewLabels[item.id] || item.id }}</span>
        </button>
      </section>
    </nav>

    <div class="sidebar-footer">
      <button 
        class="user-strip" 
        type="button" 
        @click="emit('navigate', 'profile')"
        :class="{ active: store.activeView === 'profile' }"
      >
        <div class="avatar" title="Sesion activa">{{ userInitials || 'U' }}</div>
        <div class="user-strip-copy">
          <div class="user-name">{{ store.currentUser?.name || 'Usuario' }}</div>
          <div class="user-role">{{ store.isSystemOwner ? 'System Owner' : (store.activeMembership?.role || 'Sin rol') }}</div>
          <div v-if="isReadOnly" class="readonly-badge">Solo lectura</div>
        </div>
      </button>
      <div class="legal-links">
        <button class="legal-link" @click="emit('navigate', 'privacy-policy')">
          Política de privacidad
        </button>
        <span class="legal-sep">·</span>
        <button class="legal-link" @click="emit('navigate', 'terms-of-use')">
          Términos de uso
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.nav-item-label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1;
}

.readonly-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.3);
  color: #93C5FD;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.readonly-badge::before {
  content: '🔒';
  font-size: 0.65rem;
}
</style>
