
<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold text-white mb-1">Cumplimiento ISO 27001 / Ley 1581</h2>
      <p class="text-sm text-slate-400">Control de controles técnicos y evidencias de auditoría</p>
    </div>

    <!-- Checks Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="check in complianceChecks" 
        :key="check.id"
        class="bg-[#111827] border border-white/5 rounded-xl p-6 relative overflow-hidden group"
      >
        <div class="flex items-center justify-between mb-4">
          <Shield class="w-5 h-5 text-emerald-500" />
          <span 
            :class="[
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border',
              check.status === 'active' || check.status === 'automated' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            ]"
          >
            {{ check.status }}
          </span>
        </div>
        <h4 class="text-white font-semibold mb-2">{{ check.name }}</h4>
        <p class="text-xs text-slate-400 mb-4 line-clamp-2">{{ check.description }}</p>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-[10px] text-slate-500 font-mono">{{ check.id }}</span>
          <span class="text-[10px] text-emerald-500 font-semibold">{{ check.evidenceCount }} Evidencias</span>
        </div>
      </div>
    </div>

    <!-- Access Review Section -->
    <div v-if="accessReview" class="bg-[#111827] border border-white/5 rounded-xl p-8">
      <div class="flex items-start justify-between mb-8">
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Revisión de Accesos (Access Review)</h3>
          <p class="text-sm text-slate-400">Control preventivo para mitigar riesgos de privilegios excesivos</p>
        </div>
        <button 
          @click="$emit('run-review')"
          :disabled="runningReview"
          class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <RotateCw v-if="runningReview" class="w-4 h-4 animate-spin" />
          <Play v-else class="w-4 h-4" />
          {{ runningReview ? 'Ejecutando...' : 'Ejecutar Revisión' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div v-for="finding in accessReview.findings" :key="finding.label" class="bg-white/5 rounded-lg p-4 flex items-center justify-between">
             <div class="flex items-center gap-3">
               <div :class="['w-2 h-2 rounded-full', finding.severity === 'high' ? 'bg-red-500' : 'bg-amber-500']"></div>
               <span class="text-sm text-slate-200">{{ finding.label }}</span>
             </div>
             <span class="text-lg font-bold text-white">{{ finding.count }}</span>
          </div>
        </div>

        <div class="bg-black/20 rounded-xl p-4 overflow-hidden border border-white/5">
          <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Ejecuciones Recientes</h4>
          <div class="space-y-3">
            <div v-for="run in accessReview.recentRuns" :key="run.id" class="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0">
               <span class="text-slate-400">{{ formatDate(run.at) }}</span>
               <span class="text-white font-medium">{{ run.actor }}</span>
               <span :class="['px-1.5 py-0.5 rounded uppercase font-bold text-[9px]', run.severity === 'info' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400']">
                 {{ run.severity }}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Shield, RotateCw, Play } from 'lucide-vue-next'
import { formatDate } from '../../utils/ui'

defineProps({
  complianceChecks: Array,
  accessReview: Object,
  runningReview: Boolean
})

defineEmits(['run-review'])
</script>
