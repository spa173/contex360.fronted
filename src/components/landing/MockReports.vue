<script setup lang="ts">
/**
 * MockReports — coded recreation of the financial reports view: a KPI plus a
 * lightweight bar chart (pure CSS/SVG, no chart library) mirroring ReportsView.
 */
const bars = [40, 62, 48, 78, 70, 95]
const months = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
</script>

<template>
  <div class="rep">
    <div class="rep__kpi">
      <div>
        <p class="rep__label">
          Ingresos · último semestre
        </p>
        <p class="rep__val">
          $84.250.000 <span>COP</span>
        </p>
      </div>
      <span class="rep__delta">▲ 18,4%</span>
    </div>

    <div
      class="rep__chart"
      role="img"
      aria-label="Gráfico interactivo de tendencia de ingresos en aumento, detallando el crecimiento progresivo de la facturación mes a mes"
    >
      <div
        v-for="(h, i) in bars"
        :key="i"
        class="rep__col"
      >
        <span
          class="rep__bar"
          :style="{ height: h + '%' }"
        />
        <span class="rep__month">{{ months[i] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rep { font-size: 12px; }
.rep__kpi { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.9rem; }
.rep__label { font-size: 10.5px; color: #A1A1AA; font-weight: 600; }
.rep__val { font-size: 19px; font-weight: 800; letter-spacing: -0.02em; color: #18181B; margin-top: 2px; font-variant-numeric: tabular-nums; }
.rep__val span { font-size: 11px; font-weight: 600; color: #A1A1AA; }
.rep__delta { font-size: 11px; font-weight: 700; color: #15803d; background: rgba(22,163,74,0.09); padding: 0.25rem 0.5rem; border-radius: 7px; }
.rep__chart { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.5rem; align-items: end; height: 110px; }
.rep__col { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; height: 100%; justify-content: flex-end; }
.rep__bar { width: 100%; max-width: 26px; border-radius: 6px 6px 0 0; background: linear-gradient(180deg, #2563EB, #60A5FA); }
.rep__col:last-child .rep__bar { background: linear-gradient(180deg, #18181B, #3f3f46); }
.rep__month { font-size: 9.5px; color: #A1A1AA; font-weight: 600; }
</style>
