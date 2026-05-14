<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'
import { useStateStore } from '@/stores/stateStore'
import { formatCurrency, formatDate } from '@/utils/ui'

defineProps<{
  isActive: boolean
}>()

const emit = defineEmits(['notify'])
const store = useInventoryStore()
const rootStore = useStateStore()

const productForm = reactive({
  sku: '',
  name: '',
  price: 0,
  cost: 0,
  taxRate: 19,
  stock: 1,
  minStock: 1,
  maxStock: 0,
  location: '',
  category: 'General',
  barcode: '',
  isInventoriable: true,
  productType: 'standard' as 'standard' | 'kit',
  kitComponents: [] as { productId: string; quantity: number }[],
  preferredSupplier: '',
})

const newComponent = reactive({ productId: '', quantity: 1 })

function addKitComponent() {
  if (!newComponent.productId || newComponent.quantity <= 0) return
  productForm.kitComponents.push({ ...newComponent })
  newComponent.productId = ''
  newComponent.quantity = 1
}

function removeKitComponent(index: number) {
  productForm.kitComponents.splice(index, 1)
}

function viewReceipt(invoiceId: string) {
  rootStore.setActiveView('billing')
  // @ts-ignore
  rootStore.selections.invoiceId = invoiceId
}

function resetForm() {
  Object.assign(productForm, {
    sku: '',
    name: '',
    price: 0,
    cost: 0,
    taxRate: 19,
    stock: 1,
    minStock: 1,
    maxStock: 0,
    location: '',
    category: 'General',
    barcode: '',
    isInventoriable: true,
    productType: 'standard',
    kitComponents: [],
    preferredSupplier: '',
  })
}

const activeTab = ref('general')

// --- Audit Logic ---
const auditMode = ref(false)
const auditData = reactive<Record<string, any>>({})

function toggleAuditMode() {
  if (auditMode.value) {
    auditMode.value = false
    return
  }
  auditMode.value = true
  store.tenantProducts.forEach(p => {
    if (p.isInventoriable && p.productType !== 'kit') {
      const locId = store.tenantLocations?.[0]?.id || 'default'
      auditData[p.id] = { count: p.stockByLocation[locId] || 0, reason: '', locationId: locId, photoBase64: '' }
    }
  })
}

function handlePhotoUpload(event: any, productId: string) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e: any) => {
    auditData[productId].photoBase64 = e.target.result
  }
  reader.readAsDataURL(file)
}

function saveAudit() {
  const adjustments = Object.keys(auditData).map(productId => ({
    productId,
    locationId: auditData[productId].locationId,
    physicalCount: auditData[productId].count,
    reason: auditData[productId].reason,
    photoBase64: auditData[productId].photoBase64
  })).filter(adj => {
    const product = store.tenantProducts.find(p => p.id === adj.productId)
    return product && (product.stockByLocation[adj.locationId] || 0) !== adj.physicalCount
  })

  if (adjustments.length === 0) {
    emit('notify', { message: 'No hay diferencias para ajustar.' })
    auditMode.value = false
    return
  }

  const result = store.auditInventory({ adjustments })
  emit('notify', { message: result.message })
  if (result.ok) auditMode.value = false
}

// --- Transfer Logic ---
const transferForm = reactive({ productId: '', fromLocId: '', toLocId: '', quantity: 1 })
const lastTransfer = ref<any>(null)

function handleTransfer() {
  if (transferForm.fromLocId === transferForm.toLocId) {
    emit('notify', { message: 'La bodega de origen y destino deben ser diferentes.' })
    return
  }
  const result = store.transferStock(transferForm)
  emit('notify', { message: result.message })
  if (result.ok) {
    const prod = store.tenantProducts.find(p => p.id === transferForm.productId)
    const fromLoc = store.tenantLocations.find(l => l.id === transferForm.fromLocId)?.name
    const toLoc = store.tenantLocations.find(l => l.id === transferForm.toLocId)?.name
    lastTransfer.value = { ...transferForm, productName: prod?.name, fromLoc, toLoc, date: new Date() }
    transferForm.productId = ''
    transferForm.quantity = 1
  }
}

function confirmReceiveTransfer(transferId: string) {
  const result = store.receiveTransfer(transferId)
  emit('notify', { message: result.message })
}

const canInventory = computed(() => store.canManageInventory)

const permissionNote = computed(() =>
  canInventory.value
    ? 'Tu rol puede crear y ajustar productos en este tenant.'
    : 'Modo solo lectura. Tu rol activo no puede modificar inventario.',
)

const sortedProducts = computed(() =>
  [...store.tenantProducts].sort((left, right) => left.name.localeCompare(right.name, 'es')),
)

function handleSubmit() {
  const result = store.createProduct(productForm)

  emit('notify', {
    message: result.message,
    detail: result.detail || '',
  })

  if (result.ok) {
    resetForm()
  }
}

function handleFileUpload(event: any) {
  const file = event.target.files[0]
  if (!file) return

  file.text().then((content: string) => {
    const result = store.importProductsCSV(content)
    emit('notify', {
      message: result.message,
      detail: result.detail || '',
    })
    event.target.value = ''
  })
}

function exportCSV() {
  const headers = ['sku', 'name', 'price', 'cost', 'taxRate', 'stock', 'minStock', 'maxStock', 'location', 'category', 'barcode', 'isInventoriable']
  const rows = store.tenantProducts.map(p => 
    headers.map(h => (p as any)[h]).join(',')
  )
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `inventario_${store.activeTenantId}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>

<template>
  <section v-if="isActive" class="p-8 space-y-8 animate-in fade-in duration-500">
    <!-- Header & Navigation -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
      <div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Gestión de Inventario</h1>
        <p class="text-slate-400 mt-1">{{ permissionNote }}</p>
      </div>
      
      <nav class="flex p-1 bg-slate-900/50 rounded-lg border border-slate-800">
        <button 
          v-for="tab in ['general', 'operaciones', 'inteligencia']" 
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-6 py-2 rounded-md transition-all duration-200 text-sm font-medium capitalize',
            activeTab === tab ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg' : 'text-slate-400 hover:text-white'
          ]"
        >
          {{ tab }}
        </button>
      </nav>
    </header>

    <!-- Tab Content: General -->
    <div v-if="activeTab === 'general'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Create Product Form -->
      <aside class="lg:col-span-1 space-y-6">
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-xl">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Nuevo Producto</h2>
              <p class="text-xs text-slate-400">Registrar ítem en el maestro</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-4" :class="{ 'opacity-50 pointer-events-none': !canInventory }">
              <div class="space-y-1">
                <label class="text-xs font-medium text-slate-400 ml-1">Nombre del Producto</label>
                <input v-model="productForm.name" type="text" placeholder="Ej: Consultoría Contable" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" required />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">SKU</label>
                  <input v-model="productForm.sku" type="text" placeholder="SKU-001" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">Categoría</label>
                  <input v-model="productForm.category" type="text" placeholder="General" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">Precio</label>
                  <input v-model.number="productForm.price" type="number" step="0.01" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">Costo</label>
                  <input v-model.number="productForm.cost" type="number" step="0.01" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none" required />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">IVA %</label>
                  <input v-model.number="productForm.taxRate" type="number" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">Stock Inicial</label>
                  <input v-model.number="productForm.stock" type="number" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-medium text-slate-400 ml-1">Mínimo</label>
                  <input v-model.number="productForm.minStock" type="number" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none" />
                </div>
              </div>

              <div class="flex items-center gap-2 py-2">
                <input v-model="productForm.isInventoriable" type="checkbox" class="w-4 h-4 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20" />
                <span class="text-sm text-slate-300">Producto inventariable</span>
              </div>

              <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-emerald-500/20 transition-all duration-200">
                Guardar Producto
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Actions -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-xl">
          <h3 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Acciones Rápidas</h3>
          <div class="grid grid-cols-2 gap-3">
            <button @click="exportCSV" class="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-colors">
              <span class="text-xl">📊</span>
              <span class="text-xs text-slate-400">Exportar CSV</span>
            </button>
            <label class="flex flex-col items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-colors cursor-pointer">
              <span class="text-xl">📥</span>
              <span class="text-xs text-slate-400">Importar CSV</span>
              <input type="file" accept=".csv" class="hidden" @change="handleFileUpload" />
            </label>
            <button @click="toggleAuditMode" :class="[
              'flex flex-col items-center gap-2 p-3 border rounded-xl transition-colors col-span-2',
              auditMode ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
            ]">
              <span class="text-xl">🔍</span>
              <span class="text-xs font-medium" :class="auditMode ? 'text-emerald-400' : 'text-slate-400'">
                {{ auditMode ? 'Finalizar Auditoría' : 'Iniciar Auditoría' }}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Products Table -->
      <main class="lg:col-span-2 space-y-6">
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl shadow-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-900/50 border-b border-slate-800">
                  <th class="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Producto</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categoría</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">Stock</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Precio</th>
                  <th v-if="auditMode" class="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ajuste</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                <tr v-for="product in sortedProducts" :key="product.id" class="hover:bg-slate-800/30 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{{ product.name }}</span>
                      <span class="text-xs text-slate-500 font-mono">{{ product.sku }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] font-semibold text-slate-400 uppercase">
                      {{ product.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <span :class="[
                        'text-sm font-bold px-2.5 py-0.5 rounded-full',
                        product.stock <= product.minStock ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      ]">
                        {{ product.stock }}
                      </span>
                      <span class="text-[10px] text-slate-500">Min: {{ product.minStock }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <span class="text-sm font-semibold text-white">{{ formatCurrency(product.price) }}</span>
                  </td>
                  <td v-if="auditMode && product.isInventoriable" class="px-6 py-4">
                    <div class="flex gap-2">
                      <input v-model.number="auditData[product.id].count" type="number" class="w-20 bg-slate-900 border border-emerald-500/30 rounded px-2 py-1 text-sm text-emerald-400 focus:border-emerald-500 outline-none" />
                      <button @click="saveAudit" class="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!sortedProducts.length" class="p-12 text-center">
            <div class="text-slate-600 mb-2">🚫</div>
            <p class="text-slate-400">No hay productos registrados en este tenant.</p>
          </div>
        </div>

        <!-- Recent Movements -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-white flex items-center gap-2">
              <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Kardex Reciente
            </h3>
            <button class="text-xs text-emerald-400 hover:underline">Ver todo el historial</button>
          </div>
          
          <div class="space-y-4">
            <div v-for="movement in store.tenantInventoryMovements.slice(0, 5)" :key="movement.id" class="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl">
              <div class="flex items-center gap-4">
                <div :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm',
                  movement.type === 'salida' ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
                ]">
                  {{ movement.type === 'salida' ? '📦' : '📥' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ movement.productName }}</p>
                  <p class="text-xs text-slate-400">{{ movement.note }} • {{ formatDate(movement.at) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p :class="[
                  'text-sm font-bold',
                  movement.type === 'salida' ? 'text-red-400' : 'text-emerald-400'
                ]">
                  {{ movement.type === 'salida' ? '-' : '+' }}{{ movement.quantity }}
                </p>
                <p class="text-[10px] text-slate-500 uppercase tracking-tighter">{{ movement.type }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Tab Content: Operaciones -->
    <div v-if="activeTab === 'operaciones'" class="space-y-8 animate-in slide-in-from-bottom-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Stock Transfers -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-xl">
          <div class="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
            <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Traslado de Mercancía</h2>
              <p class="text-xs text-slate-400">Movimiento entre bodegas</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-medium text-slate-400 ml-1">Producto a trasladar</label>
              <select v-model="transferForm.productId" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-all">
                <option value="" disabled>Seleccione un producto...</option>
                <option v-for="p in sortedProducts.filter(p => p.isInventoriable)" :key="p.id" :value="p.id">
                  {{ p.name }} (Stock: {{ p.stock }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-xs font-medium text-slate-400 ml-1">Bodega Origen</label>
                <select v-model="transferForm.fromLocId" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none">
                  <option v-for="loc in store.tenantLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-medium text-slate-400 ml-1">Bodega Destino</label>
                <select v-model="transferForm.toLocId" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none">
                  <option v-for="loc in store.tenantLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-xs font-medium text-slate-400 ml-1">Cantidad</label>
              <input v-model.number="transferForm.quantity" type="number" min="1" class="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none" />
            </div>

            <button @click="handleTransfer" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all">
              Ejecutar Traslado
            </button>
          </div>
        </div>

        <!-- Pending Transfers -->
        <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-4">Traslados en Tránsito</h2>
          
          <div class="space-y-4">
            <div v-for="t in store.inventoryTransfers.filter(t => t.status === 'en_transito')" :key="t.id" class="p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-white">{{ t.quantity }}x {{ t.productName }}</p>
                <p class="text-xs text-slate-500">Destino: {{ store.tenantLocations.find(l => l.id === t.toLocId)?.name }}</p>
                <p class="text-[10px] text-slate-600 mt-1">{{ formatDate(t.date as string) }}</p>
              </div>
              <button @click="confirmReceiveTransfer(t.id)" class="px-4 py-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition-all">
                Recibir
              </button>
            </div>
            <div v-if="!store.inventoryTransfers.filter(t => t.status === 'en_transito').length" class="py-12 text-center text-slate-500">
              <p>No hay traslados pendientes de recepción.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Inteligencia -->
    <div v-if="activeTab === 'inteligencia'" class="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95">
      <!-- ABC Analysis -->
      <article class="md:col-span-3 bg-[#131926] border border-slate-800/50 rounded-2xl p-8 shadow-2xl overflow-hidden relative">
        <div class="absolute top-0 right-0 p-8 opacity-5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>

        <div class="relative">
          <h2 class="text-2xl font-bold text-white mb-2">Análisis ABC de Inventario</h2>
          <p class="text-slate-400 mb-8 max-w-2xl">Visualización del impacto financiero por ítem. Optimiza tus compras enfocándote en la categoría A.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 group hover:bg-emerald-500/10 transition-all">
              <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black rounded uppercase">Clase A</span>
                <span class="text-2xl">💎</span>
              </div>
              <p class="text-3xl font-bold text-emerald-400">{{ Object.values(store.abcAnalysis).filter(v => v === 'A').length }}</p>
              <p class="text-sm text-slate-400 mt-1">Generan el 80% de tus ingresos</p>
            </div>
            
            <div class="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 group hover:bg-blue-500/10 transition-all">
              <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-0.5 bg-blue-500 text-black text-[10px] font-black rounded uppercase">Clase B</span>
                <span class="text-2xl">📦</span>
              </div>
              <p class="text-3xl font-bold text-blue-400">{{ Object.values(store.abcAnalysis).filter(v => v === 'B').length }}</p>
              <p class="text-sm text-slate-400 mt-1">Rotación constante y saludable</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 group hover:bg-slate-700/50 transition-all">
              <div class="flex items-center justify-between mb-4">
                <span class="px-2 py-0.5 bg-slate-600 text-white text-[10px] font-black rounded uppercase">Clase C</span>
                <span class="text-2xl">⏱️</span>
              </div>
              <p class="text-3xl font-bold text-slate-400">{{ Object.values(store.abcAnalysis).filter(v => v === 'C').length }}</p>
              <p class="text-sm text-slate-400 mt-1">Artículos de baja rotación</p>
            </div>
          </div>
        </div>
      </article>

      <!-- Dead Inventory Alert -->
      <article v-if="store.deadInventory.length" class="bg-red-500/5 border border-red-500/20 rounded-xl p-6 shadow-xl">
        <h3 class="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
          <span>⚠️</span> Inventario Muerto
        </h3>
        <p class="text-xs text-slate-400 mb-6">Ítems sin movimiento en los últimos 90 días. Riesgo de obsolescencia.</p>
        <div class="space-y-3">
          <div v-for="p in store.deadInventory.slice(0, 3)" :key="p.id" class="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex justify-between items-center">
            <span class="text-sm text-white">{{ p.name }}</span>
            <span class="text-xs font-bold text-red-400">{{ formatCurrency(p.stock * p.cost) }}</span>
          </div>
        </div>
      </article>

      <!-- Reorder Suggestions -->
      <article class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 shadow-xl md:col-span-2">
        <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
          Sugerencias de Abastecimiento
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="(items, supplier) in store.reorderSuggestions" :key="supplier" class="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h4 class="text-sm font-bold text-amber-400 mb-3 flex items-center justify-between">
              {{ supplier }}
              <span class="text-[10px] px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">Proveedor</span>
            </h4>
            <ul class="space-y-2">
              <li v-for="item in items" :key="item.productId" class="flex justify-between text-xs">
                <span class="text-slate-300">{{ item.name }}</span>
                <span class="font-bold text-white">Pedir: {{ item.quantityToOrder }}</span>
              </li>
            </ul>
          </div>
          <div v-if="!Object.keys(store.reorderSuggestions).length" class="col-span-2 py-12 text-center text-slate-500">
            <p>El stock actual se encuentra por encima del punto de reorden.</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
/* Transiciones suaves */
.animate-in {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-in.fade-in { animation-name: fade-in; }
.animate-in.slide-in-from-bottom-4 { animation-name: slide-in-from-bottom; }
.animate-in.zoom-in-95 { animation-name: zoom-in; }

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}
</style>
