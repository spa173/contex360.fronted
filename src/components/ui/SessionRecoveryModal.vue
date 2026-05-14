<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-vue-next'

const authStore = useAuthStore()
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const isSubmitting = ref(false)

async function handleReauth() {
  if (!password.value) return
  
  isSubmitting.value = true
  error.value = ''
  
  try {
    const result = await authStore.reauthenticate(password.value)
    if (!result.ok) {
      error.value = result.message || 'Contraseña incorrecta'
    }
  } catch (err) {
    error.value = 'Error de conexión'
  } finally {
    isSubmitting.value = false
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <Transition name="fade">
    <div v-if="authStore.isSessionExpired" class="recovery-overlay">
      <div class="recovery-card">
        <div class="recovery-icon">
          <div class="icon-pulse"></div>
          <Lock class="h-8 w-8 text-emerald-400" />
        </div>

        <div class="recovery-header">
          <h2>Sesión Expirada</h2>
          <p>Por seguridad, re-auténtica tu cuenta para continuar sin perder tu progreso actual.</p>
        </div>

        <form @submit.prevent="handleReauth" class="recovery-form">
          <div v-if="error" class="error-banner">
            <AlertCircle class="h-4 w-4" />
            <span>{{ error }}</span>
          </div>

          <div class="input-group">
            <label for="recovery-password">Contraseña de {{ authStore.currentUser?.name }}</label>
            <div class="input-wrapper">
              <input
                id="recovery-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                required
                autofocus
              />
              <button type="button" @click="togglePassword" class="toggle-btn">
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            class="reauth-btn" 
            :disabled="isSubmitting || !password"
          >
            <ShieldCheck v-if="!isSubmitting" class="h-5 w-5 mr-2" />
            <span v-else class="loader mr-2"></span>
            {{ isSubmitting ? 'Verificando...' : 'Re-autenticar' }}
          </button>
        </form>

        <button @click="authStore.logout()" class="logout-link">
          Cerrar sesión y salir
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.recovery-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(11, 15, 26, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.recovery-card {
  background: #131926;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.recovery-icon {
  position: relative;
  width: 64px;
  height: 64px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.icon-pulse {
  position: absolute;
  inset: -8px;
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 1; }
  70% { transform: scale(1.1); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0; }
}

.recovery-header {
  text-align: center;
  margin-bottom: 32px;
}

.recovery-header h2 {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.recovery-header p {
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.5;
}

.recovery-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f87171;
  font-size: 0.875rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #cbd5e1;
  font-size: 0.875rem;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px 48px 12px 16px;
  color: #f8fafc;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.toggle-btn:hover {
  color: #94a3b8;
}

.reauth-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.reauth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.reauth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.reauth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-link {
  margin-top: 24px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.logout-link:hover {
  color: #f8fafc;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
