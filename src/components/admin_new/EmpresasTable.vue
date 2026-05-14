
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2">
      <div>
        <h2 class="text-3xl font-bold text-slate-50 mb-1">Empresas</h2>
        <p class="text-sm text-slate-500">{{ tenants.length }} empresas registradas en la plataforma</p>
      </div>
      <button class="px-6 py-3 bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5">
        <Plus class="w-5 h-5" />
        Nueva Empresa
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 stroke-[1.5]" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar empresa..."
        class="w-full bg-[#0B0F1A] border border-slate-800/50 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all"
      />
    </div>

    <!-- Table -->
    <div class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-lg shadow-black/10">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-800/50 bg-[#0B0F1A]/50">
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prefijo</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuarios</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Facturas</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ciudad</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th class="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/30">
            <tr
              v-for="tenant in filteredTenants"
              :key="tenant.id"
              class="hover:bg-slate-800/20 transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 group-hover:from-emerald-600 group-hover:to-emerald-500 flex items-center justify-center text-white font-semibold transition-all duration-300">
                    {{ tenant.name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-200">{{ tenant.name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <code class="text-xs text-slate-500 font-mono bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/50">{{ tenant.prefix }}</code>
              </td>
              <td class="px-6 py-4 text-sm text-slate-400">{{ tenant._count?.memberships || 0 }}</td>
              <td class="px-6 py-4 text-sm text-slate-400">{{ tenant._count?.invoices || 0 }}</td>
              <td class="px-6 py-4 text-sm text-slate-400">{{ tenant.city || '—' }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2"></div>
                  {{ tenant.dianStatus || 'Activa' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button 
                    class="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors group" 
                    title="Configurar"
                    @click="$emit('configure', tenant.id)"
                  >
                    <Settings class="w-4 h-4 text-slate-500 group-hover:text-emerald-400 stroke-[1.5] transition-colors" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!tenants.length" class="p-12 text-center text-slate-500">
        <div class="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
          <Building2 class="w-8 h-8 text-slate-600" />
        </div>
        <p class="text-slate-500">No hay empresas registradas.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Settings, Plus, Building2 } from 'lucide-vue-next'

const props = defineProps({
  tenants: {
    type: Array,
    default: () => []
  }
})

defineEmits(['configure'])

const searchQuery = ref('')

const filteredTenants = computed(() => {
  return props.tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    tenant.prefix.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>
