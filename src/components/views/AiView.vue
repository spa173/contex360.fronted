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
    <div class="two-column">
      <article class="panel-card">
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
                placeholder="Pega aqui texto de una factura o comprobante. Ejemplo: Factura FE-1024, NIT 900123456-7, fecha 2026-04-22, subtotal 1500000, IVA 285000, total 1785000."
                rows="10"
              ></textarea>
            </label>

            <div class="form-actions">
              <button class="primary-button" type="submit">Analizar documento</button>
            </div>
          </fieldset>
        </form>
      </article>

      <div class="stack-column">
        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Extraccion</p>
              <h3>Campos detectados</h3>
            </div>
          </div>

          <template v-if="store.selectedOcrRun">
            <div class="summary-grid">
              <div class="summary-row">
                <span class="label-soft">Confianza</span>
                <strong class="value-strong">{{ Math.round(store.selectedOcrRun.confidence * 100) }}%</strong>
              </div>
              <div class="summary-row">
                <span class="label-soft">Procesado</span>
                <strong class="value-strong">{{ formatDate(store.selectedOcrRun.createdAt) }}</strong>
              </div>
            </div>

            <div class="ocr-grid">
              <article v-for="(value, key) in store.selectedOcrRun.fields" :key="key" class="ocr-field">
                <div class="ocr-header">
                  <strong>{{ key }}</strong>
                  <span class="small-pill">OCR</span>
                </div>
                <p>{{ value || 'No detectado' }}</p>
              </article>
            </div>
          </template>
          <p v-else class="empty-state">Analiza un documento para ver los campos extraidos y el score.</p>
        </article>

        <article class="panel-card">
          <div class="card-head">
            <div>
              <p class="eyebrow">Asistente</p>
              <h3>Sugerencias del sistema</h3>
            </div>
          </div>

          <div class="suggestions-grid">
            <article class="suggestion-card">
              <div class="ocr-header">
                <strong>Cuenta sugerida</strong>
                <span class="small-pill">Score 0.91</span>
              </div>
              <p>413595 - Ingresos operacionales. La mayoria de facturas del tenant siguen este patron.</p>
            </article>

            <article class="suggestion-card">
              <div class="ocr-header">
                <strong>Retencion potencial</strong>
                <span class="small-pill">Score 0.74</span>
              </div>
              <p>
                Aplicar validacion de retencion en la fuente cuando el total supere el ticket promedio
                de {{ formatCurrency(averageTicket) }}.
              </p>
            </article>

            <article class="suggestion-card">
              <div class="ocr-header">
                <strong>Producto recomendado</strong>
                <span class="small-pill">Score 0.67</span>
              </div>
              <p>{{ topProduct?.name || 'Sin datos' }}: util para sugerir plantillas de venta y centros de costo.</p>
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
