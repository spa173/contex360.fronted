<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { generatePdfReport } from '../../utils/pdfExport'

const isOpen = ref(false)
const filterTab = ref('todas')
const searchQuery = ref('')

const initialAlerts = [
  {
    id: 1,
    type: 'dian',
    level: 'critico',
    title: 'Inconsistencia en factura F-203',
    description: 'Diferencia de $ 450.000 detectada entre la emisión comercial y el XML transmitido a la DIAN. Requiere nota crédito o reenvío.',
    time: 'hace 12 min',
    actionLabel: 'Revisar XML',
    read: false
  },
  {
    id: 2,
    type: 'inventario',
    level: 'advertencia',
    title: 'Stock crítico detectado · 3 SKUs agotados',
    description: 'Los productos Cable UTP Cat6, Router TP-Link AX3000 y Conectores RJ45 llegaron a 0 unidades en Bodega Central.',
    time: 'hace 1 h',
    actionLabel: 'Generar orden de compra',
    read: false
  },
  {
    id: 3,
    type: 'dian',
    level: 'info',
    title: 'DIAN: Lote de 8 facturas aceptado exitosamente',
    description: 'El lote de facturación electrónica del 16-may fue validado y firmado por la autoridad fiscal sin observaciones previas.',
    time: 'hace 2 h',
    actionLabel: 'Ver comprobantes',
    read: true
  },
  {
    id: 4,
    type: 'seguridad',
    level: 'info',
    title: 'Auditoría de seguridad ContexAI',
    description: 'Se detectó un nuevo inicio de sesión exitoso desde la dirección IP 181.52.45.10 (Bogotá, CO). Dispositivo verificado con 2FA.',
    time: 'hace 4 h',
    actionLabel: 'Detalles de sesión',
    read: true
  },
  {
    id: 5,
    type: 'finanzas',
    level: 'advertencia',
    title: 'Vencimiento próximo de obligación bancaria',
    description: 'El pago programado del crédito comercial con Bancolombia ($ 12.500.000) vence en 3 días hábiles. Liquidez proyectada suficiente.',
    time: 'hace 5 h',
    actionLabel: 'Ver flujo de caja',
    read: true
  },
  {
    id: 6,
    type: 'inventario',
    level: 'info',
    title: 'Sugerencia de reabastecimiento inteligente',
    description: 'ContexAI sugiere aumentar el stock máximo de "Monitores IPS 24" debido al incremento del 35% en cotizaciones durante este mes.',
    time: 'hace 1 día',
    actionLabel: 'Aplicar ajuste',
    read: true
  }
]

const alertsList = ref([...initialAlerts])

const unreadCount = computed(() => alertsList.value.filter(a => !a.read).length)

const filteredAlerts = computed(() => {
  let list = alertsList.value
  if (filterTab.value === 'dian') list = list.filter(a => a.type === 'dian' || a.type === 'finanzas')
  if (filterTab.value === 'inventario') list = list.filter(a => a.type === 'inventario')
  if (filterTab.value === 'seguridad') list = list.filter(a => a.type === 'seguridad')

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.description.toLowerCase().includes(q)
    )
  }
  return list
})

function openModal() {
  isOpen.value = true
}

function closeModal() {
  isOpen.value = false
}

function markAllRead() {
  alertsList.value.forEach(a => a.read = true)
}

function toggleRead(id) {
  const alert = alertsList.value.find(a => a.id === id)
  if (alert) alert.read = !alert.read
}

const selectedXmlAlert = ref(null)

async function exportAlerts() {
  await generatePdfReport({
    title: 'Historial de Alertas y Eventos del Sistema',
    subtitle: `Filtro: ${filterTab.value.toUpperCase()}`,
    fileName: `Alertas_Contex360_${Date.now()}.pdf`,
    data: {
      'Total Alertas Registradas': `${alertsList.value.length} eventos`,
      'Alertas Pendientes / Sin Leer': `${unreadCount.value} eventos`,
      'Alertas Críticas': `${alertsList.value.filter(a => a.level === 'critico').length} eventos`
    },
    aiSummary: 'El sistema de monitoreo inteligente ContexAI mantiene la trazabilidad ininterrumpida de todos los eventos operativos, logísticos y fiscales.'
  })
}

function handleAlertAction(alert) {
  alert.read = true
  if (alert.id === 1 || alert.actionLabel.includes('XML')) {
    selectedXmlAlert.value = alert
    return
  }
  if (alert.id === 2 || alert.actionLabel.includes('orden de compra')) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'purchases' }))
    window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Módulo Compras', detail: 'ContexAI ha precargado la orden de compra sugerida.' } }))
    closeModal()
    return
  }
  if (alert.id === 3 || alert.actionLabel.includes('comprobantes')) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'billing' }))
    window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Facturación DIAN', detail: 'Mostrando comprobantes electrónicos sincronizados.' } }))
    closeModal()
    return
  }
  if (alert.id === 4 || alert.actionLabel.includes('sesión')) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'profile' }))
    window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Seguridad de Cuenta', detail: 'Historial de accesos y sesiones activas.' } }))
    closeModal()
    return
  }
  if (alert.id === 5 || alert.actionLabel.includes('flujo de caja')) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'treasury' }))
    window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Tesorería', detail: 'Proyección de liquidez y compromisos próximos.' } }))
    closeModal()
    return
  }
  if (alert.id === 6 || alert.actionLabel.includes('ajuste')) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'inventory' }))
    window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Inventario', detail: 'Sugerencia de reabastecimiento inteligente aplicada.' } }))
    closeModal()
    return
  }
  window.dispatchEvent(new CustomEvent('notify', {
    detail: { message: `Acción: ${alert.actionLabel}`, detail: `Procedimiento ejecutado para: "${alert.title}".` }
  }))
  closeModal()
}

function handleEmitCreditNote() {
  selectedXmlAlert.value = null
  window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'Nota Crédito Emitida', detail: 'Se ha generado y transmitido la Nota Crédito Electrónica a la DIAN.' } }))
  closeModal()
}

function handleResendXml() {
  selectedXmlAlert.value = null
  window.dispatchEvent(new CustomEvent('notify', { detail: { message: 'XML Transmitido', detail: 'El XML corregido fue firmado digitalmente y reenviado a la DIAN con éxito.' } }))
  closeModal()
}

function onGlobalOpen() {
  openModal()
}

onMounted(() => {
  window.addEventListener('open-alerts-modal', onGlobalOpen)
})

onUnmounted(() => {
  window.removeEventListener('open-alerts-modal', onGlobalOpen)
})

defineExpose({ open: openModal, close: closeModal })
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
  >
    <!-- Modal Container -->
    <div
      class="w-full max-w-4xl bg-white rounded-[20px] shadow-2xl border border-[#E4E4E7] flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-300"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-[#E4E4E7] bg-gradient-to-r from-[#FAFAFA] to-white flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-[12px] bg-[#18181B] text-white flex items-center justify-center font-bold shadow-sm">
            <span class="material-symbols-outlined text-[22px]">notifications_active</span>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h2 class="text-[18px] lg:text-[20px] font-extrabold text-[#18181B] tracking-tight">
                Centro de Alertas y Notificaciones
              </h2>
              <span
                v-if="unreadCount > 0"
                class="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[11px] shadow-sm tracking-wider uppercase animate-pulse"
              >
                {{ unreadCount }} nuevas
              </span>
            </div>
            <p class="text-[13px] text-[#71717A]">
              Monitoreo en tiempo real de operaciones, inventario, finanzas y seguridad fiscal.
            </p>
          </div>
        </div>
        <button
          class="w-9 h-9 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition-colors"
          @click="closeModal"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Controls & Filter tabs -->
      <div class="px-6 py-4 border-b border-[#F4F4F5] bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-[#F4F4F5] rounded-[10px] w-full sm:w-auto overflow-x-auto">
          <button
            :class="['px-3.5 py-1.5 text-[12px] font-bold rounded-[8px] transition-colors whitespace-nowrap', filterTab === 'todas' ? 'bg-white text-[#18181B] shadow-sm font-extrabold' : 'text-[#71717A] hover:text-[#18181B]']"
            @click="filterTab = 'todas'"
          >
            Todas
          </button>
          <button
            :class="['px-3.5 py-1.5 text-[12px] font-bold rounded-[8px] transition-colors whitespace-nowrap', filterTab === 'dian' ? 'bg-white text-[#18181B] shadow-sm font-extrabold' : 'text-[#71717A] hover:text-[#18181B]']"
            @click="filterTab = 'dian'"
          >
            Finanzas & DIAN
          </button>
          <button
            :class="['px-3.5 py-1.5 text-[12px] font-bold rounded-[8px] transition-colors whitespace-nowrap', filterTab === 'inventario' ? 'bg-white text-[#18181B] shadow-sm font-extrabold' : 'text-[#71717A] hover:text-[#18181B]']"
            @click="filterTab = 'inventario'"
          >
            Inventario
          </button>
          <button
            :class="['px-3.5 py-1.5 text-[12px] font-bold rounded-[8px] transition-colors whitespace-nowrap', filterTab === 'seguridad' ? 'bg-white text-[#18181B] shadow-sm font-extrabold' : 'text-[#71717A] hover:text-[#18181B]']"
            @click="filterTab = 'seguridad'"
          >
            Seguridad ContexAI
          </button>
        </div>

        <!-- Search -->
        <div class="flex items-center gap-2 border border-[#D4D4D8] rounded-[10px] px-3.5 py-2 w-full sm:w-72 bg-white focus-within:border-[#18181B] transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[17px] text-[#A1A1AA]">search</span>
          <input
            v-model="searchQuery"
            placeholder="Buscar en notificaciones..."
            class="flex-1 bg-transparent text-[12px] outline-none text-[#18181B] placeholder:text-[#A1A1AA]"
          >
        </div>
      </div>

      <!-- Alerts List -->
      <div class="flex-1 overflow-y-auto p-6 space-y-3.5 bg-[#FAFAFA]">
        <div
          v-if="filteredAlerts.length === 0"
          class="text-center py-12 bg-white rounded-[14px] border border-[#E4E4E7]"
        >
          <span class="material-symbols-outlined text-[48px] text-[#D4D4D8] mb-2">notifications_paused</span>
          <h3 class="text-[16px] font-extrabold text-[#18181B]">
            No hay notificaciones para mostrar
          </h3>
          <p class="text-[13px] text-[#71717A] mt-1">
            Intenta con otro término de búsqueda o cambia la pestaña de filtro.
          </p>
        </div>

        <div
          v-for="alert in filteredAlerts"
          :key="alert.id"
          :class="['bg-white border rounded-[16px] p-5 shadow-sm transition-all hover:shadow-md flex items-start gap-4', alert.read ? 'border-[#E4E4E7] opacity-80' : 'border-[#2563EB] ring-2 ring-[#2563EB]/10 bg-gradient-to-r from-[#F8FAFC] to-white']"
        >
          <!-- Level icon / dot -->
          <div :class="['w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5', alert.level === 'critico' ? 'bg-rose-100 text-rose-700' : alert.level === 'advertencia' ? 'bg-amber-100 text-amber-700' : 'bg-[#2563EB]/10 text-[#2563EB]']">
            <span class="material-symbols-outlined text-[20px]">
              {{ alert.level === 'critico' ? 'dangerous' : alert.level === 'advertencia' ? 'warning' : 'info' }}
            </span>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  v-if="!alert.read"
                  class="w-2 h-2 rounded-full bg-[#2563EB]"
                />
                <h3 class="text-[15px] font-extrabold text-[#18181B] leading-tight">
                  {{ alert.title }}
                </h3>
              </div>
              <span class="text-[12px] font-semibold text-[#A1A1AA] flex-shrink-0">{{ alert.time }}</span>
            </div>
            <p class="text-[13px] text-[#52525B] leading-relaxed mb-3">
              {{ alert.description }}
            </p>
            
            <!-- Actions -->
            <div class="flex items-center gap-2 pt-2 border-t border-[#F4F4F5]">
              <button
                class="px-3.5 py-1.5 rounded-[8px] bg-[#18181B] hover:bg-[#27272A] text-white text-[12px] font-bold transition-colors shadow-sm flex items-center gap-1.5"
                @click="handleAlertAction(alert)"
              >
                <span>{{ alert.actionLabel }}</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
              <button
                class="px-3 py-1.5 rounded-[8px] border border-[#E4E4E7] hover:bg-[#FAFAFA] text-[#71717A] text-[12px] font-semibold transition-colors"
                @click="toggleRead(alert.id)"
              >
                {{ alert.read ? 'Marcar como no leída' : 'Marcar como leída' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 border-t border-[#E4E4E7] bg-white flex items-center justify-between gap-4">
        <button
          class="text-[13px] font-bold text-[#71717A] hover:text-[#18181B] flex items-center gap-2"
          @click="markAllRead"
        >
          <span class="material-symbols-outlined text-[18px]">done_all</span>
          Marcar todas como leídas
        </button>
        <button
          class="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[10px] font-extrabold text-[13px] flex items-center gap-2 transition-colors shadow-sm"
          @click="exportAlerts"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar historial en PDF
        </button>
      </div>

      <!-- XML Viewer Modal (Nested) -->
      <div
        v-if="selectedXmlAlert"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div
          class="w-full max-w-3xl bg-[#18181B] text-[#D4D4D8] rounded-[20px] shadow-2xl border border-[#27272A] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          @click.stop
        >
          <div class="px-6 py-4 border-b border-[#27272A] bg-[#18181B] flex items-center justify-between gap-4">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-[20px] text-[#2563EB]">code</span>
              <h3 class="text-[16px] font-bold text-white">
                Inspección de XML Fiscal · {{ selectedXmlAlert.title }}
              </h3>
            </div>
            <button
              class="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors"
              @click="selectedXmlAlert = null"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div class="p-6 bg-[#09090B] font-mono text-[13px] leading-relaxed overflow-x-auto max-h-[50vh] border-b border-[#27272A]">
            <pre class="text-[#38BDF8]">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"&gt;
  &lt;cbc:UBLVersionID&gt;2.1&lt;/cbc:UBLVersionID&gt;
  &lt;cbc:CustomizationID&gt;10&lt;/cbc:CustomizationID&gt;
  &lt;cbc:ID&gt;F-203&lt;/cbc:ID&gt;
  &lt;cbc:IssueDate&gt;2026-05-16&lt;/cbc:IssueDate&gt;
  &lt;cac:AccountingSupplierParty&gt;
    &lt;cbc:CustomerAssignedAccountID&gt;800192334&lt;/cbc:CustomerAssignedAccountID&gt;
  &lt;/cac:AccountingSupplierParty&gt;
  &lt;cac:LegalMonetaryTotal&gt;
    &lt;cbc:LineExtensionAmount currencyID="COP"&gt;&lt;span class="bg-rose-500/20 text-rose-400 px-1 rounded"&gt;18050000.00&lt;/span&gt;&lt;/cbc:LineExtensionAmount&gt;
    &lt;cbc:TaxInclusiveAmount currencyID="COP"&gt;&lt;span class="bg-rose-500/20 text-rose-400 px-1 rounded"&gt;21479500.00&lt;/span&gt;&lt;/cbc:LineExtensionAmount&gt;
  &lt;/cac:LegalMonetaryTotal&gt;
&lt;/Invoice&gt;</pre>
          </div>
          <div class="p-4 bg-[#18181B] flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 text-[12px] text-[#A1A1AA]">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Discrepancia detectada en LegalMonetaryTotal vs Auxiliar Contable</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[12px] rounded-[10px] transition-colors shadow-sm"
                @click="handleEmitCreditNote"
              >
                Generar Nota Crédito Electrónica
              </button>
              <button
                class="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[12px] rounded-[10px] transition-colors shadow-sm"
                @click="handleResendXml"
              >
                Reenviar a DIAN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
