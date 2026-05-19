<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { businessApi } from '@/services/businessApi'
import { useStateStore } from '@/stores/stateStore'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'vue-sonner'

const emit = defineEmits(['notify'])

const store = useStateStore()
const authStore = useAuthStore()
const usage = ref<any>(null)
const loading = ref(true)
const error = ref('')

const showCancelModal = ref(false)

onMounted(async () => {
  await fetchUsage()
})

async function fetchUsage() {
  loading.value = true
  error.value = ''
  try {
    const data = await businessApi.getSubscriptionUsage()
    usage.value = data
  } catch (e: any) {
    error.value = e.message || 'Error al cargar los datos de uso'
  } finally {
    loading.value = false
  }
}

function handleChangePlan() {
  window.dispatchEvent(new CustomEvent('navigate', { detail: 'plans' }))
}

async function confirmCancel() {
  try {
    await businessApi.cancelSubscription(store.activeTenantId)
    await authStore.refreshSessionWithBackend()
    await fetchUsage()
    toast.success('Suscripción cancelada', {
      description: 'Tu plan seguirá activo hasta el final del ciclo actual.',
    })
  } catch (error: any) {
    emit('notify', {
      message: 'No se pudo cancelar la suscripción',
      detail: error?.message || 'Intenta nuevamente en unos minutos.',
    })
  } finally {
    showCancelModal.value = false
  }
}

const invoicePercentage = computed(() => {
  if (!usage.value || !usage.value.limits) return 0
  const limit = usage.value.limits.maxInvoicesPerMonth
  if (limit === null || limit === undefined) return 0
  const p = (usage.value.invoicesThisMonth / limit) * 100
  return Math.min(p, 100)
})

const userPercentage = computed(() => {
  if (!usage.value || !usage.value.limits) return 0
  const limit = usage.value.limits.maxUsers
  if (limit === null || limit === undefined) return 0
  const p = (usage.value.usersCount / limit) * 100
  return Math.min(p, 100)
})
</script>

<template>
  <div class="max-w-4xl space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-[#18181B] tracking-tight">Tu Suscripción</h2>
        <p class="text-[13px] text-[#71717A] mt-1">Gestiona tu plan y monitorea el uso de los recursos del mes.</p>
      </div>
      <div class="flex gap-3">
        <button 
          @click="showCancelModal = true"
          class="px-4 py-2 text-[13px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100"
        >
          Cancelar Suscripción
        </button>
        <button 
          @click="handleChangePlan"
          class="px-4 py-2 text-[13px] font-semibold text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg transition-colors shadow-sm"
        >
          Cambiar Plan
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-[16px] border border-[#E4E4E7] p-8 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18181B]"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-[12px] text-[13px]">
      {{ error }}
    </div>

    <template v-else-if="usage">
      <!-- Plan Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p class="text-[13px] font-medium text-[#71717A] mb-1">Plan Actual</p>
            <h3 class="text-2xl font-black text-[#18181B] capitalize">{{ usage.planType }}</h3>
          </div>
          <div class="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-[12px] font-semibold w-fit border border-emerald-100">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Estado Activo
          </div>
        </div>

        <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <p class="text-[13px] font-medium text-[#71717A] mb-1">Próxima Renovación</p>
            <h3 class="text-xl font-bold text-[#18181B]">
              {{ usage.renewsAt ? new Date(usage.renewsAt).toLocaleDateString() : 'Por definir' }}
            </h3>
          </div>
          <div class="mt-6 flex items-center gap-2 text-[13px] text-[#71717A]">
            <span class="material-symbols-outlined text-[16px]">calendar_month</span>
            Ciclo de facturación en curso
          </div>
        </div>
      </div>

      <!-- Usage Limits -->
      <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 shadow-sm mt-6">
        <h3 class="text-[15px] font-bold text-[#18181B] mb-6">Uso del Mes</h3>

        <div class="space-y-6">
          <!-- Invoices -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-[#71717A]">receipt_long</span>
                <span class="text-[13px] font-semibold text-[#18181B]">Facturas Emitidas</span>
              </div>
              <span class="text-[13px] font-bold text-[#18181B]">
              {{ usage.invoicesThisMonth }} / {{ usage.limits.maxInvoicesPerMonth === null ? 'Ilimitado' : usage.limits.maxInvoicesPerMonth }}
              </span>
            </div>
            <div class="h-2 w-full bg-[#F4F4F5] rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :class="invoicePercentage >= 90 ? 'bg-rose-500' : 'bg-[#2563EB]'"
                :style="{ width: invoicePercentage + '%' }"
              ></div>
            </div>
            <p class="text-[12px] text-[#A1A1AA] mt-2" v-if="invoicePercentage >= 90 && usage.limits.maxInvoicesPerMonth !== null">
              Te estás acercando al límite de facturas mensuales.
            </p>
          </div>

          <!-- Users -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-[#71717A]">group</span>
                <span class="text-[13px] font-semibold text-[#18181B]">Usuarios del Equipo</span>
              </div>
              <span class="text-[13px] font-bold text-[#18181B]">
              {{ usage.usersCount }} / {{ usage.limits.maxUsers === null ? 'Ilimitado' : usage.limits.maxUsers }}
              </span>
            </div>
            <div class="h-2 w-full bg-[#F4F4F5] rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :class="userPercentage >= 90 ? 'bg-amber-500' : 'bg-[#10B981]'"
                :style="{ width: userPercentage + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[20px] p-6 max-w-sm w-full shadow-xl">
        <h3 class="text-[18px] font-bold text-[#18181B] mb-2">¿Cancelar Suscripción?</h3>
        <p class="text-[14px] text-[#71717A] mb-6">
          Si cancelas, perderás el acceso a las funciones premium al finalizar tu periodo actual.
        </p>
        <div class="flex gap-3">
          <button 
            @click="showCancelModal = false"
            class="flex-1 px-4 py-2 text-[13px] font-semibold text-[#71717A] bg-[#F4F4F5] hover:bg-[#E4E4E7] rounded-lg transition-colors"
          >
            Atrás
          </button>
          <button 
            @click="confirmCancel"
            class="flex-1 px-4 py-2 text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
}
</style>
