<script setup>
import { onMounted, ref, computed } from 'vue'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'
import AppShell from './components/AppShell.vue'
import RootShell from './components/RootShell.vue'
import AuthScreen from './components/AuthScreen.vue'
import DemoRequestView from './components/views/DemoRequestView.vue'
import LandingPage from './components/LandingPage.vue'
import AboutView from './components/views/AboutView.vue'
import PrivacyPolicyView from './components/views/PrivacyPolicyView.vue'
import TermsOfUseView from './components/views/TermsOfUseView.vue'
import ToastStack from './components/common/ToastStack.vue'
import SessionRecoveryModal from './components/ui/SessionRecoveryModal.vue'
import AppLoading from './components/layout/AppLoading.vue'
import { Toaster } from 'vue-sonner'
import { useToasts } from './composables/useToasts'

const store = useStateStore()
const themeStore = useThemeStore()
const { toasts } = useToasts()
const showDemo = ref(false)
const showAuth = ref(false)
const showPrivacy = ref(false)
const showTerms = ref(false)
const showAbout = ref(false)
const viewingAdminPanel = ref(false)
const isLoading = ref(true)
const loadError = ref(null)

const showRootPanel = computed(
  () => store.currentUser?.isSystemOwner && viewingAdminPanel.value
)

// --- Navegación Inteligente (Push vs Replace) ---
const syncUrlWithState = (path, replace = false) => {
  const currentPath = window.location.pathname
  if (currentPath === path) return
  
  if (replace) {
    window.history.replaceState({ path }, '', path)
  } else {
    window.history.pushState({ path }, '', path)
  }
}

// Watchers para sincronizar estado -> URL
import { watch } from 'vue'

watch(() => store.currentUser, (user) => {
  if (user) {
    syncUrlWithState('/dashboard', true) // REPLACE al entrar a la app
  } else if (!showAuth.value && !showDemo.value && !showPrivacy.value && !showTerms.value && !showAbout.value) {
    syncUrlWithState('/', true)
  }
}, { immediate: true })

watch(showAuth, (val) => val && syncUrlWithState('/login'))
watch(showDemo, (val) => val && syncUrlWithState('/demo'))
watch(showAbout, (val) => val && syncUrlWithState('/nosotros'))
watch(showPrivacy, (val) => val && syncUrlWithState('/privacidad'))
watch(showTerms, (val) => val && syncUrlWithState('/terminos'))

// Manejador del botón "Atrás" del navegador
const handlePopState = (event) => {
  const path = event.state?.path || window.location.pathname
  
  // Reset de todos los estados
  showAuth.value = false
  showDemo.value = false
  showPrivacy.value = false
  showTerms.value = false
  showAbout.value = false

  if (path === '/login') showAuth.value = true
  else if (path === '/demo') showDemo.value = true
  else if (path === '/nosotros') showAbout.value = true
  else if (path === '/privacidad') showPrivacy.value = true
  else if (path === '/terminos') showTerms.value = true
}

themeStore.initializeTheme()

async function initApp() {
  isLoading.value = true
  loadError.value = null

  const TIMEOUT_SYMBOL = Symbol('timeout')
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve(TIMEOUT_SYMBOL), 10000)
  )

  try {
    const result = await Promise.race([store.refreshSessionWithBackend(), timeout])
    
    if (result === TIMEOUT_SYMBOL) {
      loadError.value = 'El servidor tardó demasiado en responder. Verifica tu conexión.'
      return
    }
    
    // If result is true, we have a session. If false, we don't (but it's not an error).
    if (result === true) {
      await store.fetchBusinessData()
    }
  } catch (e) {
    loadError.value = e?.message || 'Error al conectar con el servidor.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  initApp()
  window.addEventListener('popstate', handlePopState)
  
  // Sincronización inicial basada en URL al cargar
  const initialPath = window.location.pathname
  if (initialPath === '/login') showAuth.value = true
  else if (initialPath === '/demo') showDemo.value = true
})
</script>

<template>
  <div class="app-root">
    <!-- Initial load skeleton -->
    <AppLoading
      v-if="isLoading || loadError"
      :error="loadError"
      @retry="initApp"
    />

    <!-- App ready -->
    <template v-else>
      <!-- Authenticated states -->
      <template v-if="store.currentUser">
        <RootShell v-if="showRootPanel" @enter-erp="viewingAdminPanel = false" />
        <AppShell v-else @open-admin-panel="viewingAdminPanel = true" />
      </template>

      <!-- Public states (unauthenticated) -->
      <template v-else>
        <DemoRequestView v-if="showDemo" @back="showDemo = false" />
        <AuthScreen v-else-if="showAuth" @request-demo="showDemo = true" @show-privacy="showPrivacy = true" @back="showAuth = false" />
        <AboutView
          v-else-if="showAbout"
          @back="showAbout = false"
          @request-demo="showDemo = true"
          @login="showAuth = true"
        />
        <PrivacyPolicyView v-else-if="showPrivacy" @back="showPrivacy = false" />
        <TermsOfUseView v-else-if="showTerms" @back="showTerms = false" />
        <LandingPage
          v-else
          @login="showAuth = true"
          @request-demo="showDemo = true"
          @show-privacy="showPrivacy = true"
          @show-terms="showTerms = true"
          @show-about="showAbout = true"
        />
      </template>
    </template>

    <SessionRecoveryModal />
    <Toaster position="top-right" richColors />
    <ToastStack :toasts="toasts" />
  </div>
</template>
