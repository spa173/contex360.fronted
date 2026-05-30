<script setup>
import { computed, ref } from 'vue'
import { useStateStore } from '../../stores/stateStore'
import { formatCurrency } from '../../utils/ui'

const emit = defineEmits(['navigate', 'close'])
const store = useStateStore()
const selectedPlan = ref('pyme')
const isAnnual = ref(false)

const subscription = computed(() => store.subscription)

const isExpired = computed(() => {
  const sub = subscription.value
  if (!sub || sub.planType !== 'trial' || !sub.trialEndsAt) return false
  return new Date(sub.trialEndsAt).getTime() <= Date.now()
})

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 89000,
    priceAnnual: 801000,
    maxUsers: 1,
    modules: ['Dashboard', 'Facturación', 'Cotizaciones', 'Terceros'],
  },
  {
    id: 'pyme',
    name: 'Pyme',
    priceMonthly: 189000,
    priceAnnual: 1701000,
    maxUsers: 5,
    modules: ['Todo incluido', 'IA + OCR', 'Multi-usuario', 'Soporte prioritario'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 389000,
    priceAnnual: 3501000,
    maxUsers: null,
    modules: ['Todo Pyme', 'API personalizada', 'Soporte 24/7', 'Integraciones'],
  },
]

const selectedPlanData = computed(() => plans.find(p => p.id === selectedPlan.value))

const price = computed(() => {
  if (!selectedPlanData.value) return 0
  return isAnnual.value ? selectedPlanData.value.priceAnnual : selectedPlanData.value.priceMonthly
})

async function handleCheckout() {
  try {
    const data = {
      planType: selectedPlan.value,
      billing: isAnnual.value ? 'annual' : 'monthly',
    }
    const response = await import('../../services/businessApi').then(m =>
      m.businessApi.createSubscriptionCheckout(data, store.activeTenantId)
    )
    if (response?.url) {
      window.location.href = response.url
    }
  } catch (err) {
    console.error('Checkout error:', err)
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isExpired"
      class="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div class="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[580px] mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="bg-gradient-to-br from-[#18181B] to-[#27272A] px-8 pt-8 pb-6 text-center">
          <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[32px] text-white">lock</span>
          </div>
          <h2 class="text-[22px] font-extrabold text-white tracking-tight mb-2">
            Tu prueba ha expirado
          </h2>
          <p class="text-[14px] text-white/70 leading-relaxed max-w-sm mx-auto">
            Para seguir usando Contex360 y no perder tus datos, elige un plan que se adapte a tu negocio.
          </p>
        </div>

        <!-- Plans selector -->
        <div class="px-6 py-5">
          <!-- Billing toggle -->
          <div class="flex items-center justify-center gap-3 mb-5">
            <span :class="['text-[12px] font-semibold', !isAnnual ? 'text-[#18181B]' : 'text-[#A1A1AA]']">Mensual</span>
            <button
              class="relative w-11 h-6 rounded-full transition-colors"
              :class="isAnnual ? 'bg-[#2563EB]' : 'bg-[#D4D4D8]'"
              @click="isAnnual = !isAnnual"
            >
              <span
                class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                :class="isAnnual ? 'translate-x-[22px]' : 'translate-x-0.5'"
              />
            </button>
            <span :class="['text-[12px] font-semibold', isAnnual ? 'text-[#18181B]' : 'text-[#A1A1AA]']">
              Anual
              <span class="text-[10px] font-bold text-emerald-600 ml-1">-25%</span>
            </span>
          </div>

          <!-- Plan cards -->
          <div class="space-y-2.5">
            <button
              v-for="plan in plans"
              :key="plan.id"
              :class="[
                'w-full text-left p-4 rounded-[12px] border-2 transition-all',
                selectedPlan === plan.id
                  ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-sm'
                  : 'border-[#E4E4E7] hover:border-[#D4D4D8]',
              ]"
              @click="selectedPlan = plan.id"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                      selectedPlan === plan.id ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#D4D4D8]'
                    ]"
                  >
                    <div
                      v-if="selectedPlan === plan.id"
                      class="w-2 h-2 rounded-full bg-white"
                    />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-[14px] font-bold text-[#18181B]">{{ plan.name }}</span>
                      <span
                        v-if="plan.popular"
                        class="text-[9px] font-extrabold uppercase tracking-wider bg-[#2563EB] text-white px-1.5 py-0.5 rounded"
                      >Popular</span>
                    </div>
                    <p class="text-[11px] text-[#71717A] mt-0.5">
                      {{ plan.modules.join(' · ') }}
                    </p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-[16px] font-extrabold text-[#18181B]">
                    {{ formatCurrency(isAnnual ? plan.priceAnnual : plan.priceMonthly) }}
                  </p>
                  <p class="text-[10px] text-[#A1A1AA] font-medium">
                    COP / {{ isAnnual ? 'año' : 'mes' }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- CTA -->
        <div class="px-6 pb-6">
          <button
            class="w-full py-3.5 rounded-[12px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-extrabold tracking-wide transition-all hover:shadow-lg active:scale-[0.98]"
            @click="handleCheckout"
          >
            Activar {{ selectedPlanData?.name }} — {{ formatCurrency(price) }}
          </button>
          <p class="text-center text-[11px] text-[#A1A1AA] mt-3">
            Pago seguro vía Wompi · Cancela cuando quieras · Sin permanencia
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
