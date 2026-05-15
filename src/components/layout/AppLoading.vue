<script setup lang="ts">
defineProps<{ error?: string | null }>()
</script>

<template>
  <div class="loading-root">
    <!-- Sidebar skeleton -->
    <aside class="loading-sidebar">
      <div class="loading-logo">
        <div class="skel skel-logo animate-pulse"></div>
        <div class="skel-text-group">
          <div class="skel skel-line w-20 animate-pulse"></div>
          <div class="skel skel-line w-14 animate-pulse" style="margin-top:4px; opacity:0.5"></div>
        </div>
      </div>

      <div class="loading-nav">
        <div class="skel skel-label animate-pulse"></div>
        <div v-for="i in 2" :key="'a'+i" class="skel skel-nav-item animate-pulse"></div>

        <div class="skel skel-label animate-pulse" style="margin-top:16px"></div>
        <div v-for="i in 4" :key="'b'+i" class="skel skel-nav-item animate-pulse"></div>

        <div class="skel skel-label animate-pulse" style="margin-top:16px"></div>
        <div v-for="i in 2" :key="'c'+i" class="skel skel-nav-item animate-pulse"></div>
      </div>

      <div class="loading-user">
        <div class="skel skel-avatar animate-pulse"></div>
        <div class="skel-text-group" style="flex:1">
          <div class="skel skel-line w-24 animate-pulse"></div>
          <div class="skel skel-line w-16 animate-pulse" style="margin-top:4px; opacity:0.5"></div>
        </div>
      </div>
    </aside>

    <!-- Main area skeleton -->
    <main class="loading-main">
      <!-- Topbar skeleton -->
      <header class="loading-topbar">
        <div class="flex items-center gap-4">
          <div class="skel skel-icon animate-pulse"></div>
          <div class="skel skel-line w-28 animate-pulse"></div>
          <div class="skel-divider"></div>
          <div class="skel skel-line w-20 animate-pulse"></div>
        </div>
        <div class="flex items-center gap-3">
          <div class="skel skel-badge animate-pulse"></div>
          <div class="skel skel-icon animate-pulse"></div>
          <div class="skel skel-icon animate-pulse"></div>
        </div>
      </header>

      <!-- Content skeleton -->
      <div class="loading-content">
        <!-- Page header -->
        <div class="mb-8">
          <div class="skel skel-line w-24 animate-pulse" style="height:10px; margin-bottom:8px"></div>
          <div class="skel skel-line w-52 animate-pulse" style="height:22px; margin-bottom:8px"></div>
          <div class="skel skel-line w-72 animate-pulse" style="height:12px"></div>
        </div>

        <!-- KPI cards row -->
        <div class="skel-grid-4 mb-8">
          <div v-for="i in 4" :key="'kpi'+i" class="skel skel-card animate-pulse" style="height:110px"></div>
        </div>

        <!-- Chart + side panel -->
        <div class="skel-grid-3">
          <div class="skel skel-card animate-pulse" style="height:280px; grid-column: span 2"></div>
          <div class="flex flex-col gap-5">
            <div class="skel skel-card animate-pulse" style="height:170px"></div>
            <div class="skel skel-card animate-pulse" style="height:100px"></div>
          </div>
        </div>
      </div>

      <!-- Error overlay -->
      <Transition name="fade">
        <div v-if="error" class="loading-error">
          <div class="error-box">
            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p class="error-title">No se pudo conectar</p>
            <p class="error-msg">{{ error }}</p>
            <button class="error-btn" @click="$emit('retry')">Reintentar</button>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.loading-root {
  display: flex;
  min-height: 100vh;
  background: #0F172A;
  overflow: hidden;
}

/* === SIDEBAR === */
.loading-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #0A0F1E;
  border-right: 1px solid rgba(37, 99, 235, 0.12);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  gap: 0;
}

.loading-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 16px 20px;
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
  margin-bottom: 8px;
}

.loading-nav {
  flex: 1;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.loading-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(37, 99, 235, 0.08);
  margin-top: auto;
}

/* === MAIN === */
.loading-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #0F172A;
}

.loading-topbar {
  height: 52px;
  background: rgba(10, 15, 30, 0.88);
  border-bottom: 1px solid rgba(37, 99, 235, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.loading-content {
  padding: 28px 24px;
  flex: 1;
}

/* === SKELETON ATOMS === */
.skel {
  background: rgba(30, 41, 59, 0.9);
  border-radius: 6px;
}

.skel-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}

.skel-text-group {
  display: flex;
  flex-direction: column;
}

.skel-line {
  height: 10px;
  border-radius: 4px;
}

.skel-label {
  height: 8px;
  width: 60px;
  margin: 6px 10px 6px;
  border-radius: 3px;
  opacity: 0.4;
}

.skel-nav-item {
  height: 30px;
  border-radius: 6px;
  margin-bottom: 2px;
}

.skel-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skel-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.skel-badge {
  height: 26px;
  width: 120px;
  border-radius: 999px;
}

.skel-card {
  border-radius: 12px;
  width: 100%;
}

.skel-divider {
  width: 1px;
  height: 20px;
  background: rgba(37, 99, 235, 0.15);
}

/* === GRID HELPERS === */
.skel-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.skel-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* width helpers */
.w-14 { width: 3.5rem; }
.w-16 { width: 4rem; }
.w-20 { width: 5rem; }
.w-24 { width: 6rem; }
.w-28 { width: 7rem; }
.w-52 { width: 13rem; }
.w-72 { width: 18rem; }

/* animate-pulse override for dark theme */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}
.animate-pulse {
  animation: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* === ERROR OVERLAY === */
.loading-error {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.error-box {
  background: #1E293B;
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 16px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.error-icon {
  width: 40px;
  height: 40px;
  color: #F87171;
  opacity: 0.9;
}

.error-title {
  font-size: 15px;
  font-weight: 700;
  color: #F1F5F9;
  margin: 0;
}

.error-msg {
  font-size: 13px;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
}

.error-btn {
  margin-top: 8px;
  padding: 9px 28px;
  background: #2563EB;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.error-btn:hover {
  background: #1D4ED8;
}

/* === TRANSITION === */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
