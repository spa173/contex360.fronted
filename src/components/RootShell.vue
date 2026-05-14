<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStateStore } from '../stores/stateStore'
import RootDashboardView from './root/RootDashboardView.vue'
import CompaniesView from './root/CompaniesView.vue'
import TenantSettingsView from './root/TenantSettingsView.vue'
import DemoRequestsView from './root/DemoRequestsView.vue'

const store = useStateStore()
const activeSection = ref('dashboard')
const selectedTenantId = ref<string | null>(null)

function handleConfigure(tenantId: string) {
  selectedTenantId.value = tenantId
  activeSection.value = 'tenant-settings'
}

function backToCompanies() {
  selectedTenantId.value = null
  activeSection.value = 'companies'
}

const emit = defineEmits(['enter-erp'])

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'companies', label: 'Empresas', icon: '🏢' },
  { id: 'leads', label: 'Leads / Demos', icon: '📋' },
]

const userInitials = computed(() => {
  const name = store.currentUser?.name || 'R'
  return name.split(' ').slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join('')
})

function handleLogout() {
  store.logout()
}
</script>

<template>
  <div class="root-shell">
    <!-- Sidebar -->
    <aside class="root-sidebar">
      <div class="root-logo">
        <div class="root-logo-mark">Contex360</div>
        <div class="root-logo-sub">Panel Administrador</div>
      </div>

      <nav class="root-nav">
        <div class="nav-section-label">SAAS ADMIN</div>
        <button
          v-for="s in sections"
          :key="s.id"
          :class="['root-nav-item', { active: activeSection === s.id }]"
          @click="activeSection = s.id"
        >
          <span class="nav-icon-emoji">{{ s.icon }}</span>
          {{ s.label }}
        </button>
      </nav>

      <div class="root-sidebar-footer">
        <div class="erp-switch-area">
          <button class="btn-enter-erp" @click="emit('enter-erp')">
            ← Volver al ERP
          </button>
          <div class="erp-hint">Regresar a la vista operativa</div>
        </div>
        <div class="root-user-strip">
          <div class="root-avatar">{{ userInitials }}</div>
          <div class="root-user-info">
            <div class="root-user-name">{{ store.currentUser?.name || 'Root' }}</div>
            <div class="root-user-role">Super Admin</div>
          </div>
          <button class="logout-btn" title="Cerrar sesión" @click="handleLogout">↩</button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="root-main">
      <header class="root-topbar">
        <div class="root-topbar-title">
          <div class="topbar-page-title">
            {{ sections.find(s => s.id === activeSection)?.label || 'Dashboard' }}
          </div>
          <div class="topbar-page-sub">Panel de administración SaaS — Contex360</div>
        </div>
        <div class="root-topbar-right">
          <span class="root-badge">🔑 Root</span>
          <span class="root-badge green">Sistema activo</span>
        </div>
      </header>

      <div class="root-content">
        <RootDashboardView v-if="activeSection === 'dashboard'" />
        <CompaniesView v-else-if="activeSection === 'companies'" @configure="handleConfigure" />
        <TenantSettingsView
          v-else-if="activeSection === 'tenant-settings' && selectedTenantId"
          :tenant-id="selectedTenantId"
          @back="backToCompanies"
        />
        <DemoRequestsView v-else-if="activeSection === 'leads'" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.root-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* ─── Sidebar ─── */
.root-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 0 0;
}

.root-logo { padding: 0 20px 24px; border-bottom: 1px solid var(--border); }
.root-logo-mark { font-size: 1rem; font-weight: 800; color: var(--text); letter-spacing: -0.01em; }
.root-logo-sub { font-size: 0.72rem; color: #3b82f6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

.root-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-section-label { font-size: 0.68rem; color: var(--muted); letter-spacing: 0.08em; font-weight: 600; padding: 8px 8px 4px; text-transform: uppercase; }

.root-nav-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: transparent; border: 1px solid transparent; border-radius: 10px;
  color: var(--muted); cursor: pointer; font-size: 0.875rem; font-weight: 500;
  padding: 10px 12px; text-align: left; transition: all 150ms ease;
}
.root-nav-item:hover, .root-nav-item.active {
  background: rgba(59,130,246,0.1);
  border-color: rgba(59,130,246,0.25);
  color: var(--text);
}
.root-nav-item.active { color: #3b82f6; font-weight: 600; }
.nav-icon-emoji { font-size: 1rem; }

.root-sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.erp-switch-area { text-align: center; }
.btn-enter-erp {
  width: 100%; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3);
  border-radius: 10px; color: #3b82f6; cursor: pointer; font-size: 0.82rem;
  font-weight: 600; padding: 9px 12px; transition: background 150ms;
}
.btn-enter-erp:hover { background: rgba(59,130,246,0.2); }
.erp-hint { font-size: 0.7rem; color: var(--muted); margin-top: 4px; text-align: center; }

.root-user-strip { display: flex; align-items: center; gap: 10px; }
.root-avatar {
  width: 34px; height: 34px; border-radius: 8px; background: rgba(59,130,246,0.15);
  border: 1px solid rgba(59,130,246,0.3); color: #3b82f6; font-size: 0.78rem;
  font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.root-user-info { flex: 1; min-width: 0; }
.root-user-name { font-size: 0.82rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.root-user-role { font-size: 0.7rem; color: #3b82f6; font-weight: 600; }
.logout-btn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 1rem; padding: 4px; }
.logout-btn:hover { color: #ef4444; }

/* ─── Main ─── */
.root-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.root-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 28px; border-bottom: 1px solid var(--border);
  background: var(--surface); flex-shrink: 0;
}
.topbar-page-title { font-size: 1.1rem; font-weight: 700; color: var(--text); }
.topbar-page-sub { font-size: 0.78rem; color: var(--muted); margin-top: 2px; }
.root-topbar-right { display: flex; gap: 8px; align-items: center; }
.root-badge {
  padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 600;
  background: rgba(59,130,246,0.12); color: #3b82f6; border: 1px solid rgba(59,130,246,0.25);
}
.root-badge.green { background: rgba(16,185,129,0.12); color: #10b981; border-color: rgba(16,185,129,0.25); }

.root-content { flex: 1; padding: 28px; overflow-y: auto; }

.coming-soon {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 20px; text-align: center; color: var(--muted);
}
.coming-soon-icon { font-size: 3rem; margin-bottom: 16px; }
.coming-soon h3 { font-size: 1.2rem; color: var(--text); margin: 0 0 8px; }
.coming-soon p { margin: 4px 0; font-size: 0.9rem; }
.coming-hint { font-size: 0.8rem; color: var(--muted); margin-top: 12px; }
</style>
