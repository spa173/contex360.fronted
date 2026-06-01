<script setup lang="ts">
defineProps<{
  /** 'chip' renders the rounded pill used above the hero headline. */
  variant?: 'chip'
}>()
</script>

<template>
  <span
    class="dian-badge inline-flex items-center gap-2 rounded-full bg-[#F0F5FF] border border-[#DBE7FF] pl-2 pr-3.5 py-1.5"
    :data-variant="variant ?? 'chip'"
  >
    <span
      class="dian-badge__dot"
      aria-hidden="true"
    />
    <span class="text-[12px] font-semibold tracking-tight text-[#1D4ED8]">
      Habilitado por la DIAN · Facturación electrónica
    </span>
  </span>
</template>

<style scoped>
.dian-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #2563eb;
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
  animation: dian-pulse 2.4s ease-out infinite;
}
@keyframes dian-pulse {
  0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .dian-badge__dot { animation: none; }
}
</style>
