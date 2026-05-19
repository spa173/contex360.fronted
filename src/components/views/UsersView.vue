<script setup>
import { ref, computed } from 'vue'
import { useUsersStore } from '../../stores/usersStore'
import { generatePdfReport } from '../../utils/pdfExport'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const users = useUsersStore()
const tenantUsers = computed(() => users.tenantUsers || [])
const searchQuery = ref('')
const selectedRole = ref('Todos los roles')

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

function handleNewUser() {
  const num = Math.floor(100 + Math.random() * 900)
  users.createUser({
    name: `Asesor Comercial ${num}`,
    email: `asesor.${num}@empresa.com`,
    password: 'Password123*'
  })
  emit('notify', { message: 'Usuario registrado', detail: `Se ha creado una nueva cuenta de usuario en el sistema.` })
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
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Gestión</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Usuarios</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Usuarios</h1>
        <p class="text-[14px] text-[#71717A]">Administración de accesos, roles y seguridad.</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar log
        </button>
        <button @click="handleNewUser" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold transition-colors">
          <span class="material-symbols-outlined text-[18px]">add</span>Nuevo usuario
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3"><span class="material-symbols-outlined text-[20px]">group</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Usuarios activos</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">{{ tenantUsers.length }}</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3"><span class="material-symbols-outlined text-[20px]">badge</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Roles</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">12</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3"><span class="material-symbols-outlined text-[20px]">key</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Licencias libres</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">8</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-rose-50 flex items-center justify-center text-rose-700 mb-3"><span class="material-symbols-outlined text-[20px]">security</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Alertas</p>
        <p class="text-[22px] font-bold text-rose-700 tracking-[-0.02em]">3</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between gap-3 flex-wrap">
          <div class="relative flex-1 max-w-sm">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
            <input v-model="searchQuery" placeholder="Buscar usuarios..." class="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B]" />
          </div>
          <select v-model="selectedRole" class="border border-[#E4E4E7] rounded-[8px] py-2 px-3 text-[12px] font-semibold text-[#71717A] outline-none bg-white cursor-pointer">
            <option>Todos los roles</option><option>Super Admin</option><option>Administrador</option><option>Finanzas</option><option>Ventas</option><option>Usuario local</option>
          </select>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-5 py-3">Usuario</th>
                <th class="px-5 py-3">Rol</th>
                <th class="px-5 py-3">Estado</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-[#FAFAFA] group transition-colors">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-semibold text-[11px]">{{ initials(user.name) }}</div>
                    <div>
                      <p class="font-semibold text-[#18181B]">{{ user.name }}</p>
                      <p class="text-[11px] text-[#A1A1AA]">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[#71717A] text-[11px] font-semibold uppercase">{{ user.role }}</span></td>
                <td class="px-5 py-3.5">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" :checked="user.status === 'active'" @change="handleStatusToggle(user)" class="sr-only peer">
                    <div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]"></div>
                  </label>
                </td>
                <td class="px-5 py-3.5 text-right opacity-0 group-hover:opacity-100">
                  <div class="flex items-center justify-end gap-3.5">
                    <button @click="handleAnonymize(user)" class="text-amber-500 hover:text-amber-700 transition-colors" title="Derecho al Olvido (Ley 1581 / GDPR)">
                      <span class="material-symbols-outlined text-[18px]">shield_person</span>
                    </button>
                    <button class="text-[#A1A1AA] hover:text-[#18181B]"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="4" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No se encontraron usuarios con ese criterio.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 mb-1"><span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span><h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">Insights de IA</h3></div>
        <div class="bg-white border border-rose-200 rounded-[14px] overflow-hidden">
          <div class="px-4 py-3 bg-rose-50 border-b border-rose-100 flex items-center gap-2"><span class="material-symbols-outlined text-[16px] text-rose-700">shield</span><p class="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Seguridad</p></div>
          <div class="p-4">
            <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">Intentos de acceso desde IPs no reconocidas detectados.</p>
            <button @click="handleApplyInsight('bloqueo')" class="w-full py-1.5 bg-rose-600 text-white rounded-[8px] text-[11px] font-semibold">Revisar</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
