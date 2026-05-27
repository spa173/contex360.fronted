<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useStateStore } from '../../stores/stateStore'
import { businessApi } from '../../services/businessApi'
import { formatCurrency } from '../../utils/ui'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Mi Suscripción — Contex360',
  meta: [
    { name: 'description', content: 'Gestiona tu suscripción, pagos y facturas de Contex360.' },
  ]
})

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const auth = useAuthStore()
const state = useStateStore()

const subscription = ref<any>(null)
const payments = ref<any[]>([])
const invoices = ref<any[]>([])
const isLoading = ref(true)
const showCancelModal = ref(false)
const isCancelling = ref(false)

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

onMounted(async () => {
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
  } catch (err) {
    console.error('Error loading subscription:', err)
  } finally {
    isLoading.value = false
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
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-20"
    >
      <span class="material-symbols-outlined animate-spin text-[32px] text-[#2563EB]">progress_activity</span>
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
              {{ formatCurrency(currentPlan?.price || 0) }}
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
                  {{ formatCurrency(p.amount) }}
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
                <th class="px-5 py-3 text-right">
                  Subtotal
                </th>
                <th class="px-5 py-3 text-right">
                  IVA
                </th>
                <th class="px-5 py-3 text-right">
                  Total
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
                <td class="px-5 py-3.5 text-right font-mono">
                  {{ formatCurrency(inv.amount) }}
                </td>
                <td class="px-5 py-3.5 text-right font-mono">
                  {{ formatCurrency(inv.tax) }}
                </td>
                <td class="px-5 py-3.5 text-right font-mono font-semibold">
                  {{ formatCurrency(inv.total) }}
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
