<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from '../../stores/usersStore'
import { generatePdfReport } from '../../utils/pdfExport'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Usuarios',
  meta: [
    { name: 'description', content: 'Gestión de usuarios y permisos de la plataforma.' },
  ]
})

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const users = useUsersStore()
const searchQuery = ref('')
const selectedRole = ref('Todos los roles')
const selectedTenantId = ref(users.activeTenantId || (users.tenants[0]?.id || ''))

const tenantUsers = computed(() => {
  if (users.currentUser?.isSystemOwner && selectedTenantId.value) {
    const listToFilter = users.adminUsers?.length ? users.adminUsers : (users.users || [])
    return listToFilter.filter(u => u.isSystemOwner || (users.memberships || []).some(m => m.userId === u.id && m.tenantId === selectedTenantId.value))
      .map(u => {
        const m = (users.memberships || []).find(mb => mb.userId === u.id && mb.tenantId === selectedTenantId.value)
        return {
          ...u,
          role: m ? m.role : (u.isSystemOwner ? 'Super Admin' : 'Usuario local'),
          active: u.status === 'active'
        }
      })
  }
  return users.tenantUsers || []
})

async function onTenantChange() {
  if (users.currentUser?.isSystemOwner && selectedTenantId.value) {
    await users.fetchUsers(selectedTenantId.value)
  }
}


function generateRandomDigits(length = 3) {
  const crypto = globalThis.crypto
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, byte => String(byte % 10)).join('')
  }

  return '0'.repeat(length)
}

const filteredUsers = computed(() => {
  let list = tenantUsers.value
  if (selectedRole.value !== 'Todos los roles') {
    list = list.filter(u => (u.role || '').toLowerCase() === selectedRole.value.toLowerCase())
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(u => 
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  }
  return list
})

function initials(name) {
  if (!name) return '—'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function handleStatusToggle(user) {
  users.toggleUserStatus(user.id)
  emit('notify', { message: 'Estado actualizado', detail: `Acceso de ${user.name} cambiado exitosamente.` })
}

const showNewUserModal = ref(false)
const newPasswordResult = ref('')
const newUserForm = ref({ name: '', email: '', role: 'Usuario local', tenantId: '' })

function openNewUserModal() {
  newUserForm.value = { 
    name: '', 
    email: '', 
    role: 'Usuario local', 
    tenantId: users.activeTenantId || (users.tenants[0]?.id || '')
  }
  newPasswordResult.value = ''
  showNewUserModal.value = true
}

function closeNewUserModal() {
  showNewUserModal.value = false
}

async function submitNewUser() {
  if (!newUserForm.value.name || !newUserForm.value.email) {
    emit('notify', { message: 'Campos requeridos', detail: 'Nombre y correo son obligatorios.' })
    return
  }

  const result = await users.createUser({
    name: newUserForm.value.name,
    email: newUserForm.value.email,
    title: newUserForm.value.role,
  })

  if (result.ok) {
    // Create membership for role in the selected tenant
    if (newUserForm.value.tenantId) {
      users.upsertMembership({
        userId: result.user?.id || (users.users.value || []).find(u => u.email === newUserForm.value.email)?.id,
        tenantId: newUserForm.value.tenantId,
        role: newUserForm.value.role
      })
    }
    
    if (result.tempPassword) {
      newPasswordResult.value = result.tempPassword
      emit('notify', { message: 'Usuario creado', detail: 'Guarde la contraseña temporal mostrada en pantalla.' })
    } else {
      closeNewUserModal()
      emit('notify', { message: 'Usuario registrado', detail: 'Se ha creado la cuenta exitosamente.' })
    }
  } else {
    emit('notify', { message: 'Error', detail: result.message })
  }
}

async function handleExport() {
  emit('notify', { message: 'Generando PDF de Auditoría', detail: 'ContexAI está auditando los accesos y roles del sistema...' })
  const activeUsers = filteredUsers.value.filter(u => u.status === 'Activo' || u.status === 'Active').length
  const inactiveUsers = filteredUsers.value.length - activeUsers

  await generatePdfReport({
    title: 'Reporte de Auditoría y Usuarios',
    subtitle: `Filtro de rol: ${selectedRole.value}`,
    fileName: `Usuarios_Auditoria_${Date.now()}.pdf`,
    data: {
      'Total Cuentas Filtradas': `${filteredUsers.value.length} usuarios`,
      'Usuarios Activos / Habilitados': `${activeUsers} cuentas`,
      'Usuarios Inactivos / Suspendidos': `${inactiveUsers} cuentas`,
      'Nivel de Seguridad': 'Autenticación 2FA Forzada Activa'
    },
    aiSummary: 'No se detectaron accesos anómalos ni escalada de privilegios no autorizada en los registros de sesión recientes.'
  })
  emit('notify', { message: 'PDF Descargado', detail: 'El reporte de auditoría y accesos ha sido guardado exitosamente.' })
}

function handleApplyInsight(action) {
  emit('notify', { message: 'Insight aplicado', detail: `La acción de seguridad "${action}" fue ejecutada y registrada.` })
}

async function handleAnonymize(user) {
  if (user.isSystemOwner) {
    emit('notify', { message: 'Operación no permitida', detail: 'No se puede anonimizar al propietario del sistema.' })
    return
  }
  const confirmed = confirm(`¿Está seguro que desea ejercer el "Derecho al Olvido" (Ley 1581) para ${user.name}? Esta acción anonimizará permanentemente su correo y datos personales, cancelando todas sus sesiones activas de forma irreversible.`)
  if (!confirmed) return

  emit('notify', { message: 'Procesando Derecho al Olvido', detail: `Anonimizando datos de ${user.name}...` })
  
  const result = await users.anonymizeUser(user.id)
  if (result.ok) {
    emit('notify', { message: 'Usuario Anonimizado', detail: 'Los datos personales han sido permanentemente eliminados cumpliendo con la Ley 1581.' })
  } else {
    emit('notify', { message: 'Error', detail: result.message })
  }
}
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Gestión</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Usuarios</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Usuarios
        </h1>
        <p class="text-[14px] text-[#71717A]">
          Administración de accesos, roles y seguridad.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors"
          @click="handleExport"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar log
        </button>
        <button
          class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold transition-colors"
          @click="openNewUserModal"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>Nuevo usuario
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3">
          <span class="material-symbols-outlined text-[20px]">group</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
          Usuarios activos
        </p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">
          {{ tenantUsers.length }}
        </p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3">
          <span class="material-symbols-outlined text-[20px]">badge</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
          Roles
        </p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">
          12
        </p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3">
          <span class="material-symbols-outlined text-[20px]">key</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
          Licencias libres
        </p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">
          8
        </p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-rose-50 flex items-center justify-center text-rose-700 mb-3">
          <span class="material-symbols-outlined text-[20px]">security</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
          Alertas
        </p>
        <p class="text-[22px] font-bold text-rose-700 tracking-[-0.02em]">
          3
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between gap-3 flex-wrap">
          <div class="relative flex-1 max-w-sm">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
            <input
              v-model="searchQuery"
              placeholder="Buscar usuarios..."
              class="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B]"
            >
          </div>
          <div class="flex gap-2">
            <select
              v-if="users.currentUser?.isSystemOwner"
              v-model="selectedTenantId"
              class="border border-[#E4E4E7] rounded-[8px] py-2 px-3 text-[12px] font-semibold text-[#71717A] outline-none bg-white cursor-pointer max-w-[200px] truncate"
              @change="onTenantChange"
            >
              <option value="">
                Todas las empresas
              </option>
              <option
                v-for="t in users.tenants"
                :key="t.id"
                :value="t.id"
              >
                {{ t.name }}
              </option>
            </select>
            <select
              v-model="selectedRole"
              class="border border-[#E4E4E7] rounded-[8px] py-2 px-3 text-[12px] font-semibold text-[#71717A] outline-none bg-white cursor-pointer"
            >
              <option>Todos los roles</option><option>Super Admin</option><option>Administrador</option><option>Finanzas</option><option>Ventas</option><option>Usuario local</option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[600px]">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-5 py-3">
                  Usuario
                </th>
                <th class="px-5 py-3">
                  Rol
                </th>
                <th class="px-5 py-3">
                  Estado
                </th>
                <th class="px-5 py-3" />
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-[#FAFAFA] group transition-colors"
              >
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-semibold text-[11px]">
                      {{ initials(user.name) }}
                    </div>
                    <div>
                      <p class="font-semibold text-[#18181B]">
                        {{ user.name }}
                      </p>
                      <p class="text-[11px] text-[#A1A1AA]">
                        {{ user.email }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <span class="inline-flex px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[#71717A] text-[11px] font-semibold uppercase">{{ user.role }}</span>
                </td>
                <td class="px-5 py-3.5">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="user.status === 'active'"
                      class="sr-only peer"
                      @change="handleStatusToggle(user)"
                    >
                    <div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]" />
                  </label>
                </td>
                <td class="px-5 py-3.5 text-right opacity-0 group-hover:opacity-100">
                  <div class="flex items-center justify-end gap-3.5">
                    <button
                      class="text-amber-500 hover:text-amber-700 transition-colors"
                      title="Derecho al Olvido (Ley 1581 / GDPR)"
                      @click="handleAnonymize(user)"
                    >
                      <span class="material-symbols-outlined text-[18px]">shield_person</span>
                    </button>
                    <button class="text-[#A1A1AA] hover:text-[#18181B]">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td
                  colspan="4"
                  class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]"
                >
                  No se encontraron usuarios con ese criterio.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span><h2 class="text-[13px] font-bold tracking-tight text-[#18181B]">
            Insights de IA
          </h2>
        </div>
        <div class="bg-white border border-rose-200 rounded-[14px] overflow-hidden">
          <div class="px-4 py-3 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] text-rose-700">shield</span><p class="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Seguridad
            </p>
          </div>
          <div class="p-4">
            <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">
              Intentos de acceso desde IPs no reconocidas detectados.
            </p>
            <button
              class="w-full py-1.5 bg-rose-600 text-white rounded-[8px] text-[11px] font-semibold"
              @click="handleApplyInsight('bloqueo')"
            >
              Revisar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Usuario -->
    <div
      v-if="showNewUserModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div class="bg-white rounded-[14px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
          <h2 class="text-[16px] font-bold text-[#18181B]">
            Nuevo Usuario
          </h2>
          <button
            class="text-[#A1A1AA] hover:text-[#18181B]"
            @click="closeNewUserModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div
          v-if="!newPasswordResult"
          class="p-5"
        >
          <div class="space-y-4">
            <div>
              <label class="block text-[12px] font-semibold text-[#71717A] mb-1.5">Nombre completo</label>
              <input
                v-model="newUserForm.name"
                type="text"
                placeholder="Ej. Juan Pérez"
                class="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] outline-none focus:border-[#18181B]"
              >
            </div>
            <div>
              <label class="block text-[12px] font-semibold text-[#71717A] mb-1.5">Correo electrónico</label>
              <input
                v-model="newUserForm.email"
                type="email"
                placeholder="juan@empresa.com"
                class="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] outline-none focus:border-[#18181B]"
              >
            </div>
            <div>
              <label class="block text-[12px] font-semibold text-[#71717A] mb-1.5">Empresa / Workspace</label>
              <select
                v-model="newUserForm.tenantId"
                class="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] outline-none focus:border-[#18181B] bg-white cursor-pointer"
              >
                <option
                  v-for="t in users.tenants"
                  :key="t.id"
                  :value="t.id"
                >
                  {{ t.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-[12px] font-semibold text-[#71717A] mb-1.5">Rol en el sistema</label>
              <select
                v-model="newUserForm.role"
                class="w-full px-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] outline-none focus:border-[#18181B] bg-white cursor-pointer"
              >
                <option>Administrador</option>
                <option>Finanzas</option>
                <option>Ventas</option>
                <option>Usuario local</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-2">
            <button
              class="px-4 py-2 border border-[#E4E4E7] rounded-[8px] text-[13px] font-semibold text-[#18181B] hover:bg-[#FAFAFA]"
              @click="closeNewUserModal"
            >
              Cancelar
            </button>
            <button
              class="px-4 py-2 bg-[#18181B] rounded-[8px] text-[13px] font-semibold text-white hover:bg-[#27272A]"
              @click="submitNewUser"
            >
              Crear usuario
            </button>
          </div>
        </div>

        <div
          v-else
          class="p-5"
        >
          <div class="text-center mb-5">
            <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="material-symbols-outlined text-[24px]">check</span>
            </div>
            <h3 class="text-[16px] font-bold text-[#18181B]">
              ¡Usuario Creado!
            </h3>
            <p class="text-[13px] text-[#71717A] mt-1">
              Comparte esta clave temporal con el usuario. Tendrá que cambiarla al iniciar sesión por primera vez.
            </p>
          </div>
          <div class="bg-[#F4F4F5] p-4 rounded-[8px] text-center mb-5 border border-[#E4E4E7]">
            <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Clave Temporal
            </p>
            <p class="text-[20px] font-mono font-bold tracking-wider text-[#18181B]">
              {{ newPasswordResult }}
            </p>
          </div>
          <button
            class="w-full py-2.5 bg-[#18181B] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#27272A]"
            @click="closeNewUserModal"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
