<script setup>
import { computed } from 'vue'
import { useInventoryStore } from '../../stores/inventoryStore'
import { formatCurrency } from '../../utils/ui'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const inventory = useInventoryStore()

const totalValue = computed(() => (inventory.tenantProducts || []).reduce((s, p) => s + (p.price * p.stock || 0), 0))
const totalItems = computed(() => (inventory.tenantProducts || []).reduce((s, p) => s + (p.stock || 0), 0))
const lowStockCount = computed(() => (inventory.tenantProducts || []).filter(p => p.stock <= p.minStock && p.stock > 0).length)
const criticalStockCount = computed(() => (inventory.tenantProducts || []).filter(p => p.stock === 0).length)

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
        <button class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
        <button class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold">
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
          <input placeholder="Buscar SKU o nombre..." class="pl-8 pr-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B] w-full" />
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 rounded-[8px] bg-[#18181B] text-white text-[12px] font-semibold">Todos</button>
          <button class="px-3 py-1.5 rounded-[8px] bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA] text-[12px] font-medium flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Bajo
          </button>
          <button class="px-3 py-1.5 rounded-[8px] bg-white border border-[#E4E4E7] text-[#71717A] hover:bg-[#FAFAFA] text-[12px] font-medium flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Crítico
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
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
            <tr v-for="p in inventory.tenantProducts" :key="p.id" class="hover:bg-[#FAFAFA]">
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
            <tr v-if="inventory.tenantProducts.length === 0">
              <td colspan="7" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No hay productos registrados.</td>
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
