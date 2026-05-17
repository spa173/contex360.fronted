<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '../../stores/themeStore'
import { useTranslationStore } from '../../stores/translationStore'

const props = defineProps(['activeTenant', 'accessibleTenants', 'user', 'activeView', 'activeMembership', 'sidebarOpen', 'canSwitchTenant'])
const emit = defineEmits(['logout', 'toggle-sidebar', 'navigate', 'open-admin-panel'])

const themeStore = useThemeStore()
const translationStore = useTranslationStore()

const showNotifications = ref(false)
const showAvatar = ref(false)
const currentThemeMode = ref(themeStore.theme || 'light')
const currentLang = computed(() => translationStore.currentLanguage || 'es')

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
  const name = props.user?.name || 'Usuario'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function tenantInitials(name) {
  if (!name) return 'AC'
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function setThemeMode(mode) {
  currentThemeMode.value = mode
  if (mode === 'light' || mode === 'dark') {
    themeStore.setTheme(mode)
  }
}

function setLang(lang) {
  translationStore.setLanguage(lang, {})
}

function openSupportModal(modalType) {
  // Placeholder para modales de soporte/ayuda
}
</script>

<template>
  <header class="h-16 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 gap-2">
    <!-- Hamburger (mobile) -->
    <button
      @click="emit('toggle-sidebar')"
      class="lg:hidden w-9 h-9 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] flex-shrink-0"
    >
      <span class="material-symbols-outlined text-[22px]">menu</span>
    </button>

    <!-- Search -->
    <div class="flex items-center gap-3 flex-1 min-w-0 max-w-md">
      <div class="flex items-center gap-2.5 w-full border border-[#E4E4E7] rounded-[10px] px-3 py-2 bg-[#FAFAFA] focus-within:bg-white focus-within:border-[#18181B] transition-colors">
        <span class="material-symbols-outlined text-[18px] text-[#A1A1AA] flex-shrink-0">search</span>
        <input
          placeholder="Buscar..."
          class="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[#18181B] placeholder:text-[#A1A1AA]"
        />
        <kbd class="hidden sm:inline-block text-[10px] font-mono text-[#A1A1AA] border border-[#E4E4E7] rounded px-1.5 py-0.5 bg-white">⌘K</kbd>
      </div>
    </div>

    <!-- Right cluster -->
    <div class="flex items-center gap-2">
      <!-- Notifications -->
      <div class="relative" data-dropdown>
        <button
          @click.stop="showNotifications = !showNotifications; showAvatar = false"
          class="w-9 h-9 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors relative"
        >
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB] border-2 border-white"></span>
        </button>
        <div
          v-if="showNotifications"
          class="fixed sm:absolute inset-x-4 top-20 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] bg-white border border-[#E4E4E7] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.18)] overflow-hidden z-50"
        >
          <div class="px-5 py-3.5 border-b border-[#F4F4F5] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-[14px] font-bold tracking-tight text-[#18181B]">Notificaciones</h3>
              <span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold">3</span>
            </div>
            <button class="text-[11px] font-semibold text-[#71717A] hover:text-[#18181B]">Marcar todo leído</button>
          </div>
          <div class="max-h-[420px] overflow-y-auto">
            <a href="#" class="block px-5 py-3.5 hover:bg-[#FAFAFA] border-b border-[#F4F4F5]">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-[8px] bg-rose-50 flex items-center justify-center text-rose-700 flex-shrink-0">
                  <span class="material-symbols-outlined text-[18px]">error</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-semibold text-[#18181B] mb-0.5">Factura rechazada por DIAN</p>
                  <p class="text-[11px] text-[#71717A] leading-snug">Requiere corrección antes de reenvío.</p>
                  <p class="text-[10px] text-[#A1A1AA] mt-1.5">hace 12 min</p>
                </div>
              </div>
            </a>
            <a href="#" class="block px-5 py-3.5 hover:bg-[#FAFAFA] border-b border-[#F4F4F5]">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-[8px] bg-amber-50 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <span class="material-symbols-outlined text-[18px]">inventory_2</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-semibold text-[#18181B] mb-0.5">Stock crítico</p>
                  <p class="text-[11px] text-[#71717A] leading-snug">3 productos llegaron a 0 unidades.</p>
                  <p class="text-[10px] text-[#A1A1AA] mt-1.5">hace 1 hora</p>
                </div>
              </div>
            </a>
            <a href="#" class="block px-5 py-3.5 hover:bg-[#FAFAFA]">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-[8px] bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                  <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-semibold text-[#18181B] mb-0.5">Insight de IA disponible</p>
                  <p class="text-[11px] text-[#71717A] leading-snug">Tus ventas crecieron 15% esta semana.</p>
                  <p class="text-[10px] text-[#A1A1AA] mt-1.5">hace 2 horas</p>
                </div>
              </div>
            </a>
          </div>
          <div class="px-5 py-3 border-t border-[#F4F4F5] bg-[#FAFAFA] text-right">
            <button class="text-[12px] font-semibold text-[#2563EB] hover:underline">Ver todas →</button>
          </div>
        </div>
      </div>

      <!-- Help -->
      <button
        class="w-9 h-9 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors"
      >
        <span class="material-symbols-outlined text-[20px]">help</span>
      </button>

      <div class="w-px h-6 bg-[#E4E4E7] mx-1"></div>

      <!-- Avatar -->
      <div class="relative" data-dropdown>
        <button
          @click.stop="showAvatar = !showAvatar; showNotifications = false"
          class="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-[8px] hover:bg-[#FAFAFA] transition-colors"
        >
          <div class="w-7 h-7 rounded-full bg-[#18181B] flex items-center justify-center text-white font-semibold text-[11px]">
            {{ userInitials() }}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-[12px] font-semibold text-[#18181B] leading-tight">{{ props.user?.name || 'Daniel Castro' }}</p>
            <p class="text-[10px] text-[#A1A1AA] leading-tight">{{ props.user?.title || 'Admin' }}</p>
          </div>
          <span class="material-symbols-outlined text-[16px] text-[#A1A1AA]">expand_more</span>
        </button>

        <div
          v-if="showAvatar"
          class="fixed sm:absolute inset-x-4 top-20 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[280px] bg-white border border-[#E4E4E7] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.18)] overflow-hidden z-50"
        >
          <!-- User card -->
          <div class="px-4 py-4 border-b border-[#F4F4F5] flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[15px]">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-[#18181B] tracking-tight truncate">{{ props.user?.name || 'Daniel Castro' }}</p>
              <p class="text-[11px] text-[#71717A] truncate">{{ props.user?.email || 'daniel@contex360.com' }}</p>
              <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#2563EB]/10 text-[#2563EB] text-[10px] font-semibold uppercase tracking-wider mt-1.5">
                {{ props.activeMembership?.role || 'Administrador' }}
              </span>
            </div>
          </div>

          <!-- Workspace -->
          <div class="px-2 pt-2 pb-1">
            <p class="px-2 pb-1 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Workspace activo</p>
            <button class="w-full flex items-center gap-2.5 px-2 py-2 rounded-[8px] hover:bg-[#FAFAFA] transition-colors text-left">
              <div class="w-7 h-7 rounded-md bg-[#2563EB] text-white flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                {{ tenantInitials(props.activeTenant?.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[12px] font-semibold text-[#18181B] truncate">{{ props.activeTenant?.name || 'Andina Cargo SAS' }}</p>
                <p class="text-[10px] text-[#A1A1AA] truncate">{{ props.accessibleTenants?.length > 1 ? (props.accessibleTenants.length - 1) + ' workspaces más' : '2 workspaces más' }}</p>
              </div>
              <span class="material-symbols-outlined text-[16px] text-[#A1A1AA] flex-shrink-0">unfold_more</span>
            </button>
          </div>

          <!-- Menu items -->
          <div class="py-1 border-t border-[#F4F4F5]">
            <button @click="emit('navigate', 'profile'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[18px] text-[#71717A]">person</span>
              <span class="flex-1 text-[13px] font-medium text-[#18181B]">Mi perfil</span>
            </button>
            <button @click="emit('navigate', 'two-factor'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[18px] text-[#71717A]">verified_user</span>
              <span class="flex-1 text-[13px] font-medium text-[#18181B]">Seguridad y 2FA</span>
            </button>
            <button @click="emit('navigate', 'admin-console'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[18px] text-[#71717A]">settings</span>
              <span class="flex-1 text-[13px] font-medium text-[#18181B]">Preferencias</span>
            </button>
          </div>

          <!-- Theme picker -->
          <div class="py-2 px-3 border-t border-[#F4F4F5]">
            <div class="flex items-center gap-2.5 px-1 py-1">
              <span class="material-symbols-outlined text-[16px] text-[#71717A]">palette</span>
              <span class="text-[12px] font-semibold text-[#18181B]">Tema</span>
            </div>
            <div class="flex gap-1 mt-1 p-1 rounded-[8px] bg-[#FAFAFA]">
              <button
                @click="setThemeMode('light')"
                :class="['flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all', currentThemeMode === 'light' ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:bg-white']"
              >
                <span class="material-symbols-outlined text-[14px]">light_mode</span>Claro
              </button>
              <button
                @click="setThemeMode('dark')"
                :class="['flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all', currentThemeMode === 'dark' ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:bg-white']"
              >
                <span class="material-symbols-outlined text-[14px]">dark_mode</span>Oscuro
              </button>
              <button
                @click="setThemeMode('auto')"
                :class="['flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all', currentThemeMode === 'auto' ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:bg-white']"
              >
                <span class="material-symbols-outlined text-[14px]">contrast</span>Auto
              </button>
            </div>
          </div>

          <!-- Language picker -->
          <div class="py-2 px-3 border-t border-[#F4F4F5]">
            <div class="flex items-center gap-2.5 px-1 py-1">
              <span class="material-symbols-outlined text-[16px] text-[#71717A]">language</span>
              <span class="text-[12px] font-semibold text-[#18181B]">Idioma</span>
            </div>
            <div class="flex gap-1 mt-1 p-1 rounded-[8px] bg-[#FAFAFA]">
              <button
                @click="setLang('es')"
                :class="['flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all', currentLang === 'es' ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:bg-white']"
              >
                ES
              </button>
              <button
                @click="setLang('en')"
                :class="['flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all', currentLang === 'en' ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:bg-white']"
              >
                EN
              </button>
              <button
                @click="setLang('pt')"
                :class="['flex-1 py-1.5 rounded-[6px] text-[11px] font-semibold transition-all', currentLang === 'pt' ? 'bg-white text-[#18181B] shadow-sm font-bold' : 'text-[#71717A] hover:bg-white']"
              >
                PT
              </button>
            </div>
          </div>

          <!-- Support & Shortcuts -->
          <div class="py-1 border-t border-[#F4F4F5]">
            <button @click="openSupportModal('help'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[18px] text-[#71717A]">help</span>
              <span class="flex-1 text-[13px] font-medium text-[#18181B]">Centro de ayuda</span>
              <span class="material-symbols-outlined text-[14px] text-[#A1A1AA]">chevron_right</span>
            </button>
            <button @click="openSupportModal('support'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[18px] text-[#71717A]">chat</span>
              <span class="flex-1 text-[13px] font-medium text-[#18181B]">Contactar soporte</span>
              <span class="material-symbols-outlined text-[14px] text-[#A1A1AA]">chevron_right</span>
            </button>
            <button @click="openSupportModal('shortcuts'); showAvatar = false" class="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#FAFAFA] text-left">
              <span class="material-symbols-outlined text-[18px] text-[#71717A]">keyboard</span>
              <span class="flex-1 text-[13px] font-medium text-[#18181B]">Atajos de teclado</span>
              <kbd class="text-[10px] font-mono text-[#A1A1AA] border border-[#E4E4E7] rounded px-1.5 py-0.5 bg-[#FAFAFA]">?</kbd>
            </button>
          </div>

          <!-- Logout -->
          <div class="py-1 border-t border-[#F4F4F5]">
            <button @click="emit('logout')" class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-left text-rose-700">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              <span class="flex-1 text-[13px] font-semibold">Cerrar sesión</span>
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
