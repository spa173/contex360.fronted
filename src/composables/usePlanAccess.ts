import { computed } from 'vue'
import { useStateStore } from '../stores/stateStore'

const PLAN_MODULES: Record<string, string[]> = {
  starter: ['dashboard', 'billing', 'quotes', 'third-parties'],
  pyme: ['dashboard', 'billing', 'purchases', 'quotes', 'inventory', 'third-parties', 'treasury', 'reports', 'users', 'ai'],
  enterprise: ['*'],
}

export function usePlanAccess() {
  const store = useStateStore()
  
  const isBypassed = computed(() => {
    const user = store.currentUser
    return user?.isSystemOwner === true || user?.email === 'root@contex360.local'
  })

  const plan = computed(() => {
    if (isBypassed.value) return 'enterprise'
    return store.subscription?.planType ?? 'starter'
  })
  
  function canAccessModule(moduleId: string): boolean {
    if (isBypassed.value) return true
    const modules = store.subscription?.limits?.modules || PLAN_MODULES[plan.value] || []
    if (modules.includes('*')) return true
    return modules.includes(moduleId)
  }
  
  function canCreateInvoice(): boolean {
    if (isBypassed.value) return true
    const limit = store.subscription?.limits?.maxInvoicesPerMonth
    if (limit === null || limit === undefined) return true
    const current = store.subscription?.invoicesThisMonth ?? 0
    return current < limit
  }
  
  function canAddUser(): boolean {
    if (isBypassed.value) return true
    const limit = store.subscription?.limits?.maxUsers
    if (limit === null || limit === undefined) return true
    
    // Count memberships for active tenant
    const activeTenantId = store.activeTenantId
    const current = store.memberships?.filter(m => m.tenantId === activeTenantId)?.length ?? 0
    return current < limit
  }
  
  function isFeatureLocked(feature: string): boolean {
    if (isBypassed.value) return false
    return !canAccessModule(feature)
  }
  
  return { plan, canAccessModule, canCreateInvoice, canAddUser, isFeatureLocked }
}
