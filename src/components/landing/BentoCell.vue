<script setup lang="ts">
/**
 * BentoCell — a single asymmetric cell of the BentoGrid. `span` controls the
 * column footprint (lg = wide hero cell, md/sm = compact). `tone` switches
 * between the light surface and the dark feature surface for visual rhythm.
 */
import type { BentoSpan } from './types'

withDefaults(defineProps<{
  span?: BentoSpan
  tone?: 'light' | 'dark'
  title: string
  text?: string
}>(), {
  span: 'sm',
  tone: 'light',
  text: '',
})

const spanClass: Record<BentoSpan, string> = {
  lg: 'bento-cell--lg',
  md: 'bento-cell--md',
  sm: 'bento-cell--sm',
}
</script>

<template>
  <div
    class="bento-cell"
    :class="[spanClass[span], tone === 'dark' ? 'bento-cell--dark' : 'bento-cell--light']"
  >
    <div
      v-if="$slots.visual"
      class="bento-cell__visual"
    >
      <slot name="visual" />
    </div>
    <div class="bento-cell__copy">
      <h4 class="bento-cell__title">
        {{ title }}
      </h4>
      <p
        v-if="text"
        class="bento-cell__text"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.bento-cell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 18px;
  padding: 1.5rem;
  border: 1px solid #E4E4E7;
  transition: box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), border-color 200ms ease;
}
.bento-cell:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.02), 0 16px 48px -12px rgba(10,10,10,0.1);
  border-color: #D4D4D8;
  transform: translateY(-2px);
}
.bento-cell--light { background: #fff; }
.bento-cell--dark { background: #18181B; border-color: #27272A; }
.bento-cell--dark .bento-cell__title { color: #fff; }
.bento-cell--dark .bento-cell__text { color: rgba(255,255,255,0.6); }
.bento-cell__visual { flex: 1; min-height: 0; }
.bento-cell__copy { display: flex; flex-direction: column; gap: 0.4rem; }
.bento-cell__title { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; color: #18181B; }
.bento-cell__text { font-size: 13px; line-height: 1.55; color: #666666; }

/* Column footprint — desktop only; single column on mobile */
@media (min-width: 768px) {
  .bento-cell--lg { grid-column: span 2; grid-row: span 2; }
  .bento-cell--md { grid-column: span 1; grid-row: span 2; }
  .bento-cell--sm { grid-column: span 1; grid-row: span 1; }
}
</style>
