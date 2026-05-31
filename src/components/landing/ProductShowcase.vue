<script setup lang="ts">
/**
 * ProductShowcase — "El producto en acción" (P1 point 3). Tabbed section that
 * shows the four core surfaces of Contex360 as real, coded UI inside a
 * ProductFrame. No fabricated screenshots: every panel mirrors the live views.
 */
import { ref } from 'vue'
import ProductFrame from './ProductFrame.vue'
import MockInvoiceDIAN from './MockInvoiceDIAN.vue'
import MockInventory from './MockInventory.vue'
import MockReports from './MockReports.vue'
import MockClients from './MockClients.vue'
import type { ProductTab } from './types'

const tabs: ProductTab[] = [
  { id: 'dian', label: 'Facturación DIAN' },
  { id: 'inventory', label: 'Inventario' },
  { id: 'reports', label: 'Reportes' },
  { id: 'clients', label: 'Clientes' },
]

const active = ref('dian')

const copy: Record<string, { title: string; text: string; frame: string }> = {
  dian:      { title: 'Factura electrónica aceptada por la DIAN', text: 'Genera CUFE válido y reglamentario, firmado con tu certificado digital, con emisión directa habilitada para la DIAN.', frame: 'contex360.co/facturacion' },
  inventory: { title: 'Inventario multi-bodega en tiempo real', text: 'Controla stock por sede, recibe alertas de mínimos y mueve mercancía entre bodegas.', frame: 'contex360.co/inventario' },
  reports:   { title: 'Estados financieros en segundos', text: 'Balance, P&G y flujo de caja generados automáticamente desde cada movimiento.', frame: 'contex360.co/reportes' },
  clients:   { title: 'Directorio unificado de terceros', text: 'Clientes, proveedores y cartera en un solo lugar, con estado de cuenta al instante.', frame: 'contex360.co/clientes' },
}
</script>

<template>
  <section
    id="producto-vivo"
    class="py-16 lg:py-24 bg-white border-b border-[#F4F4F5]"
    aria-labelledby="showcase-heading"
    style="scroll-margin-top: 80px;"
  >
    <div class="max-w-6xl mx-auto px-5 lg:px-8">
      <div class="text-center mb-9 lg:mb-12">
        <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-3">
          El producto en acción
        </h2>
        <h3
          class="text-[30px] lg:text-[40px] leading-[1.06] tracking-[-0.03em] font-serif font-bold text-[#18181B]"
          style="text-wrap: balance;"
        >
          No te lo contamos. Te lo mostramos.
        </h3>
      </div>

      <!-- Tabs -->
      <div
        class="showcase-tabs"
        role="tablist"
        aria-label="Vistas del producto"
      >
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          role="tab"
          :aria-selected="active === t.id"
          class="showcase-tab"
          :class="{ 'showcase-tab--active': active === t.id }"
          @click="active = t.id"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Panel -->
      <div class="grid lg:grid-cols-[0.85fr_1fr] gap-8 lg:gap-12 items-center mt-9">
        <div class="order-2 lg:order-1">
          <h4 class="text-[22px] lg:text-[26px] font-bold tracking-[-0.02em] text-[#18181B] mb-3 leading-[1.15]">
            {{ copy[active].title }}
          </h4>
          <p class="text-[14.5px] leading-[1.6] text-[#555555]">
            {{ copy[active].text }}
          </p>
        </div>
        <div class="order-1 lg:order-2">
          <ProductFrame :label="copy[active].frame">
            <MockInvoiceDIAN v-if="active === 'dian'" />
            <MockInventory v-else-if="active === 'inventory'" />
            <MockReports v-else-if="active === 'reports'" />
            <MockClients v-else />
          </ProductFrame>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.showcase-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 2px;
  justify-content: flex-start;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.showcase-tabs::-webkit-scrollbar { display: none; }
@media (min-width: 768px) { .showcase-tabs { justify-content: center; flex-wrap: wrap; overflow: visible; } }
.showcase-tab {
  flex-shrink: 0;
  padding: 0.6rem 1.1rem;
  font-size: 13px;
  font-weight: 600;
  color: #555555;
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 9999px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
}
.showcase-tab:hover { background: #F4F4F5; color: #18181B; }
.showcase-tab--active { background: #18181B; color: #fff; border-color: #18181B; }
</style>
