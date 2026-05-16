<script setup>
import { ref, onMounted } from 'vue'
import { businessApi } from '../../services/businessApi'

const emit = defineEmits(['tenant-change', 'logout', 'toggle-sidebar', 'open-admin-panel', 'toggle-theme', 'navigate'])
const props = defineProps(['activeTenant', 'accessibleTenants', 'user'])

const aiHealth = ref({ status: 'loading', latency: '...', tokens: '...' })
const currentYear = ref(new Date().getFullYear())

async function checkAiHealth() {
  try {
    const start = Date.now()
    const health = await businessApi.getAiHealth()
    const end = Date.now()
    aiHealth.value = {
      status: health.status === 'ok' ? 'active' : 'error',
      latency: `${end - start}ms`,
      tokens: '1.2k'
    }
  } catch (err) {
    aiHealth.value = { status: 'error', latency: 'N/A', tokens: '0' }
  }
}

onMounted(() => {
  checkAiHealth()
  setInterval(checkAiHealth, 120000)
})

function handleTenantChange(tenantId) {
  emit('tenant-change', tenantId)
}
</script>

<template>
  <header class="top-nav">
    <div class="nav-wrapper">
      <!-- Far Left: AI Status -->
      <div class="status-pill">
        <div class="pulse-ring">
          <span :class="aiHealth.status === 'active' ? 'bg-[#10B981]' : 'bg-[#F43F5E]'" class="pulse-dot"></span>
        </div>
        <span class="status-text">{{ aiHealth.status === 'active' ? 'Sistema activo' : 'IA Offline' }}</span>
      </div>

      <div class="divider"></div>

      <!-- Company Selector -->
      <div class="pill-selector group" @click="handleTenantChange(activeTenant?.id)">
        <span class="pill-label">{{ activeTenant?.name || 'Seleccionar Empresa' }}</span>
        <span class="material-symbols-outlined text-[16px]">expand_more</span>
      </div>

      <!-- Search Bar -->
      <div class="search-pill">
        <span class="material-symbols-outlined text-[18px] opacity-60">search</span>
        <span class="search-placeholder">Buscar...</span>
        <div class="search-shortcut">⌘K</div>
      </div>

      <!-- Year Selector -->
      <div class="pill-selector">
        <span class="material-symbols-outlined text-[16px] opacity-60">calendar_today</span>
        <span class="pill-label">{{ currentYear }}</span>
        <span class="material-symbols-outlined text-[16px]">expand_more</span>
      </div>

      <div class="divider"></div>

      <!-- Currency Indicator -->
      <div class="currency-pill">
        <span class="currency-symbol">$</span>
        <span class="currency-code">COP</span>
      </div>

      <div class="divider"></div>

      <!-- Right Actions -->
      <div class="right-actions">
        <button class="action-btn">
          <span class="material-symbols-outlined">notifications</span>
          <div class="notification-badge"></div>
        </button>
        <button class="action-btn">
          <span class="material-symbols-outlined">settings</span>
        </button>
        
        <div class="user-pill" @click="emit('navigate', 'profile')">
          <div class="avatar-circle">CD</div>
          <span class="material-symbols-outlined text-[16px]">expand_more</span>
        </div>
        
        <button @click="emit('logout')" class="logout-pill" title="Cerrar Sesión">
          <span class="material-symbols-outlined">logout</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-nav {
  height: 60px;
  background-color: #111111; /* Ultra dark background as in image */
  position: fixed;
  top: 10px; /* Floating effect */
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-width: 1400px;
  z-index: 1000;
  border-radius: 100px; /* Pill shape */
  border: 1px solid #333333;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.nav-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Status Pill */
.status-pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(132, 85, 239, 0.05); /* Muted Purple Background */
  border: 1px solid rgba(132, 85, 239, 0.2); /* Purple Border */
  border-radius: 9999px;
  color: #E2E8F0; /* Light Gray text instead of Cyan */
}

.pulse-ring {
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); /* Standard Emerald for 'active' */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.status-text {
  font-size: 13px;
  font-weight: 600;
  color: #10B981; /* Soft Emerald for the text 'Sistema activo' */
}

/* Divider */
.divider {
  width: 1px;
  height: 24px;
  background-color: #333333;
  margin: 0 0.25rem;
}

/* Common Pill Styles */
.pill-selector, .search-pill, .currency-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #333333;
  border-radius: 9999px;
  color: #E2E8F0;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pill-selector:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: #444444;
}

.pill-label {
  font-size: 13px;
  font-weight: 500;
}

/* Search Pill */
.search-pill {
  flex: 1; /* Grow to fill space */
  max-width: 300px;
  justify-content: space-between;
  cursor: text;
}

.search-placeholder {
  font-size: 13px;
  color: #64748B;
}

.search-shortcut {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #333333;
}

/* Currency Pill */
.currency-pill {
  border-color: rgba(245, 158, 11, 0.2);
  color: #F59E0B;
}

.currency-symbol {
  font-weight: 700;
  opacity: 0.7;
}

.currency-code {
  font-size: 12px;
  font-weight: 700;
}

/* Right Actions */
.right-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94A3B8;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #FFFFFF;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  background: #F43F5E;
  border-radius: 50%;
  border: 2px solid #111111;
}

/* User Pill */
.user-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 8px 4px 4px;
  background: rgba(132, 85, 239, 0.1);
  border: 1px solid rgba(132, 85, 239, 0.2);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-pill:hover {
  background: rgba(132, 85, 239, 0.15);
}

.avatar-circle {
  width: 28px;
  height: 28px;
  background: #8455ef;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.logout-pill {
  color: #64748B;
  padding: 0.5rem;
  transition: color 0.2s;
}

.logout-pill:hover {
  color: #F43F5E;
}

/* Mobile Adjustments */
@media (max-width: 1024px) {
  .search-pill, .currency-pill, .divider:nth-of-type(3) {
    display: none;
  }
}
</style>
