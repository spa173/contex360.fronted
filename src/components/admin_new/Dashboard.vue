
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="pb-2">
      <h2 class="text-3xl font-bold text-slate-50 mb-2">
        Dashboard
      </h2>
      <p class="text-sm text-slate-500">
        Vista general de tu plataforma SaaS
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        v-for="stat in statCards"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :icon="stat.icon"
        :icon-color="stat.iconColor"
        :icon-bg="stat.iconBg"
        :trend="stat.trend"
      />
    </div>

    <!-- Actividad Reciente y Solicitudes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Solicitudes Demo -->
      <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-lg shadow-black/20">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-slate-50">
            Solicitudes de Demo
          </h3>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ demoRequests.length }} leads
          </span>
        </div>
        <div class="space-y-1">
          <div
            v-for="(req, index) in demoRequests.slice(0, 5)"
            :key="index"
            class="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-slate-800/30 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-semibold text-sm group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all">
                {{ req.empresa[0] }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-200">
                  {{ req.empresa }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ req.nombre }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="getStatusClass(req.estado)"
              >
                {{ req.estado }}
              </span>
              <p class="text-xs text-slate-600 mt-1">
                {{ formatDate(req.createdAt) }}
              </p>
            </div>
          </div>
          <div
            v-if="!demoRequests.length"
            class="text-sm text-slate-500 text-center py-8"
          >
            No hay solicitudes recientes.
          </div>
        </div>
      </div>

      <!-- Estado de Cumplimiento -->
      <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-lg shadow-black/20">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-slate-50">
            Cumplimiento ISO
          </h3>
          <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ complianceChecks.filter(c => c.status === 'active' || c.status === 'automated').length }}/{{ complianceChecks.length }}
          </span>
        </div>
        <div class="space-y-3">
          <div
            v-for="check in complianceChecks.slice(0, 6)"
            :key="check.id"
            class="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-slate-800/30 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :class="getComplianceIconBg(check.status)"
            >
              <CheckCircle2
                v-if="check.status === 'active' || check.status === 'automated'"
                class="w-4 h-4 text-emerald-400"
              />
              <AlertCircle
                v-else
                class="w-4 h-4 text-amber-400"
              />
            </div>
            <span class="text-sm text-slate-300 flex-1">{{ check.name || check.label }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="getComplianceClass(check.status)"
            >
              {{ check.status === 'active' || check.status === 'automated' ? 'Activo' : 'Pendiente' }}
            </span>
          </div>
          <div
            v-if="!complianceChecks.length"
            class="text-sm text-slate-500 text-center py-8"
          >
            Cargando controles de cumplimiento...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Building2, Users, FileText, Package, TrendingUp, Activity, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import { formatDate } from '../../utils/ui'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  demoRequests: { type: Array, default: () => [] },
  complianceChecks: { type: Array, default: () => [] }
})

const statCards = computed(() => [
  { title: 'Empresas Activas', value: props.stats?.totalTenants || 0, icon: Building2, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10', trend: '+12%' },
  { title: 'Usuarios Globales', value: props.stats?.totalUsers || 0, icon: Users, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', trend: '+8%' },
  { title: 'Facturas Emitidas', value: props.stats?.totalInvoices || 0, icon: FileText, iconColor: 'text-violet-400', iconBg: 'bg-violet-500/10', trend: '+24%' },
  { title: 'Movimientos', value: props.stats?.totalMovements || 0, icon: Package, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10', trend: '+5%' },
  { title: 'Leads Totales', value: props.stats?.totalDemoRequests || 0, icon: TrendingUp, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10', trend: '+18%' },
  { title: 'Conversiones Hoy', value: props.stats?.demoRequestsConverted || 0, icon: Activity, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/10', trend: '+3%' }
])

const getStatusClass = (status) => {
  const classes = {
    'nuevo': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'contactado': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'demo_agendada': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'aprobado': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'convertido': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'cliente': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  }
  return classes[status] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
}

const getComplianceClass = (status) => {
  return status === 'active' || status === 'automated' 
    ? 'bg-emerald-500/10 text-emerald-400' 
    : 'bg-amber-500/10 text-amber-400'
}

const getComplianceIconBg = (status) => {
  return status === 'active' || status === 'automated' 
    ? 'bg-emerald-500/10' 
    : 'bg-amber-500/10'
}
</script>
