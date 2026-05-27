<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: 'Sobre Nosotros',
  meta: [
    { name: 'description', content: 'Conoce más sobre Contex360 y nuestro equipo.' },
    { property: 'og:title', content: 'Sobre Nosotros' },
    { property: 'og:description', content: 'Conoce más sobre Contex360 y nuestro equipo.' },
    { name: 'twitter:title', content: 'Sobre Nosotros' },
    { name: 'twitter:description', content: 'Conoce más sobre Contex360 y nuestro equipo.' },
  ]
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'request-demo'): void
  (e: 'login'): void
}>()

const values = [
  { icon: 'verified_user', title: 'Seguridad primero', desc: 'Certificados DIAN, cifrado AES-256 y cumplimiento total con la Ley 1581 de protección de datos de Colombia.' },
  { icon: 'bolt',          title: 'Velocidad real',     desc: 'Onboarding en menos de 2 horas. Facturas en segundos. Reportes instantáneos. Sin esperas.' },
  { icon: 'public',        title: 'Hecho para Colombia',desc: 'Diseñado desde cero para la normativa colombiana: DIAN, NIIF, retenciones y reportes exógenos.' },
  { icon: 'groups',        title: 'Equipo humano',      desc: 'Soporte en español con tiempos de respuesta menores a 1 hora. Un equipo que conoce tu industria.' },
]

const milestones = [
  { year: '2022', event: 'Fundación de Contex360 en Bogotá.' },
  { year: '2023', event: 'Primera certificación como proveedor tecnológico DIAN.' },
  { year: '2024', event: 'Superamos las 200 empresas activas y $1B en facturas procesadas.' },
  { year: '2025', event: 'Lanzamiento de módulo de IA para analítica financiera predictiva.' },
  { year: '2026', event: '+340 empresas. $2.1B en facturas. 99.97% uptime.' },
]

const stats = [
  { value: '340+',   label: 'Empresas activas' },
  { value: '$2.1B',  label: 'En facturas procesadas' },
  { value: '99.97%', label: 'Uptime garantizado' },
  { value: '< 2h',   label: 'Tiempo de onboarding' },
]
</script>

<template>
  <div class="min-h-screen bg-white text-[#18181B] font-['Inter'] relative overflow-x-hidden">
    <!-- Subtle blue radial accent -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    ></div>

    <!-- Nav -->
    <header class="relative sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F4F4F5]">
      <div class="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          @click="emit('back')"
          class="flex items-center gap-2 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </button>

        <div class="flex items-center gap-2.5">
          <svg class="c360-mark flex-shrink-0" width="28" height="28" viewBox="0 0 56 56" aria-hidden="true">
            <rect width="56" height="56" rx="12" fill="#18181B"/>
            <g class="rotor">
              <path d="M44 18 A 16 16 0 1 0 44 38" stroke="#fff" stroke-width="5.5" stroke-linecap="round" fill="none"/>
              <path d="M44 18 A 16 16 0 0 1 44 38" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            </g>
          </svg>
          <span class="text-[16px] font-bold tracking-tight text-[#18181B]">Contex360</span>
        </div>

        <button
          @click="emit('login')"
          class="text-[13px] font-semibold text-[#18181B] px-3.5 py-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
        >
          Iniciar sesión
        </button>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative py-20 lg:py-28">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 mb-7 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
          <span class="material-symbols-outlined text-[14px]">domain</span>
          Empresa colombiana · Bogotá D.C.
        </div>
        <h1
          class="text-[44px] lg:text-[60px] leading-[1.02] tracking-[-0.035em] font-bold text-[#18181B] mb-6"
          style="text-wrap: balance;"
        >
          Construimos el ERP que <em class="not-italic text-[#2563EB]">Colombia</em> necesitaba.
        </h1>
        <p class="text-[17px] leading-[1.55] text-[#71717A] max-w-2xl mx-auto font-medium">
          Somos un equipo de ingenieros, contadores y diseñadores colombianos que decidió crear un ERP desde cero pensando en la realidad local: la DIAN, las NIIF y la velocidad que exige el mercado actual.
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="py-16 lg:py-20 bg-white border-t border-[#F4F4F5]">
      <div class="max-w-5xl mx-auto px-6 lg:px-8">
        <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-3 text-center">Nuestros valores</p>
        <h2 class="text-[32px] lg:text-[40px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-12 text-center" style="text-wrap: balance;">
          Cuatro principios que guían cada decisión.
        </h2>

        <div class="grid sm:grid-cols-2 gap-5">
          <div
            v-for="v in values"
            :key="v.title"
            class="flex gap-5 p-7 rounded-[18px] border border-[#E4E4E7] bg-white hover:shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)] transition-all group"
          >
            <div class="w-11 h-11 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white transition-all flex-shrink-0">
              <span class="material-symbols-outlined text-[20px]">{{ v.icon }}</span>
            </div>
            <div>
              <h3 class="text-[15px] font-bold text-[#18181B] tracking-tight mb-1.5">{{ v.title }}</h3>
              <p class="text-[13px] text-[#71717A] leading-[1.55] font-medium">{{ v.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="py-16 lg:py-20 bg-[#FAFAFA] border-y border-[#F4F4F5]">
      <div class="max-w-2xl mx-auto px-6 lg:px-8">
        <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-3 text-center">Nuestra historia</p>
        <h2 class="text-[32px] lg:text-[40px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-12 text-center" style="text-wrap: balance;">
          Cinco años construyendo el back-office colombiano.
        </h2>

        <div class="relative">
          <div class="absolute left-[27px] top-2 bottom-2 w-px bg-[#E4E4E7]"></div>
          <div v-for="m in milestones" :key="m.year" class="flex gap-5 mb-7 last:mb-0">
            <div class="flex-shrink-0 w-[55px] flex justify-start">
              <div class="w-[55px] h-[55px] rounded-full bg-white border border-[#E4E4E7] flex items-center justify-center z-10 shadow-sm">
                <span class="text-[11px] font-bold text-[#18181B] tracking-tight">{{ m.year }}</span>
              </div>
            </div>
            <div class="pt-4">
              <p class="text-[14px] text-[#18181B] leading-[1.55] font-medium">{{ m.event }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-14 lg:py-16 bg-white">
      <div class="max-w-5xl mx-auto px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div v-for="s in stats" :key="s.value" class="border-t border-[#E4E4E7] pt-4">
          <p class="text-[28px] lg:text-[32px] font-bold text-[#18181B] tracking-[-0.025em] mb-1">{{ s.value }}</p>
          <p class="text-[11px] uppercase tracking-wider font-semibold text-[#A1A1AA]">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 lg:py-24 border-t border-[#F4F4F5]">
      <div class="max-w-xl mx-auto px-6 lg:px-8 text-center">
        <h2 class="text-[32px] lg:text-[40px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-4" style="text-wrap: balance;">
          ¿Listo para <em class="not-italic text-[#2563EB]">unirte</em>?
        </h2>
        <p class="text-[16px] text-[#71717A] mb-9 font-medium">
          Configura tu empresa en menos de dos horas, sin tarjeta de crédito.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="emit('request-demo')"
            class="bg-[#18181B] text-white text-[14px] font-semibold px-7 py-3.5 rounded-[10px] shadow-lg shadow-black/5 hover:bg-[#27272A] transition-all flex items-center justify-center gap-2.5"
          >
            Solicitar demo gratuita
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button
            @click="emit('login')"
            class="bg-white border border-[#E4E4E7] text-[#18181B] text-[14px] font-semibold px-7 py-3.5 rounded-[10px] hover:bg-[#FAFAFA] transition-all"
          >
            Ya tengo cuenta
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-[#F4F4F5] py-8 text-center">
      <p class="text-[12px] text-[#A1A1AA] font-medium">© 2026 Contex360. Todos los derechos reservados.</p>
      <div class="flex justify-center gap-3 mt-2 text-[12px] text-[#A1A1AA]">
        <button @click="emit('back')" class="hover:text-[#18181B] transition-colors font-medium">Inicio</button>
        <span>·</span>
        <span class="font-medium">Bogotá, Colombia</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
