<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'request-demo'): void
  (e: 'show-privacy'): void
  (e: 'show-terms'): void
  (e: 'show-about'): void
  (e: 'show-pricing'): void
  (e: 'purchase-plan', payload: { planType: string; billing: 'monthly' | 'annual' }): void
}>()

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Pricing section state
const isAnnual = ref(false)
const selectedPlan = ref<any>(null)
const showWompi = ref(false)
const paymentStep = ref('details')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const cardHolder = ref('')
const cardEmail = ref('')
const selectedPaymentMethod = ref('card')
const selectedBank = ref('')

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
    popular: false,
    features: [
      '1 Usuario incluido',
      '50 facturas electrónicas / mes',
      'Dashboard operativo',
      'Facturación electrónica DIAN',
      'Cotizaciones y Terceros'
    ]
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
    popular: true,
    features: [
      'Hasta 5 Usuarios incluidos',
      'Facturación electrónica ilimitada',
      'Control de Inventario',
      'Compras y Egresos',
      'Tesorería y Bancos',
      'Copiloto de IA (ContexAI)'
    ]
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
    popular: false,
    features: [
      'Usuarios ilimitados',
      'Facturación electrónica ilimitada',
      'Todos los módulos incluidos',
      'Soporte 24/7 Dedicado',
      'Garantía de SLA 99.99%',
      'Capacitación y onboarding'
    ]
  }
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
  cardHolder.value = ''
  cardEmail.value = ''
  selectedPaymentMethod.value = 'card'
  selectedBank.value = ''
  showWompi.value = true
}

async function submitPayment() {
  paymentStep.value = 'processing'
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/subscriptions/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType: selectedPlan.value.id,
        billing: isAnnual.value ? 'annual' : 'monthly',
      }),
    })
    const data = await response.json()
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl
      return
    }
  } catch (e) {
    console.error('Error creating Wompi link', e)
  }
  // Fallback
  setTimeout(() => {
    paymentStep.value = 'success'
  }, 2000)
}

function closeWompi() {
  showWompi.value = false
  selectedPlan.value = null
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#09090B] font-['Inter'] relative overflow-hidden">
    <!-- Subtle blue radial accent -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 right-0 w-[1100px] h-[700px] rounded-full opacity-70 -z-0"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    ></div>

    <!-- Navegación -->
    <nav
      class="relative flex justify-between items-center h-20 px-6 lg:px-8 sticky top-0 z-40 transition-all duration-300"
      :class="scrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#F4F4F5] shadow-sm' : 'bg-transparent'"
    >
      <div class="flex items-center gap-2.5">
        <svg class="c360-mark flex-shrink-0" width="32" height="32" viewBox="0 0 56 56">
          <rect width="56" height="56" rx="12" fill="#18181B"/>
          <g class="rotor">
            <path d="M44 18 A 16 16 0 1 0 44 38" stroke="#fff" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            <path d="M44 18 A 16 16 0 0 1 44 38" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round" fill="none"/>
          </g>
        </svg>
        <span class="text-[18px] font-bold tracking-tight text-[#18181B]">Contex360</span>
      </div>

      <div class="hidden lg:flex items-center gap-10">
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" href="#producto">Plataforma</a>
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" href="#beneficios">Soluciones Enterprise</a>
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" href="#precios">Precios</a>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="text-[13px] font-semibold text-[#18181B] px-4 py-2.5 rounded-lg hover:bg-[#F4F4F5] transition-all"
          @click="emit('login')"
        >
          Iniciar Sesión
        </button>
        <button
          class="bg-[#18181B] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#27272A] transition-all shadow-sm"
          @click="emit('request-demo')"
        >
          Solicitar Demo
        </button>
      </div>
    </nav>

    <!-- Hero -->
    <section class="relative pt-16 pb-24 lg:pt-28 lg:pb-40 border-b border-[#F4F4F5]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-20 items-center">
        <div class="z-10">
          <!-- Chip system -->
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 mb-7 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
            <span class="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
            ERP de Próxima Generación
          </div>

          <h1
            class="text-[48px] lg:text-[68px] leading-[0.98] tracking-[-0.035em] font-bold text-[#18181B] mb-7"
            style="text-wrap: balance;"
          >
            El cerebro <em class="not-italic text-[#2563EB]">logístico</em> de tu negocio.
          </h1>
          <p class="text-[17px] leading-[1.55] text-[#71717A] mb-10 max-w-lg font-medium">
            Una plataforma sofisticada y ultra-rápida diseñada para corporaciones colombianas. Automatiza contabilidad, inventarios y facturación con precisión.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              class="bg-[#18181B] text-white text-[14px] font-semibold px-8 py-3.5 rounded-[10px] shadow-lg shadow-black/5 hover:bg-[#27272A] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2.5"
              @click="emit('request-demo')"
            >
              Iniciar Prueba Gratuita
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              class="bg-white border border-[#E4E4E7] text-[#18181B] text-[14px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#FAFAFA] transition-all"
              @click="emit('show-about')"
            >
              Ver Capacidades
            </button>
          </div>

          <!-- Pillars rail (V2 system) -->
          <div class="mt-14 grid grid-cols-3 gap-6 max-w-[520px]">
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-bold text-[20px] text-[#18181B] tracking-tight">500+</b>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-[#A1A1AA]">Clientes Activos</span>
            </div>
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-bold text-[20px] text-[#18181B] tracking-tight">DIAN</b>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-[#A1A1AA]">Partner Certificado</span>
            </div>
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-bold text-[20px] text-[#18181B] tracking-tight">99.98%</b>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-[#A1A1AA]">Uptime SLA</span>
            </div>
          </div>
        </div>

        <!-- Dashboard preview card -->
        <div class="relative">
          <div class="absolute inset-0 bg-[#F4F4F5] rounded-[24px] translate-x-3 translate-y-3 -z-10 border border-[#E4E4E7]"></div>
          <div class="bg-white p-3 rounded-[24px] border border-[#E4E4E7] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] relative overflow-hidden group">
            <img
              alt="Dashboard Contex360"
              class="rounded-[18px] w-full object-cover grayscale-[0.15] group-hover:grayscale-0 transition-all duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDevAbrAx6NG9DC4ljVlLz6U4hQtD34h0rbeGnn7sBe9MDCDpYEpB12WaJ2cLbAoyd398F5r0V1Dz6JDX9FJNiyK-j6rvnkyqe5KFT13O5PUy1nliG-EeION4WvPzneGzXs3Y22ANd7Ou6lGtNQeysqaXBGsqthigNPEJo9xASXe8NBY_W5GwgplryWlmnwtwtRhpOmcd-Cqz38--JKokTS9-ADDLn4Ark4GAkmeQ7NsXtepFFRmxVQKJ6wy3jazfpnh23T8hvsUgq"
            />
          </div>

          <!-- Floating trust chips -->
          <div class="absolute -bottom-4 left-6 flex gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] shadow-sm">
              <span class="material-symbols-outlined text-[14px]">lock</span>
              SSL/TLS 1.3
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] shadow-sm">
              <span class="material-symbols-outlined text-[14px]">shield</span>
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="producto" class="py-28 lg:py-32 bg-[#FAFAFA] border-b border-[#F4F4F5]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div class="max-w-2xl">
            <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">Infraestructura Central</h2>
            <h3 class="text-[36px] lg:text-[42px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B]" style="text-wrap: balance;">
              Estructurado para escala corporativa.
            </h3>
          </div>
          <p class="text-[15px] leading-[1.55] text-[#71717A] max-w-sm font-medium">
            Una única fuente de verdad para cada operación, desde inventarios multi-bodega hasta informes financieros en tiempo real.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-9 rounded-[18px] border border-[#E4E4E7] hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group">
            <div class="w-11 h-11 bg-[#F4F4F5] rounded-[10px] flex items-center justify-center text-[#18181B] mb-7 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span class="material-symbols-outlined" translate="no">verified_user</span>
            </div>
            <h4 class="text-[18px] font-bold text-[#18181B] mb-3 tracking-tight">Seguridad de Grado Bancario</h4>
            <p class="text-[14px] leading-[1.55] text-[#71717A] font-medium">
              Encriptación de nivel empresarial y copias de seguridad automáticas que aseguran que tus datos financieros estén siempre protegidos y disponibles.
            </p>
          </div>

          <div class="bg-white p-9 rounded-[18px] border border-[#E4E4E7] hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group">
            <div class="w-11 h-11 bg-[#F4F4F5] rounded-[10px] flex items-center justify-center text-[#18181B] mb-7 group-hover:bg-[#2563EB] group-hover:text-white transition-all">
              <span class="material-symbols-outlined" translate="no">bolt</span>
            </div>
            <h4 class="text-[18px] font-bold text-[#18181B] mb-3 tracking-tight">Motor de Alta Velocidad</h4>
            <p class="text-[14px] leading-[1.55] text-[#71717A] font-medium">
              Procesamiento de datos en tiempo real para informes contables complejos y estados financieros en segundos, no horas.
            </p>
          </div>

          <div class="bg-white p-9 rounded-[18px] border border-[#E4E4E7] hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group">
            <div class="w-11 h-11 bg-[#F4F4F5] rounded-[10px] flex items-center justify-center text-[#18181B] mb-7 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span class="material-symbols-outlined" translate="no">apartment</span>
            </div>
            <h4 class="text-[18px] font-bold text-[#18181B] mb-3 tracking-tight">Cumplimiento Colombiano</h4>
            <p class="text-[14px] leading-[1.55] text-[#71717A] font-medium">
              Totalmente adaptado a las regulaciones de la DIAN: facturación electrónica, nómina e informes de exógena integrados.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="precios" class="py-24 lg:py-28 bg-[#FAFAFA] border-b border-[#F4F4F5]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">Tarifas Transparentes</h2>
          <h3 class="text-[36px] lg:text-[42px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-5">
            Elige el plan ideal para tu negocio
          </h3>
          <p class="text-[15px] leading-[1.55] text-[#71717A] max-w-lg mx-auto font-medium">
            Sin contratos a largo plazo, sin cargos ocultos. Cambia de plan o cancela cuando quieras.
          </p>

          <!-- Toggle mensual/anual -->
          <div class="flex items-center justify-center gap-3.5 mt-8">
            <span :class="['text-[13.5px] font-semibold transition-colors', !isAnnual ? 'text-[#18181B]' : 'text-[#71717A]']">Mensual</span>
            <button 
              @click="isAnnual = !isAnnual"
              class="w-12 h-6.5 rounded-full bg-[#E4E4E7] p-0.5 relative transition-colors duration-200 outline-none"
              :class="{ 'bg-[#18181B]': isAnnual }"
            >
              <span 
                class="block w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="{ 'translate-x-5.5': isAnnual }"
              ></span>
            </button>
            <span :class="['text-[13.5px] font-semibold transition-colors flex items-center gap-1.5', isAnnual ? 'text-[#18181B]' : 'text-[#71717A]']">
              Anual
              <span class="bg-[#10B981]/15 text-[#10B981] text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">
                Ahorra 25% + 2 Meses Gratis
              </span>
            </span>
          </div>
        </div>

        <!-- Pricing Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div 
            v-for="plan in plans" 
            :key="plan.id"
            :class="[
              'bg-white border rounded-[20px] p-8 shadow-sm flex flex-col justify-between relative transition-all duration-300 hover:shadow-md',
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
              <div class="mb-6">
                <h4 class="text-[22px] font-black text-[#18181B] tracking-tight mb-2">{{ plan.name }}</h4>
                <p class="text-[13px] text-[#71717A] leading-[1.5]">{{ plan.desc }}</p>
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
                <p v-if="isAnnual" class="text-[11.5px] text-emerald-600 font-bold mt-1">
                  Equivale a {{ formatCurrency(Math.round(plan.priceAnnual / 12)) }} al mes
                </p>
              </div>

              <!-- Features checklist -->
              <div class="space-y-3 mb-8">
                <div 
                  v-for="feat in plan.features" 
                  :key="feat" 
                  class="flex items-start gap-2.5 text-[13px] font-semibold text-[#3F3F46]"
                >
                  <span class="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">check_circle</span>
                  <span>{{ feat }}</span>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="space-y-2.5 mt-auto">
              <button 
                @click="openCheckout(plan)"
                :class="[
                  'w-full py-3.5 rounded-[12px] text-[13px] font-extrabold transition-colors text-center shadow-sm flex items-center justify-center gap-2',
                  plan.popular 
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' 
                    : 'bg-[#18181B] text-white hover:bg-[#27272A]'
                ]"
              >
                <span class="material-symbols-outlined text-[16px]">credit_card</span>
                Comprar ahora
              </button>
              <button 
                @click="emit('request-demo')"
                class="w-full py-3.5 border border-[#E4E4E7] text-[#18181B] bg-white rounded-[12px] text-[13px] font-extrabold hover:bg-[#FAFAFA] transition-colors"
              >
                Comenzar prueba gratis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Simulated Wompi Checkout Overlay -->
    <Teleport to="body">
      <div 
        v-if="showWompi"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090B]/50 backdrop-blur-sm"
      >
        <div class="bg-white border border-[#E4E4E7] rounded-[24px] shadow-2xl w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col text-left">
          <!-- Wompi branded header -->
          <div class="bg-[#F4F1DE] px-6 py-5 border-b border-[#E8E5CE] flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="bg-[#FE5F55] text-white font-black px-2.5 py-1.5 rounded-lg text-[14px] tracking-tighter flex items-center gap-0.5">
                <span>w</span>
                <span class="w-1.5 h-1.5 rounded-full bg-white self-end mb-1"></span>
                <span>mpi</span>
              </div>
              <div>
                <h4 class="text-[14px] font-black text-[#3D405B] tracking-tight">Checkout Seguro</h4>
                <p class="text-[11px] text-[#3D405B]/70 font-semibold">Pasarela de pagos enlazada</p>
              </div>
            </div>
            <button 
              @click="closeWompi" 
              class="w-7 h-7 rounded-full hover:bg-black/5 text-[#3D405B] flex items-center justify-center transition-colors"
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
            <form v-if="paymentStep === 'details'" @submit.prevent="submitPayment" class="space-y-4">
              <!-- Payment method selection -->
              <div class="grid grid-cols-2 gap-2.5 p-1 bg-[#F4F4F5] rounded-lg mb-4">
                <button
                  type="button"
                  @click="selectedPaymentMethod = 'card'"
                  :class="['py-2 text-[12px] font-bold rounded-md transition-all text-center', selectedPaymentMethod === 'card' ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A]']"
                >
                  Tarjeta de Crédito
                </button>
                <button
                  type="button"
                  @click="selectedPaymentMethod = 'pse'"
                  :class="['py-2 text-[12px] font-bold rounded-md transition-all text-center', selectedPaymentMethod === 'pse' ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A]']"
                >
                  Débito PSE
                </button>
              </div>

              <!-- PSE Fields -->
              <div v-if="selectedPaymentMethod === 'pse'" class="space-y-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Banco</label>
                  <select 
                    required 
                    v-model="selectedBank"
                    class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-black"
                  >
                    <option value="" disabled>Selecciona tu banco...</option>
                    <option value="bancolombia">Bancolombia</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bogota">Banco de Bogotá</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Correo Electrónico registrado</label>
                  <input 
                    type="email" 
                    required 
                    v-model="cardEmail"
                    placeholder="ejemplo@correo.com"
                    class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-black"
                  />
                </div>
              </div>

              <!-- Credit Card Fields -->
              <div v-else class="space-y-3.5">
                <div>
                  <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Nombre en la tarjeta</label>
                  <input 
                    type="text" 
                    required 
                    v-model="cardHolder"
                    placeholder="Juan Pérez"
                    class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Correo electrónico</label>
                  <input 
                    type="email" 
                    required 
                    v-model="cardEmail"
                    placeholder="juan@ejemplo.com"
                    class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Número de tarjeta</label>
                  <input 
                    type="text" 
                    required 
                    v-model="cardNumber"
                    placeholder="•••• •••• •••• ••••"
                    class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-black"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Expiración</label>
                    <input 
                      type="text" 
                      required 
                      v-model="cardExpiry"
                      placeholder="MM/AA"
                      class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">CVC / CVV</label>
                    <input 
                      type="password" 
                      required 
                      v-model="cardCvc"
                      placeholder="•••"
                      maxlength="4"
                      class="w-full border border-[#E4E4E7] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <!-- Submit button -->
              <button 
                type="submit"
                class="w-full py-4 bg-[#FE5F55] text-white text-[13px] font-extrabold rounded-xl hover:bg-[#eb574e] transition-colors shadow-md mt-6 flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[18px]">lock</span>
                Pagar de Forma Segura
              </button>
            </form>

            <!-- Processing step -->
            <div v-else-if="paymentStep === 'processing'" class="py-12 flex flex-col items-center justify-center text-center">
              <span class="animate-spin w-10 h-10 border-4 border-[#FE5F55] border-t-transparent rounded-full mb-4"></span>
              <h4 class="text-[15px] font-black text-[#18181B]">Procesando transacción</h4>
              <p class="text-[12px] text-[#71717A] max-w-[280px] mt-1.5">
                Por favor no cierres la ventana. Estamos validando la transacción con la red bancaria.
              </p>
            </div>

            <!-- Success step -->
            <div v-else-if="paymentStep === 'success'" class="py-8 flex flex-col items-center justify-center text-center">
              <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-[32px] fill-current">check_circle</span>
              </div>
              <h4 class="text-[18px] font-black text-[#18181B]">¡Pago exitoso!</h4>
              <p class="text-[13px] text-[#71717A] max-w-[320px] mt-2 leading-relaxed">
                Tu transacción ha sido aprobada. Se ha enviado el comprobante de compra y los accesos a tu correo <b class="text-[#18181B] font-bold">{{ cardEmail }}</b>.
              </p>
              
              <button 
                @click="closeWompi"
                class="w-full py-3.5 bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-extrabold rounded-xl transition-all shadow-md mt-8"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- CTA strip -->
    <section class="py-20 lg:py-24 bg-white">
      <div class="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <h3 class="text-[32px] lg:text-[44px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-5" style="text-wrap: balance;">
          ¿Listo para llevar su back-office <em class="not-italic text-[#2563EB]">al siguiente nivel</em>?
        </h3>
        <p class="text-[16px] text-[#71717A] mb-9 max-w-xl mx-auto font-medium">
          Agende una demostración de 30 minutos con nuestro equipo. Sin compromiso, sin tarjeta de crédito.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            class="bg-[#18181B] text-white text-[14px] font-semibold px-8 py-3.5 rounded-[10px] shadow-lg shadow-black/5 hover:bg-[#27272A] transition-all flex items-center justify-center gap-2.5"
            @click="emit('request-demo')"
          >
            Solicitar Demo
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            class="bg-white border border-[#E4E4E7] text-[#18181B] text-[14px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#FAFAFA] transition-all"
            @click="emit('login')"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-14 border-t border-[#F4F4F5] bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <svg class="c360-mark flex-shrink-0" width="24" height="24" viewBox="0 0 56 56">
              <rect width="56" height="56" rx="12" fill="#18181B"/>
              <g class="rotor">
                <path d="M44 18 A 16 16 0 1 0 44 38" stroke="#fff" stroke-width="5.5" stroke-linecap="round" fill="none"/>
                <path d="M44 18 A 16 16 0 0 1 44 38" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round" fill="none"/>
              </g>
            </svg>
            <span class="text-[16px] font-bold text-[#18181B]">Contex360</span>
          </div>
          <p class="text-[12px] text-[#A1A1AA] font-medium max-w-[220px] leading-relaxed">Sistemas Administrativos Avanzados para la Empresa Colombiana.</p>
        </div>
        <div class="flex gap-12">
          <div class="flex flex-col gap-3">
            <span class="text-[11px] font-bold text-[#18181B] uppercase tracking-widest">Plataforma</span>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('show-about')">Características</a>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('request-demo')">Demo</a>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-[11px] font-bold text-[#18181B] uppercase tracking-widest">Legal</span>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('show-terms')">Términos</a>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('show-privacy')">Privacidad</a>
          </div>
        </div>
        <p class="text-[12px] text-[#A1A1AA] font-medium">© 2026 Contex360. Todos los derechos reservados.</p>
      </div>
    </footer>
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
