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
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 font-sans antialiased">

    <!-- Navbar mínimo -->
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100/60 px-6 h-14 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
          <span class="text-white font-black text-xs">C</span>
        </div>
        <span class="font-bold text-gray-900 text-sm">Contex<span class="text-orange-500">360</span></span>
      </div>
      <button
        @click="emit('back')"
        class="text-sm text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1.5"
      >
        ← Volver al inicio
      </button>
    </header>

    <div class="max-w-xl mx-auto px-6 py-12">

      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 bg-orange-100 text-orange-600 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
          Sin compromiso · 30 días gratis
        </div>
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Solicita una Demo
        </h1>
        <p class="text-gray-500 text-base leading-relaxed">
          Descubre cómo Contex360 puede transformar la gestión financiera de tu empresa
        </p>
      </div>

      <!-- Success -->
      <div v-if="successMessage" class="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-6">
        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="font-semibold text-gray-900 mb-1">¡Solicitud enviada!</p>
        <p class="text-sm text-gray-500">{{ successMessage }}</p>
        <button @click="successMessage = ''" class="mt-4 text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
          Enviar otra solicitud →
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-600">
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form v-if="!successMessage" @submit.prevent="handleSubmit" class="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-orange-100/50 p-8 space-y-5">

        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">
            Nombre completo <span class="text-orange-500">*</span>
          </label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Tu nombre"
            required
            :disabled="isLoading"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">
            Empresa <span class="text-orange-500">*</span>
          </label>
          <input
            v-model="form.empresa"
            type="text"
            placeholder="Nombre de tu empresa"
            required
            :disabled="isLoading"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">
            Correo electrónico <span class="text-orange-500">*</span>
          </label>
          <input
            v-model="form.correo"
            type="email"
            placeholder="tu@empresa.com"
            required
            :disabled="isLoading"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-gray-700">NIT</label>
            <input
              v-model="form.nit"
              type="text"
              placeholder="900.123.456-1"
              :disabled="isLoading"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-gray-700">Teléfono</label>
            <input
              v-model="form.telefono"
              type="tel"
              placeholder="+57 300 123 4567"
              :disabled="isLoading"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-gray-700">Ciudad</label>
            <input
              v-model="form.ciudad"
              type="text"
              placeholder="Sogamoso"
              :disabled="isLoading"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-gray-700">Sector</label>
            <select
              v-model="form.sector"
              :disabled="isLoading"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 appearance-none"
            >
              <option value="">Sin especificar</option>
              <option value="comercio">Comercio</option>
              <option value="servicios">Servicios</option>
              <option value="manufactura">Manufactura</option>
              <option value="construccion">Construcción</option>
              <option value="salud">Salud</option>
              <option value="educacion">Educación</option>
              <option value="tecnologia">Tecnología</option>
              <option value="agropecuario">Agropecuario</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">Dirección</label>
          <input
            v-model="form.direccion"
            type="text"
            placeholder="Calle 11 #15-20, Sogamoso"
            :disabled="isLoading"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700">Mensaje / Necesidades</label>
          <textarea
            v-model="form.mensaje"
            rows="4"
            placeholder="Cuéntanos sobre tus necesidades..."
            :disabled="isLoading"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent focus:bg-white transition-all disabled:opacity-50 resize-none"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
        >
          {{ isLoading ? 'Enviando...' : 'Solicitar Demo gratis' }}
        </button>

        <p class="text-center text-xs text-gray-400">
          Al enviar aceptas nuestra <a href="#" class="text-orange-500 hover:underline">política de privacidad</a>
        </p>
      </form>

    </div>
  </div>
</template>
