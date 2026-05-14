
<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-white mb-1">Dashboard SaaS</h2>
      <p class="text-sm text-slate-400">Vista general de tu plataforma</p>
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
      />
    </div>

    <!-- Actividad Reciente y Solicitudes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-[#111827] border border-white/5 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Solicitudes de Demo</h3>
        <div class="space-y-4">
          <div
            v-for="(req, index) in demoRequests.slice(0, 5)"
            :key="index"
            class="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
          >
            <div>
              <p class="text-sm font-medium text-white">{{ req.empresa }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ req.nombre }} · {{ req.estado }}</p>
            </div>
            <span class="text-xs text-slate-500">{{ formatDate(req.createdAt) }}</span>
          </div>
          <div v-if="!demoRequests.length" class="text-sm text-slate-500 text-center py-4">
            No hay solicitudes recientes.
          </div>
        </div>
      </div>

      <div class="bg-[#111827] border border-white/5 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Estado de Cumplimiento</h3>
        <div class="space-y-4">
          <div v-for="check in complianceChecks.slice(0, 5)" :key="check.id" class="flex items-center gap-3 py-2">
            <CheckCircle2 v-if="check.status === 'active' || check.status === 'automated'" class="w-5 h-5 text-emerald-500" />
            <AlertCircle v-else class="w-5 h-5 text-amber-500" />
            <span class="text-sm text-slate-300">{{ check.name }}</span>
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
  stats: Object,
  demoRequests: Array,
  complianceChecks: Array
})

const statCards = computed(() => [
  { title: 'Total Empresas', value: props.stats?.totalTenants || 0, icon: Building2, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
  { title: 'Usuarios Globales', value: props.stats?.totalUsers || 0, icon: Users, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
  { title: 'Facturas Emitidas', value: props.stats?.totalInvoices || 0, icon: FileText, iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10' },
  { title: 'Movimientos', value: props.stats?.totalMovements || 0, icon: Package, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10' },
  { title: 'Solicitudes Demo', value: props.stats?.totalDemoRequests || 0, icon: TrendingUp, iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10' },
  { title: 'Leads Hoy', value: props.stats?.demoRequestsToday || 0, icon: Activity, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/10' }
])
</script>
