<script setup>
import { computed, ref } from 'vue'
import { useStateStore } from '../stores/stateStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'

const store = useStateStore()
const themeStore = useThemeStore()

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

    const result = await store.loginWithBackend(credentials)

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
  <div class="auth-page">
    <div class="auth-layout">
      <aside class="auth-story" aria-label="Presentacion de Contex360">
        <div class="auth-story__orb auth-story__orb--top"></div>
        <div class="auth-story__orb auth-story__orb--bottom"></div>

        <div class="auth-story__content">
          <header class="auth-brand">
            <div class="auth-brand__mark" aria-hidden="true">C</div>
            <div>
              <div class="auth-brand__name">Contex360</div>
              <div class="auth-brand__subtitle">Sistema de Gestion Financiera</div>
            </div>
          </header>

          <section class="auth-story__copy">
            <p class="auth-eyebrow">Plataforma ERP Empresarial</p>
            <h1>
              Plataforma Integral de
              <strong>Gestion Empresarial</strong>
            </h1>
            <p class="auth-story__lead">
              Soluciones financieras y contables de clase mundial para empresas que buscan optimizar sus
              operaciones y tomar decisiones estrategicas.
            </p>
          </section>

          <dl class="auth-metrics">
            <div class="auth-metric">
              <dt>+500</dt>
              <dd>Empresas activas</dd>
            </div>
            <div class="auth-metric">
              <dt>99.9%</dt>
              <dd>Disponibilidad</dd>
            </div>
            <div class="auth-metric">
              <dt>24/7</dt>
              <dd>Soporte tecnico</dd>
            </div>
          </dl>

          <ul class="auth-features">
            <li>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.25" stroke="currentColor" stroke-width="1.5" />
                <path d="M6.5 10.25 8.65 12.4 13.5 7.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" />
              </svg>
              <span>Multi-tenant con aislamiento completo de datos</span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.25" stroke="currentColor" stroke-width="1.5" />
                <path d="M6.5 10.25 8.65 12.4 13.5 7.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" />
              </svg>
              <span>Reportes financieros en tiempo real</span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.25" stroke="currentColor" stroke-width="1.5" />
                <path d="M6.5 10.25 8.65 12.4 13.5 7.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" />
              </svg>
              <span>Integracion con sistemas bancarios</span>
            </li>
            <li>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.25" stroke="currentColor" stroke-width="1.5" />
                <path d="M6.5 10.25 8.65 12.4 13.5 7.6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" />
              </svg>
              <span>Cumplimiento normativo automatizado</span>
            </li>
          </ul>

          <footer class="auth-story__footer">
            <span>&copy; 2026 Contex360</span>
            <button class="auth-legal-btn" @click="showTermsModal = true">Términos de uso</button>
            <a href="#">Politica de privacidad</a>
          </footer>
        </div>
      </aside>

      <section class="auth-form-panel">
        <header class="auth-form-panel__topbar">
          <div class="auth-mobile-brand">
            <div class="auth-mobile-brand__mark" aria-hidden="true">C</div>
            <div class="auth-mobile-brand__copy">
              <span class="auth-mobile-brand__name">Contex360</span>
              <span class="auth-mobile-brand__subtitle">Acceso seguro para equipos financieros</span>
            </div>
          </div>

          <div class="auth-topbar-actions">
            <button
              class="auth-theme-toggle"
              type="button"
              :aria-label="themeStore.nextThemeLabel"
              :title="themeStore.nextThemeLabel"
              @click="themeStore.toggleTheme()"
            >
              <span class="material-icons" aria-hidden="true">{{ themeStore.nextThemeIcon }}</span>
              <span>{{ themeStore.nextThemeLabel }}</span>
            </button>

            <div class="auth-support">
              <span>¿Necesitas ayuda?</span>
              <a href="mailto:soporte@contex360.local">Contactar soporte</a>
            </div>
          </div>
        </header>

        <main class="auth-form-panel__main">
          <div class="auth-form-card">
            <!-- Password change screen -->
            <template v-if="requiresPasswordChange">
              <div class="auth-form-head">
                <h2>Contraseña expirada</h2>
                <p>Tu contraseña ha vencido. Por seguridad debes establecer una nueva para continuar.</p>
              </div>
              <p v-if="errorMessage" class="auth-feedback auth-feedback--error" role="alert">{{ errorMessage }}</p>
              <div class="auth-form" style="margin-top:12px;">
                <label class="auth-field">
                  <span>Nueva contraseña</span>
                  <input v-model="newPassword" type="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres" />
                </label>
                <label class="auth-field">
                  <span>Confirmar contraseña</span>
                  <input v-model="newPasswordConfirm" type="password" autocomplete="new-password" placeholder="Repite la nueva contraseña" />
                </label>
                <button
                  class="auth-primary"
                  type="button"
                  :disabled="changePasswordLoading || newPassword.length < 8 || newPassword !== newPasswordConfirm"
                  @click="handleChangePassword"
                >
                  {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y continuar' }}
                </button>
              </div>
            </template>

            <!-- Normal login form -->
            <template v-else>
            <div class="auth-form-head">
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa tus credenciales para acceder al sistema</p>
            </div>

            <p v-if="statusMessage" class="auth-feedback auth-feedback--success" role="status">
              {{ statusMessage }}
              <span class="sr-only">Sesión iniciada.</span>
            </p>

            <p v-if="errorMessage" class="auth-feedback auth-feedback--error" role="alert">
              {{ errorMessage }}
            </p>

            <form class="auth-form" @submit.prevent="handleSubmit">
              <label class="auth-field">
                <span>Correo electronico</span>
                <input
                  id="email"
                  v-model="email"
                  autocomplete="email"
                  placeholder="nombre@empresa.com"
                  type="email"
                />
              </label>

              <div class="auth-field">
                <div class="auth-field__header">
                  <span>Contrasena</span>
                  <button class="auth-inline-action" type="button" @click="toggleRecoveryHelp">
                    <span aria-hidden="true">¿Olvidaste tu contraseña?</span>
                    <span class="sr-only">¿Olvidaste tu contrasena?</span>
                  </button>
                </div>

                <div class="auth-input-shell">
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="on"
                    placeholder="Ingresa tu contraseña"
                  />

                  <button
                    class="auth-toggle"
                    type="button"
                    aria-label="Mostrar contrasena"
                    @click="togglePassword"
                  >
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2.25 12c1.88-4.95 5.42-7.5 9.75-7.5S19.87 7.05 21.75 12c-1.88 4.95-5.42 7.5-9.75 7.5S4.13 16.95 2.25 12Z" stroke="currentColor" stroke-width="1.7" />
                      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.7" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3.5 4.5 20.5 19.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                      <path
                        d="M6.1 7.1C4.1 8.6 2.9 10.2 2.25 12c1.88 4.95 5.42 7.5 9.75 7.5 1.3 0 2.51-.2 3.6-.6"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                      <path
                        d="M9.2 6.1A9.3 9.3 0 0 1 12 4.5c4.33 0 7.87 2.55 9.75 7.5a17.2 17.2 0 0 1-3.1 4.67"
                        stroke="currentColor"
                        stroke-width="1.7"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="requiresTotp" class="auth-totp-block">
                <div class="auth-totp-label">
                  🔐 Código de autenticación (2FA)
                </div>
                <input
                  v-model="totpCode"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  placeholder="000000"
                  class="auth-totp-input"
                  autocomplete="one-time-code"
                />
                <p class="auth-totp-hint">Ingresa el código de 6 dígitos de tu app autenticadora.</p>
              </div>

              <div class="auth-row">
                <label class="auth-remember">
                  <input v-model="rememberMe" type="checkbox" />
                  <span>Recordar dispositivo</span>
                </label>
              </div>

              <p v-if="forgotAccessOpen" class="auth-recovery-note">
                Contacta a tu administrador para restablecer el acceso.
              </p>

              <button class="auth-primary" :disabled="!isFormValid || isLoading || (requiresTotp && totpCode.length < 6)" type="submit">
                <span aria-hidden="true">{{ isLoading ? 'Verificando...' : 'Iniciar sesión' }}</span>
                <span class="sr-only">{{ isLoading ? 'Verificando...' : 'Iniciar sesion' }}</span>
              </button>
            </form>

            <p class="auth-demo">
              ¿No tienes una cuenta? <a href="#">Solicita una demo</a>
            </p>

            <footer class="auth-proof">
              <span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3 4.5 5.25v5.92c0 4.56 3.06 8.81 7.5 9.83 4.44-1.02 7.5-5.27 7.5-9.83V5.25L12 3Z" stroke="currentColor" stroke-width="1.6" />
                  <path d="m9.3 11.8 1.9 1.9 3.6-4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
                <span>SSL</span>
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                  <rect x="4.5" y="11" width="15" height="8.5" rx="2.2" stroke="currentColor" stroke-width="1.6" />
                </svg>
                <span>AES-256</span>
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3 4.5 6v4.2c0 5.1 3.2 8.9 7.5 10.8 4.3-1.9 7.5-5.7 7.5-10.8V6L12 3Z" stroke="currentColor" stroke-width="1.6" />
                  <path d="m8.3 12.3 2.1 2.1 5.4-5.4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" />
                </svg>
                <span>ISO 27001</span>
              </span>
              <span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v4.5M12 16.5V21M4.5 12H9M15 12h4.5M6.4 6.4 9.5 9.5M14.5 14.5l3.1 3.1M6.4 17.6 9.5 14.5M14.5 9.5l3.1-3.1" stroke="currentColor" stroke-linecap="round" stroke-width="1.6" />
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6" />
                </svg>
                <span>SOC 2</span>
              </span>
            </footer>
            </template>
          </div>
        </main>

        <footer class="auth-mobile-footer">
          &copy; 2026 Contex360. Todos los derechos reservados.
        </footer>
      </section>
    </div>
  </div>
  <!-- Terms of use modal -->
  <Teleport to="body">
    <div v-if="showTermsModal" class="terms-modal-overlay" @click.self="showTermsModal = false">
      <div class="terms-modal">
        <div class="terms-modal-header">
          <h2>Términos de Uso</h2>
          <button class="terms-modal-close" @click="showTermsModal = false" aria-label="Cerrar">&times;</button>
        </div>
        <div class="terms-modal-body">
          <p class="terms-updated">Última actualización: 12 de mayo de 2026</p>

          <div class="terms-alert">
            Al acceder y utilizar <strong>Contex360</strong>, usted acepta estos términos en su totalidad.
          </div>

          <h3>1. Descripción del servicio</h3>
          <p>Contex360 es una plataforma ERP SaaS para gestión contable, facturación, inventario y analítica, orientada a empresas colombianas.</p>

          <h3>2. Condiciones de acceso</h3>
          <ul>
            <li>Acceso mediante credenciales asignadas por el administrador de su organización.</li>
            <li>Cada usuario es responsable de la confidencialidad de su contraseña.</li>
            <li>El uso compartido de credenciales está prohibido.</li>
            <li>Se recomienda activar autenticación de dos factores (2FA).</li>
          </ul>

          <h3>3. Uso aceptable</h3>
          <ul>
            <li>Uso exclusivo para fines legítimos de gestión empresarial.</li>
            <li>Prohibido acceder a datos de otras organizaciones sin autorización.</li>
            <li>Prohibido realizar ingeniería inversa o introducir código malicioso.</li>
          </ul>

          <h3>4. Propiedad intelectual</h3>
          <p>El software, diseño y marcas de Contex360 son propiedad de sus desarrolladores, protegidos por la legislación colombiana e internacional.</p>

          <h3>5. Datos y privacidad</h3>
          <p>El tratamiento de datos personales se rige por la <strong>Política de Privacidad</strong> conforme a la Ley 1581 de 2012. Los datos empresariales son propiedad de la organización usuaria.</p>

          <h3>6. Limitación de responsabilidad</h3>
          <p>Contex360 no responde por pérdidas derivadas de uso indebido de credenciales o errores en la información ingresada. La responsabilidad máxima se limita al valor pagado en los últimos 30 días.</p>

          <h3>7. Legislación aplicable</h3>
          <p>Estos términos se rigen por las leyes de Colombia. Las controversias se someterán a los tribunales competentes de Bogotá D.C.</p>
        </div>
        <div class="terms-modal-footer">
          <button class="terms-accept-btn" @click="showTermsModal = false">Entendido</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.auth-page {
  --auth-page-bg: #f5f7fb;
  --auth-page-text: #0f1727;
  --auth-page-muted: #68778f;
  --auth-surface: rgba(255, 255, 255, 0.96);
  --auth-surface-alt: rgba(247, 250, 255, 0.86);
  --auth-surface-strong: #ffffff;
  --auth-border: rgba(208, 217, 231, 0.92);
  --auth-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  --auth-input-bg: #ffffff;
  --auth-input-border: #d6dbe5;
  --auth-input-text: #101828;
  --auth-input-placeholder: #94a3b8;
  --auth-action-bg: #3d4654;
  --auth-action-bg-hover: #2f3946;
  --auth-action-text: #ffffff;
  --auth-link: #0f1727;
  --auth-link-muted: #3d495d;
  --auth-divider: #dde3ea;
  --auth-recovery-bg: #eef4ff;
  --auth-recovery-border: #d6e2ff;
  --auth-recovery-text: #334155;
  --auth-feedback-success-bg: #ecfdf3;
  --auth-feedback-success-border: #b7ebc0;
  --auth-feedback-success-text: #0f7a4a;
  --auth-feedback-error-bg: #fff1f2;
  --auth-feedback-error-border: #fecdd3;
  --auth-feedback-error-text: #be123c;
  --auth-theme-bg: rgba(255, 255, 255, 0.94);
  --auth-theme-border: rgba(208, 217, 231, 0.92);
  --auth-theme-text: #0f1727;
  background: var(--auth-page-bg);
  color: var(--auth-page-text);
  color-scheme: light;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

:global(html.dark) .auth-page {
  --auth-page-bg: #0b1220;
  --auth-page-text: #e5e7eb;
  --auth-page-muted: #94a3b8;
  --auth-surface: rgba(15, 23, 42, 0.92);
  --auth-surface-alt: rgba(17, 24, 39, 0.96);
  --auth-surface-strong: rgba(15, 23, 42, 0.96);
  --auth-border: rgba(148, 163, 184, 0.2);
  --auth-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
  --auth-input-bg: rgba(15, 23, 42, 0.9);
  --auth-input-border: rgba(148, 163, 184, 0.22);
  --auth-input-text: #e5e7eb;
  --auth-input-placeholder: #94a3b8;
  --auth-action-bg: #2563eb;
  --auth-action-bg-hover: #1d4ed8;
  --auth-action-text: #ffffff;
  --auth-link: #f8fafc;
  --auth-link-muted: #cbd5e1;
  --auth-divider: rgba(148, 163, 184, 0.2);
  --auth-recovery-bg: rgba(30, 41, 59, 0.78);
  --auth-recovery-border: rgba(96, 165, 250, 0.18);
  --auth-recovery-text: #dbeafe;
  --auth-feedback-success-bg: rgba(16, 185, 129, 0.12);
  --auth-feedback-success-border: rgba(16, 185, 129, 0.22);
  --auth-feedback-success-text: #34d399;
  --auth-feedback-error-bg: rgba(239, 68, 68, 0.12);
  --auth-feedback-error-border: rgba(239, 68, 68, 0.24);
  --auth-feedback-error-text: #fca5a5;
  --auth-theme-bg: rgba(15, 23, 42, 0.8);
  --auth-theme-border: rgba(148, 163, 184, 0.24);
  --auth-theme-text: #e5e7eb;
  color-scheme: dark;
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 100dvh;
}

.auth-story {
  background:
    radial-gradient(circle at 70% 22%, rgba(255, 255, 255, 0.05), transparent 18%),
    radial-gradient(circle at 84% 84%, rgba(255, 255, 255, 0.05), transparent 22%),
    linear-gradient(180deg, #182833 0%, #15232d 52%, #1b2b35 100%);
  color: #f7fbff;
  overflow: hidden;
  position: relative;
}

.auth-story::before {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  content: '';
  inset: 0;
  opacity: 0.16;
  position: absolute;
}

.auth-story__orb {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  position: absolute;
}

.auth-story__orb--top {
  height: 260px;
  right: 12%;
  top: 10%;
  width: 260px;
}

.auth-story__orb--bottom {
  bottom: -64px;
  height: 340px;
  right: -36px;
  width: 340px;
}

.auth-story__content {
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: 100%;
  padding: 42px 40px 32px 42px;
  position: relative;
  z-index: 1;
}

.auth-brand {
  align-items: center;
  display: flex;
  gap: 14px;
}

.auth-brand__mark,
.auth-mobile-brand__mark {
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  display: inline-flex;
  flex-shrink: 0;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 700;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.auth-brand__name {
  font-size: 1.34rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.auth-brand__subtitle {
  color: rgba(224, 233, 242, 0.62);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  margin-top: 5px;
  text-transform: uppercase;
}

.auth-story__copy {
  margin-top: clamp(38px, 4.5vw, 56px);
  max-width: 520px;
}

.auth-eyebrow {
  color: #27e0d2;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  margin: 0 0 14px;
  text-transform: uppercase;
}

.auth-story__copy h1 {
  font-size: clamp(2.35rem, 3.8vw, 3.6rem);
  font-weight: 400;
  letter-spacing: -0.06em;
  line-height: 1;
  margin: 0 0 20px;
  max-width: 520px;
}

.auth-story__copy h1 strong {
  display: block;
  font-weight: 700;
}

.auth-story__lead {
  color: rgba(234, 240, 248, 0.78);
  font-size: 0.95rem;
  line-height: 1.64;
  margin: 0;
  max-width: 480px;
}

.auth-metrics {
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 2px 0 0;
  max-width: 500px;
}

.auth-metric dt {
  color: #ffffff;
  font-size: clamp(1.9rem, 2.45vw, 2.6rem);
  font-weight: 400;
  line-height: 1;
}

.auth-metric dd {
  color: rgba(221, 230, 240, 0.62);
  font-size: 0.82rem;
  margin: 8px 0 0;
}

.auth-features {
  display: grid;
  gap: 11px;
  list-style: none;
  margin: 0;
  max-width: 500px;
  padding: 0;
}

.auth-features li {
  align-items: center;
  display: flex;
  gap: 14px;
  font-size: 0.9rem;
  line-height: 1.35;
}

.auth-features svg {
  color: #27e0d2;
  flex-shrink: 0;
  height: 18px;
  width: 18px;
}

.auth-story__footer {
  align-items: center;
  color: rgba(221, 230, 240, 0.55);
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: auto;
  padding-top: 18px;
}

.auth-story__footer a {
  color: inherit;
  text-decoration: none;
}

.auth-story__footer a:hover {
  color: #ffffff;
}

.auth-form-panel {
  background: var(--auth-page-bg);
  color: var(--auth-page-text);
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: auto;
}

.auth-form-panel__topbar {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding: calc(22px + env(safe-area-inset-top)) 30px 0;
}

.auth-topbar-actions {
  align-items: center;
  display: flex;
  gap: 12px;
  margin-left: auto;
  flex-wrap: wrap;
}

.auth-theme-toggle {
  align-items: center;
  background: var(--auth-theme-bg);
  border: 1px solid var(--auth-theme-border);
  border-radius: 999px;
  color: var(--auth-theme-text);
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  white-space: nowrap;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.auth-theme-toggle:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.auth-theme-toggle .material-icons {
  font-size: 18px;
}

.auth-support {
  align-items: center;
  color: var(--auth-link-muted);
  display: flex;
  gap: 14px;
  font-size: 0.9rem;
}

.auth-support a {
  color: var(--auth-link);
  font-weight: 600;
  text-decoration: none;
}

.auth-support a:hover {
  text-decoration: underline;
}

.auth-mobile-brand {
  align-items: center;
  background: linear-gradient(180deg, var(--auth-surface), var(--auth-surface-alt));
  border: 1px solid var(--auth-border);
  border-radius: 18px;
  box-shadow: var(--auth-shadow);
  display: none;
  gap: 10px;
  padding: 10px 12px;
  font-weight: 700;
}

.auth-mobile-brand__mark {
  background: #182430;
  border-color: transparent;
  height: 36px;
  width: 36px;
}

.auth-mobile-brand__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.auth-mobile-brand__name {
  color: var(--auth-page-text);
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.auth-mobile-brand__subtitle {
  color: var(--auth-page-muted);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.2;
}

.auth-form-panel__main {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 16px 32px 38px;
}

.auth-form-card {
  width: min(100%, 456px);
}

.auth-form-head {
  margin-bottom: 22px;
}

.auth-form-head h2 {
  color: var(--auth-page-text);
  font-size: clamp(1.9rem, 2.55vw, 2.35rem);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1.05;
  margin: 0 0 8px;
}

.auth-form-head p {
  color: var(--auth-page-muted);
  font-size: 0.92rem;
  margin: 0;
}

.auth-feedback {
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.45;
  margin: 0 0 14px;
  padding: 12px 14px;
}

.auth-feedback--success {
  background: var(--auth-feedback-success-bg);
  border: 1px solid var(--auth-feedback-success-border);
  color: var(--auth-feedback-success-text);
}

.auth-feedback--error {
  background: var(--auth-feedback-error-bg);
  border: 1px solid var(--auth-feedback-error-border);
  color: var(--auth-feedback-error-text);
}

.auth-form {
  display: grid;
  gap: 16px;
}

.auth-field {
  display: grid;
  gap: 8px;
}

.auth-field > span,
.auth-field__header > span {
  color: var(--auth-page-text);
  font-size: 0.93rem;
  font-weight: 500;
}

.auth-field__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.auth-inline-action {
  background: transparent;
  border: 0;
  color: var(--auth-page-muted);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  padding: 0;
}

.auth-inline-action:hover {
  color: var(--auth-page-text);
}

.auth-input-shell {
  align-items: center;
  background: var(--auth-input-bg);
  border: 1px solid var(--auth-input-border);
  border-radius: 11px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 46px;
  padding: 0 12px 0 14px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.auth-input-shell:focus-within {
  border-color: var(--auth-page-text);
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
}

.auth-input-shell input {
  background: transparent;
  border: 0;
  color: var(--auth-input-text);
  font-size: 0.96rem;
  min-height: 50px;
  padding: 0;
  width: 100%;
}

.auth-input-shell input:focus {
  outline: none;
}

.auth-input-shell input::placeholder {
  color: var(--auth-input-placeholder);
}

.auth-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  color: var(--auth-page-muted);
  cursor: pointer;
  display: inline-grid;
  height: 26px;
  justify-content: center;
  padding: 0;
  width: 26px;
}

.auth-toggle:hover {
  color: var(--auth-page-text);
}

.auth-toggle svg {
  height: 20px;
  width: 20px;
}

.auth-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.auth-remember {
  align-items: center;
  color: var(--auth-page-muted);
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  font-size: 0.9rem;
}

.auth-remember input {
  accent-color: var(--auth-page-text);
  height: 16px;
  width: 16px;
}

.auth-recovery-note {
  background: var(--auth-recovery-bg);
  border: 1px solid var(--auth-recovery-border);
  border-radius: 11px;
  color: var(--auth-recovery-text);
  line-height: 1.5;
  margin: 0;
  padding: 11px 13px;
}

.auth-primary {
  background: var(--auth-action-bg);
  border: 0;
  border-radius: 11px;
  color: var(--auth-action-text);
  cursor: pointer;
  font-size: 0.96rem;
  font-weight: 600;
  min-height: 46px;
  padding: 0 18px;
  transition:
    background 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.auth-primary:hover:not(:disabled) {
  background: var(--auth-action-bg-hover);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.auth-primary:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.auth-divider {
  align-items: center;
  color: var(--auth-page-muted);
  display: flex;
  gap: 14px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  margin: 24px 0 20px;
  text-transform: uppercase;
}

.auth-divider::before,
.auth-divider::after {
  background: var(--auth-divider);
  content: '';
  flex: 1;
  height: 1px;
}

.auth-sso {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.auth-sso-button {
  align-items: center;
  background: var(--auth-surface-strong);
  border: 1px solid var(--auth-border);
  border-radius: 11px;
  color: var(--auth-page-text);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.92rem;
  font-weight: 500;
  gap: 10px;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.auth-sso-button:hover {
  background: var(--auth-surface-alt);
  border-color: var(--auth-border);
  transform: translateY(-1px);
}

.auth-sso-button svg {
  flex-shrink: 0;
  height: 18px;
  width: 18px;
}

.auth-demo {
  color: var(--auth-link-muted);
  font-size: 0.92rem;
  margin: 18px 0 0;
  text-align: center;
}

.auth-demo a {
  color: var(--auth-link);
  font-weight: 700;
  text-decoration: none;
}

.auth-demo a:hover {
  text-decoration: underline;
}

.auth-proof {
  align-items: center;
  border-top: 1px solid var(--auth-proof-border);
  color: var(--auth-page-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  margin-top: 28px;
  padding-top: 20px;
}

.auth-proof span {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  font-size: 0.84rem;
}

.auth-proof svg {
  color: var(--auth-page-muted);
  height: 16px;
  width: 16px;
}

.auth-mobile-footer {
  display: none;
  color: var(--auth-page-muted);
}

@media (max-width: 1100px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-story {
    display: none;
  }

  .auth-form-panel__topbar {
    justify-content: flex-end;
    padding-top: 20px;
  }

  .auth-form-panel__main {
    padding: 26px 20px 36px;
  }
}

@media (max-width: 640px) {
  .auth-form-panel__topbar {
    align-items: flex-start;
    justify-content: space-between;
    padding: calc(18px + env(safe-area-inset-top)) 18px 0;
  }

  .auth-mobile-brand {
    display: inline-flex;
  }

  .auth-mobile-brand__subtitle {
    max-width: 150px;
  }

  .auth-support {
    display: none;
  }

  .auth-form-panel__main {
    align-items: flex-start;
    padding: 20px 18px 28px;
  }

  .auth-form-head h2 {
    font-size: 1.9rem;
  }

  .auth-sso {
    grid-template-columns: 1fr;
  }

  .auth-proof {
    gap: 12px;
  }

  .auth-mobile-footer {
    color: #8693a8;
    display: block;
    font-size: 0.85rem;
    padding: 0 18px calc(22px + env(safe-area-inset-bottom));
    text-align: center;
  }
}

</style>
