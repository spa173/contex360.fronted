<script setup lang="ts">
/**
 * TrustBar — replaces the fabricated client-logo squares (P0-2) with verifiable
 * trust indicators. Every item is a claim Contex360 can back up, not an
 * invented brand. Icons are inline SVG (no font dependency).
 */
import type { TrustItem } from './types'

const items: TrustItem[] = [
  {
    iconPath: 'M12 2l7 3v6c0 4.5-3 8.3-7 9.5C8 19.3 5 15.5 5 11V5l7-3z',
    value: 'Facturación DIAN',
    label: 'Emisión habilitada',
  },
  {
    iconPath: 'M13 2L4 13h6l-1 9 9-11h-6l1-9z',
    value: 'CUFE válido',
    label: 'Por documento emitido',
  },
  {
    iconPath: 'M12 2l8 4v5c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V6l8-4zm0 6a2.5 2.5 0 00-1 4.8V15h2v-2.2A2.5 2.5 0 0012 8z',
    value: 'Cifrado AES-256 · TLS 1.3',
    label: 'Datos en reposo y tránsito',
  },
  {
    iconPath: 'M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm2 5h10V7H7v2zm0 4h10v-2H7v2zm0 4h6v-2H7v2z',
    value: 'Ley 1581 · Habeas Data',
    label: 'Cumplimiento de datos',
  },
]
</script>

<template>
  <div
    class="flex flex-wrap items-stretch justify-center gap-x-3 gap-y-4 sm:gap-x-6 lg:gap-x-10"
    aria-label="Indicadores de confianza de Contex360"
  >
    <div
      v-for="item in items"
      :key="item.value"
      class="flex items-center gap-2.5 text-left"
    >
      <span
        class="trust-icon"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path :d="item.iconPath" />
        </svg>
      </span>
      <span class="leading-tight">
        <span class="block text-[12.5px] font-bold text-[#18181B] tracking-[-0.01em]">{{ item.value }}</span>
        <span class="block text-[11px] text-[#888888] mt-0.5">{{ item.label }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.trust-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #F4F4F5;
  color: #2563EB;
  flex-shrink: 0;
}
</style>
