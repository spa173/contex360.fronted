<script setup>
import { computed } from 'vue'
import { useThirdPartiesStore } from '../../stores/thirdPartiesStore'
import { formatCurrency } from '../../utils/ui'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const store = useThirdPartiesStore()
const tenantThirdParties = computed(() => store.tenantThirdParties || [])

function initials(name) {
  if (!name) return '—'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function handleAction(tp) {
  emit('notify', { message: 'Solicitud enviada', detail: `Se solicitó actualización de RUT a ${tp.name}.` })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Gestión</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Terceros</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Terceros</h1>
        <p class="text-[14px] text-[#71717A]">Administración integral de clientes, proveedores y socios.</p>
      </div>
      <div class="flex gap-2">
        <button class="flex items-center gap-2 px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#18181B] hover:bg-[#FAFAFA] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">download</span>Exportar
        </button>
        <button class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">add</span>Nuevo tercero
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div>
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-4 mb-4 flex items-center gap-3 flex-wrap">
          <div class="relative flex-1 min-w-[240px]">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] text-[16px]">search</span>
            <input placeholder="Buscar por nombre, NIT o email..." class="w-full pl-8 pr-3 py-2 text-[13px] border border-[#E4E4E7] rounded-[8px] bg-[#FAFAFA] outline-none focus:bg-white focus:border-[#18181B]" />
          </div>
          <select class="border border-[#E4E4E7] rounded-[8px] py-2 px-3 text-[12px] font-semibold text-[#71717A] outline-none bg-white">
            <option>Todos los tipos</option><option>Cliente</option><option>Proveedor</option>
          </select>
        </div>

        <div class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]">
                  <th class="px-5 py-3">Entidad</th>
                  <th class="px-5 py-3">NIT</th>
                  <th class="px-5 py-3">Tipo</th>
                  <th class="px-5 py-3 text-right">Saldo</th>
                  <th class="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
                <tr v-for="tp in tenantThirdParties" :key="tp.id" class="hover:bg-[#FAFAFA] group">
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-md bg-[#18181B] text-white flex items-center justify-center font-semibold text-[10px]">{{ initials(tp.name) }}</div>
                      <span class="font-semibold text-[#18181B]">{{ tp.name }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3.5 font-mono text-[#A1A1AA] text-[12px]">{{ tp.idNumber }}</td>
                  <td class="px-5 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-[#F4F4F5] text-[#71717A] text-[11px] font-semibold uppercase">{{ tp.type }}</span></td>
                  <td class="px-5 py-3.5 text-right font-mono font-semibold">{{ formatCurrency(tp.balance || 0) }}</td>
                  <td class="px-5 py-3.5"><span class="inline-flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Activo</span></td>
                </tr>
                <tr v-if="tenantThirdParties.length === 0">
                  <td colspan="5" class="px-5 py-10 text-center text-[#A1A1AA] text-[13px]">No hay terceros registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-2 mb-1"><span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span><h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">Insights de IA</h3></div>
        <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-4">
          <div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-[16px] text-amber-600">gavel</span><p class="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">Validación legal</p></div>
          <p class="text-[12px] text-[#71717A] leading-[1.5] mb-3">Detectado RUT próximo a caducar en algunos terceros.</p>
          <button @click="handleAction({name:'TechCorp'})" class="w-full py-1.5 bg-[#2563EB] text-white rounded-[8px] text-[11px] font-semibold">Revisar</button>
        </div>
        <div class="bg-[#18181B] rounded-[14px] p-4 text-white">
          <p class="text-[10px] font-semibold text-white/60 uppercase tracking-wider mb-2">Riesgo de cartera</p>
          <div class="flex items-baseline gap-2"><span class="text-[28px] font-bold tracking-[-0.02em]">12%</span><span class="text-[11px] font-semibold text-emerald-400">↓ 2.4%</span></div>
          <p class="text-[11px] text-white/60 mt-1">Bajo riesgo</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
