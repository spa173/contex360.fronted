<script setup>
import { computed } from 'vue'

const props = defineProps({
  isActive: { type: Boolean, required: true }
})

const emit = defineEmits(['notify'])

function handleExport() {
  emit('notify', { message: 'Exportación Iniciada', detail: 'Generando PDF del reporte consolidado de Q4...' })
}
</script>

<template>
  <section v-if="isActive" class="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
    <!-- Main Content Area with Right Sidebar -->
    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Primary Content Canvas -->
      <div class="flex-1 space-y-8 overflow-y-auto pr-2 pb-8">
        <!-- Header -->
        <div class="flex justify-between items-end">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Reportes y Analítica</h2>
            <p class="text-sm text-slate-500 mt-1">Inteligencia de negocios y proyecciones financieras</p>
          </div>
          <div class="flex gap-3">
            <button @click="handleExport" class="px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">download</span> Exportar
            </button>
            <button class="px-4 py-2 bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-100 hover:bg-cyan-600 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">schedule_send</span> Programar Envío
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ingresos Proyectados (Q4)</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-slate-900">$4.2M</h3>
              <span class="text-[10px] font-bold text-emerald-600 flex items-center"><span class="material-symbols-outlined text-[14px]">arrow_upward</span> 12%</span>
            </div>
            <p class="text-[10px] text-slate-400 font-bold mt-2 uppercase">Confianza: Alta (±5%)</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ebitda Estimado</p>
            <div class="flex items-baseline gap-2">
              <h3 class="text-2xl font-bold text-slate-900">22%</h3>
              <span class="text-[10px] font-bold text-emerald-600 flex items-center"><span class="material-symbols-outlined text-[14px]">arrow_upward</span> 2.5%</span>
            </div>
            <p class="text-[10px] text-slate-400 font-bold mt-2 uppercase">vs 19.5% mes anterior</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Punto de Equilibrio</p>
            <div class="text-2xl font-bold text-slate-900">Alcanzado</div>
            <p class="text-[10px] text-slate-400 font-bold mt-2 uppercase">Estimado: 15 Nov</p>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-l-4 border-l-emerald-500">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Riesgo de Liquidez</p>
            <div class="text-2xl font-bold text-emerald-600">Bajo</div>
            <p class="text-[10px] text-violet-500 font-bold mt-2 flex items-center gap-1 uppercase">
              <span class="material-symbols-outlined text-[14px]">auto_awesome</span> Análisis ContexAI
            </p>
          </div>
        </div>

        <!-- Central Visualizations -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 class="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Proyección de Flujo de Caja vs Ejecutado</h4>
            <div class="w-full h-64 bg-slate-50 rounded-xl border border-slate-100 border-dashed flex flex-col items-center justify-center relative overflow-hidden group">
              <!-- Mock Chart Elements -->
              <div class="absolute inset-x-8 bottom-12 flex items-end justify-between h-32">
                <div v-for="i in 12" :key="i" class="w-4 bg-slate-200 rounded-t transition-all group-hover:bg-violet-200" :style="{height: Math.random() * 100 + '%'}"></div>
              </div>
              <div class="absolute inset-x-8 bottom-12 h-[2px] bg-cyan-400/30 w-full animate-pulse"></div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10 bg-white/80 px-4 py-2 rounded-full border border-slate-100">Visualización Reactiva</span>
            </div>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 class="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Ventas por Línea de Negocio</h4>
            <div class="w-full h-64 bg-slate-50 rounded-xl border border-slate-100 border-dashed flex flex-col items-center justify-center relative">
              <!-- Mock Pie Chart -->
              <div class="w-32 h-32 rounded-full border-8 border-violet-500/20 relative">
                <div class="absolute inset-0 border-8 border-violet-500 rounded-full clip-path-half animate-spin-slow"></div>
              </div>
              <div class="mt-6 space-y-2">
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-violet-500"></span><span class="text-[9px] font-bold text-slate-500">SaaS Enterprise</span></div>
                <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-cyan-500"></span><span class="text-[9px] font-bold text-slate-500">Servicios Labs</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Table -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h4 class="text-sm font-bold text-slate-900">Reportes Recientes y Generados</h4>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">search</span>
              <input class="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] outline-none" placeholder="Buscar reporte..."/>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
                  <th class="px-6 py-3">Nombre</th>
                  <th class="px-6 py-3">Fecha</th>
                  <th class="px-6 py-3">Propietario</th>
                  <th class="px-6 py-3">Estado</th>
                  <th class="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-xs text-slate-700 divide-y divide-slate-50">
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 font-bold">Cierre Mensual - Octubre</td>
                  <td class="px-6 py-4 font-mono text-slate-400">01 Nov 2023</td>
                  <td class="px-6 py-4"><span class="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold uppercase">Ana C.</span></td>
                  <td class="px-6 py-4"><span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Listo</span></td>
                  <td class="px-6 py-4 text-right"><button class="text-slate-300 hover:text-violet-600"><span class="material-symbols-outlined text-[18px]">download</span></button></td>
                </tr>
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 font-bold">Proyección Fiscal Q4</td>
                  <td class="px-6 py-4 font-mono text-slate-400">05 Nov 2023</td>
                  <td class="px-6 py-4"><span class="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold uppercase">Sistema</span></td>
                  <td class="px-6 py-4"><span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100">Procesando</span></td>
                  <td class="px-6 py-4 text-right"><button class="text-slate-300 hover:text-violet-600"><span class="material-symbols-outlined text-[18px]">more_vert</span></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: ContexAI Insights -->
      <aside class="w-80 flex flex-col gap-6 shrink-0 border-l border-slate-100 pl-6 h-full overflow-y-auto">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-200">
          <span class="material-symbols-outlined text-violet-600 text-[20px]">auto_awesome</span>
          <h3 class="text-sm font-bold text-slate-900">ContexAI Intelligence</h3>
        </div>
        
        <div class="space-y-4">
          <!-- Prediction Card -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-violet-300 transition-all border-l-4 border-l-violet-500">
            <div class="flex items-center gap-2 text-violet-600 mb-2">
              <span class="material-symbols-outlined text-[18px]">trending_up</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Predicción de Cierre</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              Basado en las tendencias actuales, se sugiere un cierre de ingresos <span class="font-bold text-emerald-600">8% superior</span> al proyectado inicial.
            </p>
          </div>

          <!-- Anomaly Card -->
          <div class="bg-white border border-rose-100 rounded-xl p-4 shadow-sm border-l-4 border-l-rose-500">
            <div class="flex items-center gap-2 text-rose-600 mb-2">
              <span class="material-symbols-outlined text-[18px]">warning</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Anomalía Detectada</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed mb-3">
              Incremento repentino del <span class="font-bold text-rose-600">15%</span> en gastos operativos (Software) durante los últimos 5 días.
            </p>
            <button class="w-full py-1.5 border border-rose-100 text-rose-600 rounded text-[9px] font-bold uppercase hover:bg-rose-50 transition-all">Ver Auditoría</button>
          </div>

          <!-- Optimization Card -->
          <div class="bg-white border border-cyan-100 rounded-xl p-4 shadow-sm border-l-4 border-l-cyan-500">
            <div class="flex items-center gap-2 text-cyan-600 mb-2">
              <span class="material-symbols-outlined text-[18px]">lightbulb</span>
              <h4 class="text-[10px] font-bold uppercase tracking-wider">Optimización</h4>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed mb-3">
              El análisis de ROI sugiere reasignar $25k del presupuesto de marketing a retención para mejorar el LTV global.
            </p>
            <button class="w-full py-1.5 bg-cyan-500 text-white rounded text-[9px] font-bold uppercase hover:bg-cyan-600 shadow-sm">Ver Estrategia</button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
.clip-path-half {
  clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
}
</style>
