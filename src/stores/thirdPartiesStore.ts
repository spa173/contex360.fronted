import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'

export const useThirdPartiesStore = defineStore('thirdParties', () => {
  const state = useStateStore()

  return {
    tenantThirdParties: computed(() => state.tenantThirdParties),
    activeTenantId: computed(() => state.activeTenantId),
    createThirdParty: state.createThirdParty,
    canManageThirdParties: computed(() => state.can('manage_third_parties')),
  }
})
