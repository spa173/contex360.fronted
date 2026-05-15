<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['navigate'])

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
</script>

<template>
  <nav :class="['sidebar-nav', { 'desktop-open': isOpen }]">
    <div class="px-6 pb-6 pt-4">
      <!-- Logo Section -->
      <div class="flex items-center gap-3 mb-8">
        <div class="w-8 h-8 rounded bg-[var(--primary-container)] flex items-center justify-center text-[var(--on-primary-container)] font-bold">
          C
        </div>
        <div>
          <h1 class="text-lg font-bold text-white leading-tight">Contex360 ERP</h1>
          <p class="text-[10px] text-slate-400 uppercase tracking-wider">Enterprise Suite</p>
        </div>
      </div>

      <!-- Main Navigation -->
      <div class="space-y-1">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="handleNavigate(item.id)"
          class="nav-item"
        >
          <span class="material-symbols-outlined icon">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- AI Action Button -->
    <div class="mt-auto px-6 mb-6">
      <button 
        @click="handleNavigate('ai')"
        class="ai-action-btn"
      >
        <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
        AI/OCR Analysis
      </button>
    </div>

    <!-- Bottom Settings/Help -->
    <div class="px-6 border-t border-white/5 pt-4 pb-2 space-y-1">
      <button @click="handleNavigate('profile')" class="bottom-nav-item">
        <span class="material-symbols-outlined icon">settings</span>
        Settings
      </button>
      <button @click="handleNavigate('about')" class="bottom-nav-item">
        <span class="material-symbols-outlined icon">help</span>
        Help
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
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  z-index: 150;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.3);
}

.desktop-open {
  transform: translateX(0);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: rgba(218, 226, 253, 0.7);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  text-align: left;
}

.nav-item:hover {
  background-color: rgba(218, 226, 253, 0.1);
  color: #dae2fd;
}

.nav-item .icon {
  font-size: 20px;
  opacity: 0.7;
}

.ai-action-btn {
  width: 100%;
  background-color: #8455ef;
  color: #fffbff;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
}

.ai-action-btn:hover {
  background-color: #6b38d4;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

.bottom-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: rgba(218, 226, 253, 0.7);
  font-size: 14px;
  transition: all 0.15s ease;
  text-align: left;
}

.bottom-nav-item:hover {
  background-color: rgba(218, 226, 253, 0.1);
  color: #dae2fd;
}

.bottom-nav-item .icon {
  font-size: 20px;
  opacity: 0.7;
}
</style>
