<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'request-demo'): void
  (e: 'show-privacy'): void
  (e: 'show-terms'): void
  (e: 'show-about'): void
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
  <div class="min-h-screen bg-[#FFFFFF] text-[#0b1c30] selection:bg-[#e5eeff] selection:text-[#00174b] font-['Inter']">
    <!-- Top Navigation Bar -->
    <nav 
      class="flex justify-between items-center h-16 px-8 sticky top-0 z-40 transition-all duration-300 border-b"
      :class="scrolled ? 'bg-white/80 backdrop-blur-md border-[#E2E8F0] shadow-sm' : 'bg-[#f8f9ff] border-transparent'"
    >
      <div class="flex items-center gap-2">
        <span class="text-[20px] leading-[1.4] font-black text-[#000000]">Contex360</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <a class="text-[12px] leading-[1.2] font-[500] text-[#0b1c30] hover:text-[#0051d5] transition-all cursor-pointer" href="#producto">Producto</a>
        <a class="text-[12px] leading-[1.2] font-[500] text-[#0b1c30] hover:text-[#0051d5] transition-all cursor-pointer" href="#beneficios">Beneficios</a>
        <a class="text-[12px] leading-[1.2] font-[500] text-[#0b1c30] hover:text-[#0051d5] transition-all cursor-pointer" href="#precios">Precios</a>
      </div>
      <div class="flex items-center gap-4">
        <a 
          class="text-[12px] leading-[1.2] text-[#0051d5] font-bold px-4 py-2 hover:bg-[#eff4ff] rounded-lg transition-all cursor-pointer" 
          @click="emit('login')"
        >
          Iniciar sesión
        </a>
        <button 
          class="bg-[#000000] text-[#ffffff] text-[12px] leading-[1.2] px-6 py-2.5 rounded-lg hover:bg-opacity-90 transition-all font-bold"
          @click="emit('request-demo')"
        >
          Solicitar demo
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-[#FFFFFF] pt-20 pb-24 lg:pt-32 lg:pb-40">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div class="z-10 text-left">
          <span class="inline-block px-4 py-1.5 mb-6 text-[#0051d5] font-bold text-[12px] bg-[#dbe1ff] rounded-full">ERP de Próxima Generación</span>
          <h1 class="text-[48px] leading-[1.1] tracking-[-0.02em] font-[700] text-[#000000] mb-6">
            Construimos el ERP que <span class="text-[#0051d5]">Colombia</span> necesitaba.
          </h1>
          <p class="text-[16px] leading-[1.6] font-[400] text-[#45464d] mb-10 max-w-lg">
            Simplifica tu contabilidad, inventarios y facturación con la plataforma líder diseñada específicamente para el entorno empresarial colombiano. Potencia tu crecimiento hoy.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              class="bg-[#000000] text-[#ffffff] text-[16px] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              @click="emit('request-demo')"
            >
              Solicitar demo gratis
              <span class="material-symbols-outlined" translate="no">arrow_forward</span>
            </button>
            <button 
              class="border-2 border-[#E2E8F0] text-[#000000] text-[16px] px-8 py-4 rounded-xl font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-2"
              @click="emit('show-about')"
            >
              Ver funciones
            </button>
          </div>
          <div class="mt-12 flex items-center gap-6 opacity-60">
            <span class="text-[12px] font-[500] uppercase tracking-widest text-[#45464d]">Cumplimiento DIAN</span>
            <span class="text-[12px] font-[500] uppercase tracking-widest text-[#45464d]">Soporte Local</span>
            <span class="text-[12px] font-[500] uppercase tracking-widest text-[#45464d]">Cloud Nativo</span>
          </div>
        </div>
        <div class="relative">
          <div class="absolute inset-0 bg-[#0051d5]/5 rounded-3xl -rotate-3 scale-105"></div>
          <div class="relative bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-2xl">
            <img 
              alt="Dashboard Contex360" 
              class="rounded-2xl w-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDevAbrAx6NG9DC4ljVlLz6U4hQtD34h0rbeGnn7sBe9MDCDpYEpB12WaJ2cLbAoyd398F5r0V1Dz6JDX9FJNiyK-j6rvnkyqe5KFT13O5PUy1nliG-EeION4WvPzneGzXs3Y22ANd7Ou6lGtNQeysqaXBGsqthigNPEJo9xASXe8NBY_W5GwgplryWlmnwtwtRhpOmcd-Cqz38--JKokTS9-ADDLn4Ark4GAkmeQ7NsXtepFFRmxVQKJ6wy3jazfpnh23T8hvsUgq"
            />
          </div>
          <!-- Floating elements -->
          <div class="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-[#E2E8F0] hidden sm:block">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-[#047857]/10 flex items-center justify-center text-[#047857]">
                <span class="material-symbols-outlined" translate="no" style="font-variation-settings: 'FILL' 1;">check_circle</span>
              </div>
              <div class="text-left">
                <p class="text-[14px] font-bold text-[#000000]">Facturación OK</p>
                <p class="text-[12px] text-[#45464d]">Reporte DIAN enviado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Bento Grid -->
    <section id="beneficios" class="py-24 bg-[#f8f9ff]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-[32px] leading-[1.2] tracking-[-0.01em] font-[600] text-[#000000] mb-4">¿Por qué elegir Contex360?</h2>
          <p class="text-[16px] leading-[1.6] font-[400] text-[#45464d] max-w-2xl mx-auto">
            Diseñado para la agilidad empresarial, integrando cada proceso de tu negocio en una sola fuente de verdad.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Benefit 1: Security -->
          <div class="bg-[#FFFFFF] p-8 rounded-3xl border border-[#E2E8F0] hover:border-[#0051d5] transition-colors group text-left">
            <div class="w-14 h-14 bg-[#316bf3]/10 rounded-2xl flex items-center justify-center text-[#0051d5] mb-6 group-hover:bg-[#0051d5] group-hover:text-white transition-all">
              <span class="material-symbols-outlined text-3xl" translate="no">verified_user</span>
            </div>
            <h3 class="text-[20px] font-[600] text-[#000000] mb-3">Máxima Seguridad</h3>
            <p class="text-[14px] leading-[1.5] font-[400] text-[#45464d]">
              Encriptación de grado bancario y copias de seguridad automáticas en la nube para que tus datos financieros estén siempre protegidos.
            </p>
          </div>
          <!-- Benefit 2: Speed -->
          <div class="bg-[#FFFFFF] p-8 rounded-3xl border border-[#E2E8F0] hover:border-[#0051d5] transition-colors group text-left">
            <div class="w-14 h-14 bg-[#316bf3]/10 rounded-2xl flex items-center justify-center text-[#0051d5] mb-6 group-hover:bg-[#0051d5] group-hover:text-white transition-all">
              <span class="material-symbols-outlined text-3xl" translate="no">bolt</span>
            </div>
            <h3 class="text-[20px] font-[600] text-[#000000] mb-3">Velocidad Extrema</h3>
            <p class="text-[14px] leading-[1.5] font-[400] text-[#45464d]">
              Procesamiento de datos en tiempo real. Genera reportes contables complejos y estados financieros en segundos, no horas.
            </p>
          </div>
          <!-- Benefit 3: Made for Colombia -->
          <div class="bg-[#FFFFFF] p-8 rounded-3xl border border-[#E2E8F0] hover:border-[#0051d5] transition-colors group text-left">
            <div class="w-14 h-14 bg-[#316bf3]/10 rounded-2xl flex items-center justify-center text-[#0051d5] mb-6 group-hover:bg-[#0051d5] group-hover:text-white transition-all">
              <span class="material-symbols-outlined text-3xl" translate="no">apartment</span>
            </div>
            <h3 class="text-[20px] font-[600] text-[#000000] mb-3">Hecho para Colombia</h3>
            <p class="text-[14px] leading-[1.5] font-[400] text-[#45464d]">
              Totalmente adaptado a la normativa DIAN: Facturación electrónica, nómina electrónica y reportes de exógena integrados.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Visual Feature Section -->
    <section id="producto" class="py-24 bg-[#FFFFFF] overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row items-center gap-16">
          <div class="w-full lg:w-1/2 order-2 lg:order-1">
            <div class="relative">
              <img 
                alt="Equipo trabajando" 
                class="rounded-3xl shadow-2xl z-20 relative" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB96NWBjNN2oxiXMtjnNqWAOwGTPiKfVh0PI8Pl9S_IjEJ7vsuYDFLTVYRQtmDUUeSg8T3Sx5SEE8R0zSGvYS3A8QRjMrfUh5d6TJ06L2CQywnAFYG4UB71pIcc9dJzm6eI0GudCxgelSBAtkFASa3jqtatFoFF7UDbnYPGhX0jy46MbWGWJrdW2tu_ndal-kktkPk8gQRvQ_3loG_eQvbzF7hF-9lu943shhR9a7r5tMqhUWa4z_PsO9nWn7zFMlTqqFVus9smYQ7q"
              />
              <div class="absolute -top-10 -right-10 w-64 h-64 bg-[#0051d5]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
              <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-[#000000]/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            </div>
          </div>
          <div class="w-full lg:w-1/2 order-1 lg:order-2 text-left">
            <h2 class="text-[32px] leading-[1.2] font-[600] text-[#000000] mb-6">Administración sin complicaciones, resultados exponenciales.</h2>
            <ul class="space-y-6">
              <li class="flex gap-4">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg" translate="no">check</span>
                </div>
                <div>
                  <h4 class="text-[16px] font-bold text-[#000000]">Consolidación Multisede</h4>
                  <p class="text-[14px] text-[#45464d]">Gestiona múltiples sucursales y bodegas desde una sola cuenta maestra con inventario sincronizado.</p>
                </div>
              </li>
              <li class="flex gap-4">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg" translate="no">check</span>
                </div>
                <div>
                  <h4 class="text-[16px] font-bold text-[#000000]">Automatización Contable</h4>
                  <p class="text-[14px] text-[#45464d]">Reduce el error humano automatizando los asientos contables recurrentes y conciliaciones bancarias.</p>
                </div>
              </li>
              <li class="flex gap-4">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg" translate="no">check</span>
                </div>
                <div>
                  <h4 class="text-[16px] font-bold text-[#000000]">Inteligencia de Negocios</h4>
                  <p class="text-[14px] text-[#45464d]">Tableros de control con KPIs clave para tomar decisiones basadas en datos reales, no en suposiciones.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="precios" class="py-24 px-6">
      <div class="max-w-5xl mx-auto bg-[#131b2e] rounded-[2.5rem] p-12 lg:p-20 text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#0051d5] opacity-20 blur-[100px] rounded-full"></div>
        <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-[#000000] opacity-30 blur-[100px] rounded-full"></div>
        <div class="relative z-10">
          <h2 class="text-[32px] leading-[1.2] font-[600] text-[#ffffff] mb-8">¿Listo para transformar tu empresa?</h2>
          <p class="text-[16px] text-white/70 mb-12 max-w-2xl mx-auto">
            Únete a más de 500 empresas colombianas que ya optimizaron sus procesos con Contex360. Comienza tu demo gratuita hoy mismo.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              class="bg-white text-[#000000] text-[16px] px-10 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all"
              @click="emit('request-demo')"
            >
              Solicitar Demo Ahora
            </button>
            <button 
              class="border border-white/20 text-white text-[16px] px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
              @click="emit('show-about')"
            >
              Hablar con un experto
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Simple Footer -->
    <footer class="py-12 border-t border-[#E2E8F0] bg-[#f8f9ff]">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-2">
          <span class="text-[20px] font-black text-[#000000]">Contex360</span>
          <span class="text-[#45464d] text-[12px]">| ERP Administrativo</span>
        </div>
        <div class="flex gap-8">
          <a class="text-[12px] text-[#45464d] hover:text-[#0051d5] cursor-pointer" @click="emit('show-terms')">Términos</a>
          <a class="text-[12px] text-[#45464d] hover:text-[#0051d5] cursor-pointer" @click="emit('show-privacy')">Privacidad</a>
          <a class="text-[12px] text-[#45464d] hover:text-[#0051d5] cursor-pointer" @click="emit('show-about')">Contacto</a>
        </div>
        <p class="text-[12px] text-[#45464d]">© 2024 Contex360. Todos los derechos reservados. Colombia.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>

