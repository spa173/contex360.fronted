
<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-white mb-1">Usuarios Globales</h2>
      <p class="text-sm text-slate-400">{{ users.length }} usuarios registrados en el sistema</p>
    </div>

    <div class="bg-[#14141b] border border-white/5 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/5">
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Usuario</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Empresas</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Último Acceso</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-white/[0.02] transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
                    {{ user.name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ user.name }}</p>
                    <p class="text-xs text-slate-500 italic">{{ user.title || 'Sin cargo' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">
                {{ user._count?.memberships || 0 }}
              </td>
              <td class="px-6 py-4">
                <span 
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  ]"
                >
                  {{ user.status }}
                </span>
                <span v-if="user.isSystemOwner" class="ml-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Owner</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 font-mono">
                {{ formatDate(user.lastLoginAt) }}
              </td>
              <td class="px-6 py-4">
                <button 
                  class="text-xs text-red-400 hover:text-red-300 transition-colors"
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
      <div v-if="!users.length" class="p-12 text-center text-slate-500 italic">
        No hay usuarios registrados.
      </div>
    </div>
  </div>
</template>

<script setup>
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
