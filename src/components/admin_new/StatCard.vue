
<template>
  <div class="bg-[#14141b] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-slate-400 mb-2">{{ title }}</p>
        <p class="text-3xl font-bold text-white">{{ value }}</p>
      </div>
      <div :class="['w-12 h-12 rounded-full flex items-center justify-center', iconBg]">
        <component :is="icon" :class="['w-6 h-6 stroke-[1.5]', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: Object,
  iconColor: String,
  iconBg: String
})
</script>
