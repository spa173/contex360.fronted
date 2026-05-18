<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../../stores/themeStore'
import { useTranslationStore } from '../../stores/translationStore'

const props = defineProps(['activeTenant', 'accessibleTenants', 'user', 'activeView', 'activeMembership', 'sidebarOpen', 'canSwitchTenant'])
const emit = defineEmits(['logout', 'toggle-sidebar', 'navigate', 'open-admin-panel', 'notify'])

const themeStore = useThemeStore()
const showNotifications = ref(false)
const showAvatar = ref(false)

function closeAll() {
  showNotifications.value = false
  showAvatar.value = false
}

function onClickOutside(e) {
  if (!e.target.closest('[data-dropdown]')) closeAll()
}
function onEsc(e) {
  if (e.key === 'Escape') closeAll()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onEsc)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onEsc)
})

function userInitials() {
  const name = props.user?.name || 'Daniel Castro'
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

function handleHelpLink(title) {
  emit('notify', { message: title, detail: `Abriendo portal de asistencia para ${title.toLowerCase()}...` })
}

function handleViewAllAlerts() {
  showNotifications.value = false
  window.dispatchEvent(new CustomEvent('open-alerts-modal'))
}
</script>

<template>
  <header class="h-14 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-4 lg:px-5 sticky top-0 z-30 gap-3">
    <!-- Hamburger (mobile only) -->
    <button
      @click="emit('toggle-sidebar')"
      class="lg:hidden w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] flex-shrink-0"
    >
      <span class="material-symbols-outlined text-[20px]">menu</span>
    </button>

    <!-- Search -->
    <div class="flex items-center gap-2 flex-1 min-w-0 max-w-[520px] mx-auto">
      <div class="flex items-center gap-2 w-full border border-[#D4D4D8] rounded-[10px] px-3.5 py-2.5 bg-white focus-within:border-[#18181B] transition-colors shadow-sm">
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
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2563EB] border-2 border-white"></span>
        </button>
        <div
          v-if="showNotifications"
          class="fixed sm:absolute inset-x-4 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[360px] bg-white border border-[#E4E4E7] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.18)] overflow-hidden z-50"
        >
          <div class="px-4 py-3 border-b border-[#F4F4F5] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-[13px] font-bold tracking-tight text-[#18181B]">Notificaciones</h3>
              <span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">3</span>
            </div>
            <button class="text-[11px] font-semibold text-[#71717A] hover:text-[#18181B]">Marcar todo leído</button>
          </div>
          <div class="max-h-[380px] overflow-y-auto">
            <a href="#" class="block px-4 py-3 hover:bg-[#FAFAFA] border-b border-[#F4F4F5]">
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-[8px] bg-rose-50 flex items-center justify-center text-rose-700 flex-shrink-0">
                  <span class="material-symbols-outlined text-[16px]">error</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-semibold text-[#18181B] mb-0.5">Factura rechazada por DIAN</p>
                  <p class="text-[11px] text-[#71717A] leading-snug">Requiere corrección antes de reenvío.</p>
                  <p class="text-[10px] text-[#A1A1AA] mt-1">hace 12 min</p>
                </div>
              </div>
            </a>
            <a href="#" class="block px-4 py-3 hover:bg-[#FAFAFA] border-b border-[#F4F4F5]">
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-[8px] bg-amber-50 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <span class="material-symbols-outlined text-[16px]">inventory_2</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-semibold text-[#18181B] mb-0.5">Stock crítico</p>
                  <p class="text-[11px] text-[#71717A] leading-snug">3 productos llegaron a 0 unidades.</p>
                  <p class="text-[10px] text-[#A1A1AA] mt-1">hace 1 hora</p>
                </div>
              </div>
            </a>
            <a href="#" class="block px-4 py-3 hover:bg-[#FAFAFA]">
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-[8px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                  <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[12px] font-semibold text-[#18181B] mb-0.5">Insight de IA disponible</p>
                  <p class="text-[11px] text-[#71717A] leading-snug">Tus ventas crecieron 15% esta semana.</p>
                  <p class="text-[10px] text-[#A1A1AA] mt-1">hace 2 horas</p>
                </div>
              </div>
            </a>
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
            <p class="text-[12px] font-bold text-[#18181B] leading-tight whitespace-nowrap">{{ (user?.name || 'Daniel Castro').split(' ').slice(0,2).map((w,i)=>i===1?w[0]+'.':w).join(' ') }}</p>
            <p class="text-[10px] font-semibold text-[#A1A1AA] leading-tight uppercase tracking-wider">{{ user?.role || user?.title || 'Administrador' }}</p>
          </div>
          <span class="material-symbols-outlined text-[15px] text-[#A1A1AA]">expand_more</span>
        </button>

        <div
          v-if="showAvatar"
          class="fixed sm:absolute inset-x-4 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-[280px] bg-white border border-[#E4E4E7] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.18)] overflow-hidden z-50"
        >
          <!-- User info -->
          <div class="px-4 py-3.5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-[#18181B] tracking-tight truncate leading-tight">{{ user?.name || 'Daniel Castro' }}</p>
              <p class="text-[12px] text-[#71717A] truncate leading-snug">{{ user?.email || 'daniel.castro@contex360.com' }}</p>
              <span class="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-[6px]">{{ user?.role || 'Administrador' }}</span>
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
                  <p class="text-[11px] text-[#71717A] leading-none">5 workspaces más</p>
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
                @click="t !== 'auto' && themeStore.setTheme(t)"
                :class="[
                  'flex-1 py-1 text-[11px] font-semibold rounded-[6px] transition-colors capitalize',
                  (t === 'auto' ? false : themeStore.theme === t) ? 'bg-white text-[#18181B] shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
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
            <button @click="handleHelpLink('Centro de ayuda')" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">help</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Centro de ayuda</span>
              <span class="material-symbols-outlined text-[14px] text-[#A1A1AA]">chevron_right</span>
            </button>
            <button @click="handleHelpLink('Contactar soporte')" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[17px] text-[#71717A]">headset_mic</span>
              <span class="flex-1 text-[12px] font-medium text-[#18181B]">Contactar soporte</span>
              <span class="material-symbols-outlined text-[14px] text-[#A1A1AA]">chevron_right</span>
            </button>
            <button @click="handleHelpLink('Atajos de teclado')" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
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
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
</style>
