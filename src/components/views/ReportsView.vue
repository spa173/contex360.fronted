<script setup>
defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

function handleExport() {
  emit('notify', { message: 'Exportación iniciada', detail: 'Generando PDF del reporte consolidado…' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Analítica</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Reportes</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Reportes y Analítica</h1>
        <p class="text-[14px] text-[#71717A]">Inteligencia de negocios y proyecciones financieras.</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar PDF
        </button>
        <button class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">schedule_send</span>Programar
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Ingresos proyectados</p>
        <div class="flex items-baseline gap-2"><p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em] font-mono">$ 4.2M</p><span class="text-[11px] font-semibold text-emerald-700">↑ 12%</span></div>
        <p class="text-[11px] text-[#71717A] mt-1">Confianza alta · ±5%</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">EBITDA estimado</p>
        <div class="flex items-baseline gap-2"><p class="text-[22px] font-bold text-[#18181B] tracking-[-0.02em]">22%</p><span class="text-[11px] font-semibold text-emerald-700">↑ 2.5%</span></div>
        <p class="text-[11px] text-[#71717A] mt-1">vs mes anterior</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Punto de equilibrio</p>
        <p class="text-[22px] font-bold text-emerald-700 tracking-[-0.02em]">Alcanzado</p>
        <p class="text-[11px] text-[#71717A] mt-1">Estimado: 15 jun</p>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <p class="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">Riesgo de liquidez</p>
        <p class="text-[22px] font-bold text-emerald-700 tracking-[-0.02em]">Bajo</p>
        <p class="text-[11px] text-[#2563EB] font-semibold mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">auto_awesome</span>Análisis IA</p>
      </div>
    </div>

    <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
      <div class="px-5 py-4 border-b border-[#F4F4F5]"><h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Reportes generados</h3></div>
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
            <th class="px-5 py-3">Nombre</th>
            <th class="px-5 py-3">Fecha</th>
            <th class="px-5 py-3">Propietario</th>
            <th class="px-5 py-3">Estado</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
          <tr class="hover:bg-[#FAFAFA]">
            <td class="px-5 py-3.5 font-semibold text-[#18181B]">Cierre mensual</td>
            <td class="px-5 py-3.5 font-mono text-[12px] text-[#71717A]">01 may 2026</td>
            <td class="px-5 py-3.5 text-[#71717A]">Ana C.</td>
            <td class="px-5 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Listo</span></td>
            <td class="px-5 py-3.5 text-right"><button class="text-[#A1A1AA] hover:text-[#18181B]"><span class="material-symbols-outlined text-[18px]">download</span></button></td>
          </tr>
          <tr class="hover:bg-[#FAFAFA]">
            <td class="px-5 py-3.5 font-semibold text-[#18181B]">Proyección fiscal Q2</td>
            <td class="px-5 py-3.5 font-mono text-[12px] text-[#71717A]">05 may 2026</td>
            <td class="px-5 py-3.5 text-[#71717A]">Sistema</td>
            <td class="px-5 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold">Procesando</span></td>
            <td class="px-5 py-3.5 text-right"><button class="text-[#A1A1AA] hover:text-[#18181B]"><span class="material-symbols-outlined text-[18px]">more_horiz</span></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
