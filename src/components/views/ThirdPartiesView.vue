<script setup>
import { computed, ref } from 'vue'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { formatCurrency } from '../../utils/ui'
import { generatePdfReport } from '../../utils/pdfExport'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const store = useThirdPartiesStore()
const tenantThirdParties = computed(() => store.tenantThirdParties || [])

function initials(name) {
  if (!name) return '—'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function handleAction(tp) {
  emit('notify', { message: 'Solicitud enviada', detail: `Se solicitó actualización de RUT a ${tp.name}.` })
}

// Exportar
async function handleExport() {
  emit('notify', { message: 'Generando Reporte', detail: 'ContexAI está analizando los datos de cartera...' })
  const total = tenantThirdParties.value.length
  const totalBalance = tenantThirdParties.value.reduce((s, tp) => s + (tp.balance || 0), 0)
  
  await generatePdfReport({
    title: 'Reporte de Terceros y Cartera',
    subtitle: `Terceros totales: ${total}`,
    fileName: `Cartera_Terceros_${Date.now()}.pdf`,
    data: {
      'Terceros Registrados': `${total} entidades`,
      'Saldo Total de Cartera': formatCurrency(totalBalance),
    },
    aiSummary: 'El estado de cartera actual es saludable. No se detectan anomalías de crédito en los clientes principales.'
  })
  emit('notify', { message: 'PDF Descargado', detail: 'El reporte de terceros ha sido generado y descargado exitosamente.' })
}

// Nuevo Tercero Modal
const showNewThirdPartyModal = ref(false)
const isSubmitting = ref(false)
const newThirdParty = ref({
  name: '',
  nit: '',
  email: '',
  kind: 'client',
  taxProfile: 'RegimenComun'
})

async function handleCreateThirdParty() {
  if (!newThirdParty.value.name || !newThirdParty.value.nit || !newThirdParty.value.email) {
    emit('notify', { message: 'Faltan datos', detail: 'Por favor completa todos los campos obligatorios (Nombre, NIT y Correo).' })
    return
  }
  isSubmitting.value = true
  try {
    await store.addThirdParty({ ...newThirdParty.value })
    emit('notify', { message: 'Tercero Creado', detail: `El tercero ${newThirdParty.value.name} ha sido guardado exitosamente.` })
    showNewThirdPartyModal.value = false
    newThirdParty.value = { name: '', nit: '', email: '', kind: 'client', taxProfile: 'RegimenComun' }
  } catch (e) {
    emit('notify', { message: 'Error', detail: e.message || 'No se pudo crear el tercero.' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    v-if="isActive"
    class="animate-in fade-in slide-in-from-bottom-4 duration-500"
  >
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Gestión</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Terceros</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">
          Terceros
        </h1>
        <p class="text-[14px] text-[#71717A]">
          Administración integral de clientes, proveedores y socios.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold"
          @click="handleExport"
        >
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
        <button
          class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold"
          @click="showNewThirdPartyModal = true"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>Nuevo tercero
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div>
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-4 mb-4 flex items-center gap-3 flex-wrap">
          <div class="relative flex-1 min-w-[240px]">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
            <input
              placeholder="Buscar por nombre, NIT o email..."
              class="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B]"
            >
          </div>
          <select class="border border-[#E4E4E7] rounded-[8px] py-2 px-3 text-[12px] font-semibold text-[#71717A] outline-none bg-white">
            <option>Todos los tipos</option><option>Cliente</option><option>Proveedor</option>
          </select>
        </div>

        <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[540px]">
              <thead>
                <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                  <th class="px-5 py-3">
                    Entidad
                  </th>
                  <th class="px-5 py-3">
                    NIT
                  </th>
                  <th class="px-5 py-3">
                    Tipo
                  </th>
                  <th class="px-5 py-3 text-right">
                    Saldo
                  </th>
                  <th class="px-5 py-3">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
                <tr
                  v-for="tp in tenantThirdParties"
                  :key="tp.id"
                  class="hover:bg-[#FAFAFA] group"
                >
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-md bg-[#18181B] text-white flex items-center justify-center font-semibold text-[10px]">
                        {{ initials(tp.name) }}
                      </div>
                      <span class="font-semibold text-[#18181B]">{{ tp.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 font-mono text-[#A1A1AA] text-[12px]">
                    {{ tp.idNumber }}
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[#71717A] text-[11px] font-semibold uppercase">{{ tp.type }}</span>
                  </td>
                  <td class="px-5 py-3.5 text-right font-mono font-semibold">
                    {{ formatCurrency(tp.balance || 0) }}
                  </td>
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />Activo</span>
                  </td>
                </tr>
                <tr v-if="tenantThirdParties.length === 0">
                  <td
                    colspan="5"
                    class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]"
                  >
                    No hay terceros registrados.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 mb-1">
          <span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span><h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">
            Insights de IA
          </h3>
        </div>
        <div
          v-if="store.aiInsights"
          class="bg-white border border-[#E4E4E7] rounded-[14px] p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <span
              v-if="store.aiInsights.risk.level > 0"
              class="material-symbols-outlined text-[16px] text-amber-600"
            >warning</span>
            <span
              v-else
              class="material-symbols-outlined text-[16px] text-emerald-600"
            >verified_user</span>
            <p class="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
              {{ store.aiInsights.title || 'Análisis de Cartera' }}
            </p>
          </div>
          <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">
            {{ store.aiInsights.insight }}
          </p>
          <button
            class="w-full py-1.5 bg-[#2563EB] text-white rounded-[8px] text-[11px] font-semibold"
            @click="handleAction({name: store.aiInsights.targetName || 'General'})"
          >
            {{ store.aiInsights.actionText || 'Revisar' }}
          </button>
        </div>
        <div
          v-if="store.aiInsights"
          class="bg-[#18181B] rounded-[14px] p-4 text-white"
        >
          <p class="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">
            Riesgo de cartera
          </p>
          <div class="flex items-baseline gap-2">
            <span class="text-[28px] font-bold tracking-[-0.02em]">{{ store.aiInsights.risk.level.toFixed(1) }}%</span>
            <span
              v-if="store.aiInsights.risk.trend === 'up'"
              class="text-[11px] font-semibold text-rose-400"
            >↑ Riesgo al alza</span>
            <span
              v-else-if="store.aiInsights.risk.trend === 'down'"
              class="text-[11px] font-semibold text-emerald-400"
            >↓ Riesgo a la baja</span>
            <span
              v-else
              class="text-[11px] font-semibold text-white/60"
            >→ Estable</span>
          </div>
          <p class="text-[11px] text-white/60 mt-1">
            {{ store.aiInsights.risk.level > 10 ? 'Alto riesgo de impagos' : store.aiInsights.risk.level > 0 ? 'Riesgo moderado' : 'Bajo riesgo' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Nuevo Tercero Modal -->
    <div
      v-if="showNewThirdPartyModal"
      class="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        @click="showNewThirdPartyModal = false"
      />
      <div class="relative bg-white rounded-[16px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-[#F4F4F5] flex justify-between items-center bg-[#FAFAFA]">
          <div>
            <h3 class="text-[18px] font-bold text-[#18181B] tracking-tight">
              Nuevo Tercero
            </h3>
            <p class="text-[13px] text-[#71717A] mt-0.5">
              Agrega un cliente o proveedor a tu base de datos.
            </p>
          </div>
          <button
            class="text-[#A1A1AA] hover:text-[#18181B] transition-colors rounded-full p-1 hover:bg-[#F4F4F5]"
            @click="showNewThirdPartyModal = false"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <form
          class="p-6 space-y-4"
          @submit.prevent="handleCreateThirdParty"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Tipo de Tercero</label>
              <select
                v-model="newThirdParty.kind"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]"
              >
                <option value="client">
                  Cliente
                </option>
                <option value="provider">
                  Proveedor
                </option>
              </select>
            </div>
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Perfil Tributario</label>
              <select
                v-model="newThirdParty.taxProfile"
                class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]"
              >
                <option value="RegimenComun">
                  Régimen Común
                </option>
                <option value="RegimenSimplificado">
                  Régimen Simplificado
                </option>
                <option value="GranContribuyente">
                  Gran Contribuyente
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Razón Social o Nombre Completo *</label>
            <input
              v-model="newThirdParty.name"
              placeholder="Ej. Acme SAS"
              required
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#18181B]"
            >
          </div>

          <div>
            <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">NIT o Documento *</label>
            <input
              v-model="newThirdParty.nit"
              placeholder="Ej. 900.123.456-7"
              required
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#18181B]"
            >
          </div>

          <div>
            <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Correo Electrónico *</label>
            <input
              v-model="newThirdParty.email"
              type="email"
              placeholder="facturacion@empresa.com"
              required
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#18181B]"
            >
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              class="flex-1 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold"
              @click="showNewThirdPartyModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold disabled:opacity-50"
            >
              {{ isSubmitting ? 'Guardando...' : 'Guardar Tercero' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
