<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useToasts } from '../composables/useToasts'
import AppSidebar from './layout/AppSidebar.vue'
import AppTopbar from './layout/AppTopbar.vue'
import HeroSummary from './layout/HeroSummary.vue'
import AccountingView from './views/AccountingView.vue'
import AiView from './views/AiView.vue'
import BillingView from './views/BillingView.vue'
import DashboardView from './views/DashboardView.vue'
import InventoryView from './views/InventoryView.vue'
import ThirdPartiesView from './views/ThirdPartiesView.vue'
import UsersView from './views/UsersView.vue'
import AdminConsoleView from './views/AdminConsoleView.vue'
import TwoFactorView from './views/TwoFactorView.vue'
import ChatAssistant from './ai/ChatAssistant.vue'

const store = useAuthStore()
const { pushToast } = useToasts()
const isSidebarOpen = ref(false)
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
  <div :class="['sidebar-overlay', { show: isSidebarOpen }]" @click="closeSidebar"></div>

  <div class="app app-shell">
    <AppSidebar :is-open="isSidebarOpen" @navigate="handleNavigate" />

    <main class="main main-panel">
      <AppTopbar
        @logout="handleLogout"
        @tenant-change="handleTenantChange"
        @toggle-sidebar="openSidebar"
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
      </div>
    </main>
    <ChatAssistant @navigate="store.setActiveView" />
  </div>
</template>
