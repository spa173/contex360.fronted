<script setup>
import { computed, ref } from 'vue'
import { useStateStore } from '../../stores/stateStore'

const emit = defineEmits(['navigate'])
const store = useStateStore()
const isDismissed = ref(false)

const subscription = computed(() => store.subscription)

const isTrial = computed(() => {
  const sub = subscription.value
  return sub && sub.planType === 'trial' && sub.trialEndsAt
})

const trialDaysLeft = computed(() => {
  const sub = subscription.value
  if (!sub || !sub.trialEndsAt) return null
  const end = new Date(sub.trialEndsAt)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

const isExpired = computed(() => {
  return isTrial.value && trialDaysLeft.value !== null && trialDaysLeft.value <= 0
})

const isUrgent = computed(() => {
  return isTrial.value && trialDaysLeft.value !== null && trialDaysLeft.value > 0 && trialDaysLeft.value <= 3
})

const isWarning = computed(() => {
  return isTrial.value && trialDaysLeft.value !== null && trialDaysLeft.value > 3 && trialDaysLeft.value <= 7
})

const showBanner = computed(() => {
  if (isDismissed.value) return false
  if (!isTrial.value) return false
  return true
})

const bannerConfig = computed(() => {
  if (isExpired.value) {
    return {
      bg: 'bg-gradient-to-r from-rose-50 to-red-50',
      border: 'border-b border-rose-200',
      icon: 'block',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-800',
      subtextColor: 'text-rose-600',
      btnBg: 'bg-rose-600 hover:bg-rose-700',
      btnText: 'text-white',
    }
  }
  if (isUrgent.value) {
    return {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-b border-amber-200',
      icon: 'warning',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-800',
      subtextColor: 'text-amber-600',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
      btnText: 'text-white',
    }
  }
  if (isWarning.value) {
    return {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-b border-blue-200',
      icon: 'info',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-800',
      subtextColor: 'text-blue-600',
      btnBg: 'bg-blue-600 hover:bg-blue-700',
      btnText: 'text-white',
    }
  }
  return null
})

function handleUpgrade() {
  emit('navigate', 'plans')
}
</script>

<template>
  <div
    v-if="showBanner && bannerConfig"
    :class="[bannerConfig.bg, bannerConfig.border, 'text-[13px] font-medium py-2.5 px-4 flex items-center justify-center gap-2.5 transition-all duration-300']"
  >
    <span :class="['material-symbols-outlined text-[16px]', bannerConfig.iconColor]">
      {{ bannerConfig.icon }}
    </span>

    <span :class="bannerConfig.textColor">
      <template v-if="isExpired">
        Tu periodo de prueba ha expirado. Suscríbete para continuar usando Contex360.
      </template>
      <template v-else-if="isUrgent">
        <strong class="font-extrabold">¡{{ trialDaysLeft }} {{ trialDaysLeft === 1 ? 'día' : 'días' }} restantes!</strong>
        Tu trial está por vencer. Elige un plan para no perder acceso.
      </template>
      <template v-else-if="isWarning">
        Tu trial vence en <strong class="font-extrabold">{{ trialDaysLeft }} días</strong>.
        <span :class="bannerConfig.subtextColor">Aún tienes tiempo de explorar todas las funciones.</span>
      </template>
    </span>

    <button
      :class="[bannerConfig.btnBg, bannerConfig.btnText, 'ml-1 px-3 py-1 rounded-[8px] text-[11px] font-extrabold tracking-wide hover:shadow-md transition-all']"
      @click="handleUpgrade"
    >
      {{ isExpired ? 'Suscribirme ahora' : 'Ver planes' }}
    </button>

    <button
      v-if="!isExpired"
      class="ml-1 w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-[12px] font-bold opacity-50 hover:opacity-100 transition-opacity"
      :class="bannerConfig.textColor"
      @click="isDismissed = true"
    >
      ✕
    </button>
  </div>
</template>
