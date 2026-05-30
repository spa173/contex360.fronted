<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useAiStore } from '../../stores/aiStore'
import { useHead } from '@unhead/vue'

useHead({
  title: 'ContexAI',
  meta: [
    { name: 'description', content: 'Asistente de inteligencia artificial para análisis empresarial.' },
  ]
})

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])
const store = useAiStore()

const ocrForm = reactive({ source: '' })
const isSubmitting = ref(false)
function resetForm() { ocrForm.source = '' }

watch(() => store.activeTenantId, () => resetForm(), { immediate: true })

const canOcr = computed(() => store.canRunOcr)

async function handleSubmit() {
  if (!ocrForm.source.trim()) return
  isSubmitting.value = true
  try {
    const result = await store.runOcr(ocrForm.source)
    emit('notify', { message: result.message, detail: result.detail || '' })
    if (result.ok) resetForm()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
        <span>Sistema</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">IA / OCR</span>
      </div>
      <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
        Asistente IA · OCR y Sugerencias
      </h1>
      <p class="text-[14px] text-[#71717A]">
        Procesa texto extraído de soportes contables y obtén sugerencias automáticas.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider mb-1">
              RF-27 · RF-28
            </p>
            <h2 class="text-[16px] font-bold tracking-tight text-[#18181B]">
              OCR y sugerencias contables
            </h2>
          </div>
          <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold', canOcr ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700']">
            {{ canOcr ? 'Acceso autorizado' : 'Solo lectura' }}
          </span>
        </div>
        <label
          class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-2 block"
          for="ocrInput"
        >Texto OCR del soporte</label>
        <textarea
          id="ocrInput"
          v-model="ocrForm.source"
          name="ocrInput"
          autocomplete="off"
          :disabled="!canOcr"
          rows="14"
          placeholder="Pega aquí el texto de una factura. Ej: Factura FE-1024, NIT 900123456-7, total 1.785.000."
          class="w-full border border-[#E4E4E7] rounded-[10px] px-4 py-3 text-[13px] text-[#18181B] font-mono outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] resize-none disabled:bg-[#FAFAFA] disabled:cursor-not-allowed"
        />
        <button
          :disabled="!canOcr || !ocrForm.source || isSubmitting"
          class="w-full mt-4 py-3 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] disabled:opacity-50 flex items-center justify-center gap-2"
          @click="handleSubmit"
        >
          <span
            v-if="isSubmitting"
            class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          <span
            v-else
            class="material-symbols-outlined text-[18px]"
          >auto_awesome</span>
          {{ isSubmitting ? 'Analizando...' : 'Analizar documento' }}
        </button>
      </div>

      <div class="space-y-4">
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Extracción
              </p>
              <h2 class="text-[16px] font-bold tracking-tight text-[#18181B]">
                Campos detectados
              </h2>
            </div>
            <span
              v-if="store.selectedOcrRun"
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold"
            >
              {{ Math.round(store.selectedOcrRun.confidence * 100) }}% confianza
            </span>
          </div>
          <template v-if="store.selectedOcrRun">
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(value, key) in store.selectedOcrRun.fields"
                :key="key"
                class="p-3 rounded-[10px] border border-[#E4E4E7] bg-[#FAFAFA]"
              >
                <p class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                  {{ key }}
                </p>
                <p class="text-[13px] font-mono font-semibold text-[#18181B]">
                  {{ value || 'No detectado' }}
                </p>
              </div>
            </div>
          </template>
          <div
            v-else
            class="h-32 flex items-center justify-center border-2 border-dashed border-[#E4E4E7] rounded-[10px]"
          >
            <p class="text-[13px] text-[#A1A1AA]">
              Analiza un documento para ver resultados
            </p>
          </div>
        </div>

        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
          <div class="mb-4">
            <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Asistente
            </p>
            <h2 class="text-[16px] font-bold tracking-tight text-[#18181B]">
              Sugerencias
            </h2>
          </div>
          <div class="space-y-3">
            <div class="p-4 rounded-[10px] border border-[#E4E4E7]">
              <div class="flex items-center justify-between mb-1">
                <p class="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider">
                  Cuenta sugerida
                </p>
                <span class="font-mono text-[10px] font-semibold text-[#A1A1AA]">Score 0.91</span>
              </div>
              <p class="text-[12px] text-[#71717A] leading-[1.5]">
                <span class="font-mono font-semibold text-[#18181B]">413595</span> · Ingresos operacionales.
              </p>
            </div>
            <div class="p-4 rounded-[10px] border border-[#E4E4E7]">
              <div class="flex items-center justify-between mb-1">
                <p class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Retención potencial
                </p>
                <span class="font-mono text-[10px] font-semibold text-[#A1A1AA]">Score 0.74</span>
              </div>
              <p class="text-[12px] text-[#71717A] leading-[1.5]">
                Aplicar validación de retención.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
