
<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-white mb-1">Logs de Auditoría</h2>
      <p class="text-sm text-slate-400">Registro histórico de acciones administrativas</p>
    </div>

    <div class="bg-[#14141b] border border-white/5 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/5">
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actor</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Entidad</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Acción</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Empresa</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Severidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-white/[0.02] transition-colors"
            >
              <td class="px-6 py-4 text-sm text-slate-400 font-mono">
                {{ formatDate(log.at) }}
              </td>
              <td class="px-6 py-4 text-sm text-white">
                {{ log.actorUser?.name || log.actor }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">
                {{ log.entity }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">
                {{ log.action }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ log.tenant?.name || 'Sistema' }}
              </td>
              <td class="px-6 py-4">
                <span 
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                    log.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  ]"
                >
                  {{ log.severity }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!logs.length" class="p-12 text-center text-slate-500 italic">
        No hay logs registrados.
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from '../../utils/ui'

defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})
</script>
