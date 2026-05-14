<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const emit = defineEmits(['request-demo'])

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const forgotAccessOpen = ref(false)
const requiresTotp = ref(false)
const totpCode = ref('')
const requiresPasswordChange = ref(false)
const newPassword = ref('')
const newPasswordConfirm = ref('')
const changePasswordLoading = ref(false)
const showTermsModal = ref(false)
const showPrivacyModal = ref(false)

const isFormValid = computed(() => email.value.includes('@') && password.value.length >= 6)

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const credentials = { email: email.value, password: password.value, totpCode: undefined }
    if (requiresTotp.value && totpCode.value) {
      credentials.totpCode = totpCode.value
    }

    const result = await authStore.loginWithBackend(credentials)

    if (result?.requiresTotp) {
      requiresTotp.value = true
      errorMessage.value = ''
      return
    }

    if (result?.requiresPasswordChange) {
      requiresPasswordChange.value = true
      errorMessage.value = ''
      return
    }

    if (!result.ok) {
      errorMessage.value = result.message || 'Credenciales invalidas. Por favor, verifica tus datos.'
      return
    }

    statusMessage.value = result.message || 'Sesion iniciada.'
  } catch (error) {
    errorMessage.value = error?.message || 'Error de conexion. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (newPassword.value.length < 8) {
    errorMessage.value = 'La nueva contrasena debe tener al menos 8 caracteres.'
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = 'Las contrasenas no coinciden.'
    return
  }
  changePasswordLoading.value = true
  errorMessage.value = ''
  try {
    const res = await businessApi.changePassword(password.value, newPassword.value)
    if (res.ok) {
      requiresPasswordChange.value = false
      password.value = newPassword.value
      statusMessage.value = 'Contrasena actualizada. Iniciando sesion...'
      await handleSubmit()
    }
  } catch (err) {
    errorMessage.value = err?.message || 'Error al cambiar la contrasena.'
  } finally {
    changePasswordLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleRecoveryHelp = () => {
  forgotAccessOpen.value = !forgotAccessOpen.value
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-split">
      <!-- PANEL IZQUIERDO: Branding & Info (Visible solo en LG+) -->
      <aside class="side-info">
        <div class="info-inner">
          <header class="brand-header">
            <div class="logo-square">C</div>
            <div class="brand-meta">
              <span class="brand-title">Contex360</span>
              <span class="brand-subtitle">Enterprise Resource Planning</span>
            </div>
          </header>

          <div class="hero-text">
            <span class="eyebrow">Solución ERP de Próxima Generación</span>
            <h1>Plataforma Integral de <br/><span>Gestión Empresarial</span></h1>
            <p class="description">
              Controla tus finanzas, inventarios y cumplimiento tributario con una suite diseñada para la escala y la precisión.
            </p>
          </div>

          <ul class="features">
            <li v-for="feat in ['Multi-tenant con aislamiento total', 'Reportes financieros en tiempo real', 'Integración DIAN automatizada', 'Seguridad grado bancario AES-256']" :key="feat">
              <div class="check-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>
        
        <footer class="side-footer">
          &copy; 2026 Contex360 · Tecnología Contable Local
        </footer>
      </aside>

      <!-- PANEL DERECHO: Formulario (Blanco siempre) -->
      <section class="side-form">
        <div class="form-box">
          <!-- Mobile Brand (Solo visible en pantallas pequeñas) -->
          <div class="mobile-logo lg-hidden">
            <div class="logo-square small">C</div>
            <span class="bold">Contex360</span>
          </div>

          <template v-if="requiresPasswordChange">
            <div class="header-group">
              <h2>Contraseña expirada</h2>
              <p>Por seguridad debes establecer una nueva credencial.</p>
            </div>
            
            <div v-if="errorMessage" class="msg error">{{ errorMessage }}</div>

            <form @submit.prevent="handleChangePassword" class="vertical-form">
              <div class="field-group">
                <label>Nueva contraseña</label>
                <input v-model="newPassword" type="password" placeholder="Mínimo 8 caracteres" required />
              </div>
              <div class="field-group">
                <label>Confirmar contraseña</label>
                <input v-model="newPasswordConfirm" type="password" placeholder="Repite la contraseña" required />
              </div>
              <button type="submit" class="primary-btn" :disabled="changePasswordLoading">
                {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y Continuar' }}
              </button>
            </form>
          </template>

          <template v-else>
            <div class="header-group">
              <h2>Bienvenido</h2>
              <p>Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <div v-if="errorMessage" class="msg error">{{ errorMessage }}</div>
            <div v-if="statusMessage" class="msg success">{{ statusMessage }}</div>

            <form @submit.prevent="handleSubmit" class="vertical-form">
              <div class="field-group">
                <label>Correo electrónico</label>
                <input v-model="email" type="email" placeholder="usuario@empresa.com" required />
              </div>

              <div class="field-group">
                <div class="label-split">
                  <label>Contraseña</label>
                  <button type="button" @click="toggleRecoveryHelp" class="ghost-link">¿Olvidaste tu contraseña?</button>
                </div>
                <div class="input-relative">
                  <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
                  <button type="button" @click="showPassword = !showPassword" class="eye-toggle">
                    {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
              </div>

              <div v-if="requiresTotp" class="totp-container">
                <label>Código de Autenticación (2FA)</label>
                <input v-model="totpCode" type="text" maxlength="6" placeholder="000000" class="totp-field" />
                <span class="hint">Ingresa el código de 6 dígitos de tu aplicación</span>
              </div>

              <div class="options-row">
                <label class="custom-checkbox">
                  <input v-model="rememberMe" type="checkbox" />
                  <span>Recordar este dispositivo</span>
                </label>
              </div>

              <button type="submit" class="primary-btn" :disabled="isLoading">
                {{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}
              </button>
            </form>

            <div class="form-footer-action">
              ¿No tienes una cuenta? <button @click="$emit('request-demo')" class="ghost-link bold">Solicita una demo</button>
            </div>

            <div class="security-badges">
              <span>SSL</span>
              <span>AES-256</span>
              <span>ISO 27001</span>
              <span>SOC 2</span>
            </div>
          </template>
        </div>
      </section>
    </div>

    <!-- Modals (Blindados) -->
    <div v-if="showTermsModal || showPrivacyModal" class="modal-overlay">
      <div class="modal-card">
        <header class="modal-header">
          <h3>{{ showTermsModal ? 'Términos de Uso' : 'Privacidad' }}</h3>
          <button @click="showTermsModal = false; showPrivacyModal = false" class="close-btn">&times;</button>
        </header>
        <div class="modal-body">
          <p v-if="showTermsModal">Contenido de términos y condiciones del servicio ERP...</p>
          <p v-if="showPrivacyModal">Política de tratamiento de datos personales (Ley 1581 de 2012)...</p>
        </div>
        <footer class="modal-footer">
          <button @click="showTermsModal = false; showPrivacyModal = false" class="primary-btn small">Cerrar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 
  REGLA DE ORO: AISLAMIENTO TOTAL
  No se usan variables de styles.css para evitar contaminación.
*/

.login-wrapper {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #0B0F1A;
}

.login-split {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* --- PANEL IZQUIERDO (ASIDE) --- */
.side-info {
  flex: 1;
  background-color: #0B0F1A;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  position: relative;
}

@media (max-width: 1024px) {
  .side-info {
    display: none;
  }
}

.info-inner {
  max-width: 520px;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 64px;
}

.logo-square {
  width: 48px;
  height: 48px;
  background-color: #10B981;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.6rem;
  color: #ffffff;
}

.brand-meta {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
}

.hero-text .eyebrow {
  color: #10B981;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 20px;
  display: block;
}

.hero-text h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #ffffff !important;
}

.hero-text h1 span {
  color: #10B981;
}

.description {
  font-size: 1.125rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 48px;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features li {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  color: #cbd5e1;
  font-weight: 500;
}

.check-circle {
  width: 24px;
  height: 24px;
  background-color: rgba(16, 185, 129, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10B981;
  flex-shrink: 0;
}

.check-circle svg {
  width: 14px;
  height: 14px;
}

.side-footer {
  position: absolute;
  bottom: 40px;
  left: 80px;
  font-size: 0.8rem;
  color: #475569;
}

/* --- PANEL DERECHO (FORM) --- */
.side-form {
  flex: 1;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-box {
  width: 100%;
  max-width: 400px;
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.logo-square.small {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 1.2rem;
}

.lg-hidden {
  display: none;
}

@media (max-width: 1024px) {
  .lg-hidden {
    display: flex;
  }
}

.header-group {
  margin-bottom: 32px;
}

.header-group h2 {
  color: #0f172a !important;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0 0 8px;
}

.header-group p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.vertical-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-split {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-group label {
  color: #475569 !important;
  font-size: 0.875rem;
  font-weight: 600;
}

.field-group input {
  width: 100%;
  height: 48px !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px;
  padding: 0 16px;
  font-size: 1rem;
  color: #0f172a !important;
  background-color: #ffffff;
  box-sizing: border-box;
}

.field-group input:focus {
  border-color: #0f172a !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

.input-relative {
  position: relative;
}

.eye-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.4;
}

.totp-container {
  background-color: #f8fafc;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.totp-field {
  text-align: center;
  letter-spacing: 0.4em;
  font-weight: 800;
  font-size: 1.5rem !important;
  border: 2px solid #cbd5e1 !important;
}

.totp-container .hint {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

.options-row {
  margin: 4px 0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #64748b;
  font-size: 0.875rem;
}

.custom-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.primary-btn {
  background-color: #0f172a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  width: 100%;
  height: 48px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.1s, background-color 0.2s;
}

.primary-btn:hover {
  background-color: #1e293b;
}

.primary-btn:active {
  transform: scale(0.98);
}

.primary-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.primary-btn.small {
  height: 40px;
  width: auto;
  padding: 0 24px;
}

.form-footer-action {
  margin-top: 32px;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.ghost-link {
  background: none;
  border: none;
  color: #10B981;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
}

.ghost-link.bold {
  font-weight: 800;
}

.ghost-link:hover {
  text-decoration: underline;
}

.msg {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 24px;
}

.msg.error {
  background-color: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

.msg.success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.security-badges {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
  gap: 24px;
  opacity: 0.3;
}

.security-badges span {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.05em;
}

/* --- MODALS --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  background-color: #ffffff;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 32px;
  color: #475569;
  line-height: 1.6;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}
</style>
