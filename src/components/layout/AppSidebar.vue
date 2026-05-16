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

const emit = defineEmits(['navigate', 'tenant-change'])
const translationStore = useTranslationStore()

const menuItems = [
  { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
  { id: 'billing', label: 'Sales & Billing', icon: 'receipt_long' },
  { id: 'purchases', label: 'Purchases', icon: 'shopping_cart' },
  { id: 'quotes', label: 'Quotations', icon: 'request_quote' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
  { id: 'accounting', label: 'Accounting', icon: 'account_balance' },
  { id: 'treasury', label: 'Treasury', icon: 'payments' },
  { id: 'third-parties', label: 'Contacts', icon: 'groups' },
  { id: 'users', label: 'Team', icon: 'manage_accounts' },
  { id: 'reports', label: 'Analytics', icon: 'bar_chart' },
  { id: 'admin-console', label: 'System Admin', icon: 'settings_applications' },
]

function handleNavigate(id) {
  emit('navigate', id)
}

function handleTenantChange(e) {
  emit('tenant-change', e.target.value)
}

function handleLanguageChange(e) {
  const targetLang = e.target.value
  
  // Collect all static texts in the sidebar to translate
  const textsToTranslate = {
    'Overview': 'Resumen',
    'Sales & Billing': 'Ventas y Facturación',
    'Purchases': 'Compras',
    'Quotations': 'Cotizaciones',
    'Inventory': 'Inventario',
    'Accounting': 'Contabilidad',
    'Treasury': 'Tesorería',
    'Contacts': 'Contactos',
    'Team': 'Equipo',
    'Analytics': 'Analítica',
    'System Admin': 'Admin Sistema',
    'IA Executive Assistant': 'Asistente IA Ejecutivo',
    'Preferences': 'Preferencias',
    'Support': 'Soporte',
    'Active Organization': 'Organización Activa',
    'Display Language': 'Idioma de Pantalla',
    'Enterprise Suite': 'Suite Empresarial'
  }
  
  translationStore.setLanguage(targetLang, textsToTranslate)
}
</script>

<template>
  <nav :class="['sidebar-nav', { 'desktop-open': isOpen }]">
    <!-- Header Section: Logo & Tenant Selector -->
    <div class="px-6 py-8 border-b border-white/5">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 rounded-lg bg-[#8455ef] flex items-center justify-center text-white font-black text-xl shadow-lg">
          C
        </div>
        <div>
          <h1 class="text-base font-bold text-white leading-tight tracking-tight">Contex360</h1>
          <p class="text-[10px] text-white/50 uppercase font-semibold tracking-widest">{{ translationStore.t('Enterprise Suite', 'Enterprise Suite') }}</p>
        </div>
      </div>

      <!-- Multi-company selector -->
      <div class="relative group mb-6">
        <label class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">{{ translationStore.t('Active Organization', 'Active Organization') }}</label>
        <div class="relative">
          <select 
            @change="handleTenantChange"
            :value="activeTenant?.id"
            class="tenant-select"
          >
            <option v-for="tenant in accessibleTenants" :key="tenant.id" :value="tenant.id">
              {{ tenant.name }}
            </option>
          </select>
          <span class="material-symbols-outlined select-arrow">expand_more</span>
        </div>
      </div>

      <!-- Language selector -->
      <div class="relative group">
        <label class="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2 block">{{ translationStore.t('Display Language', 'Display Language') }}</label>
        <div class="relative">
          <select 
            @change="handleLanguageChange"
            :value="translationStore.currentLanguage"
            class="tenant-select"
            :disabled="translationStore.isTranslating"
          >
            <option v-for="lang in translationStore.availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }} {{ translationStore.isTranslating && translationStore.currentLanguage === lang.code ? '...' : '' }}
            </option>
          </select>
          <span class="material-symbols-outlined select-arrow">language</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <div class="flex-1 px-4 py-6 overflow-y-auto space-y-1">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="handleNavigate(item.id)"
        :class="['nav-item', { 'active': activeView === item.id }]"
      >
        <span class="material-symbols-outlined icon">{{ item.icon }}</span>
        {{ translationStore.t(item.label, item.label) }}
      </button>
    </div>

    <!-- AI Action Button -->
    <div class="px-4 py-4">
      <button 
        @click="handleNavigate('ai')"
        class="ai-action-btn"
      >
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        {{ translationStore.t('AI/OCR Analysis', 'AI/OCR Analysis') }}
      </button>
    </div>

    <!-- Bottom Settings/Help -->
    <div class="px-4 py-4 border-t border-white/5 space-y-1">
      <button 
        @click="handleNavigate('profile')" 
        :class="['bottom-nav-item', { 'active': activeView === 'profile' }]"
      >
        <span class="material-symbols-outlined icon">settings</span>
        {{ translationStore.t('Preferences', 'Preferences') }}
      </button>
      <button @click="handleNavigate('help')" class="bottom-nav-item">
        <span class="material-symbols-outlined icon">help</span>
        {{ translationStore.t('Support', 'Support') }}
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
  z-index: 150;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.desktop-open {
  transform: translateX(0);
}

.tenant-select {
  appearance: none;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  padding-right: 32px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
}

.tenant-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.tenant-select option {
  background: #0F172A;
  color: white;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
  border-left: 4px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-item.active {
  background-color: rgba(132, 85, 239, 0.1);
  color: #06B6D4;
  font-weight: 600;
  border-left-color: #06B6D4;
}

.nav-item .icon {
  font-size: 20px;
  opacity: 0.8;
}

.ai-action-btn {
  width: 100%;
  background-color: #8455ef;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
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

.bottom-nav-item:hover, .bottom-nav-item.active {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.bottom-nav-item .icon {
  font-size: 18px;
}
</style>
