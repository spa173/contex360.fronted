import { computed } from 'vue'
import { useStateStore } from '../stores/stateStore'

// Fallback plan configurations
const PLAN_MODULES = {
  starter: ['dashboard', 'billing', 'quotes', 'third-parties'],
  pyme: ['dashboard', 'billing', 'purchases', 'quotes', 'inventory', 'third-parties', 'treasury', 'reports', 'users', 'ai'],
  enterprise: ['*'],
}

export function usePlanAccess() {
  const store = useStateStore()
  const plan = computed(() => store.subscription?.planType ?? 'starter')
  
  function canAccessModule(moduleId) {
    const modules = store.subscription?.limits?.modules || PLAN_MODULES[plan.value] || []
    if (modules.includes('*')) return true
    return modules.includes(moduleId)
  }
  
  function canCreateInvoice() {
    const limit = store.subscription?.limits?.maxInvoicesPerMonth
    if (limit === null || limit === undefined) return true
    const current = store.subscription?.invoicesThisMonth ?? 0
    return current < limit
  }
  
  function canAddUser() {
    const limit = store.subscription?.limits?.maxUsers
    if (limit === null || limit === undefined) return true
    
    // Count memberships for active tenant
    const activeTenantId = store.activeTenantId
    const current = store.memberships?.filter(m => m.tenantId === activeTenantId)?.length ?? 0
    return current < limit
  }
  
  function isFeatureLocked(feature) {
    return !canAccessModule(feature)
  }
  
  return { plan, canAccessModule, canCreateInvoice, canAddUser, isFeatureLocked }
}
