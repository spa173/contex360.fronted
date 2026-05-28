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

  const isTrial = computed(() => {
    if (isBypassed.value) return false
    const sub = store.subscription
    return sub?.planType === 'trial' && !!sub?.trialEndsAt
  })

  const trialDaysLeft = computed(() => {
    if (isBypassed.value) return null
    const sub = store.subscription
    if (!sub || !sub.trialEndsAt) return null
    const end = new Date(sub.trialEndsAt)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  })

  const isTrialExpired = computed(() => {
    if (isBypassed.value) return false
    if (!isTrial.value) return false
    return trialDaysLeft.value !== null && trialDaysLeft.value <= 0
  })

  const isSubscriptionActive = computed(() => {
    if (isBypassed.value) return true
    const sub = store.subscription
    if (!sub) return true
    if (isTrial.value) return !isTrialExpired.value
    return sub.active === true
  })
  
  function canAccessModule(moduleId: string): boolean {
    if (isBypassed.value) return true
    if (isTrialExpired.value) return false
    const modules = store.subscription?.limits?.modules
    if (!modules) return true
    if (modules.includes('*')) return true
    return modules.includes(moduleId)
  }
  
  function canCreateInvoice(): boolean {
    if (isBypassed.value) return true
    if (isTrialExpired.value) return false
    const limit = store.subscription?.limits?.maxInvoicesPerMonth
    if (limit === null || limit === undefined) return true
    const current = store.subscription?.invoicesThisMonth ?? 0
    return current < limit
  }
  
  function canAddUser(): boolean {
    if (isBypassed.value) return true
    if (isTrialExpired.value) return false
    const limit = store.subscription?.limits?.maxUsers
    if (limit === null || limit === undefined) return true
    const current = store.memberships?.filter(m => m.tenantId === store.activeTenantId)?.length ?? 0
    return current < limit
  }
  
  function isFeatureLocked(feature: string): boolean {
    if (isBypassed.value) return false
    if (isTrialExpired.value) return true
    return !canAccessModule(feature)
  }
  
  return {
    plan,
    isTrial,
    trialDaysLeft,
    isTrialExpired,
    isSubscriptionActive,
    canAccessModule,
    canCreateInvoice,
    canAddUser,
    isFeatureLocked,
  }
}
