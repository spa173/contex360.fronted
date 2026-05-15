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
    items: [{ id: 'dashboard', icon: 'grid_view' }],
  },
  {
    label: 'Modulos',
    items: [
      { id: 'billing', icon: 'description' },
      { id: 'purchases', icon: 'shopping_cart' },
      { id: 'quotes', icon: 'draft' },
      { id: 'inventory', icon: 'shopping_bag' },
      { id: 'accounting', icon: 'notes' },
      { id: 'treasury', icon: 'lock' },
      { id: 'third-parties', icon: 'groups' },
    ],
  },
  {
    label: 'Control',
    items: [
      { id: 'users', icon: 'person' },
      { id: 'reports', icon: 'bar_chart' },
      { id: 'ai', icon: 'brightness_low' },
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
  <aside :class="['sidebar-nav', { 'mobile-open': isOpen }]">
    <!-- Header/Logo Area -->
    <div class="logo-area">
      <div class="logo-icon">
        <span class="material-symbols-outlined text-white">widgets</span>
      </div>
      <div class="logo-text">
        <h1 class="logo-title">Contex<span>360</span></h1>
        <p class="logo-subtitle">Sistema contable</p>
      </div>
    </div>

    <!-- Navigation Area -->
    <nav class="nav-container" aria-label="Navegacion principal">
      <section v-for="group in navGroups" :key="group.label" class="nav-group">
        <p class="group-label">{{ group.label }}</p>
        <div class="group-items">
          <button
            v-for="item in group.items"
            :key="item.id"
            :class="['nav-link', { active: store.activeView === item.id }]"
            type="button"
            @click="emit('navigate', item.id)"
          >
            <span class="material-symbols-outlined nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ viewLabels[item.id] || item.id }}</span>
          </button>
        </div>
      </section>
    </nav>

    <!-- Footer/User Area -->
    <div class="sidebar-footer">
      <button 
        class="user-profile-strip" 
        type="button" 
        @click="emit('navigate', 'profile')"
        :class="{ active: store.activeView === 'profile' }"
      >
        <div class="profile-avatar">{{ userInitials || 'U' }}</div>
        <div class="profile-info">
          <p class="profile-name">{{ store.currentUser?.name || 'Usuario' }}</p>
          <p class="profile-role">{{ store.isSystemOwner ? 'System Owner' : (store.activeMembership?.role || 'Sin rol') }}</p>
        </div>
      </button>

      <div v-if="isReadOnly" class="readonly-warning">
        <span class="material-symbols-outlined text-[12px]">lock</span>
        MODO LECTURA
      </div>

      <div class="legal-info">
        <button class="legal-link" @click="emit('navigate', 'privacy-policy')">Política de privacidad</button>
        <span class="legal-dot">·</span>
        <button class="legal-link" @click="emit('navigate', 'terms-of-use')">Términos de uso</button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background-color: #0a1023;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  z-index: 150;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.3);
}

.mobile-open {
  transform: translateX(0);
}

.logo-area {
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background-color: #0051d5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.logo-title span {
  color: #3b82f6;
}

.logo-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.nav-container {
  flex-grow: 1;
  padding: 0 0.5rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.group-label {
  padding: 0 1rem;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-left: 2px solid #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 20px;
}

.nav-link:hover .nav-icon {
  color: #3b82f6;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background-color: rgba(255, 255, 255, 0.02);
}

.user-profile-strip {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  text-align: left;
}

.profile-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.profile-name {
  font-size: 14px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.profile-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.readonly-warning {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background-color: rgba(220, 38, 38, 0.1);
  color: #f87171;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.legal-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.legal-link:hover {
  color: white;
}

.mobile-open {
  transform: translateX(0);
}

@media (max-width: 768px) {
  .sidebar-nav {
    transform: translateX(-100%);
  }
}
</style>
