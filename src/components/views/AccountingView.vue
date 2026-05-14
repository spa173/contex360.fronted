<script setup>
import { computed, ref } from 'vue'
import { useAccountingStore } from '@/stores/accountingStore'
import { formatCurrency, formatDate } from '@/utils/ui'
import { 
  BookOpen, 
  BarChart3, 
  PieChart, 
  ArrowRightLeft, 
  FileText, 
  ChevronRight, 
  Wallet, 
  TrendingUp,
  Landmark,
  Receipt
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const store = useAccountingStore()
const activeTab = ref('ledger') // 'ledger', 'balance', 'pnl'

const summary = computed(() =>
  store.tenantLedgerEntries.reduce(
    (accumulator, entry) => {
      entry.lines.forEach((line) => {
        accumulator.debit += line.debit
        accumulator.credit += line.credit

        if (line.account.startsWith('1305')) {
          accumulator.receivable += line.debit - line.credit
        }

        if (line.account.startsWith('4135')) {
          accumulator.revenue += line.credit - line.debit
        }

        if (line.account.startsWith('2408')) {
          accumulator.tax += line.credit - line.debit
        }
      })

      return accumulator
    },
    { debit: 0, credit: 0, receivable: 0, revenue: 0, tax: 0 },
  ),
)
</script>

<template>
  <section v-if="isActive" class="min-h-full p-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen class="w-6 h-6 text-emerald-400" />
          Módulo Contable
        </h1>
        <p class="text-slate-400 text-sm mt-1">Libro mayor, balances y estados financieros certificados</p>
      </div>

      <!-- Tab Navigation -->
      <div class="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
        <button 
          v-for="tab in [{id:'ledger', label:'Libro Diario', icon: ArrowRightLeft}, {id:'balance', label:'Balance', icon: Landmark}, {id:'pnl', label:'P&G', icon: TrendingUp}]" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
            activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Quick Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-[#131926] border border-slate-800/50 p-5 rounded-2xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Wallet class="w-5 h-5" /></div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">CxC Estimada</span>
        </div>
        <p class="text-xl font-bold text-white">{{ formatCurrency(summary.receivable) }}</p>
      </div>
      
      <div class="bg-[#131926] border border-slate-800/50 p-5 rounded-2xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp class="w-5 h-5" /></div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Ingresos (4135)</span>
        </div>
        <p class="text-xl font-bold text-white">{{ formatCurrency(summary.revenue) }}</p>
      </div>

      <div class="bg-[#131926] border border-slate-800/50 p-5 rounded-2xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Receipt class="w-5 h-5" /></div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">IVA por Pagar</span>
        </div>
        <p class="text-xl font-bold text-white">{{ formatCurrency(summary.tax) }}</p>
      </div>

      <div class="bg-[#131926] border border-slate-800/50 p-5 rounded-2xl">
        <div class="flex items-center gap-3 mb-3">
          <div class="p-2 bg-slate-500/10 rounded-lg text-slate-400"><ArrowRightLeft class="w-5 h-5" /></div>
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Partida Doble</span>
        </div>
        <div class="flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', Math.abs(summary.debit - summary.credit) < 1 ? 'bg-emerald-500' : 'bg-rose-500']"></div>
          <p class="text-sm font-medium text-slate-200">
            {{ Math.abs(summary.debit - summary.credit) < 1 ? 'Cuadrado' : 'Descuadrado' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left side: List/Report -->
      <div class="lg:col-span-8">
        
        <!-- Tab: Ledger -->
        <div v-if="activeTab === 'ledger'" class="bg-[#131926] border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
          <div class="p-6 border-b border-slate-800/50 flex items-center justify-between">
            <h2 class="font-semibold text-white">Comprobantes de Diario</h2>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><BarChart3 class="w-4 h-4" /></button>
              <button class="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><FileText class="w-4 h-4" /></button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-800/30 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <th class="px-6 py-4">Fecha</th>
                  <th class="px-6 py-4">Referencia</th>
                  <th class="px-6 py-4">Descripción</th>
                  <th class="px-6 py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr 
                  v-for="entry in store.tenantLedgerEntries" 
                  :key="entry.id"
                  @click="store.selectEntry(entry.id)"
                  :class="[
                    'group cursor-pointer hover:bg-emerald-500/5 transition-all',
                    entry.id === store.selections.entryId ? 'bg-emerald-500/10' : ''
                  ]"
                >
                  <td class="px-6 py-4 text-sm text-slate-400 font-mono">{{ formatDate(entry.createdAt) }}</td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {{ entry.reference }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-400">{{ entry.description }}</td>
                  <td class="px-6 py-4 text-sm font-bold text-white text-right">
                    {{ formatCurrency(entry.lines.reduce((s, l) => s + l.debit, 0)) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab: Balance Sheet -->
        <div v-if="activeTab === 'balance'" class="space-y-6">
          <div v-for="section in [
            { title: 'Activos', data: store.balanceSheet.assets, color: 'text-blue-400' },
            { title: 'Pasivos', data: store.balanceSheet.liabilities, color: 'text-amber-400' },
            { title: 'Patrimonio', data: store.balanceSheet.equity, color: 'text-emerald-400' }
          ]" :key="section.title" class="bg-[#131926] border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
            <div class="p-6 border-b border-slate-800/50 flex items-center justify-between">
              <h2 class="font-semibold text-white">{{ section.title }}</h2>
              <span class="text-sm font-bold" :class="section.color">
                {{ formatCurrency(section.data.reduce((s, n) => s + n.balance, 0)) }}
              </span>
            </div>
            <div class="p-2">
              <div v-for="node in section.data" :key="node.code" class="flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-xl transition-all">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-800">
                    {{ node.code.slice(0, 4) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-200">{{ node.name }}</p>
                    <p class="text-[10px] text-slate-500 font-mono">{{ node.code }}</p>
                  </div>
                </div>
                <span class="text-sm font-semibold text-white">{{ formatCurrency(node.balance) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: P&L -->
        <div v-if="activeTab === 'pnl'" class="bg-[#131926] border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
           <div class="p-8 border-b border-slate-800/50 bg-slate-800/10">
             <div class="flex items-center justify-between mb-8">
               <h2 class="text-xl font-bold text-white">Estado de Resultados</h2>
               <div class="text-right">
                 <p class="text-[10px] text-slate-500 uppercase tracking-tighter">Utilidad Neta</p>
                 <p class="text-2xl font-black text-emerald-400">{{ formatCurrency(store.profitAndLoss.netProfit) }}</p>
               </div>
             </div>

             <div class="space-y-6">
               <div class="flex justify-between items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                 <div class="flex items-center gap-3">
                   <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp class="w-5 h-5" /></div>
                   <span class="text-sm font-semibold text-slate-200">Ingresos Operacionales</span>
                 </div>
                 <span class="text-base font-bold text-white">{{ formatCurrency(store.profitAndLoss.revenue.reduce((s,n) => s+n.balance, 0)) }}</span>
               </div>

               <div class="flex justify-between items-center p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                 <div class="flex items-center gap-3">
                   <div class="p-2 bg-rose-500/10 rounded-lg text-rose-400"><PieChart class="w-5 h-5" /></div>
                   <span class="text-sm font-semibold text-slate-200">Costos y Gastos</span>
                 </div>
                 <span class="text-base font-bold text-white">- {{ formatCurrency(store.profitAndLoss.expenses.reduce((s,n) => s+n.balance, 0) + store.profitAndLoss.costs.reduce((s,n) => s+n.balance, 0)) }}</span>
               </div>
             </div>
           </div>
           <div class="p-6">
             <p class="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Resumen Certificado Contex360</p>
           </div>
        </div>
      </div>

      <!-- Right side: Selection Detail -->
      <div class="lg:col-span-4 space-y-6">
        <div v-if="store.selectedEntry" class="bg-[#131926] border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-right-4">
          <div class="p-6 border-b border-slate-800/50 bg-slate-800/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Detalle de Asiento</span>
              <span class="text-[10px] text-slate-500 font-mono">{{ formatDate(store.selectedEntry.createdAt) }}</span>
            </div>
            <h3 class="text-lg font-bold text-white">{{ store.selectedEntry.reference }}</h3>
            <p class="text-xs text-slate-400 mt-1">{{ store.selectedEntry.description }}</p>
          </div>

          <div class="p-4 space-y-2">
            <div 
              v-for="(line, idx) in store.selectedEntry.lines" 
              :key="idx"
              class="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-bold text-slate-500">{{ line.account }}</span>
                <ChevronRight class="w-3 h-3 text-slate-700" />
              </div>
              <p class="text-xs font-semibold text-slate-200 mb-3">{{ line.label }}</p>
              <div class="flex justify-between items-center">
                <div class="text-center flex-1 border-r border-slate-800">
                  <p class="text-[8px] text-slate-500 uppercase mb-1">Débito</p>
                  <p :class="['text-sm font-bold', line.debit > 0 ? 'text-white' : 'text-slate-600']">
                    {{ line.debit > 0 ? formatCurrency(line.debit) : '—' }}
                  </p>
                </div>
                <div class="text-center flex-1">
                  <p class="text-[8px] text-slate-500 uppercase mb-1">Crédito</p>
                  <p :class="['text-sm font-bold', line.credit > 0 ? 'text-white' : 'text-slate-600']">
                    {{ line.credit > 0 ? formatCurrency(line.credit) : '—' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-slate-900/50 border-t border-slate-800/50 flex justify-between items-center">
            <span class="text-xs font-bold text-slate-400 uppercase">Balance Total</span>
            <span class="text-base font-black text-white">
              {{ formatCurrency(store.selectedEntry.lines.reduce((s, l) => s + l.debit, 0)) }}
            </span>
          </div>
        </div>

        <div v-else class="bg-[#131926] border border-slate-800/50 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
          <div class="p-4 bg-slate-800/50 rounded-full text-slate-600">
            <ArrowRightLeft class="w-8 h-8" />
          </div>
          <p class="text-slate-500 text-sm">Selecciona un comprobante para ver el detalle de las cuentas.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
