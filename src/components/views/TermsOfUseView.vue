<script setup lang="ts">
const lastUpdated = '12 de mayo de 2026'
const emit = defineEmits<{ (e: 'back'): void }>()

const sections = [
  {
    n: '1',
    title: 'Descripción del servicio',
    body: 'Contex360 es una plataforma de gestión empresarial (ERP) que ofrece funcionalidades de facturación, contabilidad, inventario, gestión de terceros y analítica, orientada a empresas colombianas. El servicio se presta bajo modalidad SaaS (Software as a Service).',
  },
  {
    n: '2',
    title: 'Condiciones de acceso',
    list: [
      'El acceso requiere credenciales válidas asignadas por el administrador de su organización.',
      'Cada usuario es responsable de mantener la confidencialidad de su contraseña.',
      'El uso compartido de credenciales está estrictamente prohibido.',
      'Se recomienda activar la autenticación de dos factores (2FA) para mayor seguridad.',
      'Las cuentas inactivas por más de 90 días pueden ser suspendidas automáticamente.',
    ],
  },
  {
    n: '3',
    title: 'Uso aceptable',
    intro: 'El usuario se compromete a:',
    list: [
      'Utilizar la plataforma exclusivamente para fines legítimos de gestión empresarial.',
      'No intentar acceder a datos de otras organizaciones o usuarios sin autorización.',
      'No realizar ingeniería inversa, descompilar ni modificar el software.',
      'No introducir virus, malware ni código malicioso en la plataforma.',
      'Respetar los límites de uso establecidos para su plan.',
    ],
  },
  {
    n: '4',
    title: 'Propiedad intelectual',
    body: 'Todo el software, diseño, marcas, logotipos y contenido de Contex360 son propiedad exclusiva de sus desarrolladores y están protegidos por la legislación colombiana e internacional de propiedad intelectual. Queda prohibida su reproducción, distribución o uso no autorizado.',
  },
  {
    n: '5',
    title: 'Datos y privacidad',
    body: 'El tratamiento de datos personales se rige por nuestra <strong>Política de Privacidad</strong> conforme a la Ley 1581 de 2012. Los datos contables y empresariales ingresados son propiedad de la organización usuaria. Contex360 actúa como encargado del tratamiento y no accede a dicha información salvo para fines de soporte técnico autorizado.',
  },
]

const slaCards = [
  { label: 'SLA objetivo',   body: '99.5% de disponibilidad mensual' },
  { label: 'Mantenimientos', body: 'Notificados con mínimo 24h de anticipación' },
  { label: 'Soporte',        body: 'A través del administrador de su organización' },
  { label: 'Respaldos',      body: 'Copias de seguridad diarias automáticas' },
]

const finalSections = [
  {
    n: '7',
    title: 'Limitación de responsabilidad',
    body: 'Contex360 no será responsable por pérdidas de datos derivadas de uso indebido de credenciales, errores en la información ingresada por el usuario, o decisiones empresariales tomadas con base en los reportes de la plataforma. La responsabilidad máxima de Contex360 ante cualquier reclamación se limita al valor pagado por el servicio en los últimos 30 días.',
  },
  {
    n: '8',
    title: 'Facturación y pagos',
    list: [
      'El servicio puede estar sujeto a tarifas según el plan contratado.',
      'Los pagos no son reembolsables salvo acuerdo expreso por escrito.',
      'La falta de pago puede resultar en la suspensión temporal o cancelación del acceso.',
      'Los precios pueden ajustarse con 30 días de notificación previa.',
    ],
  },
  {
    n: '9',
    title: 'Cancelación y terminación',
    body: 'Cualquiera de las partes puede dar por terminado el servicio con 15 días de aviso previo. Ante el incumplimiento de estos términos, Contex360 puede suspender o cancelar el acceso de forma inmediata. Tras la cancelación, los datos serán retenidos por 30 días para facilitar la exportación, tras lo cual serán eliminados de forma permanente.',
  },
  {
    n: '10',
    title: 'Legislación aplicable',
    body: 'Estos Términos de Uso se rigen por las leyes de la República de Colombia. Cualquier controversia derivada del uso del servicio será sometida a la jurisdicción de los tribunales competentes de la ciudad de Bogotá D.C., Colombia.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-[#18181B] font-['Inter'] relative overflow-x-hidden">
    <!-- Subtle blue radial accent -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    ></div>

    <!-- Nav -->
    <header class="relative sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#F4F4F5]">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          @click="emit('back')"
          class="flex items-center gap-2 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver
        </button>
        <div class="flex items-center gap-2.5">
          <svg class="c360-mark flex-shrink-0" width="28" height="28" viewBox="0 0 56 56">
            <rect width="56" height="56" rx="12" fill="#18181B"/>
            <g class="rotor">
              <path d="M44 18 A 16 16 0 1 0 44 38" stroke="#fff" stroke-width="5.5" stroke-linecap="round" fill="none"/>
              <path d="M44 18 A 16 16 0 0 1 44 38" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round" fill="none"/>
            </g>
          </svg>
          <span class="text-[16px] font-bold tracking-tight text-[#18181B]">Contex360</span>
        </div>
        <div class="w-[60px]"></div>
      </div>
    </header>

    <!-- Hero -->
    <section class="relative pt-14 pb-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2563EB] mb-4">Legal</p>
        <h1 class="text-[36px] lg:text-[48px] leading-[1.05] tracking-[-0.03em] font-bold text-[#18181B] mb-3" style="text-wrap: balance;">
          Términos de Uso
        </h1>
        <p class="text-[13px] text-[#71717A] font-medium">Última actualización: {{ lastUpdated }}</p>
      </div>
    </section>

    <!-- Acceptance alert -->
    <section class="relative pb-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex gap-3 p-5 rounded-[18px] border border-[#E4E4E7] bg-[#FAFAFA]">
          <div class="w-9 h-9 rounded-[10px] bg-white border border-[#E4E4E7] flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[18px] text-[#2563EB]">gavel</span>
          </div>
          <p class="text-[13px] text-[#18181B] leading-[1.6] font-medium pt-1">
            Al acceder y utilizar la plataforma <strong class="font-semibold">Contex360</strong>, usted acepta los presentes Términos de Uso en su totalidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar el servicio.
          </p>
        </div>
      </div>
    </section>

    <!-- Sections 1-5 -->
    <section class="relative pb-2">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
        <article v-for="s in sections" :key="s.n">
          <div class="flex items-baseline gap-3 mb-3">
            <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">{{ s.n.padStart(2, '0') }}</span>
            <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">{{ s.title }}</h2>
          </div>
          <p v-if="s.body" class="text-[14px] text-[#71717A] leading-[1.65] font-medium" v-html="s.body"></p>
          <p v-if="s.intro" class="text-[14px] text-[#71717A] leading-[1.65] font-medium mb-3">{{ s.intro }}</p>
          <ul v-if="s.list" class="space-y-2 text-[14px] text-[#71717A] leading-[1.55] font-medium">
            <li v-for="item in s.list" :key="item" class="relative pl-5">
              <span class="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Section 6: SLA grid -->
    <section class="relative py-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex items-baseline gap-3 mb-3">
          <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">06</span>
          <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">Disponibilidad del servicio</h2>
        </div>
        <div class="grid sm:grid-cols-2 gap-3 mb-5">
          <div
            v-for="c in slaCards"
            :key="c.label"
            class="p-4 rounded-[10px] border border-[#E4E4E7] bg-white"
          >
            <p class="text-[10px] font-bold text-[#18181B] uppercase tracking-wider mb-1.5">{{ c.label }}</p>
            <p class="text-[13px] text-[#71717A] leading-[1.55] font-medium">{{ c.body }}</p>
          </div>
        </div>
        <p class="text-[14px] text-[#71717A] leading-[1.65] font-medium">
          Contex360 no se responsabiliza por interrupciones causadas por factores externos como fallas de conectividad del usuario, eventos de fuerza mayor o interrupciones de proveedores de infraestructura (AWS, Render, Neon).
        </p>
      </div>
    </section>

    <!-- Final sections 7-10 -->
    <section class="relative pt-2 pb-12">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
        <article v-for="s in finalSections" :key="s.n">
          <div class="flex items-baseline gap-3 mb-3">
            <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">{{ s.n.padStart(2, '0') }}</span>
            <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">{{ s.title }}</h2>
          </div>
          <p v-if="s.body" class="text-[14px] text-[#71717A] leading-[1.65] font-medium" v-html="s.body"></p>
          <ul v-if="s.list" class="space-y-2 text-[14px] text-[#71717A] leading-[1.55] font-medium">
            <li v-for="item in s.list" :key="item" class="relative pl-5">
              <span class="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Footer note -->
    <section class="relative pb-20">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="p-5 rounded-[10px] border border-[#F4F4F5] bg-[#FAFAFA]">
          <p class="text-[12px] text-[#71717A] leading-[1.6] font-medium">
            Estos términos pueden ser modificados periódicamente. Los cambios serán notificados a través de la plataforma con al menos 15 días de anticipación. El uso continuado del servicio tras la notificación implica la aceptación de los términos actualizados.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-[#F4F4F5] py-7 text-center">
      <p class="text-[12px] text-[#A1A1AA] font-medium">© 2026 Contex360. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
