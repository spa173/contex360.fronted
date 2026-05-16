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

function handleTenantChange(tenantId) {
  emit('tenant-change', tenantId)
}
</script>

<template>
  <header class="top-nav">
    <div class="nav-container">
      <!-- Left: Context & Tenant Tabs -->
      <div class="nav-left">
        <button
          @click="emit('toggle-sidebar')"
          class="sidebar-toggle md:hidden"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>

        <span class="nav-brand hidden lg:block">Contex360</span>

        <nav class="tenant-tabs">
          <button
            v-for="tenant in accessibleTenants"
            :key="tenant.id"
            @click="handleTenantChange(tenant.id)"
            :class="['tenant-tab', { active: activeTenant?.id === tenant.id }]"
          >
            {{ tenant.name }}
            <span class="material-symbols-outlined text-[18px] ml-1 opacity-70">expand_more</span>
          </button>
        </nav>
      </div>

      <!-- Right: Actions & Profile -->
      <div class="nav-right">
        <div class="action-icons">
          <button class="icon-btn" title="Notificaciones">
            <span class="material-symbols-outlined">notifications</span>
          </button>
          <button class="icon-btn" title="Apps">
            <span class="material-symbols-outlined">apps</span>
          </button>
          <button class="icon-btn" title="Ayuda">
            <span class="material-symbols-outlined">help</span>
          </button>
        </div>

        <div class="v-divider"></div>

        <div class="profile-block" @click="emit('navigate', 'profile')">
          <div class="profile-info text-right hidden sm:block">
            <p class="u-name">System Owner</p>
            <p class="u-role">Admin</p>
          </div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNox0mrq9yfLyncFpelSs-7YE-Y-YrTye0D7kE7-dPypDKWU1P6bMmmqLkqhIhML7RxmzCjasXSdxRZwnGhyD64VTJG6vjGnt45ipdG9zQbUTk_QKJmgoXbtdZCN6u8YgDly4nJHhocnijLuF3bkisw5LDrbwN38s_qe3-gqMZxBMCnw-qWXVANtFBbDZ1bEJQAJ4zFw2n0cUfZbekvdIYzbe40WnmI9niHawK96kgRrR5gwqWjmYRGNkyjhejD9i2n_SZMPPSps0w" 
            alt="Profile" 
            class="u-avatar"
          />
        </div>
        
        <button @click="emit('logout')" class="logout-btn" title="Cerrar Sesión">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  height: 64px;
  background-color: #ffffff;
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  right: 0;
  width: 100%; /* Full width as sidebar is now an overlay */
  z-index: 100;
  display: flex;
  align-items: center;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (max-width: 768px) {
  .top-nav { width: 100%; }
}

.nav-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 64px;
}

.nav-brand {
  font-size: 20px;
  font-weight: 700;
  color: #1E293B;
}

.tenant-tabs {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  height: 100%;
}

.tenant-tab {
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #64748B;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tenant-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 700;
}

.tenant-tab:hover:not(.active) {
  color: #1E293B;
  border-bottom-color: #E2E8F0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  color: #64748B;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #6b38d4;
}

.v-divider {
  width: 1px;
  height: 24px;
  background-color: #E2E8F0;
  margin: 0 0.5rem;
}

.profile-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.profile-block:hover {
  background-color: #f8fafc;
}

.u-name {
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
  line-height: 1.2;
}

.u-role {
  font-size: 11px;
  color: #64748B;
}

.u-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 1px solid #E2E8F0;
}

.logout-btn {
  color: #94a3b8;
  padding: 0.5rem;
  border-radius: 9999px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}
</style>
