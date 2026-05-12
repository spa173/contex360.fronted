import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export const useBillingStore = defineStore('billing', () => {
  const state = useStateStore()

  return {
    activeTenantId: computed(() => state.activeTenantId),
    activeTenant: computed(() => state.activeTenant),
    tenantClients: computed(() => state.tenantClients),
    tenantProducts: computed(() => state.tenantProducts),
    tenantInvoices: computed(() => state.tenantInvoices),
    selectedInvoice: computed(() => state.selectedInvoice),
    selections: computed(() => state.selections),
    thirdParties: computed(() => state.thirdParties),
    emitInvoice: state.emitInvoice,
    selectInvoice: state.selectInvoice,
    canEmitInvoice: computed(() => state.can('emit_invoice')),
  }
})
