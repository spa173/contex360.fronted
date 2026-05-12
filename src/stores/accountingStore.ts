import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export const useAccountingStore = defineStore('accounting', () => {
  const state = useStateStore()

  return {
    tenantLedgerEntries: computed(() => state.tenantLedgerEntries),
    selectedEntry: computed(() => state.selectedEntry),
    selections: computed(() => state.selections),
    selectEntry: state.selectEntry,
  }
})
