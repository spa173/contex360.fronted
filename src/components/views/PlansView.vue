<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateStore } from '../../stores/stateStore'
import { formatCurrency } from '../../utils/ui'
import { businessApi } from '../../services/businessApi'
import { toast } from 'vue-sonner'

defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])
const store = useStateStore()
const isAnnual = ref(false)
const isCheckoutLoading = ref(false)

const currentPlan = computed(() => store.subscription?.planType || 'starter')

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Esencial para autónomos y pequeñas empresas en crecimiento.',
    priceMonthly: 89000,
    priceAnnual: 801000,
    limits: {
      users: '1 usuario',
      invoices: '50 facturas / mes',
    },
    features: [
      'Dashboard operativo',
      'Facturación electrónica',
      'Gestión de cotizaciones',
      'Administración de terceros',
    ],
    lockedFeatures: [
      'Gestión de compras',
      'Control de inventario',
      'Tesorería avanzada',
      'Reportes financieros',
      'Asistente IA (ContexAI)',
      'Soporte multi-usuario',
    ]
  },
  {
    id: 'pyme',
    name: 'Pyme',
    desc: 'El balance perfecto de control y potencia para equipos medianos.',
    priceMonthly: 189000,
    priceAnnual: 1701000,
    limits: {
      users: 'Hasta 5 usuarios',
      invoices: 'Facturación ilimitada',
    },
    features: [
      'Dashboard operativo',
      'Facturación electrónica',
      'Gestión de compras',
      'Gestión de cotizaciones',
      'Control de inventario',
      'Administración de terceros',
      'Tesorería avanzada',
      'Reportes financieros',
      'Hasta 5 usuarios activos',
      'Asistente IA (ContexAI)',
    ],
    lockedFeatures: [
      'Soporte Enterprise 24/7',
      'Integraciones API personalizadas',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'Control absoluto sin límites para grandes corporaciones.',
    priceMonthly: 389000,
    priceAnnual: 3501000,
    limits: {
      users: 'Usuarios ilimitados',
      invoices: 'Facturación ilimitada',
    },
    features: [
      'Todo lo incluido en el plan Pyme',
      'Acceso a todos los módulos actuales y futuros',
      'Usuarios y colaboradores ilimitados',
      'Soporte prioritario dedicado 24/7',
      'Acuerdo de nivel de servicio (SLA) del 99.9%',
      'Capacitación e implantación guiada',
    ],
    lockedFeatures: [],
  }
]

function handleUpgrade(planId: string) {
  emit('notify', {
    message: 'Solicitud recibida',
    detail: `Tu solicitud de cambio al plan ${planId.toUpperCase()} ha sido registrada. Nuestro equipo comercial se comunicará contigo.`
  })
}
async function handleUpgradeReal(planId: string) {
  const tenantId = store.activeTenantId
  if (!tenantId) {
    emit('notify', {
      message: 'Selecciona un workspace',
      detail: 'Necesitamos un workspace activo para iniciar el checkout.'
    })
    return
  }

  isCheckoutLoading.value = true
  try {
    const { redirectUrl } = await businessApi.createSubscriptionCheckout(
      { planType: planId as 'starter' | 'pyme' | 'enterprise', billing: isAnnual.value ? 'annual' : 'monthly' },
      tenantId,
    )
    if (!redirectUrl) throw new Error('No se recibió el enlace de pago.')
    toast.info('Redirigiendo a Wompi...', { description: 'Completa el pago para activar tu plan.' })
    window.location.href = redirectUrl
  } catch (error: any) {
    emit('notify', {
      message: 'No fue posible iniciar el pago',
      detail: error?.message || 'Intenta de nuevo en unos segundos.'
    })
  } finally {
    isCheckoutLoading.value = false
  }
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto mb-10">
      <div class="flex items-center justify-center gap-2 mb-3">
        <span class="text-[11px] uppercase tracking-[0.15em] font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full">Suscripción</span>
      </div>
      <h1 class="text-[26px] sm:text-[40px] font-extrabold tracking-[-0.03em] text-[#18181B] mb-3">
        Planes y Límites del Sistema
      </h1>
      <p class="text-[15px] sm:text-[16px] text-[#71717A] leading-[1.6]">
        Desbloquea nuevas herramientas de automatización financiera, control de inventario avanzada y el asistente inteligente ContexAI.
      </p>

      <!-- Billing Cycle Selector -->
      <div class="flex items-center justify-center gap-3 mt-8">
        <span :class="['text-[13px] font-semibold transition-colors', !isAnnual ? 'text-[#18181B]' : 'text-[#71717A]']">Mensual</span>
        <button 
          @click="isAnnual = !isAnnual"
          class="w-12 h-6.5 rounded-full bg-[#E4E4E7] p-0.5 relative transition-colors duration-200 outline-none focus:ring-2 focus:ring-black/10"
          :class="{ 'bg-[#18181B]': isAnnual }"
        >
          <span 
            class="block w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="{ 'translate-x-5.5': isAnnual }"
          ></span>
        </button>
        <span :class="['text-[13px] font-semibold transition-colors flex items-center gap-1.5', isAnnual ? 'text-[#18181B]' : 'text-[#71717A]']">
          Anual
          <span class="bg-[#10B981]/15 text-[#10B981] text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
            Ahorra 25%
          </span>
        </span>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
      <div 
        v-for="plan in plans" 
        :key="plan.id"
        :class="[
          'bg-white border rounded-[16px] p-6 shadow-sm flex flex-col justify-between relative transition-all duration-300 hover:shadow-md',
          plan.popular ? 'border-[#2563EB] ring-4 ring-[#2563EB]/5' : 'border-[#E4E4E7]',
          currentPlan === plan.id ? 'border-emerald-500 ring-4 ring-emerald-500/5' : ''
        ]"
      >
        <!-- Ribbons / Badges -->
        <span 
          v-if="currentPlan === plan.id" 
          class="absolute -top-3 left-6 bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1"
        >
          <span class="material-symbols-outlined text-[12px] fill-current">check_circle</span>
          Plan Activo
        </span>
        <span 
          v-else-if="plan.popular" 
          class="absolute -top-3 left-6 bg-[#2563EB] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
        >
          Recomendado
        </span>

        <div>
          <!-- Plan Header -->
          <div class="mb-5">
            <h3 class="text-[20px] font-extrabold text-[#18181B] tracking-tight mb-1">{{ plan.name }}</h3>
            <p class="text-[12.5px] text-[#71717A] leading-[1.5]">{{ plan.desc }}</p>
          </div>

          <!-- Plan Price -->
          <div class="mb-6 flex items-baseline gap-1">
            <span class="text-[32px] font-black text-[#18181B] tracking-tight">
              {{ formatCurrency(isAnnual ? plan.priceAnnual : plan.priceMonthly) }}
            </span>
            <span class="text-[12.5px] text-[#71717A] font-semibold">
              / {{ isAnnual ? 'año' : 'mes' }}
            </span>
          </div>

          <!-- Limits summary -->
          <div class="bg-[#FAFAFA] border border-[#F4F4F5] rounded-[10px] p-3 mb-6 space-y-1.5">
            <div class="flex items-center gap-2 text-[12px] font-semibold text-[#18181B]">
              <span class="material-symbols-outlined text-[16px] text-[#71717A]">group</span>
              {{ plan.limits.users }}
            </div>
            <div class="flex items-center gap-2 text-[12px] font-semibold text-[#18181B]">
              <span class="material-symbols-outlined text-[16px] text-[#71717A]">receipt_long</span>
              {{ plan.limits.invoices }}
            </div>
          </div>

          <div class="h-px bg-[#F4F4F5] mb-6"></div>

          <!-- Features list -->
          <div class="space-y-3 mb-8">
            <p class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Incluye:</p>
            <div 
              v-for="feat in plan.features" 
              :key="feat"
              class="flex items-start gap-2.5 text-[12.5px] text-[#18181B] font-medium"
            >
              <span class="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">check_circle</span>
              <span>{{ feat }}</span>
            </div>

            <!-- Locked features for representation -->
            <div 
              v-for="feat in plan.lockedFeatures" 
              :key="feat"
              class="flex items-start gap-2.5 text-[12.5px] text-[#A1A1AA] font-medium opacity-50"
            >
              <span class="material-symbols-outlined text-[16px] text-[#A1A1AA] mt-0.5">lock</span>
              <span class="line-through">{{ feat }}</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button 
          v-if="currentPlan === plan.id"
          disabled
          class="w-full py-3 bg-[#FAFAFA] border border-[#E4E4E7] text-[#A1A1AA] rounded-[10px] text-[13px] font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <span class="material-symbols-outlined text-[16px]">check</span>
          Tu Plan Actual
        </button>
        <button 
          v-else
          @click="handleUpgradeReal(plan.id)"
          :class="[
            'w-full py-3 rounded-[10px] text-[13px] font-semibold transition-colors text-center shadow-sm',
            plan.popular 
              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' 
              : 'bg-[#18181B] text-white hover:bg-[#27272A]'
          ]"
          :disabled="isCheckoutLoading"
        >
          <span v-if="isCheckoutLoading" class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
          Solicitar Upgrade
        </button>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-4xl mx-auto border-t border-[#E4E4E7] pt-12">
      <h3 class="text-[20px] font-extrabold text-[#18181B] tracking-tight text-center mb-8">Preguntas frecuentes</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13.5px] leading-[1.6]">
        <div>
          <h4 class="font-bold text-[#18181B] mb-1.5">¿Qué ocurre si supero el límite de facturas mensuales del plan Starter?</h4>
          <p class="text-[#71717A]">
            El plan Starter tiene un límite estricto de 50 facturas electrónicas por mes. Si requieres emitir más, puedes solicitar una actualización al plan Pyme de forma instantánea.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-[#18181B] mb-1.5">¿Cómo se contabilizan los límites de usuarios?</h4>
          <p class="text-[#71717A]">
            Contamos los usuarios colaboradores activos agregados a tu organización. Puedes invitar y remover miembros según los límites establecidos en tu plan actual.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-[#18181B] mb-1.5">¿Puedo cambiar de plan en cualquier momento?</h4>
          <p class="text-[#71717A]">
            Sí, puedes solicitar una actualización de plan directamente. El nuevo plan, sus características y sus límites se activarán de inmediato una vez aprobados.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-[#18181B] mb-1.5">¿El asistente IA está disponible en todos los planes?</h4>
          <p class="text-[#71717A]">
            El Asistente Inteligente (ContexAI) requiere del motor computacional del plan Pyme o Enterprise debido a su alto volumen de procesamiento y predicción.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.w-5\.5 { width: 1.375rem; }
.h-5\.5 { height: 1.375rem; }
.w-12 { width: 3rem; }
.h-6\.5 { height: 1.625rem; }
.translate-x-5\.5 { transform: translateX(1.375rem); }
</style>
