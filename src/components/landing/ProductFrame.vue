<script setup lang="ts">
defineProps<{
  /** Caption shown in the frame's top bar (URL/tab style). */
  label?: string
}>()
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
  border: 1px solid #e4e4e7;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02), 0 18px 40px -22px rgba(10, 10, 10, 0.16);
}
.product-frame__bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f1;
}
.product-frame__dots {
  display: inline-flex;
  gap: 5px;
  flex-shrink: 0;
}
.product-frame__dots i {
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  background: #e4e4e7;
}
.product-frame__dots i:nth-child(1) { background: #fca5a5; }
.product-frame__dots i:nth-child(2) { background: #fcd34d; }
.product-frame__dots i:nth-child(3) { background: #86efac; }
.product-frame__label {
  font-size: 11px;
  font-weight: 600;
  color: #a1a1aa;
  font-family: ui-monospace, "SF Mono", monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-frame__body {
  padding: 1rem 1.1rem;
}
</style>
