<script setup lang="ts">
import { ref, onErrorCaptured, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, RefreshCcw } from 'lucide-vue-next'

const hasError = ref(false)
const errorInfo = ref<Error | null>(null)

// 1. Errores de Renderizado (Componentes Vue Hijos)
onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorInfo.value = err as Error
  console.error('ErrorBoundary capturó un error de componente:', err, 'Info:', info)
  return false
})

// 2. Errores de la Configuración Global de Vue (main.js)
const handleVueGlobalError = (event: Event) => {
  const customEvent = event as CustomEvent
  hasError.value = true
  errorInfo.value = customEvent.detail?.error as Error
}

// 3. Errores Genéricos del Navegador
const handleWindowError = (event: ErrorEvent) => {
  hasError.value = true
  errorInfo.value = event.error || new Error(event.message)
}

// 4. Promesas Rechazadas (Ej: Peticiones Axios / Acciones Pinia fallidas)
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  hasError.value = true
  errorInfo.value = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
}

onMounted(() => {
  window.addEventListener('global-vue-error', handleVueGlobalError)
  window.addEventListener('error', handleWindowError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
})

onUnmounted(() => {
  window.removeEventListener('global-vue-error', handleVueGlobalError)
  window.removeEventListener('error', handleWindowError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
})

function reloadPage() {
  window.location.reload()
}
</script>

<template>
  <div
    v-if="hasError"
    class="error-boundary flex items-center justify-center min-h-screen bg-[#0a0f18] p-4 text-center"
  >
    <div class="bg-[#131926] p-8 rounded-2xl max-w-md w-full shadow-2xl border border-rose-500/20">
      <div class="flex justify-center mb-6">
        <div class="p-4 bg-rose-500/10 rounded-full">
          <AlertTriangle class="w-12 h-12 text-rose-500" />
        </div>
      </div>
      <h2 class="text-2xl font-black text-white mb-2 tracking-tight">
        Algo salió mal
      </h2>
      <p class="text-slate-400 text-sm mb-6 leading-relaxed">
        Ocurrió un error inesperado al intentar cargar esta sección. Hemos registrado el problema para solucionarlo.
      </p>
      
      <div class="mb-8 text-left bg-black/40 p-3 rounded-lg border border-slate-800/60 overflow-hidden">
        <p class="text-xs font-mono text-rose-400/80 break-words">
          {{ errorInfo?.message || 'Error desconocido' }}
        </p>
      </div>

      <button
        class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all" 
        @click="reloadPage"
      >
        <RefreshCcw class="w-4 h-4" />
        Recargar aplicación
      </button>
    </div>
  </div>
  <slot v-else />
</template>
