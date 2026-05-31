<script setup lang="ts">
/**
 * ConversionLadder — three escalating CTAs (P1 point 5):
 *   Ver Demo      → lowest friction, scrolls to the live product showcase
 *   Prueba Gratis → mid intent, starts the trial flow
 *   Hablar con Ventas → high intent / enterprise (reuses the demo-request flow
 *                       with source='sales', per the approved option a)
 *
 * Visual hierarchy is intentional: solid primary, bordered secondary, text
 * tertiary — so the three never compete for attention.
 */
withDefaults(defineProps<{ tone?: 'light' | 'dark' }>(), { tone: 'light' })

const emit = defineEmits<{
  (e: 'view-demo'): void
  (e: 'start-trial'): void
  (e: 'contact-sales'): void
}>()
</script>

<template>
  <div
    class="ladder"
    :class="tone === 'dark' ? 'ladder--dark' : 'ladder--light'"
  >
    <button
      type="button"
      class="ladder__primary"
      @click="emit('start-trial')"
    >
      Prueba Gratis
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button
      type="button"
      class="ladder__secondary"
      @click="emit('view-demo')"
    >
      Ver Demo
    </button>
    <button
      type="button"
      class="ladder__tertiary"
      @click="emit('contact-sales')"
    >
      Hablar con Ventas
    </button>
  </div>
</template>

<style scoped>
.ladder {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
}
.ladder__primary, .ladder__secondary, .ladder__tertiary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 14px;
  font-weight: 600;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease, transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ladder__primary {
  padding: 0.875rem 1.75rem;
  background: #18181B;
  color: #fff;
  border: 1px solid #18181B;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 4px 12px -2px rgba(0,0,0,0.12);
}
.ladder__primary:hover { background: #27272A; transform: translateY(-1px); }
.ladder__primary:active { transform: scale(0.98); }
.ladder__secondary {
  padding: 0.875rem 1.5rem;
  background: #fff;
  color: #18181B;
  border: 1px solid #E4E4E7;
}
.ladder__secondary:hover { background: #FAFAFA; border-color: #D4D4D8; transform: translateY(-1px); }
.ladder__tertiary {
  padding: 0.875rem 0.75rem;
  background: transparent;
  color: #555555;
  border: 1px solid transparent;
}
.ladder__tertiary:hover { color: #18181B; }

/* Dark surface variant (bottom CTA strip) */
.ladder--dark .ladder__primary { background: #fff; color: #18181B; border-color: #fff; }
.ladder--dark .ladder__primary:hover { background: #F4F4F5; }
.ladder--dark .ladder__secondary { background: transparent; color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.2); }
.ladder--dark .ladder__secondary:hover { background: rgba(255,255,255,0.08); color: #fff; }
.ladder--dark .ladder__tertiary { color: rgba(255,255,255,0.6); }
.ladder--dark .ladder__tertiary:hover { color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .ladder__primary, .ladder__secondary, .ladder__tertiary { transition: none; }
}
</style>
