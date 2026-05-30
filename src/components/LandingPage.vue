<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { useStateStore } from '../stores/stateStore'
import { businessApi } from '../services/businessApi'
import { toast } from 'vue-sonner'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Contex360 - ERP para Colombia | Facturación, Inventario, Contabilidad',
  meta: [
    { 
      name: 'description', 
      content: 'Plataforma ERP inteligente para empresas colombianas. Facturación electrónica DIAN, inventario multi-bodega, contabilidad automática. Prueba gratis.'
    },
    { 
      property: 'og:title', 
      content: 'Contex360 - ERP Inteligente para tu Negocio' 
    },
    { 
      property: 'og:description', 
      content: 'Automatiza contabilidad, inventarios y facturación con inteligencia artificial. Para startups, PyMEs y empresas.' 
    },
    { 
      name: 'keywords',
      content: 'ERP Colombia, facturación electrónica DIAN, inventario, contabilidad digital'
    },
    {
      name: 'robots',
      content: 'index, follow'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: typeof window !== 'undefined' ? window.location.origin : 'https://contex360.com'
    }
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
  (e: 'cta-clicked', payload: { source: string; plan?: string }): void
}>()

const scrolled = ref(false)
const pastHero = ref(false)

const showTestimonials = ref(false)
const showPricing = ref(false)
const showFaq = ref(false)
const showFooter = ref(false)

const testimonialsRef = ref<HTMLElement | null>(null)
const pricingRef = ref<HTMLElement | null>(null)
const faqRef = ref<HTMLElement | null>(null)
const footerRef = ref<HTMLElement | null>(null)

const isBot = typeof navigator !== 'undefined' && /bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|lighthouse/i.test(navigator.userAgent)

if (isBot) {
  showTestimonials.value = true
  showPricing.value = true
  showFaq.value = true
  showFooter.value = true
}

const checkHash = () => {
  const hash = window.location.hash
  if (hash === '#testimonios' || hash === '#beneficios') {
    showTestimonials.value = true
  } else if (hash === '#precios') {
    showTestimonials.value = true
    showPricing.value = true
  } else if (hash === '#faq') {
    showTestimonials.value = true
    showPricing.value = true
    showFaq.value = true
  }
}

const handleScroll = useThrottleFn(() => {
  scrolled.value = window.scrollY > 20
  pastHero.value = window.scrollY > 480
}, 100)

let ioObserver: IntersectionObserver | null = null

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('hashchange', checkHash)
  checkHash()
  
  if (!isBot && typeof IntersectionObserver !== 'undefined') {
    ioObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          const section = target.dataset.section
          if (section === 'testimonials') {
            showTestimonials.value = true
          } else if (section === 'pricing') {
            showPricing.value = true
          } else if (section === 'faq') {
            showFaq.value = true
          } else if (section === 'footer') {
            showFooter.value = true
          }
          ioObserver?.unobserve(target)
        }
      })
    }, {
      rootMargin: '600px 0px',
      threshold: 0.01
    })
    
    if (testimonialsRef.value) ioObserver.observe(testimonialsRef.value)
    if (pricingRef.value) ioObserver.observe(pricingRef.value)
    if (faqRef.value) ioObserver.observe(faqRef.value)
    if (footerRef.value) ioObserver.observe(footerRef.value)
  } else {
    showTestimonials.value = true
    showPricing.value = true
    showFaq.value = true
    showFooter.value = true
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('hashchange', checkHash)
  if (ioObserver) {
    ioObserver.disconnect()
  }
})

// Pricing section state
const isAnnual = ref(false)
const selectedPlan = ref<any>(null)
const showWompi = ref(false)
const paymentStep = ref('details')
const processingMessage = ref('')
const mobileNavOpen = ref(false)
const isDev = import.meta.env.DEV

// FAQ state
const openFaq = ref<number | null>(null)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

const faqs = [
  {
    q: '¿Necesito conocimientos contables para usar Contex360?',
    a: 'No. Contex360 está diseñado para que cualquier persona del equipo pueda operarlo. El sistema genera asientos contables automáticamente al registrar ventas, compras y pagos. Tu contador puede supervisar y exportar informes listos para la DIAN sin necesidad de doble entrada de datos.'
  },
  {
    q: '¿Cómo funciona la integración con la facturación electrónica DIAN?',
    a: 'Somos habilitadores tecnológicos certificados ante la DIAN. Desde el primer día puedes emitir facturas electrónicas válidas (CUFE incluido), notas crédito y documentos soporte. Todo firmado digitalmente con tu certificado. El proceso tarda menos de 3 segundos por documento.'
  },
  {
    q: '¿Puedo migrar mis datos desde Excel u otro ERP?',
    a: 'Sí. Ofrecemos importación masiva desde Excel para terceros, productos e inventario inicial. Para migraciones desde otros ERPs (Siigo, World Office, Helisa), nuestro equipo de onboarding te acompaña sin costo adicional en los planes Pyme y Enterprise.'
  },
  {
    q: '¿Cuánto tiempo toma poner en marcha la plataforma?',
    a: 'La mayoría de empresas están operativas en menos de 48 horas. El proceso incluye: configuración de tu empresa, carga de catálogo de productos, terceros y apertura de inventario. El plan Enterprise incluye sesiones de capacitación en vivo para tu equipo.'
  },
  {
    q: '¿Qué pasa si necesito más usuarios o supero los límites de mi plan?',
    a: 'Puedes actualizar tu plan en cualquier momento desde el panel de administración, incluso a mitad del período. El cobro se prorratea automáticamente. No hay penalizaciones ni contratos a largo plazo.'
  },
  {
    q: '¿Dónde están almacenados mis datos?',
    a: 'En servidores en Colombia y Estados Unidos (Neon PostgreSQL), con cifrado AES-256 en reposo y TLS 1.3 en tránsito. Realizamos copias de seguridad automáticas cada hora. Cumplimos con la Ley 1581 de Habeas Data y el Reglamento General de Protección de Datos (GDPR) para clientes internacionales.'
  },
]

const testimonials = [
  {
    quote: 'Antes tardábamos 3 días en cuadrar la contabilidad del mes. Con Contex360 lo tenemos en tiempo real. El módulo DIAN es increíblemente rápido — facturamos 200 documentos diarios sin un solo rechazo.',
    name: 'Laura Martínez',
    role: 'Gerente Financiera',
    company: 'Inversiones Caldas SAS',
    initials: 'LM',
    color: '#2563EB',
  },
  {
    quote: 'Migramos desde Siigo en 2 días. El equipo de soporte fue excepcional. El inventario multi-bodega cambió completamente cómo gestionamos nuestras 4 sedes. Ya no perdemos mercancía.',
    name: 'Carlos Rodríguez',
    role: 'CEO & Fundador',
    company: 'DistribuiTech Ltda.',
    initials: 'CR',
    color: '#16a34a',
  },
  {
    quote: 'ContexAI nos ahorra literalmente 8 horas a la semana. Me genera el borrador de los estados financieros y solo reviso. Para una pyme nuestra, eso es un contador virtual adicional.',
    name: 'Daniela Torres',
    role: 'Contadora Pública',
    company: 'Comercializadora Andina',
    initials: 'DT',
    color: '#7C3AED',
  },
]

const clientLogos = [
  { name: 'Inversiones Caldas', abbr: 'IC' },
  { name: 'DistribuiTech', abbr: 'DT' },
  { name: 'Constructora Bolívar', abbr: 'CB' },
  { name: 'Mercados Andinos', abbr: 'MA' },
  { name: 'Grupo Bétera', abbr: 'GB' },
  { name: 'Valores Seguros', abbr: 'VS' },
  { name: 'TechPyme SAS', abbr: 'TP' },
  { name: 'Almacenes Norte', abbr: 'AN' },
]


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

function trackCTAClick(source: string, plan?: string) {
  emit('cta-clicked', { source, plan })
}

const showBillingConfirm = ref(false)

function toggleBilling() {
  if (showWompi.value) {
    showBillingConfirm.value = true
  } else {
    isAnnual.value = !isAnnual.value
  }
}

function confirmBillingChange() {
  closeWompi()
  isAnnual.value = !isAnnual.value
  showBillingConfirm.value = false
}
</script>

<template>
  <div class="landing-root min-h-screen bg-white text-[#09090B] font-['Inter'] relative overflow-hidden">
    <!-- Hero background: grid + radial -->
    <div
      aria-hidden="true"
      class="landing-hero-bg pointer-events-none absolute inset-0 -z-10"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-60 right-[-10%] w-[900px] h-[900px] rounded-full -z-10"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.07), transparent 70%);"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute top-[30%] left-[-5%] w-[600px] h-[600px] rounded-full -z-10"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.04), transparent 70%);"
    />

    <!-- Navegación -->
    <nav
      role="navigation"
      aria-label="Navegación principal"
      class="relative flex justify-between items-center h-20 px-6 lg:px-8 sticky top-0 z-40 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300"
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
          class="text-[13px] font-medium text-[#555555] hover:text-[#18181B] transition-colors cursor-pointer"
          href="#producto"
        >Plataforma</a>
        <a
          class="text-[13px] font-medium text-[#555555] hover:text-[#18181B] transition-colors cursor-pointer"
          href="#beneficios"
        >Soluciones Enterprise</a>
        <a
          class="text-[13px] font-medium text-[#555555] hover:text-[#18181B] transition-colors cursor-pointer"
          href="#precios"
        >Precios</a>
      </div>

      <div class="flex items-center gap-2">
        <!-- Desktop nav actions -->
        <button
          type="button"
          class="hidden lg:inline-flex text-[13px] font-semibold text-[#555555] px-4 py-2.5 rounded-lg hover:bg-[#F4F4F5] hover:text-[#18181B] btn-transition"
          @click="emit('login')"
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          class="hidden lg:inline-flex bg-[#18181B] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#27272A] btn-transition shadow-sm active:scale-[0.97]"
          @click="() => { trackCTAClick('nav'); emit('request-demo') }"
        >
          Solicitar Demo
        </button>

        <!-- Mobile nav actions -->
        <button
          type="button"
          class="lg:hidden bg-[#18181B] text-white text-[12.5px] font-semibold px-4 py-2.5 rounded-lg btn-transition active:scale-[0.97] min-h-[44px]"
          @click="() => { trackCTAClick('nav'); emit('request-demo') }"
        >
          Demo gratis
        </button>
        <button
          type="button"
          class="flex lg:hidden items-center justify-center nav-hamburger"
          aria-label="Abrir menú de navegación"
          @click="mobileNavOpen = true"
        >
          <span
            class="material-symbols-outlined text-[22px]"
            aria-hidden="true"
          >menu</span>
        </button>
      </div>
    </nav>

    <main>
      <!-- Hero -->
      <section
        id="hero"
        aria-labelledby="hero-heading"
        class="relative pt-10 pb-14 lg:pt-28 lg:pb-40 border-b border-[#F4F4F5]"
      >
        <div class="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-20 items-center">
          <div class="z-10">
            <!-- Chip system -->
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 mb-5 lg:mb-8 border border-[#E4E4E7] rounded-full text-[11px] lg:text-[11.5px] text-[#555555] bg-white/80 backdrop-blur-sm font-medium shadow-[0_1px_4px_rgba(0,0,0,0.04)] select-none">
              <span
                class="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse flex-shrink-0"
                aria-hidden="true"
              />
              ERP de Próxima Generación
            </span>

            <h1
              id="hero-heading"
              class="text-[38px] sm:text-[48px] lg:text-[68px] leading-[1.0] lg:leading-[0.98] tracking-[-0.03em] lg:tracking-[-0.035em] font-bold text-[#18181B] mb-5 lg:mb-7"
              style="text-wrap: balance;"
            >
              El cerebro <em class="not-italic text-[#2563EB]">logístico</em> de tu negocio.
            </h1>
            <p class="text-[15px] lg:text-[17px] leading-[1.6] lg:leading-[1.55] text-[#555555] mb-7 lg:mb-10 max-w-lg">
              Una plataforma sofisticada y ultra-rápida diseñada para corporaciones colombianas. Automatiza contabilidad, inventarios y facturación con precisión.
            </p>

            <div class="flex flex-col sm:flex-row gap-2.5 lg:gap-3">
              <button
                type="button"
                class="btn-primary-landing"
                aria-label="Iniciar prueba gratuita - Sin tarjeta de crédito requerida"
                @click="() => { trackCTAClick('hero'); emit('request-demo') }"
              >
                Iniciar Prueba Gratuita
                <span
                  class="material-symbols-outlined text-[18px]"
                  aria-hidden="true"
                >arrow_forward</span>
              </button>
              <button
                type="button"
                class="btn-secondary-landing hidden sm:inline-flex"
                aria-label="Ver capacidades del sistema"
                @click="emit('show-about')"
              >
                Ver Capacidades
              </button>
            </div>

            <!-- Mobile micro-copy under CTA -->
            <p class="text-[11.5px] text-[#71717A] mt-3 lg:hidden">
              Sin tarjeta de crédito · Cancela cuando quieras
            </p>

            <!-- Pillars rail -->
            <div class="mt-8 lg:mt-14 grid grid-cols-3 gap-0 max-w-full lg:max-w-[520px]">
              <div class="border-t-2 border-[#E4E4E7] pt-3 lg:pt-4 pr-4 lg:pr-6">
                <b class="block font-black text-[18px] lg:text-[22px] text-[#18181B] tracking-tight tabular-nums">500+</b>
                <span class="text-[9.5px] lg:text-[10.5px] uppercase tracking-[0.1em] font-bold text-[#888888] mt-0.5 block leading-tight">Clientes Activos</span>
              </div>
              <div class="border-t-2 border-[#2563EB] pt-3 lg:pt-4 pr-4 lg:pr-6">
                <b class="block font-black text-[18px] lg:text-[22px] text-[#18181B] tracking-tight">DIAN</b>
                <span class="text-[9.5px] lg:text-[10.5px] uppercase tracking-[0.1em] font-bold text-[#888888] mt-0.5 block leading-tight">Partner Certificado</span>
              </div>
              <div class="border-t-2 border-[#E4E4E7] pt-3 lg:pt-4">
                <b class="block font-black text-[18px] lg:text-[22px] text-[#18181B] tracking-tight tabular-nums">99.98%</b>
                <span class="text-[9.5px] lg:text-[10.5px] uppercase tracking-[0.1em] font-bold text-[#888888] mt-0.5 block leading-tight">Uptime SLA</span>
              </div>
            </div>
          </div>

          <!-- Dashboard preview card -->
          <div class="relative mt-6 lg:mt-0 mb-6 lg:mb-0">
            <div class="absolute inset-0 bg-[#F4F4F5] rounded-[20px] lg:rounded-[24px] translate-x-2 translate-y-2 lg:translate-x-3 lg:translate-y-3 -z-10 border border-[#E4E4E7]" />
            <div class="bg-white p-2 lg:p-3 rounded-[20px] lg:rounded-[24px] border border-[#E4E4E7] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] relative overflow-hidden group">
              <!-- WebP is supported by 97%+ of browsers in 2026. The PNG fallback
                 (532KB) has been removed to avoid penalising the majority of users.
                 The <img> src still uses the WebP directly as a safe fallback
                 for any remaining browser that ignores <source>. -->
              <picture>
                <source
                  srcset="/dashboard_preview-mobile.webp"
                  type="image/webp"
                  media="(max-width: 768px)"
                  width="768"
                  height="768"
                >
                <source
                  srcset="/dashboard_preview.webp"
                  type="image/webp"
                  media="(min-width: 769px)"
                  width="1024"
                  height="1024"
                >
                <img
                  alt="Dashboard de Contex360 mostrando resumen de facturación, inventario y flujo de caja en tiempo real"
                  width="1024"
                  height="1024"
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                  class="rounded-[18px] w-full object-cover dashboard-image"
                  src="/dashboard_preview.webp"
                >
              </picture>
            </div>

            <!-- Floating trust chips — desktop only to avoid overflow on mobile -->
            <div class="hidden lg:flex absolute -bottom-4 left-6 gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-full text-[11px] text-[#555555] shadow-sm">
                <span
                  class="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >lock</span>
                SSL/TLS 1.3
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#E4E4E7] rounded-full text-[11px] text-[#555555] shadow-sm">
                <span
                  class="material-symbols-outlined text-[14px]"
                  aria-hidden="true"
                >shield</span>
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Social proof bar -->
      <section
        class="py-8 lg:py-12 border-b border-[#F4F4F5] bg-white"
        aria-label="Clientes que confían en Contex360"
      >
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <p class="text-center text-[10.5px] uppercase tracking-[0.2em] font-bold text-[#71717A] mb-8">
            Más de 500 empresas colombianas ya operan con Contex360
          </p>
          <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 lg:gap-x-12">
            <div
              v-for="logo in clientLogos"
              :key="logo.abbr"
              class="client-logo-item group"
              :title="logo.name"
            >
              <span class="client-logo-abbr">{{ logo.abbr }}</span>
              <span class="client-logo-name">{{ logo.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section
        id="producto"
        class="py-16 lg:py-32 bg-[#FAFAFA] border-b border-[#F4F4F5]"
        style="scroll-margin-top: 80px;"
      >
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row lg:items-end justify-between mb-10 lg:mb-16 gap-5 lg:gap-8">
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="feature-card group">
              <div class="feature-icon-wrap feature-icon-dark group-hover:scale-[1.06]">
                <span
                  class="material-symbols-outlined text-[20px]"
                  translate="no"
                >verified_user</span>
              </div>
              <h4 class="text-[17px] font-bold text-[#18181B] mb-2.5 tracking-tight">
                Seguridad de Grado Bancario
              </h4>
              <p class="text-[13.5px] leading-[1.6] text-[#666666]">
                Encriptación de nivel empresarial y copias de seguridad automáticas que aseguran que tus datos financieros estén siempre protegidos y disponibles.
              </p>
            </div>

            <div class="feature-card group">
              <div class="feature-icon-wrap feature-icon-blue group-hover:scale-[1.06]">
                <span
                  class="material-symbols-outlined text-[20px]"
                  translate="no"
                >bolt</span>
              </div>
              <h4 class="text-[17px] font-bold text-[#18181B] mb-2.5 tracking-tight">
                Motor de Alta Velocidad
              </h4>
              <p class="text-[13.5px] leading-[1.6] text-[#666666]">
                Procesamiento de datos en tiempo real para informes contables complejos y estados financieros en segundos, no horas.
              </p>
            </div>

            <div class="feature-card group">
              <div class="feature-icon-wrap feature-icon-dark group-hover:scale-[1.06]">
                <span
                  class="material-symbols-outlined text-[20px]"
                  translate="no"
                >apartment</span>
              </div>
              <h4 class="text-[17px] font-bold text-[#18181B] mb-2.5 tracking-tight">
                Cumplimiento Colombiano
              </h4>
              <p class="text-[13.5px] leading-[1.6] text-[#666666]">
                Totalmente adaptado a las regulaciones de la DIAN: facturación electrónica, nómina e informes de exógena integrados.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <div ref="testimonialsRef" data-section="testimonials" id="testimonios">
        <template v-if="showTestimonials">
          <section
            class="py-16 lg:py-28 bg-white border-b border-[#F4F4F5]"
            aria-labelledby="testimonials-heading"
          >
            <div class="max-w-7xl mx-auto">
              <div class="text-center mb-10 lg:mb-14 px-5 lg:px-8">
                <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
                  Casos de Éxito
                </h2>
                <h3
                  id="testimonials-heading"
                  class="text-[32px] lg:text-[38px] leading-[1.08] tracking-[-0.025em] font-bold text-[#18181B]"
                  style="text-wrap: balance;"
                >
                  Lo que dicen nuestros clientes
                </h3>
              </div>

              <!-- Horizontal scroll on mobile, grid on desktop -->
              <div class="testimonials-scroll px-5 lg:px-8">
                <figure
                  v-for="t in testimonials"
                  :key="t.name"
                  class="testimonial-card"
                >
                  <!-- Stars -->
                  <div
                    class="flex gap-0.5 mb-5"
                    role="img"
                    aria-label="5 de 5 estrellas"
                  >
                    <span
                      v-for="n in 5"
                      :key="n"
                      class="text-[#F59E0B] text-[15px]"
                      aria-hidden="true"
                    >★</span>
                  </div>

                  <blockquote class="text-[14px] leading-[1.7] text-[#444444] mb-6 flex-1">
                    "{{ t.quote }}"
                  </blockquote>

                  <figcaption class="flex items-center gap-3 pt-5 border-t border-[#F4F4F5]">
                    <div
                      class="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black flex-shrink-0"
                      :style="{ background: t.color }"
                      aria-hidden="true"
                    >
                      {{ t.initials }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-[13px] font-bold text-[#18181B] leading-tight">
                        {{ t.name }}
                      </p>
                      <p class="text-[11.5px] text-[#888888] leading-tight mt-0.5 truncate">
                        {{ t.role }} · {{ t.company }}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </div>

              <!-- Aggregate rating -->
              <div
                class="flex items-center justify-center gap-2.5 mt-10 lg:mt-12 px-5 lg:px-8"
                role="img"
                aria-label="Valoración promedio de clientes"
              >
                <div class="flex gap-0.5">
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="text-[#F59E0B] text-[14px]"
                    aria-hidden="true"
                  >★</span>
                </div>
                <span class="text-[13px] font-bold text-[#18181B]">4.9/5</span>
                <span class="text-[12px] text-[#888888]">basado en 200+ reseñas verificadas</span>
              </div>
            </div>
          </section>
        </template>
        <div v-else class="h-[600px] bg-white border-b border-[#F4F4F5]" />
      </div>

      <!-- Anchor for "Soluciones Enterprise" nav link -->
      <div
        id="beneficios"
        aria-hidden="true"
      />

      <!-- Pricing Section -->
      <div ref="pricingRef" data-section="pricing" id="precios" style="scroll-margin-top: 80px;">
        <template v-if="showPricing">
          <section
            aria-labelledby="precios-heading"
            class="py-16 lg:py-28 bg-[#FAFAFA] border-b border-[#F4F4F5]"
          >
            <div class="max-w-7xl mx-auto px-6 lg:px-8">
              <div class="text-center max-w-3xl mx-auto mb-16">
                <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
                  Tarifas Transparentes
                </h2>
                <h3
                  id="precios-heading"
                  class="text-[36px] lg:text-[42px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-5"
                >
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
                    role="switch"
                    :aria-checked="isAnnual"
                    class="w-12 h-6.5 rounded-full bg-[#E4E4E7] p-0.5 relative transition-colors duration-200"
                    :class="{ 'bg-[#18181B]': isAnnual }"
                    aria-label="Facturación anual"
                    @click="toggleBilling"
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
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto items-start">
                <div
                  v-for="(plan, idx) in plans"
                  :key="plan.id"
                  :class="[
                    'pricing-card flex flex-col justify-between relative',
                    plan.popular ? 'pricing-card--popular' : 'pricing-card--default'
                  ]"
                >
                  <!-- Badge popular -->
                  <span
                    v-if="plan.popular"
                    class="absolute -top-3.5 left-6 bg-white text-[#18181B] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-[#E4E4E7]"
                  >
                    ⚡ Más popular
                  </span>

                  <div>
                    <!-- Plan Header -->
                    <div class="mb-6">
                      <div class="flex items-center justify-between mb-2">
                        <h4 :class="['text-[20px] font-black tracking-tight', plan.popular ? 'text-white' : 'text-[#18181B]']">
                          {{ plan.name }}
                        </h4>
                        <!-- Plan tier badge -->
                        <span
                          v-if="plan.id === 'enterprise'"
                          class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#555555]"
                        >SLA 99.99%</span>
                        <span
                          v-else-if="plan.id === 'pyme'"
                          class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#2563EB]"
                        >IA incluida</span>
                      </div>
                      <p :class="['text-[12.5px] leading-[1.55]', plan.popular ? 'text-white/80' : 'text-[#555555]']">
                        {{ plan.desc }}
                      </p>
                    </div>

                    <!-- Price -->
                    <div
                      class="mb-6 pb-6"
                      :class="plan.popular ? 'border-b border-white/10' : 'border-b border-[#F4F4F5]'"
                    >
                      <div class="flex items-baseline gap-1.5">
                        <span :class="['text-[34px] font-black tracking-tight tabular-nums', plan.popular ? 'text-white' : 'text-[#18181B]']">
                          {{ formatCurrency(isAnnual ? plan.priceAnnual : plan.priceMonthly) }}
                        </span>
                        <span :class="['text-[12px] font-semibold', plan.popular ? 'text-white/70' : 'text-[#71717A]']">
                          / {{ isAnnual ? 'año' : 'mes' }}
                        </span>
                      </div>
                      <p
                        v-if="isAnnual"
                        :class="['text-[11px] font-bold mt-1', plan.popular ? 'text-emerald-400' : 'text-emerald-600']"
                      >
                        ≈ {{ formatCurrency(Math.round(plan.priceAnnual / 12)) }}/mes · Ahorras 2 meses
                      </p>
                      <p
                        v-else
                        :class="['text-[11px] mt-1', plan.popular ? 'text-white/60' : 'text-[#71717A]']"
                      >
                        O {{ formatCurrency(Math.round((isAnnual ? plan.priceAnnual : plan.priceMonthly * 10))) }} al año con descuento
                      </p>
                    </div>

                    <!-- Plan inheritance label -->
                    <p
                      v-if="idx > 0"
                      :class="['text-[11px] font-bold uppercase tracking-wider mb-3', plan.popular ? 'text-white/60' : 'text-[#71717A]']"
                    >
                      Todo {{ plans[idx - 1].name }}, más:
                    </p>

                    <!-- Features checklist -->
                    <div class="space-y-2.5 mb-8">
                      <div
                        v-for="feat in plan.features"
                        :key="feat"
                        :class="['flex items-start gap-2.5 text-[13px]', plan.popular ? 'text-white/80' : 'text-[#444444]']"
                      >
                        <span
                          :class="['material-symbols-outlined text-[15px] mt-[3px] flex-shrink-0', plan.popular ? 'text-emerald-400' : 'text-emerald-600']"
                          aria-hidden="true"
                        >check_circle</span>
                        <span class="leading-[1.45]">{{ feat }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Buttons + micro-copy -->
                  <div class="space-y-2 mt-auto">
                    <button
                      type="button"
                      :class="[
                        'w-full py-3.5 rounded-xl text-[13.5px] font-semibold flex items-center justify-center gap-2 btn-transition active:scale-[0.98]',
                        plan.popular
                          ? 'bg-white text-[#18181B] hover:bg-[#F4F4F5] shadow-lg shadow-white/10'
                          : 'bg-[#18181B] text-white hover:bg-[#27272A] shadow-sm'
                      ]"
                      :aria-label="'Comprar ahora plan ' + plan.name"
                      @click="openCheckout(plan)"
                    >
                      <span
                        class="material-symbols-outlined text-[15px]"
                        aria-hidden="true"
                      >credit_card</span>
                      Comprar ahora
                    </button>
                    <button
                      type="button"
                      :class="[
                        'w-full py-3 rounded-xl text-[13px] font-medium btn-transition active:scale-[0.98]',
                        plan.popular
                          ? 'border border-white/15 text-white/70 hover:bg-white/8 hover:text-white'
                          : 'border border-[#E4E4E7] text-[#666666] bg-white hover:bg-[#FAFAFA] hover:text-[#18181B]'
                      ]"
                      :aria-label="'Comenzar prueba gratis del plan ' + plan.name"
                      @click="() => { trackCTAClick('pricing', plan.id); emit('request-demo') }"
                    >
                      Comenzar prueba gratis
                    </button>
                    <!-- Micro-copy -->
                    <p :class="['text-center text-[11px] pt-1', plan.popular ? 'text-white/60' : 'text-[#71717A]']">
                      Sin tarjeta de crédito · Cancela cuando quieras
                    </p>
                  </div>
                </div>
              </div>

              <!-- Enterprise bottom strip -->
              <div class="mt-10 max-w-6xl mx-auto">
                <div class="enterprise-strip">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-[#18181B] flex items-center justify-center flex-shrink-0">
                      <span
                        class="material-symbols-outlined text-white text-[16px]"
                        aria-hidden="true"
                      >business</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-[13.5px] font-bold text-[#18181B]">
                        ¿Más de 20 usuarios o necesidades específicas?
                      </p>
                      <p class="text-[12px] text-[#666666] leading-tight">
                        Planes corporativos con integración ERP personalizada, SLA dedicado y facturación personalizada.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="enterprise-strip-btn flex-shrink-0"
                    @click="emit('request-demo')"
                  >
                    Hablar con ventas
                    <span
                      class="material-symbols-outlined text-[15px]"
                      aria-hidden="true"
                    >arrow_forward</span>
                  </button>
                </div>
              </div>

              <!-- Trust badges -->
              <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 max-w-6xl mx-auto">
                <span class="trust-badge">
                  <span
                    class="material-symbols-outlined text-[14px] text-[#16a34a]"
                    aria-hidden="true"
                  >shield</span>
                  Datos cifrados AES-256
                </span>
                <span class="trust-badge">
                  <span
                    class="material-symbols-outlined text-[14px] text-[#16a34a]"
                    aria-hidden="true"
                  >verified</span>
                  DIAN Partner Certificado
                </span>
                <span class="trust-badge">
                  <span
                    class="material-symbols-outlined text-[14px] text-[#16a34a]"
                    aria-hidden="true"
                  >replay</span>
                  Garantía 30 días o reembolso
                </span>
                <span class="trust-badge">
                  <span
                    class="material-symbols-outlined text-[14px] text-[#16a34a]"
                    aria-hidden="true"
                  >support_agent</span>
                  Soporte en español 24/7
                </span>
              </div>
            </div>
          </section>
        </template>
        <div v-else class="h-[1200px] bg-[#FAFAFA] border-b border-[#F4F4F5]" />
      </div>

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
                aria-label="Cerrar pasarela de pago"
                @click="closeWompi"
              >
                <span
                  class="material-symbols-outlined text-[18px]"
                  aria-hidden="true"
                >close</span>
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
                  <span
                    class="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >lock</span>
                  Pagar con Wompi
                </button>
              
                <!-- Only visible in development — never in production builds -->
                <button
                  v-if="isDev"
                  type="button"
                  class="w-full py-3.5 border border-[#E4E4E7] text-[#18181B] bg-white rounded-xl text-[13px] font-bold hover:bg-[#FAFAFA] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  @click="submitPaymentSimulated"
                >
                  <span
                    class="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >science</span>
                  Simular Pago (Solo DEV)
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
                  class="w-full py-3.5 bg-[#18181B] hover:bg-[#27272A] text-white text-[13px] font-extrabold rounded-xl transition-colors shadow-md mt-8 active:scale-[0.98]"
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
            class="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            @click.stop
          >
            <!-- Drawer header -->
            <div class="flex justify-between items-center px-5 py-4 border-b border-[#F4F4F5]">
              <div class="flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 56 56"
                  aria-hidden="true"
                  class="flex-shrink-0"
                >
                  <rect
                    width="56"
                    height="56"
                    rx="12"
                    fill="#18181B"
                  />
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
                </svg>
                <span class="text-[15px] font-bold text-[#18181B]">Contex360</span>
              </div>
              <button
                type="button"
                class="w-10 h-10 flex items-center justify-center hover:bg-[#F4F4F5] rounded-lg text-[#555555] transition-colors"
                aria-label="Cerrar menú de navegación"
                @click="mobileNavOpen = false"
              >
                <span
                  class="material-symbols-outlined text-[20px]"
                  aria-hidden="true"
                >close</span>
              </button>
            </div>

            <!-- Drawer nav -->
            <nav
              role="navigation"
              aria-label="Navegación móvil"
              class="flex flex-col px-3 pt-3 flex-1"
            >
              <a
                href="#producto"
                class="drawer-nav-link"
                @click="mobileNavOpen = false"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-[#888888]"
                  aria-hidden="true"
                >grid_view</span>
                Plataforma
              </a>
              <a
                href="#beneficios"
                class="drawer-nav-link"
                @click="mobileNavOpen = false"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-[#888888]"
                  aria-hidden="true"
                >star</span>
                Soluciones Enterprise
              </a>
              <a
                href="#precios"
                class="drawer-nav-link"
                @click="mobileNavOpen = false"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-[#888888]"
                  aria-hidden="true"
                >payments</span>
                Precios
              </a>
            </nav>

            <!-- Drawer footer actions -->
            <div class="px-4 pb-8 pt-4 border-t border-[#F4F4F5] space-y-2.5">
              <button
                type="button"
                class="w-full py-3.5 bg-[#18181B] text-white text-[14px] font-semibold rounded-xl btn-transition active:scale-[0.98] flex items-center justify-center gap-2"
                @click="() => { mobileNavOpen = false; trackCTAClick('drawer'); emit('request-demo') }"
              >
                Iniciar Prueba Gratuita
                <span
                  class="material-symbols-outlined text-[18px]"
                  aria-hidden="true"
                >arrow_forward</span>
              </button>
              <button
                type="button"
                class="w-full py-3.5 border border-[#E4E4E7] text-[#555555] text-[14px] font-semibold rounded-xl btn-transition hover:bg-[#FAFAFA] hover:text-[#18181B] flex items-center justify-center gap-2"
                @click="() => { mobileNavOpen = false; emit('login') }"
              >
                <span
                  class="material-symbols-outlined text-[18px]"
                  aria-hidden="true"
                >person</span>
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- FAQ -->
      <div ref="faqRef" data-section="faq" id="faq">
        <template v-if="showFaq">
          <section
            class="py-16 lg:py-28 bg-white border-b border-[#F4F4F5]"
            aria-labelledby="faq-heading"
          >
            <div class="max-w-3xl mx-auto px-5 lg:px-8">
              <div class="text-center mb-10 lg:mb-14">
                <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
                  Preguntas Frecuentes
                </h2>
                <h3
                  id="faq-heading"
                  class="text-[32px] lg:text-[38px] leading-[1.08] tracking-[-0.025em] font-bold text-[#18181B]"
                >
                  Todo lo que necesitas saber
                </h3>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(faq, i) in faqs"
                  :key="i"
                  class="faq-item"
                  :class="{ 'faq-item--open': openFaq === i }"
                >
                  <button
                    type="button"
                    class="faq-trigger"
                    :aria-expanded="openFaq === i"
                    :aria-controls="`faq-answer-${i}`"
                    @click="toggleFaq(i)"
                  >
                    <span class="text-[14.5px] font-semibold text-[#18181B] text-left">{{ faq.q }}</span>
                    <span
                      class="faq-icon material-symbols-outlined text-[20px] text-[#888888] flex-shrink-0"
                      :class="{ 'rotate-45': openFaq === i }"
                      aria-hidden="true"
                    >add</span>
                  </button>
                  <div
                    :id="`faq-answer-${i}`"
                    class="faq-answer"
                    :class="{ 'faq-answer--open': openFaq === i }"
                  >
                    <p class="text-[13.5px] leading-[1.7] text-[#555555] pb-5 pr-8">
                      {{ faq.a }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-12 text-center">
                <p class="text-[13.5px] text-[#888888] mb-4">
                  ¿Tienes otra pregunta?
                </p>
                <button
                  type="button"
                  class="btn-secondary-landing"
                  @click="emit('request-demo')"
                >
                  Hablar con el equipo
                  <span
                    class="material-symbols-outlined text-[16px]"
                    aria-hidden="true"
                  >chat</span>
                </button>
              </div>
            </div>
          </section>
        </template>
        <div v-else class="h-[500px] bg-white border-b border-[#F4F4F5]" />
      </div>

      <!-- CTA strip -->
      <div ref="footerRef" data-section="footer">
        <template v-if="showFooter">
          <section class="cta-strip py-24 lg:py-28 relative overflow-hidden">
            <div
              aria-hidden="true"
              class="cta-strip-grid pointer-events-none absolute inset-0"
            />
            <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
              <h3
                class="text-[32px] lg:text-[46px] leading-[1.05] tracking-[-0.03em] font-bold text-white mb-5"
                style="text-wrap: balance;"
              >
                ¿Listo para llevar su back-office <em class="not-italic text-[#60A5FA]">al siguiente nivel</em>?
              </h3>
              <p class="text-[15.5px] text-white/60 mb-10 max-w-md mx-auto leading-[1.6]">
                Agende una demostración de 30 minutos con nuestro equipo. Sin compromiso, sin tarjeta de crédito.
              </p>
              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  class="btn-cta-white"
                  aria-label="Solicitar Demo de Contex360"
                  @click="() => { trackCTAClick('bottom'); emit('request-demo') }"
                >
                  Solicitar Demo
                  <span
                    class="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >arrow_forward</span>
                </button>
                <button
                  type="button"
                  class="border border-white/20 text-white/80 text-[14px] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/8 hover:text-white btn-transition active:scale-[0.98]"
                  aria-label="Iniciar sesión en la plataforma"
                  @click="emit('login')"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </section>
        </template>
        <div v-else class="h-[350px] bg-[#0F0F11]" />
      </div>
    </main>

    <!-- Sticky mobile CTA bar -->
    <Teleport to="body">
      <div
        class="sticky-mobile-cta lg:hidden"
        :class="{ 'sticky-mobile-cta--visible': pastHero && !showWompi && !mobileNavOpen && !showBillingConfirm }"
        aria-hidden="true"
      >
        <button
          type="button"
          class="sticky-mobile-cta-btn"
          tabindex="-1"
          @click="() => { trackCTAClick('sticky-mobile'); emit('request-demo') }"
        >
          Iniciar Prueba Gratuita
          <span
            class="material-symbols-outlined text-[18px]"
            aria-hidden="true"
          >arrow_forward</span>
        </button>
        <p class="sticky-mobile-cta-sub">
          Sin tarjeta · Cancela cuando quieras
        </p>
      </div>
    </Teleport>

    <!-- Billing confirmation dialog (replaces native confirm()) -->
    <Teleport to="body">
      <div
        v-if="showBillingConfirm"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#09090B]/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-confirm-title"
      >
        <div class="bg-white border border-[#E4E4E7] rounded-[20px] shadow-2xl w-full max-w-[400px] p-7 flex flex-col gap-5">
          <div>
            <h4
              id="billing-confirm-title"
              class="text-[16px] font-bold text-[#18181B] mb-1.5"
            >
              ¿Cambiar modalidad de facturación?
            </h4>
            <p class="text-[13px] text-[#555555] leading-[1.55]">
              El proceso de pago actual se cerrará. Podrás iniciar uno nuevo con la nueva modalidad.
            </p>
          </div>
          <div class="flex gap-2.5">
            <button
              type="button"
              class="flex-1 py-2.5 bg-[#18181B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#27272A] transition-colors"
              @click="confirmBillingChange"
            >
              Confirmar cambio
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 border border-[#E4E4E7] text-[#18181B] text-[13px] font-semibold rounded-xl hover:bg-[#FAFAFA] transition-colors"
              @click="showBillingConfirm = false"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <template v-if="showFooter">
      <footer class="py-10 lg:py-14 border-t border-[#F4F4F5] bg-white">
        <div class="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 lg:gap-10">
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
          <div class="flex gap-8 lg:gap-12">
            <div class="flex flex-col gap-3">
              <span class="text-[11px] font-bold text-[#18181B] uppercase tracking-widest">Plataforma</span>
              <button
                type="button"
                class="text-[12px] text-[#555555] hover:text-[#18181B] font-medium text-left"
                @click="emit('show-about')"
              >
                Características
              </button>
              <button
                type="button"
                class="text-[12px] text-[#555555] hover:text-[#18181B] font-medium text-left"
                @click="() => { trackCTAClick('footer'); emit('request-demo') }"
              >
                Demo
              </button>
            </div>
            <div class="flex flex-col gap-3">
              <span class="text-[11px] font-bold text-[#18181B] uppercase tracking-widest">Legal</span>
              <button
                type="button"
                class="text-[12px] text-[#555555] hover:text-[#18181B] font-medium text-left"
                @click="emit('show-terms')"
              >
                Términos
              </button>
              <button
                type="button"
                class="text-[12px] text-[#555555] hover:text-[#18181B] font-medium text-left"
                @click="emit('show-privacy')"
              >
                Privacidad
              </button>
              <button
                type="button"
                class="text-[12px] text-[#555555] hover:text-[#18181B] font-medium text-left"
                @click="emit('show-dpa')"
              >
                DPA
              </button>
              <button
                type="button"
                class="text-[12px] text-[#555555] hover:text-[#18181B] font-medium text-left"
                @click="emit('show-bcp')"
              >
                Continuidad
              </button>
            </div>
          </div>
          <p class="text-[12px] text-[#666666] font-medium">
            © 2026 Contex360. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </template>
    <div v-else class="h-[250px] bg-white border-t border-[#F4F4F5]" />
  </div>
</template>

<style scoped>
/* ─── Focus ─────────────────────────────────────────────────── */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
  border-radius: 6px;
}

/* ─── Icons ──────────────────────────────────────────────────── */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

/* ─── Toggle sizing (Tailwind custom values) ─────────────────── */
.w-5\.5  { width: 1.375rem; }
.h-5\.5  { height: 1.375rem; }
.w-12    { width: 3rem; }
.h-6\.5  { height: 1.625rem; }
.translate-x-5\.5 { transform: translateX(1.375rem); }

/* ─── Logo spin ──────────────────────────────────────────────── */
.c360-mark .rotor {
  transform-origin: 28px 28px;
  animation: spin 10s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Dashboard image ────────────────────────────────────────── */
.dashboard-image {
  filter: saturate(0.9) brightness(1.01);
  transition: filter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.dashboard-image:hover {
  filter: saturate(1) brightness(1.03);
}

/* ─── Hero background grid ───────────────────────────────────── */
.landing-hero-bg {
  background-image:
    linear-gradient(rgba(228,228,231,0.4) 1px, transparent 1px),
    linear-gradient(90deg, rgba(228,228,231,0.4) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
}

/* ─── Button system ──────────────────────────────────────────── */
.btn-transition {
  transition:
    background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 120ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary-landing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  background: #18181B;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 0.875rem 2rem;
  border-radius: 0.75rem;
  border: 1px solid #18181B;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 4px 12px -2px rgba(0,0,0,0.12);
  transition:
    background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}
.btn-primary-landing:hover {
  background: #27272A;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 8px 20px -4px rgba(0,0,0,0.18);
  transform: translateY(-1px);
}
.btn-primary-landing:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.btn-secondary-landing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  background: white;
  color: #18181B;
  font-size: 14px;
  font-weight: 600;
  padding: 0.875rem 2rem;
  border-radius: 0.75rem;
  border: 1px solid #E4E4E7;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition:
    background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 150ms ease;
  cursor: pointer;
}
.btn-secondary-landing:hover {
  background: #FAFAFA;
  border-color: #D4D4D8;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}
.btn-secondary-landing:active {
  transform: scale(0.98);
}

.btn-cta-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  background: white;
  color: #18181B;
  font-size: 14px;
  font-weight: 600;
  padding: 0.875rem 2rem;
  border-radius: 0.75rem;
  border: 1px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1);
  transition:
    background-color 150ms ease,
    box-shadow 150ms ease,
    transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}
.btn-cta-white:hover {
  background: #F4F4F5;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}
.btn-cta-white:active {
  transform: scale(0.98);
}

/* ─── Feature cards ──────────────────────────────────────────── */
.feature-card {
  background: white;
  border: 1px solid #E4E4E7;
  border-radius: 18px;
  padding: 2.25rem;
  transition:
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 250ms ease,
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.feature-card:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 16px 48px -12px rgba(10,10,10,0.1);
  border-color: #D4D4D8;
  transform: translateY(-2px);
}

.feature-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}
.feature-icon-dark {
  background: #18181B;
  color: white;
}
.feature-icon-blue {
  background: #2563EB;
  color: white;
}

/* ─── Pricing cards ──────────────────────────────────────────── */
.pricing-card {
  border-radius: 20px;
  padding: 2rem;
  transition:
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pricing-card--default {
  background: white;
  border: 1px solid #E4E4E7;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.pricing-card--default:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 12px 32px -8px rgba(10,10,10,0.08);
  transform: translateY(-2px);
}
.pricing-card--popular {
  background: #18181B;
  border: 1px solid #27272A;
  box-shadow:
    0 0 0 1px rgba(37,99,235,0.15),
    0 4px 8px rgba(0,0,0,0.12),
    0 20px 48px -12px rgba(0,0,0,0.35);
  transform: translateY(-4px);
}
.pricing-card--popular:hover {
  box-shadow:
    0 0 0 1px rgba(37,99,235,0.25),
    0 8px 16px rgba(0,0,0,0.18),
    0 28px 60px -12px rgba(0,0,0,0.4);
  transform: translateY(-6px);
}

/* ─── CTA dark section ───────────────────────────────────────── */
.cta-strip {
  background: #0F0F11;
}
.cta-strip-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ─── Social proof logos ─────────────────────────────────────── */
.client-logo-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.65;
  transition: opacity 200ms ease;
  cursor: default;
  user-select: none;
}
.client-logo-item:hover { opacity: 0.95; }
.client-logo-abbr {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #18181B;
  color: white;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}
.client-logo-name {
  font-size: 13px;
  font-weight: 700;
  color: #18181B;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* ─── Testimonial cards ──────────────────────────────────────── */
.testimonial-card {
  background: white;
  border: 1px solid #E4E4E7;
  border-radius: 18px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  margin: 0;
  transition:
    box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 200ms ease;
}
.testimonial-card:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.03), 0 16px 40px -12px rgba(10,10,10,0.09);
  border-color: #D4D4D8;
  transform: translateY(-2px);
}

/* ─── FAQ accordion ──────────────────────────────────────────── */
.faq-item {
  border: 1px solid #E4E4E7;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.faq-item--open {
  border-color: #D4D4D8;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}
.faq-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: background-color 150ms ease;
}
.faq-trigger:hover { background: #FAFAFA; }
.faq-icon {
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 350ms cubic-bezier(0.4, 0, 0.2, 1);
  background: #FAFAFA;
  border-top: 0px solid #F4F4F5;
}
.faq-answer--open {
  max-height: 400px;
  border-top-width: 1px;
}
.faq-answer p { padding: 1.1rem 1.25rem 1.25rem; }

/* ─── Enterprise bottom strip ────────────────────────────────── */
.enterprise-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #F9F9F9;
  border: 1px solid #E4E4E7;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  flex-wrap: wrap;
}
.enterprise-strip-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: #18181B;
  color: white;
  font-size: 12.5px;
  font-weight: 600;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms ease, transform 120ms ease;
}
.enterprise-strip-btn:hover { background: #27272A; transform: translateY(-1px); }
.enterprise-strip-btn:active { transform: scale(0.97); }

/* ─── Trust badges ───────────────────────────────────────────── */
.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 11.5px;
  font-weight: 600;
  color: #555555;
}

/* ─── Reduced motion ─────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .dashboard-image,
  .btn-primary-landing,
  .btn-secondary-landing,
  .btn-cta-white,
  .btn-transition,
  .feature-card,
  .feature-icon-wrap,
  .pricing-card,
  .testimonial-card,
  .faq-item,
  .faq-icon,
  .faq-answer,
  .enterprise-strip-btn,
  .client-logo-item {
    transition: none;
  }
  .c360-mark .rotor {
    animation: none;
    opacity: 0.85;
  }
  .sticky-mobile-cta {
    transition: none;
  }
}

/* ─── Nav hamburger ──────────────────────────────────────────── */
.nav-hamburger {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #18181B;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.nav-hamburger:hover { background: #F4F4F5; }

/* ─── Mobile drawer nav links ────────────────────────────────── */
.drawer-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 0.75rem;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 600;
  color: #444444;
  text-decoration: none;
  min-height: 48px;
  transition: background-color 150ms ease, color 150ms ease;
}
.drawer-nav-link:hover {
  background: #F4F4F5;
  color: #18181B;
}

/* ─── Testimonials mobile scroll ─────────────────────────────── */
.testimonials-scroll {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}
@media (max-width: 767px) {
  .testimonials-scroll {
    display: flex;
    gap: 0.875rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 1rem;
    /* Hide scrollbar visually but keep functional */
    scrollbar-width: none;
  }
  .testimonials-scroll::-webkit-scrollbar { display: none; }
  .testimonials-scroll .testimonial-card {
    min-width: min(85vw, 320px);
    scroll-snap-align: start;
    flex-shrink: 0;
  }
}

/* ─── FAQ mobile touch targets ───────────────────────────────── */
@media (max-width: 767px) {
  .faq-trigger {
    min-height: 56px;
    padding: 1rem 1.1rem;
  }
  .faq-answer p {
    font-size: 13px;
  }
}

/* ─── Sticky mobile CTA ──────────────────────────────────────── */
.sticky-mobile-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 45;
  padding: 0.875rem 1.25rem;
  padding-bottom: calc(0.875rem + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(228, 228, 231, 0.8);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(110%);
  transition: transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
.sticky-mobile-cta--visible {
  transform: translateY(0);
}
.sticky-mobile-cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #18181B;
  color: white;
  font-size: 14.5px;
  font-weight: 700;
  padding: 0.875rem;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  min-height: 52px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: background-color 150ms ease, transform 120ms ease;
}
.sticky-mobile-cta-btn:hover { background: #27272A; }
.sticky-mobile-cta-btn:active { transform: scale(0.98); }
.sticky-mobile-cta-sub {
  text-align: center;
  font-size: 11px;
  color: #AAAAAA;
  margin: 0.4rem 0 0;
}

/* ─── Mobile section bottom padding to clear sticky CTA ─────── */
@media (max-width: 1023px) {
  footer {
    padding-bottom: calc(2.5rem + env(safe-area-inset-bottom));
  }
}

/* ─── touch-action on interactive areas ─────────────────────── */
.testimonials-scroll,
.pricing-card,
.faq-trigger {
  touch-action: manipulation;
}

/* ─── Dark mode overrides for the landing ────────────────────── */
:global(html.dark) .landing-root {
  background: #0b0f19;
  color: #f4f4f5;
}
:global(html.dark) .landing-root .landing-hero-bg {
  background-image:
    linear-gradient(rgba(55,65,81,0.25) 1px, transparent 1px),
    linear-gradient(90deg, rgba(55,65,81,0.25) 1px, transparent 1px);
  background-size: 40px 40px;
}
:global(html.dark) .landing-root .feature-card {
  background: #182235;
  border-color: rgba(55,65,81,0.5);
}
:global(html.dark) .landing-root .feature-card:hover {
  border-color: rgba(55,65,81,0.8);
}
:global(html.dark) .landing-root .pricing-card--default {
  background: #182235;
  border-color: rgba(55,65,81,0.5);
}
:global(html.dark) .landing-root .btn-secondary-landing {
  background: #182235;
  border-color: rgba(55,65,81,0.6);
  color: #f4f4f5;
}
:global(html.dark) .landing-root .btn-secondary-landing:hover {
  background: #1e293b;
}
:global(html.dark) .landing-root .testimonial-card {
  background: #182235;
  border-color: rgba(55,65,81,0.5);
}
:global(html.dark) .landing-root .faq-item {
  border-color: rgba(55,65,81,0.5);
  background: #182235;
}
:global(html.dark) .landing-root .faq-trigger {
  background: #182235;
  color: #f4f4f5;
}
:global(html.dark) .landing-root .faq-trigger:hover {
  background: #1e293b;
}
:global(html.dark) .landing-root .faq-answer {
  background: #111827;
}
:global(html.dark) .landing-root .enterprise-strip {
  background: #182235;
  border-color: rgba(55,65,81,0.5);
}
:global(html.dark) .landing-root .client-logo-name {
  color: #f4f4f5;
}
:global(html.dark) .sticky-mobile-cta {
  background: rgba(11, 15, 25, 0.92);
  border-top-color: rgba(55, 65, 81, 0.4);
}
:global(html.dark) .sticky-mobile-cta-sub {
  color: #555555;
}
:global(html.dark) .drawer-nav-link {
  color: #94a3b8;
}
:global(html.dark) .drawer-nav-link:hover {
  background: #1e293b;
  color: #f4f4f5;
}
</style>
