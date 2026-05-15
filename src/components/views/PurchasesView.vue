<script setup>
import { ref, computed } from 'vue'
import { usePurchasesStore } from '../../stores/purchasesStore'
import { useAiStore } from '../../stores/aiStore'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const purchases = usePurchasesStore()
const ai = useAiStore()

const isProcessing = ref(false)
const showAnalysis = ref(false)
const extractedData = ref({
  vendor: 'Logix LTDA',
  nit: '900.123.456-7',
  date: '24 Oct, 2024',
  total: 2450000,
  confidence: 98
})

async function handleFileUpload() {
  isProcessing.value = true
  // Mock AI processing
  setTimeout(() => {
    isProcessing.value = false
    showAnalysis.value = true
    emit('notify', { message: 'IA Finalizada', detail: 'Documento procesado con 98% de precisión.' })
  }, 3000)
}

function handleApprove() {
  showAnalysis.value = false
  emit('notify', { message: 'Compra Contabilizada', detail: 'La factura ha sido registrada en el libro mayor.' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Compras</h1>
      <p class="text-sm text-slate-500 mt-1">Gestión de facturas de proveedores y extracción IA</p>
    </div>

    <!-- Document Upload Area -->
    <div 
      v-if="!showAnalysis"
      @click="handleFileUpload"
      class="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-12 flex flex-col items-center justify-center text-center hover:border-violet-400 hover:bg-violet-50/30 transition-all cursor-pointer mb-8 group"
    >
      <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
        <span class="material-symbols-outlined text-violet-500 text-3xl">document_scanner</span>
      </div>
      <h3 class="text-lg font-bold text-slate-900 mb-2">Arrastra y suelta tus facturas aquí</h3>
      <p class="text-xs text-slate-500 mb-6">Soporta PDF, JPG, PNG (Max 10MB)</p>
      <button class="bg-white border border-slate-200 hover:border-cyan-500 text-slate-700 hover:text-cyan-600 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm">
        Subir Documentos o PDFs
      </button>
      
      <!-- Processing Loader -->
      <div v-if="isProcessing" class="mt-6 flex flex-col items-center">
        <div class="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-violet-500 animate-[progress_2s_ease-in-out_infinite]" style="width: 40%"></div>
        </div>
        <p class="text-[10px] font-bold text-violet-600 mt-2 uppercase tracking-widest">Analizando con ContexAI...</p>
      </div>
    </div>

    <!-- AI Analysis View -->
    <div v-if="showAnalysis" class="mb-8 animate-in zoom-in-95 duration-300">
      <div class="flex items-center gap-2 mb-4">
        <span class="material-symbols-outlined text-violet-500">smart_toy</span>
        <h2 class="text-lg font-bold text-slate-900">Procesando con ContexAI</h2>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left: Document Preview -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-[500px] flex flex-col">
          <div class="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vista Previa</span>
            <div class="flex gap-2">
              <button class="text-slate-400 hover:text-violet-600"><span class="material-symbols-outlined text-[18px]">zoom_in</span></button>
              <button class="text-slate-400 hover:text-violet-600"><span class="material-symbols-outlined text-[18px]">zoom_out</span></button>
            </div>
          </div>
          <div class="flex-1 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden relative">
            <!-- Mock Invoice Content -->
            <div class="absolute inset-0 bg-white m-6 shadow-sm border border-slate-100 p-8">
              <div class="w-1/3 h-6 bg-slate-100 rounded mb-4"></div>
              <div class="space-y-2 mb-8">
                <div class="w-full h-3 bg-slate-50 rounded"></div>
                <div class="w-2/3 h-3 bg-slate-50 rounded"></div>
              </div>
              <table class="w-full mb-8">
                <tr class="border-b border-slate-100">
                  <th class="text-[9px] text-slate-400 text-left py-2">ITEM</th>
                  <th class="text-[9px] text-slate-400 text-right py-2">TOTAL</th>
                </tr>
                <tr class="border-b border-slate-50">
                  <td class="text-xs py-2">Servicios Logísticos</td>
                  <td class="text-xs text-right font-bold">$2.450.000</td>
                </tr>
              </table>
            </div>
            <!-- Scanning Line -->
            <div class="absolute left-0 w-full h-[2px] bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)] top-1/2 animate-[scan_3s_ease-in-out_infinite]"></div>
          </div>
        </div>

        <!-- Right: Extracted Data -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                Datos Extraídos
                <span class="material-symbols-outlined text-violet-500">auto_awesome</span>
              </h3>
              <p class="text-xs text-slate-500 mt-1">Confirma la información detectada por la IA.</p>
            </div>
            <div class="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">check_circle</span>
              {{ extractedData.confidence }}% Precisión
            </div>
          </div>
          
          <div class="space-y-4 flex-1">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proveedor</label>
                <input v-model="extractedData.vendor" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"/>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">NIT</label>
                <input v-model="extractedData.nit" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none"/>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha</label>
                <input v-model="extractedData.date" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none"/>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</label>
                <input :value="formatCurrency(extractedData.total)" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-violet-600 outline-none" readonly/>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button @click="showAnalysis = false" class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancelar</button>
            <button @click="handleApprove" class="px-6 py-2 bg-cyan-500 text-white text-xs font-bold rounded-lg hover:bg-cyan-600 transition-all shadow-md shadow-cyan-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">check</span>
              Aprobar y Contabilizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 class="text-lg font-bold text-slate-900">Historial de Compras</h3>
        <button class="text-cyan-500 hover:text-cyan-600 text-xs font-bold flex items-center gap-1 transition-colors">
          Ver todas <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">Proveedor</th>
              <th class="px-6 py-3">Fecha</th>
              <th class="px-6 py-3">Estado IA</th>
              <th class="px-6 py-3 text-right">Monto</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
            <tr v-for="purchase in purchases.tenantPurchases" :key="purchase.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-mono text-slate-400">{{ purchase.number }}</td>
              <td class="px-6 py-4 font-bold">{{ purchase.vendorName }}</td>
              <td class="px-6 py-4 text-slate-500">{{ new Date(purchase.date).toLocaleDateString() }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Procesado
                </span>
              </td>
              <td class="px-6 py-4 text-right font-mono font-bold">{{ formatCurrency(purchase.total) }}</td>
              <td class="px-6 py-4 text-right text-slate-300">
                <button class="hover:text-violet-600"><span class="material-symbols-outlined text-[18px]">more_vert</span></button>
              </td>
            </tr>
            <tr v-if="purchases.tenantPurchases.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-slate-400">No hay compras registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}
</style>
