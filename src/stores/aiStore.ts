import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export const useAiStore = defineStore('ai', () => {
  const state = useStateStore()

  return {
    activeTenantId: computed(() => state.activeTenantId),
    tenantOcrRuns: computed(() => state.tenantOcrRuns),
    selectedOcrRun: computed(() => state.selectedOcrRun),
    tenantInvoices: computed(() => state.tenantInvoices),
    tenantProducts: computed(() => state.tenantProducts),
    runOcr: state.runOcr,
    canRunOcr: computed(() => state.can('run_ocr')),
  }
})
