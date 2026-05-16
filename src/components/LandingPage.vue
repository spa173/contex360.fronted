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
  <div class="min-h-screen bg-[#FFFFFF] text-[#09090B] font-['Inter']">
    <!-- Navigation -->
    <nav 
      class="flex justify-between items-center h-20 px-8 sticky top-0 z-40 transition-all duration-300"
      :class="scrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#F4F4F5] shadow-sm' : 'bg-transparent'"
    >
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-[#18181B] rounded-lg flex items-center justify-center text-white font-black text-lg">C</div>
        <span class="text-[20px] font-bold tracking-tight text-[#18181B]">Contex360</span>
      </div>
      
      <div class="hidden lg:flex items-center gap-10">
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" href="#producto">Platform</a>
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" href="#beneficios">Enterprise Solutions</a>
        <a class="text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-all cursor-pointer" href="#precios">Pricing</a>
      </div>

      <div class="flex items-center gap-4">
        <button 
          class="text-[13px] font-semibold text-[#18181B] px-5 py-2.5 rounded-lg hover:bg-[#F4F4F5] transition-all" 
          @click="emit('login')"
        >
          Sign In
        </button>
        <button 
          class="bg-[#18181B] text-[#FFFFFF] text-[13px] font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm"
          @click="emit('request-demo')"
        >
          Request Demo
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-24 pb-32 lg:pt-40 lg:pb-52 overflow-hidden border-b border-[#F4F4F5]">
      <div class="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
        <div class="z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 mb-8 text-[#71717A] font-medium text-[12px] bg-[#F4F4F5] rounded-full border border-[#E4E4E7]">
            <span class="w-2 h-2 rounded-full bg-[#18181B] animate-pulse"></span>
            Next-Gen Enterprise Resource Planning
          </div>
          <h1 class="text-[56px] lg:text-[72px] leading-[0.95] tracking-[-0.04em] font-bold text-[#18181B] mb-8">
            The logistical <br/>
            <span class="text-[#2563EB]">brain</span> of your <br/>
            business.
          </h1>
          <p class="text-[18px] leading-[1.6] text-[#71717A] mb-12 max-w-lg font-medium">
            A sophisticated, ultra-fast platform designed for Colombian corporations. Automate accounting, inventory, and billing with precision.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              class="bg-[#18181B] text-white text-[15px] font-bold px-10 py-4 rounded-xl shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
              @click="emit('request-demo')"
            >
              Start Free Trial
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button 
              class="bg-white border border-[#E4E4E7] text-[#18181B] text-[15px] font-bold px-10 py-4 rounded-xl hover:bg-[#FAFAFA] transition-all"
              @click="emit('show-about')"
            >
              View Capabilities
            </button>
          </div>
          <div class="mt-16 flex items-center gap-8 border-t border-[#F4F4F5] pt-8">
            <div class="flex flex-col">
              <span class="text-[20px] font-bold text-[#18181B]">500+</span>
              <span class="text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA]">Active Clients</span>
            </div>
            <div class="w-px h-8 bg-[#F4F4F5]"></div>
            <div class="flex flex-col">
              <span class="text-[20px] font-bold text-[#18181B]">DIAN</span>
              <span class="text-[11px] uppercase tracking-wider font-bold text-[#A1A1AA]">Certified Partner</span>
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-0 bg-[#F4F4F5] rounded-3xl translate-x-4 translate-y-4 -z-10 border border-[#E4E4E7]"></div>
          <div class="bg-white p-3 rounded-3xl border border-[#E4E4E7] shadow-2xl relative overflow-hidden group">
            <img 
              alt="Dashboard Contex360" 
              class="rounded-2xl w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDevAbrAx6NG9DC4ljVlLz6U4hQtD34h0rbeGnn7sBe9MDCDpYEpB12WaJ2cLbAoyd398F5r0V1Dz6JDX9FJNiyK-j6rvnkyqe5KFT13O5PUy1nliG-EeION4WvPzneGzXs3Y22ANd7Ou6lGtNQeysqaXBGsqthigNPEJo9xASXe8NBY_W5GwgplryWlmnwtwtRhpOmcd-Cqz38--JKokTS9-ADDLn4Ark4GAkmeQ7NsXtepFFRmxVQKJ6wy3jazfpnh23T8hvsUgq"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Bento Grid -->
    <section id="producto" class="py-32 bg-[#FAFAFA]">
      <div class="max-w-7xl mx-auto px-8">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div class="max-w-2xl text-left">
            <h2 class="text-[12px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">Core Infrastructure</h2>
            <h3 class="text-[40px] leading-[1.1] font-bold text-[#18181B]">Structured for corporate scale.</h3>
          </div>
          <p class="text-[16px] text-[#71717A] max-w-sm font-medium">
            A single source of truth for every operation, from multi-warehouse inventory to real-time financial reporting.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="bg-white p-10 rounded-3xl border border-[#E4E4E7] hover:shadow-xl transition-all group">
            <div class="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center text-[#18181B] mb-8 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span class="material-symbols-outlined" translate="no">verified_user</span>
            </div>
            <h4 class="text-[20px] font-bold text-[#18181B] mb-4">Bank-Grade Security</h4>
            <p class="text-[14px] leading-[1.6] text-[#71717A] font-medium">
              Enterprise-level encryption and automated cloud backups ensuring your financial data is always protected and available.
            </p>
          </div>
          <!-- Card 2 -->
          <div class="bg-white p-10 rounded-3xl border border-[#E4E4E7] hover:shadow-xl transition-all group">
            <div class="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center text-[#18181B] mb-8 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span class="material-symbols-outlined" translate="no">bolt</span>
            </div>
            <h4 class="text-[20px] font-bold text-[#18181B] mb-4">High-Velocity Engine</h4>
            <p class="text-[14px] leading-[1.6] text-[#71717A] font-medium">
              Real-time data processing for complex accounting reports and financial statements in seconds, not hours.
            </p>
          </div>
          <!-- Card 3 -->
          <div class="bg-white p-10 rounded-3xl border border-[#E4E4E7] hover:shadow-xl transition-all group">
            <div class="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center text-[#18181B] mb-8 group-hover:bg-[#18181B] group-hover:text-white transition-all">
              <span class="material-symbols-outlined" translate="no">apartment</span>
            </div>
            <h4 class="text-[20px] font-bold text-[#18181B] mb-4">Colombian Compliance</h4>
            <p class="text-[14px] leading-[1.6] text-[#71717A] font-medium">
              Fully adapted to DIAN regulations: Electronic billing, payroll, and integrated exogenous reporting.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-20 border-t border-[#F4F4F5] bg-white">
      <div class="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-[#18181B] rounded-md flex items-center justify-center text-white font-bold text-xs">C</div>
            <span class="text-[18px] font-bold text-[#18181B]">Contex360</span>
          </div>
          <p class="text-[12px] text-[#A1A1AA] font-medium max-w-[200px]">Advanced Administrative Systems for Colombian Enterprise.</p>
        </div>
        <div class="flex gap-12">
          <div class="flex flex-col gap-4">
            <span class="text-[12px] font-bold text-[#18181B] uppercase tracking-widest">Platform</span>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('show-about')">Features</a>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('request-demo')">Demo</a>
          </div>
          <div class="flex flex-col gap-4">
            <span class="text-[12px] font-bold text-[#18181B] uppercase tracking-widest">Legal</span>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('show-terms')">Terms</a>
            <a class="text-[12px] text-[#71717A] hover:text-[#18181B] cursor-pointer font-medium" @click="emit('show-privacy')">Privacy</a>
          </div>
        </div>
        <p class="text-[12px] text-[#A1A1AA] font-medium">© 2024 Contex360. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>

