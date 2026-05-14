
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">Solicitudes de Demo</h2>
        <p class="text-sm text-slate-400">{{ demoRequests.length }} leads registrados</p>
      </div>
      <button class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
        <Calendar class="w-4 h-4" />
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
        class="w-full bg-[#111827] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
      />
    </div>

    <!-- Table -->
    <div class="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/5">
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Empresa</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Contacto</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">NIT / Ciudad</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Creada</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="req in filteredLeads"
              :key="req.id"
              class="hover:bg-white/[0.02] transition-colors"
            >
              <td class="px-6 py-4">
                <p class="text-sm font-medium text-white">{{ req.nombre }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-300">{{ req.empresa }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <p class="text-sm text-slate-300 flex items-center gap-2">
                    <Mail class="w-3.5 h-3.5 text-slate-500" />
                    {{ req.correo }}
                  </p>
                  <p class="text-xs text-slate-500">{{ req.telefono || '—' }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                 <p class="text-sm text-slate-300">{{ req.nit || '—' }}</p>
                 <p class="text-xs text-slate-500">{{ req.ciudad || '—' }}</p>
              </td>
              <td class="px-6 py-4">
                <select
                  class="bg-white/5 border border-white/10 rounded-md text-xs text-slate-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <td class="px-6 py-4 text-sm text-slate-400">{{ formatDate(req.createdAt) }}</td>
              <td class="px-6 py-4">
                <button 
                  v-if="req.estado !== 'convertido' && req.estado !== 'cliente'"
                  class="px-3 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors border border-blue-500/20"
                  @click="$emit('convert', req.id)"
                >
                  Convertir
                </button>
                <span v-else class="text-xs text-slate-500 italic">Convertido</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!demoRequests.length" class="p-12 text-center text-slate-500 italic">
        No hay solicitudes registradas.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Mail, Calendar } from 'lucide-vue-next'
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
