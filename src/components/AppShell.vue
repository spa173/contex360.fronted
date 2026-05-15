<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { useToasts } from '../composables/useToasts'
import AppSidebar from './layout/AppSidebar.vue'
import TopNavigation from './layout/TopNavigation.vue'
import DashboardView from './views/DashboardView.vue'
import BillingView from './views/BillingView.vue'
import PurchasesView from './views/PurchasesView.vue'
import TreasuryView from './views/TreasuryView.vue'
import QuotesView from './views/QuotesView.vue'
import ReportsView from './views/ReportsView.vue'
import InventoryView from './views/InventoryView.vue'
import ThirdPartiesView from './views/ThirdPartiesView.vue'
import UsersView from './views/UsersView.vue'
import AdminConsoleView from './views/AdminConsoleView.vue'
import AccountingView from './views/AccountingView.vue'
import TwoFactorView from './views/TwoFactorView.vue'
import ProfileView from './views/ProfileView.vue'
import ChatAssistant from './ai/ChatAssistant.vue'

const store = useAuthStore()
const themeStore = useThemeStore()
const { pushToast } = useToasts()
const isSidebarOpen = ref(true) // Sidebar persistent on desktop
const emit = defineEmits(['open-admin-panel', 'exit-erp'])

function handleNavigate(viewId) {
  const result = store.setActiveView(viewId)
  if (!result.ok) {
    pushToast(result.message, result.detail || '')
  }
}

function handleTenantChange(tenantId) {
  const result = store.setActiveTenant(tenantId)
  if (!result.ok) {
    pushToast(result.message, result.detail || '')
  }
}

function handleLogout() {
  store.logout()
}

function handleNotify(payload) {
  pushToast(payload.message, payload.detail || '')
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="app-shell bg-[#faf8ff] min-h-screen flex">
    <!-- Persistent Sidebar -->
    <AppSidebar
      :is-open="isSidebarOpen"
      @navigate="handleNavigate"
    />

    <!-- Main Content Area -->
    <div :class="['main-wrapper', { 'sidebar-collapsed': !isSidebarOpen }]">
      <TopNavigation
        :user="store.currentUser"
        :active-tenant="store.activeTenant"
        :accessible-tenants="store.accessibleTenants"
        :active-membership="store.activeMembership"
        :active-view="store.activeView"
        :sidebar-open="isSidebarOpen"
        :can-switch-tenant="(store.accessibleTenants?.length || 0) > 1"
        @logout="handleLogout"
        @tenant-change="handleTenantChange"
        @toggle-sidebar="toggleSidebar"
        @navigate="handleNavigate"
        @open-admin-panel="emit('open-admin-panel')"
      />

      <main class="content-canvas">
        <DashboardView
          v-if="store.activeView === 'dashboard'"
          :is-active="true"
        />
        <BillingView
          v-if="store.activeView === 'billing'"
          :is-active="true"
          @notify="handleNotify"
        />
        <PurchasesView
          v-if="store.activeView === 'purchases'"
          :is-active="true"
          @notify="handleNotify"
        />
        <TreasuryView
          v-if="store.activeView === 'treasury'"
          :is-active="true"
          @notify="handleNotify"
        />
        <InventoryView
          v-if="store.activeView === 'inventory'"
          :is-active="true"
          @notify="handleNotify"
        />
        <ThirdPartiesView
          v-if="store.activeView === 'third-parties'"
          :is-active="true"
          @notify="handleNotify"
        />
        <AccountingView
          v-if="store.activeView === 'accounting'"
          :is-active="true"
          @notify="handleNotify"
        />
        <UsersView
          v-if="store.activeView === 'users'"
          :is-active="true"
          @notify="handleNotify"
        />
        <ReportsView
          v-if="store.activeView === 'reports'"
          :is-active="true"
          @notify="handleNotify"
        />
        <QuotesView
          v-if="store.activeView === 'quotes'"
          :is-active="true"
          @notify="handleNotify"
        />
        <AdminConsoleView
          v-if="store.activeView === 'admin-console'"
          :is-active="true"
        />
        <TwoFactorView
          v-if="store.activeView === 'two-factor'"
        />
        <ProfileView
          v-if="store.activeView === 'profile'"
          :is-active="true"
          @notify="handleNotify"
        />
      </main>
    </div>

    <!-- Floating AI Assistant Button -->
    <button 
      class="ai-floating-trigger"
      @click="handleNavigate('ai')"
    >
      <span class="material-symbols-outlined">smart_toy</span>
    </button>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
}

.main-wrapper {
  flex: 1;
  margin-left: 260px; /* Width of sidebar */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-wrapper.sidebar-collapsed {
  margin-left: 0;
}

.content-canvas {
  flex: 1;
  margin-top: 64px; /* Height of topnav */
  padding: 24px;
  max-width: 1440px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.ai-floating-trigger {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background-color: #8455ef;
  border-radius: 9999px;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 200;
  transition: transform 0.2s, background-color 0.2s;
}

.ai-floating-trigger:hover {
  transform: scale(1.05);
  background-color: #6b38d4;
}

.ai-floating-trigger span {
  font-size: 28px;
}
</style>
