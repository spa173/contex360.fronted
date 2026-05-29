<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { useStateStore } from '../stores/stateStore'
import { businessApi } from '../services/businessApi'
import { toast } from 'vue-sonner'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Contex360 — ERP Inteligente para Colombia',
  meta: [
    { name: 'description', content: 'Facturación electrónica DIAN, inventario, contabilidad y más en un solo lugar. Prueba Contex360 gratis.' },
    { property: 'og:title', content: 'Contex360 — ERP Inteligente' },
    { property: 'og:description', content: 'Facturación electrónica DIAN, inventario, contabilidad y más en un solo lugar. Prueba Contex360 gratis.' },
    { name: 'twitter:title', content: 'Contex360 — ERP Inteligente' },
    { name: 'twitter:description', content: 'Facturación electrónica DIAN, inventario, contabilidad y más en un solo lugar. Prueba Contex360 gratis.' },
  ]
})

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'request-demo'): void
  (e: 'show-privacy'): void
  (e: 'show-terms'): void
  (e: 'show-dpa'): void
  (e: 'show-bcp'): void
  (e: 'show-about'): void
  (e: 'show-pricing'): void
  (e: 'show-login'): void
  (e: 'purchase-plan', payload: { planType: string; billing: 'monthly' | 'annual' }): void
}>()

const scrolled = ref(false)

const handleScroll = useThrottleFn(() => {
  scrolled.value = window.scrollY > 20
}, 200)

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
const processingMessage = ref('')
const mobileNavOpen = ref(false)


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
  const store = useStateStore()
  const email = store.currentUser?.email
  
  if (!email) {
    toast.info('Inicia sesión para continuar con la compra.')
    emit('login')
    return
  }

  selectedPlan.value = plan
  paymentStep.value = 'details'
  showWompi.value = true
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCheckout() {
  const store = useStateStore()
  const email = store.currentUser?.email
  
  if (!email) {
    toast.error('Email requerido para continuar')
    closeWompi()
    emit('login')
    return false
  }
  
  if (!isValidEmail(email)) {
    toast.error('Email inválido detectado')
    return false
  }
  
  return true
}

async function submitPaymentReal() {
  if (!validateCheckout()) {
    return
  }

  processingMessage.value = 'Validando credenciales de usuario...'
  paymentStep.value = 'processing'
  try {
    const store = useStateStore()
    const tenantId = store.activeTenantId || store.currentUser?.tenantId || null

    if (!tenantId) {
      paymentStep.value = 'details'
      closeWompi()
      toast.info('Inicia sesión para continuar con la compra.')
      emit('login')
      return
    }

    processingMessage.value = 'Conectando con el servidor para iniciar checkout...'
    const billing = isAnnual.value ? 'annual' : 'monthly'
    
    // Simular retraso para progreso visual
    await new Promise(resolve => setTimeout(resolve, 800))
    
    processingMessage.value = 'Generando enlace de pago en Wompi...'
    const { redirectUrl } = await businessApi.createSubscriptionCheckout(
      { planType: selectedPlan.value.id, billing },
      tenantId,
    )

    if (!redirectUrl) {
      throw new Error('No se recibió el enlace de pago.')
    }

    processingMessage.value = 'Redirigiendo a Wompi de forma segura...'
    await new Promise(resolve => setTimeout(resolve, 600))

    toast.info('Redirigiendo a Wompi...', { description: 'Completa el pago para activar tu plan.' })
    window.location.href = redirectUrl
  } catch (e: any) {
    paymentStep.value = 'details'
    console.error('Error creating Wompi link', e)
    
    let userMsg = 'Intenta nuevamente en unos segundos.'
    if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
      userMsg = 'Error de red detectado. Verifica tu conexión a internet.'
    } else if (e.message?.includes('Error Wompi') || e.message?.includes('502') || e.message?.includes('504')) {
      userMsg = 'La pasarela Wompi no responde temporalmente o no está configurada.'
    } else if (e.message) {
      userMsg = e.message
    }

    toast.error('No se pudo iniciar el checkout', {
      description: userMsg,
    })
  }
}

async function submitPaymentSimulated() {
  if (!validateCheckout()) {
    return
  }

  paymentStep.value = 'processing'
  try {
    processingMessage.value = 'Iniciando simulación de pago...'
    await new Promise(resolve => setTimeout(resolve, 800))
    
    processingMessage.value = 'Conectando de forma segura con Wompi Sandbox...'
    await new Promise(resolve => setTimeout(resolve, 800))
    
    processingMessage.value = 'Procesando cargo de prueba (APPROVED)...'
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    processingMessage.value = 'Suscripción simulada correctamente...'
    await new Promise(resolve => setTimeout(resolve, 600))
    
    paymentStep.value = 'success'
    toast.success('Pago simulado con éxito', {
      description: 'Tu plan ha sido activado simuladamente.'
    })
  } catch (e: any) {
    paymentStep.value = 'details'
    toast.error('Simulación fallida', {
      description: e.message || 'Ocurrió un error inesperado.',
    })
  }
}

function closeWompi() {
  showWompi.value = false
  selectedPlan.value = null
  paymentStep.value = 'details'
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#09090B] font-['Inter'] relative overflow-hidden">
    <!-- Subtle blue radial accent -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 right-0 w-[1100px] h-[700px] rounded-full opacity-70 -z-0"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    />

    <!-- Navegación -->
    <nav
      role="navigation"
      aria-label="Navegación principal"
      class="relative flex justify-between items-center h-20 px-6 lg:px-8 sticky top-0 z-40 transition-all duration-300"
      :class="scrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#F4F4F5] shadow-sm' : 'bg-transparent'"
    >
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

      <div class="hidden lg:flex items-center gap-10">
        <a
          class="text-[13px] font-medium text-[#555555] hover:text-[#18181B] transition-all cursor-pointer"
          href="#producto"
        >Plataforma</a>
        <a
          class="text-[13px] font-medium text-[#555555] hover:text-[#18181B] transition-all cursor-pointer"
          href="#beneficios"
        >Soluciones Enterprise</a>
        <a
          class="text-[13px] font-medium text-[#555555] hover:text-[#18181B] transition-all cursor-pointer"
          href="#precios"
        >Precios</a>
      </div>

      <div class="flex items-center gap-3">
        <a
          href="#precios"
          class="lg:hidden text-[13px] font-semibold text-[#555555] hover:text-[#18181B] px-3.5 py-2 rounded-lg hover:bg-[#F4F4F5] transition-all"
        >
          Ver Precios
        </a>
        <button
          type="button"
          class="text-[13px] font-semibold text-[#18181B] px-4 py-2.5 rounded-lg hover:bg-[#F4F4F5] transition-all"
          @click="emit('login')"
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          class="bg-[#18181B] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#27272A] transition-all shadow-sm"
          @click="emit('request-demo')"
        >
          Solicitar Demo
        </button>
        <button
          type="button"
          class="lg:hidden text-[#18181B] p-2 hover:bg-[#F4F4F5] rounded-lg transition-all flex items-center justify-center"
          @click="mobileNavOpen = true"
          aria-label="Abrir menú de navegación"
        >
          <span class="material-symbols-outlined text-[24px]" aria-hidden="true">menu</span>
        </button>
      </div>
    </nav>

    <main>
      <!-- Hero -->
      <section id="hero" class="relative pt-16 pb-24 lg:pt-28 lg:pb-40 border-b border-[#F4F4F5]">
        <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-20 items-center">
          <div class="z-10">
            <!-- Chip system -->
            <small class="inline-flex items-center gap-1.5 px-2.5 py-1 mb-7 border border-[#E4E4E7] rounded-full text-[11px] text-[#555555] bg-white">
              <span class="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
              ERP de Próxima Generación
            </small>

          <h1
            class="text-[48px] lg:text-[68px] leading-[0.98] tracking-[-0.035em] font-bold text-[#18181B] mb-7"
            style="text-wrap: balance;"
          >
            El cerebro <em class="not-italic text-[#2563EB]">logístico</em> de tu negocio.
          </h1>
          <p class="text-[17px] leading-[1.55] text-[#555555] mb-10 max-w-lg font-medium">
            Una plataforma sofisticada y ultra-rápida diseñada para corporaciones colombianas. Automatiza contabilidad, inventarios y facturación con precisión.
          </p>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              class="bg-[#18181B] text-white text-[14px] font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-black/5 hover:bg-[#27272A] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2.5"
              @click="emit('request-demo')"
              aria-label="Iniciar prueba gratuita - Sin tarjeta de crédito requerida"
            >
              <span class="flex items-center justify-center gap-2.5">
                Iniciar Prueba Gratuita
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </span>
            </button>
            <button
              type="button"
              class="bg-white border border-[#E4E4E7] text-[#18181B] text-[14px] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#FAFAFA] transition-all"
              @click="emit('show-about')"
              aria-label="Ver capacidades del sistema"
            >
              Ver Capacidades
            </button>
          </div>

          <!-- Pricing preview for mobile -->
          <div class="md:hidden mt-6 p-4 bg-[#F4F4F5] rounded-lg text-[12px] flex items-center justify-between border border-[#E4E4E7]">
            <span class="text-[#666666] font-medium">Planes Contex360</span>
            <div>
              <span class="text-[#666666] font-medium">Desde </span>
              <span class="font-bold text-[#18181B]">$89.000 COP/mes</span>
            </div>
          </div>

          <!-- Pillars rail (V2 system) -->
          <div class="mt-14 grid grid-cols-3 gap-6 max-w-[520px]">
            <div tabindex="-1" class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-bold text-[20px] text-[#18181B] tracking-tight">500+</b>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-[#666666]">Clientes Activos</span>
            </div>
            <div tabindex="-1" class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-bold text-[20px] text-[#18181B] tracking-tight">DIAN</b>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-[#666666]">Partner Certificado</span>
            </div>
            <div tabindex="-1" class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-bold text-[20px] text-[#18181B] tracking-tight">99.98%</b>
              <span class="text-[11px] uppercase tracking-wider font-semibold text-[#666666]">Uptime SLA</span>
            </div>
          </div>
        </div>

        <!-- Dashboard preview card -->
        <div class="relative">
          <div class="absolute inset-0 bg-[#F4F4F5] rounded-[24px] translate-x-3 translate-y-3 -z-10 border border-[#E4E4E7]" />
          <div class="bg-white p-3 rounded-[24px] border border-[#E4E4E7] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] relative overflow-hidden group">
            <picture>
              <source 
                srcset="/dashboard_preview-mobile.webp" 
                type="image/webp"
                media="(max-width: 768px)"
              />
              <source 
                srcset="/dashboard_preview.webp" 
                type="image/webp"
                media="(min-width: 769px)"
              />
              <img
                alt="Dashboard de Contex360 mostrando resumen de facturación, inventario y flujo de caja en tiempo real"
                width="1024"
                height="1024"
                loading="lazy"
                decoding="async"
                class="rounded-[18px] w-full object-cover dashboard-image"
                src="/dashboard_preview.png"
              />
            </picture>
          </div>

          <!-- Floating trust chips -->
          <div class="absolute -bottom-4 left-6 flex gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-full text-[11px] text-[#555555] shadow-sm">
              <span class="material-symbols-outlined text-[14px]">lock</span>
              SSL/TLS 1.3
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-full text-[11px] text-[#555555] shadow-sm">
              <span class="material-symbols-outlined text-[14px]">shield</span>
              ISO 27001
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section
      id="producto"
      class="py-28 lg:py-32 bg-[#FAFAFA] border-b border-[#F4F4F5]"
    >
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div class="max-w-2xl">
            <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
              Infraestructura Central
            </h2>
            <h3
              class="text-[36px] lg:text-[42px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B]"
              style="text-wrap: balance;"
            >
              Estructurado para escala corporativa.
            </h3>
          </div>
          <p class="text-[15px] leading-[1.55] text-[#555555] max-w-sm font-medium">
            Una única fuente de verdad para cada operación, desde inventarios multi-bodega hasta informes financieros en tiempo real.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-9 rounded-[18px] border border-[#E4E4E7] hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group">
            <div class="w-11 h-11 bg-[#F4F4F5] rounded-[10px] flex items-center justify-center text-[#18181B] mb-7 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span
                class="material-symbols-outlined"
                translate="no"
              >verified_user</span>
            </div>
            <h4 class="text-[18px] font-bold text-[#18181B] mb-3 tracking-tight">
              Seguridad de Grado Bancario
            </h4>
            <p class="text-[14px] leading-[1.55] text-[#555555] font-medium">
              Encriptación de nivel empresarial y copias de seguridad automáticas que aseguran que tus datos financieros estén siempre protegidos y disponibles.
            </p>
          </div>

          <div class="bg-white p-9 rounded-[18px] border border-[#E4E4E7] hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group">
            <div class="w-11 h-11 bg-[#F4F4F5] rounded-[10px] flex items-center justify-center text-[#18181B] mb-7 group-hover:bg-[#2563EB] group-hover:text-white transition-all">
              <span
                class="material-symbols-outlined"
                translate="no"
              >bolt</span>
            </div>
            <h4 class="text-[18px] font-bold text-[#18181B] mb-3 tracking-tight">
              Motor de Alta Velocidad
            </h4>
            <p class="text-[14px] leading-[1.55] text-[#555555] font-medium">
              Procesamiento de datos en tiempo real para informes contables complejos y estados financieros en segundos, no horas.
            </p>
          </div>

          <div class="bg-white p-9 rounded-[18px] border border-[#E4E4E7] hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group">
            <div class="w-11 h-11 bg-[#F4F4F5] rounded-[10px] flex items-center justify-center text-[#18181B] mb-7 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span
                class="material-symbols-outlined"
                translate="no"
              >apartment</span>
            </div>
            <h4 class="text-[18px] font-bold text-[#18181B] mb-3 tracking-tight">
              Cumplimiento Colombiano
            </h4>
            <p class="text-[14px] leading-[1.55] text-[#555555] font-medium">
              Totalmente adaptado a las regulaciones de la DIAN: facturación electrónica, nómina e informes de exógena integrados.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section
      id="precios"
      class="py-24 lg:py-28 bg-[#FAFAFA] border-b border-[#F4F4F5]"
    >
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
            Tarifas Transparentes
          </h2>
          <h3 class="text-[36px] lg:text-[42px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-5">
            Elige el plan ideal para tu negocio
          </h3>
          <p class="text-[15px] leading-[1.55] text-[#555555] max-w-lg mx-auto font-medium">
            Sin contratos a largo plazo, sin cargos ocultos. Cambia de plan o cancela cuando quieras.
          </p>

          <!-- Toggle mensual/anual -->
          <div class="flex items-center justify-center gap-3.5 mt-8">
            <span :class="['text-[13.5px] font-semibold transition-colors', !isAnnual ? 'text-[#18181B]' : 'text-[#555555]']">Mensual</span>
            <button 
              type="button"
              class="w-12 h-6.5 rounded-full bg-[#E4E4E7] p-0.5 relative transition-colors duration-200"
              :class="{ 'bg-[#18181B]': isAnnual }"
              @click="() => {
                if (showWompi) {
                  if (confirm('¿Cambiar modalidad de facturación y reiniciar el proceso de pago?')) {
                    closeWompi()
                    isAnnual = !isAnnual
                  }
                } else {
                  isAnnual = !isAnnual
                }
              }"
              aria-label="Alternar facturación mensual o anual"
            >
              <span 
                class="block w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform duration-200"
                :class="{ 'translate-x-5.5': isAnnual }"
              />
            </button>
            <span :class="['text-[13.5px] font-semibold transition-colors flex items-center gap-1.5', isAnnual ? 'text-[#18181B]' : 'text-[#555555]']">
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
                <h4 class="text-[22px] font-black text-[#18181B] tracking-tight mb-2">
                  {{ plan.name }}
                </h4>
                <p class="text-[13px] text-[#555555] leading-[1.5]">
                  {{ plan.desc }}
                </p>
              </div>

              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-baseline gap-1">
                  <span class="text-[38px] font-black text-[#18181B] tracking-tight">
                    {{ formatCurrency(isAnnual ? plan.priceAnnual : plan.priceMonthly) }}
                  </span>
                  <span class="text-[13px] text-[#555555] font-semibold">
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

              <!-- Features checklist -->
              <div class="space-y-3 mb-8">
                <div 
                  v-for="feat in plan.features" 
                  :key="feat" 
                  class="flex items-start gap-2.5 text-[13px] font-semibold text-[#3F3F46]"
                >
                  <span class="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5" aria-hidden="true">check_circle</span>
                  <span>{{ feat }}</span>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="space-y-2.5 mt-auto">
              <button 
                type="button"
                :class="[
                  'w-full py-3 rounded-xl text-[13px] font-semibold transition-colors text-center shadow-sm flex items-center justify-center gap-2',
                  plan.popular 
                    ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]' 
                    : 'bg-[#18181B] text-white hover:bg-[#27272A]'
                ]"
                @click="openCheckout(plan)"
                :aria-label="'Comprar plan ' + plan.name + ' ahora'"
              >
                <span class="material-symbols-outlined text-[16px]" aria-hidden="true">credit_card</span>
                Comprar ahora
              </button>
              <button 
                type="button"
                class="w-full py-3 border border-[#E4E4E7] text-[#18181B] bg-white rounded-xl text-[13px] font-semibold hover:bg-[#FAFAFA] transition-colors"
                @click="emit('request-demo')"
                :aria-label="'Comenzar prueba gratis del plan ' + plan.name"
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
              type="button"
              class="w-7 h-7 rounded-full hover:bg-black/5 text-[#3D405B] flex items-center justify-center transition-colors" 
              @click="closeWompi"
              aria-label="Cerrar pasarela de pago"
            >
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
            </button>
          </div>

          <!-- Checkout body -->
          <div class="p-6 flex-1 overflow-y-auto max-h-[80vh]">
            <!-- Order summary -->
            <div class="bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl p-4 mb-6">
              <span class="text-[10px] font-bold text-[#666666] uppercase tracking-wider block mb-1">Resumen del pedido</span>
              <div class="flex justify-between items-baseline">
                <span class="text-[15px] font-black text-[#18181B]">{{ selectedPlan?.name }}</span>
                <span class="text-[15px] font-black text-[#2563EB]">
                  {{ formatCurrency(isAnnual ? selectedPlan?.priceAnnual : selectedPlan?.priceMonthly) }}
                </span>
              </div>
              <p class="text-[11px] text-[#555555] mt-1">
                Suscripción {{ isAnnual ? 'anual (con 25% desc.)' : 'mensual' }}
              </p>
            </div>

            <!-- Payment process step 1: details -->
            <form
              v-if="paymentStep === 'details'"
              class="space-y-4"
              @submit.prevent="submitPaymentReal"
            >
              <button 
                type="submit"
                class="w-full py-4 bg-[#FE5F55] text-white text-[13px] font-extrabold rounded-xl hover:bg-[#eb574e] transition-colors shadow-md mt-2 flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">lock</span>
                Pagar con Wompi
              </button>
              
              <button 
                type="button"
                class="w-full py-3.5 border border-[#E4E4E7] text-[#18181B] bg-white rounded-xl text-[13px] font-bold hover:bg-[#FAFAFA] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                @click="submitPaymentSimulated"
              >
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">science</span>
                Simular Pago Exitoso (Demo/Prueba)
              </button>
            </form>

            <!-- Processing step -->
            <div
              v-else-if="paymentStep === 'processing'"
              class="py-12 flex flex-col items-center justify-center text-center"
            >
              <span class="animate-spin w-10 h-10 border-4 border-[#FE5F55] border-t-transparent rounded-full mb-4" />
              <h4 class="text-[15px] font-black text-[#18181B]">
                Procesando transacción
              </h4>
              <p class="text-[12px] text-[#555555] max-w-[280px] mt-1.5 font-medium">
                {{ processingMessage || 'Por favor no cierres la ventana. Estamos validando la transacción con la red bancaria.' }}
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
              <p class="text-[13px] text-[#555555] max-w-[320px] mt-2 leading-relaxed">
                Tu transacción ha sido aprobada. Recibirás el comprobante de compra y los accesos por correo electrónico.
              </p>
              
              <button 
                type="button"
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

    <!-- Drawer navigation para móvil -->
    <Teleport to="body">
      <div 
        v-if="mobileNavOpen" 
        class="fixed inset-0 z-50 bg-[#09090B]/50 backdrop-blur-sm lg:hidden"
        @click="mobileNavOpen = false"
      >
        <!-- Drawer content -->
        <div 
          class="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-200"
          @click.stop
        >
          <div class="flex justify-between items-center pb-4 border-b border-[#F4F4F5]">
            <span class="text-[16px] font-bold text-[#18181B]">Menú</span>
            <button 
              type="button"
              class="p-1 hover:bg-[#F4F4F5] rounded-lg text-[#18181B] flex items-center justify-center"
              @click="mobileNavOpen = false"
              aria-label="Cerrar menú de navegación"
            >
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
            </button>
          </div>
          <nav role="navigation" aria-label="Navegación móvil" class="flex flex-col gap-4">
            <a 
              href="#producto" 
              class="text-[14px] font-semibold text-[#555555] hover:text-[#18181B] py-2 transition-all cursor-pointer"
              @click="mobileNavOpen = false"
            >
              Plataforma
            </a>
            <a 
              href="#beneficios" 
              class="text-[14px] font-semibold text-[#555555] hover:text-[#18181B] py-2 transition-all cursor-pointer"
              @click="mobileNavOpen = false"
            >
              Soluciones Enterprise
            </a>
            <a 
              href="#precios" 
              class="text-[14px] font-semibold text-[#555555] hover:text-[#18181B] py-2 transition-all cursor-pointer"
              @click="mobileNavOpen = false"
            >
              Precios
            </a>
          </nav>
        </div>
      </div>
    </Teleport>

    <!-- CTA strip -->
    <section class="py-20 lg:py-24 bg-white">
      <div class="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <h3
          class="text-[32px] lg:text-[44px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-5"
          style="text-wrap: balance;"
        >
          ¿Listo para llevar su back-office <em class="not-italic text-[#2563EB]">al siguiente nivel</em>?
        </h3>
        <p class="text-[16px] text-[#555555] mb-9 max-w-xl mx-auto font-medium">
          Agende una demostración de 30 minutos con nuestro equipo. Sin compromiso, sin tarjeta de crédito.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            class="bg-[#18181B] text-white text-[14px] font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-black/5 hover:bg-[#27272A] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2.5"
            @click="emit('request-demo')"
            aria-label="Solicitar demostración de Contex360"
          >
            Solicitar Demo
            <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
          </button>
          <button
            type="button"
            class="bg-white border border-[#E4E4E7] text-[#18181B] text-[14px] font-semibold px-8 py-3.5 rounded-xl hover:bg-[#FAFAFA] transition-all"
            @click="emit('login')"
            aria-label="Iniciar sesión en la plataforma"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </section>
    </main>

    <!-- Footer -->
    <footer class="py-14 border-t border-[#F4F4F5] bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2.5">
            <svg
              class="c360-mark flex-shrink-0"
              width="24"
              height="24"
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
            <span class="text-[16px] font-bold text-[#18181B]">Contex360</span>
          </div>
          <p class="text-[12px] text-[#666666] font-medium max-w-[220px] leading-relaxed">
            Sistemas Administrativos Avanzados para la Empresa Colombiana.
          </p>
        </div>
        <div class="flex gap-12">
          <div class="flex flex-col gap-3">
            <span class="text-[11px] font-bold text-[#18181B] uppercase tracking-widest">Plataforma</span>
            <a
              class="text-[12px] text-[#555555] hover:text-[#18181B] cursor-pointer font-medium"
              @click="emit('show-about')"
            >Características</a>
            <a
              class="text-[12px] text-[#555555] hover:text-[#18181B] cursor-pointer font-medium"
              @click="emit('request-demo')"
            >Demo</a>
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-[11px] font-bold text-[#18181B] uppercase tracking-widest">Legal</span>
            <a
              class="text-[12px] text-[#555555] hover:text-[#18181B] cursor-pointer font-medium"
              @click="emit('show-terms')"
            >Términos</a>
            <a
              class="text-[12px] text-[#555555] hover:text-[#18181B] cursor-pointer font-medium"
              @click="emit('show-privacy')"
            >Privacidad</a>
            <a
              class="text-[12px] text-[#555555] hover:text-[#18181B] cursor-pointer font-medium"
              @click="emit('show-dpa')"
            >DPA</a>
            <a
              class="text-[12px] text-[#555555] hover:text-[#18181B] cursor-pointer font-medium"
              @click="emit('show-bcp')"
            >Continuidad</a>
          </div>
        </div>
        <p class="text-[12px] text-[#666666] font-medium">
          © 2026 Contex360. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
button:focus-visible,
a:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}
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
.dashboard-image {
  filter: grayscale(15%);
  transition: filter 0.7s ease;
}
.dashboard-image:hover {
  filter: grayscale(0%);
}
@media (prefers-reduced-motion: reduce) {
  .dashboard-image {
    transition: none;
  }
}
</style>
