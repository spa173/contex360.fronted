<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { useToasts } from '../composables/useToasts'
import AppSidebar from './layout/AppSidebar.vue'
import TopNavigation from './layout/TopNavigation.vue'
import HeroSummary from './layout/HeroSummary.vue'
import AccountingView from './views/AccountingView.vue'
import AiView from './views/AiView.vue'
import BillingView from './views/BillingView.vue'
import PurchasesView from './views/PurchasesView.vue'
import DashboardView from './views/DashboardView.vue'
import InventoryView from './views/InventoryView.vue'
import ThirdPartiesView from './views/ThirdPartiesView.vue'
import UsersView from './views/UsersView.vue'
import AdminConsoleView from './views/AdminConsoleView.vue'
import TwoFactorView from './views/TwoFactorView.vue'
import PrivacyPolicyView from './views/PrivacyPolicyView.vue'
import TermsOfUseView from './views/TermsOfUseView.vue'
import DemoRequestView from './views/DemoRequestView.vue'
import ChangePasswordView from './views/ChangePasswordView.vue'
import ProfileView from './views/ProfileView.vue'
import ChatAssistant from './ai/ChatAssistant.vue'

const store = useAuthStore()
const themeStore = useThemeStore()
const { pushToast } = useToasts()
const isSidebarOpen = ref(false)
const systemStats = ref(null)
const emit = defineEmits(['open-admin-panel', 'exit-erp'])
let healthTimer = null
const HEALTH_INTERVAL_ACTIVE_MS = 3000
const HEALTH_INTERVAL_BACKGROUND_MS = 12000

/* c8 ignore start */
function handleNavigate(viewId) {
  const result = store.setActiveView(viewId)

  if (!result.ok) {
    pushToast(result.message, result.detail || '')
    return
  }

  isSidebarOpen.value = false
}

function handleTenantChange(tenantId) {
  const result = store.setActiveTenant(tenantId)

  if (!result.ok) {
    pushToast(result.message, result.detail || '')
  }
}

function handleLogout() {
  const result = store.logout()

  if (!result.ok) {
    pushToast(result.message, result.detail || '')
  }
}

function handleNotify(payload) {
  pushToast(payload.message, payload.detail || '')
}

function openSidebar() {
  isSidebarOpen.value = true
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleSidebarToggle() {
  isSidebarOpen.value = !isSidebarOpen.value
}
/* c8 ignore stop */

/* c8 ignore start */
onMounted(() => {
  const scheduleNextHealthCheck = () => {
    const delay = document.visibilityState === 'hidden' ? HEALTH_INTERVAL_BACKGROUND_MS : HEALTH_INTERVAL_ACTIVE_MS
    healthTimer = globalThis.setTimeout(() => {
    const health = store.checkCurrentSessionHealth()
    if (health.revoked) {
      pushToast('Sesión finalizada', health.message || 'Debes iniciar sesión nuevamente.')
    }
    store.processScheduledDeactivations()
      scheduleNextHealthCheck()
    }, delay)
  }

  scheduleNextHealthCheck()

  if (store.currentUser?.isSystemOwner) {
    businessApi.getAdminStats().then(s => { systemStats.value = s }).catch(() => {})
  }
})
/* c8 ignore stop */

onUnmounted(() => {
  if (healthTimer) {
    globalThis.clearTimeout(healthTimer)
    healthTimer = null
  }
})
</script>

<template>
  <div class="app app-shell">
    <div class="sidebar-trigger" @mouseenter="openSidebar"></div>
    <AppSidebar
      :is-open="isSidebarOpen"
      @navigate="handleNavigate"
      @mouseenter="openSidebar"
      @mouseleave="closeSidebar"
    />

    <main class="main main-panel">
      <TopNavigation
        :user="store.currentUser"
        :active-tenant="store.activeTenant"
        :accessible-tenants="store.accessibleTenants"
        :active-membership="store.activeMembership"
        :active-view="store.activeView"
        :sidebar-open="isSidebarOpen"
        :is-dark="themeStore.isDark"
        :can-switch-tenant="(store.accessibleTenants?.length || 0) > 1 && store.isAdmin"
        @logout="handleLogout"
        @tenant-change="handleTenantChange"
        @toggle-sidebar="handleSidebarToggle"
        @toggle-theme="themeStore.toggleTheme"
        @navigate="handleNavigate"
        @open-admin-panel="emit('open-admin-panel')"
        @exit-erp="emit('exit-erp')"
      />

      <div class="content">
        <HeroSummary @navigate="handleNavigate" />

        <DashboardView
          v-if="store.visibleViews.includes('dashboard')"
          :is-active="store.activeView === 'dashboard'"
        />
        <BillingView
          v-if="store.visibleViews.includes('billing')"
          :is-active="store.activeView === 'billing'"
          @notify="handleNotify"
        />
        <PurchasesView
          v-if="store.visibleViews.includes('purchases')"
          :is-active="store.activeView === 'purchases'"
          @notify="handleNotify"
        />
        <InventoryView
          v-if="store.visibleViews.includes('inventory')"
          :is-active="store.activeView === 'inventory'"
          @notify="handleNotify"
        />
        <AccountingView
          v-if="store.visibleViews.includes('accounting')"
          :is-active="store.activeView === 'accounting'"
        />
        <ThirdPartiesView
          v-if="store.visibleViews.includes('third-parties')"
          :is-active="store.activeView === 'third-parties'"
          @notify="handleNotify"
        />
        <UsersView
          v-if="store.visibleViews.includes('users')"
          :is-active="store.activeView === 'users'"
          @notify="handleNotify"
        />
        <AiView
          v-if="store.visibleViews.includes('ai')"
          :is-active="store.activeView === 'ai'"
          @notify="handleNotify"
        />
        <AdminConsoleView
          v-if="store.visibleViews.includes('admin-console')"
          :is-active="store.activeView === 'admin-console'"
        />
        <TwoFactorView
          v-if="store.activeView === 'two-factor'"
        />
        <PrivacyPolicyView
          v-if="store.activeView === 'privacy-policy'"
        />
        <TermsOfUseView
          v-if="store.activeView === 'terms-of-use'"
        />
        <DemoRequestView
          v-if="store.activeView === 'demo'"
        />
        <ChangePasswordView
          v-if="store.activeView === 'change-password'"
        />
        <ProfileView
          v-if="store.activeView === 'profile'"
          :is-active="store.activeView === 'profile'"
          @notify="handleNotify"
        />
      </div>
    </main>
    <ChatAssistant @navigate="store.setActiveView" />

  </div>
</template>
