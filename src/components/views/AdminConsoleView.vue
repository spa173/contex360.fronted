<script setup>
import { ref } from 'vue'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

const activeTab = ref('Empresa')
const tabs = ['General', 'Empresa', 'Impuestos', 'Integraciones', 'Logs']

const aiSettings = ref({
  ocr: true,
  predictive: true,
  anomaly: false,
  confidence: 85
})

function handleSave() {
  emit('notify', { message: 'Configuración Guardada', detail: 'Los parámetros del sistema han sido actualizados exitosamente.' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
    <!-- Main Content Area with Right Sidebar -->
    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Primary Content Canvas -->
      <div class="flex-1 space-y-8 overflow-y-auto pr-2 pb-8">
        <!-- Header -->
        <div class="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Consola de Administración</h1>
            <p class="text-sm text-slate-500 mt-1">Configuración global del sistema, identidad corporativa y parámetros fiscales.</p>
          </div>
          <div class="flex items-center gap-3">
            <button class="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all bg-white shadow-sm">
              Descartar Cambios
            </button>
            <button @click="handleSave" class="px-5 py-2.5 rounded-lg bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 transition-all shadow-md shadow-violet-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">save</span>
              Guardar Configuración
            </button>
          </div>
        </div>

        <!-- Horizontal Tabs -->
        <div class="border-b border-slate-200 w-full flex overflow-x-auto scrollbar-hide">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            @click="activeTab = tab"
            :class="['px-6 py-3 text-xs font-bold transition-all whitespace-nowrap', 
              activeTab === tab ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/30' : 'text-slate-400 hover:text-slate-600']"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Bento Grid Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <!-- Corporate Identity -->
            <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div class="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span class="material-symbols-outlined text-violet-600">domain</span>
                  Identidad Corporativa
                </h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-5">
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre de la Empresa</label>
                    <input class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500/20 outline-none text-xs font-bold text-slate-900" value="Contex Solutions SAS"/>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">NIT / ID Fiscal</label>
                    <input class="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-500/20 outline-none text-xs font-mono text-slate-900" value="900.123.456-7"/>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Color de Marca</label>
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-violet-600 shadow-inner"></div>
                      <input class="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-xs font-mono uppercase" value="#6B38D4"/>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col h-full">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Logotipo</label>
                  <div class="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center hover:bg-violet-50/30 hover:border-violet-300 transition-all cursor-pointer group">
                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-[24px] text-violet-500">cloud_upload</span>
                    </div>
                    <p class="text-[10px] font-bold text-slate-600 uppercase">Subir Imagen</p>
                    <p class="text-[9px] text-slate-400 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Tax Parameters -->
            <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div class="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span class="material-symbols-outlined text-cyan-500">account_balance_wallet</span>
                  Parámetros Fiscales
                </h3>
                <span class="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold flex items-center gap-1 uppercase">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> DIAN Conectado
                </span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">IVA (%)</label>
                  <div class="relative">
                    <input class="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 text-xs font-mono text-right" value="19.00"/>
                    <span class="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Retefuente (%)</label>
                  <div class="relative">
                    <input class="w-full h-10 pl-3 pr-8 rounded-lg border border-slate-200 text-xs font-mono text-right" value="2.50"/>
                    <span class="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Resolución</label>
                  <input class="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono text-slate-400" readonly value="1876203189"/>
                </div>
              </div>
            </section>

            <!-- Logs Preview -->
            <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div class="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest">Logs del Sistema</h3>
                <button class="text-[10px] font-bold text-violet-600 hover:underline uppercase tracking-widest">Ver Todos</button>
              </div>
              <table class="w-full text-left">
                <tbody class="text-[11px] text-slate-600 divide-y divide-slate-50">
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-6 font-bold text-slate-900">Juan Admin</td>
                    <td class="py-3 px-6"><span class="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 uppercase">UPDATE</span> Tasa IVA</td>
                    <td class="py-3 px-6 text-slate-400 font-mono text-right">10:42:05 12/Oct</td>
                  </tr>
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-6 font-bold text-slate-900">Sistema (API)</td>
                    <td class="py-3 px-6"><span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 uppercase">SYNC</span> DIAN Connect</td>
                    <td class="py-3 px-6 text-slate-400 font-mono text-right">08:00:01 12/Oct</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          <!-- Side Panel Stats -->
          <div class="space-y-6">
            <!-- ContexAI Global -->
            <section class="bg-gradient-to-br from-violet-50 to-white rounded-xl border border-violet-100 p-6 shadow-sm">
              <h3 class="text-sm font-bold text-violet-700 flex items-center gap-2 mb-6">
                <span class="material-symbols-outlined">psychology</span> ContexAI Global
              </h3>
              <div class="space-y-5">
                <div v-for="(val, key) in {ocr: 'Automatización OCR', predictive: 'Analítica Predictiva', anomaly: 'Monitoreo Anomalías'}" :key="key" class="flex items-center justify-between gap-4">
                  <div>
                    <p class="text-xs font-bold text-slate-900">{{ val }}</p>
                    <p class="text-[10px] text-slate-500 leading-tight">Activar motor inteligente para este módulo.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="aiSettings[key]" class="sr-only peer">
                    <div class="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
                <div class="pt-4 border-t border-violet-100">
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Umbral AI</label>
                    <span class="font-mono text-violet-600 font-bold text-xs">{{ aiSettings.confidence }}%</span>
                  </div>
                  <input type="range" v-model="aiSettings.confidence" min="0" max="100" class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600">
                </div>
              </div>
            </section>

            <!-- Usage Stats -->
            <section class="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <h3 class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Uso del Sistema</h3>
              <div class="space-y-6">
                <div>
                  <div class="flex justify-between text-[10px] font-bold mb-2 uppercase">
                    <span class="text-slate-400">Almacenamiento (50GB)</span>
                    <span class="text-cyan-400">68%</span>
                  </div>
                  <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-cyan-400 rounded-full" style="width: 68%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[10px] font-bold mb-2 uppercase">
                    <span class="text-slate-400">Llamadas API</span>
                    <span class="text-violet-400">14.2k / 50k</span>
                  </div>
                  <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-violet-400 rounded-full" style="width: 28%"></div>
                  </div>
                </div>
              </div>
              <button class="w-full mt-8 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest">Ver Métricas Completas</button>
            </section>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: ContexAI Insights -->
      <aside class="w-80 flex flex-col gap-6 shrink-0 border-l border-slate-100 pl-6 h-full overflow-y-auto">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span class="material-symbols-outlined text-violet-600 text-[20px]">auto_awesome</span>
          <h3 class="text-sm font-bold text-slate-900">System Insights</h3>
        </div>
        <div class="space-y-4">
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-violet-300 transition-all">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">key</span>
              </div>
              <div>
                <h4 class="text-[11px] font-bold text-slate-900 uppercase">Actualizar API Keys</h4>
                <p class="text-[11px] text-slate-500 mt-1 leading-snug">Las llaves de integración con la pasarela expiran en 5 días.</p>
                <button class="mt-2 text-[10px] font-bold text-violet-600 uppercase hover:underline">Renovar</button>
              </div>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-violet-300 transition-all">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px]">speed</span>
              </div>
              <div>
                <h4 class="text-[11px] font-bold text-slate-900 uppercase">Optimización BD</h4>
                <p class="text-[11px] text-slate-500 mt-1 leading-snug">Se sugiere archivar logs antiguos para mejorar la velocidad en un 12%.</p>
                <button class="mt-2 text-[10px] font-bold text-violet-600 uppercase hover:underline">Ejecutar</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
