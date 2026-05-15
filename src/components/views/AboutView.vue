<script setup lang="ts">
import { ShieldCheck, Zap, Globe, Users, Building2, ArrowLeft } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'request-demo'): void
  (e: 'login'): void
}>()

const values = [
  { icon: ShieldCheck, title: 'Seguridad primero', desc: 'Certificados DIAN, cifrado AES-256 y cumplimiento total con la Ley 1581 de protección de datos de Colombia.' },
  { icon: Zap, title: 'Velocidad real', desc: 'Onboarding en menos de 2 horas. Facturas en segundos. Reportes instantáneos. Sin esperas.' },
  { icon: Globe, title: 'Hecho para Colombia', desc: 'Diseñado desde cero para la normativa colombiana: DIAN, NIIF, retenciones y reportes exógenos.' },
  { icon: Users, title: 'Equipo humano', desc: 'Soporte en español con tiempos de respuesta menores a 1 hora. Un equipo que conoce tu industria.' },
]

const milestones = [
  { year: '2022', event: 'Fundación de Contex360 en Bogotá.' },
  { year: '2023', event: 'Primera certificación como proveedor tecnológico DIAN.' },
  { year: '2024', event: 'Superamos las 200 empresas activas y $1B en facturas procesadas.' },
  { year: '2025', event: 'Lanzamiento de módulo de IA para analítica financiera predictiva.' },
  { year: '2026', event: '+340 empresas. $2.1B en facturas. 99.97% uptime.' },
]
</script>

<template>
  <div class="min-h-screen bg-white font-sans antialiased text-gray-900 overflow-x-hidden">

    <!-- Nav minimal -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          @click="emit('back')"
          class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          Volver
        </button>
        <span class="text-base font-bold tracking-tight text-gray-900">
          Contex<span class="text-[#AC8C49]">360</span>
        </span>
        <button
          @click="emit('login')"
          class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Iniciar sesión
        </button>
      </div>
    </header>

    <!-- Hero -->
    <section class="py-20 md:py-28 bg-gradient-to-b from-amber-50/60 to-white">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 bg-[#AC8C49]/10 border border-[#AC8C49]/20 rounded-full px-4 py-1.5 mb-6">
          <Building2 class="w-3.5 h-3.5 text-[#AC8C49]" />
          <span class="text-xs font-semibold text-[#78694A] tracking-wide uppercase">Empresa colombiana</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 mb-5">
          Construimos el ERP que<br/>Colombia necesitaba
        </h1>
        <p class="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
          Somos un equipo de ingenieros, contadores y diseñadores colombianos que decidió crear
          un ERP desde cero pensando en la realidad local: la DIAN, las NIIF y la velocidad que
          exige el mercado actual.
        </p>
      </div>
    </section>

    <!-- Values grid -->
    <section class="py-16 bg-white">
      <div class="max-w-5xl mx-auto px-6">
        <p class="text-xs font-bold text-[#AC8C49] uppercase tracking-widest text-center mb-10">Nuestros valores</p>
        <div class="grid sm:grid-cols-2 gap-6">
          <div
            v-for="v in values" :key="v.title"
            class="flex gap-5 p-6 rounded-2xl border border-gray-100 bg-gray-50/60 hover:border-[#AC8C49]/30 hover:bg-amber-50/40 transition-all"
          >
            <div class="w-11 h-11 rounded-xl bg-[#AC8C49]/10 flex items-center justify-center flex-shrink-0">
              <component :is="v.icon" class="w-5 h-5 text-[#AC8C49]" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 mb-1.5">{{ v.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ v.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="py-16 bg-gradient-to-b from-white to-amber-50/40">
      <div class="max-w-2xl mx-auto px-6">
        <p class="text-xs font-bold text-[#AC8C49] uppercase tracking-widest text-center mb-10">Nuestra historia</p>
        <div class="relative">
          <div class="absolute left-[52px] top-0 bottom-0 w-px bg-[#AC8C49]/15"></div>
          <div v-for="m in milestones" :key="m.year" class="flex gap-5 mb-8 last:mb-0">
            <div class="flex-shrink-0 w-[52px] flex flex-col items-center">
              <div class="w-9 h-9 rounded-full bg-[#AC8C49]/10 border border-[#AC8C49]/25 flex items-center justify-center z-10">
                <span class="text-[9px] font-black text-[#78694A]">{{ m.year }}</span>
              </div>
            </div>
            <div class="pt-1.5 pb-2">
              <p class="text-sm text-gray-700 leading-relaxed">{{ m.event }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="py-12 bg-white border-y border-gray-100">
      <div class="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="s in [
          { value: '340+', label: 'Empresas activas' },
          { value: '$2.1B', label: 'En facturas procesadas' },
          { value: '99.97%', label: 'Uptime garantizado' },
          { value: '< 2h', label: 'Tiempo de onboarding' },
        ]" :key="s.value">
          <p class="text-3xl font-extrabold text-gray-900 mb-1">{{ s.value }}</p>
          <p class="text-xs text-gray-400">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 text-center">
      <div class="max-w-xl mx-auto px-6">
        <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight mb-3">¿Listo para unirte?</h2>
        <p class="text-gray-500 text-sm mb-7">Configura tu empresa en menos de dos horas, sin tarjeta de crédito.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="emit('request-demo')"
            class="bg-[#AC8C49] hover:bg-[#78694A] text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all shadow-md shadow-[#AC8C49]/20"
          >
            Solicitar demo gratuita
          </button>
          <button
            @click="emit('login')"
            class="bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm px-7 py-3.5 rounded-xl border border-gray-200 transition-all"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </section>

    <!-- Footer mínimo -->
    <footer class="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
      <p>© 2026 Contex360. Todos los derechos reservados.</p>
      <div class="flex justify-center gap-4 mt-3">
        <button @click="emit('back')" class="hover:text-gray-600 transition-colors">Inicio</button>
        <span>·</span>
        <span>Bogotá, Colombia</span>
      </div>
    </footer>
  </div>
</template>
