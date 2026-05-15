<script setup>
import { computed } from 'vue'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const store = useThirdPartiesStore()

function handleAction(thirdParty) {
  emit('notify', { message: 'Solicitud Enviada', detail: `Se ha solicitado la actualización de RUT a ${thirdParty.name} vía email.` })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Terceros</h2>
        <p class="text-sm text-slate-500 mt-1">Administración integral de clientes, proveedores y socios de negocio.</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>
        <button class="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-200 hover:bg-cyan-600 transition-all">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Nuevo Tercero
        </button>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      <!-- Main Data Section -->
      <div class="md:col-span-8 lg:col-span-9 flex flex-col gap-6">
        <!-- Filters Bar -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
          <div class="relative flex-grow min-w-[240px]">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-cyan-500/20 outline-none bg-slate-50/50" placeholder="Buscar por nombre, NIT o email..." type="text"/>
          </div>
          <div class="flex items-center gap-2">
            <select class="border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-cyan-500/20 outline-none bg-white">
              <option>Todos los tipos</option>
              <option>Cliente</option>
              <option>Proveedor</option>
            </select>
          </div>
        </div>

        <!-- Data Table -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Entidad</th>
                  <th class="px-6 py-3">NIT / ID</th>
                  <th class="px-6 py-3">Tipo</th>
                  <th class="px-6 py-3 text-right">Límite Crédito</th>
                  <th class="px-6 py-3 text-right">Saldo Actual</th>
                  <th class="px-6 py-3 text-center">Estado</th>
                  <th class="px-6 py-3 text-center">AI Val</th>
                  <th class="px-6 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
                <tr v-for="tp in store.tenantThirdParties" :key="tp.id" class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4 flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                      {{ tp.name.substring(0, 2).toUpperCase() }}
                    </div>
                    <span class="font-bold text-slate-900">{{ tp.name }}</span>
                  </td>
                  <td class="px-6 py-4 font-mono text-slate-400">{{ tp.idNumber }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] uppercase tracking-tighter">
                      {{ tp.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-mono text-right text-slate-400">$ 150.000.000</td>
                  <td class="px-6 py-4 font-mono font-bold text-right text-slate-900">$ 45.200.000</td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center gap-1 text-emerald-600 font-bold text-[9px] uppercase">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="material-symbols-outlined text-violet-500 text-[18px]">verified</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span class="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="store.tenantThirdParties.length === 0">
                  <td colspan="8" class="px-6 py-10 text-center text-slate-400">No hay terceros registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Mostrando {{ store.tenantThirdParties.length }} de 248 registros</span>
            <div class="flex items-center gap-2">
              <button class="p-1 rounded text-slate-300 hover:text-slate-600"><span class="material-symbols-outlined text-[20px]">chevron_left</span></button>
              <button class="p-1 rounded text-slate-900 font-bold"><span class="material-symbols-outlined text-[20px]">chevron_right</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: ContexAI Insights -->
      <div class="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span class="material-symbols-outlined text-violet-600 text-[24px]">auto_awesome</span>
          <h3 class="text-sm font-bold text-slate-900">ContexAI Insights</h3>
        </div>
        
        <!-- AI Card 1 -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group border-l-4 border-l-rose-500">
          <div class="flex items-center gap-2 text-rose-600 mb-3">
            <span class="material-symbols-outlined text-[18px]">gavel</span>
            <h4 class="text-[10px] font-bold uppercase tracking-wider">Validación Legal</h4>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed mb-4">
            El RUT de <strong>TechCorp Solutions</strong> registra una caducidad próxima en su responsabilidad fiscal de IVA.
          </p>
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Hace 2h</span>
            <button @click="handleAction({name: 'TechCorp'})" class="text-[10px] font-bold text-violet-600 hover:text-violet-800 uppercase tracking-widest">Solicitar Actualización</button>
          </div>
        </div>

        <!-- AI Card 2 -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden group border-l-4 border-l-violet-600">
          <div class="flex items-center gap-2 text-violet-600 mb-3">
            <span class="material-symbols-outlined text-[18px]">trending_up</span>
            <h4 class="text-[10px] font-bold uppercase tracking-wider">Comportamiento</h4>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed mb-4">
            <strong>Industrias del Norte S.A.</strong> presenta un patrón de pago anticipado. Se sugiere ofrecer un <span class="font-bold text-cyan-600 bg-cyan-50 px-1 rounded">2.5% de descuento</span> para optimizar flujo.
          </p>
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Confianza: 94%</span>
            <button class="text-[10px] font-bold text-violet-600 hover:text-violet-800 uppercase tracking-widest">Aplicar Política</button>
          </div>
        </div>

        <!-- Quick Metric -->
        <div class="bg-slate-900 rounded-xl p-5 text-white">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Riesgo de Cartera Global</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-2xl font-bold">12%</span>
            <span class="text-[10px] font-bold text-emerald-400 flex items-center">
              <span class="material-symbols-outlined text-[14px]">arrow_downward</span> 2.4%
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
