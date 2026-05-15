<script setup>
import { computed, reactive, watch } from 'vue'
import { usePurchasesStore } from '@/stores/purchasesStore'
import { useStateStore } from '@/stores/stateStore'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useThirdPartiesStore } from '@/stores/thirdPartiesStore'
import { formatCurrency, formatDate } from '@/utils/ui'
import {
  ShoppingCart,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const purchasesStore = usePurchasesStore()
const rootStore = useStateStore()
const inventoryStore = useInventoryStore()
const thirdPartiesStore = useThirdPartiesStore()

const purchaseForm = reactive({
  providerId: '',
  paymentTermDays: 30,
  notes: '',
  lines: [],
})

let lineIdCounter = 0

function createEmptyLine() {
  return {
    id: `line-${Date.now()}-${lineIdCounter++}`,
    productId: '',
    quantity: 1,
  }
}

function resetForm() {
  purchaseForm.providerId = ''
  purchaseForm.paymentTermDays = 30
  purchaseForm.notes = ''
  purchaseForm.lines = [createEmptyLine()]
}

watch(
  () => rootStore.activeTenantId,
  () => {
    resetForm()
  },
  { immediate: true },
)

const canPurchase = computed(() => purchasesStore.canRegisterPurchase)

const purchasePermissionNote = computed(() =>
  canPurchase.value
    ? 'Tu rol puede registrar compras en esta empresa.'
    : 'Modo solo lectura. Tu rol activo no puede registrar compras.',
)

const draftPurchaseItems = computed(() =>
  purchaseForm.lines
    .map((line) => {
      const product = inventoryStore.tenantProducts.find(
        (item) => item.id === line.productId,
      )
      const quantity = Number(line.quantity || 0)

      if (!product || quantity <= 0) {
        return null
      }

      const subtotal = product.cost * quantity
      const taxAmount = subtotal * (product.taxRate / 100)

      return {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.cost,
        taxRate: product.taxRate,
        subtotal,
        taxAmount,
        total: subtotal + taxAmount,
      }
    })
    .filter(Boolean),
)

const draftPurchaseTotals = computed(() =>
  draftPurchaseItems.value.reduce(
    (accumulator, item) => {
      accumulator.subtotal += item.subtotal
      accumulator.tax += item.taxAmount
      accumulator.total += item.total
      return accumulator
    },
    { subtotal: 0, tax: 0, total: 0 },
  ),
)

function notify(result) {
  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })
}

function addLineItem() {
  purchaseForm.lines.push(createEmptyLine())
}

function removeLineItem(index) {
  if (purchaseForm.lines.length === 1) {
    notify({ message: 'La compra necesita al menos un item.' })
    return
  }
  purchaseForm.lines.splice(index, 1)
}

async function handleSubmit() {
  const result = await purchasesStore.registerPurchase({
    providerId: purchaseForm.providerId,
    paymentTermDays: purchaseForm.paymentTermDays,
    notes: purchaseForm.notes,
    items: draftPurchaseItems.value,
  })

  notify(result)

  if (result.ok) {
    resetForm()
  }
}

function getStatusColor(status) {
  const colors = {
    registered: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    draft: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    cancelled: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }
  return colors[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

function getStatusLabel(status) {
  const labels = {
    registered: 'Registrada',
    paid: 'Pagada',
    draft: 'Borrador',
    cancelled: 'Cancelada',
  }
  return labels[status] || status
}
</script>

<template>
  <section v-if="isActive" class="min-h-full p-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart class="w-6 h-6 text-amber-400" />
          Compras y Gastos
        </h1>
        <p class="text-slate-400 text-sm mt-1">
          Registro de facturas de proveedores y asientos de IVA descontable
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div
          class="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center gap-2"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full',
              canPurchase
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : 'bg-rose-500',
            ]"
          ></div>
          <span class="text-xs font-medium text-slate-300">{{
            purchasePermissionNote
          }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Form -->
      <div class="lg:col-span-7 space-y-6">
        <div
          class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20"
        >
          <div
            class="p-6 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between"
          >
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <Plus class="w-5 h-5 text-amber-400" />
              Nueva Compra / Gasto
            </h2>
          </div>

          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase tracking-wider"
                  >Proveedor</label
                >
                <select
                  v-model="purchaseForm.providerId"
                  required
                  class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none"
                  :disabled="!canPurchase"
                >
                  <option value="">Selecciona un proveedor</option>
                  <option
                    v-for="provider in thirdPartiesStore.tenantProviders"
                    :key="provider.id"
                    :value="provider.id"
                  >
                    {{ provider.name }} - {{ provider.nit }}
                  </option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase tracking-wider"
                  >Condición de Pago</label
                >
                <select
                  v-model.number="purchaseForm.paymentTermDays"
                  class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none"
                  :disabled="!canPurchase"
                >
                  <option :value="30">Crédito 30 días</option>
                  <option :value="15">Crédito 15 días</option>
                  <option :value="0">Contado (Efectivo)</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-medium text-slate-400 uppercase tracking-wider"
                >Notas</label
              >
              <textarea
                v-model="purchaseForm.notes"
                placeholder="Observaciones de la compra..."
                rows="2"
                class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none resize-none"
                :disabled="!canPurchase"
              ></textarea>
            </div>

            <!-- Items Section -->
            <div class="pt-4 border-t border-slate-800/50">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-slate-200">
                  Ítems de la Compra
                </h3>
                <button
                  type="button"
                  @click="addLineItem"
                  class="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <Plus class="w-4 h-4" /> Agregar Ítem
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(line, index) in purchaseForm.lines"
                  :key="line.id"
                  class="group flex flex-col md:flex-row gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <div class="flex-grow space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase"
                      >Producto / Servicio</label
                    >
                    <select
                      v-model="line.productId"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                    >
                      <option value="">Selecciona un producto</option>
                      <option
                        v-for="product in inventoryStore.tenantProducts"
                        :key="product.id"
                        :value="product.id"
                      >
                        {{ product.name }} (Costo: {{ formatCurrency(product.cost) }})
                      </option>
                    </select>
                  </div>

                  <div class="md:w-32 space-y-2">
                    <label class="text-[10px] font-bold text-slate-500 uppercase"
                      >Cantidad</label
                    >
                    <input
                      v-model.number="line.quantity"
                      min="1"
                      type="number"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div class="flex items-end pb-1">
                    <button
                      type="button"
                      @click="removeLineItem(index)"
                      class="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <button
                type="submit"
                :disabled="!canPurchase || draftPurchaseItems.length === 0"
                class="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
              >
                <ShoppingCart class="w-5 h-5" />
                Registrar Compra / Gasto
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Column: Totals & History -->
      <div class="lg:col-span-5 space-y-6">
        <!-- Totals Card -->
        <div
          class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20"
        >
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20">
            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest">
              Resumen del Gasto
            </h2>
          </div>

          <div class="p-6 space-y-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Subtotal (sin IVA)</span>
              <span class="text-slate-200 font-medium">{{
                formatCurrency(draftPurchaseTotals.subtotal)
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">IVA Descontable</span>
              <span class="text-amber-400 font-medium"
                >+ {{ formatCurrency(draftPurchaseTotals.tax) }}</span
              >
            </div>
            <div
              class="pt-4 border-t border-slate-800/50 flex justify-between items-center"
            >
              <span class="text-base font-bold text-white">Total a Pagar</span>
              <span class="text-xl font-bold text-white">{{
                formatCurrency(draftPurchaseTotals.total)
              }}</span>
            </div>

            <div
              v-if="draftPurchaseItems.length > 0"
              class="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3"
            >
              <CheckCircle2 class="w-5 h-5 text-amber-500 shrink-0" />
              <p class="text-xs text-amber-200">
                La compra generará un asiento de IVA descontable (cta. 240810).
              </p>
            </div>
          </div>
        </div>

        <!-- History Card -->
        <div
          class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20"
        >
          <div
            class="p-5 border-b border-slate-800/50 bg-slate-800/20 flex items-center justify-between"
          >
            <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest">
              Últimas Compras
            </h2>
            <FileText class="w-4 h-4 text-slate-500" />
          </div>

          <div class="max-h-[400px] overflow-y-auto">
            <div
              v-if="purchasesStore.tenantPurchases.length"
              class="divide-y divide-slate-800/50"
            >
              <div
                v-for="purchase in purchasesStore.tenantPurchases"
                :key="purchase.id"
                @click="purchasesStore.selections.purchaseId = purchase.id"
                :class="[
                  'p-4 cursor-pointer hover:bg-slate-800/30 transition-all relative group',
                  purchase.id === purchasesStore.selections.purchaseId
                    ? 'bg-slate-800/50'
                    : '',
                ]"
              >
                <div
                  v-if="purchase.id === purchasesStore.selections.purchaseId"
                  class="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"
                ></div>

                <div class="flex items-center justify-between mb-1">
                  <span
                    class="text-sm font-bold text-white group-hover:text-amber-400 transition-colors"
                    >{{ purchase.number || purchase.id.slice(0, 8) }}</span
                  >
                  <span
                    :class="[
                      'text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tighter',
                      getStatusColor(purchase.status),
                    ]"
                    >{{ getStatusLabel(purchase.status) }}</span
                  >
                </div>
                <div class="flex justify-between items-end">
                  <div class="text-xs text-slate-400">
                    <p class="text-slate-300 font-medium">
                      {{
                        thirdPartiesStore.thirdParties.find(
                          (tp) => tp.id === purchase.providerId,
                        )?.name || 'Proveedor'
                      }}
                    </p>
                    <p>{{ formatDate(purchase.createdAt) }}</p>
                  </div>
                  <span class="text-sm font-semibold text-white">{{
                    formatCurrency(purchase.total)
                  }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-12 text-center">
              <ShoppingCart class="w-12 h-12 text-slate-800 mx-auto mb-3" />
              <p class="text-slate-500 text-sm">No hay compras registradas</p>
            </div>
          </div>
        </div>

        <!-- Selected Purchase Detail -->
        <div
          v-if="purchasesStore.selectedPurchase"
          class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden shadow-xl shadow-black/20 animate-in slide-in-from-bottom-4"
        >
          <div class="p-5 border-b border-slate-800/50 bg-slate-800/20">
            <h2 class="text-sm font-semibold text-amber-400 uppercase tracking-widest">
              Detalle del Asiento Contable
            </h2>
          </div>

          <div class="p-6 space-y-3">
            <div class="grid grid-cols-3 text-[10px] font-bold uppercase text-slate-500 pb-2 border-b border-slate-800/50">
              <span>Cuenta</span>
              <span class="text-right">Débito</span>
              <span class="text-right">Crédito</span>
            </div>
            <div class="grid grid-cols-3 text-xs text-slate-300">
              <span class="text-slate-400">510000 Gastos</span>
              <span class="text-right">{{ formatCurrency(purchasesStore.selectedPurchase.subtotal) }}</span>
              <span class="text-right text-slate-600">—</span>
            </div>
            <div class="grid grid-cols-3 text-xs text-slate-300">
              <span class="text-amber-400">240810 IVA Desc.</span>
              <span class="text-right text-amber-400">{{ formatCurrency(purchasesStore.selectedPurchase.taxTotal) }}</span>
              <span class="text-right text-slate-600">—</span>
            </div>
            <div class="grid grid-cols-3 text-xs text-slate-300 pt-2 border-t border-slate-800/50">
              <span class="text-slate-400">220500 Proveed.</span>
              <span class="text-right text-slate-600">—</span>
              <span class="text-right text-rose-400">{{ formatCurrency(purchasesStore.selectedPurchase.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
