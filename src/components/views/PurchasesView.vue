<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePurchasesStore } from '../../stores/purchasesStore'
import { useAiStore } from '../../stores/aiStore'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { formatCurrency } from '../../utils/ui'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const purchases = usePurchasesStore()
const tenantPurchases = computed(() => purchases.tenantPurchases || [])
const ai = useAiStore()
const isProcessing = ref(false)

const thirdPartiesStore = useThirdPartiesStore()
const inventoryStore = useInventoryStore()

const tenantProviders = computed(() => thirdPartiesStore.tenantProviders)
const tenantProducts = computed(() => inventoryStore.tenantProducts)

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFileSelect() {
  fileInputRef.value?.click()
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isProcessing.value = true
  try {
    // Llamar al endpoint OCR real del backend
    const formData = new FormData()
    formData.append('file', file)
    const tenantId = purchases.purchases[0]?.tenantId || ''
    const baseUrl = (await import('../../services/apiBase')).getApiBaseUrl()
    const response = await fetch(`${baseUrl}/analytics/ocr-runs/upload`, {
      method: 'POST',
      headers: tenantId ? { 'x-tenant-id': tenantId } : {},
      credentials: 'include',
      body: formData,
    })
    if (response.ok) {
      await purchases.fetchPurchases()
      emit('notify', { message: 'Factura recibida', detail: 'El documento fue enviado al motor OCR. Revisa las tareas de IA en el Dashboard.' })
    } else {
      const err = await response.json().catch(() => ({}))
      emit('notify', { message: 'Error OCR', detail: err.message || 'No se pudo procesar el archivo.' })
    }
  } catch (e: any) {
    emit('notify', { message: 'Error', detail: e.message || 'Error al subir el archivo.' })
  } finally {
    isProcessing.value = false
    // Limpiar input para permitir re-subida del mismo archivo
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

// Manual Purchase Modal State
const showManualModal = ref(false)
const isSubmitting = ref(false)
const validationErrors = ref<{ provider: string; items: string[] }>({ provider: '', items: [] })
const manualForm = ref({
  providerId: '',
  issuedAt: new Date().toISOString().slice(0, 10),
  paymentTermDays: 30,
  notes: '',
  items: [
    { productId: '', productName: '', quantity: 1, unitPrice: 0, taxRate: 19 }
  ]
})

function openManualModal() {
  thirdPartiesStore.fetchThirdParties()
  inventoryStore.fetchProducts()
  manualForm.value = {
    providerId: '',
    issuedAt: new Date().toISOString().slice(0, 10),
    paymentTermDays: 30,
    notes: '',
    items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, taxRate: 19 }]
  }
  showManualModal.value = true
}

function addItem() {
  manualForm.value.items.push({ productId: '', productName: '', quantity: 1, unitPrice: 0, taxRate: 19 })
}

function removeItem(idx: number) {
  if (manualForm.value.items.length > 1) {
    manualForm.value.items.splice(idx, 1)
  }
}

function onProductSelect(item: any) {
  if (!item.productId) return
  const product = tenantProducts.value.find(p => p.id === item.productId)
  if (product) {
    item.productName = product.name
    item.unitPrice = product.cost || product.price || 0
    item.taxRate = product.taxRate || 19
  }
}

const manualSubtotal = computed(() => manualForm.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))
const manualTax = computed(() => manualForm.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0))
const manualTotal = computed(() => manualSubtotal.value + manualTax.value)

async function submitManualPurchase() {
  // Validaciones inline
  const errors = { provider: '', items: [] as string[] }
  if (!manualForm.value.providerId) {
    errors.provider = 'Selecciona un proveedor.'
  }
  manualForm.value.items.forEach((item: any, idx: number) => {
    if (!item.productName) {
      errors.items[idx] = 'El ítem necesita nombre.'
    } else {
      errors.items[idx] = ''
    }
  })
  if (errors.provider || errors.items.some(e => e)) {
    validationErrors.value = errors
    return
  }
  // Limpiar errores antes de enviar
  validationErrors.value = { provider: '', items: [] }
  isSubmitting.value = true
  try {
    const payload = {
      providerId: manualForm.value.providerId,
      issuedAt: new Date(manualForm.value.issuedAt).toISOString(),
      paymentTermDays: manualForm.value.paymentTermDays,
      notes: manualForm.value.notes,
      items: manualForm.value.items.map(i => ({
        productId: i.productId || null,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        taxRate: i.taxRate,
        subtotal: i.quantity * i.unitPrice,
        taxAmount: i.quantity * i.unitPrice * (i.taxRate / 100)
      }))
    }
    const res = await purchases.registerPurchase(payload)
    if (res.ok) {
      emit('notify', { message: 'Compra registrada', detail: 'La compra manual ha sido contabilizada.' })
      showManualModal.value = false
      // Refrescar lista desde el backend
      await purchases.fetchPurchases()
    } else {
      // Mostrar error del backend como toast
      emit('notify', { message: 'Error', detail: res.message })
    }
  } catch (e: any) {
    emit('notify', { message: 'Error', detail: e.message })
  } finally {
    isSubmitting.value = false
  }
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
      <div class="flex gap-2">
        <button @click="openManualModal" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">edit_document</span>Ingreso manual
        </button>
      </div>
    </div>

    <!-- Upload hero -->
    <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 sm:p-10 mb-6 relative overflow-hidden">
      <div class="absolute -top-20 -right-20 w-[400px] h-[300px] rounded-full opacity-50 pointer-events-none" style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"></div>
      <div class="relative grid lg:grid-cols-[1fr_320px] gap-8 items-center">
        <!-- Input real oculto -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          class="hidden"
          @change="handleFileUpload"
        />
        <div
          @click="triggerFileSelect"
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
        <table class="w-full text-left min-w-[580px]">
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

    <!-- Manual Purchase Modal -->
    <div v-if="showManualModal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showManualModal = false"></div>
      <div class="relative bg-white rounded-[16px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-[#F4F4F5] flex justify-between items-center bg-[#FAFAFA] shrink-0">
          <div>
            <h3 class="text-[18px] font-bold text-[#18181B] tracking-tight">Registro Manual de Compra</h3>
            <p class="text-[13px] text-[#71717A] mt-0.5">Ingresa los datos de la factura del proveedor.</p>
          </div>
          <button @click="showManualModal = false" class="text-[#A1A1AA] hover:text-[#18181B] transition-colors rounded-full p-1 hover:bg-[#F4F4F5]">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div class="overflow-y-auto p-6 space-y-6 flex-1">
          <!-- Header info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Proveedor *</label>
              <select v-model="manualForm.providerId" class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]">
                <option value="" disabled>Selecciona un proveedor</option>
                <option v-for="tp in tenantProviders" :key="tp.id" :value="tp.id">{{ tp.name }} ({{ tp.nit }})</option>
              </select>
              <p v-if="validationErrors.provider" class="text-[11px] text-red-600 mt-1">{{ validationErrors.provider }}</p>
            </div>
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Fecha de Emisión *</label>
              <input v-model="manualForm.issuedAt" type="date" required class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
            </div>
            <div>
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Plazo de Pago (Días)</label>
              <input v-model.number="manualForm.paymentTermDays" type="number" min="0" required class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
            </div>
            <div class="md:col-span-3">
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block">Notas / Observaciones</label>
              <input v-model="manualForm.notes" placeholder="Opcional. Ej. Factura física 12345" class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] font-medium text-[#18181B] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
            </div>
          </div>

          <!-- Items list -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="text-[12px] font-bold text-[#71717A] uppercase tracking-wider block">Líneas de la Compra *</label>
              <button @click="addItem" class="text-[12px] font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">add</span> Añadir fila
              </button>
            </div>
            
            <div class="border border-[#E4E4E7] rounded-[12px] overflow-hidden">
              <table class="w-full text-left">
                <thead class="bg-[#FAFAFA] border-b border-[#E4E4E7]">
                  <tr>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Producto / Detalle</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[100px]">Cant</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[140px]">Costo Unit.</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[100px]">% IVA</th>
                    <th class="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#71717A] w-[140px] text-right">Subtotal</th>
                    <th class="px-3 py-2 w-[40px]"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F4F4F5]">
                  <tr v-for="(item, idx) in manualForm.items" :key="idx" class="bg-white">
                    <td class="px-3 py-2">
                      <div class="flex flex-col gap-1">
                        <select v-model="item.productId" @change="onProductSelect(item)" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]">
                          <option value="">-- Sin producto de inventario --</option>
                          <option v-for="p in tenantProducts" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                        <input v-if="!item.productId" v-model="item.productName" placeholder="Descripción libre" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
<p v-if="validationErrors.items[idx]" class="text-[11px] text-red-600 mt-1">{{ validationErrors.items[idx] }}</p>
                      </div>
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="item.quantity" type="number" min="1" step="any" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
                    </td>
                    <td class="px-3 py-2">
                      <input v-model.number="item.unitPrice" type="number" min="0" step="any" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]" />
                    </td>
                    <td class="px-3 py-2">
                      <select v-model.number="item.taxRate" class="w-full border border-[#E4E4E7] rounded-[6px] px-2 py-1.5 text-[12px] bg-[#FAFAFA] outline-none focus:border-[#18181B]">
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="19">19%</option>
                      </select>
                    </td>
                    <td class="px-3 py-2 text-right font-mono text-[12px] font-semibold text-[#18181B]">
                      {{ formatCurrency(item.quantity * item.unitPrice) }}
                    </td>
                    <td class="px-3 py-2 text-right">
                      <button @click="removeItem(idx)" :disabled="manualForm.items.length <= 1" class="text-[#A1A1AA] hover:text-red-500 disabled:opacity-30">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Totals -->
            <div class="mt-4 flex justify-end">
              <div class="w-full max-w-[280px] bg-[#FAFAFA] rounded-[10px] p-4 border border-[#E4E4E7]">
                <div class="flex justify-between mb-2 text-[12px] text-[#71717A]">
                  <span>Subtotal</span>
                  <span class="font-mono font-semibold">{{ formatCurrency(manualSubtotal) }}</span>
                </div>
                <div class="flex justify-between mb-3 text-[12px] text-[#71717A]">
                  <span>Impuestos (IVA)</span>
                  <span class="font-mono font-semibold">{{ formatCurrency(manualTax) }}</span>
                </div>
                <div class="flex justify-between pt-3 border-t border-[#E4E4E7] text-[14px] font-bold text-[#18181B]">
                  <span>Total Compra</span>
                  <span class="font-mono text-[#2563EB]">{{ formatCurrency(manualTotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="px-6 py-4 border-t border-[#F4F4F5] bg-[#FAFAFA] flex justify-end gap-3 shrink-0">
          <button @click="showManualModal = false" class="px-4 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">Cancelar</button>
          <button @click="submitManualPurchase" :disabled="isSubmitting" class="px-6 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold flex items-center gap-2 disabled:opacity-50">
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-[16px]">sync</span>
            {{ isSubmitting ? 'Guardando...' : 'Guardar Compra' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
