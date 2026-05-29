<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmail } from '../services/authApi'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Verificar Email — Contex360',
})

const route = useRoute()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    status.value = 'error'
    message.value = 'Token de verificación no proporcionado.'
    return
  }

  try {
    const result = await verifyEmail(token)
    if (result.ok) {
      status.value = 'success'
      message.value = result.message || 'Correo verificado exitosamente.'
    } else {
      status.value = 'error'
      message.value = result.message || 'Error al verificar el correo.'
    }
  } catch (err: any) {
    status.value = 'error'
    message.value = err.message || 'Error al verificar el correo.'
  }
})

const goToLogin = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center font-['Inter']">
    <div class="max-w-[400px] w-full px-6 text-center">
      <!-- Logo -->
      <div class="inline-flex items-center gap-3 mb-8">
        <svg
          class="c360-mark"
          width="44"
          height="44"
          viewBox="0 0 56 56"
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

      <!-- Loading -->
      <div
        v-if="status === 'loading'"
        class="space-y-4"
      >
        <div class="w-12 h-12 mx-auto rounded-full bg-[#F4F4F5] flex items-center justify-center">
          <span class="material-symbols-outlined animate-spin text-[24px] text-[#2563EB]">progress_activity</span>
        </div>
        <p class="text-[14px] text-[#71717A]">
          Verificando tu correo electrónico...
        </p>
      </div>

      <!-- Success -->
      <div
        v-else-if="status === 'success'"
        class="space-y-4"
      >
        <div class="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-[32px] text-emerald-600">check_circle</span>
        </div>
        <h1 class="text-[24px] font-bold text-[#18181B]">
          Correo verificado
        </h1>
        <p class="text-[14px] text-[#71717A] leading-relaxed">
          {{ message }}
        </p>
        <button
          class="mt-4 px-6 py-3 bg-[#18181B] text-white rounded-[10px] text-[14px] font-semibold hover:bg-[#27272A] transition-colors"
          @click="goToLogin"
        >
          Ir al inicio de sesión
        </button>
      </div>

      <!-- Error -->
      <div
        v-else
        class="space-y-4"
      >
        <div class="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-[32px] text-rose-600">error</span>
        </div>
        <h1 class="text-[24px] font-bold text-[#18181B]">
          Error de verificación
        </h1>
        <p class="text-[14px] text-[#71717A] leading-relaxed">
          {{ message }}
        </p>
        <button
          class="mt-4 px-6 py-3 bg-[#18181B] text-white rounded-[10px] text-[14px] font-semibold hover:bg-[#27272A] transition-colors"
          @click="goToLogin"
        >
          Ir al inicio de sesión
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
