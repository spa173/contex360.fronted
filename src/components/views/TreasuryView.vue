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

function handleNewPayment() {
  treasury.schedulePayment({
    vendorName: 'Nuevo Proveedor SAS',
    amount: 3500000,
    priority: 'Alta'
  })
  emit('notify', { message: 'Pago programado', detail: 'Se ha agregado el nuevo pago al calendario de tesorería.' })
}

async function handleExport() {
  emit('notify', { message: 'Generando PDF de Tesorería', detail: 'ContexAI está proyectando el flujo de caja y liquidez disponible...' })
  const totalProg = programmedPayments.value.reduce((s, p) => s + (Number(p.amount) || 0), 0)

  await generatePdfReport({
    title: 'Reporte de Liquidez y Flujo de Caja',
    subtitle: 'Módulo de Tesorería',
    fileName: `Tesoreria_Contex360_${Date.now()}.pdf`,
    data: {
      'Balance Total Disponible': formatCurrency(totalBalance.value),
      'Pagos Programados Totales': `${programmedPayments.value.length} transacciones`,
      'Monto Total Programado': formatCurrency(totalProg),
      'Cobros Pendientes': `${pendingCollections.value} clientes`
    },
    aiSummary: 'El flujo de liquidez proyectado cubre de forma holgada los compromisos a corto plazo para los próximos 30 días.'
  })
  emit('notify', { message: 'PDF Descargado', detail: 'El reporte de tesorería ha sido guardado exitosamente.' })
}

function priorityClass(p) {
  if (p === 'Alta') return 'bg-rose-50 text-rose-700'
  if (p === 'Media') return 'bg-amber-50 text-amber-700'
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
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">Activa</p>
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
          <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">Mover el pago a <strong>{{ programmedPayments[0]?.vendorName }}</strong> al día 25 para evitar déficit temporal proyectado.</p>
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
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
