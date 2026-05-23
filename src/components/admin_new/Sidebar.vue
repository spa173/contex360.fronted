
<template>
  <aside class="hidden md:flex w-72 bg-[#131926] border-r border-slate-800/50 flex-col h-screen sticky top-0">
    <!-- Header -->
    <div class="p-6 border-b border-slate-800/50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
          C
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-50">
            Contex360
          </h1>
          <p class="text-xs text-emerald-500 font-medium uppercase tracking-wider">
            Admin Panel
          </p>
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
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group font-medium',
                activeView === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              ]"
              @click="$emit('view-change', item.id)"
            >
              <!-- Indicador vertical 2px -->
              <div
                v-if="activeView === item.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-emerald-500 rounded-r-full"
              />
              
              <component
                :is="item.icon"
                :class="['w-5 h-5 stroke-[1.5]', activeView === item.id ? 'text-emerald-400' : '']"
              />
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
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group font-medium',
                activeView === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              ]"
              @click="$emit('view-change', item.id)"
            >
              <!-- Indicador vertical 2px -->
              <div
                v-if="activeView === item.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-emerald-500 rounded-r-full"
              />
              
              <component
                :is="item.icon"
                :class="['w-5 h-5 stroke-[1.5]', activeView === item.id ? 'text-emerald-400' : '']"
              />
              <span class="text-sm">{{ item.label }}</span>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- User Profile & Exit -->
    <div class="p-4 border-t border-slate-800/50 space-y-2">
      <button 
        class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group border border-transparent hover:border-red-500/20"
        @click="$emit('exit')"
      >
        <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-red-400 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-log-out"
          ><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line
            x1="21"
            x2="9"
            y1="12"
            y2="12"
          /></svg>
        </div>
        <div class="flex-1 text-left">
          <p class="text-sm font-medium">
            Volver al ERP
          </p>
          <p class="text-[10px] text-slate-500 uppercase tracking-tighter">
            Salir de consola
          </p>
        </div>
      </button>

      <button class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 rounded-xl transition-all group">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-emerald-500/10">
          A
        </div>
        <div class="flex-1 text-left">
          <p class="text-sm font-medium text-slate-50">
            Administrador
          </p>
          <p class="text-xs text-slate-500">
            Super Admin
          </p>
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
