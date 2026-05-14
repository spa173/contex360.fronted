<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  BarChart3, Package, Users, TrendingUp, ShieldCheck,
  ArrowRight, CheckCircle, Star, Zap, Globe,
  Building2, Receipt, Layers, Menu, X, Play,
  FileText, Lock, Clock
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'request-demo'): void
}>()

const mobileMenuOpen = ref(false)
const scrolled = ref(false)
const activeFeature = ref(0)

const features = [
  {
    icon: Receipt,
    label: 'Facturación DIAN',
    title: 'Facturación electrónica certificada',
    desc: 'Emite facturas electrónicas válidas ante la DIAN en segundos. Validación automática, PDF y envío al cliente integrado.',
    stat: '12.400+', statLabel: 'facturas emitidas',
  },
  {
    icon: Package,
    label: 'Inventario',
    title: 'Control de inventario en tiempo real',
    desc: 'Maneja múltiples bodegas, traslados entre sedes, alertas de stock mínimo y análisis ABC automático.',
    stat: '99.8%', statLabel: 'precisión de stock',
  },
  {
    icon: BarChart3,
    label: 'Analítica',
    title: 'Dashboard financiero inteligente',
    desc: 'KPIs empresariales en tiempo real. Márgenes, flujo de caja, cuentas por cobrar y proyecciones automáticas.',
    stat: '3.2×', statLabel: 'decisiones más rápidas',
  },
  {
    icon: Users,
    label: 'Equipos',
    title: 'Control de acceso por roles',
    desc: 'Define permisos precisos por cargo. Contador, vendedor, administrador — cada uno ve solo lo que necesita.',
    stat: '100%', statLabel: 'auditable y seguro',
  },
]

const stats = [
  { value: '340+', label: 'empresas activas' },
  { value: '$2.1B', label: 'en facturas procesadas' },
  { value: '99.97%', label: 'uptime garantizado' },
  { value: '< 2h', label: 'tiempo de onboarding' },
]

const testimonials = [
  {
    name: 'Camila Rodríguez',
    role: 'CFO · Distribuidora Boyacá',
    quote: 'Antes tardábamos 3 días en cerrar el mes. Con Contex360 lo hacemos el mismo día. La visibilidad financiera cambió completamente nuestra operación.',
    rating: 5,
    avatar: 'CR',
  },
  {
    name: 'Andrés Morales',
    role: 'Gerente General · Construcciones AM',
    quote: 'El control de inventario entre obras nos costaba errores costosos. Ahora tenemos trazabilidad completa de materiales en tiempo real.',
    rating: 5,
    avatar: 'AM',
  },
  {
    name: 'Laura Venegas',
    role: 'Contadora · Servicios LV',
    quote: 'La integración DIAN es perfecta. Cero rechazos en 8 meses. Y el soporte responde en menos de una hora.',
    rating: 5,
    avatar: 'LV',
  },
]

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  const interval = setInterval(() => {
    activeFeature.value = (activeFeature.value + 1) % features.length
  }, 4000)
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearInterval(interval)
  })
})
</script>

<template>
  <div class="min-h-screen bg-white font-sans antialiased text-gray-900 overflow-x-hidden">

    <!-- ───── NAV ───── -->
    <header
      :class="[
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      ]"
    >
      <nav class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-200">
            <Layers class="w-4.5 h-4.5 text-white" />
          </div>
          <span class="text-lg font-bold tracking-tight text-gray-900">Contex<span class="text-orange-500">360</span></span>
        </div>

        <!-- Links desktop -->
        <div class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">Características</a>
          <a href="#stats" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">Resultados</a>
          <a href="#testimonials" class="text-sm text-gray-500 hover:text-gray-900 transition-colors">Clientes</a>
        </div>

        <!-- CTAs desktop -->
        <div class="hidden md:flex items-center gap-3">
          <button
            @click="emit('login')"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
          >
            Iniciar sesión
          </button>
          <button
            @click="emit('request-demo')"
            class="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg transition-all shadow-md shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            Solicitar demo
          </button>
        </div>

        <!-- Mobile menu toggle -->
        <button class="md:hidden p-2 text-gray-500" @click="mobileMenuOpen = !mobileMenuOpen">
          <Menu v-if="!mobileMenuOpen" class="w-5 h-5" />
          <X v-else class="w-5 h-5" />
        </button>
      </nav>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4 shadow-lg">
        <a href="#features" @click="mobileMenuOpen = false" class="block text-sm text-gray-600">Características</a>
        <a href="#stats" @click="mobileMenuOpen = false" class="block text-sm text-gray-600">Resultados</a>
        <a href="#testimonials" @click="mobileMenuOpen = false" class="block text-sm text-gray-600">Clientes</a>
        <div class="pt-3 border-t border-gray-100 flex flex-col gap-2">
          <button @click="emit('login'); mobileMenuOpen = false" class="w-full text-center text-sm font-medium border border-gray-200 rounded-lg py-2.5 text-gray-700">Iniciar sesión</button>
          <button @click="emit('request-demo'); mobileMenuOpen = false" class="w-full text-center text-sm font-semibold bg-orange-500 text-white rounded-lg py-2.5">Solicitar demo</button>
        </div>
      </div>
    </header>

    <!-- ───── HERO ───── -->
    <section class="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 pointer-events-none" />
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-orange-100/60 to-transparent rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />

      <div class="relative max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">

          <!-- Left: copy -->
          <div>
            <div class="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-8">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span class="text-xs font-semibold text-orange-600 tracking-wide uppercase">ERP Colombiano 2026</span>
            </div>

            <h1 class="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-gray-900 mb-6">
              El ERP que tu empresa<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                necesita hoy
              </span>
            </h1>

            <p class="text-lg text-gray-500 leading-relaxed max-w-lg mb-10">
              Facturación DIAN, inventario multi-bodega, analítica financiera y control de equipo — todo en una plataforma. Sin complicaciones.
            </p>

            <div class="flex flex-col sm:flex-row gap-3 mb-12">
              <button
                @click="emit('request-demo')"
                class="group flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm px-7 py-4 rounded-xl shadow-xl shadow-orange-200/60 hover:shadow-orange-300/60 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Pedir demo gratis
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                @click="emit('login')"
                class="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm px-7 py-4 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm transition-all"
              >
                <Play class="w-4 h-4 text-orange-500" />
                Ya tengo cuenta
              </button>
            </div>

            <!-- Trust badges -->
            <div class="flex items-center gap-6 text-sm text-gray-400">
              <div class="flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-orange-400" />
                <span>Certificado DIAN</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Zap class="w-4 h-4 text-orange-400" />
                <span>Activo en &lt; 2 horas</span>
              </div>
              <div class="flex items-center gap-1.5">
                <Globe class="w-4 h-4 text-orange-400" />
                <span>Multi-empresa</span>
              </div>
            </div>
          </div>

          <!-- Right: Dashboard mockup -->
          <div class="relative lg:pl-8">
            <!-- Glow -->
            <div class="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-amber-100/20 rounded-3xl blur-3xl scale-110 pointer-events-none" />

            <!-- Main card -->
            <div class="relative bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden">
              <!-- Fake topbar -->
              <div class="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-red-300" />
                <div class="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <div class="w-2.5 h-2.5 rounded-full bg-green-300" />
                <div class="flex-1 mx-4 bg-gray-100 rounded-md h-5 text-[10px] text-gray-400 flex items-center justify-center">app.contex360.co/dashboard</div>
              </div>

              <!-- Dashboard content -->
              <div class="p-5 bg-gray-50/50">
                <!-- KPI row -->
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                    <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Ingresos</p>
                    <p class="text-xl font-bold text-gray-900">$48.2M</p>
                    <div class="flex items-center gap-1 mt-1">
                      <TrendingUp class="w-3 h-3 text-emerald-500" />
                      <span class="text-[10px] text-emerald-600 font-semibold">+12.4%</span>
                    </div>
                  </div>
                  <div class="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                    <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Facturas</p>
                    <p class="text-xl font-bold text-gray-900">1.247</p>
                    <div class="flex items-center gap-1 mt-1">
                      <CheckCircle class="w-3 h-3 text-orange-400" />
                      <span class="text-[10px] text-orange-500 font-semibold">98.6% ok</span>
                    </div>
                  </div>
                  <div class="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                    <p class="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Productos</p>
                    <p class="text-xl font-bold text-gray-900">3.841</p>
                    <div class="flex items-center gap-1 mt-1">
                      <Package class="w-3 h-3 text-blue-400" />
                      <span class="text-[10px] text-blue-500 font-semibold">4 bodegas</span>
                    </div>
                  </div>
                </div>

                <!-- Chart bar mockup -->
                <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-3">
                  <div class="flex items-center justify-between mb-4">
                    <p class="text-xs font-semibold text-gray-700">Flujo de caja — Mayo 2026</p>
                    <span class="text-[10px] text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">En tiempo real</span>
                  </div>
                  <div class="flex items-end gap-1.5 h-20">
                    <div v-for="(h, i) in [55, 72, 48, 88, 65, 91, 70, 84, 60, 95, 78, 88]" :key="i"
                      class="flex-1 rounded-t-sm transition-all"
                      :class="i === 10 || i === 11 ? 'bg-orange-400' : 'bg-orange-100'"
                      :style="`height: ${h}%`"
                    />
                  </div>
                  <div class="flex justify-between mt-2">
                    <span class="text-[9px] text-gray-400">May 1</span>
                    <span class="text-[9px] text-gray-400">May 14</span>
                  </div>
                </div>

                <!-- Recent activity -->
                <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div class="px-4 py-2.5 border-b border-gray-50">
                    <p class="text-xs font-semibold text-gray-700">Actividad reciente</p>
                  </div>
                  <div v-for="item in [
                    { label: 'FE-20240512-001', sub: 'Comercial Andina · $2.4M', color: 'bg-emerald-100 text-emerald-600', tag: 'Aprobada' },
                    { label: 'Traslado BOG→MED', sub: '84 unidades · Prod. X220', color: 'bg-orange-100 text-orange-600', tag: 'En tránsito' },
                    { label: 'FE-20240511-098', sub: 'Ferretería López · $780K', color: 'bg-emerald-100 text-emerald-600', tag: 'Aprobada' },
                  ]" :key="item.label"
                    class="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p class="text-[11px] font-semibold text-gray-800">{{ item.label }}</p>
                      <p class="text-[10px] text-gray-400 mt-0.5">{{ item.sub }}</p>
                    </div>
                    <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full', item.color]">{{ item.tag }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating badge -->
            <div class="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <ShieldCheck class="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p class="text-xs font-bold text-gray-900">Certificado DIAN</p>
                <p class="text-[10px] text-gray-400">Obligación fiscal cumplida</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── STATS ───── -->
    <section id="stats" class="py-16 border-y border-gray-100 bg-white">
      <div class="max-w-5xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="s in stats" :key="s.value" class="text-center">
            <p class="text-4xl font-extrabold text-gray-900 mb-1">{{ s.value }}</p>
            <p class="text-sm text-gray-400">{{ s.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── FEATURES ───── -->
    <section id="features" class="py-24 md:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Plataforma completa</p>
          <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Todo lo que necesita<br/>tu empresa
          </h2>
          <p class="text-lg text-gray-400 max-w-xl mx-auto">Sin módulos separados, sin integraciones complejas. Un solo sistema que crece contigo.</p>
        </div>

        <!-- Feature tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-12">
          <button
            v-for="(f, i) in features" :key="i"
            @click="activeFeature = i"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all',
              activeFeature === i
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            ]"
          >
            <component :is="f.icon" class="w-4 h-4" />
            {{ f.label }}
          </button>
        </div>

        <!-- Active feature -->
        <div class="grid md:grid-cols-2 gap-12 items-center bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
          <div>
            <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 items-center justify-center mb-6 shadow-lg shadow-orange-200">
              <component :is="features[activeFeature].icon" class="w-7 h-7 text-white" />
            </div>
            <h3 class="text-3xl font-bold text-gray-900 mb-4">{{ features[activeFeature].title }}</h3>
            <p class="text-gray-500 text-lg leading-relaxed mb-8">{{ features[activeFeature].desc }}</p>
            <div class="flex items-center gap-4">
              <div>
                <p class="text-4xl font-extrabold text-orange-500">{{ features[activeFeature].stat }}</p>
                <p class="text-sm text-gray-400 mt-1">{{ features[activeFeature].statLabel }}</p>
              </div>
              <div class="w-px h-12 bg-gray-200" />
              <button
                @click="emit('request-demo')"
                class="group flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Ver demostración
                <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <!-- Feature mockup -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 flex items-center justify-between">
              <span class="text-white text-xs font-bold">{{ features[activeFeature].label }}</span>
              <span class="text-orange-100 text-xs">Contex360 ERP</span>
            </div>
            <div class="p-5 space-y-3">
              <div v-for="row in [85, 62, 91, 48, 77]" :key="row" class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-orange-50 flex-shrink-0" />
                <div class="flex-1">
                  <div class="h-2.5 bg-gray-100 rounded-full mb-1.5" :style="`width: ${row}%`" />
                  <div class="h-2 bg-gray-50 rounded-full" :style="`width: ${row * 0.6}%`" />
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="h-2.5 w-12 bg-orange-100 rounded-full mb-1" />
                  <div class="h-2 w-8 bg-orange-50 rounded-full ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── TESTIMONIALS ───── -->
    <section id="testimonials" class="py-24 bg-gradient-to-b from-orange-50/50 to-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-16">
          <p class="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Clientes reales</p>
          <h2 class="text-4xl font-extrabold text-gray-900 tracking-tight">Lo que dicen las empresas</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="t in testimonials" :key="t.name"
            class="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all"
          >
            <!-- Stars -->
            <div class="flex gap-0.5 mb-5">
              <Star v-for="i in t.rating" :key="i" class="w-4 h-4 fill-orange-400 text-orange-400" />
            </div>
            <p class="text-gray-600 text-sm leading-relaxed mb-6">"{{ t.quote }}"</p>
            <div class="flex items-center gap-3 pt-5 border-t border-gray-50">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {{ t.avatar }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ t.name }}</p>
                <p class="text-xs text-gray-400">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── CTA FINAL ───── -->
    <section class="py-24 md:py-32 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />

      <div class="relative max-w-4xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <Building2 class="w-3.5 h-3.5 text-white" />
          <span class="text-xs font-semibold text-white tracking-wide uppercase">Sin tarjeta de crédito</span>
        </div>

        <h2 class="text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
          Empieza en menos<br/>de dos horas
        </h2>
        <p class="text-xl text-orange-100 mb-12 max-w-xl mx-auto">
          Nuestro equipo configura tu empresa, migra tus datos y capacita tu equipo. Sin complicaciones técnicas.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="emit('request-demo')"
            class="group flex items-center justify-center gap-2 bg-white text-orange-600 font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-orange-700/30 hover:bg-orange-50 transition-all hover:-translate-y-0.5"
          >
            Solicitar demo gratuita
            <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            @click="emit('login')"
            class="flex items-center justify-center gap-2 bg-transparent text-white font-semibold text-base px-8 py-4 rounded-xl border-2 border-white/40 hover:border-white/70 hover:bg-white/10 transition-all"
          >
            Acceder a mi cuenta
          </button>
        </div>

        <!-- Checklist -->
        <div class="mt-12 flex flex-wrap justify-center gap-6 text-sm text-orange-100">
          <div v-for="item in ['Prueba 30 días gratis', 'Sin contrato mínimo', 'Soporte incluido', 'Datos seguros']" :key="item" class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-white" />
            {{ item }}
          </div>
        </div>
      </div>
    </section>

    <!-- ───── FOOTER ───── -->
    <footer class="bg-gray-900 text-gray-400 py-14">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          <div>
            <div class="flex items-center gap-2.5 mb-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
                <Layers class="w-4 h-4 text-white" />
              </div>
              <span class="text-white font-bold tracking-tight">Contex<span class="text-orange-400">360</span></span>
            </div>
            <p class="text-sm leading-relaxed max-w-xs">ERP colombiano certificado DIAN para empresas que necesitan crecer con control.</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <p class="text-white font-semibold mb-3">Producto</p>
              <ul class="space-y-2">
                <li><a href="#features" class="hover:text-orange-400 transition-colors">Características</a></li>
                <li><a href="#stats" class="hover:text-orange-400 transition-colors">Precios</a></li>
                <li><button @click="emit('login')" class="hover:text-orange-400 transition-colors">Acceso</button></li>
              </ul>
            </div>
            <div>
              <p class="text-white font-semibold mb-3">Empresa</p>
              <ul class="space-y-2">
                <li><a href="#" class="hover:text-orange-400 transition-colors">Nosotros</a></li>
                <li><button @click="emit('request-demo')" class="hover:text-orange-400 transition-colors">Contacto</button></li>
              </ul>
            </div>
            <div>
              <p class="text-white font-semibold mb-3">Legal</p>
              <ul class="space-y-2">
                <li><a href="#" class="hover:text-orange-400 transition-colors">Privacidad</a></li>
                <li><a href="#" class="hover:text-orange-400 transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Contex360. Todos los derechos reservados.</p>
          <p class="flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-orange-400" />
            Proveedor tecnológico certificado por la DIAN
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
