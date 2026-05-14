
<template>
  <div class="space-y-6">
    <div class="pb-2">
      <h2 class="text-3xl font-bold text-slate-50 mb-1">Usuarios Globales</h2>
      <p class="text-sm text-slate-500">{{ users.length }} usuarios registrados en el sistema</p>
    </div>

    <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-lg shadow-black/10">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-800/50 bg-[#0B0F1A]/50">
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresas</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Acceso</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/30">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-slate-800/20 transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 group-hover:from-emerald-600 group-hover:to-emerald-500 flex items-center justify-center text-white font-semibold text-sm transition-all duration-300">
                    {{ user.name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-200">{{ user.name }}</p>
                    <p class="text-xs text-slate-600">{{ user.title || 'Sin cargo' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-400">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-400">
                {{ user._count?.memberships || 0 }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span 
                    :class="[
                      'px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5',
                      user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    ]"
                  >
                    <div class="w-1.5 h-1.5 rounded-full" :class="user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'"></div>
                    {{ user.status === 'active' ? 'Activo' : 'Inactivo' }}
                  </span>
                  <span v-if="user.isSystemOwner" class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] rounded font-bold uppercase tracking-wide">Root</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(user.lastLoginAt) || 'Nunca' }}
              </td>
              <td class="px-6 py-4">
                <button 
                  class="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
                  @click="$emit('erase', user.id)"
                  :disabled="erasingId === user.id"
                >
                  {{ erasingId === user.id ? 'Borrando...' : 'Anonimizar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!users.length" class="p-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <Users class="w-8 h-8 text-slate-600" />
        </div>
        <p class="text-slate-500">No hay usuarios registrados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users } from 'lucide-vue-next'
import { formatDate } from '../../utils/ui'

defineProps({
  users: {
    type: Array,
    default: () => []
  },
  erasingId: String
})

defineEmits(['erase'])
</script>
