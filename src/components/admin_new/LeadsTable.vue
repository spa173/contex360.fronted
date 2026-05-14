
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2">
      <div>
        <h2 class="text-3xl font-bold text-slate-50 mb-1">Leads & Demos</h2>
        <p class="text-sm text-slate-500">{{ demoRequests.length }} solicitudes registradas</p>
      </div>
      <button class="px-6 py-3 bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5">
        <Calendar class="w-5 h-5" />
        Agendar Demo
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 stroke-[1.5]" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar lead..."
        class="w-full bg-[#0B0F1A] border border-slate-800/50 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all"
      />
    </div>

    <!-- Table -->
    <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-lg shadow-black/10">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-800/50 bg-[#0B0F1A]/50">
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Creado</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/30">
            <tr
              v-for="req in filteredLeads"
              :key="req.id"
              class="hover:bg-slate-800/20 transition-colors group"
            >
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-slate-200">{{ req.nombre }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-400">{{ req.empresa }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-sm text-slate-400 flex items-center gap-2">
                    <Mail class="w-3.5 h-3.5 text-slate-600" />
                    {{ req.correo }}
                  </p>
                  <p class="text-xs text-slate-600">{{ req.telefono || '—' }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                 <p class="text-sm text-slate-400">{{ req.nit || '—' }}</p>
                 <p class="text-xs text-slate-600">{{ req.ciudad || '—' }}</p>
              </td>
              <td class="px-6 py-4">
                <select
                  class="bg-[#0B0F1A] border border-slate-700/50 rounded-lg text-xs text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all cursor-pointer"
                  @change="$emit('update-status', req.id, $event.target.value)"
                >
                  <option value="nuevo" :selected="req.estado === 'nuevo'">Nuevo</option>
                  <option value="contactado" :selected="req.estado === 'contactado'">Contactado</option>
                  <option value="demo_agendada" :selected="req.estado === 'demo_agendada'">Demo agendada</option>
                  <option value="aprobado" :selected="req.estado === 'aprobado'">Aprobado</option>
                  <option value="convertido" :selected="req.estado === 'convertido'">Convertido</option>
                  <option value="cliente" :selected="req.estado === 'cliente'">Cliente</option>
                </select>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ formatDate(req.createdAt) }}</td>
              <td class="px-6 py-4">
                <button 
                  v-if="req.estado !== 'convertido' && req.estado !== 'cliente'"
                  class="px-4 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500/30"
                  @click="$emit('convert', req.id)"
                >
                  Convertir
                </button>
                <span v-else class="text-xs text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle class="w-3.5 h-3.5" />
                  Convertido
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!demoRequests.length" class="p-12 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <TrendingUp class="w-8 h-8 text-slate-600" />
        </div>
        <p class="text-slate-500">No hay solicitudes registradas.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Mail, Calendar, CheckCircle, TrendingUp } from 'lucide-vue-next'
import { formatDate } from '../../utils/ui'

const props = defineProps({
  demoRequests: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update-status', 'convert'])

const searchQuery = ref('')

const filteredLeads = computed(() => {
  return props.demoRequests.filter(req =>
    req.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    req.empresa.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    req.correo.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
