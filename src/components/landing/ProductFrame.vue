<script setup lang="ts">
/**
 * ProductFrame — a realistic app-window chrome (title bar + dots + optional
 * URL/label) that wraps the coded product UI mockups. Reused by the hero,
 * ProductShowcase and BentoGrid so every product surface looks consistent.
 */
withDefaults(defineProps<{ label?: string }>(), { label: '' })
</script>

<template>
  <div class="product-frame">
    <div class="product-frame__bar">
      <span
        class="product-frame__dots"
        aria-hidden="true"
      >
        <i /><i /><i />
      </span>
      <span
        v-if="label"
        class="product-frame__label"
      >{{ label }}</span>
    </div>
    <div class="product-frame__body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.product-frame {
  background: #fff;
  border: 1px solid #E4E4E7;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02), 0 24px 60px -24px rgba(10, 10, 10, 0.16);
}
.product-frame__bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 38px;
  padding: 0 0.9rem;
  background: #FAFAFA;
  border-bottom: 1px solid #F0F0F1;
}
.product-frame__dots {
  display: inline-flex;
  gap: 6px;
}
.product-frame__dots i {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #E4E4E7;
}
.product-frame__label {
  font-size: 11.5px;
  font-weight: 600;
  color: #A1A1AA;
  letter-spacing: -0.01em;
}
.product-frame__body {
  padding: 1rem;
}
</style>
