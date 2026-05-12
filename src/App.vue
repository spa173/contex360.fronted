<script setup>
import { onMounted } from 'vue'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'
import AppShell from './components/AppShell.vue'
import AuthScreen from './components/AuthScreen.vue'
import ToastStack from './components/common/ToastStack.vue'
import { useToasts } from './composables/useToasts'

const store = useStateStore()
const themeStore = useThemeStore()
const { toasts } = useToasts()

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
    <AuthScreen v-if="!store.currentUser" />
    <AppShell v-else />
    <ToastStack :toasts="toasts" />
  </div>
</template>
