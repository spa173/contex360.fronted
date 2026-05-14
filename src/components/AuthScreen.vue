<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  HelpCircle,
  Mail,
  ArrowRight
} from 'lucide-vue-next'

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
      <!-- PANEL IZQUIERDO: Branding & Impacto Visual -->
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
            <h1 class="main-title">Plataforma Integral de <br/><span>Gestión Empresarial</span></h1>
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

          <div class="metrics-row">
            <div class="metric-item">
              <span class="m-val">+500</span>
              <span class="m-label">Empresas</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <span class="m-val">99.9%</span>
              <span class="m-label">Uptime</span>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <span class="m-val">24/7</span>
              <span class="m-label">Soporte</span>
            </div>
          </div>
        </div>
        
        <footer class="side-footer">
          &copy; 2026 Contex360 · Tecnología Contable Local
        </footer>
      </aside>

      <!-- PANEL DERECHO: Formulario & Acceso -->
      <section class="side-form">
        <!-- Top Help Header -->
        <header class="top-help">
          <div class="help-box">
            <HelpCircle class="icon-s" />
            <span>¿Necesitas ayuda?</span>
            <button class="ghost-link">Contactar soporte</button>
          </div>
        </header>

        <div class="form-box">
          <!-- Mobile Brand -->
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

            <!-- Social Login Section -->
            <div class="social-login">
              <button class="social-btn">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                <span>Google</span>
              </button>
              <button class="social-btn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
                <span>Microsoft</span>
              </button>
            </div>

            <div class="divider-text">
              <span>o continúa con</span>
            </div>

            <div v-if="errorMessage" class="msg error">{{ errorMessage }}</div>
            <div v-if="statusMessage" class="msg success">{{ statusMessage }}</div>

            <form @submit.prevent="handleSubmit" class="vertical-form">
              <div class="field-group">
                <label>Correo electrónico</label>
                <div class="input-with-icon">
                  <Mail class="input-icon" />
                  <input v-model="email" type="email" placeholder="usuario@empresa.com" required />
                </div>
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
                <span>{{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}</span>
                <ArrowRight v-if="!isLoading" class="btn-icon" />
              </button>
            </form>

            <div class="form-footer-action">
              ¿No tienes una cuenta? <button @click="$emit('request-demo')" class="ghost-link bold">Solicita una demo</button>
            </div>

            <div class="security-badges">
              <div class="badge-item">
                <ShieldCheck class="badge-icon" />
                <span>ISO 27001</span>
              </div>
              <div class="badge-item">
                <Lock class="badge-icon" />
                <span>SOC 2</span>
              </div>
              <div class="badge-item">
                <Globe class="badge-icon" />
                <span>Enterprise</span>
              </div>
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
  flex: 1.1;
  background-color: #0B0F1A;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 100px;
  position: relative;
}

@media (max-width: 1024px) {
  .side-info {
    display: none;
  }
}

.info-inner {
  max-width: 600px;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 80px;
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
  margin-bottom: 24px;
  display: block;
}

.main-title {
  font-size: 5rem;
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 28px;
  letter-spacing: -0.05em;
  color: #ffffff !important;
}

.main-title span {
  color: #10B981;
}

.description {
  font-size: 1.25rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 56px;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 64px 0;
}

.features li {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  color: #cbd5e1;
  font-weight: 500;
}

.check-circle {
  width: 24px;
  height: 24px;
  background-color: #10B981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.check-circle svg {
  width: 14px;
  height: 14px;
}

.metrics-row {
  display: flex;
  align-items: center;
  gap: 40px;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.m-val {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
}

.m-label {
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-divider {
  width: 1px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
}

.side-footer {
  position: absolute;
  bottom: 40px;
  left: 100px;
  font-size: 0.8rem;
  color: #475569;
}

/* --- PANEL DERECHO (FORM) --- */
.side-form {
  flex: 0.9;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.top-help {
  position: absolute;
  top: 32px;
  right: 40px;
}

.help-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #64748b;
}

.icon-s {
  width: 16px;
  height: 16px;
}

.form-box {
  width: 100%;
  max-width: 420px;
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
  margin-bottom: 40px;
}

.header-group h2 {
  color: #0f172a !important;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0 0 10px;
}

.header-group p {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
}

/* Social Login */
.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 52px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
}

.social-btn:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.social-btn img {
  width: 20px;
  height: 20px;
}

.divider-text {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider-text::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #e2e8f0;
}

.divider-text span {
  position: relative;
  background-color: #ffffff;
  padding: 0 16px;
  font-size: 0.85rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.vertical-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label-split {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-group label {
  color: #1e293b !important;
  font-size: 0.95rem;
  font-weight: 600;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.field-group input {
  width: 100%;
  height: 56px !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 1rem;
  color: #0f172a !important;
  background-color: #ffffff;
  box-sizing: border-box;
}

.input-with-icon input {
  padding-left: 48px;
}

.field-group input:focus {
  border-color: #0f172a !important;
  outline: none;
  box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.04);
}

.input-relative {
  position: relative;
}

.eye-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  opacity: 0.4;
  display: flex;
}

.totp-container {
  background-color: #f8fafc;
  padding: 24px;
  border-radius: 16px;
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
  gap: 12px;
  cursor: pointer;
  color: #64748b;
  font-size: 0.95rem;
}

.custom-checkbox input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 6px;
}

.primary-btn {
  background-color: #2D3748;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  width: 100%;
  height: 56px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s;
}

.primary-btn:hover {
  background-color: #1a202c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.2);
}

.primary-btn:active {
  transform: translateY(0);
}

.primary-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.form-footer-action {
  margin-top: 40px;
  text-align: center;
  color: #64748b;
  font-size: 1rem;
}

.ghost-link {
  background: none;
  border: none;
  color: #10B981;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.ghost-link.bold {
  font-weight: 800;
}

.ghost-link:hover {
  text-decoration: underline;
}

.msg {
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 32px;
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
  margin-top: 64px;
  padding-top: 40px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: center;
  gap: 32px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}

.badge-icon {
  width: 18px;
  height: 18px;
}

.badge-item span {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* --- MODALS --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  background-color: #ffffff;
  width: 100%;
  max-width: 640px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 28px 36px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 800;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2.5rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
}

.modal-body {
  padding: 40px;
  color: #475569;
  line-height: 1.7;
  font-size: 1.1rem;
}

.modal-footer {
  padding: 24px 36px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}
</style>

