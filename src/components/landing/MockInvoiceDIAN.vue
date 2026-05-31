<script setup lang="ts">
/**
 * MockInvoiceDIAN — coded recreation of a Contex360 electronic invoice
 * accepted by the DIAN. This is the hero's primary visual: it shows the core
 * differentiator (CUFE + "Aceptada por la DIAN") as something the visitor can
 * actually see, instead of a static screenshot. Mirrors the real BillingView.
 */
const lines = [
  { desc: 'Servicio de consultoría', qty: 1, total: '$1.000.000' },
  { desc: 'Soporte mensual ERP', qty: 1, total: '$  450.000' },
]
</script>

<template>
  <div class="inv">
    <div class="inv__head">
      <div>
        <p class="inv__num">
          Factura FE-1042
        </p>
        <p class="inv__client">
          Inversiones Caldas SAS · NIT 900.123.456-7
        </p>
      </div>
      <span class="inv__status">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="#16a34a"
          />
          <path
            d="M8 12.5l2.5 2.5L16 9"
            stroke="#fff"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Aceptada por la DIAN
      </span>
    </div>

    <div class="inv__cufe">
      <span class="inv__cufe-label">CUFE</span>
      <span class="inv__cufe-val">a1f4c9e2b7d6…8e3f0c2a</span>
    </div>

    <div class="inv__lines">
      <div
        v-for="l in lines"
        :key="l.desc"
        class="inv__line"
      >
        <span class="inv__line-desc">{{ l.desc }}</span>
        <span class="inv__line-qty">x{{ l.qty }}</span>
        <span class="inv__line-total">{{ l.total }}</span>
      </div>
    </div>

    <div class="inv__foot">
      <div class="inv__totrow">
        <span>Subtotal</span><span>$1.450.000</span>
      </div>
      <div class="inv__totrow">
        <span>IVA 19%</span><span>$  275.500</span>
      </div>
      <div class="inv__totrow inv__totrow--grand">
        <span>Total</span><span>$1.725.500 COP</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inv { font-size: 12px; color: #18181B; }
.inv__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.85rem; }
.inv__num { font-size: 14px; font-weight: 800; letter-spacing: -0.02em; }
.inv__client { font-size: 11px; color: #71717A; margin-top: 2px; }
.inv__status {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 10.5px; font-weight: 700; color: #15803d;
  background: rgba(22,163,74,0.09); border: 1px solid rgba(22,163,74,0.2);
  padding: 0.3rem 0.55rem; border-radius: 9999px; white-space: nowrap; flex-shrink: 0;
}
.inv__cufe {
  display: flex; align-items: center; gap: 0.5rem;
  background: #FAFAFA; border: 1px solid #F0F0F1; border-radius: 8px;
  padding: 0.5rem 0.7rem; margin-bottom: 0.85rem;
}
.inv__cufe-label { font-size: 9.5px; font-weight: 800; letter-spacing: 0.08em; color: #A1A1AA; }
.inv__cufe-val { font-family: ui-monospace, monospace; font-size: 11px; color: #2563EB; font-weight: 600; }
.inv__lines { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.85rem; }
.inv__line { display: grid; grid-template-columns: 1fr auto auto; gap: 0.75rem; align-items: center; }
.inv__line-desc { color: #444; }
.inv__line-qty { color: #A1A1AA; font-size: 11px; }
.inv__line-total { font-variant-numeric: tabular-nums; font-weight: 600; }
.inv__foot { border-top: 1px solid #F0F0F1; padding-top: 0.7rem; display: flex; flex-direction: column; gap: 0.35rem; }
.inv__totrow { display: flex; justify-content: space-between; font-size: 11.5px; color: #71717A; font-variant-numeric: tabular-nums; }
.inv__totrow--grand { font-size: 13px; font-weight: 800; color: #18181B; padding-top: 0.35rem; }
</style>
