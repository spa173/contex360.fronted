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
const selectedTenant = ref('Contex360 Cloud') // Default or selectable
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
  <div class="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-6 font-['Inter']">
    <main class="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Brand Header (Centered) -->
      <div class="flex flex-col items-center mb-10">
        <div class="w-14 h-14 bg-[#18181B] rounded-[16px] flex items-center justify-center text-white font-black text-2xl shadow-sm mb-6">
          C
        </div>
        <h1 class="text-[28px] font-bold text-[#18181B] tracking-tight mb-2">Acceda a Contex360</h1>
        <p class="text-[14px] text-[#71717A] font-medium">Plataforma Administrativa de Grado Enterprise</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-[24px] border border-[#F4F4F5] p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)]">
        
        <!-- Error / Status Messages -->
        <div v-if="errorMessage" class="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-xl text-center">
          {{ errorMessage }}
        </div>
        <div v-if="statusMessage" class="mb-6 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-bold rounded-xl text-center">
          {{ statusMessage }}
        </div>

        <!-- Password Change Flow -->
        <template v-if="requiresPasswordChange">
          <div class="space-y-6">
            <div class="text-center mb-4">
              <p class="text-[13px] text-[#71717A] font-medium">Su contraseña ha expirado. Por favor establezca una nueva.</p>
            </div>
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider ml-1">Nueva Contraseña</label>
                <input 
                  v-model="newPassword" 
                  type="password" 
                  class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider ml-1">Confirmar Contraseña</label>
                <input 
                  v-model="newPasswordConfirm" 
                  type="password" 
                  class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                />
              </div>
              <button 
                @click="handleChangePassword"
                class="w-full py-4 bg-[#18181B] text-white font-bold text-[15px] rounded-xl hover:bg-[#27272A] active:scale-[0.98] transition-all shadow-lg shadow-black/5"
                :disabled="changePasswordLoading"
              >
                {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y Acceder' }}
              </button>
            </div>
          </div>
        </template>

        <!-- Normal Login Flow -->
        <template v-else>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider ml-1" for="email">Correo Electrónico</label>
              <input 
                id="email" 
                v-model="email"
                type="email" 
                required
                placeholder="nombre@empresa.com"
                class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
              />
            </div>

            <!-- Multi-tenant Selector (Mocked style as requested) -->
            <div class="space-y-1.5">
              <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider ml-1" for="tenant">Organización / Workspace</label>
              <div class="relative">
                <select 
                  id="tenant"
                  v-model="selectedTenant"
                  class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium appearance-none cursor-pointer"
                >
                  <option>Contex360 Cloud</option>
                  <option>Seleccionar al iniciar sesión...</option>
                </select>
                <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] pointer-events-none">expand_more</span>
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex justify-between items-center px-1">
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider" for="password">Contraseña</label>
                <button type="button" @click="forgotAccessOpen = !forgotAccessOpen" class="text-[11px] font-bold text-[#2563EB] hover:underline uppercase tracking-wider">¿Olvidó su acceso?</button>
              </div>
              <div class="relative">
                <input 
                  id="password" 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  placeholder="••••••••"
                  class="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 transition-all text-[14px] font-medium"
                />
                <button 
                  type="button"
                  @click="togglePassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] transition-colors"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <p v-if="forgotAccessOpen" class="text-[11px] text-amber-600 font-medium px-1 mt-2">Por favor contacte al administrador de su organización para restablecer su acceso.</p>
            </div>

            <!-- 2FA Block -->
            <div v-if="requiresTotp" class="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
              <label class="block text-[11px] font-bold text-[#18181B] uppercase tracking-wider text-center">🔐 Código de Verificación</label>
              <input 
                v-model="totpCode"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] border border-[#E4E4E7] rounded-xl focus:border-[#2563EB] outline-none"
              />
            </div>

            <!-- Policies & Remember -->
            <div class="space-y-4 pt-2">
              <label class="flex items-start gap-3 cursor-pointer group">
                <input v-model="hasAcceptedPrivacy" type="checkbox" class="mt-1 w-4 h-4 rounded border-[#E4E4E7] text-[#2563EB] focus:ring-[#2563EB]/20 transition-all" />
                <span class="text-[12px] text-[#71717A] font-medium group-hover:text-[#18181B] transition-colors leading-tight">
                  Acepto la Política de Tratamiento de Datos Personales.
                </span>
              </label>
              <label class="flex items-center gap-3 cursor-pointer group">
                <input v-model="rememberMe" type="checkbox" class="w-4 h-4 rounded border-[#E4E4E7] text-[#2563EB] focus:ring-[#2563EB]/20 transition-all" />
                <span class="text-[12px] text-[#71717A] font-medium group-hover:text-[#18181B] transition-colors">Mantener sesión iniciada</span>
              </label>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="w-full py-4 bg-[#2563EB] text-white font-bold text-[15px] rounded-xl hover:bg-[#1D4ED8] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#2563EB]/10 disabled:opacity-50"
              :disabled="isLoading || (requiresTotp && totpCode.length < 6)"
            >
              <span>{{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}</span>
              <span v-if="!isLoading" class="material-symbols-outlined text-[20px]">login</span>
              <span v-else class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            </button>
          </form>
        </template>

        <!-- Footer -->
        <div class="mt-10 pt-8 border-t border-[#F4F4F5] text-center">
          <p class="text-[13px] text-[#71717A] font-medium">
            ¿No tiene una cuenta? 
            <button @click="$emit('request-demo')" class="text-[#2563EB] font-bold hover:underline ml-1">Solicite una demo</button>
          </p>
        </div>
      </div>

      <!-- Security Info -->
      <div class="flex justify-center items-center gap-8 mt-10">
        <div class="flex items-center gap-2 text-[#A1A1AA]">
          <span class="material-symbols-outlined text-[16px]">lock</span>
          <span class="text-[11px] font-bold uppercase tracking-widest">Encriptación SSL</span>
        </div>
        <div class="flex items-center gap-2 text-[#A1A1AA]">
          <span class="material-symbols-outlined text-[16px]">verified_user</span>
          <span class="text-[11px] font-bold uppercase tracking-widest">Cumplimiento DIAN</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
