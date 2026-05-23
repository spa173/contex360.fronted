<script setup>
import { onMounted, ref, computed } from 'vue'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'
import AppShell from './components/AppShell.vue'
import RootShell from './components/RootShell.vue'
import AuthScreen from './components/AuthScreen.vue'
import DemoRequestView from './components/views/DemoRequestView.vue'
import PricingView from './components/views/PricingView.vue'
import LandingPage from './components/LandingPage.vue'
import AboutView from './components/views/AboutView.vue'
import PrivacyPolicyView from './components/views/PrivacyPolicyView.vue'
import TermsOfUseView from './components/views/TermsOfUseView.vue'
import ForgotPasswordView from './components/views/ForgotPasswordView.vue'
import ResetPasswordView from './components/views/ResetPasswordView.vue'
import ToastStack from './components/common/ToastStack.vue'
import SessionRecoveryModal from './components/ui/SessionRecoveryModal.vue'
import AppLoading from './components/layout/AppLoading.vue'
import PaymentSuccess from './components/views/PaymentSuccess.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
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
const showPricing = ref(false)
const showPaymentSuccess = ref(false)
const showForgotPassword = ref(false)
const showResetPassword = ref(false)
const paymentSuccessPlan = ref('')
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
  themeStore.setForceLightMode(!user)
  if (user) {
    syncUrlWithState('/dashboard', true) // REPLACE al entrar a la app
  } else if (!showAuth.value && !showDemo.value && !showPrivacy.value && !showTerms.value && !showAbout.value && !showPricing.value && !showPaymentSuccess.value && !showForgotPassword.value && !showResetPassword.value) {
    syncUrlWithState('/', true)
  }
}, { immediate: true })

watch(showAuth, (val) => val && syncUrlWithState('/login'))
watch(showDemo, (val) => val && syncUrlWithState('/demo'))
watch(showAbout, (val) => val && syncUrlWithState('/nosotros'))
watch(showPrivacy, (val) => val && syncUrlWithState('/privacidad'))
watch(showTerms, (val) => val && syncUrlWithState('/terminos'))
watch(showPricing, (val) => val && syncUrlWithState('/precios'))
watch(showForgotPassword, (val) => val && syncUrlWithState('/forgot-password'))
watch(showResetPassword, (val) => val && syncUrlWithState('/reset-password'))

// Manejador del botón "Atrás" del navegador
const handlePopState = (event) => {
  const path = event.state?.path || window.location.pathname
  
  // Reset de todos los estados
  showAuth.value = false
  showDemo.value = false
  showPrivacy.value = false
  showTerms.value = false
  showAbout.value = false
  showPricing.value = false
  showPaymentSuccess.value = false
  showForgotPassword.value = false
  showResetPassword.value = false

  if (path === '/login') showAuth.value = true
  else if (path === '/demo') showDemo.value = true
  else if (path === '/nosotros') showAbout.value = true
  else if (path === '/privacidad') showPrivacy.value = true
  else if (path === '/terminos') showTerms.value = true
  else if (path === '/precios') showPricing.value = true
  else if (path === '/forgot-password') showForgotPassword.value = true
  else if (path.startsWith('/reset-password')) showResetPassword.value = true
  else if (path.startsWith('/pago-exitoso')) {
    showPaymentSuccess.value = true
    const params = new URLSearchParams(window.location.search)
    paymentSuccessPlan.value = params.get('planType') || ''
  }
}

const handleCustomBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    showPrivacy.value = false
    showTerms.value = false
    showDemo.value = false
    showAbout.value = false
    showAuth.value = false
    showPricing.value = false
    showPaymentSuccess.value = false
    showForgotPassword.value = false
    showResetPassword.value = false
  }
}

const handlePurchasePlan = (payload) => {
  toasts.value.push({
    id: Date.now(),
    type: 'success',
    title: 'Compra Exitosa',
    message: `Has comprado el plan ${payload.planType.toUpperCase()} (${payload.billing === 'annual' ? 'Anual' : 'Mensual'})`
  })
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
  else if (initialPath === '/precios') showPricing.value = true
  else if (initialPath === '/forgot-password') showForgotPassword.value = true
  else if (initialPath.startsWith('/reset-password')) showResetPassword.value = true
  else if (initialPath.startsWith('/pago-exitoso')) {
    showPaymentSuccess.value = true
    const params = new URLSearchParams(window.location.search)
    paymentSuccessPlan.value = params.get('planType') || ''
  }
})
</script>

<template>
  <div class="app-root">
    <ErrorBoundary>
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
        <RootShell
          v-if="showRootPanel"
          @enter-erp="viewingAdminPanel = false"
        />
        <AppShell
          v-else
          @open-admin-panel="viewingAdminPanel = true"
        />
      </template>

      <!-- Public states (unauthenticated) -->
      <template v-else>
        <PaymentSuccess
          v-if="showPaymentSuccess"
          :plan-type="paymentSuccessPlan"
          @continue="showPaymentSuccess = false; showAuth = true; syncUrlWithState('/login', true)"
        />
        <DemoRequestView
          v-else-if="showDemo"
          @back="showDemo = false"
        />
        <ForgotPasswordView
          v-else-if="showForgotPassword"
          @back="showForgotPassword = false; showAuth = true; syncUrlWithState('/login', true)"
        />
        <ResetPasswordView
          v-else-if="showResetPassword"
          @back="showResetPassword = false; showAuth = true; syncUrlWithState('/login', true)"
        />
        <PricingView
          v-else-if="showPricing"
          @back="showPricing = false"
          @request-demo="showDemo = true; showPricing = false"
          @login="showAuth = true; showPricing = false"
          @purchase-plan="handlePurchasePlan"
        />
        <AuthScreen
          v-else-if="showAuth"
          @request-demo="showDemo = true; showAuth = false"
          @show-privacy="showPrivacy = true; showAuth = false"
          @forgot-password="showForgotPassword = true; showAuth = false"
          @back="showAuth = false"
        />
        <AboutView
          v-else-if="showAbout"
          @back="showAbout = false"
          @request-demo="showDemo = true"
          @login="showAuth = true"
        />
        <PrivacyPolicyView
          v-else-if="showPrivacy"
          @back="handleCustomBack"
        />
        <TermsOfUseView
          v-else-if="showTerms"
          @back="showTerms = false"
        />
        <LandingPage
          v-else
          @login="showAuth = true"
          @request-demo="showDemo = true"
          @show-privacy="showPrivacy = true"
          @show-terms="showTerms = true"
          @show-about="showAbout = true"
          @show-pricing="showPricing = true"
          @purchase-plan="handlePurchasePlan"
        />
      </template>
    </template>
    </ErrorBoundary>

    <SessionRecoveryModal />
    <Toaster
      position="top-right"
      rich-colors
    />
    <ToastStack :toasts="toasts" />
  </div>
</template>
