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
import SpotlightCommand from './layout/SpotlightCommand.vue'

const store = useAuthStore()
const themeStore = useThemeStore()
const { pushToast } = useToasts()
const isSidebarOpen = ref(false) // Hidden by default, reveals on hover
const isHoveringSidebar = ref(false)
const emit = defineEmits(['open-admin-panel', 'exit-erp'])

function handleNavigate(viewId) {
  const result = store.setActiveView(viewId)
  if (!result.ok) {
    pushToast(result.message, result.detail || '')
  }
  // Close sidebar after navigation
  isSidebarOpen.value = false
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

function handleSpotlightAction(payload) {
  if (payload.type === 'navigate') {
    handleNavigate(payload.view)
  } else if (payload.type === 'action' && payload.action === 'open-chat') {
    // Logic to open AI chat (assuming ChatAssistant has an open state or we can trigger it)
    console.log('Opening AI Chat from Spotlight...')
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function revealSidebar() {
  isSidebarOpen.value = true
}

function hideSidebar() {
  if (!isHoveringSidebar.value) {
    isSidebarOpen.value = false
  }
}

function setSidebarHover(state) {
  isHoveringSidebar.value = state
  if (state) isSidebarOpen.value = true
  else isSidebarOpen.value = false
}
</script>

<template>
  <div class="app-shell bg-[var(--background)] min-h-screen flex relative overflow-x-hidden">
    <!-- Hover Trigger Zone (Invisible 10px area on left) -->
    <div 
      class="fixed left-0 top-0 bottom-0 w-[10px] z-[210] cursor-pointer"
      @mouseenter="revealSidebar"
    ></div>

    <!-- Persistent Sidebar (Now as Overlay) -->
    <AppSidebar
      :is-open="isSidebarOpen"
      :active-tenant="store.activeTenant"
      :accessible-tenants="store.accessibleTenants"
      :active-view="store.activeView"
      @navigate="handleNavigate"
      @tenant-change="handleTenantChange"
      @hover-start="setSidebarHover(true)"
      @hover-end="setSidebarHover(false)"
    />

    <!-- Main Content Area -->
    <div class="main-wrapper full-width">
      <TopNavigation
        :user="store.currentUser"
        :active-tenant="store.activeTenant"
        :accessible-tenants="store.accessibleTenants"
        :active-membership="store.activeMembership"
        :active-view="store.activeView"
        :sidebar-open="isSidebarOpen"
        :can-switch-tenant="false" 
        @logout="handleLogout"
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
        
        <!-- Chat Assistant Integrated -->
        <ChatAssistant 
          @navigate="handleNavigate"
        />

        <!-- Spotlight Command Bar (Ctrl + K) -->
        <SpotlightCommand @select="handleSpotlightAction" />
      </main>
    </div>

  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--background);
}

.main-wrapper.full-width {
  margin-left: 0 !important;
}

.content-canvas {
  flex: 1;
  margin-top: 64px; /* Height of topnav */
  padding: 24px;
  max-width: 1600px; /* Slightly wider since sidebar is overlay */
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
  background-color: var(--primary);
  border-radius: 9999px;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-foreground);
  z-index: 200;
  transition: transform 0.2s, opacity 0.2s;
}

.ai-floating-trigger:hover {
  transform: scale(1.05);
  background-color: #7c3aed;
}

.ai-floating-trigger span {
  font-size: 28px;
}
</style>
