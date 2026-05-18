<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
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
import AiView from './views/AiView.vue'
import ChatAssistant from './ai/ChatAssistant.vue'
import SpotlightCommand from './layout/SpotlightCommand.vue'

const store = useAuthStore()
const themeStore = useThemeStore()
const { pushToast } = useToasts()
const isSidebarOpen = ref(false)
const emit = defineEmits(['open-admin-panel', 'exit-erp'])

function handleNavigate(viewId) {
  const result = store.setActiveView(viewId)
  if (!result.ok) pushToast(result.message, result.detail || '')
  isSidebarOpen.value = false
}

function handleTenantChange(tenantId) {
  const result = store.setActiveTenant(tenantId)
  if (!result.ok) pushToast(result.message, result.detail || '')
}

function handleLogout() {
  store.logout()
}

function handleNotify(payload) {
  pushToast(payload.message, payload.detail || '')
}

function onWindowNotify(e) {
  if (e.detail) handleNotify(e.detail)
}

onMounted(() => {
  window.addEventListener('notify', onWindowNotify)
})
onUnmounted(() => {
  window.removeEventListener('notify', onWindowNotify)
})

function handleSpotlightAction(payload) {
  if (payload.type === 'navigate') handleNavigate(payload.view)
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA] font-['Inter'] flex">
    <!-- Mobile backdrop -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="lg:hidden fixed inset-0 bg-black/40 z-40"></div>

    <!-- Sidebar -->
    <AppSidebar
      :is-open="isSidebarOpen"
      :active-tenant="store.activeTenant"
      :accessible-tenants="store.accessibleTenants"
      :active-view="store.activeView"
      @navigate="handleNavigate"
      @tenant-change="handleTenantChange"
      @close="isSidebarOpen = false"
      @open-ai-chat="$refs.chatRef?.open()"
    />

    <!-- Main wrapper -->
    <div class="flex-1 min-w-0 flex flex-col">
      <TopNavigation
        :user="store.currentUser"
        :active-tenant="store.activeTenant"
        @logout="handleLogout"
        @toggle-sidebar="toggleSidebar"
        @navigate="handleNavigate"
        @open-admin-panel="emit('open-admin-panel')"
        @notify="handleNotify"
      />

      <main class="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
        <DashboardView v-if="store.activeView === 'dashboard'" :is-active="true" @notify="handleNotify" />
        <BillingView v-if="store.activeView === 'billing'" :is-active="true" @notify="handleNotify" />
        <PurchasesView v-if="store.activeView === 'purchases'" :is-active="true" @notify="handleNotify" />
        <TreasuryView v-if="store.activeView === 'treasury'" :is-active="true" @notify="handleNotify" />
        <InventoryView v-if="store.activeView === 'inventory'" :is-active="true" @notify="handleNotify" />
        <ThirdPartiesView v-if="store.activeView === 'third-parties'" :is-active="true" @notify="handleNotify" />
        <AccountingView v-if="store.activeView === 'accounting'" :is-active="true" @notify="handleNotify" />
        <UsersView v-if="store.activeView === 'users'" :is-active="true" @notify="handleNotify" />
        <ReportsView v-if="store.activeView === 'reports'" :is-active="true" @notify="handleNotify" />
        <QuotesView v-if="store.activeView === 'quotes'" :is-active="true" @notify="handleNotify" />
        <AdminConsoleView v-if="store.activeView === 'admin-console'" :is-active="true" @notify="handleNotify" />
        <TwoFactorView v-if="store.activeView === 'two-factor'" @notify="handleNotify" />
        <ProfileView v-if="store.activeView === 'profile'" :is-active="true" @notify="handleNotify" />
        <AiView v-if="store.activeView === 'ai'" :is-active="true" @notify="handleNotify" />
      </main>

      <ChatAssistant ref="chatRef" @navigate="handleNavigate" />
      <SpotlightCommand @select="handleSpotlightAction" />
    </div>
  </div>
</template>
