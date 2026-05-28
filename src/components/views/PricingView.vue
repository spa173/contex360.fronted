<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useStateStore } from '../../stores/stateStore'
import { businessApi } from '../../services/businessApi'
import { toast } from 'vue-sonner'
import { useHead } from '@unhead/vue'
import { useRouter } from 'vue-router'

useHead({
  title: 'Planes y Precios',
  meta: [
    { name: 'description', content: 'Elige el plan ideal para tu empresa. Desde el plan Gratuito hasta el plan Enterprise.' },
    { property: 'og:title', content: 'Planes y Precios' },
    { property: 'og:description', content: 'Elige el plan ideal para tu empresa. Desde el plan Gratuito hasta el plan Enterprise.' },
    { name: 'twitter:title', content: 'Planes y Precios' },
    { name: 'twitter:description', content: 'Elige el plan ideal para tu empresa. Desde el plan Gratuito hasta el plan Enterprise.' },
  ]
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'request-demo'): void
  (e: 'purchase-plan', payload: { planType: string; billing: 'monthly' | 'annual' }): void
}>()

const router = useRouter()

const isAnnual = ref(false)
const selectedPlan = ref<any>(null)
const showWompi = ref(false)
const paymentStep = ref('details') // details -> processing -> success
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')

// Handle query params for retry/update payment method
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const retry = params.get('retry')
  const updateMethod = params.get('update_method')
  const payOverdue = params.get('pay_overdue')
  const planType = params.get('plan')
  const billing = params.get('billing')
  const tenantId = params.get('tenantId')
  
  if (retry === 'true' || updateMethod === 'true' || payOverdue === 'true') {
    // Set the plan based on query params if provided (for retry/update)
    if (planType && (retry === 'true' || updateMethod === 'true')) {
      const plan = plans.find(p => p.id === planType)
      if (plan) {
        selectedPlan.value = plan
        isAnnual.value = billing === 'annual'
      }
    }
    
    // Open the payment modal automatically
    showWompi.value = true
    paymentStep.value = 'details'
    
    // Clear the query params from URL to avoid loops
    const newParams = new URLSearchParams()
    if (!retry) newParams.set('plan', planType || '')
    if (!updateMethod) newParams.set('billing', billing || '')
    if (!payOverdue) {
      newParams.set('tenantId', tenantId || '')
      newParams.set('plan', planType || '')
      newParams.set('billing', billing || '')
    }
    if (newParams.toString()) {
      window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`)
    } else {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }
})


const plans = [
  {
    id: 'starter',
    name: 'Starter',
    desc: 'Perfecto para trabajadores independientes y microempresas en crecimiento.',
    priceMonthly: 89000,
    priceAnnual: 801000,
    limits: {
      users: '1 Usuario',
      invoices: '50 facturas / mes',
    },
    popular: false
  },
  {
    id: 'pyme',
    name: 'Pyme',
    desc: 'El balance ideal para pequeñas y medianas empresas en etapa de aceleración.',
    priceMonthly: 189000,
    priceAnnual: 1701000,
    limits: {
      users: 'Hasta 5 Usuarios',
      invoices: 'Facturas ilimitadas',
    },
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'Máxima potencia operativa y soporte empresarial sin límites.',
    priceMonthly: 389000,
    priceAnnual: 3501000,
    limits: {
      users: 'Usuarios ilimitados',
      invoices: 'Facturas ilimitadas',
    },
    popular: false
  }
]

const features = [
  { name: 'Usuarios incluidos', starter: '1', pyme: '5', enterprise: 'Ilimitados' },
  { name: 'Facturas electrónicas / mes', starter: '50', pyme: 'Ilimitadas', enterprise: 'Ilimitadas' },
  { name: 'Dashboard operativo', starter: '✅', pyme: '✅', enterprise: '✅' },
  { name: 'Facturación electrónica DIAN', starter: '✅', pyme: '✅', enterprise: '✅' },
  { name: 'Cotizaciones y Terceros', starter: '✅', pyme: '✅', enterprise: '✅' },
  { name: 'Compras y Egresos', starter: '❌', pyme: '✅', enterprise: '✅' },
  { name: 'Control de Inventario', starter: '❌', pyme: '✅', enterprise: '✅' },
  { name: 'Tesorería y Bancos', starter: '❌', pyme: '✅', enterprise: '✅' },
  { name: 'Reportes y Analítica', starter: '❌', pyme: '✅', enterprise: '✅' },
  { name: 'Copiloto de IA (ContexAI)', starter: '❌', pyme: '✅', enterprise: '✅' },
  { name: 'Soporte al cliente', starter: 'Correo', pyme: 'Chat y Correo', enterprise: '24/7 Dedicado' },
  { name: 'Garantía de SLA', starter: '❌', pyme: '99.9%', enterprise: '99.99%' },
]

function formatCurrency(val: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(val)
}

function openCheckout(plan: any) {
  selectedPlan.value = plan
  paymentStep.value = 'details'
  cardNumber.value = ''
  cardExpiry.value = ''
  cardCvc.value = ''
  showWompi.value = true
}

async function submitPaymentReal() {
  paymentStep.value = 'processing'
  try {
    const store = useStateStore()
    const tenantId = store.activeTenantId || store.currentUser?.tenantId || null

    if (!tenantId) {
      paymentStep.value = 'details'
      toast.info('Inicia sesión para continuar con la compra.')
      emit('login')
      return
    }

    const billing = isAnnual.value ? 'annual' : 'monthly'
    const { redirectUrl } = await businessApi.createSubscriptionCheckout(
      { planType: selectedPlan.value.id, billing },
      tenantId,
    )

    if (!redirectUrl) {
      throw new Error('No se recibió el enlace de pago.')
    }

    toast.info('Redirigiendo a Wompi...', { description: 'Completa el pago para activar tu plan.' })
    window.location.href = redirectUrl
  } catch (e: any) {
    paymentStep.value = 'details'
    console.error('Error creating Wompi link', e)
    toast.error('No se pudo iniciar el checkout', {
      description: e?.message || 'Intenta nuevamente en unos segundos.',
    })
  }
}

function closeWompi() {
  showWompi.value = false
  selectedPlan.value = null
}
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA] text-[#09090B] font-['Inter'] relative pb-20">
    <!-- Header -->
    <header class="h-20 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30 shadow-sm">
      <div class="flex items-center gap-2.5">
        <svg
          class="c360-mark flex-shrink-0"
          width="32"
          height="32"
          viewBox="0 0 56 56"
          aria-hidden="true"
        >
          <rect
            width="56"
            height="56"
            rx="12"
            fill="#18181B"
          />
          <g class="rotor">
            <path
              d="M44 18 A 16 16 0 1 0 44 38"
              stroke="#fff"
              stroke-width="5.5"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M44 18 A 16 16 0 0 1 44 38"
              stroke="#2563EB"
              stroke-width="5.5"
              stroke-linecap="round"
              fill="none"
            />
          </g>
        </svg>
        <span class="text-[18px] font-bold tracking-tight text-[#18181B]">Contex360</span>
      </div>

      <button 
        class="flex items-center gap-1.5 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors" 
        @click="emit('back')"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver al inicio
      </button>
    </header>

    <main class="max-w-6xl mx-auto px-6 lg:px-8 pt-12">
      <!-- Title section -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="text-[11px] uppercase tracking-[0.15em] font-bold text-[#2563EB] bg-[#2563EB]/10 px-2.5 py-1 rounded-full">Tarifas Transparentes</span>
        <h1 class="text-[36px] sm:text-[44px] font-black tracking-[-0.03em] text-[#18181B] mt-4 mb-3">
          Elige el plan ideal para tu negocio
        </h1>
        <p class="text-[15px] sm:text-[16px] text-[#71717A] leading-[1.6]">
          Sin contratos a largo plazo, sin cargos ocultos. Cambia de plan o cancela cuando quieras.
        </p>

        <!-- Toggle mensual/anual -->
        <div class="flex items-center justify-center gap-3.5 mt-8">
          <span :class="['text-[13.5px] font-semibold transition-colors', !isAnnual ? 'text-[#18181B]' : 'text-[#71717A]']">Mensual</span>
          <button 
            class="w-12 h-6.5 rounded-full bg-[#E4E4E7] p-0.5 relative transition-colors duration-200 outline-none"
            :class="{ 'bg-[#18181B]': isAnnual }"
            @click="isAnnual = !isAnnual"
          >
            <span 
              class="block w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform duration-200"
              :class="{ 'translate-x-5.5': isAnnual }"
            />
          </button>
          <span :class="['text-[13.5px] font-semibold transition-colors flex items-center gap-1.5', isAnnual ? 'text-[#18181B]' : 'text-[#71717A]']">
            Anual
            <span class="bg-[#10B981]/15 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
              Ahorra 25% + 2 Meses Gratis
            </span>
          </span>
        </div>
      </div>

      <!-- Pricing cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div 
          v-for="plan in plans" 
          :key="plan.id"
          :class="[
            'bg-white border rounded-[20px] p-7 shadow-sm flex flex-col justify-between relative transition-all duration-300 hover:shadow-md',
            plan.popular ? 'border-[#2563EB] ring-4 ring-[#2563EB]/5' : 'border-[#E4E4E7]'
          ]"
        >
          <!-- Badge popular -->
          <span 
            v-if="plan.popular" 
            class="absolute -top-3.5 left-6 bg-[#2563EB] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm"
          >
            Más popular
          </span>

          <div>
            <!-- Plan Header -->
            <div class="mb-5">
              <h3 class="text-[22px] font-black text-[#18181B] tracking-tight mb-2">
                {{ plan.name }}
              </h3>
              <p class="text-[13px] text-[#71717A] leading-[1.5]">
                {{ plan.desc }}
              </p>
            </div>

            <!-- Price -->
            <div class="mb-6">
              <div class="flex items-baseline gap-1">
                <span class="text-[38px] font-black text-[#18181B] tracking-tight">
                  {{ formatCurrency(isAnnual ? plan.priceAnnual : plan.priceMonthly) }}
                </span>
                <span class="text-[13px] text-[#71717A] font-semibold">
                  / {{ isAnnual ? 'año' : 'mes' }}
                </span>
              </div>
              <p
                v-if="isAnnual"
                class="text-[11.5px] text-emerald-600 font-bold mt-1"
              >
                Equivale a {{ formatCurrency(Math.round(plan.priceAnnual / 12)) }} al mes
              </p>
            </div>

            <!-- Limits summary -->
            <div class="bg-[#F8F9FA] border border-[#F1F3F5] rounded-xl p-3.5 mb-6 space-y-2">
              <div class="flex items-center gap-2 text-[12.5px] font-bold text-[#18181B]">
                <span class="material-symbols-outlined text-[18px] text-[#71717A]">group</span>
                {{ plan.limits.users }}
              </div>
              <div class="flex items-center gap-2 text-[12.5px] font-bold text-[#18181B]">
                <span class="material-symbols-outlined text-[18px] text-[#71717A]">receipt_long</span>
                {{ plan.limits.invoices }}
              </div>
            </div>

            <div class="h-px bg-[#F4F4F5] mb-6" />
          </div>

          <!-- Buttons -->
          <div class="space-y-2.5 mt-auto">
            <button 
              :class="[
                'w-full py-3.5 rounded-[12px] text-[13px] font-extrabold transition-colors text-center shadow-sm flex items-center justify-center gap-2',
                plan.popular 
                  ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' 
                  : 'bg-[#18181B] text-white hover:bg-[#27272A]'
              ]"
              @click="openCheckout(plan)"
            >
              <span class="material-symbols-outlined text-[16px]">credit_card</span>
              Comprar ahora
            </button>
            <button 
              class="w-full py-3.5 border border-[#E4E4E7] text-[#18181B] bg-white rounded-[12px] text-[13px] font-extrabold hover:bg-[#FAFAFA] transition-colors"
              @click="emit('request-demo')"
            >
              Comenzar prueba gratis
            </button>
          </div>
        </div>
      </div>

      <!-- Feature Comparison Table -->
      <div class="bg-white border border-[#E4E4E7] rounded-[20px] overflow-hidden shadow-sm mb-16">
        <div class="p-6 border-b border-[#E4E4E7] bg-white">
          <h3 class="text-[18px] font-black text-[#18181B] tracking-tight">
            Tabla comparativa de características
          </h3>
          <p class="text-[13px] text-[#71717A] mt-1">
            Conoce al detalle lo que incluye cada uno de nuestros planes.
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#F8F9FA] border-b border-[#E4E4E7] text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                <th class="py-4 px-6">
                  Característica
                </th>
                <th class="py-4 px-6 text-center w-[20%]">
                  Starter
                </th>
                <th class="py-4 px-6 text-center w-[20%]">
                  Pyme
                </th>
                <th class="py-4 px-6 text-center w-[20%]">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#E4E4E7] text-[13px]">
              <tr 
                v-for="feat in features" 
                :key="feat.name"
                class="hover:bg-[#FAFAFA] transition-colors"
              >
                <td class="py-4 px-6 font-semibold text-[#18181B]">
                  {{ feat.name }}
                </td>
                <td class="py-4 px-6 text-center font-semibold text-[#475569]">
                  {{ feat.starter }}
                </td>
                <td class="py-4 px-6 text-center font-semibold text-[#475569]">
                  {{ feat.pyme }}
                </td>
                <td class="py-4 px-6 text-center font-semibold text-[#475569]">
                  {{ feat.enterprise }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Simulated Wompi Checkout Overlay -->
    <Teleport to="body">
      <div 
        v-if="showWompi"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090B]/50 backdrop-blur-sm"
      >
        <div class="bg-white border border-[#E4E4E7] rounded-[24px] shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
          <!-- Wompi branded header -->
          <div class="bg-[#F4F1DE] px-6 py-5 border-b border-[#E8E5CE] flex items-center justify-between">
            <div class="flex items-center gap-3">
              <!-- Simulated Wompi logo -->
              <div class="bg-[#FE5F55] text-white font-black px-2.5 py-1.5 rounded-lg text-[14px] tracking-tighter flex items-center gap-0.5">
                <span>w</span>
                <span class="w-1.5 h-1.5 rounded-full bg-white self-end mb-1" />
                <span>mpi</span>
              </div>
              <div>
                <h4 class="text-[14px] font-black text-[#3D405B] tracking-tight">
                  Checkout Seguro
                </h4>
                <p class="text-[11px] text-[#3D405B]/70 font-semibold">
                  Pasarela de pagos enlazada
                </p>
              </div>
            </div>
            <button 
              class="w-7 h-7 rounded-full hover:bg-black/5 text-[#3D405B] flex items-center justify-center transition-colors" 
              @click="closeWompi"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Checkout body -->
          <div class="p-6 flex-1 overflow-y-auto max-h-[80vh]">
            <!-- Order summary -->
            <div class="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-4 mb-6">
              <span class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">Resumen del pedido</span>
              <div class="flex justify-between items-baseline">
                <span class="text-[15px] font-black text-[#18181B]">{{ selectedPlan?.name }}</span>
                <span class="text-[15px] font-black text-[#2563EB]">
                  {{ formatCurrency(isAnnual ? selectedPlan?.priceAnnual : selectedPlan?.priceMonthly) }}
                </span>
              </div>
              <p class="text-[11px] text-[#71717A] mt-1">
                Suscripción {{ isAnnual ? 'anual (con 25% desc.)' : 'mensual' }}
              </p>
            </div>

            <!-- Payment process step 1: details -->
            <div
              v-if="paymentStep === 'details'"
              class="space-y-4"
            >
              <button 
                class="w-full py-4 bg-[#FE5F55] text-white text-[13px] font-extrabold rounded-xl hover:bg-[#eb574e] transition-colors shadow-md mt-2 flex items-center justify-center gap-1.5"
                @click="submitPaymentReal"
              >
                <span class="material-symbols-outlined text-[18px]">lock</span>
                Pagar con Wompi
              </button>
            </div>

            <!-- Processing step -->
            <div
              v-else-if="paymentStep === 'processing'"
              class="py-12 flex flex-col items-center justify-center text-center"
            >
              <span class="animate-spin w-10 h-10 border-4 border-[#FE5F55] border-t-transparent rounded-full mb-4" />
              <h4 class="text-[15px] font-black text-[#18181B]">
                Procesando transacción
              </h4>
              <p class="text-[12px] text-[#71717A] max-w-[280px] mt-1.5">
                Por favor no cierres la ventana. Estamos validando la transacción con la red bancaria.
              </p>
            </div>

            <!-- Success step -->
            <div
              v-else-if="paymentStep === 'success'"
              class="py-8 flex flex-col items-center justify-center text-center"
            >
              <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-[32px] fill-current">check_circle</span>
              </div>
              <h4 class="text-[18px] font-black text-[#18181B]">
                ¡Pago exitoso!
              </h4>
              <p class="text-[13px] text-[#71717A] max-w-[320px] mt-2 leading-relaxed">
                Tu transacción ha sido aprobada. Recibirás el comprobante de compra y los accesos por correo electrónico.
              </p>
              
              <button 
                class="w-full py-3.5 bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-extrabold rounded-xl transition-all shadow-md mt-8"
                @click="closeWompi"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
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
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
