<script setup lang="ts">
/**
 * MockInventory — coded recreation of the multi-warehouse inventory view.
 * Mirrors the real InventoryView: SKU, stock per bodega, and low-stock state.
 */
const rows = [
  { sku: 'PRD-0192', name: 'Laptop Pro 14"', bodega: 'Bogotá', stock: 42, state: 'ok' },
  { sku: 'PRD-0455', name: 'Monitor 27" 4K', bodega: 'Medellín', stock: 7, state: 'low' },
  { sku: 'PRD-0871', name: 'Teclado mecánico', bodega: 'Cali', stock: 128, state: 'ok' },
]
</script>

<template>
  <div class="inv2">
    <div class="inv2__head">
      <span>Producto</span><span>Bodega</span><span>Stock</span>
    </div>
    <div
      v-for="r in rows"
      :key="r.sku"
      class="inv2__row"
    >
      <span class="inv2__prod">
        <span class="inv2__name">{{ r.name }}</span>
        <span class="inv2__sku">{{ r.sku }}</span>
      </span>
      <span class="inv2__bodega">{{ r.bodega }}</span>
      <span
        class="inv2__stock"
        :class="r.state === 'low' ? 'inv2__stock--low' : ''"
      >
        {{ r.stock }} u
        <i
          v-if="r.state === 'low'"
          class="inv2__dot"
          aria-hidden="true"
        />
      </span>
    </div>
  </div>
</template>

<style scoped>
.inv2 { font-size: 12px; }
.inv2__head, .inv2__row {
  display: grid; grid-template-columns: 1fr auto 70px; gap: 0.6rem; align-items: center;
}
.inv2__head { font-size: 9.5px; font-weight: 800; letter-spacing: 0.06em; color: #A1A1AA; text-transform: uppercase; padding-bottom: 0.5rem; border-bottom: 1px solid #F0F0F1; }
.inv2__row { padding: 0.6rem 0; border-bottom: 1px solid #F7F7F8; }
.inv2__prod { display: flex; flex-direction: column; }
.inv2__name { font-weight: 600; color: #18181B; }
.inv2__sku { font-size: 10px; color: #A1A1AA; font-family: ui-monospace, monospace; }
.inv2__bodega { font-size: 11px; color: #71717A; }
.inv2__stock { display: inline-flex; align-items: center; justify-content: flex-end; gap: 5px; font-weight: 700; font-variant-numeric: tabular-nums; color: #18181B; }
.inv2__stock--low { color: #d97706; }
.inv2__dot { width: 6px; height: 6px; border-radius: 9999px; background: #d97706; }
</style>
