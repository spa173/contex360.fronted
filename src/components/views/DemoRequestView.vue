<script setup lang="ts">
import { ref } from 'vue'
import { businessApi } from '../../services/businessApi'

const emit = defineEmits(['back'])

const form = ref({
  nombre: '',
  empresa: '',
  correo: '',
  telefono: '',
  mensaje: '',
  nit: '',
  ciudad: '',
  direccion: '',
  sector: '',
})

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  if (!form.value.nombre || !form.value.empresa || !form.value.correo) {
    errorMessage.value = 'Por favor completa los campos obligatorios.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await businessApi.createDemoRequest(form.value)
    successMessage.value = response.message || 'Solicitud enviada correctamente. Nuestro equipo te contactará pronto.'
    form.value = { nombre: '', empresa: '', correo: '', telefono: '', mensaje: '', nit: '', ciudad: '', direccion: '', sector: '' }
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al enviar la solicitud. Intenta nuevamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white text-[#18181B] font-['Inter'] flex flex-col relative overflow-hidden">
    <!-- Subtle blue radial accent -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    ></div>

    <!-- Header -->
    <header class="relative h-20 px-6 lg:px-8 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-transparent">
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
      <button
        @click="emit('back')"
        class="flex items-center gap-2 text-[#71717A] hover:text-[#18181B] transition-colors text-[13px] font-semibold"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver al inicio
      </button>
    </header>

    <!-- Main -->
    <main class="relative flex-grow flex items-center justify-center py-12 px-6 lg:px-8">
      <div class="max-w-7xl w-full grid lg:grid-cols-[1fr_540px] gap-14 lg:gap-20 items-center">

        <!-- LEFT: value prop -->
        <div class="space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <div class="space-y-6 max-w-[560px]">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
              <span class="material-symbols-outlined text-[14px]">workspace_premium</span>
              Soluciones Enterprise
            </div>
            <h1 class="text-[44px] lg:text-[56px] leading-[1.02] tracking-[-0.03em] font-bold text-[#18181B]" style="text-wrap: balance;">
              Experimente el futuro de la <em class="not-italic text-[#2563EB]">gestión logística</em>.
            </h1>
            <p class="text-[17px] leading-[1.55] text-[#71717A] font-medium">
              Descubra cómo nuestra arquitectura multi-empresa e inteligencia artificial transforman operaciones complejas en flujos de trabajo fluidos.
            </p>
          </div>

          <!-- Pillars (V2 system) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-7 max-w-[520px]">
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Facturación con IA</b>
              <span class="text-[13px] text-[#71717A] leading-[1.45]">Automatice el ciclo de ingresos y minimice errores en segundos.</span>
            </div>
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Multi-Tenant</b>
              <span class="text-[13px] text-[#71717A] leading-[1.45]">Administre múltiples empresas desde un único panel centralizado.</span>
            </div>
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Seguridad Corporativa</b>
              <span class="text-[13px] text-[#71717A] leading-[1.45]">Infraestructura blindada que cumple estándares globales.</span>
            </div>
            <div class="border-t border-[#E4E4E7] pt-3.5">
              <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Cumplimiento DIAN</b>
              <span class="text-[13px] text-[#71717A] leading-[1.45]">Facturación electrónica, nómina y exógena integrados.</span>
            </div>
          </div>

          <!-- Trust chips -->
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
              <span class="material-symbols-outlined text-[14px]">lock</span>
              SSL/TLS 1.3
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
              <span class="material-symbols-outlined text-[14px]">hub</span>
              Multi-Tenant Enterprise
            </span>
          </div>
        </div>

        <!-- RIGHT: form -->
        <div class="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <!-- Success overlay -->
          <div
            v-if="successMessage"
            class="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8 rounded-[18px] animate-in fade-in zoom-in duration-300"
          >
            <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
              <span class="material-symbols-outlined text-emerald-600 text-[36px]">check_circle</span>
            </div>
            <h3 class="text-[22px] font-bold text-[#18181B] mb-2 tracking-tight">¡Solicitud Enviada!</h3>
            <p class="text-[14px] text-[#71717A] mb-7 font-medium max-w-sm">{{ successMessage }}</p>
            <button @click="successMessage = ''" class="text-[#2563EB] font-semibold text-[14px] hover:underline">
              Enviar otra consulta
            </button>
          </div>

          <div class="bg-white rounded-[18px] border border-[#E4E4E7] p-8 lg:p-9 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)]">
            <h2 class="text-[22px] font-bold tracking-[-0.02em] text-[#18181B] mb-1">Agendar una demostración</h2>
            <p class="text-[13px] text-[#71717A] mb-7">Un experto lo contactará en menos de 24 horas laborables.</p>

            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="nombre">Nombre Completo *</label>
                  <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                    <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">person</span>
                    <input
                      id="nombre"
                      name="nombre"
                      autocomplete="name"
                      v-model="form.nombre"
                      required
                      placeholder="Carlos Mendoza"
                      class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="empresa">Empresa / Cargo *</label>
                  <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                    <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">apartment</span>
                    <input
                      id="empresa"
                      name="empresa"
                      autocomplete="organization"
                      v-model="form.empresa"
                      required
                      placeholder="Logística S.A."
                      class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="correo">Correo Corporativo *</label>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">mail</span>
                  <input
                    id="correo"
                    name="correo"
                    autocomplete="email"
                    v-model="form.correo"
                    required
                    type="email"
                    placeholder="ejecutivo@empresa.com"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-5">
                <div>
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="telefono">Teléfono</label>
                  <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                    <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">call</span>
                    <input
                      id="telefono"
                      name="telefono"
                      autocomplete="tel"
                      v-model="form.telefono"
                      placeholder="+57 300..."
                      class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                    />
                  </div>
                </div>
                <div>
                  <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="sector">Sector</label>
                  <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                    <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">category</span>
                    <select
                      id="sector"
                      name="sector"
                      autocomplete="off"
                      v-model="form.sector"
                      class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] appearance-none cursor-pointer border-0"
                    >
                      <option value="">Seleccione...</option>
                      <option value="logistics">Logística & Transporte</option>
                      <option value="retail">Comercio / Retail</option>
                      <option value="fintech">Finanzas & Fintech</option>
                      <option value="other">Otro sector</option>
                    </select>
                    <span class="material-symbols-outlined text-[18px] text-[#A1A1AA] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="mensaje">¿Cómo podemos ayudarle?</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  autocomplete="off"
                  v-model="form.mensaje"
                  rows="3"
                  placeholder="Cuéntenos sus retos operativos..."
                  class="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-[10px] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] transition-all text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] resize-none"
                ></textarea>
              </div>

              <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-[10px]">
                {{ errorMessage }}
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full py-3.5 bg-[#18181B] text-white font-semibold text-[15px] rounded-[10px] hover:bg-[#27272A] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 shadow-lg shadow-black/5"
              >
                <span v-if="isLoading" class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                <span>{{ isLoading ? 'Procesando...' : 'Solicitar Acceso a Demo' }}</span>
                <span v-if="!isLoading" class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <p class="text-center text-[12px] text-[#71717A] font-medium">
                Sin compromiso, sin tarjeta de crédito.
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

input:not([type="checkbox"]), select, textarea {
  color: #18181B !important;
  background-color: transparent !important;
}
input::placeholder, textarea::placeholder {
  color: #A1A1AA !important;
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #18181B !important;
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s !important;
}
</style>
