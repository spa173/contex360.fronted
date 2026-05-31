<script setup lang="ts">
/**
 * BentoGrid — replaces the generic 3 icon+text feature cards (P1 point 4) with
 * an asymmetric bento layout that shows real product UI. The large hero cell
 * leads with DIAN ("show, don't tell"); the smaller cells carry the supporting
 * differentiators with varied size for visual rhythm (Stripe/Linear style).
 */
import BentoCell from './BentoCell.vue'
import ProductFrame from './ProductFrame.vue'
import MockInvoiceDIAN from './MockInvoiceDIAN.vue'
import MockInventory from './MockInventory.vue'
</script>

<template>
  <section
    id="producto"
    class="py-16 lg:py-24 bg-[#FAFAFA] border-b border-[#F4F4F5] cv-below-fold"
    style="scroll-margin-top: 80px;"
    aria-labelledby="bento-heading"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <div class="max-w-2xl mb-10 lg:mb-14">
        <h2 class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
          Infraestructura central
        </h2>
        <h3
          id="bento-heading"
          class="text-[32px] lg:text-[42px] leading-[1.05] tracking-[-0.03em] font-serif font-bold text-[#18181B]"
          style="text-wrap: balance;"
        >
          Todo tu back-office, estructurado para escala.
        </h3>
      </div>

      <div class="bento-grid">
        <BentoCell
          span="lg"
          title="Facturación electrónica DIAN, nativa"
          text="Generación de CUFE válido y reglamentario, firmado con tu certificado digital. Emisión directa habilitada para la DIAN."
        >
          <template #visual>
            <ProductFrame label="contex360.co/facturacion">
              <MockInvoiceDIAN />
            </ProductFrame>
          </template>
        </BentoCell>

        <BentoCell
          span="md"
          title="Inventario multi-bodega"
          text="Stock por sede en tiempo real con alertas de mínimos."
        >
          <template #visual>
            <ProductFrame label="inventario">
              <MockInventory />
            </ProductFrame>
          </template>
        </BentoCell>

        <BentoCell
          span="sm"
          tone="dark"
          title="Motor de alta velocidad"
          text="Informes contables complejos en segundos, no horas."
        />

        <BentoCell
          span="sm"
          title="Seguridad de tus datos"
          text="Cifrado AES-256 y copias de seguridad automáticas diarias."
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}
@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(0, auto);
  }
}
.cv-below-fold {
  content-visibility: auto;
  contain-intrinsic-size: auto 900px;
}
</style>
