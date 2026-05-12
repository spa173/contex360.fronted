<script setup>
import { onMounted } from 'vue'
import { useStateStore } from './stores/stateStore'
import AppShell from './components/AppShell.vue'
import AuthScreen from './components/AuthScreen.vue'
import ToastStack from './components/common/ToastStack.vue'
import { useToasts } from './composables/useToasts'
import { getAuthToken } from './services/authApi'

const store = useStateStore()
const { toasts } = useToasts()

onMounted(async () => {
  if (getAuthToken()) {
    const ok = await store.refreshSessionWithBackend()
    if (ok) {
      await store.fetchBusinessData()
    }
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
