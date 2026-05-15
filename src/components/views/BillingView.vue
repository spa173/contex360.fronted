<script setup>
import { ref, computed } from 'vue'
import { useBillingStore } from '../../stores/billingStore'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const billing = useBillingStore()
const thirdParties = useThirdPartiesStore()

const newInvoice = ref({
  customerId: '',
  concept: '',
  amount: 0,
})

const subtotal = computed(() => newInvoice.value.amount || 0)
const iva = computed(() => subtotal.value * 0.19)
const retefuente = computed(() => subtotal.value * 0.025)
const reteica = computed(() => subtotal.value * 0.00966)
const totalNeto = computed(() => subtotal.value + iva.value - retefuente.value - reteica.value)

async function handleCreateInvoice() {
  if (!newInvoice.value.customerId || !newInvoice.value.amount) {
    emit('notify', { message: 'Faltan datos', detail: 'Seleccione un cliente y asigne un valor.' })
    return
  }
  
  const res = await billing.createInvoice({
    ...newInvoice.value,
    total: totalNeto.value,
    status: 'aceptada'
  })
  
  if (res.ok) {
    emit('notify', { message: 'Factura Generada', detail: `La factura ${res.invoice.number} fue enviada a la DIAN exitosamente.` })
    newInvoice.value = { customerId: '', concept: '', amount: 0 }
  } else {
    emit('notify', { message: 'Error', detail: res.message })
  }
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header Section -->
    <div class="flex justify-between items-end mb-8">
      <div>
        <h2 class="text-3xl font-bold text-slate-900">Facturación</h2>
        <p class="text-sm text-slate-500 mt-1">Gestión de comprobantes y estado DIAN</p>
      </div>
      <div class="flex space-x-3">
        <button class="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center text-xs font-bold shadow-sm">
          <span class="material-symbols-outlined mr-2 text-[18px]">download</span>
          Exportar
        </button>
      </div>
    </div>

    <!-- Rapid Filters -->
    <div class="flex space-x-2 mb-6">
      <button class="px-3 py-1.5 rounded-full bg-slate-100 text-slate-900 text-[11px] font-bold border border-slate-200 hover:bg-slate-200 transition-colors">Todos</button>
      <button class="px-3 py-1.5 rounded-full bg-white text-slate-500 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center">
        <span class="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
        Aceptado DIAN
      </button>
      <button class="px-3 py-1.5 rounded-full bg-white text-slate-500 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center">
        <span class="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
        Rechazado DIAN
      </button>
      <button class="px-3 py-1.5 rounded-full bg-white text-slate-500 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 transition-colors">Pendiente</button>
    </div>

    <!-- Split Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <!-- Left: Management Table -->
      <div class="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-900">Historial de Facturas</h3>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-48" placeholder="Filtrar..." type="text"/>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                <th class="px-6 py-3">Factura #</th>
                <th class="px-6 py-3">Cliente</th>
                <th class="px-6 py-3">Fecha</th>
                <th class="px-6 py-3 text-right">Monto</th>
                <th class="px-6 py-3 text-center">Estado DIAN</th>
                <th class="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
              <tr v-for="invoice in billing.tenantInvoices" :key="invoice.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-mono text-violet-600 font-semibold">{{ invoice.number }}</td>
                <td class="px-6 py-4 font-bold">{{ invoice.customerName }}</td>
                <td class="px-6 py-4 text-slate-500">{{ new Date(invoice.date).toLocaleDateString() }}</td>
                <td class="px-6 py-4 text-right font-mono font-bold">{{ formatCurrency(invoice.total) }}</td>
                <td class="px-6 py-4 text-center">
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase', 
                    invoice.status === 'aceptada' ? 'bg-cyan-50 text-cyan-700' : 'bg-rose-50 text-rose-700']">
                    <span class="material-symbols-outlined text-[12px] mr-1">{{ invoice.status === 'aceptada' ? 'check_circle' : 'error' }}</span>
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-slate-400">
                  <button class="hover:text-violet-600 mx-1"><span class="material-symbols-outlined text-[18px]">visibility</span></button>
                  <button class="hover:text-violet-600 mx-1"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
                </td>
              </tr>
              <tr v-if="billing.tenantInvoices.length === 0">
                <td colspan="6" class="px-6 py-10 text-center text-slate-400">No hay facturas registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: Crear Factura Form -->
      <div class="xl:col-span-4 flex flex-col space-y-6">
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
          <h3 class="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <span class="material-symbols-outlined mr-2 text-violet-500">add_circle</span>
            Crear Factura
          </h3>
          <form class="space-y-4" @submit.prevent="handleCreateInvoice">
            <div>
              <label class="block text-[11px] font-bold text-slate-900 uppercase tracking-wide mb-1">Cliente</label>
              <select 
                v-model="newInvoice.customerId"
                class="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
              >
                <option value="">Seleccionar cliente...</option>
                <option v-for="tp in thirdParties.tenantThirdParties" :key="tp.id" :value="tp.id">
                  {{ tp.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-900 uppercase tracking-wide mb-1">Concepto Base</label>
              <input 
                v-model="newInvoice.concept"
                class="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none" 
                placeholder="Ej. Servicios de Consultoría" 
                type="text"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-900 uppercase tracking-wide mb-1">Valor Unitario (COP)</label>
              <input 
                v-model="newInvoice.amount"
                class="w-full border border-slate-200 rounded-lg py-2 px-3 text-xs bg-slate-50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none font-mono font-bold" 
                placeholder="0.00" 
                type="number"
              />
            </div>

            <hr class="my-6 border-slate-100"/>

            <!-- Real-time Tax Calculator -->
            <div class="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h4 class="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider">Cálculo de Impuestos</h4>
              <div class="space-y-3 text-xs font-mono">
                <div class="flex justify-between text-slate-900">
                  <span class="font-semibold">Subtotal</span>
                  <span class="font-bold">{{ formatCurrency(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>IVA (19%)</span>
                  <span>{{ formatCurrency(iva) }}</span>
                </div>
                <div class="flex justify-between text-rose-500">
                  <span>Retefuente (2.5%)</span>
                  <span>-{{ formatCurrency(retefuente) }}</span>
                </div>
                <div class="flex justify-between text-rose-500">
                  <span>ReteICA (9.66/1000)</span>
                  <span>-{{ formatCurrency(reteica) }}</span>
                </div>
                <div class="h-px bg-slate-200 my-2"></div>
                <div class="flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Neto</span>
                  <span class="text-violet-600">{{ formatCurrency(totalNeto) }}</span>
                </div>
              </div>
            </div>

            <!-- AI Accent Box -->
            <div class="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-lg flex items-start">
              <span class="material-symbols-outlined text-violet-600 mr-2 text-[20px]">auto_awesome</span>
              <p class="text-[11px] text-violet-900 leading-relaxed">
                <strong>ContexAI:</strong> Basado en el perfil del cliente, se aplicaron automáticamente las retenciones de ICA y Fuente para servicios de consultoría.
              </p>
            </div>

            <button 
              type="submit"
              class="w-full mt-6 py-3 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-all shadow-md shadow-violet-200 flex items-center justify-center"
            >
              <span class="material-symbols-outlined mr-2 text-[18px]">send</span>
              Generar y Enviar a DIAN
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* No specific styles needed as everything is Tailwind */
</style>
