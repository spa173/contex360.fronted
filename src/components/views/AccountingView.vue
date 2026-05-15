<script setup>
import { computed } from 'vue'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

function handleApproveEntry() {
  emit('notify', { message: 'Asiento Aprobado', detail: 'Se ha generado el asiento contable por comisión bancaria automáticamente.' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
    <!-- Main Content Area with Right Sidebar -->
    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Primary Content Canvas -->
      <div class="flex-1 space-y-6 overflow-y-auto pr-2 pb-8">
        <!-- Page Header -->
        <div class="flex justify-between items-end">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Libro Mayor y Conciliación</h1>
            <p class="text-sm text-slate-500 mt-1">Periodo: Octubre 2024 • Cuenta: 1001-00 Banco Nación Cta Cte</p>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-all shadow-md shadow-violet-100">
            <span class="material-symbols-outlined text-[18px]">magic_button</span>
            Iniciar Conciliación IA
          </button>
        </div>

        <!-- KPIs Bento Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo en Bancos</p>
            <h3 class="text-xl font-bold text-slate-900 font-mono">{{ formatCurrency(1245600) }}</h3>
            <p class="text-[10px] font-bold text-cyan-600 mt-2 flex items-center gap-1 uppercase">
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span> 2.4% vs mes ant.
            </p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Movimientos Mes</p>
            <h3 class="text-xl font-bold text-slate-900 font-mono">842</h3>
            <p class="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">645 conciliados auto</p>
          </div>
          <div class="bg-white border border-rose-100 rounded-xl p-5 shadow-sm border-l-4 border-l-rose-500">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Partidas Pendientes</p>
            <h3 class="text-xl font-bold text-rose-600 font-mono">12</h3>
            <p class="text-[10px] font-bold text-rose-500 mt-2 flex items-center gap-1 uppercase">
              <span class="material-symbols-outlined text-[14px]">warning</span> Requiere atención
            </p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-emerald-500">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diferencia</p>
            <h3 class="text-xl font-bold text-emerald-600 font-mono">$ 0.00</h3>
            <p class="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase">
              <span class="material-symbols-outlined text-[14px]">check_circle</span> Cuadrado
            </p>
          </div>
        </div>

        <!-- High Density Data Table -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">Transacciones Recientes</h3>
            <div class="flex gap-2">
              <button class="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"><span class="material-symbols-outlined text-[18px]">filter_list</span></button>
              <button class="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"><span class="material-symbols-outlined text-[18px]">download</span></button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Match IA</th>
                  <th class="px-6 py-3">Fecha</th>
                  <th class="px-6 py-3">Referencia</th>
                  <th class="px-6 py-3">Concepto</th>
                  <th class="px-6 py-3 text-right">Débito</th>
                  <th class="px-6 py-3 text-right">Crédito</th>
                  <th class="px-6 py-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 text-center">
                    <span class="material-symbols-outlined text-violet-500 text-[18px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                  </td>
                  <td class="px-6 py-4 text-slate-500">24 Oct 2024</td>
                  <td class="px-6 py-4 font-mono text-slate-400">TRX-8921</td>
                  <td class="px-6 py-4 font-bold">Pago Proveedor - Servicios IT SA</td>
                  <td class="px-6 py-4 text-right font-mono">-</td>
                  <td class="px-6 py-4 text-right font-mono text-rose-600 font-bold">{{ formatCurrency(45000) }}</td>
                  <td class="px-6 py-4 text-right font-mono font-bold">{{ formatCurrency(1245600) }}</td>
                </tr>
                <tr class="hover:bg-slate-50 transition-colors bg-rose-50/30">
                  <td class="px-6 py-4 text-center">
                    <span class="material-symbols-outlined text-slate-300 text-[18px]">help_outline</span>
                  </td>
                  <td class="px-6 py-4 text-slate-500">23 Oct 2024</td>
                  <td class="px-6 py-4 font-mono text-slate-400">TRX-8920</td>
                  <td class="px-6 py-4 font-bold text-rose-600">Comisión Bancaria Mantenimiento</td>
                  <td class="px-6 py-4 text-right font-mono">-</td>
                  <td class="px-6 py-4 text-right font-mono text-rose-600 font-bold">{{ formatCurrency(1500) }}</td>
                  <td class="px-6 py-4 text-right font-mono font-bold">{{ formatCurrency(1170100) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: ContexAI Panel -->
      <aside class="w-80 flex flex-col gap-6 shrink-0 border-l border-slate-100 pl-6 h-full overflow-y-auto">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span class="material-symbols-outlined text-violet-600 text-[20px]">auto_awesome</span>
          <h3 class="text-sm font-bold text-slate-900">Reconciliación IA</h3>
        </div>
        
        <div class="space-y-4">
          <div class="bg-white border border-rose-200 rounded-xl p-5 shadow-sm relative overflow-hidden border-l-4 border-l-rose-500">
            <div class="flex items-start gap-2 mb-3 text-rose-600">
              <span class="material-symbols-outlined text-[18px]">error</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Discrepancia</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed mb-4">
              Se encontró un cargo bancario sin asiento contable correspondiente.
            </p>
            <div class="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <p class="font-mono text-[10px] text-slate-400">TRX-8920 | 23 Oct</p>
              <p class="text-[11px] font-bold text-rose-600 mt-1">-{{ formatCurrency(1500) }}</p>
              <p class="text-[10px] text-slate-500 mt-1">Gasto: Comisión Mantenimiento</p>
            </div>
            
            <div class="p-3 bg-violet-50 rounded-lg border border-violet-100">
              <h5 class="text-[9px] font-bold text-violet-700 uppercase mb-2">Asiento Sugerido</h5>
              <div class="space-y-1">
                <div class="flex justify-between text-[10px] font-mono">
                  <span class="text-slate-600">6502-00 Gastos Banc</span>
                  <span class="text-cyan-600">1.500</span>
                </div>
                <div class="flex justify-between text-[10px] font-mono pl-4">
                  <span class="text-slate-600">1001-00 Banco Nación</span>
                  <span class="text-rose-600">1.500</span>
                </div>
              </div>
              <div class="mt-4 flex gap-2">
                <button @click="handleApproveEntry" class="flex-1 py-1.5 bg-violet-600 text-white rounded text-[10px] font-bold uppercase shadow-sm">Aprobar</button>
                <button class="flex-1 py-1.5 border border-slate-200 text-slate-400 rounded text-[10px] font-bold uppercase">Ignorar</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
</style>
