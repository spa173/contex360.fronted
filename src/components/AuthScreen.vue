<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const emit = defineEmits(['request-demo', 'show-terms', 'show-privacy'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const forgotAccessOpen = ref(false)
const requiresTotp = ref(false)
const totpCode = ref('')
const requiresPasswordChange = ref(false)
const newPassword = ref('')
const newPasswordConfirm = ref('')
const changePasswordLoading = ref(false)
const hasAcceptedPrivacy = ref(false)

const isFormValid = computed(() => email.value.includes('@') && password.value.length >= 6)

onMounted(() => {
  const savedEmail = localStorage.getItem('contex360-remember-email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  if (!hasAcceptedPrivacy.value) {
    toast.warning('Debe aceptar la política de tratamiento de datos para continuar.', {
      description: 'Cumplimiento obligatorio Ley 1581 de 2012',
      duration: 4000,
    })
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const credentials = { 
      email: email.value, 
      password: password.value, 
      totpCode: undefined,
      privacyAccepted: hasAcceptedPrivacy.value,
      rememberMe: rememberMe.value
    }
    if (requiresTotp.value && totpCode.value) {
      credentials.totpCode = totpCode.value
    }

    const result = await authStore.loginWithBackend(credentials)

    if (result?.requiresTotp) {
      requiresTotp.value = true
      errorMessage.value = ''
      return
    }

    if (result?.requiresPasswordChange) {
      requiresPasswordChange.value = true
      errorMessage.value = ''
      return
    }

    if (!result.ok) {
      errorMessage.value = result.message || 'Credenciales inválidas. Por favor, verifica tus datos.'
      return
    }

    statusMessage.value = result.message || 'Sesión iniciada.'
  } catch (error) {
    errorMessage.value = error?.message || 'Error de conexión. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (newPassword.value.length < 8) {
    errorMessage.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }
  changePasswordLoading.value = true
  errorMessage.value = ''
  try {
    const res = await businessApi.changePassword(password.value, newPassword.value)
    if (res.ok) {
      requiresPasswordChange.value = false
      password.value = newPassword.value
      statusMessage.value = 'Contraseña actualizada. Iniciando sesión...'
      await handleSubmit()
    }
  } catch (err) {
    errorMessage.value = err?.message || 'Error al cambiar la contraseña.'
  } finally {
    changePasswordLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="pattern-bg min-h-screen flex items-center justify-center p-4 md:p-8 font-inter">
    <main class="w-full max-w-[480px]">
      <!-- Brand Header -->
      <div class="flex flex-col items-center mb-8">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-[40px] text-[#0051d5]">business_center</span>
          <h1 class="text-3xl font-bold text-[#0b1c30] tracking-tight">Contex360</h1>
        </div>
        <p class="text-sm text-[#45464d]">ERP Administrativo y Contable</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
        
        <!-- Password Change Flow -->
        <template v-if="requiresPasswordChange">
          <div class="mb-8 text-center">
            <h2 class="text-xl font-semibold text-[#0b1c30] mb-2">Contraseña expirada</h2>
            <p class="text-sm text-[#45464d]">Tu contraseña ha vencido. Por seguridad debes establecer una nueva.</p>
          </div>
          
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center">
            {{ errorMessage }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1">Nueva contraseña</label>
              <input 
                v-model="newPassword" 
                type="password" 
                class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1">Confirmar contraseña</label>
              <input 
                v-model="newPasswordConfirm" 
                type="password" 
                class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all"
                placeholder="Repite la nueva contraseña"
              />
            </div>
            <button 
              @click="handleChangePassword"
              class="w-full py-4 bg-[#131b2e] text-white font-semibold text-sm rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              :disabled="changePasswordLoading || newPassword.length < 8"
            >
              {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y continuar' }}
            </button>
          </div>
        </template>

        <!-- Normal Login Flow -->
        <template v-else>
          <div class="mb-8 text-center">
            <h2 class="text-xl font-semibold text-[#0b1c30] mb-2">Bienvenido de nuevo</h2>
            <p class="text-sm text-[#45464d]">Ingresa tus credenciales para acceder</p>
          </div>

          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center">
            {{ errorMessage }}
          </div>
          
          <div v-if="statusMessage" class="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg text-center">
            {{ statusMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1" for="email">Correo electrónico</label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-4 text-[#76777d] text-[20px]">mail</span>
                <input 
                  id="email" 
                  v-model="email"
                  type="email" 
                  required
                  placeholder="nombre@empresa.com"
                  class="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all placeholder:text-[#76777d]/60"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1" for="password">Contraseña</label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-4 text-[#76777d] text-[20px]">lock</span>
                <input 
                  id="password" 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  placeholder="••••••••"
                  class="w-full pl-12 pr-12 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all placeholder:text-[#76777d]/60"
                />
                <button 
                  type="button"
                  @click="togglePassword"
                  class="absolute right-4 text-[#76777d] hover:text-[#0b1c30] transition-colors"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- 2FA Block -->
            <div v-if="requiresTotp" class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <label class="block text-xs font-bold text-[#0b1c30]">🔐 Código de verificación (2FA)</label>
              <input 
                v-model="totpCode"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full px-4 py-2 text-center text-lg font-mono tracking-[0.5em] border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0051d5]/20 outline-none"
              />
              <p class="text-[10px] text-[#45464d] text-center italic">Ingresa el código de 6 dígitos de tu aplicación.</p>
            </div>

            <!-- Helpers -->
            <div class="space-y-3 py-2">
              <label class="flex items-start gap-2 cursor-pointer group">
                <input v-model="hasAcceptedPrivacy" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#0051d5] focus:ring-[#0051d5]/20" />
                <span class="text-xs text-[#45464d] group-hover:text-[#0b1c30] transition-colors">
                  Acepto la Política de Tratamiento de Datos (Ley 1581)
                </span>
              </label>

              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input v-model="rememberMe" type="checkbox" class="w-4 h-4 rounded border-[#E2E8F0] text-[#0051d5] focus:ring-[#0051d5]/20" />
                  <span class="text-xs text-[#45464d] group-hover:text-[#0b1c30] transition-colors">Recordarme</span>
                </label>
                <a @click.prevent="forgotAccessOpen = true" class="text-xs text-[#0051d5] hover:underline font-semibold cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              
              <p v-if="forgotAccessOpen" class="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 text-center animate-in fade-in slide-in-from-top-1">
                Por favor, contacta al administrador de tu sistema para restablecer tu acceso.
              </p>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="w-full py-4 bg-[#131b2e] text-white font-semibold text-sm rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              :disabled="isLoading || (requiresTotp && totpCode.length < 6)"
            >
              <span>{{ isLoading ? 'Verificando...' : 'Entrar' }}</span>
              <span class="material-symbols-outlined text-[20px]">login</span>
            </button>
          </form>
        </template>

        <!-- Footer -->
        <div class="mt-8 pt-8 border-t border-[#E2E8F0] text-center">
          <p class="text-sm text-[#45464d]">
            ¿No tienes una cuenta? 
            <a @click.prevent="$emit('request-demo')" class="text-[#0051d5] font-semibold hover:underline cursor-pointer">Solicita una demo</a>
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="flex justify-center items-center gap-6 mt-8">
        <div class="flex items-center gap-1 text-[#45464d] opacity-60">
          <span class="material-symbols-outlined text-[16px]">language</span>
          <span class="text-[12px]">Español (Colombia)</span>
        </div>
        <div class="flex items-center gap-1 text-[#45464d] opacity-60">
          <span class="material-symbols-outlined text-[16px]">verified_user</span>
          <span class="text-[12px]">Conexión Segura</span>
        </div>
      </div>
    </main>

    <!-- Decoration -->
    <div class="hidden lg:block fixed bottom-12 right-12 opacity-[0.03] pointer-events-none">
      <span class="material-symbols-outlined text-[240px]">account_balance</span>
    </div>
  </div>
</template>

<style scoped>
.pattern-bg {
  background-color: #f8f9ff;
  background-image: radial-gradient(#d3e4fe 1px, transparent 1px);
  background-size: 24px 24px;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
