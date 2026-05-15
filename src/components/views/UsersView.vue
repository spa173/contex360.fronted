<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useUsersStore } from '../../stores/usersStore'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const auth = useAuthStore()
const users = useUsersStore()

const searchQuery = ref('')
const selectedRole = ref('Todos')

function handleStatusToggle(user) {
  emit('notify', { message: 'Estado Actualizado', detail: `El acceso para ${user.name} ha sido ${!user.active ? 'activado' : 'desactivado'}.` })
}

function handleApplyInsight(action) {
  emit('notify', { message: 'Insight Procesado', detail: `La acción de ${action} ha sido ejecutada por ContexAI.` })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
    <!-- Main Content Area with Right Sidebar -->
    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Primary Content Canvas -->
      <div class="flex-1 space-y-6 overflow-y-auto pr-2">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight mb-1">Gestión de Usuarios</h1>
            <p class="text-sm text-slate-500">Administración de accesos, roles y seguridad del sistema</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm">
              <span class="material-symbols-outlined text-[18px]">download</span>
              Exportar Log
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md shadow-cyan-100">
              <span class="material-symbols-outlined text-[18px]">add</span>
              Nuevo Usuario
            </button>
          </div>
        </div>

        <!-- KPI Cards Bento -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <span class="material-symbols-outlined">group</span>
              </div>
              <span class="flex items-center text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <span class="material-symbols-outlined text-[14px]">trending_up</span> +2%
              </span>
            </div>
            <h3 class="text-2xl font-bold text-slate-900">142</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Usuarios Activos</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                <span class="material-symbols-outlined">badge</span>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-slate-900">12</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Roles Definidos</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                <span class="material-symbols-outlined">key</span>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-slate-900">8</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Licencias Disponibles</p>
          </div>
          <div class="bg-white border border-rose-200 rounded-xl p-5 shadow-sm border-l-4 border-l-rose-500">
            <div class="flex justify-between items-start mb-4">
              <div class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <span class="material-symbols-outlined">security</span>
              </div>
              <span class="bg-rose-50 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Atención</span>
            </div>
            <h3 class="text-2xl font-bold text-rose-600">3</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Alertas de Seguridad</p>
          </div>
        </div>

        <!-- Data Table Container -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <!-- Toolbar -->
          <div class="p-4 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4 bg-slate-50/20">
            <div class="flex-1 min-w-[250px] relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input v-model="searchQuery" class="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 outline-none" placeholder="Buscar por nombre o correo..."/>
            </div>
            <div class="flex items-center gap-3">
              <select v-model="selectedRole" class="bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-cyan-500/20 outline-none appearance-none">
                <option>Todos los Roles</option>
                <option>Administrador</option>
                <option>Finanzas</option>
                <option>Ventas</option>
              </select>
            </div>
          </div>
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Usuario</th>
                  <th class="px-6 py-3">Rol</th>
                  <th class="px-6 py-3">Último Acceso</th>
                  <th class="px-6 py-3">Estado</th>
                  <th class="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
                <tr v-for="user in users.tenantUsers" :key="user.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-[10px]">
                        {{ user.name.substring(0,2).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900">{{ user.name }}</div>
                        <div class="text-[10px] text-slate-400">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-slate-200 bg-slate-50">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-mono text-slate-400">Hoy, 09:42 AM</td>
                  <td class="px-6 py-4">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" :checked="user.active" @change="handleStatusToggle(user)" class="sr-only peer">
                      <div class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button class="text-slate-300 hover:text-violet-600 transition-colors"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                    <button class="text-slate-300 hover:text-rose-600 transition-colors"><span class="material-symbols-outlined text-[18px]">lock_reset</span></button>
                  </td>
                </tr>
                <tr v-if="users.tenantUsers.length === 0">
                  <td colspan="5" class="px-6 py-10 text-center text-slate-400">No hay usuarios registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="p-4 border-t border-slate-50 bg-white flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Mostrando {{ users.tenantUsers.length }} usuarios</span>
            <div class="flex items-center gap-1">
              <button class="p-1 rounded border border-slate-200 text-slate-300"><span class="material-symbols-outlined text-[18px]">chevron_left</span></button>
              <button class="w-8 h-8 rounded bg-violet-600 text-white font-bold text-[10px]">1</button>
              <button class="p-1 rounded border border-slate-200 text-slate-900"><span class="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: ContexAI Insights -->
      <aside class="w-80 flex flex-col gap-6 shrink-0 border-l border-slate-100 pl-6 h-full overflow-y-auto">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span class="material-symbols-outlined text-violet-600 text-[20px]">auto_awesome</span>
          <h3 class="text-sm font-bold text-slate-900">ContexAI Insights</h3>
        </div>
        
        <div class="space-y-4">
          <!-- Audit Card -->
          <div class="bg-white border border-rose-100 rounded-xl p-4 shadow-sm relative overflow-hidden border-l-4 border-l-rose-500">
            <div class="flex items-start gap-3 mb-2 text-rose-600">
              <span class="material-symbols-outlined text-[18px]">shield_alert</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Seguridad</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed mb-4">
              Se detectaron 2 intentos de acceso inusuales desde IPs no reconocidas para el usuario <strong>j.doe@contex360.com</strong>.
            </p>
            <div class="flex gap-2">
              <button @click="handleApplyInsight('bloqueo')" class="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-rose-600 transition-all">Bloquear</button>
              <button class="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-[9px] font-bold uppercase">Detalles</button>
            </div>
          </div>

          <!-- Optimization Card -->
          <div class="bg-white border border-violet-100 rounded-xl p-4 shadow-sm relative overflow-hidden border-l-4 border-l-violet-600">
            <div class="flex items-start gap-3 mb-2 text-violet-600">
              <span class="material-symbols-outlined text-[18px]">model_training</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Optimización</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed mb-4">
              El usuario <strong>Carlos Mendoza</strong> no ha utilizado el módulo 'Inventario' en los últimos 45 días.
            </p>
            <div class="p-2 bg-violet-50 rounded border border-violet-100 mb-3 text-[10px] text-violet-700 italic">
              Sugerencia: Cambiar rol a 'Finanzas Básico'.
            </div>
            <button @click="handleApplyInsight('rol')" class="w-full py-2 bg-violet-600 text-white rounded-lg text-[9px] font-bold uppercase shadow-sm shadow-violet-100">Aplicar Cambio</button>
          </div>

          <!-- Request Card -->
          <div class="bg-white border border-cyan-100 rounded-xl p-4 shadow-sm relative overflow-hidden border-l-4 border-l-cyan-500">
            <div class="flex items-start gap-3 mb-2 text-cyan-600">
              <span class="material-symbols-outlined text-[18px]">vpn_key</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Solicitud</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed mb-4">
              <strong>Marta Salas</strong> solicita acceso temporal a 'Tesorería' para el cierre de mes.
            </p>
            <div class="flex gap-2">
              <button @click="handleApplyInsight('aprobacion')" class="flex-1 py-1.5 bg-cyan-500 text-white rounded-lg text-[9px] font-bold uppercase">Aprobar</button>
              <button class="flex-1 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-[9px] font-bold uppercase">Rechazar</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
</style>
