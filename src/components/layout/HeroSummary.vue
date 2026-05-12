<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useBillingStore } from '../../stores/billingStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useUsersStore } from '../../stores/usersStore'
import { formatCurrency } from '../../utils/ui'

const auth = useAuthStore()
const billing = useBillingStore()
const inventory = useInventoryStore()
const users = useUsersStore()

const emit = defineEmits(['navigate'])

const totalRevenue = computed(() =>
  billing.tenantInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
)

const acceptedCount = computed(
  () => billing.tenantInvoices.filter((invoice) => invoice.status === 'aceptada').length,
)

const lowStockCount = computed(
  () => inventory.tenantProducts.filter((product) => product.stock <= product.minStock).length,
)

const isDashboard = computed(() => auth.activeView === 'dashboard')
</script>

<template>
  <section v-if="isDashboard" class="card executive-summary">
    <div class="card-header">
      <div>
        <span class="card-title">{{ auth.activeTenant?.name }} en modo {{ auth.activeTenant?.costMethod }}</span>
        <p class="card-subtitle">
          Tenant activo, roles, impuestos, inventario, asientos y trazabilidad DIAN listos para validar el MVP.
        </p>
      </div>

      <div class="hero-actions">
        <button
          v-if="auth.visibleViews.includes('billing')"
          class="btn-primary"
          type="button"
          @click="emit('navigate', 'billing')"
        >
          Emitir factura
        </button>
        <button
          v-if="auth.visibleViews.includes('users')"
          class="btn-sm"
          type="button"
          @click="emit('navigate', 'users')"
        >
          Gestionar usuarios
        </button>
        <button
          v-if="auth.visibleViews.includes('ai')"
          class="btn-sm"
          type="button"
          @click="emit('navigate', 'ai')"
        >
          Probar OCR
        </button>
      </div>
    </div>

    <div class="grid-4 compact-metrics">
      <div class="metric-card">
        <div class="metric-label">Usuarios con acceso</div>
        <div class="metric-val">{{ users.usersForActiveTenant.length }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ingresos acumulados</div>
        <div class="metric-val">{{ formatCurrency(totalRevenue) }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">DIAN aceptados</div>
        <div class="metric-val">{{ acceptedCount }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Stock minimo</div>
        <div class="metric-val">{{ lowStockCount }}</div>
      </div>
    </div>
  </section>
</template>
