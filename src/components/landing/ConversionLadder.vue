<script setup lang="ts">
defineProps<{
  /** Visual tone: 'light' over white backgrounds, 'dark' over the dark CTA strip. */
  tone?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'view-demo'): void
  (e: 'start-trial'): void
  (e: 'contact-sales'): void
}>()
</script>

<template>
  <div
    class="conversion-ladder flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap"
    :class="tone === 'dark' ? 'cl-dark' : 'cl-light'"
  >
    <!-- Primary: highest-intent action -->
    <button
      type="button"
      class="cl-primary inline-flex items-center justify-center gap-2 text-[14px] font-semibold px-6 py-3 rounded-lg btn-transition shadow-sm active:scale-[0.97] min-h-[48px]"
      @click="emit('start-trial')"
    >
      Solicitar Demo
      <span
        class="material-symbols-outlined text-[18px]"
        aria-hidden="true"
      >arrow_forward</span>
    </button>

    <!-- Secondary: lower-commitment, see the product live -->
    <button
      type="button"
      class="cl-secondary inline-flex items-center justify-center gap-2 text-[14px] font-semibold px-6 py-3 rounded-lg btn-transition active:scale-[0.97] min-h-[48px]"
      @click="emit('view-demo')"
    >
      <span
        class="material-symbols-outlined text-[18px]"
        aria-hidden="true"
      >play_circle</span>
      Ver la plataforma
    </button>

    <!-- Tertiary: subtle text link for enterprise / sales -->
    <button
      type="button"
      class="cl-tertiary inline-flex items-center gap-1 text-[13.5px] font-semibold btn-transition sm:ml-1"
      @click="emit('contact-sales')"
    >
      Hablar con ventas
      <span
        class="material-symbols-outlined text-[16px]"
        aria-hidden="true"
      >chevron_right</span>
    </button>
  </div>
</template>

<style scoped>
/* Light tone — over white / neutral backgrounds */
.cl-light .cl-primary {
  background-color: #18181b;
  color: #fff;
}
.cl-light .cl-primary:hover {
  background-color: #27272a;
}
.cl-light .cl-secondary {
  background-color: #fff;
  color: #18181b;
  border: 1px solid #e4e4e7;
}
.cl-light .cl-secondary:hover {
  background-color: #f4f4f5;
}
.cl-light .cl-tertiary {
  color: #2563eb;
}
.cl-light .cl-tertiary:hover {
  color: #1d4ed8;
}

/* Dark tone — over the dark CTA strip */
.cl-dark .cl-primary {
  background-color: #fff;
  color: #18181b;
}
.cl-dark .cl-primary:hover {
  background-color: #f4f4f5;
}
.cl-dark .cl-secondary {
  background-color: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.cl-dark .cl-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.cl-dark .cl-tertiary {
  color: #60a5fa;
}
.cl-dark .cl-tertiary:hover {
  color: #93c5fd;
}
</style>
