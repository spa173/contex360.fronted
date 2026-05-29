<script setup>
import { ref, onMounted } from 'vue'

const COOKIE_CONSENT_KEY = 'contex360_cookie_consent'
const showBanner = ref(false)

onMounted(() => {
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!stored) showBanner.value = true
})

function acceptAll() {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    necessary: true,
    analytics: true,
    preferences: true,
    acceptedAt: new Date().toISOString(),
  }))
  showBanner.value = false
}

function rejectOptional() {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    necessary: true,
    analytics: false,
    preferences: false,
    acceptedAt: new Date().toISOString(),
  }))
  showBanner.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showBanner"
      class="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-zinc-200 shadow-2xl"
    >
      <div class="max-w-5xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div class="flex-1 text-sm text-[#52525B] leading-relaxed">
          <strong class="text-[#18181B]">🍪 Uso de cookies</strong>
          <p class="mt-1">
            Contex360 utiliza cookies estrictamente necesarias para el funcionamiento de la plataforma.
            No usamos cookies de rastreo ni publicidad.
            Al hacer clic en "Aceptar todas", también habilitas cookies opcionales que mejoran tu experiencia.
            Consulta nuestra
            <a href="/privacidad" class="underline hover:text-[#18181B]">Política de Privacidad</a>.
          </p>
        </div>
        <div class="flex gap-3 shrink-0">
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-300 text-[#52525B] hover:bg-zinc-50 transition-colors"
            @click="rejectOptional"
          >
            Solo necesarias
          </button>
          <button
            class="px-4 py-2 rounded-lg text-sm font-medium bg-[#18181B] text-white hover:bg-[#27272A] transition-colors"
            @click="acceptAll"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
