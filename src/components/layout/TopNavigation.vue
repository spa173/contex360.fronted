<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useThemeStore } from '../../stores/themeStore'
import { useTranslationStore } from '../../stores/translationStore'
import { businessApi } from '../../services/businessApi'
import { useStateStore } from '../../stores/stateStore'

const props = defineProps(['activeTenant', 'accessibleTenants', 'user', 'activeView', 'activeMembership', 'sidebarOpen', 'canSwitchTenant'])
const emit = defineEmits(['logout', 'toggle-sidebar', 'navigate', 'open-admin-panel', 'notify'])

const store = useStateStore()

const trialDaysLeft = computed(() => {
  const sub = store.subscription
  if (!sub || !sub.trialEndsAt) return null
  
  const end = new Date(sub.trialEndsAt)
  const now = new Date()
  
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const showTrialBanner = computed(() => {
  const days = trialDaysLeft.value
  return days !== null && days >= 0 && days < 5
})

const themeStore = useThemeStore()
const showNotifications = ref(false)
const showAvatar = ref(false)
const showShortcuts = ref(false)

function closeAll() {
  showNotifications.value = false
  showAvatar.value = false
  showShortcuts.value = false
}

function onClickOutside(e) {
  if (!e.target.closest('[data-dropdown]')) closeAll()
}
function onEsc(e) {
  if (e.key === 'Escape') closeAll()
}

const notifications = ref([])
const unreadCount = ref(0)
const isLoading = ref(false)

async function fetchNotifications() {
  try {
    isLoading.value = true
    const [alerts, insights] = await Promise.all([
      businessApi.getAlerts().catch(() => ({ lowStockAlerts: 0, pendingInvoices: 0, ocrRunsCount: 0 })),
      businessApi.getAiInsights().catch(() => ({ insight: '' })),
    ])

    const list = []

    // 1. Facturas DIAN
    if (alerts.pendingInvoices > 0) {
      list.push({
        id: 'pending-invoices',
        title: 'Facturas pendientes',
        description: `${alerts.pendingInvoices} documentos electrónicos pendientes de cobro.`,
        time: 'hace 5 min',
        icon: 'error',
        colorClass: 'bg-rose-50 text-rose-700',
      })
    }

    // 2. Stock crítico
    if (alerts.lowStockAlerts > 0) {
      list.push({
        id: 'low-stock',
        title: 'Stock crítico',
        description: `${alerts.lowStockAlerts} productos llegaron al nivel de inventario mínimo.`,
        time: 'hace 10 min',
        icon: 'inventory_2',
        colorClass: 'bg-amber-50 text-amber-700',
      })
    }

    // 3. OCR Runs IA
    if (alerts.ocrRunsCount > 0) {
      list.push({
        id: 'ocr-runs',
        title: 'Tareas de OCR con IA',
        description: `Tienes ${alerts.ocrRunsCount} facturas procesadas listas para revisar.`,
        time: 'hace 1 hora',
        icon: 'document_scanner',
        colorClass: 'bg-indigo-50 text-indigo-700',
      })
    }

    // 4. Insight de IA
    if (insights.insight && !insights.insight.includes('No se pudo') && !insights.insight.includes('Bienvenido')) {
      list.push({
        id: 'ai-insight',
        title: 'Insight de IA disponible',
        description: insights.insight.length > 80 ? insights.insight.slice(0, 80) + '...' : insights.insight,
        time: 'hace 2 horas',
        icon: 'auto_awesome',
        colorClass: 'bg-blue-50 text-blue-700',
      })
    }

    // Si no hay notificaciones
    if (list.length === 0) {
      list.push({
        id: 'welcome',
        title: 'Todo al día',
        description: 'No hay alertas ni tareas pendientes en este momento.',
        time: 'Ahora',
        icon: 'verified',
        colorClass: 'bg-emerald-50 text-emerald-700',
      })
    }

    notifications.value = list
    unreadCount.value = list.filter(n => n.id !== 'welcome').length
  } catch (err) {
    console.error('Error fetching notifications:', err)
  } finally {
    isLoading.value = false
  }
}

function handleNotificationClick(notif) {
  showNotifications.value = false
  if (notif.id === 'ocr-runs') {
    emit('navigate', 'dashboard')
    // Dispatch custom event to trigger opening OCR modal in DashboardView
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-ocr-runs-modal'))
    }, 100)
  } else if (notif.id === 'low-stock') {
    emit('navigate', 'inventory')
  } else if (notif.id === 'pending-invoices') {
    emit('navigate', 'billing')
  } else if (notif.id === 'ai-insight') {
    emit('navigate', 'dashboard')
  }
}

function markAllAsRead() {
  unreadCount.value = 0
  emit('notify', { message: 'Notificaciones leídas', detail: 'Se marcaron todas las alertas de la barra superior como leídas.' })
}

watch(() => props.activeTenant, () => {
  fetchNotifications()
}, { deep: true })

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onEsc)
  fetchNotifications()
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onEsc)
})

function userInitials() {
  const name = props.user?.name || 'Usuario'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function tenantInitials(name) {
  if (!name) return 'AC'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const translationStore = useTranslationStore()

function handleLanguageSelect(lang) {
  const code = lang.toLowerCase()
  translationStore.setLanguage(code)
  const langNames = { es: 'Español', en: 'English (US)', pt: 'Português (Brasil)' }
  emit('notify', { message: 'Idioma actualizado', detail: `La interfaz ha sido traducida a ${langNames[code]}.` })
}

const shortcuts = [
  { group: 'Navegación', items: [
    { keys: ['⌘', 'K'], label: 'Búsqueda rápida' },
    { keys: ['⌘', 'J'], label: 'Abrir Asistente IA' },
    { keys: ['Esc'], label: 'Cerrar panel / modal' },
    { keys: ['?'], label: 'Ver atajos de teclado' },
  ]},
  { group: 'Facturación', items: [
    { keys: ['⌘', 'N'], label: 'Nueva factura' },
    { keys: ['⌘', 'F'], label: 'Buscar cliente o producto' },
    { keys: ['⌘', 'Enter'], label: 'Guardar y emitir' },
  ]},
  { group: 'General', items: [
    { keys: ['⌘', 'S'], label: 'Guardar cambios' },
    { keys: ['⌘', 'Z'], label: 'Deshacer' },
    { keys: ['⌘', 'Shift', 'Z'], label: 'Rehacer' },
    { keys: ['⌘', 'P'], label: 'Imprimir / exportar PDF' },
  ]},
]

function handleViewAllAlerts() {
  showNotifications.value = false
  window.dispatchEvent(new CustomEvent('open-alerts-modal'))
}
</script>

<template>
  <div class="sticky top-0 z-30 w-full flex flex-col">
    <!-- Trial Banner -->
    <div
      v-if="showTrialBanner"
      class="bg-amber-50 border-b border-amber-200 text-amber-800 text-[13px] font-medium py-2.5 px-4 text-center flex items-center justify-center gap-2 transition-all duration-300"
    >
      <span class="material-symbols-outlined text-[16px] text-amber-600">warning</span>
      <span>
        Tu trial vence en {{ trialDaysLeft }} {{ trialDaysLeft === 1 ? 'día' : 'días' }} —
        <button 
          @click="emit('navigate', 'plans')" 
          class="underline font-extrabold hover:text-amber-950 focus:outline-none"
        >
          Ver planes
        </button>
      </span>
    </div>

    <header class="topbar h-14 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-4 lg:px-5 gap-3">
    <!-- Hamburger (mobile only) -->
    <button
      @click="emit('toggle-sidebar')"
      class="lg:hidden w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] flex-shrink-0"
    >
      <span class="material-symbols-outlined text-[20px]">menu</span>
    </button>

    <!-- Search -->
    <div class="flex items-center gap-2 flex-1 min-w-0 max-w-[520px] mx-auto">
      <div class="search-container flex items-center gap-2 w-full border border-[#D4D4D8] rounded-[10px] px-3.5 py-2.5 bg-white focus-within:border-[#18181B] transition-colors shadow-sm">
        <span class="material-symbols-outlined text-[17px] text-[#A1A1AA] flex-shrink-0">search</span>
        <input
          placeholder="Buscar..."
          class="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[#18181B] placeholder:text-[#A1A1AA]"
        />
        <kbd class="hidden sm:inline-block text-[10px] font-mono text-[#A1A1AA] border border-[#E4E4E7] rounded px-1.5 py-0.5 bg-white leading-none">⌘K</kbd>
      </div>
    </div>

    <!-- Right cluster -->
    <div class="flex items-center gap-1.5">
      <!-- Notifications -->
      <div class="relative" data-dropdown>
        <button
          @click.stop="showNotifications = !showNotifications; showAvatar = false"
          class="w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors relative"
        >
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#2563EB] border-2 border-white"></span>
        </button>
        <div
          v-if="showNotifications"
          class="fixed sm:absolute inset-x-4 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[360px] bg-white border border-[#E4E4E7] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.18)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="px-4 py-3 border-b border-[#F4F4F5] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">Notificaciones</h3>
              <span v-if="unreadCount > 0" class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">{{ unreadCount }}</span>
            </div>
            <button @click="markAllAsRead" class="text-[11px] font-semibold text-[#71717A] hover:text-[#18181B]">Marcar todo leído</button>
          </div>
          <div class="max-h-[380px] overflow-y-auto">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 text-center">
              <span class="animate-spin w-6 h-6 border-2 border-[#18181B] border-t-transparent rounded-full mb-2"></span>
              <p class="text-[11px] font-medium text-[#71717A]">Cargando...</p>
            </div>
            <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-8 text-center px-4">
              <span class="material-symbols-outlined text-[28px] text-[#A1A1AA] mb-2">notifications_off</span>
              <p class="text-[12px] font-bold text-[#18181B]">Sin alertas nuevas</p>
              <p class="text-[11px] text-[#71717A]">Tu negocio está funcionando perfectamente.</p>
            </div>
            <div v-else>
              <div v-for="notif in notifications" :key="notif.id" 
                class="block px-4 py-3 hover:bg-[#FAFAFA] border-b border-[#F4F4F5] last:border-b-0 cursor-pointer"
                @click="handleNotificationClick(notif)"
              >
                <div class="flex items-start gap-2.5">
                  <div :class="['w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0', notif.colorClass]">
                    <span class="material-symbols-outlined text-[16px]">{{ notif.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[12px] font-semibold text-[#18181B] mb-0.5">{{ notif.title }}</p>
                    <p class="text-[11px] text-[#71717A] leading-snug">{{ notif.description }}</p>
                    <p class="text-[10px] text-[#A1A1AA] mt-1">{{ notif.time }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-4 py-2.5 border-t border-[#F4F4F5] bg-[#FAFAFA] text-right">
            <button @click="handleViewAllAlerts" class="text-[11px] font-semibold text-[#2563EB] hover:underline">Ver todas →</button>
          </div>
        </div>
      </div>

      <!-- Help -->
      <button class="w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors">
        <span class="material-symbols-outlined text-[20px]">help</span>
      </button>

      <div class="w-px h-5 bg-[#E4E4E7] mx-0.5"></div>

      <!-- User avatar + dropdown -->
      <div class="relative" data-dropdown>
        <button
          @click.stop="showAvatar = !showAvatar; showNotifications = false"
          class="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-[8px] hover:bg-[#FAFAFA] transition-colors"
        >
          <div class="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center text-white font-semibold text-[11px] flex-shrink-0">
            {{ userInitials() }}
          </div>
          <div class="text-left hidden lg:block">
            <p class="text-[12px] font-bold text-[#18181B] leading-tight whitespace-nowrap">{{ (user?.name || 'Usuario').split(' ').slice(0,2).map((w,i)=>i===1?w[0]+'.':w).join(' ') }}</p>
            <p class="text-[10px] font-semibold text-[#A1A1AA] leading-tight uppercase tracking-wider">{{ activeMembership?.role || user?.title || 'Administrador' }}</p>
          </div>
          <span class="material-symbols-outlined text-[15px] text-[#A1A1AA]">expand_more</span>
        </button>

        <div
          v-if="showAvatar"
          class="fixed sm:absolute inset-x-4 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[280px] bg-white border border-[#E4E4E7] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.18)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <!-- User info -->
          <div class="px-4 py-3.5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-[#18181B] tracking-tight truncate leading-tight">{{ user?.name || 'Usuario' }}</p>
              <p class="text-[12px] text-[#71717A] truncate leading-snug">{{ user?.email || 'usuario@empresa.com' }}</p>
              <span class="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-[6px]">{{ activeMembership?.role || user?.title || 'Administrador' }}</span>
            </div>
          </div>

          <!-- Workspace activo -->
          <div v-if="activeTenant" class="mx-3 mb-1 px-3 py-2.5 rounded-[10px] bg-[#FAFAFA] border border-[#F4F4F5]">
            <p class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Workspace activo</p>
            <div class="flex items-center gap-2.5 justify-between">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-6 h-6 rounded-[6px] bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {{ tenantInitials(activeTenant?.name) }}
                </div>
                <div class="min-w-0">
                  <p class="text-[13px] font-bold text-[#18181B] truncate leading-none mb-1">{{ activeTenant?.name || 'Andina Cargo SAS' }}</p>
                  <p class="text-[11px] text-[#71717A] leading-none">
                    {{ accessibleTenants?.length > 1 ? `${accessibleTenants.length - 1} workspaces más` : 'Único workspace' }}
                  </p>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">unfold_more</span>
            </div>
          </div>

          <!-- Nav items -->
          <div class="py-1 border-t border-[#F4F4F5] mt-1">
            <button @click="emit('navigate', 'profile'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">person</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Mi perfil</span>
            </button>
            <button @click="emit('navigate', 'two-factor'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">verified_user</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Seguridad y 2FA</span>
            </button>
            <button @click="emit('navigate', 'admin-console'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">settings</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Preferencias</span>
            </button>
            <button v-if="user?.isSystemOwner" @click="emit('open-admin-panel'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-50 text-left border-t border-amber-100/50">
              <span class="material-symbols-outlined text-[17px] text-amber-600 font-bold">shield_person</span>
              <span class="flex-1 text-[12px] font-bold text-amber-800">Consola Super Admin</span>
            </button>
          </div>

          <!-- Theme -->
          <div class="px-4 py-2 border-t border-[#F4F4F5]">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-semibold text-[#71717A]">Tema</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-[#F4F4F5] rounded-[8px]">
              <button
                v-for="t in ['light', 'dark', 'auto']"
                :key="t"
                @click="themeStore.setTheme(t)"
                :class="[
                  'flex-1 py-1 text-[11px] font-semibold rounded-[6px] transition-colors capitalize',
                  themeStore.theme === t ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                ]"
              >{{ t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Auto' }}</button>
            </div>
          </div>

          <!-- Language -->
          <div class="px-4 py-2 border-t border-[#F4F4F5]">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-semibold text-[#71717A]">Idioma</span>
            </div>
            <div class="flex gap-1 p-0.5 bg-[#F4F4F5] rounded-[8px]">
              <button
                v-for="lang in ['ES', 'EN', 'PT']"
                :key="lang"
                @click="handleLanguageSelect(lang)"
                :class="[
                  'flex-1 py-1 text-[11px] font-semibold rounded-[6px] transition-colors',
                  translationStore.currentLanguage === lang.toLowerCase() ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:text-[#18181B]'
                ]"
              >{{ lang }}</button>
            </div>
          </div>

          <!-- Help links -->
          <div class="py-1 border-t border-[#F4F4F5]">
            <button @click="emit('navigate', 'help-center'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">help</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Centro de ayuda</span>
              <span class="material-symbols-outlined text-[14px] text-[#A1A1AA]">chevron_right</span>
            </button>
            <button @click="emit('navigate', 'help-center'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">headset_mic</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Contactar soporte</span>
              <span class="material-symbols-outlined text-[14px] text-[#A1A1AA]">chevron_right</span>
            </button>
            <button @click="showShortcuts = true; showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">keyboard</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Atajos de teclado</span>
              <kbd class="text-[9px] font-mono text-[#A1A1AA] border border-[#E4E4E7] rounded px-1 py-0.5 bg-white">?</kbd>
            </button>
          </div>

          <!-- Logout -->
          <div class="py-1 border-t border-[#F4F4F5]">
            <button @click="emit('logout'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-50 text-left">
              <span class="material-symbols-outlined text-[17px] text-rose-600">logout</span>
              <span class="flex-1 text-[12px] font-semibold text-rose-600">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
  </div>

  <!-- Keyboard Shortcuts Modal -->
  <Teleport to="body">
    <div
      v-if="showShortcuts"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      @click.self="showShortcuts = false"
    >
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showShortcuts = false"></div>
      <div class="relative bg-white rounded-[18px] shadow-[0_8px_60px_rgba(0,0,0,0.18)] w-full max-w-[480px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5]">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[22px] text-[#2563EB]">keyboard</span>
            <h2 class="text-[16px] font-extrabold tracking-tight text-[#18181B]">Atajos de teclado</h2>
          </div>
          <button @click="showShortcuts = false" class="w-7 h-7 rounded-[8px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#A1A1AA] hover:text-[#18181B] transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <!-- Shortcuts list -->
        <div class="overflow-y-auto max-h-[70vh] px-6 py-4 space-y-5">
          <div v-for="group in shortcuts" :key="group.group">
            <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#A1A1AA] mb-2.5">{{ group.group }}</p>
            <div class="space-y-1">
              <div v-for="s in group.items" :key="s.label" class="flex items-center justify-between py-1.5">
                <span class="text-[13px] font-medium text-[#18181B]">{{ s.label }}</span>
                <div class="flex items-center gap-1">
                  <kbd
                    v-for="(k, i) in s.keys"
                    :key="i"
                    class="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 text-[11px] font-mono font-semibold text-[#18181B] bg-[#F4F4F5] border border-[#E4E4E7] rounded-[5px] shadow-[0_1px_0_#D4D4D8]"
                  >{{ k }}</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 border-t border-[#F4F4F5] bg-[#FAFAFA] text-center">
          <p class="text-[11px] text-[#A1A1AA] font-medium">En Mac usa <kbd class="inline-flex items-center px-1 text-[10px] font-mono bg-white border border-[#E4E4E7] rounded">⌘</kbd> · En Windows/Linux usa <kbd class="inline-flex items-center px-1 text-[10px] font-mono bg-white border border-[#E4E4E7] rounded">Ctrl</kbd></p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
