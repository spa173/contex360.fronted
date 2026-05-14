<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { 
  CheckCircle2, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Globe,
  Cpu
} from 'lucide-vue-next'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const requiresTotp = ref(false)
const totpCode = ref('')
const requiresPasswordChange = ref(false)
const newPassword = ref('')
const newPasswordConfirm = ref('')
const changePasswordLoading = ref(false)

const isFormValid = computed(() => email.value.includes('@') && password.value.length >= 6)

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const credentials = { 
      email: email.value, 
      password: password.value, 
      totpCode: requiresTotp.value ? totpCode.value : undefined 
    }

    const result = await authStore.loginWithBackend(credentials)

    if (result?.requiresTotp) {
      requiresTotp.value = true
      return
    }

    if (result?.requiresPasswordChange) {
      requiresPasswordChange.value = true
      return
    }

    if (!result.ok) {
      errorMessage.value = result.message || 'Error al iniciar sesión. Verifica tus datos.'
      return
    }

    statusMessage.value = 'Sesión iniciada con éxito.'
  } catch (error) {
    errorMessage.value = error?.message || 'Ocurrió un error inesperado.'
  } finally {
    isLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="flex h-screen w-full bg-[#0B0F1A] overflow-hidden">
    <!-- LADO IZQUIERDO: PANEL INFO (SOLO LG+) -->
    <div class="auth-left hidden lg:flex lg:w-1/2 flex-col justify-between p-20">
      <header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center font-bold text-white text-xl border border-slate-700">C</div>
          <div class="flex flex-col">
            <span class="text-white font-extrabold text-xl leading-none">Contex360</span>
            <span class="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Enterprise ERP Solution</span>
          </div>
        </div>
      </header>

      <main>
        <span class="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em] mb-4 block">Plataforma de Nueva Generación</span>
        <h1 class="text-6xl font-extrabold text-white leading-[1.1] mb-8 tracking-tighter">
          Plataforma Integral de <br/>
          <span class="text-slate-400">Gestión Empresarial</span>
        </h1>
        
        <p class="text-slate-400 text-lg max-w-md leading-relaxed mb-12">
          Control total sobre tus finanzas, inventarios y cumplimiento tributario en una sola suite centralizada.
        </p>

        <div class="flex gap-12 mb-12">
          <div class="flex flex-col">
            <span class="text-3xl font-bold text-white">+500</span>
            <span class="text-slate-500 text-xs uppercase mt-1">Empresas</span>
          </div>
          <div class="flex flex-col">
            <span class="text-3xl font-bold text-white">99.9%</span>
            <span class="text-slate-500 text-xs uppercase mt-1">Uptime</span>
          </div>
          <div class="flex flex-col">
            <span class="text-3xl font-bold text-white">24/7</span>
            <span class="text-slate-500 text-xs uppercase mt-1">Soporte</span>
          </div>
        </div>

        <ul class="space-y-4">
          <li v-for="feat in ['Multi-tenant con aislamiento total', 'Facturación electrónica DIAN', 'Reportes financieros en tiempo real', 'Seguridad grado bancario AES-256']" :key="feat" class="flex items-center gap-3 text-slate-300">
            <CheckCircle2 class="w-5 h-5 text-emerald-500" />
            <span class="font-medium">{{ feat }}</span>
          </li>
        </ul>
      </main>

      <footer>
        <p class="text-slate-600 text-sm">© 2026 Contex360 · Sistema de Gestión Financiera</p>
      </footer>
    </div>

    <!-- LADO DERECHO: FORMULARIO -->
    <div class="auth-right w-full lg:w-1/2 flex flex-col items-center justify-center bg-white p-8">
      <!-- Top Help (Referencia) -->
      <div class="absolute top-8 right-8 hidden lg:flex items-center gap-2 text-sm text-slate-500">
        ¿Necesitas ayuda? <a href="#" class="text-slate-900 font-bold hover:underline">Contactar soporte</a>
      </div>

      <div class="max-w-[400px] w-full">
        <header class="mb-10">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h2>
          <p class="text-slate-500">Ingresa tus credenciales para acceder al sistema</p>
        </header>

        <!-- Social Login -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <button class="border border-slate-200 rounded-lg p-3 text-sm flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-4 h-4" alt="Google" />
            Google
          </button>
          <button class="border border-slate-200 rounded-lg p-3 text-sm flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" class="w-4 h-4" alt="Microsoft" />
            Microsoft
          </button>
        </div>

        <div class="relative mb-8 text-center">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-100"></div>
          </div>
          <span class="relative bg-white px-4 text-xs text-slate-400 uppercase tracking-widest">o continúa con</span>
        </div>

        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="flex flex-col">
            <label class="text-sm font-medium text-slate-700">Correo electrónico</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="nombre@empresa.com" 
              class="border border-slate-200 rounded-lg p-4 w-full mt-1 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div class="flex flex-col">
            <div class="flex justify-between items-center">
              <label class="text-sm font-medium text-slate-700">Contraseña</label>
              <a href="#" class="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="relative mt-1">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                class="border border-slate-200 rounded-lg p-4 w-full focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                required
              />
              <button type="button" @click="togglePassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                <span v-if="!showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
          </div>

          <div v-if="requiresTotp" class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label class="text-xs font-bold text-slate-900 uppercase tracking-widest">Código 2FA</label>
            <input 
              v-model="totpCode" 
              type="text" 
              maxlength="6" 
              placeholder="000000" 
              class="w-full h-12 bg-white border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none focus:border-slate-900"
            />
          </div>

          <div class="flex items-center gap-2">
            <input v-model="rememberMe" type="checkbox" id="rem" class="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
            <label for="rem" class="text-sm text-slate-600 cursor-pointer">Recordar este dispositivo</label>
          </div>

          <button 
            type="submit" 
            class="w-full bg-[#1e293b] text-white p-4 rounded-lg font-semibold mt-6 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}
            <ArrowRight v-if="!isLoading" class="w-4 h-4" />
          </button>
        </form>

        <footer class="mt-8 text-center text-sm text-slate-500">
          ¿No tienes una cuenta? <a href="#" @click.prevent="$emit('request-demo')" class="text-slate-900 font-bold hover:underline">Solicita una demo</a>
          
          <div class="mt-12 pt-8 border-t border-slate-50 flex justify-center gap-6 opacity-40">
            <div class="flex items-center gap-1"><ShieldCheck class="w-4 h-4" /> <span class="text-[10px] font-bold">ISO 27001</span></div>
            <div class="flex items-center gap-1"><Lock class="w-4 h-4" /> <span class="text-[10px] font-bold">SOC 2</span></div>
            <div class="flex items-center gap-1"><Globe class="w-4 h-4" /> <span class="text-[10px] font-bold">Enterprise</span></div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BLINDAJE DE ESTILOS: FORZANDO EL ESTADO VISUAL */
.auth-left {
  background-color: #0B0F1A !important;
}

.auth-right {
  background-color: #ffffff !important;
}

h1, h2, h3, p, label, input, button, span, a {
  font-family: 'Inter', sans-serif !important;
}

input {
  color: #1e293b !important;
}

label {
  color: #475569 !important;
}

/* Chrome autofill fix */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus, 
input:-webkit-autofill:active  {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  -webkit-text-fill-color: #1e293b !important;
}
</style>
