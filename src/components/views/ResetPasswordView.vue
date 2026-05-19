<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { resetPassword } from '@/services/authApi'
import { toast } from 'vue-sonner'

const emit = defineEmits(['back'])

const token = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const t = params.get('token')
  if (t) {
    token.value = t
  } else {
    errorMessage.value = 'El enlace de recuperación está incompleto o es inválido.'
  }
})

const isFormValid = computed(() => {
  return token.value && newPassword.value.length >= 8 && newPassword.value === newPasswordConfirm.value
})

const checkMatchError = computed(() => {
  if (newPasswordConfirm.value && newPassword.value !== newPasswordConfirm.value) {
    return 'Las contraseñas no coinciden.'
  }
  return null
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await resetPassword(token.value, newPassword.value)
    if (res.ok) {
      isSuccess.value = true
      toast.success('Contraseña Actualizada', { description: res.message })
      setTimeout(() => {
        emit('back')
      }, 3500)
    } else {
      errorMessage.value = res.message || 'Ocurrió un error inesperado.'
    }
  } catch (error: any) {
    errorMessage.value = error?.message || 'Error al restablecer la contraseña. Es posible que el enlace haya expirado.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Inter'] relative overflow-hidden">
    <!-- Subtle blue radial accent -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    ></div>

    <div class="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 lg:gap-14 items-center min-h-[85vh]">
      <!-- ============ LEFT: brand + info ============ -->
      <section class="max-w-[640px] animate-in fade-in slide-in-from-left-4 duration-700">
        <div class="inline-flex items-center gap-3 mb-7">
          <svg class="c360-mark flex-shrink-0" width="44" height="44" viewBox="0 0 56 56">
            <rect width="56" height="56" rx="12" fill="#18181B"/>
            <g class="rotor">
              <path d="M44 18 A 16 16 0 1 0 44 38" stroke="#fff" stroke-width="5.5" stroke-linecap="round" fill="none"/>
              <path d="M44 18 A 16 16 0 0 1 44 38" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            </g>
          </svg>
          <span class="font-bold text-[20px] tracking-tight text-[#18181B]">Contex360</span>
        </div>

        <h1 class="text-[40px] lg:text-[52px] leading-[1.02] tracking-[-0.03em] font-bold text-[#18181B] mb-4" style="text-wrap: balance;">
          Restablecer <em class="not-italic text-[#2563EB]">Contraseña</em>.
        </h1>
        <p class="text-[16px] lg:text-[17px] leading-[1.55] text-[#71717A] max-w-[460px] mb-9">
          Establezca una nueva contraseña para su cuenta corporativa. Para proteger sus datos, le recomendamos utilizar una clave fuerte y única.
        </p>
      </section>

      <!-- ============ RIGHT: Form card ============ -->
      <main class="w-full max-w-[460px] mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="bg-white rounded-[18px] border border-[#E4E4E7] p-8 lg:p-9 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)]">
          <template v-if="isSuccess">
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-[32px]">check_circle</span>
              </div>
              <h2 class="text-[22px] font-bold tracking-tight text-[#18181B] mb-2">¡Todo listo!</h2>
              <p class="text-[14px] text-[#71717A] mb-8 leading-relaxed">
                Tu contraseña ha sido restablecida exitosamente. Redirigiendo al panel de inicio de sesión...
              </p>
              <button
                @click="$emit('back')"
                class="w-full py-3 bg-[#18181B] text-white font-semibold text-[14px] rounded-[10px] hover:bg-[#27272A] transition-all"
              >
                Ir a Iniciar Sesión Ahora
              </button>
            </div>
          </template>
          
          <template v-else>
            <h2 class="text-[22px] font-bold tracking-[-0.02em] text-[#18181B] mb-1">Nueva Contraseña</h2>
            <p class="text-[13px] text-[#71717A] mb-7">Ingrese la nueva contraseña de 8 caracteres o más.</p>

            <div v-if="errorMessage" class="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-xl text-center">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="newPassword">Nueva Contraseña</label>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">lock</span>
                  <input
                    id="newPassword"
                    name="newPassword"
                    autocomplete="new-password"
                    v-model="newPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                  />
                </div>
              </div>

              <div>
                <label class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block" for="newPasswordConfirm">Confirmar Contraseña</label>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">lock_reset</span>
                  <input
                    id="newPasswordConfirm"
                    name="newPasswordConfirm"
                    autocomplete="new-password"
                    v-model="newPasswordConfirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                  />
                </div>
                <p v-if="checkMatchError" class="text-[11px] text-red-500 font-medium mt-1.5">{{ checkMatchError }}</p>
              </div>

              <button
                type="submit"
                class="w-full py-3.5 bg-[#2563EB] text-white font-semibold text-[15px] rounded-[10px] hover:bg-[#1D4ED8] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#2563EB]/10 disabled:opacity-50 mt-2"
                :disabled="isLoading || !isFormValid"
              >
                <span>{{ isLoading ? 'Guardando...' : 'Establecer Contraseña' }}</span>
                <span v-if="!isLoading" class="material-symbols-outlined text-[18px]">check</span>
                <span v-else class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              </button>
            </form>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

input {
  color: #18181B !important;
  background-color: transparent !important;
}
input::placeholder {
  color: #A1A1AA !important;
}
</style>
