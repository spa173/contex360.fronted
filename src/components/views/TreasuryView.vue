<script setup>
import { ref, computed } from 'vue'
import { useTreasuryStore } from '../../stores/treasuryStore'
import { formatCurrency } from '../../utils/ui'
import { generatePdfReport } from '../../utils/pdfExport'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const treasury = useTreasuryStore()
const totalBalance = computed(() => treasury.totalBalance || 0)
const pendingPayments = computed(() => treasury.pendingPaymentsCount || 0)
const pendingCollections = computed(() => treasury.pendingCollectionsCount || 0)
const programmedPayments = computed(() => treasury.programmedPayments || [])

const showAiInsight = ref(true)

function handleApplyInsight() {
  const vendorName = programmedPayments.value[0]?.vendorName || 'proveedor'
  treasury.applyInsightOptimization()
  showAiInsight.value = false
  emit('notify', { message: 'Insight de IA aplicado', detail: `La fecha y prioridad del pago a ${vendorName} fueron optimizadas por ContexAI.` })
}

function handleIgnoreInsight() {
  showAiInsight.value = false
  emit('notify', { message: 'Insight descartado', detail: 'La programación original se mantendrá sin cambios.' })
}

const showPaymentModal = ref(false)
const newPaymentForm = ref({
  vendorName: '',
  amount: null,
  priority: 'Media',
  dueDate: ''
})

async function submitPayment() {
  if (!newPaymentForm.value.vendorName || !newPaymentForm.value.amount) return
  showPaymentModal.value = false
  await treasury.schedulePayment({
    vendorName: newPaymentForm.value.vendorName,
    amount: newPaymentForm.value.amount,
    priority: newPaymentForm.value.priority,
    dueDate: newPaymentForm.value.dueDate || new Date().toISOString()
  })
  emit('notify', { message: 'Pago programado exitosamente', detail: 'Se ha creado la orden de compra y el proveedor (si era nuevo) correctamente en el sistema.' })
  newPaymentForm.value = { vendorName: '', amount: null, priority: 'Media', dueDate: '' }
}

function handleNewPayment() {
  showPaymentModal.value = true
}

async function handleExport() {
  emit('notify', { message: 'Generando PDF de Tesorería', detail: 'ContexAI está analizando el flujo de liquidez disponible...' })
  const totalProg = programmedPayments.value.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  await generatePdfReport({
    title: 'Reporte de Liquidez y Flujo de Caja',
    subtitle: 'Módulo de Tesorería',
    fileName: `Tesoreria_Contex360_${Date.now()}.pdf`,
    data: {
      'Balance Total Disponible': formatCurrency(totalBalance.value),
      'Pagos Programados Totales': `${programmedPayments.value.length} transacciones`,
      'Monto Total Programado': formatCurrency(totalProg),
      'Cobros Pendientes': `${pendingCollections.value} facturas de clientes`
    },
    aiSummary: treasury.aiInsights?.insight || 'No hay datos suficientes para generar un insight.'
  })
  emit('notify', { message: 'PDF Descargado', detail: 'El reporte de tesorería se generó a partir de datos reales.' })
}

function priorityClass(p) {
  if (p === 'Alta') return 'bg-rose-50 text-rose-700'
  if (p === 'Media') return 'bg-amber-50 text-amber-700'
  if (p === 'Baja') return 'bg-emerald-50 text-emerald-700'
  if (p === 'Optimizada') return 'bg-purple-50 text-purple-700 font-bold'
  return 'bg-[#F4F4F5] text-[#71717A]'
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Finanzas</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Tesorería</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Tesorería</h1>
        <p class="text-[14px] text-[#71717A]">Gestión de liquidez, programación de pagos y flujo de caja.</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
        <button @click="handleNewPayment" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">add</span>Nuevo pago
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3"><span class="material-symbols-outlined text-[20px]">account_balance</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Saldo total</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ formatCurrency(totalBalance) }}</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-3"><span class="material-symbols-outlined text-[20px]">timeline</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Proyección 30d</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ treasury.cashFlowTrend?.projected?.length > 0 ? formatCurrency(treasury.cashFlowTrend.projected[treasury.cashFlowTrend.projected.length - 1].balance) : 'Activa' }}</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-rose-50 flex items-center justify-center text-rose-700 mb-3"><span class="material-symbols-outlined text-[20px]">outbox</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Pagos hoy</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ pendingPayments }}</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-700 mb-3"><span class="material-symbols-outlined text-[20px]">inbox</span></div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Cobros hoy</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ pendingCollections }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#F4F4F5]">
          <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Programación de pagos</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[540px]">
            <thead>
              <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                <th class="px-5 py-3">Proveedor</th>
                <th class="px-5 py-3">Vence</th>
                <th class="px-5 py-3">Prioridad</th>
                <th class="px-5 py-3 text-right">Monto</th>
                <th class="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
              <tr v-for="item in programmedPayments" :key="item.id" class="hover:bg-[#FAFAFA] transition-colors">
                <td class="px-5 py-3.5 font-semibold text-[#18181B]">{{ item.vendorName }}</td>
                <td class="px-5 py-3.5 text-[#71717A]">{{ new Date(item.dueDate).toLocaleDateString() }}</td>
                <td class="px-5 py-3.5"><span :class="['inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase', priorityClass(item.priority)]">{{ item.priority }}</span></td>
                <td class="px-5 py-3.5 text-right font-mono font-semibold">{{ formatCurrency(item.amount) }}</td>
                <td class="px-5 py-3.5"><span class="flex items-center gap-1.5 text-[12px]"><span class="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>{{ item.status }}</span></td>
              </tr>
              <tr v-if="programmedPayments.length === 0">
                <td colspan="5" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No hay pagos programados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 mb-1"><span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span><h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">Insights de IA</h3></div>
        <div v-if="showAiInsight && programmedPayments.length > 0" class="bg-white border border-[#E4E4E7] rounded-[14px] p-4 transition-all">
          <div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-[16px] text-[#2563EB]">lightbulb</span><p class="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">Optimización</p></div>
          <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">{{ treasury.aiInsights?.insight || `Mover el pago a <strong>${programmedPayments[0]?.vendorName}</strong> al día 25 para evitar déficit temporal proyectado.` }}</p>
          <div class="flex gap-2">
            <button @click="handleApplyInsight" class="flex-1 py-1.5 bg-[#2563EB] text-white rounded-[8px] text-[11px] font-semibold hover:bg-[#1D4ED8] transition-colors">Aplicar</button>
            <button @click="handleIgnoreInsight" class="px-3 py-1.5 border border-[#E4E4E7] text-[#71717A] rounded-[8px] text-[11px] font-semibold hover:bg-[#FAFAFA] transition-colors">Ignorar</button>
          </div>
        </div>
        <div v-else class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4 text-center">
          <div class="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto mb-1.5">
            <span class="material-symbols-outlined text-[16px]">verified</span>
          </div>
          <p class="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">Flujo de caja óptimo</p>
          <p class="text-[11px] text-[#71717A] mt-0.5">Programación ajustada exitosamente.</p>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Pago -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white w-[90%] max-w-[400px] rounded-[16px] shadow-2xl border border-[#E4E4E7] overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-5 py-4 border-b border-[#F4F4F5] flex justify-between items-center">
          <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Programar Nuevo Pago</h3>
          <button @click="showPaymentModal = false" class="text-[#A1A1AA] hover:text-[#18181B] transition-colors"><span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <div class="p-5 space-y-4">
          <div>
            <label class="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">Proveedor</label>
            <input v-model="newPaymentForm.vendorName" type="text" placeholder="Ej. Papelería SAS" class="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] text-[13px] text-[#18181B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all">
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">Monto (COP)</label>
            <input v-model.number="newPaymentForm.amount" type="number" placeholder="Ej. 150000" class="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] text-[13px] text-[#18181B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-mono">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">Vencimiento</label>
              <input v-model="newPaymentForm.dueDate" type="date" class="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] text-[13px] text-[#18181B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5">Prioridad</label>
              <select v-model="newPaymentForm.priority" class="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-[8px] text-[13px] text-[#18181B] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all appearance-none">
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>
        </div>
        <div class="px-5 py-4 bg-[#FAFAFA] border-t border-[#F4F4F5] flex justify-end gap-2">
          <button @click="showPaymentModal = false" class="px-4 py-2 border border-[#E4E4E7] bg-white text-[#71717A] rounded-[8px] text-[12px] font-semibold hover:bg-[#F4F4F5] transition-colors">Cancelar</button>
          <button @click="submitPayment" :disabled="!newPaymentForm.vendorName || !newPaymentForm.amount || treasury.isSaving" class="flex items-center justify-center min-w-[120px] px-4 py-2 bg-[#18181B] text-white rounded-[8px] text-[12px] font-semibold hover:bg-[#27272A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <span v-if="treasury.isSaving" class="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
            <span v-else>Guardar Orden</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
