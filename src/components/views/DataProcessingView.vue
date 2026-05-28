<script setup lang="ts">
import DOMPurify from 'dompurify'
import { useHead } from '@unhead/vue'
import { useLegal } from '../../composables/useLegal'

const { doc } = useLegal('dpa')

useHead({
  title: 'Acuerdo de Tratamiento de Datos',
  meta: [
    { name: 'description', content: 'Acuerdo de tratamiento de datos personales (DPA) de Contex360.' },
    { property: 'og:title', content: 'Acuerdo de Tratamiento de Datos' },
    { property: 'og:description', content: 'Acuerdo de tratamiento de datos personales (DPA) de Contex360.' },
    { name: 'twitter:title', content: 'Acuerdo de Tratamiento de Datos' },
    { name: 'twitter:description', content: 'Acuerdo de tratamiento de datos personales (DPA) de Contex360.' },
  ]
})

const lastUpdated = '12 de mayo de 2026'
const emit = defineEmits<{ (e: 'back'): void; (e: 'show-privacy'): void; (e: 'show-terms'): void; (e: 'show-bcp'): void }>()

const sanitizeHtml = (html: string) => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['strong', 'em', 'a'],
  ALLOWED_ATTR: ['href', 'title']
})

const sections = [
  {
    n: '1',
    title: 'Objeto',
    body: 'El Encargado tratará los datos personales a los que tenga acceso en virtud de la prestación de los servicios de la Plataforma, únicamente siguiendo las instrucciones del Responsable.',
  },
  {
    n: '2',
    title: 'Medidas de seguridad',
    list: [
      'Encriptación AES-256-GCM para datos sensibles',
      'Autenticación multifactor para acceso administrativo',
      'Auditoría de accesos mensual automatizada',
      'Plan de continuidad del negocio con RTO de 4 horas y RPO de 30 minutos',
      'Respaldos diarios con prueba de restauración mensual',
    ],
  },
  {
    n: '3',
    title: 'Subencargados',
    body: 'El Responsable autoriza al Encargado a contratar subencargados (infraestructura cloud, servicios de email) que cumplan con estándares equivalentes de protección de datos.',
  },
  {
    n: '4',
    title: 'Derechos del titular',
    body: 'El Encargado facilitará al Responsable los medios para que los titulares ejerzan sus derechos de acceso, rectificación, cancelación y oposición.',
  },
  {
    n: '5',
    title: 'Vigencia y terminación',
    body: 'Este acuerdo rige mientras dure la prestación de los servicios. Al terminar, el Encargado procederá a la eliminación o devolución de los datos según instrucciones del Responsable.',
  },
  {
    n: '6',
    title: 'Legislación aplicable',
    body: 'Ley 1581 de 2012, Decreto 1377 de 2013 y demás normas concordantes.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-[#18181B] font-['Inter'] relative overflow-x-hidden">
    <div aria-hidden="true" class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60" style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);" />

    <header class="relative sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F4F4F5]">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <button class="flex items-center gap-2 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors" @click="emit('back')">
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </button>
        <div class="flex items-center gap-2.5">
          <svg class="c360-mark flex-shrink-0" width="28" height="28" viewBox="0 0 56 56" aria-hidden="true">
            <rect width="56" height="56" rx="12" fill="#18181B" />
            <g class="rotor">
              <path d="M44 18 A 16 16 0 1 0 44 38" stroke="#fff" stroke-width="5.5" stroke-linecap="round" fill="none" />
              <path d="M44 18 A 16 16 0 0 1 44 38" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round" fill="none" />
            </g>
          </svg>
          <span class="text-[16px] font-bold tracking-tight text-[#18181B]">Contex360</span>
        </div>
        <div class="w-[60px]" />
      </div>
    </header>

    <section class="relative pt-14 pb-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">Legal</p>
        <h1 class="text-[36px] lg:text-[48px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-3" style="text-wrap: balance;">
          Acuerdo de Tratamiento de Datos
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
      <div class="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
        <article v-for="s in sections" :key="s.n">
          <div class="flex items-baseline gap-3 mb-3">
            <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">{{ s.n.padStart(2, '0') }}</span>
            <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">{{ s.title }}</h2>
          </div>
          <p v-if="s.body" class="text-[14px] text-[#71717A] leading-[1.65] font-medium" v-html="sanitizeHtml(s.body)" />
          <ul v-if="s.list" class="space-y-2 text-[14px] text-[#71717A] leading-[1.55] font-medium">
            <li v-for="item in s.list" :key="item" class="relative pl-5">
              <span class="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <section class="relative pb-20 pt-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="p-5 rounded-[10px] border border-[#F4F4F5] bg-[#FAFAFA]">
          <p class="text-[12px] text-[#71717A] leading-[1.6] font-medium">
            Este acuerdo complementa los Términos de Uso y la Política de Privacidad de Contex360. Al usar el servicio, usted acepta los términos aquí descritos.
          </p>
        </div>
      </div>
    </section>

    <section class="relative pb-6">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex flex-wrap gap-2 justify-center">
          <button class="px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors" @click="emit('show-privacy')">Política de Privacidad</button>
          <button class="px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors" @click="emit('show-terms')">Términos de Uso</button>
          <button class="px-3 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-blue-50 rounded-full hover:bg-blue-100 transition-colors" @click="emit('show-bcp')">Plan de Continuidad</button>
        </div>
      </div>
    </section>

    <footer class="border-t border-[#F4F4F5] py-7 text-center">
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
