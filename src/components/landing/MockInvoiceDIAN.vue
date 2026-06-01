<script setup lang="ts">
/**
 * MockInvoiceDIAN — coded recreation of an issued DIAN electronic invoice.
 * No fabricated metrics: mirrors the structure of a real factura electrónica
 * de venta (número, CUFE, cliente, total, estado de aceptación).
 */
</script>

<template>
  <div class="inv">
    <div class="inv__head">
      <div>
        <p class="inv__kind">
          Factura electrónica de venta
        </p>
        <p class="inv__num">
          FV-2026-0481
        </p>
      </div>
      <span class="inv__status">
        <span
          class="material-symbols-outlined inv__status-ico"
          aria-hidden="true"
        >check_circle</span>
        Aceptada DIAN
      </span>
    </div>

    <div class="inv__cufe">
      <span class="inv__cufe-label">CUFE</span>
      <span class="inv__cufe-val">b7a4f9c2e1d8…3f6a90c4</span>
    </div>

    <div class="inv__meta">
      <span>
        <i>Cliente</i>
        Comercializadora Andina S.A.S.
      </span>
      <span>
        <i>NIT</i>
        900.482.117-3
      </span>
    </div>

    <div class="inv__total">
      <div class="inv__row">
        <span>Subtotal</span>
        <span>$2.310.000</span>
      </div>
      <div class="inv__row">
        <span>IVA 19%</span>
        <span>$438.900</span>
      </div>
      <div class="inv__row inv__row--grand">
        <span>Total</span>
        <span>$2.748.900 <i>COP</i></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inv { font-size: 12px; }
.inv__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
.inv__kind { font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #a1a1aa; }
.inv__num { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: #18181b; margin-top: 1px; font-variant-numeric: tabular-nums; }
.inv__status { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; font-size: 10.5px; font-weight: 700; color: #15803d; background: rgba(22, 163, 74, 0.09); padding: 0.25rem 0.5rem; border-radius: 7px; white-space: nowrap; }
.inv__status-ico { font-size: 14px; }
.inv__cufe { display: flex; align-items: center; gap: 0.5rem; margin: 0.85rem 0; padding: 0.45rem 0.6rem; background: #f7f7f8; border-radius: 8px; }
.inv__cufe-label { font-size: 9px; font-weight: 800; letter-spacing: 0.08em; color: #a1a1aa; }
.inv__cufe-val { font-size: 10.5px; font-family: ui-monospace, "SF Mono", monospace; color: #52525b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.inv__meta { display: grid; grid-template-columns: 1fr auto; gap: 0.4rem 0.8rem; margin-bottom: 0.85rem; }
.inv__meta span { display: flex; flex-direction: column; font-weight: 600; color: #18181b; font-size: 11.5px; }
.inv__meta i { font-style: normal; font-size: 9.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #a1a1aa; margin-bottom: 1px; }
.inv__total { border-top: 1px solid #f0f0f1; padding-top: 0.6rem; }
.inv__row { display: flex; justify-content: space-between; font-size: 11.5px; color: #71717a; padding: 0.15rem 0; font-variant-numeric: tabular-nums; }
.inv__row--grand { margin-top: 0.2rem; padding-top: 0.4rem; border-top: 1px dashed #e4e4e7; font-size: 14px; font-weight: 800; color: #18181b; }
.inv__row--grand i { font-style: normal; font-size: 10px; font-weight: 600; color: #a1a1aa; }
</style>
