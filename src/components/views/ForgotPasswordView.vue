<script setup lang="ts">
import { ref, computed } from 'vue'
import { requestPasswordReset } from '@/services/authApi'
import { toast } from 'vue-sonner'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Recuperar Contraseña',
  meta: [
    { name: 'description', content: 'Recupera el acceso a tu cuenta de Contex360.' },
    { property: 'og:title', content: 'Recuperar Contraseña' },
    { property: 'og:description', content: 'Recupera el acceso a tu cuenta de Contex360.' },
    { name: 'twitter:title', content: 'Recuperar Contraseña' },
    { name: 'twitter:description', content: 'Recupera el acceso a tu cuenta de Contex360.' },
  ]
})

const emit = defineEmits(['back'])

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

const isFormValid = computed(() => email.value.includes('@') && email.value.includes('.'))

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await requestPasswordReset(email.value)
    if (res.ok) {
      isSuccess.value = true
      toast.success('Correo enviado', { description: res.message })
    } else {
      errorMessage.value = res.message || 'Ocurrió un error inesperado.'
    }
  } catch (error: any) {
    errorMessage.value = error?.message || 'Error de conexión al solicitar el restablecimiento.'
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
    />

    <!-- Top bar: back button -->
    <div class="relative max-w-[1440px] mx-auto px-6 lg:px-12 pt-8">
      <button
        class="flex items-center gap-2 text-[#71717A] hover:text-[#18181B] transition-colors font-semibold text-sm"
        @click="$emit('back')"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver al inicio
      </button>
    </div>

    <div class="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 lg:gap-14 items-center">
      <!-- ============ LEFT: brand + info ============ -->
      <section class="max-w-[640px] animate-in fade-in slide-in-from-left-4 duration-700">
        <div class="inline-flex items-center gap-3 mb-7">
          <svg
            class="c360-mark flex-shrink-0"
            width="44"
            height="44"
            viewBox="0 0 56 56"
            aria-hidden="true"
          >
            <rect
              width="56"
              height="56"
              rx="12"
              fill="#18181B"
            />
            <g class="rotor">
              <path
                d="M44 18 A 16 16 0 1 0 44 38"
                stroke="#fff"
                stroke-width="5.5"
                stroke-linecap="round"
                fill="none"
              />
              <path
                d="M44 18 A 16 16 0 0 1 44 38"
                stroke="#2563EB"
                stroke-width="5.5"
                stroke-linecap="round"
                fill="none"
              />
            </g>
          </svg>
          <span class="font-bold text-[20px] tracking-tight text-[#18181B]">Contex360</span>
        </div>

        <h1
          class="text-[40px] lg:text-[52px] leading-[1.02] tracking-[-0.03em] font-bold text-[#18181B] mb-4"
          style="text-wrap: balance;"
        >
          Recuperación de <em class="not-italic text-[#2563EB]">Acceso</em>.
        </h1>
        <p class="text-[16px] lg:text-[17px] leading-[1.55] text-[#71717A] max-w-[460px] mb-9">
          Por su seguridad, los enlaces de recuperación expiran en 15 minutos y se envían cifrados de extremo a extremo.
        </p>
      </section>

      <!-- ============ RIGHT: Form card ============ -->
      <main class="w-full max-w-[460px] mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="bg-white rounded-[18px] border border-[#E4E4E7] p-8 lg:p-9 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)]">
          <template v-if="isSuccess">
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <h2 class="text-[22px] font-bold tracking-tight text-[#18181B] mb-2">
                Revisa tu correo
              </h2>
              <p class="text-[14px] text-[#71717A] mb-8 leading-relaxed">
                Si <strong>{{ email }}</strong> está registrado en nuestro sistema, recibirás un enlace seguro para restablecer tu contraseña en breve.
              </p>
              <button
                class="w-full py-3 bg-[#F4F4F5] text-[#18181B] font-semibold text-[14px] rounded-[10px] hover:bg-[#E4E4E7] transition-all"
                @click="$emit('back')"
              >
                Regresar al Inicio de Sesión
              </button>
            </div>
          </template>
          
          <template v-else>
            <h2 class="text-[22px] font-bold tracking-[-0.02em] text-[#18181B] mb-1">
              ¿Olvidaste tu contraseña?
            </h2>
            <p class="text-[13px] text-[#71717A] mb-7">
              Ingresa tu correo electrónico corporativo y te enviaremos un enlace de acceso temporal.
            </p>

            <div
              v-if="errorMessage"
              class="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-xl text-center"
            >
              {{ errorMessage }}
            </div>

            <form
              class="space-y-5"
              @submit.prevent="handleSubmit"
            >
              <div>
                <label
                  class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
                  for="email"
                >Correo Electrónico</label>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">mail</span>
                  <input
                    id="email"
                    v-model="email"
                    name="email"
                    autocomplete="username"
                    type="email"
                    required
                    placeholder="nombre@empresa.com"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                  >
                </div>
              </div>

              <button
                type="submit"
                class="w-full py-3.5 bg-[#2563EB] text-white font-semibold text-[15px] rounded-[10px] hover:bg-[#1D4ED8] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#2563EB]/10 disabled:opacity-50 mt-2"
                :disabled="isLoading || !isFormValid"
              >
                <span>{{ isLoading ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación' }}</span>
                <span
                  v-if="!isLoading"
                  class="material-symbols-outlined text-[18px]"
                >send</span>
                <span
                  v-else
                  class="material-symbols-outlined animate-spin text-[18px]"
                >progress_activity</span>
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
