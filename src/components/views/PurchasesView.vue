<script setup>
import { ref, computed } from 'vue'
import { usePurchasesStore } from '../../stores/purchasesStore'
import { useAiStore } from '../../stores/aiStore'
import { formatCurrency } from '../../utils/ui'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const purchases = usePurchasesStore()
const tenantPurchases = computed(() => purchases.tenantPurchases || [])
const ai = useAiStore()
const isProcessing = ref(false)

async function handleFileUpload() {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    emit('notify', { message: 'IA finalizada', detail: 'Documento procesado con 98% de precisión.' })
  }, 2000)
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Operaciones</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Compras</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Compras</h1>
        <p class="text-[14px] text-[#71717A]">Procesa facturas de proveedores con IA. Sube un PDF y extraemos los datos automáticamente.</p>
      </div>
    </div>

    <!-- Upload hero -->
    <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 sm:p-10 mb-6 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-[400px] h-[300px] rounded-full opacity-50 pointer-events-none" style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"></div>
      <div class="relative grid lg:grid-cols-[1fr_320px] gap-8 items-center">
        <div
          @click="handleFileUpload"
          class="border-2 border-dashed border-[#E4E4E7] rounded-[14px] p-8 text-center hover:border-[#2563EB] hover:bg-[#FAFAFA] transition-all cursor-pointer"
        >
          <div class="w-14 h-14 mx-auto rounded-[12px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] mb-4">
            <span class="material-symbols-outlined text-[28px]">document_scanner</span>
          </div>
          <h3 class="text-[16px] font-bold text-[#18181B] mb-1">Arrastra tus facturas o haz clic para subir</h3>
          <p class="text-[12px] text-[#71717A] mb-4">PDF, JPG, PNG · Máx 10MB</p>
          <div v-if="isProcessing" class="mt-2">
            <div class="w-32 h-1 mx-auto bg-[#E4E4E7] rounded-full overflow-hidden">
              <div class="h-full bg-[#2563EB] animate-pulse" style="width: 60%"></div>
            </div>
            <p class="text-[11px] font-semibold text-[#2563EB] mt-2 uppercase tracking-wider">Analizando con ContexAI…</p>
          </div>
          <button v-else class="px-4 py-2 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A]">Seleccionar archivos</button>
        </div>
        <div class="space-y-3">
          <div class="flex items-start gap-3"><div class="w-7 h-7 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-0.5"><span class="material-symbols-outlined text-[16px]">looks_one</span></div><div><p class="text-[13px] font-semibold text-[#18181B]">Sube el documento</p><p class="text-[11px] text-[#71717A]">PDF de la factura del proveedor</p></div></div>
          <div class="flex items-start gap-3"><div class="w-7 h-7 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-0.5"><span class="material-symbols-outlined text-[16px]">looks_two</span></div><div><p class="text-[13px] font-semibold text-[#18181B]">IA extrae los campos</p><p class="text-[11px] text-[#71717A]">Proveedor, NIT, fecha, monto</p></div></div>
          <div class="flex items-start gap-3"><div class="w-7 h-7 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-0.5"><span class="material-symbols-outlined text-[16px]">looks_3</span></div><div><p class="text-[13px] font-semibold text-[#18181B]">Apruebas y se contabiliza</p><p class="text-[11px] text-[#71717A]">Asiento generado automáticamente</p></div></div>
        </div>
      </div>
    </div>

    <!-- Recent processed -->
    <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
      <div class="px-5 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Historial de compras</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
              <th class="px-5 py-3">ID</th>
              <th class="px-5 py-3">Proveedor</th>
              <th class="px-5 py-3">Fecha</th>
              <th class="px-5 py-3">IA</th>
              <th class="px-5 py-3 text-right">Monto</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
            <tr v-for="purchase in tenantPurchases" :key="purchase.id" class="hover:bg-[#FAFAFA]">
              <td class="px-5 py-3.5 font-mono text-[#A1A1AA] text-[12px]">{{ purchase.number }}</td>
              <td class="px-5 py-3.5 font-semibold text-[#18181B]">{{ purchase.vendorName }}</td>
              <td class="px-5 py-3.5 text-[#71717A]">{{ new Date(purchase.date).toLocaleDateString() }}</td>
              <td class="px-5 py-3.5"><span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold"><span class="material-symbols-outlined text-[12px]">verified</span>Procesada</span></td>
              <td class="px-5 py-3.5 text-right font-mono font-semibold">{{ formatCurrency(purchase.total) }}</td>
              <td class="px-5 py-3.5 text-right"><button class="text-[#A1A1AA] hover:text-[#18181B]"><span class="material-symbols-outlined text-[18px]">more_horiz</span></button></td>
            </tr>
            <tr v-if="tenantPurchases.length === 0">
              <td colspan="6" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No hay compras registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
