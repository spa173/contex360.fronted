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
  Receipt,
  RefreshCw,
  ShoppingCart,
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const store = useAccountingStore()
const activeTab = ref('ledger')
const isRefreshing = ref(false)

async function handleRefresh() {
  isRefreshing.value = true
  await store.fetchLedgerEntries()
  isRefreshing.value = false
}

// Flat list of every LedgerLine with its parent entry context — the real Libro Diario
const flatJournalLines = computed(() =>
  store.tenantLedgerEntries.flatMap((entry) =>
    (entry.lines || []).map((line) => ({
      ...line,
      entryId: entry.id,
      entryDate: entry.entryAt || entry.createdAt,
      entryDescription: entry.description,
      referenceType: entry.referenceType,
      referenceId: entry.referenceId,
    })),
  ),
)

const summary = computed(() =>
  store.tenantLedgerEntries.reduce(
    (acc, entry) => {
      entry.lines.forEach((line) => {
        acc.debit += Number(line.debit)
        acc.credit += Number(line.credit)
        if (line.account.startsWith('1305')) acc.receivable += Number(line.debit) - Number(line.credit)
        if (line.account.startsWith('4135')) acc.revenue += Number(line.credit) - Number(line.debit)
        if (line.account.startsWith('2408')) acc.taxIva += Number(line.debit)
        if (line.account === '510000') acc.expenses += Number(line.debit)
      })
      return acc
    },
    { debit: 0, credit: 0, receivable: 0, revenue: 0, taxIva: 0, expenses: 0 },
  ),
)

const isBalanced = computed(() => Math.abs(summary.value.debit - summary.value.credit) < 0.01)

function refTypeLabel(refType) {
  if (refType === 'invoice') return 'Venta'
  if (refType === 'purchase') return 'Compra'
  return refType || '—'
}

function refTypeBadge(refType) {
  if (refType === 'invoice') return 'text-slate-300 bg-slate-700/60 border-slate-600/50'
  if (refType === 'purchase') return 'text-amber-300 bg-amber-900/30 border-amber-700/40'
  return 'text-slate-400 bg-slate-800/50 border-slate-700/50'
}
</script>

<template>
  <section v-if="isActive" class="min-h-full p-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen class="w-6 h-6 text-slate-300" />
          Módulo Contable
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Libro Diario — asientos de Ventas y Compras en tiempo real
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Refresh -->
        <button
          @click="handleRefresh"
          :disabled="isRefreshing"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-xs font-medium disabled:opacity-50"
        >
          <RefreshCw :class="['w-3.5 h-3.5', isRefreshing ? 'animate-spin' : '']" />
          Actualizar
        </button>

        <!-- Tab Navigation -->
        <div class="flex bg-[#0f1623] p-1 rounded-xl border border-slate-800">
          <button
            v-for="tab in [
              { id: 'ledger', label: 'Libro Diario', icon: ArrowRightLeft },
              { id: 'balance', label: 'Balance', icon: Landmark },
              { id: 'pnl', label: 'P&G', icon: TrendingUp },
            ]"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-[#1e293b] text-slate-100 shadow border border-slate-700'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50',
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Bar -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
      <div class="bg-[#131926] border border-slate-800/60 p-4 rounded-xl">
        <div class="flex items-center gap-2 mb-2">
          <Wallet class="w-4 h-4 text-slate-500" />
          <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">CxC</span>
        </div>
        <p class="text-lg font-bold text-white">{{ formatCurrency(summary.receivable) }}</p>
      </div>

      <div class="bg-[#131926] border border-slate-800/60 p-4 rounded-xl">
        <div class="flex items-center gap-2 mb-2">
          <TrendingUp class="w-4 h-4 text-slate-500" />
          <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Ingresos</span>
        </div>
        <p class="text-lg font-bold text-white">{{ formatCurrency(summary.revenue) }}</p>
      </div>

      <div class="bg-[#131926] border border-slate-800/60 p-4 rounded-xl">
        <div class="flex items-center gap-2 mb-2">
          <ShoppingCart class="w-4 h-4 text-slate-500" />
          <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gastos</span>
        </div>
        <p class="text-lg font-bold text-white">{{ formatCurrency(summary.expenses) }}</p>
      </div>

      <div class="bg-[#131926] border border-slate-800/60 p-4 rounded-xl">
        <div class="flex items-center gap-2 mb-2">
          <Receipt class="w-4 h-4 text-slate-500" />
          <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">IVA Desc.</span>
        </div>
        <p class="text-lg font-bold text-white">{{ formatCurrency(summary.taxIva) }}</p>
      </div>

      <div class="bg-[#131926] border border-slate-800/60 p-4 rounded-xl">
        <div class="flex items-center gap-2 mb-2">
          <ArrowRightLeft class="w-4 h-4 text-slate-500" />
          <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Partida</span>
        </div>
        <div class="flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full shrink-0', isBalanced ? 'bg-slate-300' : 'bg-rose-500']"></div>
          <p class="text-sm font-semibold" :class="isBalanced ? 'text-slate-200' : 'text-rose-400'">
            {{ isBalanced ? 'Cuadrado' : 'Descuadrado' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Table / Reports -->
      <div class="lg:col-span-8">

        <!-- ── TAB: LIBRO DIARIO ── -->
        <div
          v-if="activeTab === 'ledger'"
          class="bg-[#131926] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
        >
          <div class="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-800/10">
            <div>
              <h2 class="font-semibold text-slate-100">Libro Diario</h2>
              <p class="text-[11px] text-slate-500 mt-0.5">
                {{ flatJournalLines.length }} líneas ·
                {{ store.tenantLedgerEntries.length }} comprobantes
              </p>
            </div>
            <div class="flex gap-2">
              <button class="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <BarChart3 class="w-4 h-4" />
              </button>
              <button class="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                <FileText class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="flatJournalLines.length === 0" class="py-20 text-center flex flex-col items-center gap-4">
            <div class="p-4 bg-slate-800/40 rounded-full">
              <BookOpen class="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <p class="text-slate-400 font-medium">Sin asientos registrados</p>
              <p class="text-slate-600 text-sm mt-1">
                Los asientos aparecen aquí al emitir facturas de venta o registrar compras.
              </p>
            </div>
          </div>

          <!-- Table: one row per LedgerLine -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr class="bg-[#0f1623] text-[10px] uppercase tracking-widest text-slate-600 font-bold border-b border-slate-800/60">
                  <th class="px-5 py-3.5">Fecha</th>
                  <th class="px-5 py-3.5">Tipo</th>
                  <th class="px-5 py-3.5">Descripción</th>
                  <th class="px-5 py-3.5">Cuenta</th>
                  <th class="px-5 py-3.5">Nombre de Cuenta</th>
                  <th class="px-5 py-3.5 text-right">Débito</th>
                  <th class="px-5 py-3.5 text-right">Crédito</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(line, idx) in flatJournalLines"
                  :key="line.id || idx"
                  @click="store.selectEntry(line.entryId)"
                  :class="[
                    'group cursor-pointer transition-all border-b border-slate-800/30 last:border-0',
                    line.entryId === store.selections.entryId
                      ? 'bg-[#1e293b]'
                      : 'hover:bg-slate-800/20',
                  ]"
                >
                  <td class="px-5 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {{ formatDate(line.entryDate) }}
                  </td>
                  <td class="px-5 py-3">
                    <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-tight', refTypeBadge(line.referenceType)]">
                      {{ refTypeLabel(line.referenceType) }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-xs text-slate-400 max-w-[180px] truncate">
                    {{ line.entryDescription }}
                  </td>
                  <td class="px-5 py-3 text-xs font-mono text-slate-400 group-hover:text-slate-200 transition-colors">
                    {{ line.account }}
                  </td>
                  <td class="px-5 py-3 text-xs text-slate-300">{{ line.label }}</td>
                  <td class="px-5 py-3 text-right text-xs font-semibold">
                    <span v-if="Number(line.debit) > 0" class="text-slate-100">
                      {{ formatCurrency(line.debit) }}
                    </span>
                    <span v-else class="text-slate-700">—</span>
                  </td>
                  <td class="px-5 py-3 text-right text-xs font-semibold">
                    <span v-if="Number(line.credit) > 0" class="text-rose-400">
                      {{ formatCurrency(line.credit) }}
                    </span>
                    <span v-else class="text-slate-700">—</span>
                  </td>
                </tr>
              </tbody>
              <!-- Totals footer -->
              <tfoot>
                <tr class="bg-[#0f1623] border-t border-slate-700/50 text-xs font-bold">
                  <td colspan="5" class="px-5 py-3.5 text-slate-500 uppercase tracking-widest text-[10px]">
                    Totales
                  </td>
                  <td class="px-5 py-3.5 text-right text-slate-100">
                    {{ formatCurrency(summary.debit) }}
                  </td>
                  <td class="px-5 py-3.5 text-right text-rose-400">
                    {{ formatCurrency(summary.credit) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- ── TAB: BALANCE ── -->
        <div v-if="activeTab === 'balance'" class="space-y-4">
          <div
            v-for="section in [
              { title: 'Activos', data: store.balanceSheet.assets, accent: 'text-slate-300' },
              { title: 'Pasivos', data: store.balanceSheet.liabilities, accent: 'text-amber-400' },
              { title: 'Patrimonio', data: store.balanceSheet.equity, accent: 'text-slate-400' },
            ]"
            :key="section.title"
            class="bg-[#131926] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
          >
            <div class="px-6 py-4 border-b border-slate-800/60 bg-slate-800/10 flex items-center justify-between">
              <h2 class="font-semibold text-slate-100">{{ section.title }}</h2>
              <span class="text-sm font-bold" :class="section.accent">
                {{ formatCurrency(section.data.reduce((s, n) => s + n.balance, 0)) }}
              </span>
            </div>
            <div class="p-2">
              <div
                v-for="node in section.data"
                :key="node.code"
                class="flex items-center justify-between p-4 hover:bg-slate-800/30 rounded-xl transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-[#0f1623] border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 font-mono">
                    {{ node.code.slice(0, 4) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-200">{{ node.name }}</p>
                    <p class="text-[10px] text-slate-600 font-mono">{{ node.code }}</p>
                  </div>
                </div>
                <span class="text-sm font-semibold text-slate-100">{{ formatCurrency(node.balance) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── TAB: P&G ── -->
        <div
          v-if="activeTab === 'pnl'"
          class="bg-[#131926] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20"
        >
          <div class="p-8 border-b border-slate-800/60 bg-slate-800/10">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-xl font-bold text-slate-100">Estado de Resultados</h2>
              <div class="text-right">
                <p class="text-[10px] text-slate-600 uppercase tracking-tighter mb-1">Utilidad Neta</p>
                <p :class="['text-2xl font-black', store.profitAndLoss.netProfit >= 0 ? 'text-slate-100' : 'text-rose-400']">
                  {{ formatCurrency(store.profitAndLoss.netProfit) }}
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-800 rounded-lg text-slate-400"><TrendingUp class="w-5 h-5" /></div>
                  <span class="text-sm font-semibold text-slate-200">Ingresos Operacionales</span>
                </div>
                <span class="text-base font-bold text-slate-100">
                  {{ formatCurrency(store.profitAndLoss.revenue.reduce((s, n) => s + n.balance, 0)) }}
                </span>
              </div>

              <div class="flex justify-between items-center p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-800 rounded-lg text-slate-400"><PieChart class="w-5 h-5" /></div>
                  <span class="text-sm font-semibold text-slate-200">Costos y Gastos</span>
                </div>
                <span class="text-base font-bold text-rose-400">
                  - {{ formatCurrency(
                    store.profitAndLoss.expenses.reduce((s, n) => s + n.balance, 0) +
                    store.profitAndLoss.costs.reduce((s, n) => s + n.balance, 0)
                  ) }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-5 text-center">
            <p class="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
              Resumen Certificado Contex360
            </p>
          </div>
        </div>
      </div>

      <!-- Right: Entry Detail -->
      <div class="lg:col-span-4 space-y-6">
        <div
          v-if="store.selectedEntry"
          class="bg-[#131926] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-black/20 animate-in slide-in-from-right-4"
        >
          <div class="px-6 py-4 border-b border-slate-800/60 bg-slate-800/10">
            <div class="flex items-center justify-between mb-1">
              <span
                :class="['text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', refTypeBadge(store.selectedEntry.referenceType)]"
              >
                {{ refTypeLabel(store.selectedEntry.referenceType) }}
              </span>
              <span class="text-[10px] text-slate-600 font-mono">
                {{ formatDate(store.selectedEntry.entryAt || store.selectedEntry.createdAt) }}
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-100 mt-2">{{ store.selectedEntry.description }}</h3>
          </div>

          <div class="p-4 space-y-2">
            <div
              v-for="(line, idx) in store.selectedEntry.lines"
              :key="idx"
              class="p-4 bg-[#0f1623] rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-bold text-slate-500 font-mono">{{ line.account }}</span>
                <ChevronRight class="w-3 h-3 text-slate-700" />
              </div>
              <p class="text-xs font-semibold text-slate-300 mb-3">{{ line.label }}</p>
              <div class="flex justify-between items-center">
                <div class="text-center flex-1 border-r border-slate-800">
                  <p class="text-[8px] text-slate-600 uppercase mb-1">Débito</p>
                  <p :class="['text-sm font-bold', Number(line.debit) > 0 ? 'text-slate-100' : 'text-slate-700']">
                    {{ Number(line.debit) > 0 ? formatCurrency(line.debit) : '—' }}
                  </p>
                </div>
                <div class="text-center flex-1">
                  <p class="text-[8px] text-slate-600 uppercase mb-1">Crédito</p>
                  <p :class="['text-sm font-bold', Number(line.credit) > 0 ? 'text-rose-400' : 'text-slate-700']">
                    {{ Number(line.credit) > 0 ? formatCurrency(line.credit) : '—' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-[#0f1623] border-t border-slate-800/60 flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Débito</span>
            <span class="text-base font-black text-slate-100">
              {{ formatCurrency(store.selectedEntry.lines.reduce((s, l) => s + Number(l.debit), 0)) }}
            </span>
          </div>
        </div>

        <div
          v-else
          class="bg-[#131926] border border-slate-800/60 rounded-2xl p-12 text-center flex flex-col items-center gap-4"
        >
          <div class="p-4 bg-slate-800/30 rounded-full">
            <ArrowRightLeft class="w-8 h-8 text-slate-600" />
          </div>
          <p class="text-slate-500 text-sm leading-relaxed">
            Selecciona una línea del Libro Diario para ver el detalle del comprobante.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }
</style>
