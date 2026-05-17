<script setup>
import { ref } from 'vue'

defineProps({ isActive: { type: Boolean, required: true } })
const emit = defineEmits(['notify'])

const activeTab = ref('empresa')
const tabs = [
  { id: 'empresa', label: 'Empresa' },
  { id: 'general', label: 'General' },
  { id: 'impuestos', label: 'Impuestos' },
  { id: 'integraciones', label: 'Integraciones' },
  { id: 'logs', label: 'Logs' },
]

function handleSave() {
  emit('notify', { message: 'Configuración guardada', detail: 'Los parámetros del sistema han sido actualizados.' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
          <span>Sistema</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Consola Admin</span>
        </div>
        <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Consola de Administración</h1>
        <p class="text-[14px] text-[#71717A]">Configuración global del sistema.</p>
      </div>
      <div class="flex gap-2">
        <button class="px-3.5 py-2.5 border border-[#E4E4E7] rounded-[10px] bg-white text-[#71717A] hover:bg-[#FAFAFA] text-[13px] font-semibold">Descartar</button>
        <button @click="handleSave" class="flex items-center gap-2 px-3.5 py-2.5 bg-[#18181B] text-white rounded-[10px] hover:bg-[#27272A] text-[13px] font-semibold">
          <span class="material-symbols-outlined text-[18px]">save</span>Guardar
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-[#E4E4E7] mb-6">
      <div class="flex gap-1 -mb-px overflow-x-auto">
        <button
          v-for="t in tabs" :key="t.id"
          @click="activeTab = t.id"
          :class="[
            'px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors whitespace-nowrap',
            activeTab === t.id ? 'text-[#18181B] border-[#18181B]' : 'text-[#71717A] hover:text-[#18181B] border-transparent'
          ]"
        >{{ t.label }}</button>
      </div>
    </div>

    <!-- Empresa -->
    <div v-if="activeTab === 'empresa'" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 space-y-4">
        <section class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
          <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
            <span class="material-symbols-outlined text-[20px] text-[#18181B]">domain</span>
            <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Identidad Corporativa</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-5">
            <div><label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Razón Social</label><input value="Andina Cargo SAS" class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] font-semibold outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]" /></div>
            <div><label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">NIT</label><input value="900.123.456-7" class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] font-mono outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04]" /></div>
          </div>
        </section>
      </div>
      <div class="space-y-4">
        <section class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
          <div class="flex items-center gap-2 mb-5">
            <span class="material-symbols-outlined text-[18px] text-[#2563EB]">auto_awesome</span>
            <h3 class="text-[14px] font-bold tracking-tight text-[#18181B]">ContexAI Global</h3>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between"><div><p class="text-[12px] font-semibold text-[#18181B]">OCR Automático</p><p class="text-[11px] text-[#71717A]">Procesar facturas con IA</p></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]"></div></label></div>
          </div>
        </section>
      </div>
    </div>

    <!-- General -->
    <div v-if="activeTab === 'general'" class="bg-white border border-[#E4E4E7] rounded-[14px] p-6 max-w-3xl">
      <div class="flex items-center gap-2 mb-5 pb-3 border-b border-[#F4F4F5]">
        <span class="material-symbols-outlined text-[20px] text-[#18181B]">tune</span>
        <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Preferencias regionales</h3>
      </div>
      <div class="grid md:grid-cols-2 gap-5">
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Idioma</label>
          <select class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none">
            <option>Español (Colombia)</option><option>English (US)</option><option>Português (Brasil)</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Zona horaria</label>
          <select class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none">
            <option>(UTC-05) Bogotá</option><option>(UTC-03) Buenos Aires</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Moneda</label>
          <select class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none">
            <option>COP · Peso colombiano</option><option>USD · Dólar</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1.5 block">Formato de fecha</label>
          <select class="w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2.5 text-[13px] text-[#18181B] outline-none">
            <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Impuestos -->
    <div v-if="activeTab === 'impuestos'" class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
      <div class="px-6 py-4 border-b border-[#F4F4F5] flex items-center justify-between">
        <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[20px] text-[#18181B]">percent</span><h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Impuestos configurados</h3></div>
        <button class="flex items-center gap-2 px-3 py-1.5 bg-[#18181B] text-white rounded-[8px] text-[12px] font-semibold"><span class="material-symbols-outlined text-[16px]">add</span>Nuevo impuesto</button>
      </div>
      <table class="w-full text-left">
        <thead><tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]"><th class="px-6 py-3">Nombre</th><th class="px-6 py-3">Código DIAN</th><th class="px-6 py-3">Tipo</th><th class="px-6 py-3 text-right">Tasa</th><th class="px-6 py-3">Activo</th></tr></thead>
        <tbody class="text-[13px] divide-y divide-[#F4F4F5]">
          <tr class="hover:bg-[#FAFAFA]"><td class="px-6 py-3.5 font-semibold text-[#18181B]">IVA</td><td class="px-6 py-3.5 font-mono text-[#A1A1AA] text-[12px]">01</td><td class="px-6 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Suma</span></td><td class="px-6 py-3.5 text-right font-mono font-semibold">19.00%</td><td class="px-6 py-3.5"><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]"></div></label></td></tr>
          <tr class="hover:bg-[#FAFAFA]"><td class="px-6 py-3.5 font-semibold text-[#18181B]">Retefuente</td><td class="px-6 py-3.5 font-mono text-[#A1A1AA] text-[12px]">06</td><td class="px-6 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold">Resta</span></td><td class="px-6 py-3.5 text-right font-mono font-semibold">2.50%</td><td class="px-6 py-3.5"><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]"></div></label></td></tr>
          <tr class="hover:bg-[#FAFAFA]"><td class="px-6 py-3.5 font-semibold text-[#18181B]">ReteICA</td><td class="px-6 py-3.5 font-mono text-[#A1A1AA] text-[12px]">07</td><td class="px-6 py-3.5"><span class="inline-flex px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold">Resta</span></td><td class="px-6 py-3.5 text-right font-mono font-semibold">9.66‰</td><td class="px-6 py-3.5"><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked class="sr-only peer"><div class="w-9 h-5 bg-[#E4E4E7] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18181B]"></div></label></td></tr>
        </tbody>
      </table>
    </div>

    <!-- Integraciones -->
    <div v-if="activeTab === 'integraciones'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-700"><span class="material-symbols-outlined text-[22px]">verified_user</span></div>
            <div><p class="text-[14px] font-bold tracking-tight text-[#18181B]">DIAN</p><p class="text-[11px] text-[#A1A1AA]">Facturación electrónica</p></div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Conectado</span>
        </div>
        <button class="w-full py-2 border border-[#E4E4E7] rounded-[8px] text-[12px] font-semibold text-[#18181B] hover:bg-[#FAFAFA]">Configurar</button>
      </div>
      <div class="bg-white border border-[#E4E4E7] rounded-[14px] p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-[10px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold">B</div>
            <div><p class="text-[14px] font-bold tracking-tight text-[#18181B]">Bancolombia</p><p class="text-[11px] text-[#A1A1AA]">Conciliación bancaria</p></div>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Conectado</span>
        </div>
        <button class="w-full py-2 border border-[#E4E4E7] rounded-[8px] text-[12px] font-semibold text-[#18181B] hover:bg-[#FAFAFA]">Configurar</button>
      </div>
      <div class="bg-white border border-dashed border-[#E4E4E7] rounded-[14px] p-5 flex flex-col items-center justify-center text-center min-h-[180px] hover:border-[#2563EB] hover:bg-[#FAFAFA] cursor-pointer transition-all">
        <div class="w-11 h-11 rounded-[10px] bg-[#FAFAFA] flex items-center justify-center text-[#A1A1AA] mb-3"><span class="material-symbols-outlined text-[22px]">add</span></div>
        <p class="text-[13px] font-semibold text-[#18181B]">Explorar integraciones</p>
        <p class="text-[11px] text-[#71717A] mt-1">+24 conectores disponibles</p>
      </div>
    </div>

    <!-- Logs -->
    <div v-if="activeTab === 'logs'" class="bg-white border border-[#E4E4E7] rounded-[14px] overflow-hidden">
      <div class="px-5 py-4 border-b border-[#F4F4F5]">
        <h3 class="text-[15px] font-bold tracking-tight text-[#18181B]">Auditoría del sistema</h3>
      </div>
      <table class="w-full text-left">
        <thead><tr class="bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-[#71717A] border-b border-[#F4F4F5]"><th class="px-5 py-3">Usuario</th><th class="px-5 py-3">Acción</th><th class="px-5 py-3">Entidad</th><th class="px-5 py-3 text-right">Fecha</th></tr></thead>
        <tbody class="text-[12px] divide-y divide-[#F4F4F5]">
          <tr class="hover:bg-[#FAFAFA]"><td class="px-5 py-3 font-semibold text-[#18181B]">Daniel C.</td><td class="px-5 py-3"><span class="inline-flex px-1.5 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-semibold uppercase">UPDATE</span></td><td class="px-5 py-3 text-[#71717A]">Tasa IVA</td><td class="px-5 py-3 font-mono text-[#A1A1AA] text-right">10:42 hoy</td></tr>
          <tr class="hover:bg-[#FAFAFA]"><td class="px-5 py-3 font-semibold text-[#18181B]">Sistema</td><td class="px-5 py-3"><span class="inline-flex px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase">SYNC</span></td><td class="px-5 py-3 text-[#71717A]">DIAN Connect</td><td class="px-5 py-3 font-mono text-[#A1A1AA] text-right">08:00 hoy</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
