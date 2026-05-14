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
      deviceType?: string
      browser?: string
      os?: string
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
    (tenant: any) =>
      tenant.name.toLowerCase().includes(query) ||
      tenant.prefix.toLowerCase().includes(query),
  )
})

function getTenantName(tenantId: string) {
  return store.tenants.find((t: any) => t.id === tenantId)?.name || tenantId
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
const securityActions = computed(() => [
  { label: 'Forzar Clave', emit: 'forceReset' as const, args: undefined },
  { label: 'Generar Temporal', emit: 'generateTempPassword' as const, args: undefined },
  { label: props.row.security.twoFactorRequired ? '2FA Opcional' : 'Exigir 2FA', emit: 'requireTwoFactor' as const, args: !props.row.security.twoFactorRequired },
  { label: props.row.security.twoFactorEnabled ? 'Baja 2FA' : 'Alta 2FA', emit: 'toggleTwoFactor' as const, args: undefined }
])

function handleSecurityAction(action: any) {
  if (action.args !== undefined) {
    emit(action.emit, props.row.user.id, action.args)
  } else {
    emit(action.emit, props.row.user.id)
  }
}
</script>

<template>
<template>
  <aside class="bg-[#131926] border border-slate-800/60 rounded-2xl p-0 shadow-2xl overflow-hidden user-detail-panel transition-all duration-300">
    <!-- Header: The Identity -->
    <div class="px-8 py-7 bg-gradient-to-br from-slate-800/20 to-transparent border-b border-slate-800/40">
      <div class="flex justify-between items-start mb-4">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-2">Perfil de Usuario</p>
          <h3 class="text-2xl font-black text-white tracking-tighter">{{ row.user.name }}</h3>
          <p class="text-sm font-mono text-slate-500 tracking-tight">{{ row.user.email }}</p>
        </div>
        <div :class="[
          'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
          row.security.riskLevel === 'review' 
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        ]">
          Riesgo {{ row.security.riskLevel === 'review' ? 'Crítico' : 'Controlado' }}
        </div>
      </div>
    </div>

    <div class="p-8 space-y-10">
      <!-- Section: Security Pulse -->
      <section>
        <div class="flex items-center gap-2 mb-5">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <h4 class="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Seguridad & Credenciales</h4>
        </div>
        
        <div class="grid grid-cols-2 gap-px bg-slate-800/20 rounded-xl border border-slate-800/40 overflow-hidden">
          <div v-for="(val, label) in {
            'Cambio de clave': row.security.passwordResetRequired ? 'Requerido' : 'Al día',
            'Clave temporal': row.security.tempPasswordExpiresAt ? 'Activa' : 'No',
            '2FA Obligatorio': row.security.twoFactorRequired ? 'Sí' : 'No',
            '2FA Configurado': row.security.twoFactorEnabled ? 'Sí' : 'No'
          }" :key="label" class="bg-[#131926] p-4 flex flex-col gap-1">
            <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">{{ label }}</span>
            <span :class="['text-xs font-mono font-bold', val === 'Requerido' || val === 'Sí' ? 'text-amber-400' : 'text-slate-300']">
              {{ val }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-5">
          <button v-for="action in securityActions" :key="action.label" 
          @click="handleSecurityAction(action)"
          class="px-4 py-2 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/30 text-[10px] font-bold text-slate-300 rounded-lg transition-all">
            {{ action.label }}
          </button>
        </div>
      </section>

      <!-- Section: Access Ledger -->
      <section>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <h4 class="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Control de Acceso</h4>
          </div>
        </div>

        <div class="space-y-1">
          <div v-for="membership in row.memberships" :key="membership.tenantId" 
            class="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 border border-transparent hover:border-slate-800/60 transition-all">
            <div>
              <p class="text-xs font-bold text-slate-200">{{ getTenantName(membership.tenantId) }}</p>
              <p class="text-[10px] font-mono text-slate-500">{{ membership.role }}</p>
            </div>
            <button @click="$emit('removeMembership', membership.tenantId)"
              class="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-rose-500/80 hover:text-rose-400 uppercase tracking-widest transition-all">
              Revocar
            </button>
          </div>
        </div>

        <form class="mt-6 p-4 bg-slate-800/10 rounded-xl border border-dashed border-slate-800/60 space-y-4" @submit.prevent="handleMembershipSubmit">
          <div class="grid grid-cols-1 gap-3">
            <select v-model="membershipForm.tenantId" class="bg-slate-900 border-slate-800 text-xs text-slate-300 rounded-lg focus:ring-emerald-500">
              <option value="">Seleccionar empresa...</option>
              <option v-for="tenant in store.tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
            <select v-model="membershipForm.role" class="bg-slate-900 border-slate-800 text-xs text-slate-300 rounded-lg focus:ring-emerald-500">
              <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>
          <button class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all" type="submit">
            Asignar Nuevo Rol
          </button>
        </form>
      </section>

      <!-- Section: Active Sessions -->
      <section>
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <h4 class="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Sesiones Activas</h4>
          </div>
          <button class="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest" @click="$emit('revokeSessions', row.user.id)">
            Revocar Todas
          </button>
        </div>

        <div v-if="row.sessions.length" class="space-y-2">
          <div v-for="session in row.sessions" :key="session.id" 
            class="p-4 bg-slate-800/10 rounded-xl border border-slate-800/40 flex justify-between items-center">
            <div class="space-y-1">
              <p class="text-[10px] font-mono font-bold text-slate-300 leading-none">{{ formatSessionLabel(session) }}</p>
              <p class="text-[9px] text-slate-500 leading-none tracking-tight">{{ session.location }} · {{ formatDate(session.lastSeenAt) }}</p>
            </div>
            <button @click="$emit('revokeSession', session.id)" 
              class="p-2 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-lg transition-all">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div v-else class="py-10 text-center bg-slate-800/5 rounded-2xl border border-dashed border-slate-800/40">
          <p class="text-xs text-slate-600 font-medium">Sin actividad reciente detectada.</p>
        </div>
      </section>

      <!-- Section: Offboarding -->
      <section class="pt-6 border-t border-slate-800/40">
        <div class="flex items-center gap-2 mb-5">
          <div class="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
          <h4 class="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Ciclo de Vida</h4>
        </div>
        
        <div class="p-4 bg-rose-500/[0.03] border border-rose-500/10 rounded-xl space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-1.5">
              <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Fecha de Desactivación</span>
              <input v-model="offboardingForm.date" type="date" class="w-full bg-slate-900 border-slate-800 text-xs text-slate-300 rounded-lg">
            </div>
            <div class="space-y-1.5">
              <span class="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Reasignar Auditoría a</span>
              <select v-model="offboardingForm.reassignToUserId" class="w-full bg-slate-900 border-slate-800 text-xs text-slate-300 rounded-lg">
                <option value="">Sin reasignación</option>
                <option v-for="userRow in userRows" :key="`off-${userRow.user.id}`" :value="userRow.user.id">
                  {{ userRow.user.name }}
                </option>
              </select>
            </div>
          </div>
          <button @click="handleScheduleDeactivation"
            class="w-full py-2.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 text-[10px] font-bold rounded-lg transition-all border border-rose-500/20">
            Programar Baja Permanente
        </div>
      </section>
    </div>
  </aside>
</template>
