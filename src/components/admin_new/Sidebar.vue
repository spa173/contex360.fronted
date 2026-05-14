
<template>
  <aside class="hidden md:flex w-72 bg-[#131926] border-r border-slate-800/50 flex-col h-screen sticky top-0">
    <!-- Header -->
    <div class="p-6 border-b border-slate-800/50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
          C
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-50">Contex360</h1>
          <p class="text-xs text-emerald-500 font-medium uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="flex-1 px-4 py-6">
      <div class="space-y-6">
        <!-- Grupo Principal -->
        <div>
          <p class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Plataforma
          </p>
          <nav class="space-y-1">
            <button
              v-for="item in menuItems.slice(0, 4)"
              :key="item.id"
              @click="$emit('view-change', item.id)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group font-medium',
                activeView === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              ]"
            >
              <!-- Indicador vertical 2px -->
              <div
                v-if="activeView === item.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-emerald-500 rounded-r-full"
              />
              
              <component :is="item.icon" :class="['w-5 h-5 stroke-[1.5]', activeView === item.id ? 'text-emerald-400' : '']" />
              <span class="text-sm">{{ item.label }}</span>
            </button>
          </nav>
        </div>
        
        <!-- Grupo Seguridad -->
        <div>
          <p class="px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Seguridad & Cumplimiento
          </p>
          <nav class="space-y-1">
            <button
              v-for="item in menuItems.slice(4)"
              :key="item.id"
              @click="$emit('view-change', item.id)"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group font-medium',
                activeView === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              ]"
            >
              <!-- Indicador vertical 2px -->
              <div
                v-if="activeView === item.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-emerald-500 rounded-r-full"
              />
              
              <component :is="item.icon" :class="['w-5 h-5 stroke-[1.5]', activeView === item.id ? 'text-emerald-400' : '']" />
              <span class="text-sm">{{ item.label }}</span>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- User Profile -->
    <div class="p-4 border-t border-slate-800/50">
      <button class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-xl transition-all group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-500/10">
          A
        </div>
        <div class="flex-1 text-left">
          <p class="text-sm font-medium text-slate-50">Administrador</p>
          <p class="text-xs text-slate-500">Super Admin</p>
        </div>
        <Settings class="w-4 h-4 stroke-[1.5] group-hover:text-emerald-400 transition-colors" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Building2, Users, Settings, ScrollText, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-vue-next'

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
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'demo', label: 'Leads / Demos', icon: TrendingUp },
  { id: 'logs', label: 'Logs Auditoria', icon: ScrollText },
  { id: 'compliance', label: 'Cumplimiento ISO', icon: ShieldCheck },
  { id: 'breach', label: 'Alertas Seguridad', icon: AlertTriangle }
]
</script>
