<script setup lang="ts">
/**
 * DianBadge — trust pill highlighting the DIAN certification, the core
 * differentiator of Contex360. Uses inline SVG (no icon-font dependency) so
 * it renders instantly above the fold. Green validation accent (#16a34a)
 * already present in the project palette.
 */
withDefaults(defineProps<{ variant?: 'chip' | 'inline' }>(), {
  variant: 'chip',
})
</script>

<template>
  <span
    class="dian-badge"
    :class="variant === 'chip' ? 'dian-badge--chip' : 'dian-badge--inline'"
  >
    <svg
      class="dian-badge__icon"
      width="14"
      height="14"
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
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <slot>Habilitado para facturación electrónica DIAN</slot>
  </span>
</template>

<style scoped>
.dian-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.dian-badge__icon { flex-shrink: 0; }
.dian-badge--chip {
  padding: 0.45rem 0.85rem;
  font-size: 11.5px;
  color: #15803d;
  background: rgba(22, 163, 74, 0.08);
  border: 1px solid rgba(22, 163, 74, 0.22);
  border-radius: 9999px;
}
.dian-badge--inline {
  font-size: 12px;
  color: #15803d;
}
</style>
