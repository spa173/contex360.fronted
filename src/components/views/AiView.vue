<script setup>
import { computed, reactive, watch } from 'vue'
import { useAiStore } from '../../stores/aiStore'
import { formatCurrency, formatDate } from '../../utils/ui'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useAiStore()

const ocrForm = reactive({
  source: '',
})

function resetForm() {
  ocrForm.source = ''
}

watch(
  () => store.activeTenantId,
  () => {
    resetForm()
  },
  { immediate: true },
)

const canOcr = computed(() => store.canRunOcr)

const permissionNote = computed(() =>
  canOcr.value
    ? 'Tu rol puede ejecutar OCR y sugerencias.'
    : 'Modo solo lectura. Tu rol activo no puede ejecutar OCR en este tenant.',
)

const averageTicket = computed(() =>
  store.tenantInvoices.length
    ? store.tenantInvoices.reduce((sum, invoice) => sum + invoice.total, 0) / store.tenantInvoices.length
    : 0,
)

const topProduct = computed(
  () => [...store.tenantProducts].sort((left, right) => right.price - left.price)[0] || null,
)

function handleSubmit() {
  const result = store.runOcr(ocrForm.source)

  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })

  if (result.ok) {
    resetForm()
  }
}
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Columna Izquierda: Input -->
      <article class="panel-card h-full">
        <div class="card-head">
          <div>
            <p class="eyebrow">RF-27 y RF-28</p>
            <h3>OCR y sugerencias contables</h3>
          </div>
        </div>

        <p class="permission-note">{{ permissionNote }}</p>

        <form class="form-layout" @submit.prevent="handleSubmit">
          <fieldset class="form-fieldset" :disabled="!canOcr">
            <label class="field">
              <span>Texto o contenido OCR del soporte</span>
              <textarea
                v-model="ocrForm.source"
                class="min-h-[400px] bg-black/20 border-white/10 text-slate-300 focus:border-blue-500/50"
                placeholder="Pega aqui texto de una factura o comprobante. Ejemplo: Factura FE-1024, NIT 900123456-7, fecha 2026-04-22, subtotal 1500000, IVA 285000, total 1785000."
              ></textarea>
            </label>

            <div class="form-actions mt-4">
              <button class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20" type="submit">
                Analizar documento
              </button>
            </div>
          </fieldset>
        </form>
      </article>

      <!-- Columna Derecha: Resultados y Sugerencias -->
      <div class="space-y-8">
        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Extraccion</p>
              <h3>Campos detectados</h3>
            </div>
          </div>

          <template v-if="store.selectedOcrRun">
            <div class="summary-grid mb-6">
              <div class="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                <span class="text-sm text-slate-400">Confianza del análisis</span>
                <strong class="text-xl text-emerald-400">{{ Math.round(store.selectedOcrRun.confidence * 100) }}%</strong>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <article v-for="(value, key) in store.selectedOcrRun.fields" :key="key" class="bg-white/5 p-4 rounded-lg border border-white/5">
                <div class="flex items-center justify-between mb-1">
                  <strong class="text-[10px] uppercase tracking-wider text-slate-500">{{ key }}</strong>
                  <span class="text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded">OCR</span>
                </div>
                <p class="text-sm text-white font-medium truncate">{{ value || 'No detectado' }}</p>
              </article>
            </div>
          </template>
          <div v-else class="h-48 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl">
            <p class="text-slate-500 text-sm">Analiza un documento para ver resultados</p>
          </div>
        </article>

        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Asistente</p>
              <h3>Sugerencias del sistema</h3>
            </div>
          </div>

          <div class="space-y-4">
            <article class="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <strong class="text-xs text-blue-400">Cuenta sugerida</strong>
                <span class="text-[10px] font-bold text-slate-500">SCORE 0.91</span>
              </div>
              <p class="text-sm text-slate-300">413595 - Ingresos operacionales. Patrón detectado en el histórico.</p>
            </article>

            <article class="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
              <div class="flex items-center justify-between mb-2">
                <strong class="text-xs text-emerald-400">Retencion potencial</strong>
                <span class="text-[10px] font-bold text-slate-500">SCORE 0.74</span>
              </div>
              <p class="text-sm text-slate-300">Aplicar validación de retención (Total > {{ formatCurrency(averageTicket) }}).</p>
            </article>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.form-fieldset {
  border: 0;
  display: grid;
  gap: 20px;
  margin: 0;
  min-inline-size: 0;
  padding: 0;
}
</style>
