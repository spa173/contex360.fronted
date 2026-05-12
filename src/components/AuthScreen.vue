<script setup>
import { ref, computed } from 'vue'
import { useStateStore } from '../stores/stateStore'

const store = useStateStore()

// State
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')

// Computed
const isFormValid = computed(() => {
  return email.value.includes('@') && password.value.length >= 6
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await store.loginWithBackend({ email: email.value, password: password.value })
    if (!result.ok) {
      errorMessage.value = result.message || 'Credenciales inválidas. Por favor, verifica tus datos.'
    }
  } catch (error) {
    errorMessage.value = error?.message || 'Error de conexión. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Panel Izquierdo - Branding Corporativo -->
    <div class="hidden lg:flex lg:w-[52%] bg-slate-900 relative">
      <!-- Fondo con gradiente sutil -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"></div>
      
      <!-- Patrón geométrico sutil -->
      <div class="absolute inset-0 opacity-[0.02]">
        <svg class="w-full h-full">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <!-- Contenido principal -->
      <div class="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
        
        <!-- Header con logo -->
        <div>
          <div class="flex items-center gap-4 mb-20">
            <div class="w-11 h-11 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <span class="text-white font-semibold text-lg">C</span>
            </div>
            <div>
              <h1 class="text-xl font-medium text-white tracking-tight">Contex360</h1>
              <p class="text-xs text-slate-400 tracking-wide uppercase">Sistema de Gestión Financiera</p>
            </div>
          </div>

          <!-- Headline principal -->
          <div class="max-w-md">
            <p class="text-cyan-400 text-sm font-medium tracking-wider uppercase mb-4">Plataforma ERP Empresarial</p>
            <h2 class="text-4xl xl:text-5xl font-light text-white leading-[1.15] mb-6">
              Transforma la gestión de tu empresa
            </h2>
            <p class="text-slate-400 text-lg leading-relaxed">
              Solución integral multi-tenant para contabilidad, facturación y análisis financiero en tiempo real.
            </p>
          </div>
        </div>

        <!-- Métricas de confianza -->
        <div class="space-y-10">
          <div class="grid grid-cols-3 gap-8">
            <div class="space-y-1">
              <div class="text-3xl font-light text-white">+500</div>
              <div class="text-sm text-slate-500">Empresas confían en nosotros</div>
            </div>
            <div class="space-y-1 border-l border-slate-700/50 pl-8">
              <div class="text-3xl font-light text-white">99.9%</div>
              <div class="text-sm text-slate-500">Tiempo de actividad</div>
            </div>
            <div class="space-y-1 border-l border-slate-700/50 pl-8">
              <div class="text-3xl font-light text-white">24/7</div>
              <div class="text-sm text-slate-500">Soporte dedicado</div>
            </div>
          </div>

          <!-- Características clave -->
          <div class="flex flex-wrap gap-3">
            <span class="px-4 py-2 bg-white/5 text-slate-300 text-sm rounded-lg border border-white/5">
              Facturación Electrónica
            </span>
            <span class="px-4 py-2 bg-white/5 text-slate-300 text-sm rounded-lg border border-white/5">
              Multi-empresa
            </span>
            <span class="px-4 py-2 bg-white/5 text-slate-300 text-sm rounded-lg border border-white/5">
              Reportes Avanzados
            </span>
            <span class="px-4 py-2 bg-white/5 text-slate-300 text-sm rounded-lg border border-white/5">
              API REST
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-500">&copy; 2024 Contex360</span>
          <div class="flex items-center gap-6 text-slate-500">
            <a href="#" class="hover:text-slate-300 transition-colors">Términos de Servicio</a>
            <a href="#" class="hover:text-slate-300 transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Derecho - Formulario -->
    <div class="flex-1 flex flex-col min-h-screen">
      
      <!-- Header superior -->
      <header class="flex items-center justify-between p-6 border-b border-gray-100">
        <!-- Logo mobile -->
        <div class="lg:hidden flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
            <span class="text-white font-semibold">C</span>
          </div>
          <span class="text-lg font-medium text-slate-900">Contex360</span>
        </div>
        <div class="hidden lg:block"></div>
        
        <!-- Link de ayuda -->
        <a href="#" class="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Ayuda
        </a>
      </header>

      <!-- Formulario centrado -->
      <main class="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-sm">
          
          <!-- Título del formulario -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-slate-900 mb-2">Iniciar sesión</h2>
            <p class="text-slate-500 text-sm">Accede a tu cuenta empresarial</p>
          </div>

          <!-- Mensaje de error -->
          <div 
            v-if="errorMessage" 
            class="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3"
          >
            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>

          <!-- Formulario -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="nombre@empresa.com"
                autocomplete="email"
                required
                class="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Ingresa tu contraseña"
                  autocomplete="current-password"
                  required
                  class="w-full px-4 py-3 pr-11 bg-white border border-gray-200 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  @click="togglePassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Options row -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0"
                />
                <span class="text-sm text-slate-600">Recordar dispositivo</span>
              </label>
              <a href="#" class="text-sm text-slate-900 font-medium hover:underline">
                Recuperar acceso
              </a>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="w-full py-3 px-4 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ isLoading ? 'Verificando...' : 'Continuar' }}
            </button>
          </form>

          <!-- Separador -->
          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-3 bg-gray-50 text-xs text-slate-400 uppercase tracking-wider">o bien</span>
            </div>
          </div>

          <!-- SSO Options -->
          <div class="space-y-3">
            <button
              type="button"
              class="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>
            <button
              type="button"
              class="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                <path fill="#FFB900" d="M13 13h10v10H13z"/>
              </svg>
              Continuar con Microsoft
            </button>
          </div>

          <!-- Certificaciones -->
          <div class="mt-10 pt-6 border-t border-gray-100">
            <div class="flex items-center justify-center gap-8">
              <div class="flex items-center gap-1.5 text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span class="text-xs">SSL</span>
              </div>
              <div class="flex items-center gap-1.5 text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span class="text-xs">AES-256</span>
              </div>
              <div class="flex items-center gap-1.5 text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <span class="text-xs">ISO 27001</span>
              </div>
              <div class="flex items-center gap-1.5 text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <span class="text-xs">SOC 2</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer mobile -->
      <footer class="lg:hidden p-6 border-t border-gray-100 text-center">
        <p class="text-xs text-slate-400">&copy; 2024 Contex360. Todos los derechos reservados.</p>
      </footer>
    </div>
  </div>
</template>
