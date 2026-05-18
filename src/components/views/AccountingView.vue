<script setup>
import { ref, computed } from 'vue'
import { useAccountingStore } from '../../stores/accountingStore'
import { formatCurrency } from '../../utils/ui'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const accounting = useAccountingStore()
const showAiDiscrepancy = ref(true)
const isReconciling = ref(false)

async function handleApproveEntry() {
  const res = await accounting.createLedgerEntry({
    referenceType: 'bank_charge',
    referenceId: 'TRX-8920',
    description: 'Comisión bancaria',
    amount: 1500,
    lines: [
      { account: '530505', label: 'Gastos bancarios', debit: 1500, credit: 0 },
      { account: '111005', label: 'Banco Bogotá', debit: 0, credit: 1500 }
    ]
  })
  if (res.ok) {
    showAiDiscrepancy.value = false
    emit('notify', { message: 'Asiento contabilizado', detail: 'Se generó y registró el asiento contable por comisión bancaria.' })
  } else {
    emit('notify', { message: 'Error', detail: res.message })
  }
}

function handleIgnoreEntry() {
  showAiDiscrepancy.value = false
  emit('notify', { message: 'Discrepancia ignorada', detail: 'La transacción TRX-8920 permanecerá sin asentar.' })
}

function handleReconcileAi() {
  isReconciling.value = true
  setTimeout(() => {
    isReconciling.value = false
    emit('notify', { message: 'Conciliación IA exitosa', detail: '842 movimientos analizados. 100% de coincidencia bancaria.' })
  }, 1500)
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Operaciones</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Contabilidad</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Libro Mayor y Conciliación</h1>
        <p class="text-[14px] text-[#71717A]">Cuenta 1001-00 · Banco Bogotá Cta Cte</p>
      </div>
      <button @click="handleReconcileAi" :disabled="isReconciling" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] disabled:opacity-50 text-[13px] font-semibold transition-all">
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        {{ isReconciling ? 'Conciliando...' : 'Conciliar con IA' }}
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5"><p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Saldo en bancos</p><p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ formatCurrency(1245600) }}</p><p class="text-[11px] text-emerald-700 font-semibold mt-1">↑ 2.4% vs mes ant.</p></div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5"><p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Movimientos mes</p><p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">842</p><p class="text-[11px] text-[#71717A] mt-1">645 conciliados auto</p></div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5"><p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Partidas pendientes</p><p class="text-[22px] font-bold text-amber-700 tracking-[-0.02em] font-mono">{{ showAiDiscrepancy ? '12' : '11' }}</p><p class="text-[11px] text-amber-700 font-semibold mt-1">Requieren revisión</p></div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5"><p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Diferencia</p><p class="text-[22px] font-bold text-emerald-700 tracking-[-0.02em] font-mono">{{ formatCurrency(0) }}</p><p class="text-[11px] text-emerald-700 font-semibold mt-1">✓ Cuadrado</p></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
          <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Transacciones recientes</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-4 py-3 w-8">IA</th>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Ref</th>
                <th class="px-4 py-3">Concepto</th>
                <th class="px-4 py-3 text-right">Crédito</th>
                <th class="px-4 py-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody class="text-[12px] divide-y divide-[#F4F4F5]">
              <tr class="hover:bg-[#FAFAFA]">
                <td class="px-4 py-3 text-center"><span class="material-symbols-outlined text-[18px] text-emerald-600" style="font-variation-settings: 'FILL' 1;">verified</span></td>
                <td class="px-4 py-3 text-[#71717A]">Hoy</td>
                <td class="px-4 py-3 font-mono text-[#A1A1AA] text-[11px]">TRX-8921</td>
                <td class="px-4 py-3 font-semibold text-[#18181B]">Pago proveedor</td>
                <td class="px-4 py-3 text-right font-mono text-rose-600 font-semibold">{{ formatCurrency(45000) }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold text-[#18181B]">{{ formatCurrency(1245600) }}</td>
              </tr>
              <tr v-if="showAiDiscrepancy" class="bg-rose-50/50 hover:bg-rose-50">
                <td class="px-4 py-3 text-center"><span class="material-symbols-outlined text-[18px] text-amber-600">help</span></td>
                <td class="px-4 py-3 text-[#71717A]">Ayer</td>
                <td class="px-4 py-3 font-mono text-[#A1A1AA] text-[11px]">TRX-8920</td>
                <td class="px-4 py-3 font-semibold text-rose-700">Comisión bancaria</td>
                <td class="px-4 py-3 text-right font-mono text-rose-600 font-semibold">{{ formatCurrency(1500) }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold text-[#18181B]">{{ formatCurrency(1170100) }}</td>
              </tr>
              <tr v-for="entry in accounting.tenantLedgerEntries" :key="entry.id" class="hover:bg-[#FAFAFA]">
                <td class="px-4 py-3 text-center"><span class="material-symbols-outlined text-[18px] text-emerald-600">verified</span></td>
                <td class="px-4 py-3 text-[#71717A]">{{ new Date(entry.entryAt || entry.createdAt).toLocaleDateString() }}</td>
                <td class="px-4 py-3 font-mono text-[#A1A1AA] text-[11px]">{{ entry.referenceId || entry.id }}</td>
                <td class="px-4 py-3 font-semibold text-[#18181B]">{{ entry.description }}</td>
                <td class="px-4 py-3 text-right font-mono text-[#18181B] font-semibold">{{ formatCurrency(entry.amount) }}</td>
                <td class="px-4 py-3 text-right font-mono font-semibold text-[#71717A]">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 mb-1"><span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span><h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">Reconciliación IA</h3></div>
        <div v-if="showAiDiscrepancy" class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden transition-all">
          <div class="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-[16px] text-amber-700">warning</span>
            <p class="text-[12px] font-bold text-amber-700 uppercase tracking-wider">Discrepancia detectada</p>
          </div>
          <div class="p-4">
            <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">Cargo bancario <span class="font-mono font-semibold text-[#18181B]">TRX-8920</span> sin asiento contable.</p>
            <div class="bg-[#FAFAFA] rounded-[10px] p-3 border border-[#F4F4F5] mb-3">
              <p class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">Asiento sugerido</p>
              <div class="space-y-1 font-mono text-[11px]">
                <div class="flex justify-between"><span class="text-[#71717A]">530505 Gastos banc.</span><span class="text-emerald-700">{{ formatCurrency(1500) }}</span></div>
                <div class="flex justify-between pl-3"><span class="text-[#71717A]">111005 Banco</span><span class="text-rose-600">{{ formatCurrency(1500) }}</span></div>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="handleApproveEntry" class="flex-1 py-2 bg-[#2563EB] text-white rounded-[8px] text-[12px] font-semibold hover:bg-[#1D4ED8] transition-colors">Aprobar</button>
              <button @click="handleIgnoreEntry" class="flex-1 py-2 border border-[#E4E4E7] text-[#71717A] rounded-[8px] text-[12px] font-semibold hover:bg-[#FAFAFA] transition-colors">Ignorar</button>
            </div>
          </div>
        </div>
        <div v-else class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-5 text-center">
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-2">
            <span class="material-symbols-outlined text-[20px]">check</span>
          </div>
          <h4 class="text-[13px] font-bold text-[#18181B] mb-1">Todo al día</h4>
          <p class="text-[12px] text-[#71717A]">No hay discrepancias pendientes por revisar.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
