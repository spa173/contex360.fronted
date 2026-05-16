<script setup>
import { computed } from 'vue'
import { useTranslationStore } from '../../stores/translationStore'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  activeTenant: Object,
  accessibleTenants: Array,
  activeView: String,
})

const emit = defineEmits(['navigate', 'tenant-change', 'hover-start', 'hover-end'])
const translationStore = useTranslationStore()

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'billing', label: 'Facturación', icon: 'receipt_long' },
  { id: 'purchases', label: 'Compras', icon: 'shopping_cart' },
  { id: 'quotes', label: 'Cotizaciones', icon: 'request_quote' },
  { id: 'inventory', label: 'Inventario', icon: 'inventory_2' },
  { id: 'accounting', label: 'Contabilidad', icon: 'account_balance' },
  { id: 'treasury', label: 'Tesorería', icon: 'payments' },
  { id: 'third-parties', label: 'Terceros', icon: 'groups' },
  { id: 'users', label: 'Usuarios', icon: 'manage_accounts' },
  { id: 'reports', label: 'Reportes', icon: 'bar_chart' },
  { id: 'admin-console', label: 'Consola Admin', icon: 'settings_applications' },
]

function handleNavigate(id) {
  emit('navigate', id)
}

function handleTenantChange(e) {
  emit('tenant-change', e.target.value)
}

function handleLanguageChange(e) {
  const targetLang = e.target.value
  
  const textsToTranslate = {
    'Dashboard': 'Dashboard',
    'Facturación': 'Facturación',
    'Compras': 'Compras',
    'Cotizaciones': 'Cotizaciones',
    'Inventario': 'Inventario',
    'Contabilidad': 'Contabilidad',
    'Tesorería': 'Tesorería',
    'Terceros': 'Terceros',
    'Usuarios': 'Usuarios',
    'Reportes': 'Reportes',
    'Consola Admin': 'Consola Admin',
    'AI/OCR Analysis': 'AI/OCR Analysis',
    'Settings': 'Settings',
    'Help': 'Help',
    'Enterprise Suite': 'Enterprise Suite'
  }
  
  translationStore.setLanguage(targetLang, textsToTranslate)
}
</script>

<template>
  <nav 
    :class="['sidebar-nav', { 'desktop-open': isOpen }]"
    @mouseenter="emit('hover-start')"
    @mouseleave="emit('hover-end')"
  >
    <!-- Header Section -->
    <div class="px-6 py-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded bg-[#8455ef] flex items-center justify-center text-white font-bold text-lg">
          C
        </div>
        <div>
          <h1 class="text-[15px] font-bold text-white leading-tight tracking-tight">Contex360 ERP</h1>
          <p class="text-[9px] text-white/40 uppercase font-bold tracking-[0.1em]">{{ translationStore.t('Enterprise Suite', 'ENTERPRISE SUITE') }}</p>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <div class="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="handleNavigate(item.id)"
        :class="['nav-item', { 'active': activeView === item.id }]"
      >
        <span class="material-symbols-outlined icon text-[20px]">{{ item.icon }}</span>
        <span class="label">{{ translationStore.t(item.label, item.label) }}</span>
      </button>
    </div>

    <!-- AI Action Button -->
    <div class="px-4 py-6">
      <button 
        @click="handleNavigate('ai')"
        class="ai-action-btn"
      >
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        {{ translationStore.t('AI/OCR Analysis', 'AI/OCR Analysis') }}
      </button>
    </div>

    <!-- Bottom Settings/Help -->
    <div class="px-4 py-4 border-t border-white/5 bg-[#0F172A]">
      <button 
        @click="handleNavigate('profile')" 
        :class="['bottom-nav-item', { 'active': activeView === 'profile' }]"
      >
        <span class="material-symbols-outlined icon">settings</span>
        {{ translationStore.t('Settings', 'Settings') }}
      </button>
      <button @click="handleNavigate('help')" class="bottom-nav-item">
        <span class="material-symbols-outlined icon">help</span>
        {{ translationStore.t('Help', 'Help') }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 260px;
  background-color: #0F172A;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  z-index: 200; /* Above topnav */
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 20px 0 50px rgba(0, 0, 0, 0.3);
}

.desktop-open {
  transform: translateX(0);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
  position: relative;
}

.nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(132, 85, 239, 0.15) 0%, rgba(132, 85, 239, 0.05) 100%);
  color: #06B6D4;
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  background-color: #06B6D4;
  border-radius: 0 4px 4px 0;
}

.nav-item .icon {
  opacity: 0.8;
}

.ai-action-btn {
  width: 100%;
  background-color: #8455ef;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.ai-action-btn:hover {
  background-color: #7c3aed;
  transform: translateY(-1px);
}

.bottom-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
}

.bottom-nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}

.bottom-nav-item .icon {
  font-size: 18px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
