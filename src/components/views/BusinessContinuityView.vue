<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useLegal } from '../../composables/useLegal'

const { doc } = useLegal('business-continuity-plan')

useHead({
  title: 'Plan de Continuidad del Negocio',
  meta: [
    { name: 'description', content: 'Plan de continuidad del negocio de Contex360 — RTO 4h, RPO 30min.' },
    { property: 'og:title', content: 'Plan de Continuidad del Negocio' },
    { property: 'og:description', content: 'Plan de continuidad del negocio de Contex360 — RTO 4h, RPO 30min.' },
    { name: 'twitter:title', content: 'Plan de Continuidad del Negocio' },
    { name: 'twitter:description', content: 'Plan de continuidad del negocio de Contex360 — RTO 4h, RPO 30min.' },
  ]
})

const lastUpdated = '12 de mayo de 2026'
const emit = defineEmits<{ (e: 'back'): void; (e: 'show-privacy'): void; (e: 'show-terms'): void; (e: 'show-dpa'): void }>()

const sections = [
  {
    n: '1',
    title: 'Objetivo',
    body: 'Garantizar la continuidad de las operaciones críticas de Contex360 ante interrupciones significativas.',
  },
  {
    n: '2',
    title: 'Alcance',
    body: 'Este plan cubre la infraestructura de producción: API, base de datos, autenticación y servicios de facturación electrónica.',
  },
  {
    n: '3',
    title: 'Objetivos de recuperación',
    items: [
      { label: 'RTO (Recovery Time Objective)', value: '4 horas' },
      { label: 'RPO (Recovery Point Objective)', value: '30 minutos' },
      { label: 'Prueba de restauración', value: 'Mensual' },
    ],
  },
  {
    n: '4',
    title: 'Escenarios cubiertos',
    list: [
      'Caída total de la API',
      'Pérdida de acceso a la base de datos',
      'Error crítico de autenticación',
      'Despliegue fallido en producción',
    ],
  },
  {
    n: '5',
    title: 'Procedimientos',
    steps: [
      'Activación del plan ante incidente crítico.',
      'Evaluación del impacto y comunicación a stakeholders.',
      'Restauración desde backup más reciente.',
      'Verificación de integridad de datos.',
      'Pruebas de funcionalidad crítica.',
      'Retorno a operación normal.',
    ],
  },
  {
    n: '6',
    title: 'Responsables',
    body: 'Dirección de TI y Operaciones.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-[#18181B] font-['Inter'] relative overflow-x-hidden">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    />

    <header class="relative sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F4F4F5]">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          class="flex items-center gap-2 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
          @click="emit('back')"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </button>
        <div class="flex items-center gap-2.5">
          <svg
            class="c360-mark flex-shrink-0"
            width="28"
            height="28"
            viewBox="0 0 56 56"
            aria-hidden="true"
          >
            <rect
              width="56"
              height="56"
              rx="12"
              fill="#18181B"
            />
            <g class="rotor">
              <path
                d="M44 18 A 16 16 0 1 0 44 38"
                stroke="#fff"
                stroke-width="5.5"
                stroke-linecap="round"
                fill="none"
              />
              <path
                d="M44 18 A 16 16 0 0 1 44 38"
                stroke="#2563EB"
                stroke-width="5.5"
                stroke-linecap="round"
                fill="none"
              />
            </g>
          </svg>
          <span class="text-[16px] font-bold tracking-tight text-[#18181B]">Contex360</span>
        </div>
        <div class="w-[60px]" />
      </div>
    </header>

    <section class="relative pt-14 pb-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">
          Operaciones
        </p>
        <h1
          class="text-[36px] lg:text-[48px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-3"
          style="text-wrap: balance;"
        >
          Plan de Continuidad del Negocio
        </h1>
        <p class="text-[13px] text-[#71717A] font-medium">
          Última actualización: {{ lastUpdated }}
          <span
            v-if="doc"
            class="inline-flex items-center ml-3 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F4F4F5] text-[#71717A]"
            :title="`Versión ${doc.version} — sincronizada con el servidor`"
          >v{{ doc.version }}</span>
        </p>
      </div>
    </section>

    <section class="relative pb-2">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 space-y-12">
        <article
          v-for="s in sections"
          :key="s.n"
        >
          <div class="flex items-baseline gap-3 mb-3">
            <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">{{ s.n.padStart(2, '0') }}</span>
            <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">
              {{ s.title }}
            </h2>
          </div>

          <p
            v-if="s.body"
            class="text-[14px] text-[#71717A] leading-[1.65] font-medium"
          >
            {{ s.body }}
          </p>

          <div
            v-if="s.items"
            class="grid sm:grid-cols-3 gap-3 mt-4"
          >
            <div
              v-for="item in s.items"
              :key="item.label"
              class="p-4 rounded-[10px] border border-[#E4E4E7] bg-white"
            >
              <p class="text-[10px] font-bold text-[#18181B] uppercase tracking-wider mb-1">
                {{ item.label }}
              </p>
              <p class="text-[18px] font-bold text-[#2563EB]">
                {{ item.value }}
              </p>
            </div>
          </div>

          <ul
            v-if="s.list"
            class="space-y-2 text-[14px] text-[#71717A] leading-[1.55] font-medium mt-3"
          >
            <li
              v-for="item in s.list"
              :key="item"
              class="relative pl-5"
            >
              <span class="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              {{ item }}
            </li>
          </ul>

          <ol
            v-if="s.steps"
            class="space-y-2 text-[14px] text-[#71717A] leading-[1.55] font-medium mt-3"
          >
            <li
              v-for="(step, idx) in s.steps"
              :key="idx"
              class="flex gap-3"
            >
              <span class="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
              <span class="pt-0.5">{{ step }}</span>
            </li>
          </ol>
        </article>
      </div>
    </section>

    <section class="relative pb-6">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            class="px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            @click="emit('show-privacy')"
          >
            Política de Privacidad
          </button>
          <button
            class="px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            @click="emit('show-terms')"
          >
            Términos de Uso
          </button>
          <button
            class="px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            @click="emit('show-dpa')"
          >
            Acuerdo de Datos
          </button>
        </div>
      </div>
    </section>

    <footer class="border-t border-[#F4F4F5] py-7 text-center mt-12">
      <p class="text-[12px] text-[#A1A1AA] font-medium">
        © 2026 Contex360. Todos los derechos reservados.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
