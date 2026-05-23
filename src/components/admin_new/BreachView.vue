
<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">
          Alertas de Brecha de Seguridad
        </h2>
        <p class="text-sm text-slate-400">
          Detección y respuesta ante incidentes según Ley 1581
        </p>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertTriangle class="w-5 h-5 text-red-500" />
        <span class="text-sm font-bold text-red-500">{{ breachAlerts.length }} Incidentes Detectados</span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div 
        v-for="alert in breachAlerts" 
        :key="alert.id"
        class="bg-[#14141b] border border-white/5 rounded-xl p-6 hover:border-red-500/20 transition-all group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', alert.severity === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10']">
              <ShieldAlert
                class="w-6 h-6"
                :class="alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'"
              />
            </div>
            <div>
              <h4 class="text-white font-bold">
                {{ alert.action }}
              </h4>
              <p class="text-xs text-slate-500">
                {{ formatDate(alert.occurredAt) }}
              </p>
            </div>
          </div>
          <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border', alert.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20']">
            {{ alert.severity }}
          </span>
        </div>

        <p class="text-sm text-slate-300 mb-6 bg-black/20 p-4 rounded-lg border border-white/5 font-mono">
          {{ alert.description }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-white/5">
          <div class="flex items-center gap-6">
            <div>
              <span class="block text-[10px] text-slate-500 uppercase font-bold mb-1">Entidad</span>
              <span class="text-sm text-white font-medium">{{ alert.entity }}</span>
            </div>
            <div>
              <span class="block text-[10px] text-slate-500 uppercase font-bold mb-1">Actor</span>
              <span class="text-sm text-white font-medium">{{ alert.actor }}</span>
            </div>
          </div>

          <button 
            v-if="!alert.notifiedAt"
            :disabled="notifyingId === alert.id"
            class="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
            @click="$emit('notify', alert.id)"
          >
            <Send
              v-if="notifyingId !== alert.id"
              class="w-4 h-4"
            />
            <RotateCw
              v-else
              class="w-4 h-4 animate-spin"
            />
            {{ notifyingId === alert.id ? 'Notificando...' : 'Notificar Administradores' }}
          </button>
          <div
            v-else
            class="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20"
          >
            <CheckCircle class="w-4 h-4" />
            <span class="text-xs font-bold uppercase">Notificado el {{ formatDate(alert.notifiedAt) }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="!breachAlerts.length"
        class="bg-[#14141b] border border-white/5 rounded-2xl p-20 text-center"
      >
        <ShieldCheck class="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-white mb-2">
          No se han detectado brechas
        </h3>
        <p class="text-slate-400">
          El sistema de monitoreo en tiempo real no ha identificado incidentes de seguridad.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, ShieldAlert, ShieldCheck, Send, RotateCw, CheckCircle } from 'lucide-vue-next'
import { formatDate } from '../../utils/ui'

defineProps({
  breachAlerts: Array,
  notifyingId: String
})

defineEmits(['notify'])
</script>
