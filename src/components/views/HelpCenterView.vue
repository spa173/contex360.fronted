<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const emit = defineEmits(['notify', 'navigate'])

const searchQuery = ref('')
const activeCategory = ref('all')
const expandedFaq = ref(null)

const categories = [
  { id: 'all', label: 'Todos', icon: 'apps' },
  { id: 'getting-started', label: 'Primeros pasos', icon: 'rocket_launch' },
  { id: 'billing', label: 'Facturación', icon: 'receipt_long' },
  { id: 'inventory', label: 'Inventario', icon: 'inventory_2' },
  { id: 'accounting', label: 'Contabilidad', icon: 'account_balance' },
  { id: 'security', label: 'Seguridad', icon: 'shield' },
  { id: 'integrations', label: 'Integraciones', icon: 'hub' },
]

const articles = [
  // Getting Started
  { id: 1, category: 'getting-started', title: 'Cómo configurar tu empresa en Contex360', summary: 'Aprende a configurar los datos fiscales, logo, dirección y parámetros contables de tu empresa para empezar a operar.', readTime: '5 min', icon: 'business', steps: ['Navega a Configuración > Datos de la empresa', 'Completa el NIT, razón social y régimen tributario', 'Sube el logo y configura la dirección fiscal', 'Guarda los cambios y verifica en la vista previa de factura'] },
  { id: 2, category: 'getting-started', title: 'Crear tu primer usuario y asignar roles', summary: 'Guía paso a paso para invitar colaboradores, asignar roles (Administrador, Contador, Visor, Operador) y gestionar permisos.', readTime: '4 min', icon: 'group_add', steps: ['Ve a Usuarios en el menú lateral', 'Haz clic en "Invitar usuario"', 'Ingresa el correo electrónico y selecciona el rol', 'El usuario recibirá un correo de activación con enlace seguro'] },
  { id: 3, category: 'getting-started', title: 'Navegación y atajos de teclado', summary: 'Conoce la interfaz principal, el menú lateral, la barra de búsqueda rápida (⌘K) y los atajos de teclado disponibles.', readTime: '3 min', icon: 'keyboard', steps: ['Usa ⌘K (Ctrl+K) para abrir la búsqueda rápida', 'Usa ⌘J (Ctrl+J) para abrir el Asistente IA', 'Navega entre módulos con el menú lateral', 'Usa el selector de workspace para cambiar de empresa'] },

  // Billing
  { id: 4, category: 'billing', title: 'Crear y enviar una factura electrónica', summary: 'Proceso completo para crear facturas electrónicas válidas ante la DIAN, incluyendo resolución de numeración, impuestos y firma digital.', readTime: '7 min', icon: 'description', steps: ['Accede a Facturación > Nueva factura', 'Selecciona el cliente o crea uno nuevo desde Terceros', 'Agrega los productos/servicios con cantidades y precios', 'El sistema calcula automáticamente IVA, ReteFuente e ICA', 'Revisa la vista previa y haz clic en "Emitir factura"', 'La factura se firma digitalmente y se envía a la DIAN'] },
  { id: 5, category: 'billing', title: 'Configurar resolución de numeración DIAN', summary: 'Cómo registrar tu resolución de facturación electrónica autorizada por la DIAN para emitir documentos válidos.', readTime: '4 min', icon: 'pin', steps: ['Ve a Configuración > Facturación electrónica', 'Ingresa el número de resolución y el rango autorizado', 'Configura el prefijo asignado', 'El sistema validará la vigencia automáticamente'] },
  { id: 6, category: 'billing', title: 'Notas crédito y débito', summary: 'Cómo emitir notas crédito para anular o corregir facturas, y notas débito para ajustes adicionales.', readTime: '5 min', icon: 'swap_horiz', steps: ['Busca la factura original en el listado', 'Haz clic en "Crear nota crédito" o "Crear nota débito"', 'Selecciona el concepto de corrección', 'El sistema vinculará automáticamente ambos documentos'] },

  // Inventory
  { id: 7, category: 'inventory', title: 'Gestión de productos y stock', summary: 'Aprende a crear productos, gestionar existencias, configurar alertas de stock bajo y manejar múltiples bodegas.', readTime: '6 min', icon: 'inventory', steps: ['Accede a Inventario > Productos', 'Crea un producto con código, nombre, precio y stock inicial', 'Configura la alerta de stock mínimo para recibir notificaciones', 'Asigna el producto a una o más bodegas/ubicaciones'] },
  { id: 8, category: 'inventory', title: 'Transferencias entre bodegas', summary: 'Cómo mover productos entre ubicaciones, registrar traslados y mantener la trazabilidad del inventario.', readTime: '4 min', icon: 'local_shipping', steps: ['Ve a Inventario > Transferencias', 'Selecciona bodega de origen y destino', 'Agrega los productos y cantidades a transferir', 'Confirma la transferencia — el stock se actualiza automáticamente en ambas bodegas'] },
  { id: 9, category: 'inventory', title: 'Métodos de costeo (Promedio ponderado vs FIFO)', summary: 'Entiende las diferencias entre los métodos de costeo disponibles y cómo configurarlos según tu tipo de negocio.', readTime: '5 min', icon: 'calculate', steps: ['Ve a Configuración > Inventario', 'Selecciona "Promedio ponderado" o "FIFO" según tu necesidad', 'El promedio ponderado es ideal para productos homogéneos', 'FIFO es recomendado cuando los costos varían frecuentemente'] },

  // Accounting
  { id: 10, category: 'accounting', title: 'Plan de cuentas y libro mayor', summary: 'Cómo navegar el plan de cuentas contable, consultar el libro mayor y verificar los saldos de cada cuenta.', readTime: '5 min', icon: 'menu_book', steps: ['Accede a Contabilidad > Plan de cuentas', 'Usa el buscador para localizar cuentas por código o nombre', 'Haz clic en una cuenta para ver su libro mayor detallado', 'Exporta los movimientos en PDF o Excel para auditoría'] },
  { id: 11, category: 'accounting', title: 'Conciliación bancaria', summary: 'Proceso para conciliar los extractos bancarios con los registros contables de Contex360 y detectar diferencias.', readTime: '6 min', icon: 'account_balance_wallet', steps: ['Ve a Tesorería > Conciliación', 'Sube el extracto bancario en formato CSV o conecta tu banco', 'El sistema empareja automáticamente los movimientos coincidentes', 'Revisa y clasifica las diferencias manualmente', 'Confirma la conciliación para cerrar el período'] },

  // Security
  { id: 12, category: 'security', title: 'Activar autenticación de dos factores (2FA)', summary: 'Protege tu cuenta con verificación en dos pasos usando una aplicación autenticadora como Google Authenticator o Authy.', readTime: '3 min', icon: 'verified_user', steps: ['Ve a tu perfil > Seguridad y 2FA', 'Haz clic en "Activar autenticación de dos factores"', 'Escanea el código QR con tu app autenticadora', 'Ingresa el código de 6 dígitos para confirmar la activación', 'Guarda los códigos de recuperación en un lugar seguro'] },
  { id: 13, category: 'security', title: 'Gestión de sesiones activas', summary: 'Cómo visualizar, monitorear y revocar sesiones activas en otros dispositivos para mantener la seguridad de tu cuenta.', readTime: '3 min', icon: 'devices', steps: ['Accede a tu perfil > Seguridad y 2FA', 'En la sección "Sesiones activas" verás todos los dispositivos conectados', 'Identifica el navegador, sistema operativo e IP de cada sesión', 'Haz clic en "Revocar" para cerrar sesiones sospechosas inmediatamente'] },
  { id: 14, category: 'security', title: 'Política de contraseñas y bloqueo de cuenta', summary: 'Configuración de requisitos mínimos de contraseña, expiración, historial y protección contra ataques de fuerza bruta.', readTime: '4 min', icon: 'lock', steps: ['Los administradores pueden configurar la política en Configuración > Seguridad', 'Requisitos por defecto: 10+ caracteres, mayúsculas, números y símbolos', 'Las contraseñas expiran cada 90 días con recordatorio automático', 'Tras 5 intentos fallidos, la cuenta se bloquea por 30 minutos'] },

  // Integrations
  { id: 15, category: 'integrations', title: 'Integración con la DIAN (Facturación Electrónica)', summary: 'Cómo configurar la conexión con la DIAN para la emisión y validación de documentos electrónicos en Colombia.', readTime: '6 min', icon: 'cloud_sync', steps: ['Ve a Configuración > Facturación electrónica', 'Sube tu certificado digital (.p12) y configura la clave', 'Ingresa los datos del software registrado ante la DIAN', 'Realiza una prueba de conexión para verificar la integración', 'Una vez validada, las facturas se enviarán automáticamente'] },
  { id: 16, category: 'integrations', title: 'Exportación de datos y reportes', summary: 'Opciones de exportación disponibles: PDF, Excel, CSV. Cómo programar reportes automáticos y compartirlos con tu equipo.', readTime: '4 min', icon: 'download', steps: ['Cada módulo tiene un botón "Exportar" en la esquina superior derecha', 'Selecciona el formato deseado (PDF, Excel o CSV)', 'Puedes filtrar por fechas, estado o categoría antes de exportar', 'Los reportes se generan en segundo plano y se descargan automáticamente'] },
]

const faqs = [
  { id: 1, question: '¿Cómo cambio el idioma de la interfaz?', answer: 'Haz clic en tu avatar en la esquina superior derecha, en la sección "Idioma" selecciona entre Español, Inglés o Portugués. El cambio se aplica inmediatamente a toda la interfaz.' },
  { id: 2, question: '¿Puedo tener varias empresas en una sola cuenta?', answer: 'Sí. Contex360 soporta múltiples workspaces. Usa el selector de empresa en la barra lateral para cambiar entre tus organizaciones. Cada workspace tiene su propia facturación, inventario y configuración independiente.' },
  { id: 3, question: '¿Qué pasa si olvido mi contraseña?', answer: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Recibirás un enlace de recuperación por correo electrónico. El enlace expira en 15 minutos por seguridad.' },
  { id: 4, question: '¿Los datos están encriptados?', answer: 'Sí. Todos los datos se almacenan con encriptación AES-256 en reposo y se transmiten con TLS 1.3 en tránsito. Las contraseñas se hashean con Argon2id. Cumplimos con SOC 2, ISO 27001 y la normativa de protección de datos personales (Ley 1581 de 2012).' },
  { id: 5, question: '¿Puedo usar Contex360 desde el celular?', answer: 'Sí. La interfaz es completamente responsiva y se adapta a cualquier tamaño de pantalla. Puedes acceder desde tu navegador móvil sin necesidad de instalar ninguna aplicación.' },
  { id: 6, question: '¿Cómo contacto al soporte técnico?', answer: 'Puedes usar el Asistente IA (⌘J) para resolver dudas inmediatas, o enviar un ticket de soporte desde el menú de usuario > "Contactar soporte". Nuestro equipo responde en un plazo máximo de 4 horas hábiles.' },
  { id: 7, question: '¿Qué roles de usuario existen?', answer: 'Contex360 tiene 4 roles: Administrador (acceso total), Contador (facturación, contabilidad, tesorería), Visor (solo lectura en todos los módulos) y Operador (facturación e inventario básico). Los permisos son configurables por el administrador.' },
  { id: 8, question: '¿Se pueden deshacer las facturas emitidas?', answer: 'Las facturas electrónicas emitidas ante la DIAN no se pueden eliminar. Para corregirlas, debes emitir una Nota Crédito que anule total o parcialmente la factura original. El sistema vincula ambos documentos automáticamente.' },
]

const filteredArticles = computed(() => {
  let results = articles
  if (activeCategory.value !== 'all') {
    results = results.filter(a => a.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q)
    )
  }
  return results
})

const filteredFaqs = computed(() => {
  if (!searchQuery.value.trim()) return faqs
  const q = searchQuery.value.toLowerCase()
  return faqs.filter(f =>
    f.question.toLowerCase().includes(q) ||
    f.answer.toLowerCase().includes(q)
  )
})

function toggleFaq(id) {
  expandedFaq.value = expandedFaq.value === id ? null : id
}

// Article detail view
const selectedArticle = ref(null)
function openArticle(article) { selectedArticle.value = article }
function closeArticle() { selectedArticle.value = null }
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-1">
        <span class="material-symbols-outlined text-[28px] text-[#2563EB]">help</span>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#18181B]">Centro de Ayuda</h1>
      </div>
      <p class="text-[14px] text-[#71717A] font-medium ml-[40px]">Encuentra guías, tutoriales y respuestas a las preguntas más frecuentes sobre Contex360.</p>
    </div>

    <!-- Search -->
    <div class="relative mb-8">
      <div class="flex items-center gap-3 border border-[#E4E4E7] rounded-[14px] px-4 py-3.5 bg-white focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all shadow-sm">
        <span class="material-symbols-outlined text-[20px] text-[#A1A1AA]">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar artículos, guías o preguntas frecuentes..."
          class="flex-1 bg-transparent outline-none text-[14px] text-[#18181B] placeholder:text-[#A1A1AA] font-medium"
        />
        <kbd v-if="!searchQuery" class="hidden sm:inline-block text-[10px] font-mono text-[#A1A1AA] border border-[#E4E4E7] rounded px-1.5 py-0.5 bg-[#FAFAFA]">⌘K</kbd>
      </div>
    </div>

    <!-- Article Detail View -->
    <div v-if="selectedArticle" class="animate-in fade-in duration-200">
      <button @click="closeArticle" class="flex items-center gap-1.5 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] mb-5 transition-colors">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        Volver al Centro de Ayuda
      </button>

      <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 rounded-[12px] bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[24px] text-[#2563EB]">{{ selectedArticle.icon }}</span>
          </div>
          <div>
            <h2 class="text-[20px] font-extrabold tracking-tight text-[#18181B] mb-1">{{ selectedArticle.title }}</h2>
            <div class="flex items-center gap-3 text-[12px] font-medium text-[#A1A1AA]">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span> {{ selectedArticle.readTime }} de lectura</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">folder</span> {{ categories.find(c => c.id === selectedArticle.category)?.label }}</span>
            </div>
          </div>
        </div>

        <p class="text-[14px] text-[#71717A] leading-relaxed mb-6">{{ selectedArticle.summary }}</p>

        <div class="border-t border-[#F4F4F5] pt-6">
          <h3 class="text-[14px] font-bold text-[#18181B] mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-[#2563EB]">checklist</span>
            Paso a paso
          </h3>
          <ol class="space-y-3">
            <li v-for="(step, idx) in selectedArticle.steps" :key="idx" class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
              <p class="text-[14px] text-[#18181B] font-medium leading-relaxed">{{ step }}</p>
            </li>
          </ol>
        </div>

        <div class="border-t border-[#F4F4F5] mt-8 pt-6 flex items-center justify-between">
          <p class="text-[12px] text-[#A1A1AA] font-medium">¿Te fue útil este artículo?</p>
          <div class="flex gap-2">
            <button @click="emit('notify', { message: 'Gracias por tu feedback', detail: 'Nos alegra que este artículo te haya sido útil.' })" class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#E4E4E7] text-[12px] font-semibold text-[#18181B] hover:bg-[#FAFAFA] transition-colors">
              <span class="material-symbols-outlined text-[16px] text-emerald-500">thumb_up</span> Sí
            </button>
            <button @click="emit('notify', { message: 'Gracias por tu feedback', detail: 'Trabajaremos en mejorar este artículo.' })" class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#E4E4E7] text-[12px] font-semibold text-[#18181B] hover:bg-[#FAFAFA] transition-colors">
              <span class="material-symbols-outlined text-[16px] text-rose-400">thumb_down</span> No
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content (hidden when article is open) -->
    <div v-else>
      <!-- Category Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          :class="[
            'flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12px] font-semibold transition-all border',
            activeCategory === cat.id
              ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
              : 'bg-white text-[#71717A] border-[#E4E4E7] hover:text-[#18181B] hover:border-[#D4D4D8]'
          ]"
        >
          <span class="material-symbols-outlined text-[16px]">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </div>

      <!-- Articles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <button
          v-for="article in filteredArticles"
          :key="article.id"
          @click="openArticle(article)"
          class="text-left bg-white border border-[#E4E4E7] rounded-[14px] p-5 hover:border-[#2563EB]/40 hover:shadow-md transition-all group cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-[10px] bg-[#2563EB]/10 flex items-center justify-center group-hover:bg-[#2563EB]/15 transition-colors">
              <span class="material-symbols-outlined text-[18px] text-[#2563EB]">{{ article.icon }}</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">{{ categories.find(c => c.id === article.category)?.label }}</span>
          </div>
          <h3 class="text-[14px] font-bold text-[#18181B] mb-1.5 group-hover:text-[#2563EB] transition-colors leading-snug">{{ article.title }}</h3>
          <p class="text-[12px] text-[#71717A] leading-relaxed line-clamp-2">{{ article.summary }}</p>
          <div class="flex items-center gap-1.5 mt-3 text-[11px] font-medium text-[#A1A1AA]">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            {{ article.readTime }}
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="text-center py-12">
        <span class="material-symbols-outlined text-[40px] text-[#D4D4D8] mb-3">search_off</span>
        <p class="text-[14px] font-bold text-[#18181B] mb-1">Sin resultados</p>
        <p class="text-[12px] text-[#71717A]">No encontramos artículos que coincidan con tu búsqueda. Intenta con otros términos.</p>
      </div>

      <!-- FAQ Section -->
      <div class="mb-8">
        <div class="flex items-center gap-2.5 mb-5">
          <span class="material-symbols-outlined text-[22px] text-[#2563EB]">quiz</span>
          <h2 class="text-[18px] font-extrabold tracking-tight text-[#18181B]">Preguntas Frecuentes</h2>
        </div>

        <div class="space-y-2">
          <div
            v-for="faq in filteredFaqs"
            :key="faq.id"
            class="bg-white border border-[#E4E4E7] rounded-[12px] overflow-hidden transition-all"
            :class="{ 'border-[#2563EB]/30': expandedFaq === faq.id }"
          >
            <button
              @click="toggleFaq(faq.id)"
              class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAFAFA] transition-colors"
            >
              <span class="text-[13px] font-bold text-[#18181B] pr-4 leading-snug">{{ faq.question }}</span>
              <span
                class="material-symbols-outlined text-[18px] text-[#A1A1AA] transition-transform flex-shrink-0"
                :class="{ 'rotate-180': expandedFaq === faq.id }"
              >expand_more</span>
            </button>
            <div
              v-if="expandedFaq === faq.id"
              class="px-5 pb-4 text-[13px] text-[#71717A] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support Card -->
      <div class="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-[16px] p-6 sm:p-8 text-white shadow-lg">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div class="w-14 h-14 rounded-[14px] bg-white/15 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[28px]">support_agent</span>
          </div>
          <div class="flex-1">
            <h3 class="text-[16px] font-extrabold tracking-tight mb-1">¿No encontraste lo que buscabas?</h3>
            <p class="text-[13px] font-medium text-blue-100 leading-relaxed">Nuestro equipo de soporte está disponible de lunes a viernes de 8:00 a.m. a 6:00 p.m. (COT). Tiempo de respuesta promedio: 2 horas.</p>
          </div>
          <button
            @click="emit('notify', { message: 'Ticket de soporte', detail: 'Tu solicitud ha sido registrada. Nuestro equipo te contactará pronto.' })"
            class="px-5 py-2.5 bg-white text-[#2563EB] rounded-[10px] text-[13px] font-bold hover:bg-blue-50 transition-colors shadow-sm flex-shrink-0 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">mail</span>
            Contactar soporte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
