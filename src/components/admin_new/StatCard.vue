<template>
  <div class="bg-[#14141b] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all group">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{{ title }}</p>
        <p class="text-3xl font-bold text-white tracking-tight">{{ value }}</p>
      </div>
      <div :class="['w-14 h-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg', iconBg]">
        <component :is="icon" :class="['w-7 h-7 stroke-[1.5]', iconColor]" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  icon: [Object, Function],
  iconColor: String,
  iconBg: String
})
</script>
