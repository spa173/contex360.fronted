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
  <div class="bg-[#faf8ff] min-h-screen flex flex-col font-inter antialiased text-gray-900">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
          <span class="text-xl font-bold tracking-tight text-gray-900">Contex360</span>
        </div>
        <nav>
          <button
            @click="emit('back')"
            class="text-sm font-medium text-gray-600 hover:text-[#7c3aed] flex items-center gap-2 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            Volver al inicio
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <!-- Card Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-gray-900 mb-3">Solicita una Demo</h1>
          <p class="text-gray-500 text-sm sm:text-base">Empieza tu prueba gratuita de 30 días hoy mismo.</p>
        </div>

        <!-- Success State -->
        <div v-if="successMessage" class="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-emerald-600 text-4xl">check_circle</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">¡Solicitud Recibida!</h3>
          <p class="text-sm text-gray-500 mb-6">{{ successMessage }}</p>
          <button @click="successMessage = ''" class="text-[#7c3aed] font-semibold hover:underline">Enviar otra solicitud</button>
        </div>

        <!-- Error State -->
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
          {{ errorMessage }}
        </div>

        <!-- Demo Form -->
        <form v-if="!successMessage" @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1" for="fullName">Nombre completo *</label>
              <input
                v-model="form.nombre"
                required
                class="demo-input"
                id="fullName"
                placeholder="Ej. Juan Pérez"
                type="text"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1" for="company">Empresa *</label>
              <input
                v-model="form.empresa"
                required
                class="demo-input"
                id="company"
                placeholder="Nombre de tu empresa"
                type="text"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1" for="email">Correo electrónico *</label>
              <input
                v-model="form.correo"
                required
                class="demo-input"
                id="email"
                placeholder="tu@empresa.com"
                type="email"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1" for="phone">Teléfono</label>
              <input
                v-model="form.telefono"
                class="demo-input"
                id="phone"
                placeholder="+57 300 123 4567"
                type="tel"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1" for="city">Ciudad</label>
              <input
                v-model="form.ciudad"
                class="demo-input"
                id="city"
                placeholder="Ej. Bogotá"
                type="text"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1" for="sector">Sector</label>
              <select
                v-model="form.sector"
                class="demo-input text-gray-500"
                id="sector"
              >
                <option disabled value="">Selecciona un sector</option>
                <option value="tecnologia">Tecnología</option>
                <option value="salud">Salud</option>
                <option value="finanzas">Finanzas</option>
                <option value="retail">Retail</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-semibold text-gray-700 mb-1" for="message">Mensaje / Necesidades</label>
            <textarea
              v-model="form.mensaje"
              class="demo-input resize-none"
              id="message"
              placeholder="Cuéntanos sobre los retos financieros de tu empresa..."
              rows="4"
            ></textarea>
          </div>

          <div class="mt-8">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#7c3aed] hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-colors disabled:opacity-50"
            >
              {{ isLoading ? 'Enviando...' : 'Solicitar Demo Gratis' }}
            </button>
          </div>

          <div class="text-center mt-4">
            <p class="text-xs text-gray-500">
              Al enviar aceptas nuestra <a class="text-[#7c3aed] hover:underline" href="#">política de privacidad</a>.
            </p>
          </div>
        </form>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div class="text-xs text-gray-500">
          © 2026 Contex360. Todos los derechos reservados.
        </div>
        <div class="flex space-x-6 text-xs text-gray-500">
          <a class="hover:text-[#7c3aed] transition-colors" href="#">Términos y Condiciones</a>
          <a class="hover:text-[#7c3aed] transition-colors" href="#">Soporte</a>
          <a class="hover:text-[#7c3aed] transition-colors" href="#">Contacto</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
.demo-input {
  display: block;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.demo-input:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}
</style>
