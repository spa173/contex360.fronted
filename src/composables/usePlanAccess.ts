import { computed } from 'vue'
import { useStateStore } from '../stores/stateStore'

/**
 * COMENTARIO DE SEGURIDAD: Este composable es SOLO para hints de UI (deshabilitar botones, mostrar badges).
 * La validación REAL de suscripción y límites está en el backend (PlanGuard + @CheckPlanLimit).
 * NUNCA confiar en estas funciones para seguridad - el backend es la fuente de verdad.
 */
export function usePlanAccess() {
  const store = useStateStore()
  
  const isBypassed = computed(() => {
    const user = store.currentUser
    return user?.isSystemOwner === true
  })

  const plan = computed(() => {
    if (isBypassed.value) return 'enterprise'
    return store.subscription?.planType ?? 'starter'
  })
  
  function canAccessModule(moduleId: string): boolean {
    if (isBypassed.value) return true
    const modules = store.subscription?.limits?.modules
    if (!modules) return true
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
    const current = store.memberships?.filter(m => m.tenantId === store.activeTenantId)?.length ?? 0
    return current < limit
  }
  
  function isFeatureLocked(feature: string): boolean {
    if (isBypassed.value) return false
    return !canAccessModule(feature)
  }
  
  return { plan, canAccessModule, canCreateInvoice, canAddUser, isFeatureLocked }
}
