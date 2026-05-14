import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { businessApi } from '../services/businessApi'
import type { Tenant } from './stateStore'

/**
 * Tenant Store - Maneja la lógica de Multi-tenancy y Switch de empresas
 * Extraído de stateStore.ts para mejorar mantenibilidad
 */

export interface TenantState {
  tenants: Tenant[]
  activeTenantId: string | null
}

export const useTenantStore = defineStore('tenant', () => {
  // State
  const tenants = ref<Tenant[]>([])
  const activeTenantId = ref<string | null>(null)

  // Getters
  const activeTenant = computed(() => {
    return tenants.value.find((t) => t.id === activeTenantId.value) || null
  })

  const accessibleTenants = computed(() => {
    // Filtrar tenants accesibles basado en membresías del usuario actual
    return tenants.value
  })

  // Actions
  function setTenants(newTenants: Tenant[]) {
    tenants.value = newTenants
  }

  function addTenant(tenant: Tenant) {
    const exists = tenants.value.find((t) => t.id === tenant.id)
    if (!exists) {
      tenants.value.push(tenant)
    }
  }

  function updateTenant(tenantId: string, updates: Partial<Tenant>) {
    const index = tenants.value.findIndex((t) => t.id === tenantId)
    if (index !== -1) {
      tenants.value[index] = { ...tenants.value[index], ...updates }
    }
  }

  function removeTenant(tenantId: string) {
    const index = tenants.value.findIndex((t) => t.id === tenantId)
    if (index !== -1) {
      tenants.value.splice(index, 1)
    }
    if (activeTenantId.value === tenantId) {
      activeTenantId.value = null
    }
  }

  async function setActiveTenant(tenantId: string): Promise<{ ok: boolean; message: string }> {
    const tenant = tenants.value.find((t) => t.id === tenantId)
    
    if (!tenant) {
      return {
        ok: false,
        message: 'La empresa seleccionada no existe.',
      }
    }

    activeTenantId.value = tenantId

    try {
      // Refrescar datos del tenant
      await fetchTenantData()
    } catch (error) {
      console.error('Error fetching tenant data:', error)
    }

    return {
      ok: true,
      message: '',
    }
  }

  async function fetchTenantData() {
    // Placeholder para lógica de fetch de datos del tenant
    // Se implementará cuando el backend exponga endpoints específicos
    if (!activeTenantId.value) return
  }

  function switchToDefaultTenant() {
    if (tenants.value.length > 0 && !activeTenantId.value) {
      activeTenantId.value = tenants.value[0].id
    }
  }

  function clearTenantState() {
    tenants.value = []
    activeTenantId.value = null
  }

  function ensureValidTenant() {
    const valid = tenants.value.some((t) => t.id === activeTenantId.value)
    if (!valid && tenants.value.length > 0) {
      activeTenantId.value = tenants.value[0].id
    }
  }

  return {
    // State
    tenants,
    activeTenantId,
    // Getters
    activeTenant,
    accessibleTenants,
    // Actions
    setTenants,
    addTenant,
    updateTenant,
    removeTenant,
    setActiveTenant,
    fetchTenantData,
    switchToDefaultTenant,
    clearTenantState,
    ensureValidTenant,
  }
})
