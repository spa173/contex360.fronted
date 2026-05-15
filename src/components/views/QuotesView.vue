<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStateStore } from '@/stores/stateStore'
import { businessApi } from '@/services/businessApi'
import { formatCurrency, formatDate } from '@/utils/ui'
import { 
  FileText, 
  Plus, 
  Send, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Trash2,
  Loader2,
  FileCheck
} from 'lucide-vue-next'

defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['notify'])
const store = useStateStore()

const quotes = ref([])
const clients = ref([])
const products = ref([])
const loading = ref(false)
const showForm = ref(false)
const converting = ref(null)

const form = ref({
  clientId: '',
  validUntil: '',
  notes: '',
  terms: '',
  items: [{ productId: '', quantity: 1, unitPrice: 0, taxRate: 19, notes: '' }],
})

const statusLabels = {
  draft: 'Borrador',
  sent: 'Enviada',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  converted: 'Convertida',
}

const statusColors = {
  draft: 'text-slate-400 bg-slate-400/10',
  sent: 'text-blue-400 bg-blue-400/10',
  accepted: 'text-emerald-400 bg-emerald-400/10',
  rejected: 'text-rose-400 bg-rose-400/10',
  converted: 'text-purple-400 bg-purple-400/10',
}

async function loadData() {
  if (!store.activeTenantId) return
  loading.value = true
  try {
    const [quotesData, clientsData, productsData] = await Promise.all([
      businessApi.getQuotes(store.activeTenantId),
      businessApi.getThirdParties('client', store.activeTenantId),
      businessApi.getProducts(store.activeTenantId),
    ])
    quotes.value = quotesData
    clients.value = clientsData
    products.value = productsData
  } catch (error) {
    emit('notify', { message: 'Error al cargar cotizaciones', detail: error.message })
  } finally {
    loading.value = false
  }
}

function addItem() {
  form.value.items.push({ productId: '', quantity: 1, unitPrice: 0, taxRate: 19, notes: '' })
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

function updateItemPrice(index) {
  const product = products.value.find(p => p.id === form.value.items[index].productId)
  if (product) {
    form.value.items[index].unitPrice = product.price || 0
    form.value.items[index].productName = product.name
  }
}

const subtotal = computed(() => 
  form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
)

const taxTotal = computed(() => 
  form.value.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0)
)

const total = computed(() => subtotal.value + taxTotal.value)

async function createQuote() {
  try {
    const quote = await businessApi.createQuote({
      clientId: form.value.clientId,
      validUntil: form.value.validUntil || undefined,
      notes: form.value.notes,
      terms: form.value.terms,
      items: form.value.items,
    }, store.activeTenantId)
    
    quotes.value.unshift(quote)
    showForm.value = false
    resetForm()
    emit('notify', { message: 'Cotización creada exitosamente' })
  } catch (error) {
    emit('notify', { message: 'Error al crear cotización', detail: error.message })
  }
}

async function updateStatus(quoteId, status) {
  try {
    const updated = await businessApi.updateQuoteStatus(quoteId, status, store.activeTenantId)
    const index = quotes.value.findIndex(q => q.id === quoteId)
    if (index !== -1) quotes.value[index] = updated
    emit('notify', { message: `Estado actualizado a: ${statusLabels[status]}` })
  } catch (error) {
    emit('notify', { message: 'Error al actualizar estado', detail: error.message })
  }
}

async function convertToInvoice(quoteId) {
  converting.value = quoteId
  try {
    const result = await businessApi.convertQuoteToInvoice(quoteId, store.activeTenantId)
    const index = quotes.value.findIndex(q => q.id === quoteId)
    if (index !== -1) quotes.value[index] = result.quote
    emit('notify', { 
      message: 'Cotización convertida a factura',
      detail: `Factura #${result.invoice.number}`
    })
  } catch (error) {
    emit('notify', { message: 'Error al convertir', detail: error.message })
  } finally {
    converting.value = null
  }
}

async function deleteQuote(quoteId) {
  if (!confirm('¿Eliminar esta cotización?')) return
  try {
    await businessApi.deleteQuote(quoteId, store.activeTenantId)
    quotes.value = quotes.value.filter(q => q.id !== quoteId)
    emit('notify', { message: 'Cotización eliminada' })
  } catch (error) {
    emit('notify', { message: 'Error al eliminar', detail: error.message })
  }
}

function resetForm() {
  form.value = {
    clientId: '',
    validUntil: '',
    notes: '',
    terms: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0, taxRate: 19, notes: '' }],
  }
}

onMounted(() => {
  if (store.activeTenantId) loadData()
})
</script>

<template>
  <section v-if="isActive" class="min-h-full p-8 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2">
          <FileText class="w-6 h-6 text-emerald-400" />
          Cotizaciones / Proformas
        </h1>
        <p class="text-slate-400 text-sm mt-1">Gestión de cotizaciones y proformas</p>
      </div>
      <button
        @click="showForm = !showForm"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        {{ showForm ? 'Cancelar' : 'Nueva Cotización' }}
      </button>
    </div>

    <!-- Create Form -->
    <div v-if="showForm" class="mb-8 bg-[#131926] border border-slate-800/50 rounded-xl p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Nueva Cotización</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="text-xs text-slate-400 uppercase">Cliente</label>
          <select v-model="form.clientId" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200">
            <option value="">Seleccionar cliente</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">{{ client.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-slate-400 uppercase">Válida hasta</label>
          <input v-model="form.validUntil" type="date" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200" />
        </div>
      </div>
      <div class="mb-4">
        <label class="text-xs text-slate-400 uppercase">Notas</label>
        <textarea v-model="form.notes" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"></textarea>
      </div>
      <div class="mb-4">
        <label class="text-xs text-slate-400 uppercase">Términos y condiciones</label>
        <textarea v-model="form.terms" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"></textarea>
      </div>

      <!-- Items -->
      <div class="mb-4">
        <label class="text-xs text-slate-400 uppercase">Items</label>
        <div v-for="(item, index) in form.items" :key="index" class="grid grid-cols-12 gap-2 mb-2">
          <div class="col-span-4">
            <select v-model="item.productId" @change="updateItemPrice(index)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200">
              <option value="">Producto</option>
              <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
            </select>
          </div>
          <div class="col-span-2">
            <input v-model.number="item.quantity" type="number" min="1" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200" placeholder="Cant" />
          </div>
          <div class="col-span-2">
            <input v-model.number="item.unitPrice" type="number" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200" placeholder="Precio" />
          </div>
          <div class="col-span-2">
            <input v-model.number="item.taxRate" type="number" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200" placeholder="IVA%" />
          </div>
          <div class="col-span-1">
            <button @click="removeItem(index)" class="p-2 text-rose-400 hover:bg-rose-900/30 rounded-lg">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        <button @click="addItem" class="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          <Plus class="w-4 h-4" /> Agregar item
        </button>
      </div>

      <!-- Totals -->
      <div class="flex justify-end gap-4 text-sm mb-4">
        <div class="text-slate-400">Subtotal: <span class="text-white">{{ formatCurrency(subtotal) }}</span></div>
        <div class="text-slate-400">IVA: <span class="text-white">{{ formatCurrency(taxTotal) }}</span></div>
        <div class="text-slate-400 font-semibold">Total: <span class="text-emerald-400">{{ formatCurrency(total) }}</span></div>
      </div>

      <div class="flex justify-end">
        <button @click="createQuote" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium">
          Crear Cotización
        </button>
      </div>
    </div>

    <!-- Quotes List -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="w-8 h-8 text-emerald-400 animate-spin" />
    </div>

    <div v-else-if="quotes.length === 0" class="text-center py-20 text-slate-500">
      <FileText class="w-12 h-12 mx-auto mb-4 opacity-50" />
      <p>No hay cotizaciones registradas</p>
    </div>

    <div v-else class="bg-[#131926] border border-slate-800/50 rounded-xl overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-800/30 text-left">
          <tr>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Número</th>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Cliente</th>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Fecha</th>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Válida hasta</th>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Total</th>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Estado</th>
            <th class="px-4 py-3 text-xs font-medium text-slate-400 uppercase text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/50">
          <tr v-for="quote in quotes" :key="quote.id" class="hover:bg-slate-800/30">
            <td class="px-4 py-3 text-sm font-mono text-slate-300">{{ quote.number }}</td>
            <td class="px-4 py-3 text-sm text-white">{{ quote.client?.name || 'N/A' }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ formatDate(quote.createdAt) }}</td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ quote.validUntil ? formatDate(quote.validUntil) : '-' }}</td>
            <td class="px-4 py-3 text-sm font-semibold text-emerald-400">{{ formatCurrency(quote.total) }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-1 rounded-full text-xs font-medium', statusColors[quote.status]]">
                {{ statusLabels[quote.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button v-if="quote.status === 'draft'" @click="updateStatus(quote.id, 'sent')" class="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded" title="Marcar enviada">
                  <Send class="w-4 h-4" />
                </button>
                <button v-if="quote.status === 'sent'" @click="updateStatus(quote.id, 'accepted')" class="p-1.5 text-emerald-400 hover:bg-emerald-900/30 rounded" title="Aceptar">
                  <CheckCircle class="w-4 h-4" />
                </button>
                <button v-if="quote.status === 'sent'" @click="updateStatus(quote.id, 'rejected')" class="p-1.5 text-rose-400 hover:bg-rose-900/30 rounded" title="Rechazar">
                  <XCircle class="w-4 h-4" />
                </button>
                <button v-if="quote.status === 'accepted'" @click="convertToInvoice(quote.id)" :disabled="converting === quote.id" class="p-1.5 text-purple-400 hover:bg-purple-900/30 rounded" title="Convertir a factura">
                  <RefreshCw :class="['w-4 h-4', converting === quote.id && 'animate-spin']" />
                </button>
                <button v-if="quote.status !== 'converted'" @click="deleteQuote(quote.id)" class="p-1.5 text-rose-400 hover:bg-rose-900/30 rounded" title="Eliminar">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
</style>
