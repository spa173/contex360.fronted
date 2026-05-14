
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1">Empresas (Tenants)</h2>
        <p class="text-sm text-slate-400">{{ tenants.length }} empresas registradas en la plataforma</p>
      </div>
      <button class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">
        <span class="text-lg">+</span>
        Registrar nuevo Tenant
      </button>
    </div>

    <!-- Search -->
    <div class="relative">
      <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 stroke-[1.5]" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar empresa..."
        class="w-full bg-[#111827] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
      />
    </div>

    <!-- Table -->
    <div class="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/5">
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Empresa</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Prefijo</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Usuarios</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Facturas</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Ciudad</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Estado DIAN</th>
              <th class="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="tenant in filteredTenants"
              :key="tenant.id"
              class="hover:bg-white/[0.02] transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {{ tenant.name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-white">{{ tenant.name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <code class="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">{{ tenant.prefix }}</code>
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">{{ tenant._count?.memberships || 0 }}</td>
              <td class="px-6 py-4 text-sm text-slate-300">{{ tenant._count?.invoices || 0 }}</td>
              <td class="px-6 py-4 text-sm text-slate-300">{{ tenant.city || '—' }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {{ tenant.dianStatus || 'Activa' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button 
                    class="p-2 hover:bg-white/5 rounded-lg transition-colors group" 
                    title="Configurar"
                    @click="$emit('configure', tenant.id)"
                  >
                    <Settings class="w-4 h-4 text-slate-400 group-hover:text-blue-500 stroke-[1.5]" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!tenants.length" class="p-12 text-center text-slate-500 italic">
        No hay empresas registradas.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Settings } from 'lucide-vue-next'

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
