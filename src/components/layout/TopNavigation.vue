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

const pageTitle = computed(() => viewLabels[props.activeView] || 'Dashboard')

function handleTenantChange(event) {
  emit('tenant-change', event.target.value)
}
</script>

<template>
  <header class="top-nav">
    <div class="nav-container">
      <!-- Left: Sidebar Toggle & Context -->
      <div class="nav-left">
        <button
          @click="emit('toggle-sidebar')"
          class="sidebar-toggle"
        >
          <span class="material-symbols-outlined">{{ sidebarOpen ? 'menu_open' : 'menu' }}</span>
        </button>

        <!-- Multi-tenant Selector -->
        <div class="tenant-selector-wrapper">
          <div class="tenant-selector">
            <span class="material-symbols-outlined tenant-icon">domain</span>
            <select
              :disabled="!canSwitchTenant"
              :value="activeTenant?.id"
              @change="handleTenantChange"
              class="tenant-select"
            >
              <option v-for="tenant in accessibleTenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
            <span class="material-symbols-outlined expand-icon">expand_more</span>
          </div>
        </div>

        <div class="nav-divider"></div>

        <div class="module-info">
          <span class="module-tag">@{{ activeView }}</span>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="nav-right">
        <div class="action-buttons">
          <button class="action-btn" title="Notificaciones">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="action-btn" title="Ayuda">
            <span class="material-symbols-outlined">help</span>
          </button>
          <button 
            v-if="user?.isSystemOwner"
            @click="emit('open-admin-panel')"
            class="action-btn" 
            title="Configuración"
          >
            <span class="material-symbols-outlined">settings</span>
          </button>
          
          <div class="user-pill" @click="emit('navigate', 'profile')">
            <div class="user-avatar">
              {{ user?.name?.[0]?.toUpperCase() || 'U' }}
            </div>
            <div class="user-details">
              <span class="u-name">{{ user?.name || 'Usuario' }}</span>
            </div>
          </div>

          <button @click="emit('logout')" class="logout-btn" title="Cerrar Sesión">
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 140; /* Just below sidebar */
}

.nav-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-grow: 1;
}

.sidebar-toggle {
  display: none;
  color: #64748b;
  transition: color 0.2s;
}

@media (max-width: 768px) {
  .sidebar-toggle { display: block; }
}

.tenant-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  position: relative;
  transition: border-color 0.2s;
}

.tenant-selector:hover {
  border-color: #0051d5;
}

.tenant-icon {
  color: #0051d5;
  font-size: 20px;
}

.tenant-select {
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #0b1c30;
  padding: 0;
  padding-right: 1.5rem;
  appearance: none;
  cursor: pointer;
  outline: none;
  max-width: 240px;
}

.expand-icon {
  position: absolute;
  right: 0.5rem;
  pointer-events: none;
  font-size: 18px;
  color: #64748b;
}

.nav-divider {
  height: 1.5rem;
  width: 1px;
  background-color: #e2e8f0;
}

.module-tag {
  font-size: 12px;
  font-weight: 500;
  color: #0051d5;
  background-color: #e5eeff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.5rem;
  color: #45464d;
  border-radius: 9999px;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #eff4ff;
  color: #0051d5;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem;
  padding-right: 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.user-pill:hover {
  border-color: #0051d5;
  background-color: white;
}

.user-avatar {
  width: 2rem;
  height: 2.5rem;
  background-color: #0051d5;
  color: white;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.u-name {
  font-size: 13px;
  font-weight: 600;
  color: #0b1c30;
}

.logout-btn {
  padding: 0.5rem;
  color: #94a3b8;
  border-radius: 9999px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}
</style>
