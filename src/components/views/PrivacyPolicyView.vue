<script setup lang="ts">
const lastUpdated = '12 de mayo de 2026'
const emit = defineEmits<{ (e: 'back'): void }>()

const sections = [
  {
    n: '1',
    title: 'Responsable del tratamiento',
    body: '<strong>Contex360</strong> es el responsable del tratamiento de los datos personales recopilados a través de esta plataforma. Para cualquier consulta relacionada con el tratamiento de sus datos, puede contactarnos a través del administrador de su organización.',
  },
  {
    n: '2',
    title: 'Datos que recopilamos',
    list: [
      'Nombre completo y correo electrónico (identificación del usuario)',
      'Dirección IP y agente de usuario (seguridad y trazabilidad)',
      'Datos de la empresa: NIT, razón social, ciudad, sector',
      'Información contable: facturas, movimientos, productos, terceros',
      'Registros de acceso y eventos de auditoría',
    ],
  },
  {
    n: '3',
    title: 'Finalidad del tratamiento',
    list: [
      'Prestación del servicio de gestión contable y ERP',
      'Autenticación y control de acceso por roles',
      'Auditoría interna y cumplimiento normativo (DIAN)',
      'Mejora del servicio y soporte técnico',
      'Cumplimiento de obligaciones legales y fiscales',
    ],
  },
]

const securityCards = [
  { label: 'Cifrado en tránsito', body: 'TLS 1.2+ en todas las comunicaciones (HTTPS)' },
  { label: 'Cifrado en reposo',   body: 'AES-256 en la infraestructura de base de datos (Neon/AWS)' },
  { label: 'Contraseñas',         body: 'Hash irreversible con bcrypt (nunca en texto plano)' },
  { label: 'Control de acceso',   body: 'JWT firmado + roles por empresa + 2FA opcional' },
]

const rights = [
  '<strong>Conocer</strong> los datos personales que Contex360 tiene sobre usted',
  '<strong>Actualizar</strong> sus datos cuando sean inexactos o estén desactualizados',
  '<strong>Rectificar</strong> información incorrecta o incompleta',
  '<strong>Suprimir</strong> sus datos cuando no sean necesarios para la finalidad del tratamiento',
  '<strong>Revocar</strong> la autorización para el tratamiento de datos personales',
  '<strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC)',
]

const finalSections = [
  {
    n: '6',
    title: 'Transferencia de datos',
    body: 'Los datos son almacenados en servidores de <strong>Neon (AWS us-east-1)</strong> y servidos desde <strong>Render</strong>. Ambos proveedores cuentan con certificaciones <strong>SOC 2 Type II</strong> e <strong>ISO 27001</strong>. No se venden ni comparten datos con terceros con fines comerciales.',
  },
  {
    n: '7',
    title: 'Cookies y almacenamiento local',
    body: 'Contex360 utiliza <strong>cookies HttpOnly</strong> para la sesión de autenticación y <strong>localStorage</strong> para mantener el estado de la sesión activa. No se utilizan cookies de seguimiento ni publicidad.',
  },
  {
    n: '8',
    title: 'Retención de datos',
    body: 'Los datos contables se conservan por el tiempo exigido por la normativa tributaria colombiana (<strong>mínimo 5 años</strong> según el Código de Comercio y disposiciones de la DIAN). Los datos de sesión se eliminan al revocar la sesión o al vencimiento del token.',
  },
  {
    n: '9',
    title: 'Notificación de brechas',
    body: 'En caso de una vulneración de seguridad que afecte datos personales, Contex360 notificará a los titulares afectados y a la SIC dentro de las <strong>72 horas</strong> siguientes al conocimiento del incidente, conforme a las disposiciones aplicables.',
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
          Política de Privacidad
        </h1>
        <p class="text-[13px] text-[#71717A] font-medium">Última actualización: {{ lastUpdated }}</p>
      </div>
    </section>

    <!-- Compliance alert -->
    <section class="relative pb-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex gap-3 p-5 rounded-[18px] border border-[#E4E4E7] bg-[#FAFAFA]">
          <div class="w-9 h-9 rounded-[10px] bg-white border border-[#E4E4E7] flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[18px] text-[#2563EB]">verified_user</span>
          </div>
          <p class="text-[13px] text-[#18181B] leading-[1.6] font-medium pt-1">
            De conformidad con la <strong class="font-semibold">Ley 1581 de 2012</strong> y el <strong class="font-semibold">Decreto 1377 de 2013</strong> (Régimen de Protección de Datos Personales de Colombia), Contex360 informa su política de tratamiento de datos personales.
          </p>
        </div>
      </div>
    </section>

    <!-- Sections 1-3 -->
    <section class="relative pb-2">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
        <article v-for="s in sections" :key="s.n">
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

    <!-- Section 4: Security grid -->
    <section class="relative py-10">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex items-baseline gap-3 mb-3">
          <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">04</span>
          <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">Seguridad de los datos</h2>
        </div>
        <p class="text-[14px] text-[#71717A] leading-[1.65] font-medium mb-5">Contex360 implementa las siguientes medidas técnicas para proteger sus datos:</p>
        <div class="grid sm:grid-cols-2 gap-3">
          <div
            v-for="c in securityCards"
            :key="c.label"
            class="p-4 rounded-[10px] border border-[#E4E4E7] bg-white"
          >
            <p class="text-[10px] font-bold text-[#18181B] uppercase tracking-wider mb-1.5">{{ c.label }}</p>
            <p class="text-[13px] text-[#71717A] leading-[1.55] font-medium">{{ c.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Rights -->
    <section class="relative py-2">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="flex items-baseline gap-3 mb-3">
          <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">05</span>
          <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">Derechos del titular</h2>
        </div>
        <p class="text-[14px] text-[#71717A] leading-[1.65] font-medium mb-3">De conformidad con la Ley 1581 de 2012, usted tiene derecho a:</p>
        <ul class="space-y-2 text-[14px] text-[#71717A] leading-[1.55] font-medium">
          <li v-for="r in rights" :key="r" class="relative pl-5">
            <span class="absolute left-0 top-[10px] w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            <span v-html="r"></span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Final sections 6-9 -->
    <section class="relative pt-10 pb-12">
      <div class="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
        <article v-for="s in finalSections" :key="s.n">
          <div class="flex items-baseline gap-3 mb-3">
            <span class="text-[11px] font-bold text-[#A1A1AA] tracking-wider">{{ s.n.padStart(2, '0') }}</span>
            <h2 class="text-[19px] font-bold tracking-tight text-[#18181B]">{{ s.title }}</h2>
          </div>
          <p class="text-[14px] text-[#71717A] leading-[1.65] font-medium" v-html="s.body"></p>
        </article>
      </div>
    </section>

    <!-- Footer note -->
    <section class="relative pb-20">
      <div class="max-w-3xl mx-auto px-6 lg:px-8">
        <div class="p-5 rounded-[10px] border border-[#F4F4F5] bg-[#FAFAFA]">
          <p class="text-[12px] text-[#71717A] leading-[1.6] font-medium">
            Esta política puede ser actualizada periódicamente. Los cambios serán notificados a los usuarios a través de la plataforma. El uso continuado del servicio implica la aceptación de la política vigente.
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
