<script setup>
import { computed } from 'vue'
import { useTreasuryStore } from '../../stores/treasuryStore'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const treasury = useTreasuryStore()

const totalBalance = computed(() => treasury.totalBalance || 0)
const projectedFlow = computed(() => treasury.projectedFlow || 0)
const pendingPayments = computed(() => treasury.pendingPaymentsCount || 0)
const pendingCollections = computed(() => treasury.pendingCollectionsCount || 0)

function handleApplyInsight(insightId) {
  emit('notify', { message: 'Insight Aplicado', detail: 'La programación de tesorería ha sido optimizada por ContexAI.' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-bold text-slate-900">Tesorería</h2>
        <p class="text-sm text-slate-500 mt-1">Gestión de liquidez y flujo de caja</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-bold shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>
        <button class="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all text-xs font-bold shadow-md shadow-cyan-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Nuevo Pago
        </button>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Left Column -->
      <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="flex justify-between items-start mb-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saldo Total</span>
              <span class="material-symbols-outlined text-cyan-500 text-[20px]">account_balance</span>
            </div>
            <div class="text-xl font-bold text-slate-900 font-mono">{{ formatCurrency(totalBalance) }}</div>
            <div class="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">trending_up</span> +2.4% vs mes ant.
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div class="flex justify-between items-start mb-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Proyección</span>
              <span class="material-symbols-outlined text-cyan-500 text-[20px]">timeline</span>
            </div>
            <div class="text-xl font-bold text-slate-900 font-mono">30 Días</div>
            <div class="text-[10px] text-slate-400 font-bold mt-2 uppercase">Evaluación Activa</div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-rose-500">
            <div class="flex justify-between items-start mb-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pagos Hoy</span>
              <span class="material-symbols-outlined text-rose-500 text-[20px]">outbox</span>
            </div>
            <div class="text-xl font-bold text-slate-900 font-mono">{{ pendingPayments }}</div>
            <div class="text-[10px] text-slate-400 font-bold mt-2 uppercase">Por procesar</div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-cyan-500">
            <div class="flex justify-between items-start mb-2">
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cobros Hoy</span>
              <span class="material-symbols-outlined text-cyan-500 text-[20px]">inbox</span>
            </div>
            <div class="text-xl font-bold text-slate-900 font-mono">{{ pendingCollections }}</div>
            <div class="text-[10px] text-slate-400 font-bold mt-2 uppercase">Por conciliar</div>
          </div>
        </div>

        <!-- Programming Table -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 class="text-sm font-bold text-slate-900">Programación de Pagos y Obligaciones</h3>
            <button class="text-slate-400 hover:text-cyan-500 transition-colors">
              <span class="material-symbols-outlined">filter_list</span>
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Proveedor</th>
                  <th class="px-6 py-3">Vencimiento</th>
                  <th class="px-6 py-3">Prioridad</th>
                  <th class="px-6 py-3 text-right">Monto</th>
                  <th class="px-6 py-3">Estado</th>
                  <th class="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
                <tr v-for="item in treasury.programmedPayments" :key="item.id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 font-bold">{{ item.vendorName }}</td>
                  <td class="px-6 py-4 text-slate-500">{{ new Date(item.dueDate).toLocaleDateString() }}</td>
                  <td class="px-6 py-4">
                    <span :class="['px-2 py-0.5 rounded text-[9px] font-bold uppercase border', 
                      item.priority === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100']">
                      {{ item.priority }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right font-mono font-bold">{{ formatCurrency(item.amount) }}</td>
                  <td class="px-6 py-4">
                    <span class="flex items-center gap-1">
                      <span :class="['w-2 h-2 rounded-full', item.status === 'Programado' ? 'bg-cyan-500' : 'bg-slate-300']"></span>
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right text-slate-300">
                    <button class="hover:text-violet-600"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
                  </td>
                </tr>
                <tr v-if="treasury.programmedPayments.length === 0">
                  <td colspan="6" class="px-6 py-10 text-center text-slate-400">No hay pagos programados.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="p-3 border-t border-slate-50 text-center">
            <button class="text-[10px] font-bold text-cyan-500 hover:underline uppercase tracking-widest">Ver todos los registros</button>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-span-12 lg:col-span-4">
        <!-- ContexAI Panel -->
        <div class="bg-gradient-to-br from-white to-slate-50 border border-violet-100 rounded-xl shadow-sm overflow-hidden relative">
          <div class="p-5 border-b border-violet-50 flex items-center gap-3 relative z-10">
            <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <h3 class="text-sm font-bold text-slate-900">ContexAI Insights</h3>
          </div>
          <div class="p-5 flex flex-col gap-4 relative z-10">
            <!-- Insight Card 1 -->
            <div class="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-violet-300 transition-colors">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-violet-500 mt-0.5 text-[18px]">lightbulb</span>
                <div>
                  <h4 class="text-[11px] font-bold text-slate-900 uppercase mb-1">Optimización de Flujo</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Mover el pago a 'TechCorp Solutions' al día 25 para evitar déficit temporal proyectado en la cuenta principal.</p>
                  <div class="mt-4 flex gap-2">
                    <button @click="handleApplyInsight(1)" class="px-3 py-1.5 bg-violet-100 text-violet-700 rounded text-[10px] font-bold hover:bg-violet-200 transition-colors">Aplicar cambio</button>
                    <button class="px-3 py-1.5 text-slate-400 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors">Ignorar</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Insight Card 2 -->
            <div class="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-cyan-300 transition-colors">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-cyan-500 mt-0.5 text-[18px]">savings</span>
                <div>
                  <h4 class="text-[11px] font-bold text-slate-900 uppercase mb-1">Oportunidad de Descuento</h4>
                  <p class="text-[11px] text-slate-500 leading-relaxed">Detectada oportunidad de descuento del 5% por pronto pago en factura #4432 si se paga antes del viernes.</p>
                  <div class="mt-4 flex gap-2">
                    <button @click="handleApplyInsight(2)" class="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-bold hover:bg-cyan-200 transition-colors">Programar Pago</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
