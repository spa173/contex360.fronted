import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useStateStore } from './stateStore'
import { businessApi } from '../services/businessApi'
import { uid, appendAuditEvent } from '../utils/storeHelpers'

export const useThirdPartiesStore = defineStore('thirdParties', () => {
  const root = useStateStore()

  // State
  const thirdParties = ref<any[]>([
    { id: 'tp-1', tenantId: root.activeTenantId || 'tenant-a', name: 'Constructora Altos SAS', nit: '900123456-7', idNumber: '900123456-7', kind: 'client', type: 'Cliente', balance: 14500000 },
    { id: 'tp-2', tenantId: root.activeTenantId || 'tenant-a', name: 'Suministros Andinos SAS', nit: '830456789-1', idNumber: '830456789-1', kind: 'provider', type: 'Proveedor', balance: 3200000 },
  ])

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
      const data = await businessApi.getThirdParties()
      thirdParties.value = Array.isArray(data) ? data : []
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
    tenantThirdParties,
    tenantClients,
    tenantProviders,
    tenantEmployees,
    canManageThirdParties,
    fetchThirdParties,
    addThirdParty,
  }
})
