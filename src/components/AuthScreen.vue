<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { 
  ShieldCheck, 
  Lock, 
  Globe, 
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
  Settings,
  Cpu
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
  <div class="auth-root">
    <div class="auth-grid">
      <!-- LEFT PANEL: Dark Branding -->
      <aside class="branding-panel">
        <header class="panel-header">
          <div class="logo-group">
            <div class="logo-box">C</div>
            <div class="logo-text">
              <span class="brand-name">Contex360</span>
              <span class="brand-tagline">SISTEMA DE GESTION FINANCIERA</span>
            </div>
          </div>
        </header>

        <div class="panel-content">
          <span class="eyebrow">PLATAFORMA ERP EMPRESARIAL</span>
          <h1 class="main-title">Plataforma Integral de <br/><span>Gestión Empresarial</span></h1>
          <p class="description">
            Soluciones financieras y contables de clase mundial para empresas que buscan optimizar sus operaciones y tomar decisiones estratégicas.
          </p>

          <div class="metrics-row">
            <div class="metric">
              <span class="m-value">+ 500</span>
              <span class="m-label">Empresas activas</span>
            </div>
            <div class="metric">
              <span class="m-value">99.9%</span>
              <span class="m-label">Disponibilidad</span>
            </div>
            <div class="metric">
              <span class="m-value">24/7</span>
              <span class="m-label">Soporte técnico</span>
            </div>
          </div>

          <ul class="feat-list">
            <li v-for="feat in ['Multi-tenant con aislamiento completo de datos', 'Reportes financieros en tiempo real', 'Integración con sistemas bancarios', 'Cumplimiento normativo automatizado']" :key="feat">
              <CheckCircle2 class="check-icon" />
              <span>{{ feat }}</span>
            </li>
          </ul>
        </div>

        <footer class="panel-footer">
          <span>&copy; 2026 Contex360</span>
          <div class="footer-links">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
          </div>
        </footer>
      </aside>

      <!-- RIGHT PANEL: Login Form -->
      <section class="form-panel">
        <header class="form-header-top">
          <div class="support-link">
            <span>¿Necesitas ayuda?</span>
            <a href="#">Contactar soporte</a>
          </div>
        </header>

        <div class="form-container">
          <template v-if="requiresPasswordChange">
            <h2 class="form-title">Contraseña expirada</h2>
            <p class="form-subtitle">Por seguridad debes establecer una nueva para continuar.</p>
            
            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

            <form @submit.prevent="handleChangePassword" class="auth-form">
              <div class="form-field">
                <label>Nueva contraseña</label>
                <input v-model="newPassword" type="password" placeholder="Mínimo 8 caracteres" />
              </div>
              <div class="form-field">
                <label>Confirmar contraseña</label>
                <input v-model="newPasswordConfirm" type="password" placeholder="Repite la contraseña" />
              </div>
              <button type="submit" class="submit-btn" :disabled="changePasswordLoading">
                {{ changePasswordLoading ? 'Cambiando...' : 'Establecer Contraseña' }}
              </button>
            </form>
          </template>

          <template v-else>
            <h2 class="form-title">Bienvenido de nuevo</h2>
            <p class="form-subtitle">Ingresa tus credenciales para acceder al sistema</p>

            <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>
            <div v-if="statusMessage" class="success-msg">{{ statusMessage }}</div>

            <!-- Social Login (Added as per request text) -->
            <div class="social-row">
              <button class="social-btn">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
                <span>Google</span>
              </button>
              <button class="social-btn">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="M" />
                <span>Microsoft</span>
              </button>
            </div>

            <div class="divider"><span>o continúa con</span></div>

            <form @submit.prevent="handleSubmit" class="auth-form">
              <div class="form-field">
                <label>Correo electronico</label>
                <input v-model="email" type="email" placeholder="nombre@empresa.com" />
              </div>

              <div class="form-field">
                <div class="label-row">
                  <label>Contrasena</label>
                  <button type="button" @click="toggleRecoveryHelp" class="forgot-link">¿Olvidaste tu contraseña?</button>
                </div>
                <div class="input-wrap">
                  <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Ingresa tu contraseña" />
                  <button type="button" @click="showPassword = !showPassword" class="eye-btn">
                    <Eye v-if="!showPassword" class="eye-icon" />
                    <EyeOff v-else class="eye-icon" />
                  </button>
                </div>
              </div>

              <div v-if="requiresTotp" class="totp-block">
                <label>Código 2FA</label>
                <input v-model="totpCode" type="text" maxlength="6" placeholder="000000" />
              </div>

              <div class="form-check">
                <input v-model="rememberMe" type="checkbox" id="remember" />
                <label for="remember">Recordar dispositivo</label>
              </div>

              <button type="submit" class="submit-btn" :disabled="isLoading">
                {{ isLoading ? 'Verificando...' : 'Iniciar sesión' }}
              </button>
            </form>

            <div class="demo-link">
              ¿No tienes una cuenta? <a href="#" @click.prevent="$emit('request-demo')">Solicita una demo</a>
            </div>

            <div class="cert-badges">
              <div class="badge"><ShieldCheck class="b-icon" /> <span>SSL</span></div>
              <div class="badge"><Lock class="b-icon" /> <span>AES-256</span></div>
              <div class="badge"><Globe class="b-icon" /> <span>ISO 27001</span></div>
              <div class="badge"><Cpu class="b-icon" /> <span>SOC 2</span></div>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Scoped Styles to ensure isolation and match reference exactly */

.auth-root {
  min-height: 100vh;
  width: 100vw;
  background-color: #ffffff;
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
}

.auth-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
}

@media (max-width: 1024px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }
  .branding-panel {
    display: none;
  }
}

/* --- LEFT PANEL --- */
.branding-panel {
  background-color: #131926;
  color: #ffffff;
  padding: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

/* Background orbs for depth */
.branding-panel::before {
  content: "";
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
  border-radius: 50%;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-box {
  width: 40px;
  height: 40px;
  background-color: #334155;
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.25rem;
}

.brand-name {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}

.brand-tagline {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-top: 4px;
}

.eyebrow {
  color: #10B981;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-bottom: 24px;
  display: block;
}

.main-title {
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 32px;
  letter-spacing: -0.04em;
  background: linear-gradient(to bottom, #ffffff 60%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-title span {
  color: #ffffff;
  -webkit-text-fill-color: #ffffff;
}

.description {
  font-size: 1.25rem;
  color: #94a3b8;
  line-height: 1.6;
  max-width: 500px;
  margin-bottom: 60px;
}

.metrics-row {
  display: flex;
  gap: 60px;
  margin-bottom: 60px;
}

.m-value {
  display: block;
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
}

.m-label {
  font-size: 0.85rem;
  color: #64748b;
}

.feat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feat-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  color: #cbd5e1;
  font-weight: 500;
}

.check-icon {
  width: 20px;
  height: 20px;
  color: #10B981;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #475569;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: inherit;
  text-decoration: none;
}

/* --- RIGHT PANEL --- */
.form-panel {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 40px;
}

.form-header-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 60px;
}

.support-link {
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  gap: 8px;
}

.support-link a {
  color: #0f172a;
  font-weight: 700;
  text-decoration: none;
}

.form-container {
  max-width: 440px;
  width: 100%;
  margin: auto;
}

.form-title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.form-subtitle {
  color: #64748b;
  margin-bottom: 40px;
  font-size: 1.1rem;
}

.social-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.social-btn {
  height: 52px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  color: #1e293b;
}

.social-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.social-btn img {
  width: 18px;
  height: 18px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #f1f5f9;
}

.divider span {
  background: #ffffff;
  padding: 0 16px;
  position: relative;
  color: #94a3b8;
  font-size: 0.85rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.form-field input {
  height: 48px;
  padding: 0 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  color: #475569;
  background: #ffffff;
  transition: border-color 0.2s;
}

.form-field input:focus {
  border-color: #0f172a;
  outline: none;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}

.forgot-link:hover {
  color: #0f172a;
  text-decoration: underline;
}

.input-wrap {
  position: relative;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  padding: 4px;
}

.eye-icon {
  width: 18px;
  height: 18px;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.form-check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-check label {
  font-size: 0.9rem;
  color: #64748b;
  cursor: pointer;
}

.submit-btn {
  height: 48px;
  background-color: #334155;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.submit-btn:hover {
  background-color: #1e293b;
}

.submit-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.demo-link {
  text-align: center;
  margin-top: 32px;
  font-size: 0.95rem;
  color: #64748b;
}

.demo-link a {
  color: #0f172a;
  font-weight: 700;
  text-decoration: none;
}

.cert-badges {
  margin-top: 60px;
  display: flex;
  justify-content: center;
  gap: 24px;
}

.badge {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.b-icon {
  width: 14px;
  height: 14px;
}

.error-msg {
  padding: 12px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 24px;
}

.success-msg {
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 24px;
}

.totp-block {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
</style>

