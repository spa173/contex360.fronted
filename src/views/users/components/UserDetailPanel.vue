<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { ROLE_OPTIONS, useUsersStore } from '@/stores/usersStore'
import { formatDate } from '@/utils/ui'
import { computed, reactive, ref } from 'vue'

const props = defineProps<{
  row: {
    user: {
      id: string
      name: string
      email: string
    }
    security: {
      riskLevel: string
      passwordResetRequired: boolean
      tempPasswordExpiresAt: string | null
      twoFactorRequired: boolean
      twoFactorEnabled: boolean
    }
    memberships: Array<{
      tenantId: string
      role: string
    }>
    sessions: Array<{
      id: string
      location: string
      lastSeenAt: string
    }>
  }
  userRows: Array<{
    user: {
      id: string
      name: string
    }
  }>
  canEdit: boolean
}>()

const emit = defineEmits<{
  forceReset: [userId: string]
  generateTempPassword: [userId: string]
  requireTwoFactor: [userId: string, required: boolean]
  toggleTwoFactor: [userId: string]
  revokeSessions: [userId: string]
  revokeSession: [sessionId: string]
  membershipSubmit: [tenantId: string, role: string]
  removeMembership: [tenantId: string]
  scheduleDeactivation: [userId: string, date: string, reassignToUserId: string]
}>()

const store = useUsersStore()

const tenantSearch = ref('')
const membershipForm = reactive({
  tenantId: '',
  role: ROLE_OPTIONS[0],
})
const offboardingForm = reactive({
  date: '',
  reassignToUserId: '',
})

const filteredTenants = computed(() => {
  const query = tenantSearch.value.toLowerCase()
  return store.tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(query) ||
      tenant.prefix.toLowerCase().includes(query),
  )
})

function getTenantName(tenantId: string) {
  return store.tenants.find((t) => t.id === tenantId)?.name || tenantId
}

function formatSessionLabel(session: { deviceType?: string; browser?: string; os?: string }) {
  return [session.deviceType, session.browser, session.os].filter(Boolean).join(' · ')
}

function handleMembershipSubmit() {
  emit('membershipSubmit', membershipForm.tenantId, membershipForm.role)
}

function handleScheduleDeactivation() {
  emit('scheduleDeactivation', props.row.user.id, offboardingForm.date, offboardingForm.reassignToUserId)
}
</script>

<template>
  <aside class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm user-detail-panel">
    <div class="card-head">
      <div>
        <p class="eyebrow">Detalle</p>
        <h3>{{ row.user.name }}</h3>
        <p class="label-soft">{{ row.user.email }}</p>
      </div>
      <Badge
        :class="
          row.security.riskLevel === 'review'
            ? 'bg-amber-500/15 text-amber-500 border-none'
            : 'bg-slate-700/50 text-slate-400 border-none'
        "
      >
        Riesgo {{ row.security.riskLevel === 'review' ? 'revisar' : 'normal' }}
      </Badge>
    </div>

    <div class="detail-section">
      <div class="split-head">
        <div>
          <p class="eyebrow">Seguridad</p>
          <h4>Credenciales y 2FA</h4>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-row">
          <span class="label-soft">Cambio de clave</span>
          <strong>{{ row.security.passwordResetRequired ? 'Requerido' : 'Al dia' }}</strong>
        </div>
        <div class="summary-row">
          <span class="label-soft">Clave temporal</span>
          <strong>{{ row.security.tempPasswordExpiresAt ? 'Activa' : 'No' }}</strong>
        </div>
        <div class="summary-row">
          <span class="label-soft">2FA obligatorio</span>
          <strong>{{ row.security.twoFactorRequired ? 'Si' : 'No' }}</strong>
        </div>
        <div class="summary-row">
          <span class="label-soft">2FA configurado</span>
          <strong>{{ row.security.twoFactorEnabled ? 'Si' : 'No' }}</strong>
        </div>
      </div>
      <div class="button-grid">
        <button class="btn-sm" type="button" @click="$emit('forceReset', row.user.id)">
          Forzar clave
        </button>
        <button class="btn-sm" type="button" @click="$emit('generateTempPassword', row.user.id)">
          Clave temporal
        </button>
        <button
          class="btn-sm"
          type="button"
          @click="$emit('requireTwoFactor', row.user.id, !row.security.twoFactorRequired)"
        >
          {{ row.security.twoFactorRequired ? '2FA opcional' : 'Exigir 2FA' }}
        </button>
        <button class="btn-sm" type="button" @click="$emit('toggleTwoFactor', row.user.id)">
          {{ row.security.twoFactorEnabled ? 'Marcar 2FA off' : 'Marcar 2FA on' }}
        </button>
      </div>
    </div>

    <div class="detail-section">
      <div class="split-head">
        <div>
          <p class="eyebrow">Empresas</p>
          <h4>Roles por tenant</h4>
        </div>
      </div>
      <form class="inline-admin-form" @submit.prevent="handleMembershipSubmit">
        <div class="field">
          <input
            v-model="tenantSearch"
            class="tenant-search"
            placeholder="Buscar empresa..."
            type="search"
          />
        </div>
        <select v-model="membershipForm.tenantId" class="tenant-select">
          <option v-for="tenant in filteredTenants" :key="tenant.id" :value="tenant.id">
            {{ tenant.name }} ({{ tenant.prefix }})
          </option>
        </select>
        <select v-model="membershipForm.role">
          <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
        </select>
        <button class="btn-primary" type="submit">Guardar</button>
      </form>
      <div class="list-grid">
        <div
          v-for="membership in row.memberships"
          :key="membership.tenantId"
          class="module-row"
        >
          <div>
            <p>{{ getTenantName(membership.tenantId) }}</p>
            <p class="label-soft">{{ membership.role }}</p>
          </div>
          <button
            class="btn-sm"
            type="button"
            @click="$emit('removeMembership', membership.tenantId)"
          >
            Revocar
          </button>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="split-head">
        <div>
          <p class="eyebrow">Sesiones</p>
          <h4>Control activo</h4>
        </div>
        <button class="btn-sm" type="button" @click="$emit('revokeSessions', row.user.id)">
          Cerrar todas
        </button>
      </div>
      <div v-if="row.sessions.length" class="list-grid">
        <div v-for="session in row.sessions" :key="session.id" class="module-row">
          <div>
            <p>{{ formatSessionLabel(session) }}</p>
            <p class="label-soft">{{ session.location }} · {{ formatDate(session.lastSeenAt) }}</p>
          </div>
          <button class="btn-sm" type="button" @click="$emit('revokeSession', session.id)">
            Cerrar
          </button>
        </div>
      </div>
      <p v-else class="empty-state">No tiene sesiones activas.</p>
    </div>

    <div class="detail-section">
      <div class="split-head">
        <div>
          <p class="eyebrow">Offboarding</p>
          <h4>Baja programada</h4>
        </div>
      </div>
      <div class="inline-admin-form">
        <label class="field">
          <span>Fecha</span>
          <input v-model="offboardingForm.date" type="date" />
        </label>
        <label class="field">
          <span>Reasignar a</span>
          <select v-model="offboardingForm.reassignToUserId">
            <option value="">Sin reasignación</option>
            <option v-for="userRow in userRows" :key="`off-${userRow.user.id}`" :value="userRow.user.id">
              {{ userRow.user.name }}
            </option>
          </select>
        </label>
        <button class="btn-sm" type="button" @click="handleScheduleDeactivation">
          Programar baja
        </button>
      </div>
    </div>
  </aside>
</template>
