<template>
  <div class="bg-[#131926] border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {{ title }}
        </p>
        <p class="text-3xl font-bold text-slate-50 tracking-tight">
          {{ value }}
        </p>
        <p
          v-if="trend"
          class="text-xs font-medium mt-2 text-emerald-400 flex items-center gap-1"
        >
          <TrendingUp class="w-3 h-3" />
          {{ trend }}
        </p>
      </div>
      <div :class="['w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg', iconBg]">
        <component
          :is="icon"
          :class="['w-7 h-7 stroke-[1.5]', iconColor]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { TrendingUp } from 'lucide-vue-next'

defineProps({
  title: String,
  value: [String, Number],
  icon: [Object, Function],
  iconColor: String,
  iconBg: String,
  trend: String
})
</script>
