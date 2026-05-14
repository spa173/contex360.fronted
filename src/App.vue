<script setup>
import { onMounted, ref, computed } from 'vue'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'
import AppShell from './components/AppShell.vue'
import RootShell from './components/RootShell.vue'
import AuthScreen from './components/AuthScreen.vue'
import DemoRequestView from './components/views/DemoRequestView.vue'
import ToastStack from './components/common/ToastStack.vue'
import SessionRecoveryModal from './components/ui/SessionRecoveryModal.vue'
import { useToasts } from './composables/useToasts'

const store = useStateStore()
const themeStore = useThemeStore()
const { toasts } = useToasts()
const showDemo = ref(false)
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
    <DemoRequestView v-if="!store.currentUser && showDemo" @back="showDemo = false" />
    <AuthScreen v-else-if="!store.currentUser" @request-demo="showDemo = true" />
    <RootShell v-else-if="showRootPanel" @enter-erp="viewingAdminPanel = false" />
    <AppShell v-else @open-admin-panel="viewingAdminPanel = true" />
    <SessionRecoveryModal />
    <ToastStack :toasts="toasts" />
  </div>
</template>
