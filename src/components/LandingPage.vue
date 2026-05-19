<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'request-demo'): void
  (e: 'show-privacy'): void
  (e: 'show-terms'): void
  (e: 'show-about'): void
  (e: 'show-pricing'): void
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
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" @click="emit('show-pricing')">Precios</a>
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
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
