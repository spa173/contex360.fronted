<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { viewLabels } from '../../utils/ui'

const store = useAuthStore()

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
      { id: 'inventory', icon: 'inventory' },
      { id: 'accounting', icon: 'ledger' },
      { id: 'third-parties', icon: 'people' },
    ],
  },
  {
    label: 'Control',
    items: [
      { id: 'users', icon: 'user' },
      { id: 'ai', icon: 'spark' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { id: 'admin-console', icon: 'settings' },
    ],
  },
]

const navGroups = computed(() =>
  navBlueprint
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => store.visibleViews.includes(item.id)),
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
      <div class="logo-mark">Contex360</div>
      <div class="logo-sub">Sistema contable local</div>
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
          <svg v-else class="nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.7v2M8 12.3v2M1.7 8h2M12.3 8h2M3.6 3.6 5 5M11 11l1.4 1.4M3.6 12.4 5 11M11 5l1.4-1.4" stroke="currentColor" stroke-linecap="round" stroke-width="1.4" />
            <circle cx="8" cy="8" r="2.4" stroke="currentColor" stroke-width="1.4" />
          </svg>
          {{ viewLabels[item.id] || item.id }}
        </button>
      </section>
    </nav>

    <div class="sidebar-footer">
      <div class="user-strip">
        <div class="avatar" title="Sesion activa">{{ userInitials || 'U' }}</div>
        <div class="user-strip-copy">
          <div class="user-name">{{ store.currentUser?.name || 'Usuario' }}</div>
          <div class="user-role">{{ store.activeMembership?.role || 'Sin rol' }}</div>
        </div>
      </div>
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
