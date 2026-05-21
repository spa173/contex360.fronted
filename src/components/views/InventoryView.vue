<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { formatCurrency } from '../../utils/ui'
import { generatePdfReport } from '../../utils/pdfExport'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const inventory = useInventoryStore()
const tenantProducts = computed(() => inventory.tenantProducts || [])

const searchQuery = ref('')
const stockFilter = ref('todos')

const totalValue = computed(() => tenantProducts.value.reduce((s, p) => s + (p.price * p.stock || 0), 0))
const totalItems = computed(() => tenantProducts.value.reduce((s, p) => s + (p.stock || 0), 0))
const lowStockCount = computed(() => tenantProducts.value.filter(p => p.stock <= p.minStock && p.stock > 0).length)
const criticalStockCount = computed(() => tenantProducts.value.filter(p => p.stock === 0).length)

function generateRandomDigits(length = 4) {
  const crypto = globalThis.crypto
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, byte => String(byte % 10)).join('')
  }

  return '0'.repeat(length)
}

const filteredProducts = computed(() => {
  let list = tenantProducts.value
  if (stockFilter.value === 'bajo') {
    list = list.filter(p => p.stock <= p.minStock && p.stock > 0)
  } else if (stockFilter.value === 'critico') {
    list = list.filter(p => p.stock === 0)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p => 
      (p.sku || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    )
  }
  return list
})

function handleNewProduct() {
  const num = generateRandomDigits(4)
  const res = inventory.createProduct({
    sku: `SKU-${num}`,
    name: `Teclado Mecánico K${num}`,
    price: 350000,
    cost: 220000,
    taxRate: 19,
    stock: 25,
    minStock: 5,
    maxStock: 50,
    category: 'Periféricos',
    location: 'Bodega Central'
  })
  if (res?.ok) {
    emit('notify', { message: 'Producto registrado', detail: res.detail || `SKU-${num} añadido correctamente.` })
  }
}

async function handleExport() {
  emit('notify', { message: 'Generando PDF de Inventario', detail: 'ContexAI está valorizando las existencias en bodega...' })
  const filteredCount = filteredProducts.value.length
  const filteredVal = filteredProducts.value.reduce((s, p) => s + (p.price * p.stock || 0), 0)
  const filteredUnits = filteredProducts.value.reduce((s, p) => s + (p.stock || 0), 0)

  await generatePdfReport({
    title: 'Reporte de Inventario y Existencias',
    subtitle: `Filtro de stock: ${stockFilter.value.toUpperCase()}`,
    fileName: `Inventario_Contex360_${Date.now()}.pdf`,
    data: {
      'SKUs en este reporte': `${filteredCount} productos`,
      'Unidades Físicas Totales': `${filteredUnits} unidades`,
      'Valorización de Existencias': formatCurrency(filteredVal),
      'SKUs con Stock Bajo / Crítico': `${lowStockCount.value + criticalStockCount.value} productos`
    },
    aiSummary: criticalStockCount.value > 0 ? `¡ATENCIÓN! Se detectaron ${criticalStockCount.value} productos con stock agotado (0 unidades). Se recomienda emitir orden de compra inmediata.` : 'Los niveles de inventario se encuentran dentro de los márgenes óptimos de rotación.'
  })
  emit('notify', { message: 'PDF Descargado', detail: 'El reporte de existencias y valoración ha sido guardado exitosamente.' })
}

function statusBadge(product) {
  if (product.stock === 0) return { label: 'Crítico', class: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' }
  if (product.stock <= product.minStock) return { label: 'Stock bajo', class: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' }
  return { label: 'Óptimo', class: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' }
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Operaciones</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Inventario</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Inventario</h1>
        <p class="text-[14px] text-[#71717A]">Gestión de existencias, rotación y alertas de reabastecimiento.</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold transition-colors">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
        <button @click="handleNewProduct" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold transition-colors">
          <span class="material-symbols-outlined text-[18px]">add</span>Nuevo producto
        </button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-4">
          <span class="material-symbols-outlined text-[20px]">attach_money</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Valor inventario</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ formatCurrency(totalValue) }}</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#18181B] mb-4">
          <span class="material-symbols-outlined text-[20px]">category</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Items en stock</p>
        <p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">{{ totalItems }}</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-amber-50 flex items-center justify-center text-amber-700 mb-4">
          <span class="material-symbols-outlined text-[20px]">warning</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Stock bajo</p>
        <p class="text-[22px] font-bold text-amber-700 tracking-[-0.02em] font-mono">{{ lowStockCount }} <span class="text-[12px] text-[#A1A1AA] font-semibold uppercase">SKUs</span></p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="w-9 h-9 rounded-[10px] bg-rose-50 flex items-center justify-center text-rose-700 mb-4">
          <span class="material-symbols-outlined text-[20px]">error</span>
        </div>
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Stock crítico</p>
        <p class="text-[22px] font-bold text-rose-700 tracking-[-0.02em] font-mono">{{ criticalStockCount }} <span class="text-[12px] text-[#A1A1AA] font-semibold uppercase">SKUs</span></p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
      <div class="px-5 py-4 border-b border-[#F4F4F5] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div class="relative w-full sm:w-72">
          <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
          <input v-model="searchQuery" placeholder="Buscar SKU o nombre..." class="pl-8 pr-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B] w-full" />
        </div>
        <div class="flex flex-wrap gap-2">
          <button @click="stockFilter = 'todos'" :class="stockFilter === 'todos' ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'" class="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-colors">Todos</button>
          <button @click="stockFilter = 'bajo'" :class="stockFilter === 'bajo' ? 'bg-amber-50 border-amber-200 text-amber-800 font-semibold' : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'" class="px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-1.5 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Bajo
          </button>
          <button @click="stockFilter = 'critico'" :class="stockFilter === 'critico' ? 'bg-rose-50 border-rose-200 text-rose-800 font-semibold' : 'bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA]'" class="px-3 py-1.5 rounded-[8px] text-[12px] font-medium flex items-center gap-1.5 transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Crítico
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left min-w-[640px]">
          <thead>
            <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
              <th class="px-5 py-3">SKU</th>
              <th class="px-5 py-3">Producto</th>
              <th class="px-5 py-3">Categoría</th>
              <th class="px-5 py-3 text-right">Stock</th>
              <th class="px-5 py-3">Estado</th>
              <th class="px-5 py-3">Sugerencia IA</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
            <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-[#FAFAFA] transition-colors">
              <td class="px-5 py-3.5 font-mono text-[#A1A1AA] text-[12px]">{{ p.sku || 'N/A' }}</td>
              <td class="px-5 py-3.5 font-semibold text-[#18181B]">{{ p.name }}</td>
              <td class="px-5 py-3.5 text-[#71717A]">{{ p.category || 'General' }}</td>
              <td class="px-5 py-3.5 text-right font-mono font-bold" :class="{ 'text-rose-600': p.stock === 0, 'text-amber-600': p.stock > 0 && p.stock <= p.minStock, 'text-[#18181B]': p.stock > p.minStock }">
                {{ p.stock }}
              </td>
              <td class="px-5 py-3.5">
                <span :class="['inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold', statusBadge(p).class]">
                  <span :class="['w-1.5 h-1.5 rounded-full', statusBadge(p).dot]"></span>
                  {{ statusBadge(p).label }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div v-if="p.stock <= p.minStock" class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[14px] text-[#2563EB]">auto_awesome</span>
                  <span class="text-[11px] font-semibold text-[#2563EB]">Reabastecer {{ p.minStock * 2 }} unid.</span>
                </div>
                <div v-else class="flex items-center gap-2 text-[#A1A1AA]">
                  <span class="material-symbols-outlined text-[14px]">trending_flat</span>
                  <span class="text-[11px]">Rotación estable</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-right">
                <button class="text-[#A1A1AA] hover:text-[#18181B]">
                  <span class="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="7" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No se encontraron productos con el criterio de búsqueda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
