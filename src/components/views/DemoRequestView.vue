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
  <div class="bg-[#f8f9ff] min-h-screen flex flex-col font-inter antialiased">
    <!-- Top Navigation Bar -->
    <header class="flex justify-between items-center px-4 md:px-8 py-4 w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xl">C</span>
        </div>
        <span class="text-xl font-bold text-[#0b1c30]">Contex360</span>
      </div>
      <button 
        @click="emit('back')"
        class="flex items-center gap-1 text-[#45464d] hover:text-[#0051d5] transition-colors text-sm font-medium"
      >
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Volver al inicio
      </button>
    </header>

    <main class="flex-grow flex items-center justify-center py-12 px-4">
      <div class="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <!-- Left Side: Value Proposition -->
        <div class="hidden lg:flex flex-col space-y-8 px-8">
          <div class="inline-flex items-center px-4 py-2 bg-[#047857]/10 text-[#047857] rounded-full w-fit">
            <span class="text-xs font-bold tracking-wider uppercase">SIN COMPROMISO · 30 DÍAS GRATIS</span>
          </div>
          <h1 class="text-5xl font-bold text-[#0b1c30] leading-tight">Transforma tu gestión financiera hoy.</h1>
          <p class="text-lg text-[#45464d] max-w-md leading-relaxed">
            Descubre cómo Contex360 ayuda a las empresas colombianas a automatizar su contabilidad, inventarios y reportes DIAN con precisión absoluta.
          </p>

          <!-- Trust Elements -->
          <div class="grid grid-cols-2 gap-6 pt-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-[#eff4ff] rounded-lg">
                <span class="material-symbols-outlined text-[#047857]">verified</span>
              </div>
              <div>
                <p class="text-sm font-bold text-[#0b1c30]">Certificado DIAN</p>
                <p class="text-xs text-[#45464d]">Facturación legal</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-[#eff4ff] rounded-lg">
                <span class="material-symbols-outlined text-[#0051d5]">security</span>
              </div>
              <div>
                <p class="text-sm font-bold text-[#0b1c30]">SSL Secure</p>
                <p class="text-xs text-[#45464d]">Datos cifrados</p>
              </div>
            </div>
          </div>

          <!-- Feature Image -->
          <div class="rounded-xl overflow-hidden shadow-xl border border-[#E2E8F0] bg-white mt-8 aspect-video relative group">
            <img 
              alt="Financial Dashboard" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqfZr0JHjO-f7LwnQxT6OdSKk5JoIMgm1Zc2JtdCwqHZLm51bxSoI96hP6bxw3Bqqs22FyKsjltV9Mq82Gxu_x1Of4PQbSuh_qORDyGYA807PCg-u3FT9gq-6ROtbkoRVxt_F9jYVZ6RScARb-fTkTGWQ8aS8NpRIkjCwIx2PlvxDBQOBV-1sMtKG-Zkc3oQ9oAzJ-iNo4A20RqWiZivC01Q_QtHqn9VzKagu7e7WXmCeAdlN_e28D74snTLvaxxpSuciloDooucEf"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/40 to-transparent"></div>
          </div>
        </div>

        <!-- Right Side: Form Card -->
        <div class="w-full max-w-2xl mx-auto">
          <div class="bg-white rounded-xl border border-[#E2E8F0] p-8 lg:p-12 shadow-sm">
            
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-[#0b1c30] mb-2">Solicita una Demo</h2>
              <p class="text-sm text-[#45464d]">Empieza tu prueba gratuita de 30 días hoy mismo.</p>
            </div>

            <!-- Success State -->
            <div v-if="successMessage" class="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center animate-in zoom-in-95 duration-300">
              <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
              </div>
              <h3 class="text-lg font-bold text-[#0b1c30] mb-2">¡Solicitud Recibida!</h3>
              <p class="text-sm text-[#45464d] mb-6">{{ successMessage }}</p>
              <button @click="successMessage = ''" class="text-[#0051d5] font-semibold hover:underline">Enviar otra solicitud</button>
            </div>

            <!-- Error State -->
            <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
              {{ errorMessage }}
            </div>

            <!-- Form -->
            <form v-if="!successMessage" @submit.prevent="handleSubmit" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-[#0b1c30]" for="name">Nombre completo *</label>
                  <input 
                    v-model="form.nombre"
                    required
                    class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all" 
                    id="name" 
                    placeholder="Tu nombre" 
                    type="text"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-[#0b1c30]" for="company">Empresa *</label>
                  <input 
                    v-model="form.empresa"
                    required
                    class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all" 
                    id="company" 
                    placeholder="Nombre de tu empresa" 
                    type="text"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-[#0b1c30]" for="email">Correo electrónico *</label>
                  <input 
                    v-model="form.correo"
                    required
                    class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all" 
                    id="email" 
                    placeholder="tu@empresa.com" 
                    type="email"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-[#0b1c30]" for="phone">Teléfono</label>
                  <input 
                    v-model="form.telefono"
                    class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all" 
                    id="phone" 
                    placeholder="+57 300 123 4567" 
                    type="tel"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-[#0b1c30]" for="city">Ciudad</label>
                  <input 
                    v-model="form.ciudad"
                    class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all" 
                    id="city" 
                    placeholder="Ej. Bogotá" 
                    type="text"
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-[#0b1c30]" for="sector">Sector</label>
                  <select 
                    v-model="form.sector"
                    class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all appearance-none" 
                    id="sector"
                  >
                    <option value="">Selecciona un sector</option>
                    <option value="retail">Comercio / Retail</option>
                    <option value="services">Servicios</option>
                    <option value="manufacturing">Manufactura</option>
                    <option value="finance">Financiero</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-[#0b1c30]" for="message">Mensaje / Necesidades</label>
                <textarea 
                  v-model="form.mensaje"
                  class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 outline-none transition-all resize-none" 
                  id="message" 
                  placeholder="Cuéntanos sobre los retos financieros de tu empresa..." 
                  rows="4"
                ></textarea>
              </div>

              <button 
                type="submit"
                :disabled="isLoading"
                class="w-full bg-[#047857] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#00513a] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {{ isLoading ? 'Enviando...' : 'Solicitar Demo Gratis' }}
              </button>

              <div class="text-center">
                <p class="text-[10px] text-[#45464d]">
                  Al enviar aceptas nuestra <a class="text-[#0051d5] hover:underline" href="#">política de privacidad</a>
                </p>
              </div>
            </form>
          </div>

          <!-- Secondary Desktop Trust Footer -->
          <div class="mt-6 flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">verified_user</span>
              <span class="text-xs font-bold">100% Seguro</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">cloud_done</span>
              <span class="text-xs font-bold">Cloud Based</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="w-full bg-white py-6 px-4 md:px-8 border-t border-[#E2E8F0]">
      <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-[10px] text-[#45464d]">
          © 2026 Contex360. Todos los derechos reservados.
        </p>
        <div class="flex gap-8">
          <a class="text-[10px] text-[#45464d] hover:text-[#0051d5]" href="#">Términos y Condiciones</a>
          <a class="text-[10px] text-[#45464d] hover:text-[#0051d5]" href="#">Soporte</a>
          <a class="text-[10px] text-[#45464d] hover:text-[#0051d5]" href="#">Contacto</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>iv>
  </div>
</template>
