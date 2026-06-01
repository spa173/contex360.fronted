<script setup lang="ts">
/**
 * TrustBar — verifiable trust indicators only (no fabricated metrics).
 * Each item states a factual capability of the platform.
 */
const items = [
  { icon: 'verified', title: 'Habilitado DIAN', sub: 'Facturación electrónica con CUFE válido' },
  { icon: 'lock', title: 'Cifrado AES-256', sub: 'Datos protegidos en tránsito y en reposo' },
  { icon: 'cloud_done', title: 'Infraestructura en la nube', sub: 'Respaldos automáticos y alta disponibilidad' },
  { icon: 'flag', title: 'Hecho para Colombia', sub: 'Normativa local y peso colombiano' },
]
</script>

<template>
  <ul class="trust-bar grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
    <li
      v-for="item in items"
      :key="item.title"
      class="flex items-start gap-3"
    >
      <span
        class="trust-bar__icon"
        aria-hidden="true"
      >
        <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
      </span>
      <span class="flex flex-col">
        <span class="text-[13.5px] font-bold tracking-tight text-[#18181B] leading-tight">{{ item.title }}</span>
        <span class="text-[11.5px] text-[#71717A] leading-snug mt-0.5">{{ item.sub }}</span>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.trust-bar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f0f5ff;
  border: 1px solid #dbe7ff;
  color: #2563eb;
}
</style>
