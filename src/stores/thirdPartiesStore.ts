import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid } from '../utils/storeHelpers'

export const useThirdPartiesStore = defineStore('thirdParties', () => {
  const root = useStateStore()

  // State
  const thirdParties = ref<any[]>([])
  const aiInsights = ref<any>(null)

  // Getters
  const activeTenantId = computed(() => root.activeTenantId)
  
  const tenantThirdParties = computed(() => 
    thirdParties.value.filter(tp => tp.tenantId === activeTenantId.value)
  )

  const tenantClients = computed(() => 
    tenantThirdParties.value.filter(tp => tp.kind === 'client')
  )

  const tenantProviders = computed(() =>
    tenantThirdParties.value.filter(tp => tp.kind === 'provider')
  )

  const tenantEmployees = computed(() =>
    tenantThirdParties.value.filter(tp => tp.kind === 'employee')
  )

  const canManageThirdParties = computed(() => root.can('manage_third_parties'))

  // Actions
  async function fetchThirdParties() {
    if (!activeTenantId.value) return
    try {
      const [data, insights] = await Promise.all([
        businessApi.getThirdParties(),
        businessApi.getThirdPartiesInsights(activeTenantId.value).catch(() => null)
      ])
      thirdParties.value = Array.isArray(data) ? data : []
      aiInsights.value = insights
    } catch (error) { 
      console.error('Error fetching third parties:', error)
      thirdParties.value = []
    }
  }

  async function addThirdParty(data: any) {
    if (!activeTenantId.value) throw new Error('No active tenant')
    const res = await businessApi.createThirdParty(data, activeTenantId.value)
    if (res) {
      thirdParties.value.push(res)
    }
    return res
  }

  // Sync back to root
  watch(thirdParties, (newVal) => {
    (root.$state as any).thirdParties = newVal
  }, { deep: true, immediate: true })

  return {
    thirdParties,
    aiInsights,
    tenantThirdParties,
    tenantClients,
    tenantProviders,
    tenantEmployees,
    canManageThirdParties,
    fetchThirdParties,
    addThirdParty,
  }
})
