<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useOnboardingStore } from '../stores/onboardingStore'
import { useTranslationStore } from '../stores/translationStore'
import { useToasts } from '../composables/useToasts'
import { usePlanAccess } from '../composables/usePlanAccess'
import { businessApi } from '../services/businessApi'
import AppSidebar from './layout/AppSidebar.vue'
import TopNavigation from './layout/TopNavigation.vue'

const DashboardView     = defineAsyncComponent(() => import('./views/DashboardView.vue'))
const BillingView       = defineAsyncComponent(() => import('./views/BillingView.vue'))
const PurchasesView     = defineAsyncComponent(() => import('./views/PurchasesView.vue'))
const TreasuryView      = defineAsyncComponent(() => import('./views/TreasuryView.vue'))
const QuotesView        = defineAsyncComponent(() => import('./views/QuotesView.vue'))
const ReportsView       = defineAsyncComponent(() => import('./views/ReportsView.vue'))
const InventoryView     = defineAsyncComponent(() => import('./views/InventoryView.vue'))
const ThirdPartiesView  = defineAsyncComponent(() => import('./views/ThirdPartiesView.vue'))
const UsersView         = defineAsyncComponent(() => import('./views/UsersView.vue'))
const AdminConsoleView  = defineAsyncComponent(() => import('./views/AdminConsoleView.vue'))
const AccountingView    = defineAsyncComponent(() => import('./views/AccountingView.vue'))
const TwoFactorView     = defineAsyncComponent(() => import('./views/TwoFactorView.vue'))
const ProfileView       = defineAsyncComponent(() => import('./views/ProfileView.vue'))
const AiView            = defineAsyncComponent(() => import('./views/AiView.vue'))
const HelpCenterView    = defineAsyncComponent(() => import('./views/HelpCenterView.vue'))
const SubscriptionView  = defineAsyncComponent(() => import('./views/SubscriptionView.vue'))
const PrivacySettingsView = defineAsyncComponent(() => import('./views/PrivacySettingsView.vue'))
const PlansView         = defineAsyncComponent(() => import('./views/PlansView.vue'))
const OnboardingView    = defineAsyncComponent(() => import('./views/OnboardingView.vue'))
const ChatAssistant     = defineAsyncComponent(() => import('./ai/ChatAssistant.vue'))
const SpotlightCommand  = defineAsyncComponent(() => import('./layout/SpotlightCommand.vue'))
const AlertsCenterModal = defineAsyncComponent(() => import('./common/AlertsCenterModal.vue'))
const TrialExpiredOverlay = defineAsyncComponent(() => import('./common/TrialExpiredOverlay.vue'))

const store = useAuthStore()
const onboardingStore = useOnboardingStore()
const translationStore = useTranslationStore()
const { pushToast } = useToasts()
const { isFeatureLocked, isTrialExpired } = usePlanAccess()
const isSidebarOpen = ref(false)
const emit = defineEmits(['open-admin-panel', 'exit-erp'])

function handleNavigate(viewId) {
  if (isTrialExpired.value && viewId !== 'plans' && viewId !== 'subscription') {
    store.setActiveView('plans')
    isSidebarOpen.value = false
    pushToast('Tu prueba ha expirado', 'Elige un plan para continuar usando Contex360.')
    return
  }
  if (isFeatureLocked(viewId)) {
    store.setActiveView('plans')
    isSidebarOpen.value = false
    return
  }
  const result = store.setActiveView(viewId)
  if (!result.ok) pushToast(result.message, result.detail || '')
  isSidebarOpen.value = false
}

function handleTenantChange(tenantId) {
  const result = store.setActiveTenant(tenantId)
  if (!result.ok) pushToast(result.message, result.detail || '')
}

function handleLogout() {
  void store.logout()
}

function handleNotify(payload) {
  pushToast(payload.message, payload.detail || '')
}

function onWindowNotify(e) {
  if (e.detail) handleNotify(e.detail)
}

function onWindowNavigate(e) {
  if (e.detail) handleNavigate(e.detail)
}

onMounted(async () => {
  translationStore.initLanguage()
  window.addEventListener('notify', onWindowNotify)
  window.addEventListener('navigate', onWindowNavigate)
  await onboardingStore.checkOnboardingStatus()
  await checkPendingContracts()
})

// Re-check onboarding status when the active tenant changes
watch(() => store.activeTenant?.id, async () => {
  await onboardingStore.checkOnboardingStatus()
  await checkPendingContracts()
})
onUnmounted(() => {
  window.removeEventListener('notify', onWindowNotify)
  window.removeEventListener('navigate', onWindowNavigate)
})

function handleSpotlightAction(payload) {
  if (payload.type === 'navigate') handleNavigate(payload.view)
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

const pendingContracts = ref([])
const currentContractIndex = ref(0)
async function checkPendingContracts() {
  try {
    pendingContracts.value = await businessApi.getContratosPendientes(store.activeTenant?.id || null)
  } catch { pendingContracts.value = [] }
}
async function acceptCurrentContract() {
  const c = pendingContracts.value[currentContractIndex.value]
  if (!c) return
  try {
    await businessApi.aceptarContrato(c.id, {}, store.activeTenant?.id || null)
    pushToast(`Contrato "${c.titulo}" aceptado`)
    if (currentContractIndex.value < pendingContracts.value.length - 1) {
      currentContractIndex.value++
    } else {
      pendingContracts.value = []
      currentContractIndex.value = 0
    }
  } catch (e) {
    pushToast('Error al aceptar contrato', e.message)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA] font-['Inter'] flex">
    <!-- Mobile backdrop -->
    <div
      v-if="isSidebarOpen"
      class="lg:hidden fixed inset-0 bg-black/40 z-40"
      @click="isSidebarOpen = false"
    />

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

    <!-- Onboarding flow when not completed -->
    <template v-if="onboardingStore.isOnboardingRequired && !onboardingStore.isCheckingOnboarding">
      <OnboardingView :is-active="true" />
    </template>

    <!-- Main wrapper (hidden during onboarding) -->
    <template v-else>
      <div class="flex-1 min-w-0 flex flex-col">
        <TopNavigation
          :user="store.currentUser"
          :active-tenant="store.activeTenant"
          :active-membership="store.activeMembership"
          :accessible-tenants="store.accessibleTenants"
          @logout="handleLogout"
          @toggle-sidebar="toggleSidebar"
          @navigate="handleNavigate"
          @open-admin-panel="emit('open-admin-panel')"
          @notify="handleNotify"
        />

        <main class="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <DashboardView
            v-if="store.activeView === 'dashboard'"
            :is-active="true"
            @notify="handleNotify"
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
            @notify="handleNotify"
          />
          <TwoFactorView
            v-if="store.activeView === 'two-factor'"
            @notify="handleNotify"
          />
          <ProfileView
            v-if="store.activeView === 'profile'"
            :is-active="true"
            @notify="handleNotify"
          />
          <AiView
            v-if="store.activeView === 'ai'"
            :is-active="true"
            @notify="handleNotify"
          />
          <HelpCenterView
            v-if="store.activeView === 'help-center'"
            :is-active="true"
            @notify="handleNotify"
          />
          <SubscriptionView
            v-if="store.activeView === 'subscription'"
            :is-active="true"
            @notify="handleNotify"
            @navigate="handleNavigate"
          />
          <PlansView
            v-if="store.activeView === 'plans'"
            :is-active="true"
            @notify="handleNotify"
          />
          <PrivacySettingsView
            v-if="store.activeView === 'privacy-settings'"
            :is-active="true"
            @notify="handleNotify"
          />
        </main>

        <ChatAssistant
          ref="chatRef"
          @navigate="handleNavigate"
        />
        <SpotlightCommand @select="handleSpotlightAction" />
        <AlertsCenterModal />
        <TrialExpiredOverlay @navigate="handleNavigate" />
      </div>
    </template>

    <!-- Pending contracts re-acceptance modal -->
    <Teleport to="body">
      <div
        v-if="pendingContracts.length > 0"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
          <div class="p-6 border-b border-zinc-100">
            <h2 class="text-lg font-semibold text-[#18181B]">
              Actualización de contratos
            </h2>
            <p class="text-sm text-[#52525B] mt-1">
              {{ currentContractIndex + 1 }} de {{ pendingContracts.length }} — revisa y acepta
            </p>
          </div>
          <div class="p-6 flex-1 overflow-y-auto">
            <h3 class="font-semibold text-[#18181B] mb-3">
              {{ pendingContracts[currentContractIndex]?.titulo }}
            </h3>
            <div class="text-sm text-[#52525B] leading-relaxed whitespace-pre-line">
              {{ pendingContracts[currentContractIndex]?.cuerpo }}
            </div>
          </div>
          <div class="p-6 border-t border-zinc-100 flex justify-end gap-3">
            <button
              class="px-4 py-2 rounded-lg text-sm font-medium bg-[#18181B] text-white hover:bg-[#27272A] transition-colors"
              @click="acceptCurrentContract"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
