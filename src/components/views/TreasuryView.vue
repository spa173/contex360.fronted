<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { formatCurrency, formatDate } from '@/utils/ui'
import {
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  X,
  Banknote,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next'

defineProps({
  isActive: { type: Boolean, required: true },
})

const emit = defineEmits(['notify'])

const treasury = useTreasuryStore()
const activeTab = ref('all') // 'all' | 'income' | 'expense'
const showModal = ref(false)

// Modal form state
const form = ref({
  type: 'INCOME' as 'INCOME' | 'EXPENSE',
  amount: '',
  description: '',
  category: 'CAJA' as 'CAJA' | 'BANCO' | 'PETTY_CASH',
  reference: '',
  date: new Date().toISOString().slice(0, 10),
})

function openModal(type: 'INCOME' | 'EXPENSE') {
  form.value = {
    type,
    amount: '',
    description: '',
    category: 'CAJA',
    reference: '',
    date: new Date().toISOString().slice(0, 10),
  }
  showModal.value = true
}

async function submitTransaction() {
  if (!form.value.amount || !form.value.description) return
  const result = await treasury.createTransaction({
    type: form.value.type,
    amount: parseFloat(form.value.amount),
    description: form.value.description,
    category: form.value.category,
    reference: form.value.reference || undefined,
    date: form.value.date,
  })
  showModal.value = false
  emit('notify', { message: result.message })
}

const displayedTransactions = computed(() => {
  if (activeTab.value === 'income') return treasury.incomeTransactions
  if (activeTab.value === 'expense') return treasury.expenseTransactions
  return [...treasury.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
})

function categoryIcon(cat: string) {
  if (cat === 'BANCO') return CreditCard
  if (cat === 'PETTY_CASH') return Banknote
  return Landmark
}

function categoryLabel(cat: string) {
  if (cat === 'BANCO') return 'Banco'
  if (cat === 'PETTY_CASH') return 'Caja Menor'
  return 'Caja'
}

onMounted(() => treasury.fetchAll())
</script>

<template>
  <section v-if="isActive" class="min-h-full p-6 md:p-8 animate-in fade-in duration-300">

    <!-- ── HEADER ── -->
    <div class="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <Landmark class="w-6 h-6 text-slate-400" />
          Tesorería
        </h1>
        <p class="text-slate-500 text-sm mt-1">Flujo de caja · Ingresos y egresos · Asientos automáticos</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="treasury.fetchAll()"
          :disabled="treasury.isLoading"
          class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-all disabled:opacity-50"
        >
          <RefreshCw :class="['w-4 h-4', treasury.isLoading ? 'animate-spin' : '']" />
        </button>
        <button
          @click="openModal('INCOME')"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-400 text-sm font-semibold transition-all"
        >
          <Plus class="w-4 h-4" />
          Ingreso
        </button>
        <button
          @click="openModal('EXPENSE')"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/40 text-rose-400 text-sm font-semibold transition-all"
        >
          <Plus class="w-4 h-4" />
          Egreso
        </button>
      </div>
    </div>

    <!-- ── KPI STRIP ── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
      <!-- Balance total -->
      <div class="sm:col-span-1 relative overflow-hidden bg-[#131926] border border-slate-800/60 rounded-2xl p-6">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-700/5 to-transparent pointer-events-none" />
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Saldo Total</p>
        <p
          :class="[
            'text-3xl font-black tracking-tight',
            treasury.balance.balance >= 0 ? 'text-white' : 'text-rose-400',
          ]"
        >
          {{ formatCurrency(treasury.balance.balance) }}
        </p>
        <div class="mt-4 h-px bg-slate-800" />
        <p class="mt-3 text-[11px] text-slate-600">Suma neta de todas las transacciones</p>
      </div>

      <!-- Entradas del mes -->
      <div class="bg-[#131926] border border-slate-800/60 rounded-2xl p-6">
        <div class="flex items-start justify-between mb-3">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entradas del Mes</p>
          <div class="p-1.5 bg-emerald-900/30 rounded-lg border border-emerald-800/40">
            <TrendingUp class="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
        <p class="text-2xl font-black text-emerald-400">{{ formatCurrency(treasury.balance.incomeMonth) }}</p>
        <p class="mt-3 text-[11px] text-slate-600">
          {{ treasury.incomeTransactions.length }} movimiento(s) total
        </p>
      </div>

      <!-- Salidas del mes -->
      <div class="bg-[#131926] border border-slate-800/60 rounded-2xl p-6">
        <div class="flex items-start justify-between mb-3">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Salidas del Mes</p>
          <div class="p-1.5 bg-rose-900/30 rounded-lg border border-rose-800/40">
            <TrendingDown class="w-3.5 h-3.5 text-rose-400" />
          </div>
        </div>
        <p class="text-2xl font-black text-rose-400">{{ formatCurrency(treasury.balance.expenseMonth) }}</p>
        <p class="mt-3 text-[11px] text-slate-600">
          {{ treasury.expenseTransactions.length }} movimiento(s) total
        </p>
      </div>
    </div>

    <!-- ── TRANSACTION FEED ── -->
    <div class="bg-[#131926] border border-slate-800/60 rounded-2xl overflow-hidden">
      <!-- Table header + tab filter -->
      <div class="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between gap-4">
        <h2 class="text-sm font-semibold text-slate-200">Historial de Movimientos</h2>
        <div class="flex bg-[#0f1623] p-0.5 rounded-lg border border-slate-800">
          <button
            v-for="tab in [{ id: 'all', label: 'Todos' }, { id: 'income', label: 'Ingresos' }, { id: 'expense', label: 'Egresos' }]"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-[#1e293b] text-slate-100 shadow border border-slate-700'
                : 'text-slate-500 hover:text-slate-300',
            ]"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="treasury.isLoading" class="py-16 flex flex-col items-center gap-3">
        <RefreshCw class="w-6 h-6 text-slate-600 animate-spin" />
        <p class="text-slate-500 text-sm">Cargando movimientos...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="displayedTransactions.length === 0" class="py-16 flex flex-col items-center gap-4">
        <div class="p-4 bg-slate-800/30 rounded-full">
          <ArrowDownLeft class="w-7 h-7 text-slate-600" />
        </div>
        <div class="text-center">
          <p class="text-slate-400 font-medium">Sin movimientos registrados</p>
          <p class="text-slate-600 text-sm mt-1">Usa los botones de arriba para registrar el primer movimiento.</p>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr class="bg-[#0f1623] text-[10px] uppercase tracking-widest text-slate-600 font-bold border-b border-slate-800/60">
              <th class="px-6 py-3.5">Fecha</th>
              <th class="px-6 py-3.5">Descripción</th>
              <th class="px-6 py-3.5">Cuenta</th>
              <th class="px-6 py-3.5">Referencia</th>
              <th class="px-6 py-3.5 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in displayedTransactions"
              :key="tx.id"
              class="border-b border-slate-800/30 last:border-0 hover:bg-slate-800/20 transition-colors"
            >
              <td class="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                {{ formatDate(tx.date) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div
                    :class="[
                      'w-1.5 h-8 rounded-full shrink-0',
                      tx.type === 'INCOME' ? 'bg-emerald-500/60' : 'bg-rose-500/60',
                    ]"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-200">{{ tx.description }}</p>
                    <p class="text-[10px] text-slate-600 mt-0.5">
                      {{ tx.invoice?.number ? `Factura ${tx.invoice.number}` : tx.purchase?.number ? `Compra ${tx.purchase.number}` : 'Manual' }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1.5 text-xs text-slate-400">
                  <component :is="categoryIcon(tx.category)" class="w-3.5 h-3.5 text-slate-600" />
                  {{ categoryLabel(tx.category) }}
                </div>
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 font-mono">
                {{ tx.reference || '—' }}
              </td>
              <td class="px-6 py-4 text-right">
                <span
                  :class="[
                    'text-sm font-bold tabular-nums',
                    tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400',
                  ]"
                >
                  {{ tx.type === 'INCOME' ? '+' : '−' }}{{ formatCurrency(tx.amount) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ── MODAL: Registrar Movimiento ── -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="showModal = false"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showModal = false" />

      <!-- Panel -->
      <div class="relative w-full max-w-md bg-[#131926] border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div
              :class="[
                'p-2 rounded-lg border',
                form.type === 'INCOME'
                  ? 'bg-emerald-900/30 border-emerald-800/40'
                  : 'bg-rose-900/30 border-rose-800/40',
              ]"
            >
              <component
                :is="form.type === 'INCOME' ? ArrowDownLeft : ArrowUpRight"
                :class="['w-4 h-4', form.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400']"
              />
            </div>
            <h3 class="font-semibold text-slate-100">
              Registrar {{ form.type === 'INCOME' ? 'Ingreso' : 'Egreso' }}
            </h3>
          </div>
          <button @click="showModal = false" class="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Form -->
        <div class="px-6 py-5 space-y-4">
          <!-- Type toggle -->
          <div class="flex bg-[#0f1623] p-1 rounded-xl border border-slate-800">
            <button
              @click="form.type = 'INCOME'"
              :class="[
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                form.type === 'INCOME'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40'
                  : 'text-slate-500 hover:text-slate-300',
              ]"
            >Ingreso</button>
            <button
              @click="form.type = 'EXPENSE'"
              :class="[
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-all',
                form.type === 'EXPENSE'
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-600/40'
                  : 'text-slate-500 hover:text-slate-300',
              ]"
            >Egreso</button>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Monto</label>
            <input
              v-model="form.amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2.5 bg-[#0f1623] border border-slate-800 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Descripción</label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Ej: Pago arriendo oficina"
              class="w-full px-4 py-2.5 bg-[#0f1623] border border-slate-800 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>

          <!-- Category + Date row -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Cuenta</label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2.5 bg-[#0f1623] border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-slate-600 transition-colors"
              >
                <option value="CAJA">Caja</option>
                <option value="BANCO">Banco</option>
                <option value="PETTY_CASH">Caja Menor</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Fecha</label>
              <input
                v-model="form.date"
                type="date"
                class="w-full px-3 py-2.5 bg-[#0f1623] border border-slate-800 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-slate-600 transition-colors"
              />
            </div>
          </div>

          <!-- Reference -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Referencia <span class="text-slate-700 normal-case font-normal">(opcional)</span></label>
            <input
              v-model="form.reference"
              type="text"
              placeholder="No. cheque, transferencia..."
              class="w-full px-4 py-2.5 bg-[#0f1623] border border-slate-800 rounded-lg text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-5 flex gap-3">
          <button
            @click="showModal = false"
            class="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-all"
          >Cancelar</button>
          <button
            @click="submitTransaction"
            :disabled="treasury.isSaving || !form.amount || !form.description"
            :class="[
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2',
              form.type === 'INCOME'
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/50 text-emerald-400'
                : 'bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/50 text-rose-400',
            ]"
          >
            <RefreshCw v-if="treasury.isSaving" class="w-3.5 h-3.5 animate-spin" />
            Registrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }
input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
</style>
