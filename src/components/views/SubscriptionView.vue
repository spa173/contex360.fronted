<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useStateStore } from '../../stores/stateStore'
import { businessApi } from '../../services/businessApi'
import { formatCurrency, setCurrencyRates } from '../../utils/ui'
import { getApiBaseUrl } from '../../services/apiBase'
import { useHead } from '@unhead/vue'

const planOrder = ['starter', 'pyme', 'enterprise']

const planNames: Record<string, string> = {
  starter: 'Starter',
  pyme: 'Pyme',
  enterprise: 'Enterprise',
}

const planPrices: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 89000, annual: 801000 },
  pyme: { monthly: 189000, annual: 1701000 },
  enterprise: { monthly: 389000, annual: 3501000 },
}

useHead({
  title: 'Mi Suscripción — Contex360',
  meta: [
    { name: 'description', content: 'Gestiona tu suscripción, pagos y facturas de Contex360.' },
  ]
})

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify', 'navigate'])

const auth = useAuthStore()
const state = useStateStore()

const subscription = ref<any>(null)
const payments = ref<any[]>([])
const invoices = ref<any[]>([])
const isLoading = ref(true)
const showCancelModal = ref(false)
const isCancelling = ref(false)
const paymentFailure = ref<any>(null)
const showRetryPaymentModal = ref(false)
const isRetryingPayment = ref(false)
const showUpdatePaymentMethodModal = ref(false)
const isUpdatingPaymentMethod = ref(false)
const overdueInvoices = ref<any[]>([])
const isPayingOverdue = ref(false)
const usage = ref<any>(null)
const currencies = ref<{ code: string; symbol: string; name: string; rateToCop: number; decimals: number }[]>([])
const selectedCurrency = ref(localStorage.getItem('preferredCurrency') || 'COP')

const currentPlan = computed(() => {
  if (!subscription.value) return null
  const key = subscription.value.planType?.toLowerCase() || 'starter'
  return {
    ...subscription.value,
    name: planNames[key] || key,
    price: subscription.value.billing === 'annual'
      ? planPrices[key]?.annual || 0
      : planPrices[key]?.monthly || 0,
  }
})

const trialDaysLeft = computed(() => {
  if (!subscription.value?.trialEndsAt) return 0
  const ends = new Date(subscription.value.trialEndsAt)
  const now = new Date()
  return Math.max(0, Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
})

const statusBadge = computed(() => {
  if (!subscription.value) return { class: 'bg-emerald-50 text-emerald-700', label: 'Activo' }
  if (subscription.value.cancelAt) return { class: 'bg-amber-50 text-amber-700', label: 'Cancelando' }
  if (!subscription.value.active) return { class: 'bg-rose-50 text-rose-700', label: 'Inactivo' }
  if (trialDaysLeft.value > 0) return { class: 'bg-blue-50 text-blue-700', label: `Prueba (${trialDaysLeft.value}d)` }
  return { class: 'bg-emerald-50 text-emerald-700', label: 'Activo' }
})

const paymentFailureStatus = computed(() => {
  if (!paymentFailure.value) return null
  return {
    status: paymentFailure.value.status,
    message: paymentFailure.value.message || 'Error de pago desconocido',
    timestamp: paymentFailure.value.timestamp
  }
})

const hasRecentPaymentFailure = computed(() => {
  if (!paymentFailure.value) return false
  // Consider failures from last 24 hours as recent
  const failureTime = new Date(paymentFailure.value.timestamp).getTime()
  const now = Date.now()
  return (now - failureTime) < (24 * 60 * 60 * 1000)
})

const overdueInvoicesList = computed(() => {
  return overdueInvoices.value.filter(invoice => 
    invoice.status === 'pending' && 
    invoice.dueDate && 
    new Date(invoice.dueDate) < new Date()
  )
})

const hasOverdueInvoices = computed(() => overdueInvoicesList.value.length > 0)

const dunningStatus = computed(() => {
  if (hasRecentPaymentFailure.value) {
    return {
      type: 'payment_failed',
      message: paymentFailureStatus.value?.message || 'Pago fallido detectado',
      action: 'retry'
    }
  } else if (hasOverdueInvoices.value) {
    return {
      type: 'overdue',
      message: `Tienes ${overdueInvoicesList.value.length} factura(s) vencida(s)`,
      action: 'pay'
    }
  }
  return null
})

const currentUserCount = computed(() => {
  return state.memberships?.filter(m => m.tenantId === state.activeTenantId)?.length ?? 0
})

const currentInvoicesCount = computed(() => {
  return subscription.value?.invoicesThisMonth ?? usage.value?.invoicesThisMonth ?? 0
})

const nextPlanKey = computed(() => {
  if (!subscription.value?.planType) return null
  const idx = planOrder.indexOf(subscription.value.planType.toLowerCase())
  if (idx < 0 || idx >= planOrder.length - 1) return null
  return planOrder[idx + 1]
})

const isAtLimit = computed(() => {
  const limits = subscription.value?.limits
  if (!limits) return false
  if (limits.maxUsers !== null && currentUserCount.value >= limits.maxUsers) return true
  if (limits.maxInvoicesPerMonth !== null && currentInvoicesCount.value >= limits.maxInvoicesPerMonth) return true
  return false
})

const isNearLimit = computed(() => {
  const limits = subscription.value?.limits
  if (!limits || !nextPlanKey.value) return false
  if (limits.maxUsers !== null && currentUserCount.value >= limits.maxUsers * 0.8) return true
  if (limits.maxInvoicesPerMonth !== null && currentInvoicesCount.value >= limits.maxInvoicesPerMonth * 0.8) return true
  return false
})

const upgradeBanner = computed(() => {
  if (!subscription.value?.active || subscription.value.cancelAt || !nextPlanKey.value) return null
  if (isAtLimit.value) {
    return { variant: 'danger', title: 'Límite del plan alcanzado', message: `Has alcanzado el límite de ${limitsReachedText.value}.` }
  }
  if (isNearLimit.value) {
    return { variant: 'warning', title: 'Cerca del límite del plan', message: `Estás usando más del 80% de tu capacidad de ${limitsReachedText.value}.` }
  }
  return null
})

const limitsReachedText = computed(() => {
  const parts: string[] = []
  const limits = subscription.value?.limits
  if (!limits) return ''
  if (limits.maxUsers !== null && currentUserCount.value >= limits.maxUsers * 0.8) {
    parts.push(`usuarios (${currentUserCount.value}/${limits.maxUsers})`)
  }
  if (limits.maxInvoicesPerMonth !== null && currentInvoicesCount.value >= limits.maxInvoicesPerMonth * 0.8) {
    parts.push(`facturas/mes (${currentInvoicesCount.value}/${limits.maxInvoicesPerMonth})`)
  }
  return parts.join(' y ')
})

let paymentStatusCheckInterval: ReturnType<typeof setInterval> | null = null

async function loadSubscriptionData() {
    try {
      const tenantId = state.activeTenantId
      const [sub, pays, invs] = await Promise.all([
        businessApi.getSubscriptionCurrent(tenantId),
        businessApi.getSubscriptionPayments(tenantId).catch(() => []),
        businessApi.getSubscriptionInvoices(tenantId).catch(() => []),
      ])
      subscription.value = sub
      payments.value = pays
      invoices.value = invs
      
      // Check for recent payment failures
      const failedPayment = payments.value.find(p => 
        p.status === 'declined' && 
        new Date(p.paidAt || p.createdAt).getTime() > (Date.now() - 24 * 60 * 60 * 1000)
      )
      
      if (failedPayment) {
        paymentFailure.value = {
          status: failedPayment.status,
          message: 'El pago fue rechazado por el banco o tarjeta.',
          timestamp: failedPayment.paidAt || failedPayment.createdAt
        }
      } else {
        // Clear payment failure if no recent failures found
        paymentFailure.value = null
      }
      
      // Fetch overdue invoices for dunning
      const overdue = await businessApi.getOverdueInvoices(tenantId).catch(() => [])
      overdueInvoices.value = overdue

      // Fetch usage for upgrade detection
      const usageData = await businessApi.getSubscriptionUsage(tenantId).catch(() => null)
      usage.value = usageData

      // Fetch currencies
      if (currencies.value.length === 0) {
        const currs = await businessApi.getAvailableCurrencies().catch(() => [])
        currencies.value = currs
        const rates: Record<string, number> = {}
        for (const c of currs) rates[c.code] = c.rateToCop
        setCurrencyRates(rates)
      }
    } catch (err) {
      console.error('Error loading subscription:', err)
    } finally {
      isLoading.value = false
    }
}

onMounted(() => {
    loadSubscriptionData()
    
    // Set up interval to check payment status every 30 seconds
    paymentStatusCheckInterval = setInterval(() => {
      if (!isLoading.value) {
        loadSubscriptionData()
      }
    }, 30000)
})

onBeforeUnmount(() => {
    if (paymentStatusCheckInterval) {
      clearInterval(paymentStatusCheckInterval)
    }
  })

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function paymentStatusBadge(status: string) {
  if (status === 'approved') return { class: 'bg-emerald-50 text-emerald-700', label: 'Aprobado' }
  if (status === 'pending') return { class: 'bg-amber-50 text-amber-700', label: 'Pendiente' }
  if (status === 'declined') return { class: 'bg-rose-50 text-rose-700', label: 'Rechazado' }
  return { class: 'bg-gray-100 text-gray-600', label: status }
}

async function handleCancel() {
    isCancelling.value = true
    try {
      const res = await businessApi.cancelSubscription(state.activeTenantId)
      if (res.ok) {
        subscription.value.cancelAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        showCancelModal.value = false
        emit('notify', { message: 'Suscripción cancelada', detail: 'Se mantendrá activa hasta el final del ciclo de facturación.' })
      }
    } catch (err: any) {
      emit('notify', { message: 'Error', detail: err.message })
    } finally {
      isCancelling.value = false
    }
  }

  async function initiateCheckout(planType: string, billing: 'monthly' | 'annual') {
    const tenantId = state.activeTenantId
    if (!tenantId) {
      emit('notify', { message: 'Error', detail: 'No hay empresa activa seleccionada.' })
      return
    }
    try {
      const { redirectUrl } = await businessApi.createSubscriptionCheckout({ planType: planType as any, billing }, tenantId)
      if (!redirectUrl) throw new Error('No se recibió el enlace de pago.')
      window.location.href = redirectUrl
    } catch (err: any) {
      emit('notify', { message: 'Error al generar enlace de pago', detail: err.message || 'Intenta nuevamente.' })
    }
  }

  async function handleRetryPayment() {
    if (!subscription.value) return
    isRetryingPayment.value = true
    try {
      const billing = (subscription.value.billing || 'monthly') as 'monthly' | 'annual'
      await initiateCheckout(subscription.value.planType, billing)
    } finally {
      isRetryingPayment.value = false
      showRetryPaymentModal.value = false
    }
  }

  async function handleUpdatePaymentMethod() {
    if (!subscription.value) return
    isUpdatingPaymentMethod.value = true
    try {
      const billing = (subscription.value.billing || 'monthly') as 'monthly' | 'annual'
      await initiateCheckout(subscription.value.planType, billing)
    } finally {
      isUpdatingPaymentMethod.value = false
      showUpdatePaymentMethodModal.value = false
    }
  }

  function closePaymentFailureModal() {
    showRetryPaymentModal.value = false
    showUpdatePaymentMethodModal.value = false
  }

  function closeDunningAlert() {
    showRetryPaymentModal.value = false
    showUpdatePaymentMethodModal.value = false
  }

  async function handlePayOverdueInvoices() {
    if (!subscription.value) return
    isPayingOverdue.value = true
    try {
      const billing = (subscription.value.billing || 'monthly') as 'monthly' | 'annual'
      await initiateCheckout(subscription.value.planType, billing)
    } finally {
      isPayingOverdue.value = false
    }
  }

  function handleUpgrade() {
    // Navigate to plans view inside the authenticated app (no /pricing redirect needed)
    emit('navigate', 'plans')
  }

  function changeCurrency(code: string) {
    selectedCurrency.value = code
    localStorage.setItem('preferredCurrency', code)
  }
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Configuración</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-[#71717A]">Mi Suscripción</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Mi Suscripción
        </h1>
        <p class="text-[14px] text-[#71717A]">
          Gestiona tu plan, pagos y facturas.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-[12px] text-[#71717A] font-medium">Moneda:</label>
        <select
          :value="selectedCurrency"
          @change="changeCurrency(($event.target as HTMLSelectElement).value)"
          class="px-3 py-1.5 border border-[#E4E4E7] rounded-[8px] text-[13px] font-medium bg-white text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option
            v-for="c in currencies"
            :key="c.code"
            :value="c.code"
          >
            {{ c.symbol }} {{ c.code }} — {{ c.name }}
          </option>
        </select>
      </div>
    </div>

     <!-- Loading -->
     <div
       v-if="isLoading"
       class="flex items-center justify-center py-20"
     >
       <span class="material-symbols-outlined animate-spin text-[32px] text-[#2563EB]">progress_activity</span>
     </div>

     <!-- Dunning Status Alert -->
     <div
       v-if="dunningStatus"
       :class="[
         'border rounded-[14px] p-6 mb-6',
         dunningStatus.type === 'payment_failed' ? 'bg-rose-50 border-[#FCE7E7]' : 'bg-amber-50 border-[#FEF3C7]'
       ]"
     >
       <div class="flex flex-col items-center text-center space-y-4">
         <div class="flex items-center justify-center w-12 h-12">
           <span
             class="material-symbols-outlined text-[24px]"
             :class="[
               dunningStatus.type === 'payment_failed' ? 'text-rose-600' : 'text-amber-600',
               dunningStatus.type === 'payment_failed' ? 'bg-rose-100' : 'bg-amber-100',
               'rounded-full'
             ]"
           >
             {{ dunningStatus.type === 'payment_failed' ? 'error' : 'warning' }}
           </span>
         </div>
         <h3 class="text-[18px] font-bold text-[#18181B]">
           {{ dunningStatus.type === 'payment_failed' ? 'Problema con tu pago' : 'Facturas vencidas' }}
         </h3>
         <p class="text-[14px] text-[#71717A] max-w-md">
           {{ dunningStatus.message }}
         </p>
         <div class="flex gap-3">
           <template v-if="dunningStatus.type === 'payment_failed'">
             <button
               @click="handleRetryPayment"
               :disabled="isRetryingPayment"
               class="px-4 py-2 bg-[#2563EB] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors"
             >
               <span v-if="isRetryingPayment" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
               <span v-else>Reintentar pago</span>
             </button>
             <button
               @click="handleUpdatePaymentMethod"
               :disabled="isUpdatingPaymentMethod"
               class="px-4 py-2 border border-[#E4E4E7] rounded-[10px] text-[13px] font-semibold hover:bg-[#FAFAFA] transition-colors"
             >
               <span v-if="isUpdatingPaymentMethod" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
               <span v-else>Actualizar método de pago</span>
             </button>
           </template>
           <template v-else>
             <button
               @click="handlePayOverdueInvoices"
               :disabled="isPayingOverdue"
               class="px-4 py-2 bg-[#2563EB] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors"
             >
               <span v-if="isPayingOverdue" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
               <span v-else>Pagar facturas vencidas</span>
             </button>
           </template>
         </div>
         <div class="text-[12px] text-[#A1A1AA]">
           <button
             @click="closeDunningAlert"
             class="text-[#2563EB] underline hover:text-[#1D4ED8]"
           >
             Entendido
           </button>
         </div>
       </div>
     </div>

     <!-- Upgrade Banner -->
     <div
       v-if="upgradeBanner"
       :class="[
         'border rounded-[14px] p-6 mb-6',
         upgradeBanner.variant === 'danger' ? 'bg-rose-50 border-[#FCE7E7]' : 'bg-amber-50 border-[#FEF3C7]'
       ]"
     >
       <div class="flex flex-col items-center text-center space-y-4">
         <div class="flex items-center justify-center w-12 h-12">
           <span
             class="material-symbols-outlined text-[24px]"
             :class="[
               upgradeBanner.variant === 'danger' ? 'text-rose-600' : 'text-amber-600',
               'rounded-full'
             ]"
           >
             {{ upgradeBanner.variant === 'danger' ? 'error' : 'warning' }}
           </span>
         </div>
         <h3 class="text-[18px] font-bold text-[#18181B]">
           {{ upgradeBanner.title }}
         </h3>
         <p class="text-[14px] text-[#71717A] max-w-md">
           {{ upgradeBanner.message }}
         </p>
         <button
           @click="handleUpgrade"
           class="px-5 py-2.5 bg-[#2563EB] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors"
         >
           Mejorar a {{ planNames[nextPlanKey || ''] || nextPlanKey }}
         </button>
       </div>
     </div>

     <!-- Payment Failure Alert -->
     <div
       v-if="hasRecentPaymentFailure"
       class="bg-rose-50 border border-[#FCE7E7] rounded-[14px] p-6 mb-6"
     >
       <div class="flex flex-col items-center text-center space-y-4">
         <div class="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-2">
           <span class="material-symbols-outlined text-[24px] text-rose-600">error</span>
         </div>
         <h3 class="text-[18px] font-bold text-[#18181B]">
           Problema con tu pago
         </h3>
         <p class="text-[14px] text-[#71717A] max-w-md">
           {{ paymentFailureStatus?.message || 'Hubo un problema procesando tu último pago.' }}
         </p>
         <div class="flex gap-3">
           <button
             @click="handleRetryPayment"
             :disabled="isRetryingPayment"
             class="px-4 py-2 bg-[#2563EB] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#1D4ED8] transition-colors"
           >
             <span v-if="isRetryingPayment" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
             <span v-else>Reintentar pago</span>
           </button>
           <button
             @click="handleUpdatePaymentMethod"
             :disabled="isUpdatingPaymentMethod"
             class="px-4 py-2 border border-[#E4E4E7] rounded-[10px] text-[13px] font-semibold hover:bg-[#FAFAFA] transition-colors"
           >
             <span v-if="isUpdatingPaymentMethod" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
             <span v-else>Actualizar método de pago</span>
           </button>
         </div>
         <div class="text-[12px] text-[#A1A1AA]">
           <button
             @click="closePaymentFailureModal"
             class="text-[#2563EB] underline hover:text-[#1D4ED8]"
           >
             Entendido
           </button>
         </div>
       </div>
     </div>

    <template v-else>
      <!-- Current Plan Card -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-[20px] font-bold text-[#18181B]">
                Plan {{ currentPlan?.name || 'Starter' }}
              </h2>
              <span :class="['inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-semibold', statusBadge.class]">
                {{ statusBadge.label }}
              </span>
            </div>
            <p class="text-[13px] text-[#71717A]">
              {{ currentPlan?.billing === 'annual' ? 'Facturación anual' : 'Facturación mensual' }}
              <span
                v-if="currentPlan?.renewsAt"
                class="ml-2"
              >
                · Renueva el {{ formatDate(currentPlan.renewsAt) }}
              </span>
            </p>
            <p
              v-if="currentPlan?.cancelAt"
              class="text-[12px] text-amber-600 mt-1"
            >
              Se cancelará el {{ formatDate(currentPlan.cancelAt) }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-[28px] font-bold text-[#18181B] font-mono">
              {{ formatCurrency(currentPlan?.price || 0, selectedCurrency) }}
            </p>
            <p class="text-[12px] text-[#A1A1AA]">
              / {{ currentPlan?.billing === 'annual' ? 'año' : 'mes' }}
            </p>
          </div>
        </div>

        <!-- Plan Limits -->
        <div class="mt-6 pt-6 border-t border-[#F4F4F5] grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Usuarios
            </p>
            <p class="text-[14px] font-bold text-[#18181B]">
              {{ currentPlan?.limits?.maxUsers || 'Ilimitados' }}
            </p>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Facturas/mes
            </p>
            <p class="text-[14px] font-bold text-[#18181B]">
              {{ currentPlan?.limits?.maxInvoicesPerMonth || 'Ilimitadas' }}
            </p>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Facturas este mes
            </p>
            <p class="text-[14px] font-bold text-[#18181B]">
              {{ subscription?.invoicesThisMonth || 0 }}
            </p>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Módulos
            </p>
            <p class="text-[14px] font-bold text-[#18181B]">
              {{ currentPlan?.limits?.modules?.includes('*') ? 'Todos' : currentPlan?.limits?.modules?.length || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-[#F4F4F5]">
          <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">
            Historial de Pagos
          </h2>
        </div>
        <div
          v-if="payments.length === 0"
          class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]"
        >
          No hay pagos registrados aún.
        </div>
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left min-w-[500px]">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-5 py-3">
                  Fecha
                </th>
                <th class="px-5 py-3">
                  Descripción
                </th>
                <th class="px-5 py-3">
                  Estado
                </th>
                <th class="px-5 py-3 text-right">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr
                v-for="p in payments"
                :key="p.id"
                class="hover:bg-[#FAFAFA]"
              >
                <td class="px-5 py-3.5 text-[#71717A]">
                  {{ formatDateTime(p.paidAt || p.createdAt) }}
                </td>
                <td class="px-5 py-3.5 font-semibold text-[#18181B]">
                  {{ p.description || 'Pago de suscripción' }}
                </td>
                <td class="px-5 py-3.5">
                  <span :class="['inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold', paymentStatusBadge(p.status).class]">
                    {{ paymentStatusBadge(p.status).label }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-right font-mono font-semibold">
                  {{ formatCurrency(p.amount, selectedCurrency) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Invoices -->
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden mb-6">
        <div class="px-5 py-4 border-b border-[#F4F4F5]">
          <h2 class="text-[15px] font-bold tracking-tight text-[#18181B]">
            Facturas de Suscripción
          </h2>
        </div>
        <div
          v-if="invoices.length === 0"
          class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]"
        >
          No hay facturas generadas aún.
        </div>
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left min-w-[600px]">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-5 py-3">
                  N° Factura
                </th>
                <th class="px-5 py-3">
                  Período
                </th>
                <th class="px-5 py-3">
                  Estado
                </th>
                <th class="px-5 py-3">
                  DIAN
                </th>
                <th class="px-5 py-3 text-right">
                  Subtotal
                </th>
                <th class="px-5 py-3 text-right">
                  IVA
                </th>
                <th class="px-5 py-3 text-right">
                  Total
                </th>
                <th class="px-5 py-3 w-12">
                </th>
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr
                v-for="inv in invoices"
                :key="inv.id"
                class="hover:bg-[#FAFAFA]"
              >
                <td class="px-5 py-3.5 font-mono text-[#2563EB] font-semibold">
                  {{ inv.invoiceNumber }}
                </td>
                <td class="px-5 py-3.5 text-[#71717A]">
                  {{ formatDate(inv.periodStart) }} — {{ formatDate(inv.periodEnd) }}
                </td>
                <td class="px-5 py-3.5">
                  <span :class="['inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold', inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
                    {{ inv.status === 'paid' ? 'Pagada' : 'Pendiente' }}
                  </span>
                </td>
                <td class="px-5 py-3.5">
                  <span v-if="inv.dianStatus" :title="inv.cufe ? `CUFE: ${inv.cufe}` : ''" :class="['inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold', inv.dianStatus === 'sent' || inv.dianStatus === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
                    {{ inv.dianStatus === 'sent' || inv.dianStatus === 'accepted' ? 'Enviada' : inv.dianStatus === 'rejected' ? 'Rechazada' : inv.dianStatus }}
                  </span>
                  <span v-else class="text-[11px] text-[#A1A1AA]">—</span>
                </td>
                <td class="px-5 py-3.5 text-right font-mono">
                  {{ formatCurrency(inv.amount, selectedCurrency) }}
                </td>
                <td class="px-5 py-3.5 text-right font-mono">
                  {{ formatCurrency(inv.tax, selectedCurrency) }}
                </td>
                <td class="px-5 py-3.5 text-right font-mono font-semibold">
                  {{ formatCurrency(inv.total, selectedCurrency) }}
                </td>
                <td class="px-5 py-3.5 text-center">
                  <a
                    :href="`${getApiBaseUrl()}/subscriptions/invoices/${inv.id}/pdf`"
                    target="_blank"
                    class="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#71717A] hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                    title="Descargar PDF"
                  >
                    <span class="material-symbols-outlined text-[18px]">download</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end">
        <button
          v-if="!subscription?.cancelAt && subscription?.active"
          class="px-4 py-2 text-[13px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[10px] transition-colors"
          @click="showCancelModal = true"
        >
          Cancelar suscripción
        </button>
      </div>
    </template>

    <!-- Cancel Modal -->
    <div
      v-if="showCancelModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white w-[90%] max-w-[400px] rounded-[16px] shadow-2xl border border-[#E4E4E7] overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-[#F4F4F5]">
          <h3 class="text-[18px] font-bold text-[#18181B] tracking-tight">
            Cancelar Suscripción
          </h3>
        </div>
        <div class="p-6">
          <p class="text-[14px] text-[#71717A] leading-relaxed">
            Tu suscripción se mantendrá activa hasta el final del ciclo de facturación actual. 
            Después de eso, perderás acceso a las funciones premium.
          </p>
        </div>
        <div class="px-6 py-4 bg-[#FAFAFA] border-t border-[#F4F4F5] flex justify-end gap-3">
          <button
            class="px-4 py-2 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold"
            @click="showCancelModal = false"
          >
            Mantener plan
          </button>
          <button
            :disabled="isCancelling"
            class="px-4 py-2 bg-rose-600 text-white rounded-[10px] text-[13px] font-semibold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
            @click="handleCancel"
          >
            <span
              v-if="isCancelling"
              class="material-symbols-outlined animate-spin text-[16px]"
            >progress_activity</span>
            {{ isCancelling ? 'Cancelando...' : 'Confirmar cancelación' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
