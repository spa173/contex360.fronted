<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  error.value = ''
  success.value = false

  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  if (form.value.newPassword.length < 12) {
    error.value = 'La contraseña debe tener al menos 12 caracteres'
    return
  }
  if (!/[A-Z]/.test(form.value.newPassword)) {
    error.value = 'La contraseña debe contener al menos una mayúscula'
    return
  }
  if (!/[a-z]/.test(form.value.newPassword)) {
    error.value = 'La contraseña debe contener al menos una minúscula'
    return
  }
  if (!/\d/.test(form.value.newPassword)) {
    error.value = 'La contraseña debe contener al menos un número'
    return
  }
  if (!/[^a-zA-Z0-9]/.test(form.value.newPassword)) {
    error.value = 'La contraseña debe contener al menos un símbolo (!@#$...)'
    return
  }

  loading.value = true
  try {
    await authStore.changePassword(form.value.currentPassword, form.value.newPassword)
    success.value = true
    setTimeout(() => router.push('/'), 2000)
  } catch (err) {
    error.value = err.message || 'Error al cambiar la contraseña'
  } finally { loading.value = false }
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Inter'] relative overflow-hidden flex items-center justify-center p-6">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    />

    <div class="relative w-full max-w-[440px]">
      <div class="flex items-center gap-3 mb-7">
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

      <div class="bg-white rounded-[18px] border border-[#E4E4E7] p-8 lg:p-9 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)]">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-[10px] bg-amber-50 flex items-center justify-center text-amber-700">
            <span class="material-symbols-outlined text-[20px]">lock_reset</span>
          </div>
          <div>
            <h2 class="text-[18px] font-bold tracking-[-0.02em] text-[#18181B]">
              Cambia tu contraseña
            </h2>
            <p class="text-[12px] text-[#71717A]">
              Por seguridad, debes cambiar tu contraseña temporal.
            </p>
          </div>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
              for="currentPassword"
            >Contraseña actual</label>
            <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04]">
              <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">lock</span>
              <input
                id="currentPassword"
                v-model="form.currentPassword"
                name="currentPassword"
                autocomplete="current-password"
                type="password"
                placeholder="Tu contraseña temporal"
                required
                class="flex-1 py-2.5 bg-transparent outline-none text-[14px] text-[#18181B] border-0"
              >
            </div>
          </div>
          <div>
            <label
              class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
              for="newPassword"
            >Nueva contraseña</label>
            <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04]">
              <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">lock_reset</span>
              <input
                id="newPassword"
                v-model="form.newPassword"
                name="newPassword"
                autocomplete="new-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
                minlength="8"
                class="flex-1 py-2.5 bg-transparent outline-none text-[14px] text-[#18181B] border-0"
              >
            </div>
          </div>
          <div>
            <label
              class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
              for="confirmPassword"
            >Confirmar contraseña</label>
            <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04]">
              <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">check</span>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                autocomplete="new-password"
                type="password"
                placeholder="Repite la contraseña"
                required
                class="flex-1 py-2.5 bg-transparent outline-none text-[14px] text-[#18181B] border-0"
              >
            </div>
          </div>

          <div
            v-if="error"
            class="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[12px] font-semibold rounded-[10px]"
          >
            {{ error }}
          </div>
          <div
            v-if="success"
            class="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-semibold rounded-[10px]"
          >
            Contraseña cambiada exitosamente. Redirigiendo…
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-[#2563EB] text-white rounded-[10px] text-[14px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{{ loading ? 'Cambiando…' : 'Cambiar contraseña y continuar' }}</span>
            <span
              v-if="!loading"
              class="material-symbols-outlined text-[18px]"
            >arrow_forward</span>
          </button>
        </form>
      </div>

      <p class="text-center text-[12px] text-[#A1A1AA] mt-5">
        ¿Necesitas ayuda? <a
          href="#"
          class="text-[#2563EB] font-semibold hover:underline"
        >Contacta a soporte</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
