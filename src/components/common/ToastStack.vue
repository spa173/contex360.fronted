<script setup>
defineProps({
  toasts: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div
    class="toast-stack"
    aria-atomic="true"
    aria-live="polite"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
    >
      <p>{{ toast.message }}</p>
      <small v-if="toast.detail">{{ toast.detail }}</small>
    </div>
  </div>
</template>
