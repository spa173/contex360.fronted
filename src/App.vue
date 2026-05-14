<script setup>
import { onMounted, ref, computed } from 'vue'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'
import AppShell from './components/AppShell.vue'
import RootShell from './components/RootShell.vue'
import AuthScreen from './components/AuthScreen.vue'
import DemoRequestView from './components/views/DemoRequestView.vue'
import LandingPage from './components/LandingPage.vue'
import ToastStack from './components/common/ToastStack.vue'
import SessionRecoveryModal from './components/ui/SessionRecoveryModal.vue'
import { Toaster } from 'vue-sonner'
import { useToasts } from './composables/useToasts'

const store = useStateStore()
const themeStore = useThemeStore()
const { toasts } = useToasts()
const showDemo = ref(false)
const showAuth = ref(false)
const viewingAdminPanel = ref(false)

const showRootPanel = computed(
  () => store.currentUser?.isSystemOwner && viewingAdminPanel.value
)

themeStore.initializeTheme()

onMounted(async () => {
  const ok = await store.refreshSessionWithBackend()
  if (ok) {
    await store.fetchBusinessData()
  }
})
</script>

<template>
  <div class="app-root">
    <!-- Authenticated states -->
    <template v-if="store.currentUser">
      <RootShell v-if="showRootPanel" @enter-erp="viewingAdminPanel = false" />
      <AppShell v-else @open-admin-panel="viewingAdminPanel = true" />
    </template>

    <!-- Public states (unauthenticated) -->
    <template v-else>
      <DemoRequestView v-if="showDemo" @back="showDemo = false" />
      <AuthScreen v-else-if="showAuth" @request-demo="showDemo = true" @back="showAuth = false" />
      <LandingPage
        v-else
        @login="showAuth = true"
        @request-demo="showDemo = true"
      />
    </template>

    <SessionRecoveryModal />
    <Toaster position="top-right" richColors />
    <ToastStack :toasts="toasts" />
  </div>
</template>
