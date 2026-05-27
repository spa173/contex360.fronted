// ⚠️ UI-ONLY — Role-based permission checks for view-level rendering.
// This is NOT an authoritative access control mechanism.
// All write operations, financial actions, and data mutations
// MUST be validated server-side regardless of these flags.

import { computed } from 'vue'
import { useStateStore } from '../stores/stateStore'

export function usePermission(module?: string) {
  const store = useStateStore()

  const isReadOnly = computed(() => store.activeMembership?.role === 'Visor')

  const canCreate = computed(() => {
    if (isReadOnly.value) return false
    if (!module) return true
    const access = store.roleAccess?.[store.activeMembership?.role || '']?.[module] || []
    return access.includes('create')
  })

  const canEdit = computed(() => {
    if (isReadOnly.value) return false
    if (!module) return true
    const access = store.roleAccess?.[store.activeMembership?.role || '']?.[module] || []
    return access.includes('edit')
  })

  const canApprove = computed(() => {
    if (isReadOnly.value) return false
    if (!module) return true
    const access = store.roleAccess?.[store.activeMembership?.role || '']?.[module] || []
    return access.includes('approve')
  })

  const canExport = computed(() => {
    if (!module) return true
    const access = store.roleAccess?.[store.activeMembership?.role || '']?.[module] || []
    return access.includes('export')
  })

  const canWrite = computed(() => canCreate.value || canEdit.value || canApprove.value)

  return { isReadOnly, canCreate, canEdit, canApprove, canExport, canWrite }
}
