<template>
  <div class="product-frame"><slot /></div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' }
})
</script>