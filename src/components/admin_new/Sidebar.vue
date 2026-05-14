
<template>
  <aside class="w-64 bg-[#0f0f14] border-r border-white/5 flex flex-col h-screen">
    <!-- Header -->
    <div class="p-6 border-b border-white/5">
      <h1 class="text-2xl font-bold text-white">Contex360</h1>
      <p class="text-xs text-emerald-400 mt-1 uppercase tracking-wider">Panel Administrador</p>
    </div>

    <!-- Menu Items -->
    <div class="flex-1 px-3 py-6">
      <div class="space-y-1">
        <p class="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
          SaaS Admin
        </p>
        
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="$emit('view-change', item.id)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 relative group',
            activeView === item.id
              ? 'bg-white/5 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
          ]"
        >
          <!-- Indicador activo -->
          <div
            v-if="activeView === item.id"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full"
          />
          
          <component :is="item.icon" class="w-5 h-5 stroke-[1.5]" />
          <span class="text-sm font-medium">{{ item.label }}</span>
        </button>
      </div>
    </div>

    <!-- User Profile -->
    <div class="p-4 border-t border-white/5">
      <button class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/[0.02] rounded-lg transition-colors">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
          A
        </div>
        <div class="flex-1 text-left">
          <p class="text-sm font-medium text-white">Administrador</p>
          <p class="text-xs text-slate-500">Super Admin</p>
        </div>
        <Settings class="w-4 h-4 stroke-[1.5]" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Building2, Users, Settings, ScrollText, ShieldCheck, AlertTriangle } from 'lucide-vue-next'

defineProps({
  activeView: {
    type: String,
    required: true
  }
})

defineEmits(['view-change'])

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tenants', label: 'Empresas', icon: Building2 },
  { id: 'demo', label: 'Leads / Demos', icon: Users },
  { id: 'logs', label: 'Logs Auditoria', icon: ScrollText },
  { id: 'compliance', label: 'Cumplimiento ISO', icon: ShieldCheck },
  { id: 'breach', label: 'Alertas Seguridad', icon: AlertTriangle }
]
</script>
