<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_OPTIONS,
  useUsersStore,
} from '../../stores/usersStore'
import { useRBACStore } from '../../stores/rbacStore'
import { Badge } from '@/components/ui/badge'
import UserEditForm from '@/views/users/components/UserEditForm.vue'
import UserDetailPanel from '@/views/users/components/UserDetailPanel.vue'
import UserTable from '../users/UserTable.vue'
import { formatDate } from '../../utils/ui'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useUsersStore()
const rbacStore = useRBACStore()

const activeTab = ref('users')
const selectedUserId = ref('')
const selectedRole = ref('Administrador')
const selectedIds = ref([])
const isCreatePanelOpen = ref(false)
const isRefreshing = ref(false)

const filters = reactive({
  query: '',
  status: 'all',
  role: 'all',
  tenantId: 'all',
  twoFactor: 'all',
})

// Forms
const userForm = reactive({
  name: '',
  email: '',
  password: '',
  status: 'active',
  title: '',
  role: ROLE_OPTIONS[0],
  initialTasks: [],
})

const membershipForm = reactive({
  tenantId: '',
  role: ROLE_OPTIONS[0],
})

const offboardingForm = reactive({
  date: '',
  reassignToUserId: null,
})

const tenantSearch = ref('')

const filteredTenants = computed(() => {
  const query = tenantSearch.value.toLowerCase()
  return store.tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(query) || tenant.prefix.toLowerCase().includes(query),
  )
})

const bulkForm = reactive({
  action: 'require-2fa',
  role: 'Contador',
  tenantId: '',
})

const invitationForm = reactive({
  email: '',
  tenantId: '',
  role: 'Contador',
  customMessage: '',
})

const securityForm = reactive({
  ipWhitelist: [],
  newIp: '',
  passwordPolicy: {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
    preventReuse: 5,
    failedAttemptsThreshold: 5,
    lockoutMinutes: 30,
  },
  sessionPolicy: {
    singleSessionOnly: false,
  },
})
const showOnlyActivePermissions = ref(false)
const duplicateRoleTarget = ref('Contador')
const generatedRecoveryCodes = ref([])
const ONBOARDING_TASK_OPTIONS = [
  'Completar perfil',
  'Firmar acuerdo de confidencialidad',
  'Configurar 2FA',
]

const tabs = [
  { id: 'users', label: 'Usuarios' },
  { id: 'roles', label: 'Roles y permisos' },
  { id: 'sessions', label: 'Sesiones' },
  { id: 'invitations', label: 'Invitaciones' },
  { id: 'security', label: 'Seguridad' },
]

const ROLE_INHERITS_ALL = new Set(['Administrador'])
const MODULE_HELP = {
  dashboard:
    'Configurar: personalizar widgets y umbrales. Aprobar: validar cierres o hitos sensibles del tablero.',
  billing:
    'Configurar: resolucion DIAN, consecutivos y parametros fiscales. Aprobar: autorizar emision/anulacion de facturas.',
  inventory:
    'Configurar: metodos de costo, bodegas y reglas de stock. Aprobar: validar ajustes y salidas extraordinarias.',
  accounting:
    'Configurar: plan de cuentas y parametros NIIF. Aprobar: aceptar asientos, cierres y reclasificaciones.',
  'third-parties':
    'Configurar: politicas y tipos de terceros. Aprobar: validar creaciones/actualizaciones sensibles.',
  users:
    'Configurar: reglas de acceso, 2FA y politicas de seguridad. Aprobar: altas, cambios de rol y bloqueos.',
  ai: 'Configurar: prompts, umbrales y plantillas OCR. Aprobar: confirmar sugerencias antes de aplicar.',
}

const PERMISSION_HELP = {
  view: 'Consultar informacion del modulo.',
  create: 'Crear nuevos registros o documentos.',
  edit: 'Modificar registros existentes.',
  approve: 'Confirmar acciones sensibles o de control.',
  export: 'Descargar datos en archivos.',
  configure: 'Cambiar parametros globales del modulo.',
}

const canUsers = computed(() => store.canManageUsers)
const currentClientIp = computed(() => store.currentClientIp || '')
const isCurrentUserSystemOwner = computed(() => Boolean(store.currentUser?.isSystemOwner))

const permissionNote = computed(() =>
  canUsers.value
    ? 'Consola administrativa para usuarios, roles, sesiones y seguridad.'
    : 'Modo solo lectura. Solo un Administrador puede cambiar usuarios, roles o politicas.',
)

const sortedUsers = computed(() =>
  [...store.users].sort((left, right) => left.name.localeCompare(right.name, 'es')),
)

const activeSessions = computed(() => store.userSessions.filter((session) => !session.revokedAt))

const userRows = computed(() =>
  sortedUsers.value
    .filter((user) => isCurrentUserSystemOwner.value || !user.isSystemOwner)
    .map((user) => {
    const memberships = getMembershipsForUser(user.id)
    const activeMembership = getActiveMembership(user.id)
    const security = getSecurity(user.id)
    const sessions = activeSessions.value.filter((session) => session.userId === user.id)
    const tenantLabels = memberships.map((membership) => {
      const t = store.tenants.find(ten => ten.id === membership.tenantId)
      return t ? (t.prefix || t.name) : ''
    })

    return {
      user,
      memberships,
      activeMembership,
      security,
      sessions,
      tenantLabels,
      isCurrentUser: user.id === store.currentUser?.id,
      searchText: [
        user.name,
        user.email,
        user.title,
        user.status,
        activeMembership?.role || '',
        tenantLabels.join(' '),
      ]
        .join(' ')
        .toLowerCase(),
    }
    }),
)

const filteredRows = computed(() => {
  const query = filters.query.trim().toLowerCase()

  return userRows.value.filter((row) => {
    const statusOk = filters.status === 'all' || row.user.status === filters.status
    const roleOk =
      filters.role === 'all' || row.memberships.some((membership) => membership.role === filters.role)
    const tenantOk =
      filters.tenantId === 'all' ||
      row.memberships.some((membership) => membership.tenantId === filters.tenantId)
    const twoFactorOk =
      filters.twoFactor === 'all' ||
      (filters.twoFactor === 'enabled' && row.security.twoFactorEnabled) ||
      (filters.twoFactor === 'required' && row.security.twoFactorRequired) ||
      (filters.twoFactor === 'pending' && row.security.twoFactorRequired && !row.security.twoFactorEnabled)

    return statusOk && roleOk && tenantOk && twoFactorOk && (!query || row.searchText.includes(query))
  })
})

const selectedRow = computed(
  () => userRows.value.find((row) => row.user.id === selectedUserId.value) || filteredRows.value[0] || null,
)

const tenantInvitations = computed(() =>
  [...store.invitations]
    .filter((inv) => inv.tenantId === store.activeTenantId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((invitation) => {
      const now = new Date()
      const expiresAt = new Date(invitation.expiresAt)
      const hoursRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60))
      const isExpired = expiresAt < now
      const isExpiringSoon = !isExpired && hoursRemaining <= 24

      return {
        ...invitation,
        hoursRemaining,
        isExpired,
        isExpiringSoon,
      }
    }),
)

const securityKpis = computed(() => ({
  total: store.users.length,
  active: store.users.filter((user) => user.status === 'active').length,
  twoFactorPending: store.userSecurity.filter(
    (profile) => profile.twoFactorRequired && !profile.twoFactorEnabled,
  ).length,
  sessions: activeSessions.value.length,
  resetRequired: store.userSecurity.filter((profile) => profile.passwordResetRequired).length,
}))

const roleBreakdown = computed(() =>
  ROLE_OPTIONS.map((role) => ({
    role,
    count: store.memberships.filter(
      (membership) => membership.tenantId === store.activeTenantId && membership.role === role,
    ).length,
  })).filter((item) => item.count > 0),
)

const visiblePermissionActions = computed(() => {
  if (!showOnlyActivePermissions.value) {
    return PERMISSION_ACTIONS
  }
  return PERMISSION_ACTIONS.filter((permission) =>
    PERMISSION_MODULES.some((module) => hasPermission(selectedRole.value, module.id, permission.id)),
  )
})

watch(
  [() => store.activeTenantId, () => store.users.length],
  () => {
    if (!membershipForm.tenantId) {
      membershipForm.tenantId = store.activeTenantId
    }

    if (!bulkForm.tenantId) {
      bulkForm.tenantId = store.activeTenantId
    }

    if (!invitationForm.tenantId) {
      invitationForm.tenantId = store.activeTenantId
    }

    if (!selectedUserId.value || !store.users.some((user) => user.id === selectedUserId.value)) {
      selectedUserId.value = sortedUsers.value[0]?.id || ''
    }
  },
  { immediate: true },
)

watch(
  selectedRow,
  (row) => {
    if (!row) {
      return
    }

    const membership = row.activeMembership || row.memberships[0]
    membershipForm.tenantId = membership?.tenantId || store.activeTenantId
    membershipForm.role = membership?.role || ROLE_OPTIONS[0]
  },
  { immediate: true },
)

function resetUserForm() {
  userForm.name = ''
  userForm.email = ''
  userForm.password = ''
  userForm.status = 'active'
  userForm.title = ''
  userForm.role = ROLE_OPTIONS[0]
  userForm.initialTasks = []
}

function getSecurity(userId) {
  return (
    store.userSecurity.find((profile) => profile.userId === userId) || {
      userId,
      twoFactorEnabled: false,
      twoFactorRequired: false,
      passwordResetRequired: false,
      tempPasswordExpiresAt: null,
      riskLevel: 'normal',
    }
  )
}

function getMembershipsForUser(userId) {
  return store.memberships.filter((membership) => membership.userId === userId)
}

function getActiveMembership(userId) {
  return store.memberships.find(
    (membership) => membership.userId === userId && membership.tenantId === store.activeTenantId,
  )
}

function notify(result) {
  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })
}

function handleUserSubmit() {
  // Handled by UserEditForm component
  isCreatePanelOpen.value = false
}

function isSelected(userId) {
  return selectedIds.value.includes(userId)
}

function toggleRowSelection(userId) {
  selectedIds.value = isSelected(userId)
    ? selectedIds.value.filter((id) => id !== userId)
    : [...selectedIds.value, userId]
}

function toggleAllRows(event) {
  selectedIds.value = event.target.checked ? filteredRows.value.map((row) => row.user.id) : []
}

function clearSelection() {
  selectedIds.value = []
}

function handleBulkAction() {
  const result = store.bulkUserAction({
    userIds: selectedIds.value,
    action: bulkForm.action,
    role: bulkForm.role,
    tenantId: bulkForm.tenantId,
  })
  notify(result)

  if (result.ok) {
    clearSelection()
  }
}

function handleToggleUserStatus(userId) {
  notify(store.toggleUserStatus(userId))
}

function handleForceReset(userId) {
  notify(store.forcePasswordReset(userId))
}

async function handleGenerateTemporaryPassword(userId) {
  notify(await store.generateTemporaryPasswordForUser(userId))
}

function handleRequireTwoFactor(userId, required) {
  notify(store.setTwoFactorRequirement(userId, required))
}

function handleToggleTwoFactor(userId) {
  notify(store.toggleTwoFactorEnabled(userId))
}

function handleRevokeSessions(userId) {
  notify(store.revokeUserSessions(userId))
}

function handleRevokeSession(sessionId) {
  notify(store.revokeSession(sessionId))
}

function handleMembershipSubmit() {
  if (!selectedRow.value) {
    return
  }

  notify(
    store.upsertMembership({
      userId: selectedRow.value.user.id,
      tenantId: membershipForm.tenantId,
      role: membershipForm.role,
    }),
  )
}

function handleRemoveMembership(tenantId) {
  if (!selectedRow.value) {
    return
  }

  notify(
    store.removeMembership({
      userId: selectedRow.value.user.id,
      tenantId,
    }),
  )
}

function hasPermission(role, moduleId, permission) {
  return isInheritedPermission(role) || Boolean(store.roleAccess[role]?.[moduleId]?.includes(permission))
}

function isInheritedPermission(role) {
  return ROLE_INHERITS_ALL.has(role)
}

/* c8 ignore start */
function handlePermissionChange(role, moduleId, permission, event) {
  if (isInheritedPermission(role)) {
    notify({
      ok: false,
      message: 'Este permiso es heredado por el rol Administrador.',
    })
    return
  }

  const reason = prompt('Motivo del cambio RBAC (obligatorio):', 'Ajuste operativo')
  if (!reason || !reason.trim()) {
    notify({ ok: false, message: 'Debes ingresar un motivo para continuar.' })
    event.target.checked = !event.target.checked
    return
  }

  notify(
    rbacStore.updateRolePermission({
      role,
      moduleId,
      permission,
      allowed: event.target.checked,
      reason,
    }),
  )
}
/* c8 ignore stop */

function formatDiff(role, moduleId, actionId, nowAllowed, prevAllowed) {
  return `${role}/${moduleId}/${actionId}: ${nowAllowed ? 'TRUE' : 'FALSE'} -> ${prevAllowed ? 'TRUE' : 'FALSE'}`
}

function processActionDiffs(role, moduleId, snapshot, diffs) {
  for (const action of PERMISSION_ACTIONS) {
    const nowAllowed = Boolean(store.roleAccess?.[role]?.[moduleId]?.includes(action.id))
    const prevAllowed = Boolean(snapshot?.[role]?.[moduleId]?.includes(action.id))
    if (nowAllowed !== prevAllowed) {
      diffs.push(formatDiff(role, moduleId, action.id, nowAllowed, prevAllowed))
    }
  }
}

function getRoleAccessDiffs(snapshot) {
  const diffs = []
  for (const role of ROLE_OPTIONS) {
    for (const module of PERMISSION_MODULES) {
      processActionDiffs(role, module.id, snapshot, diffs)
    }
  }
  return diffs
}

/* c8 ignore start */
function handleRestorePreviousRoleAccessVersion() {
  const previous = store.roleAccessHistory[0]
  if (!previous?.snapshot) {
    notify({ ok: false, message: 'No hay una versión previa disponible.' })
    return
  }
  const diffs = getRoleAccessDiffs(previous.snapshot)
  const preview = diffs.slice(0, 10).join('\n') || 'Sin diferencias detectadas.'
  const confirmRestore = confirm(
    `Vas a restaurar la versión anterior RBAC (${formatDate(previous.at)}).\n\nCambios detectados:\n${preview}\n\n¿Deseas continuar?`,
  )
  if (!confirmRestore) {
    return
  }
  notify(rbacStore.restorePreviousRoleAccessVersion())
}
/* c8 ignore stop */

function handleDuplicateRolePermissions() {
  if (duplicateRoleTarget.value === selectedRole.value) {
    notify({ ok: false, message: 'Selecciona un rol destino diferente.' })
    return
  }
  notify(rbacStore.duplicateRolePermissions(selectedRole.value, duplicateRoleTarget.value))
}

/* c8 ignore start */
function handleInvitationSubmit() {
  const previewMessage = [
    `Para: ${invitationForm.email}`,
    `Empresa: ${store.tenants.find(t => t.id === invitationForm.tenantId)?.name || 'Empresa seleccionada'}`,
    `Rol: ${invitationForm.role}`,
    '',
    invitationForm.customMessage || 'Sin mensaje personalizado.',
  ].join('\n')
  const approved = confirm(`Vista previa del correo de invitación:\n\n${previewMessage}\n\n¿Enviar invitación?`)
  if (!approved) {
    return
  }

  const result = store.createInvitation(invitationForm)
  notify(result)

  if (result.ok) {
    invitationForm.email = ''
    invitationForm.customMessage = ''
  }
}
/* c8 ignore stop */

function handleResendInvitation(invitationId) {
  notify(store.resendInvitation(invitationId))
}

function handleTrustFingerprint(sessionId) {
  notify(store.trustSessionFingerprint(sessionId))
}

function handleGenerateRecoveryCodes() {
  const result = store.generateRecoveryCodes()
  notify(result)
  if (result.ok) {
    generatedRecoveryCodes.value = result.codes || []
  }
}

async function handleCopyRecoveryCodes() {
  if (!generatedRecoveryCodes.value.length || typeof navigator === 'undefined' || !navigator.clipboard) {
    notify({ ok: false, message: 'No hay códigos para copiar.' })
    return
  }
  await navigator.clipboard.writeText(generatedRecoveryCodes.value.join('\n'))
  notify({ ok: true, message: 'Códigos copiados. Guárdalos en un lugar seguro.' })
}

function handleDownloadRecoveryCodes() {
  /* c8 ignore next */
  if (!generatedRecoveryCodes.value.length || typeof globalThis === 'undefined') {
    notify({ ok: false, message: 'No hay códigos para descargar.' })
    return
  }
  const content = [
    'Codigos de recuperacion Contex360',
    'Solo se muestran una vez. Guarda este archivo offline.',
    '',
    ...generatedRecoveryCodes.value,
  ].join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'recovery-codes.txt'
  link.click()
  URL.revokeObjectURL(link.href)
}

function handleScheduleDeactivation(userId) {
  if (!offboardingForm.date) {
    notify({ ok: false, message: 'Selecciona fecha de baja.' })
    return
  }
  notify(
    store.scheduleUserDeactivation({
      userId,
      at: `${offboardingForm.date}T00:00:00.000Z`,
      reassignToUserId: offboardingForm.reassignToUserId || null,
    }),
  )
}

function loadSecuritySettings() {
  const tenant = store.tenants.find((t) => t.id === store.activeTenantId)
  if (tenant?.securitySettings) {
    securityForm.ipWhitelist = [...(tenant.securitySettings.ipWhitelist || [])]
    securityForm.passwordPolicy = {
      ...tenant.securitySettings.passwordPolicy,
      failedAttemptsThreshold: Number(tenant.securitySettings.passwordPolicy?.failedAttemptsThreshold ?? 5),
      lockoutMinutes: Number(tenant.securitySettings.passwordPolicy?.lockoutMinutes ?? 30),
    }
    securityForm.sessionPolicy = {
      singleSessionOnly: Boolean(tenant.securitySettings.sessionPolicy?.singleSessionOnly),
    }
  } else {
    securityForm.ipWhitelist = []
    securityForm.passwordPolicy = {
      minLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAgeDays: 90,
      preventReuse: 5,
      failedAttemptsThreshold: 5,
      lockoutMinutes: 30,
    }
    securityForm.sessionPolicy = {
      singleSessionOnly: false,
    }
  }
}

function saveSecuritySettings() {
  if (
    securityForm.ipWhitelist.length > 0 &&
    currentClientIp.value &&
    !securityForm.ipWhitelist.includes(currentClientIp.value)
  ) {
    const shouldContinue = confirm(
      `Tu IP actual es ${currentClientIp.value} y no está en la lista blanca. Esta configuración podría bloquear tu acceso. ¿Deseas continuar?`,
    )
    if (!shouldContinue) {
      return
    }
  }

  const tenant = store.tenants.find((t) => t.id === store.activeTenantId)
  if (tenant) {
    tenant.securitySettings = {
      ipWhitelist: securityForm.ipWhitelist,
      passwordPolicy: securityForm.passwordPolicy,
      sessionPolicy: securityForm.sessionPolicy,
    }
    store.saveState()
    notify({ ok: true, message: 'Configuración de seguridad actualizada.' })
  }
}

function addIpToWhitelist() {
  const ip = securityForm.newIp.trim()
  if (!ip) {
    return
  }
  if (!/^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip)) {
    notify({ ok: false, message: 'Formato de IP inválido. Usa IPv4 (ej. 190.14.82.21).' })
    return
  }
  if (!securityForm.ipWhitelist.includes(ip)) {
    securityForm.ipWhitelist.push(ip)
    securityForm.newIp = ''
  }
}

function removeIpFromWhitelist(ip) {
  securityForm.ipWhitelist = securityForm.ipWhitelist.filter((i) => i !== ip)
}

/* c8 ignore start */
function handlePanicLogout() {
  if (
    confirm(
      'Acción crítica: se cerrarán todas las sesiones activas inmediatamente en la empresa. ¿Deseas continuar?',
    )
  ) {
    const result = store.panicLogoutAll()
    notify(result)
  }
}
/* c8 ignore stop */

function getModuleHelp(moduleId) {
  return MODULE_HELP[moduleId] || 'Controla permisos de ver, crear, editar, aprobar, exportar y configurar.'
}

function getPermissionHelp(permissionId) {
  return PERMISSION_HELP[permissionId] || 'Permiso operativo del modulo.'
}

function getSessionBrowser(session) {
  return session.browser || 'No disponible'
}

function getSessionOs(session) {
  return session.os || 'No disponible'
}

function getSessionFingerprint(session) {
  return session.fingerprint || 'No disponible'
}

function isSessionTrusted(session) {
  const profile = store.userSecurity.find((item) => item.userId === session.userId)
  return Boolean(profile?.trustedFingerprints?.includes(session.fingerprint))
}

function openSessionMap(session) {
  /* c8 ignore next 3 */
  if (typeof globalThis === 'undefined') {
    return
  }
  const query = encodeURIComponent(`${session.location} ${session.ip}`)
  globalThis.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener')
}

function handleRefresh() {
  isRefreshing.value = true
  store.hydrateState?.()
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

watch(
  [() => store.activeTenantId, activeTab],
  () => {
    if (activeTab.value === 'security') {
      loadSecuritySettings()
    }
  },
  { immediate: true },
)
</script>

<template>
  <section :class="['view', { active: isActive }]">
    <article class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm users-admin-hero">
      <div class="card-head">
        <div>
          <p class="eyebrow">Identity & Access</p>
          <h3>Consola de administracion de usuarios</h3>
          <p class="permission-note">{{ permissionNote }}</p>
        </div>
        <div class="hero-actions">
          <button class="btn-sm" type="button" @click="activeTab = 'roles'">Matriz RBAC</button>
          <button
            class="btn-sm"
            type="button"
            @click="handleRefresh"
            title="Refrescar datos desde almacenamiento local"
            :class="{ refreshing: isRefreshing }"
          >
            🔄{{ isRefreshing ? '' : ' Refrescar' }}
          </button>
          <button class="btn-sm" type="button" @click="store.exportUsers" title="Exportar lista de usuarios a CSV">
            📥 Exportar
          </button>
          <button
            class="btn-sm btn-danger"
            type="button"
            @click="handlePanicLogout"
            title="Cerrar todas las sesiones de todos los usuarios (emergencia)"
          >
            🚨 Pánico
          </button>
          <button class="btn-primary" type="button" @click="isCreatePanelOpen = !isCreatePanelOpen">
            Nuevo usuario
          </button>
        </div>
      </div>

      <div class="grid-4 compact-metrics">
        <div class="metric-card">
          <div class="metric-label">Usuarios totales</div>
          <div class="metric-val">{{ securityKpis.total }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Activos</div>
          <div class="metric-val">{{ securityKpis.active }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">2FA pendiente</div>
          <div class="metric-val">{{ securityKpis.twoFactorPending }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Sesiones activas</div>
          <div class="metric-val">{{ securityKpis.sessions }}</div>
        </div>
      </div>
    </article>

    <nav class="admin-tabs" aria-label="Gestion de usuarios">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['stab', { active: activeTab === tab.id }]"
        type="button"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div v-if="activeTab === 'users'" class="users-workspace">
      <div class="stack-column">
        <UserEditForm
          :is-open="isCreatePanelOpen"
          :can-edit="canUsers"
          @toggle="isCreatePanelOpen = !isCreatePanelOpen"
          @submit="handleUserSubmit"
        />

        <article class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm">
          <div class="toolbar-grid">
            <label class="field toolbar-search">
              <span>Buscar</span>
              <input v-model="filters.query" placeholder="Nombre, email, rol o empresa" type="text" />
            </label>
            <label class="field">
              <span>Estado</span>
              <select v-model="filters.status">
                <option value="all">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>
            <label class="field">
              <span>Rol</span>
              <select v-model="filters.role">
                <option value="all">Todos</option>
                <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
              </select>
            </label>
            <label class="field">
              <span>Empresa</span>
              <select v-model="filters.tenantId">
                <option value="all">Todas</option>
                <option v-for="tenant in store.tenants" :key="tenant.id" :value="tenant.id">
                  {{ tenant.name }}
                </option>
              </select>
            </label>
            <label class="field">
              <span>2FA</span>
              <select v-model="filters.twoFactor">
                <option value="all">Todos</option>
                <option value="enabled">Activo</option>
                <option value="required">Obligatorio</option>
                <option value="pending">Pendiente</option>
              </select>
            </label>
          </div>

          <div v-if="selectedIds.length" class="bulk-bar">
            <strong>{{ selectedIds.length }} seleccionados</strong>
            <select v-model="bulkForm.action">
              <option value="require-2fa">Exigir 2FA</option>
              <option value="force-reset">Forzar cambio de clave</option>
              <option value="deactivate">Desactivar</option>
              <option value="activate">Activar</option>
              <option value="change-role">Cambiar rol</option>
            </select>
            <select v-if="bulkForm.action === 'change-role'" v-model="bulkForm.role">
              <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
            </select>
            <select v-if="bulkForm.action === 'change-role'" v-model="bulkForm.tenantId">
              <option v-for="tenant in store.tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
            <button class="btn-primary" type="button" @click="handleBulkAction">Aplicar</button>
            <button class="btn-sm" type="button" @click="clearSelection">Limpiar</button>
          </div>

          <UserTable
            :rows="filteredRows"
            :selected-ids="selectedIds"
            :selected-user-id="selectedUserId"
            :current-user-id="store.currentUser?.id"
            @select="(id) => selectedUserId = id"
            @toggle-selection="toggleRowSelection"
            @toggle-all="(selected) => selectedIds = selected ? filteredRows.map(r => r.user.id) : []"
          />
        </article>
      </div>

      <UserDetailPanel
        v-if="selectedRow"
        :row="selectedRow"
        :user-rows="userRows"
        :can-edit="canUsers"
        @force-reset="handleForceReset"
        @generate-temp-password="handleGenerateTemporaryPassword"
        @require-two-factor="handleRequireTwoFactor"
        @toggle-two-factor="handleToggleTwoFactor"
        @revoke-sessions="handleRevokeSessions"
        @revoke-session="handleRevokeSession"
        @membership-submit="(tenantId, role) => { membershipForm.tenantId = tenantId; membershipForm.role = role; handleMembershipSubmit(); }"
        @remove-membership="handleRemoveMembership"
        @schedule-deactivation="(userId, date, reassignId) => { offboardingForm.date = date; offboardingForm.reassignToUserId = reassignId; handleScheduleDeactivation(userId); }"
      />
    </div>

    <div v-else-if="activeTab === 'roles'" class="stack-column">
      <article class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm">
        <div class="card-head">
          <div>
            <p class="eyebrow">RBAC</p>
            <h3>Matriz de permisos por rol</h3>
            <p class="permission-note">
              Diferencia permisos de ver, crear, editar, aprobar, exportar y configurar por modulo.
            </p>
          </div>
          <label class="field compact-field">
            <span>Rol</span>
            <select v-model="selectedRole">
              <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>
        </div>
        <div class="row-actions">
          <label class="field checkbox-label">
            <input v-model="showOnlyActivePermissions" type="checkbox" />
            <span>Solo permisos activos</span>
          </label>
          <label class="field compact-field">
            <span>Duplicar hacia</span>
            <select v-model="duplicateRoleTarget">
              <option v-for="role in ROLE_OPTIONS" :key="`dup-${role}`" :value="role">{{ role }}</option>
            </select>
          </label>
          <button class="btn-sm" type="button" @click="handleDuplicateRolePermissions">Duplicar rol</button>
          <button class="btn-sm" type="button" @click="handleRestorePreviousRoleAccessVersion">
            Restaurar versión anterior
          </button>
        </div>

        <div class="rbac-table-wrap">
          <table class="admin-table rbac-table">
            <thead>
              <tr>
                <th>Modulo</th>
                <th v-for="permission in visiblePermissionActions" :key="permission.id" :title="getPermissionHelp(permission.id)">
                  {{ permission.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="module in PERMISSION_MODULES" :key="module.id">
                <td>
                  <strong>{{ module.label }}</strong>
                  <span class="help-dot" :title="getModuleHelp(module.id)">i</span>
                </td>
                <td v-for="permission in visiblePermissionActions" :key="permission.id">
                  <input
                    :checked="hasPermission(selectedRole, module.id, permission.id)"
                    :disabled="isInheritedPermission(selectedRole)"
                    :title="
                      isInheritedPermission(selectedRole)
                        ? 'Permiso heredado por rol superior (Administrador).'
                        : getPermissionHelp(permission.id)
                    "
                    :class="{ 'inherited-permission': isInheritedPermission(selectedRole) }"
                    type="checkbox"
                    @change="handlePermissionChange(selectedRole, module.id, permission.id, $event)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm">
        <div class="card-head">
          <div>
            <p class="eyebrow">Resumen</p>
            <h3>Roles en {{ store.activeTenant?.name }}</h3>
          </div>
        </div>
        <div class="list-grid">
          <div v-for="item in roleBreakdown" :key="item.role" class="module-row">
            <div>
              <p>{{ item.role }}</p>
              <p class="label-soft">Asignaciones en empresa activa</p>
            </div>
            <span class="small-pill">{{ item.count }}</span>
          </div>
        </div>
      </article>
    </div>

    <article v-else-if="activeTab === 'sessions'" class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm">
      <div class="card-head">
        <div>
          <p class="eyebrow">Seguridad</p>
          <h3>Sesiones activas y revocadas</h3>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Empresa</th>
              <th>Dispositivo</th>
              <th>Navegador</th>
              <th>Sistema operativo</th>
              <th>Fingerprint</th>
              <th>Confiable</th>
              <th>IP / Ubicacion</th>
              <th>Inicio</th>
              <th>Ultima actividad</th>
              <th>Estado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in store.userSessions" :key="session.id">
              <td>{{ store.users.find((user) => user.id === session.userId)?.name || session.userId }}</td>
              <td>{{ getTenantName(session.tenantId) }}</td>
              <td>{{ session.device }}</td>
              <td>{{ getSessionBrowser(session) }}</td>
              <td>{{ getSessionOs(session) }}</td>
              <td>{{ getSessionFingerprint(session) }}</td>
              <td>
                <span v-if="isSessionTrusted(session)" class="trusted-shield" title="Dispositivo confiable">🛡️</span>
                <span v-else class="label-soft">-</span>
              </td>
              <td>{{ session.ip }} · {{ session.location }}</td>
              <td>{{ formatDate(session.createdAt) }}</td>
              <td>{{ formatDate(session.lastSeenAt) }}</td>
              <td>
                <Badge
                  :class="session.revokedAt ? 'bg-rose-500/15 text-rose-500 border-none' : 'bg-emerald-500/15 text-emerald-500 border-none'"
                >
                  {{ session.revokedAt ? 'Cerrada' : 'Activa' }}
                </Badge>
              </td>
              <td>
                <button v-if="!session.revokedAt" class="btn-sm" type="button" @click="handleRevokeSession(session.id)">
                  Cerrar
                </button>
                <button class="btn-sm" type="button" @click="handleTrustFingerprint(session.id)">Confiar</button>
                <button class="btn-sm" type="button" @click="openSessionMap(session)">Ver en mapa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

     <div v-else-if="activeTab === 'invitations'" class="two-column">
      <article class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm">
        <div class="card-head">
          <div>
            <p class="eyebrow">Onboarding</p>
            <h3>Invitar usuario</h3>
          </div>
        </div>
        <form class="form-layout" @submit.prevent="handleInvitationSubmit">
          <fieldset class="form-fieldset" :disabled="!canUsers">
            <label class="field">
              <span>Email</span>
              <input v-model="invitationForm.email" placeholder="usuario@empresa.co" required type="email" />
            </label>
            <div class="field-grid two">
              <label class="field">
                <span>Empresa</span>
                <select v-model="invitationForm.tenantId">
                  <option v-for="tenant in store.tenants" :key="tenant.id" :value="tenant.id">
                    {{ tenant.name }}
                  </option>
                </select>
              </label>
              <label class="field">
                <span>Rol</span>
                <select v-model="invitationForm.role">
                  <option v-for="role in ROLE_OPTIONS" :key="role" :value="role">{{ role }}</option>
                </select>
              </label>
            </div>
            <label class="field">
              <span>Mensaje personalizado (opcional)</span>
              <textarea
                v-model="invitationForm.customMessage"
                placeholder="Hola Daniela, bienvenida al equipo de contabilidad de Contex Labs."
                rows="2"
              ></textarea>
            </label>
            <div class="form-actions">
              <button class="btn-primary" type="submit">Enviar invitacion</button>
            </div>
          </fieldset>
        </form>
      </article>

      <article class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm">
        <div class="card-head">
          <div>
            <p class="eyebrow">Pendientes</p>
            <h3>Invitaciones recientes</h3>
          </div>
        </div>
        <div class="list-grid">
          <div
            v-for="invitation in tenantInvitations"
            :key="invitation.id"
            class="module-row"
            :class="{
              'invitation-expiring': invitation.isExpiringSoon,
              'invitation-expired': invitation.isExpired,
            }"
          >
            <div>
              <p>{{ invitation.email }}</p>
              <p class="label-soft">
                {{ getTenantName(invitation.tenantId) }} · {{ invitation.role }}
                <span v-if="invitation.isExpired" class="text-danger"> · Expirado</span>
                <span v-else-if="invitation.hoursRemaining <= 24" class="text-warning">
                  · Expira en {{ invitation.hoursRemaining }}h
                </span>
                <span v-else> · Expira {{ formatDate(invitation.expiresAt) }}</span>
              </p>
              <p v-if="invitation.customMessage" class="label-soft invitation-message">
                "{{ invitation.customMessage }}"
              </p>
              <p v-if="invitation.resendCount" class="label-soft">Reenviada {{ invitation.resendCount }} veces</p>
            </div>
            <Badge
              :class="
                invitation.isExpired
                  ? 'bg-rose-500/15 text-rose-500 border-none'
                  : invitation.isExpiringSoon
                    ? 'bg-amber-500/15 text-amber-500 border-none'
                    : 'bg-emerald-500/15 text-emerald-500 border-none'
              "
            >
              {{ invitation.status }}
            </Badge>
            <button class="btn-sm" type="button" @click="handleResendInvitation(invitation.id)">Reenviar</button>
          </div>
        </div>
      </article>
    </div>

    <div v-else-if="activeTab === 'security'" class="bg-[#131926] border border-slate-800/50 rounded-xl px-6 py-5 shadow-sm security-config">
        <div class="card-head">
          <div>
            <p class="eyebrow">Seguridad</p>
            <h3>Configuracion de seguridad para {{ store.activeTenant?.name }}</h3>
          </div>
        </div>
        <div class="security-sections">
          <div class="detail-section">
            <h4>Lista blanca de IPs</h4>
            <p class="label-soft">
              Solo se permitira acceso desde estas direcciones IP. Dejar vacio para permitir cualquier IP.
            </p>
            <p class="label-soft">IP actual detectada: <strong>{{ currentClientIp || 'No disponible' }}</strong></p>
            <div class="field">
              <input v-model="securityForm.newIp" placeholder="190.14.82.21" type="text" />
              <button class="btn-sm" type="button" @click="addIpToWhitelist">Agregar</button>
            </div>
            <div class="ip-list">
              <span v-for="ip in securityForm.ipWhitelist" :key="ip" class="ip-chip">
                {{ ip }}
                <button class="ip-remove" type="button" @click="removeIpFromWhitelist(ip)">×</button>
              </span>
            </div>
          </div>

          <div class="detail-section">
            <h4>Política de contraseñas</h4>
            <div class="policy-grid">
              <label class="field">
                <span>Longitud mínima</span>
                <input v-model.number="securityForm.passwordPolicy.minLength" min="6" max="128" type="number" />
              </label>
              <label class="field checkbox-label">
                <input v-model="securityForm.passwordPolicy.requireUppercase" type="checkbox" />
                <span>Requerir mayúsculas</span>
              </label>
              <label class="field checkbox-label">
                <input v-model="securityForm.passwordPolicy.requireLowercase" type="checkbox" />
                <span>Requerir minúsculas</span>
              </label>
              <label class="field checkbox-label">
                <input v-model="securityForm.passwordPolicy.requireNumbers" type="checkbox" />
                <span>Requerir números</span>
              </label>
              <label class="field checkbox-label">
                <input v-model="securityForm.passwordPolicy.requireSpecialChars" type="checkbox" />
                <span>Requerir caracteres especiales</span>
              </label>
              <label class="field">
                <span>Rotación cada (días)</span>
                <input v-model.number="securityForm.passwordPolicy.maxAgeDays" min="0" type="number" />
                <small>0 = no expiración obligatoria</small>
              </label>
              <label class="field">
                <span>Evitar reutilización de últimas</span>
                <input v-model.number="securityForm.passwordPolicy.preventReuse" min="0" type="number" />
                <small>0 = permitir reutilización</small>
              </label>
              <label class="field">
                <span>Bloquear tras intentos fallidos</span>
                <input v-model.number="securityForm.passwordPolicy.failedAttemptsThreshold" min="0" type="number" />
                <small>0 = sin bloqueo automático</small>
              </label>
              <label class="field">
                <span>Minutos de bloqueo</span>
                <input v-model.number="securityForm.passwordPolicy.lockoutMinutes" min="1" type="number" />
                <small>Se aplica al alcanzar el umbral de intentos fallidos</small>
              </label>
              <label class="field checkbox-label">
                <input v-model="securityForm.sessionPolicy.singleSessionOnly" type="checkbox" />
                <span>Solo permitir 1 sesión activa por usuario</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-primary" type="button" @click="saveSecuritySettings">Guardar configuración</button>
            <button v-if="isCurrentUserSystemOwner" class="btn-sm" type="button" @click="handleGenerateRecoveryCodes">
              Generar códigos de recuperación
            </button>
          </div>
          <div v-if="generatedRecoveryCodes.length" class="list-grid">
            <div class="row-actions">
              <button class="btn-sm" type="button" @click="handleCopyRecoveryCodes">Copiar códigos</button>
              <button class="btn-sm" type="button" @click="handleDownloadRecoveryCodes">Descargar TXT</button>
            </div>
            <div v-for="code in generatedRecoveryCodes" :key="code" class="module-row">
              <span>{{ code }}</span>
              <span class="small-pill">1 uso</span>
            </div>
          </div>
        </div>
    </div>
  </section>
</template>

<style scoped>
.form-fieldset {
  border: 0;
  display: grid;
  gap: 12px;
  margin: 0;
  min-inline-size: 0;
  padding: 0;
}

.users-admin-hero .permission-note {
  margin: 4px 0 0;
}

.users-workspace {
  align-items: start;
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr) 360px;
}

.admin-tabs {
  border-bottom: 0.5px solid var(--color-border-tertiary);
  display: flex;
  gap: 0;
  margin-bottom: 14px;
  overflow-x: auto;
}

.admin-tabs .stab {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 13px;
  margin-bottom: -1px;
  min-height: 36px;
  padding: 9px 16px;
  white-space: nowrap;
}

.admin-tabs .stab:hover,
.admin-tabs .stab.active {
  color: var(--color-text-primary);
}

.admin-tabs .stab.active {
  border-bottom-color: var(--color-text-primary);
  font-weight: 600;
}

.toolbar-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 1.5fr) repeat(4, minmax(120px, 1fr));
  margin-bottom: 12px;
}

.bulk-bar,
.inline-admin-form,
.button-grid,
.row-actions,
.tenant-stack {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bulk-bar {
  background: var(--color-background-info);
  border: 0.5px solid rgba(96, 165, 250, 0.26);
  border-radius: var(--border-radius-md);
  margin-bottom: 12px;
  padding: 10px;
}

.admin-table-wrap,
.rbac-table-wrap {
  overflow-x: auto;
}

.admin-table {
  min-width: 1180px;
}

.users-table {
  min-width: 760px;
}

.admin-table tr.selected td {
  background: var(--color-background-secondary);
}

.admin-table tbody tr {
  cursor: pointer;
}

.check-cell {
  text-align: center;
  width: 34px;
}

.user-detail-panel {
  align-self: start;
  position: sticky;
  top: 14px;
}

.detail-section {
  border-top: 0.5px solid var(--color-border-tertiary);
  display: grid;
  gap: 10px;
  padding-top: 14px;
}

.detail-section + .detail-section {
  margin-top: 14px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.rbac-table {
  min-width: 760px;
}

.rbac-table th,
.rbac-table td {
  text-align: center;
}

.rbac-table th:first-child,
.rbac-table td:first-child {
  text-align: left;
}

.help-dot {
  align-items: center;
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-secondary);
  border-radius: 999px;
  color: var(--color-text-secondary);
  cursor: help;
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  height: 16px;
  justify-content: center;
  margin-left: 6px;
  width: 16px;
}

.inherited-permission {
  accent-color: #7e57c2;
  cursor: not-allowed;
}

.trusted-shield {
  color: #2e7d32;
  font-size: 16px;
}

.user-create-panel.collapsed form {
  display: none;
}

.current-user-badge {
  margin-left: 8px;
  padding: 2px 6px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.invitation-expiring {
  background: #fff8e1;
}
.invitation-expired {
  background: #ffebee;
  opacity: 0.7;
}
.invitation-message {
  font-style: italic;
}
.text-danger {
  color: #d32f2f;
  font-weight: 600;
}
.text-warning {
  color: #f57c00;
  font-weight: 600;
}
.tenant-search {
  min-width: 200px;
  padding: 6px 10px;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-sm);
}
.tenant-select {
  min-width: 180px;
}

.btn-sm.refreshing {
  opacity: 0.6;
}

.security-sections {
  display: grid;
  gap: 16px;
  padding: 14px;
}
.ip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.ip-chip {
  display: inline-flex;
  align-items: center;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}
.ip-remove {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  margin-left: 6px;
}
.policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: center;
}
.policy-grid .field.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.policy-grid .field.checkbox-label input {
  width: auto;
}
.policy-grid .field small {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

@media (max-width: 1180px) {
  .users-workspace,
  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .user-detail-panel {
    position: static;
  }
}
</style>
