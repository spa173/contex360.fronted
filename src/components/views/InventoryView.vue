<script setup>
import { computed } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { formatCurrency } from '../../utils/ui'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const inventory = useInventoryStore()

const totalValue = computed(() => (inventory.tenantProducts || []).reduce((sum, p) => sum + (p.price * p.stock || 0), 0))
const totalItems = computed(() => (inventory.tenantProducts || []).reduce((sum, p) => sum + (p.stock || 0), 0))
const lowStockCount = computed(() => (inventory.tenantProducts || []).filter(p => p.stock <= p.minStock && p.stock > 0).length)
const criticalStockCount = computed(() => (inventory.tenantProducts || []).filter(p => p.stock === 0).length)

function getStockStatus(product) {
  if (product.stock === 0) return { label: 'Crítico', class: 'bg-rose-50 text-rose-600 border-rose-100' }
  if (product.stock <= product.minStock) return { label: 'Stock Bajo', class: 'bg-amber-50 text-amber-600 border-amber-100' }
  return { label: 'Óptimo', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Inventario</h1>
        <p class="text-sm text-slate-500 mt-1">Gestión de existencias y análisis de rotación.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          Exportar
        </button>
        <button class="px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 hover:bg-cyan-600 transition-colors shadow-sm shadow-cyan-200">
          <span class="material-symbols-outlined text-[18px]">add</span>
          Nuevo Producto
        </button>
      </div>
    </div>

    <!-- KPI Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Valor Total -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 mb-4">
          <span class="material-symbols-outlined">attach_money</span>
        </div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor de Inventario</p>
        <h3 class="text-2xl font-bold text-slate-900 font-mono">{{ formatCurrency(totalValue) }}</h3>
      </div>
      <!-- Total Items -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 mb-4">
          <span class="material-symbols-outlined">category</span>
        </div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Items en Stock</p>
        <h3 class="text-2xl font-bold text-slate-900 font-mono">{{ totalItems }}</h3>
      </div>
      <!-- Low Stock -->
      <div class="bg-white rounded-xl border border-amber-200 p-6 shadow-sm">
        <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-4">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Bajo</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-amber-600 font-mono">{{ lowStockCount }}</h3>
          <span class="text-[10px] font-bold text-slate-400 uppercase">SKUs</span>
        </div>
      </div>
      <!-- Critical Stock -->
      <div class="bg-white rounded-xl border border-rose-200 p-6 shadow-sm">
        <div class="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 mb-4">
          <span class="material-symbols-outlined">error</span>
        </div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock Crítico</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-rose-600 font-mono">{{ criticalStockCount }}</h3>
          <span class="text-[10px] font-bold text-slate-400 uppercase">SKUs</span>
        </div>
      </div>
    </div>

    <!-- Inventory List Section -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30">
        <div class="relative w-full sm:w-80">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input class="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20" placeholder="Buscar SKU o Nombre..." type="text"/>
        </div>
        <div class="flex gap-2 w-full sm:w-auto overflow-x-auto">
          <button class="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">Todos</button>
          <button class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50">Normal</button>
          <button class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-amber-600 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-50">Bajo</button>
          <button class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-50">Crítico</button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
              <th class="px-6 py-3">SKU</th>
              <th class="px-6 py-3 w-1/4">Producto</th>
              <th class="px-6 py-3">Categoría</th>
              <th class="px-6 py-3 text-right">Cant.</th>
              <th class="px-6 py-3">Ubicación</th>
              <th class="px-6 py-3 text-center">Estado</th>
              <th class="px-6 py-3 w-1/4">ContexAI Suggestion</th>
              <th class="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
            <tr v-for="product in inventory.tenantProducts" :key="product.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-mono text-slate-400">{{ product.sku || 'N/A' }}</td>
              <td class="px-6 py-4 font-bold">{{ product.name }}</td>
              <td class="px-6 py-4 text-slate-500">{{ product.category || 'General' }}</td>
              <td class="px-6 py-4 text-right font-mono font-bold" :class="{'text-rose-600': product.stock === 0, 'text-amber-600': product.stock > 0 && product.stock <= product.minStock}">
                {{ product.stock }}
              </td>
              <td class="px-6 py-4 text-slate-400">Bodega Principal</td>
              <td class="px-6 py-4 text-center">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase border', getStockStatus(product).class]">
                  {{ getStockStatus(product).label }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div v-if="product.stock <= product.minStock" class="flex items-center gap-2 p-1.5 rounded bg-violet-50 border border-violet-100">
                  <span class="material-symbols-outlined text-[16px] text-violet-600">smart_toy</span>
                  <span class="text-[10px] font-bold text-violet-700">Reabastecer {{ product.minStock * 2 }} unid. sugerido</span>
                </div>
                <div v-else class="flex items-center gap-2 text-slate-400">
                  <span class="material-symbols-outlined text-[16px] text-violet-400">smart_toy</span>
                  <span class="text-[10px]">Rotación estable</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center text-slate-400">
                <button class="hover:text-violet-600 transition-colors">
                  <span class="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </td>
            </tr>
            <tr v-if="inventory.tenantProducts.length === 0">
              <td colspan="8" class="px-6 py-10 text-center text-slate-400">No hay productos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
