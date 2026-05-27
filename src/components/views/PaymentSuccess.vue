<script setup lang="ts">
import { onMounted } from 'vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Pago Exitoso',
  meta: [
    { name: 'description', content: 'Tu pago ha sido procesado exitosamente. Bienvenido a Contex360.' },
    { property: 'og:title', content: 'Pago Exitoso' },
    { property: 'og:description', content: 'Tu pago ha sido procesado exitosamente. Bienvenido a Contex360.' },
    { name: 'twitter:title', content: 'Pago Exitoso' },
    { name: 'twitter:description', content: 'Tu pago ha sido procesado exitosamente. Bienvenido a Contex360.' },
  ]
})

const props = defineProps<{
  planType?: string
}>()

const emit = defineEmits<{
  (e: 'continue'): void
}>()

onMounted(() => {
  // We could optionally fetch the latest user state here
  // or it will be fetched automatically when they go to the dashboard
})
</script>

<template>
  <div class="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center font-['Inter']">
    <div class="bg-white p-10 rounded-[24px] shadow-sm max-w-md w-full border border-[#E4E4E7]">
      <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="material-symbols-outlined text-[40px] fill-current">check_circle</span>
      </div>
      
      <h1 class="text-[28px] font-black text-[#18181B] tracking-tight mb-2">
        ¡Pago Exitoso!
      </h1>
      
      <p class="text-[15px] text-[#71717A] mb-8 leading-relaxed">
        Tu suscripción al plan <strong class="text-[#18181B] capitalize">{{ planType || 'Premium' }}</strong> se ha activado correctamente. Ya puedes disfrutar de todos los beneficios.
      </p>

      <button 
        @click="emit('continue')"
        class="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[14px] font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
      >
        Ir al Dashboard
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
