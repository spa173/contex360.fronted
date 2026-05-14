<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { toast } from 'vue-sonner'
import { onMounted } from 'vue'

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
const hasAcceptedPrivacy = ref(false)

const isFormValid = computed(() => email.value.includes('@') && password.value.length >= 6)

onMounted(() => {
  const savedEmail = localStorage.getItem('contex360-remember-email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  if (!hasAcceptedPrivacy.value) {
    toast.warning('Debe aceptar la política de tratamiento de datos para continuar.', {
      description: 'Cumplimiento obligatorio Ley 1581 de 2012',
      duration: 4000,
    })
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const credentials = { 
      email: email.value, 
      password: password.value, 
      totpCode: undefined,
      privacyAccepted: hasAcceptedPrivacy.value,
      rememberMe: rememberMe.value
    }
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
            <span class="auth-footer-copy">&copy; 2026 Contex360</span>
            <div class="auth-footer-links">
              <button class="auth-footer-link" @click="showTermsModal = true">Términos</button>
              <span class="auth-footer-dot" aria-hidden="true"></span>
              <button class="auth-footer-link" @click="showPrivacyModal = true">Privacidad</button>
            </div>
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

              <div class="auth-row" style="margin-top: 8px;">
                <label class="auth-remember">
                  <input v-model="hasAcceptedPrivacy" type="checkbox" />
                  <span>Acepto la Política de Tratamiento de Datos (Ley 1581)</span>
                </label>
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

              <button class="auth-primary" :disabled="isLoading || (requiresTotp && totpCode.length < 6)" type="submit">
                <span aria-hidden="true">{{ isLoading ? 'Verificando...' : 'Iniciar sesión' }}</span>
                <span class="sr-only">{{ isLoading ? 'Verificando...' : 'Iniciar sesion' }}</span>
              </button>
            </form>

            <p class="auth-demo">
              ¿No tienes una cuenta? <a href="#" @click.prevent="$emit('request-demo')">Solicita una demo</a>
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
  <!-- Legal modals -->
  <div v-if="showTermsModal" class="lm-overlay" role="dialog" aria-modal="true" @click.self="showTermsModal = false">
    <div class="lm-modal">
      <div class="lm-header">
        <div><h2 class="lm-title">Términos de Uso</h2><p class="lm-subtitle">Última actualización: 12 de mayo de 2026</p></div>
        <button class="lm-close" @click="showTermsModal = false" aria-label="Cerrar"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
      <div class="lm-body"><div class="lm-inner">
        <p class="lm-intro">Al acceder y utilizar <strong>Contex360</strong> usted acepta los presentes términos. Si no está de acuerdo, no debe utilizar el servicio.</p>
        <div class="lm-section"><h3>1. Descripción del servicio</h3><p>Contex360 es una plataforma ERP SaaS con gestión contable, facturación electrónica DIAN, inventario, analítica y control de acceso.</p></div>
        <div class="lm-section"><h3>2. Condiciones de acceso</h3><ul><li>Acceso mediante credenciales asignadas por el administrador de su organización.</li><li>Cada usuario es responsable de la confidencialidad de su contraseña.</li><li>El uso compartido de credenciales está estrictamente prohibido.</li><li>Se recomienda activar autenticación de dos factores (2FA).</li></ul></div>
        <div class="lm-section"><h3>3. Uso aceptable</h3><ul><li>Uso exclusivo para fines legítimos de gestión empresarial.</li><li>Prohibido acceder a datos de otras organizaciones sin autorización expresa.</li><li>Prohibido realizar ingeniería inversa, descompilar o modificar el software.</li><li>Prohibido introducir código malicioso, virus o ataques de cualquier tipo.</li></ul></div>
        <div class="lm-section"><h3>4. Seguridad de la cuenta</h3><p>Contex360 implementa cifrado TLS 1.2+, hashing bcrypt, JWT firmados y 2FA opcional. La seguridad de sus credenciales es responsabilidad del usuario.</p></div>
        <div class="lm-section"><h3>5. Datos y privacidad</h3><p>El tratamiento de datos se rige por la <strong>Política de Privacidad</strong> (Ley 1581 de 2012). Los datos empresariales son propiedad de la organización usuaria.</p></div>
        <div class="lm-section"><h3>6. Propiedad intelectual</h3><p>El software, diseño y marcas de Contex360 están protegidos por la legislación colombiana e internacional.</p></div>
        <div class="lm-section"><h3>7. Limitación de responsabilidad</h3><p>La responsabilidad máxima de Contex360 ante cualquier reclamación se limita al valor pagado en los últimos 30 días.</p></div>
        <div class="lm-section" style="margin-bottom:0"><h3>8. Legislación aplicable</h3><p>Estos términos se rigen por las leyes de Colombia. Controversias: tribunales de Bogotá D.C.</p></div>
      </div></div>
      <div class="lm-foot"><button class="lm-accept" @click="showTermsModal = false">Entendido</button></div>
    </div>
  </div>
  <div v-if="showPrivacyModal" class="lm-overlay" role="dialog" aria-modal="true" @click.self="showPrivacyModal = false">
    <div class="lm-modal">
      <div class="lm-header">
        <div><h2 class="lm-title">Política de Privacidad</h2><p class="lm-subtitle">Última actualización: 12 de mayo de 2026 · Ley 1581 de 2012</p></div>
        <button class="lm-close" @click="showPrivacyModal = false" aria-label="Cerrar"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
      <div class="lm-body"><div class="lm-inner">
        <p class="lm-intro">De conformidad con la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>, Contex360 informa su política de tratamiento de datos personales.</p>
        <div class="lm-section"><h3>1. Responsable del tratamiento</h3><p>Contex360 es el responsable del tratamiento de los datos recopilados a través de esta plataforma.</p></div>
        <div class="lm-section"><h3>2. Datos que recopilamos</h3><ul><li>Nombre completo y correo electrónico (identificación)</li><li>Dirección IP y agente de usuario (seguridad y trazabilidad)</li><li>Datos de la empresa: NIT, razón social, ciudad, sector</li><li>Información contable: facturas, movimientos, productos, terceros</li></ul></div>
        <div class="lm-section"><h3>3. Seguridad</h3><p>TLS 1.2+ en tránsito, AES-256 en reposo (Neon/AWS), bcrypt para contraseñas, JWT firmados. Proveedores certificados <strong>SOC 2 Type II</strong> e <strong>ISO 27001</strong>.</p></div>
        <div class="lm-section"><h3>4. Derechos del titular (Art. 8 Ley 1581)</h3><ul><li><strong>Conocer, actualizar y rectificar</strong> sus datos personales</li><li><strong>Suprimir</strong> datos cuando no sean necesarios (derecho al olvido)</li><li><strong>Revocar</strong> la autorización para el tratamiento</li><li><strong>Presentar quejas</strong> ante la SIC</li></ul></div>
        <div class="lm-section" style="margin-bottom:0"><h3>5. Notificación de brechas</h3><p>En caso de vulneración, notificaremos a titulares y a la SIC dentro de las <strong>72 horas</strong> siguientes al conocimiento del incidente.</p></div>
      </div></div>
      <div class="lm-foot"><button class="lm-accept" @click="showPrivacyModal = false">Entendido</button></div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  background: #ffffff;
  color: #020617;
  color-scheme: light;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-family: "Inter", "Segoe UI", sans-serif;
}

:global(html.dark) .auth-page {
  background: #0b1220;
  color: #e5e7eb;
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
    linear-gradient(160deg, #1a0f00 0%, #2d1800 50%, #1f1000 100%);
  color: #fff7ed;
  overflow: hidden;
  position: relative;
}

.auth-story::before {
  background-image:
    linear-gradient(rgba(255, 165, 0, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 165, 0, 0.07) 1px, transparent 1px);
  background-size: 72px 72px;
  content: '';
  inset: 0;
  opacity: 0.5;
  position: absolute;
}

.auth-story__orb {
  border: 1px solid rgba(255, 165, 0, 0.15);
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
  background: linear-gradient(135deg, #f97316, #f59e0b);
  border: 1px solid rgba(255, 165, 0, 0.3);
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
  color: rgba(253, 186, 116, 0.70);
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
  color: #fb923c;
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
  line-height: 1.1;
  margin: 0 0 20px;
  max-width: 520px;
}

.auth-story__copy h1 strong {
  display: block;
  font-weight: 700;
}

.auth-story__lead {
  color: rgba(253, 230, 195, 0.78);
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
  color: #fef3c7;
  font-size: clamp(1.9rem, 2.45vw, 2.6rem);
  font-weight: 400;
  line-height: 1;
}

.auth-metric dd {
  color: rgba(253, 186, 116, 0.65);
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
  color: #fb923c;
  flex-shrink: 0;
  height: 18px;
  width: 18px;
}

.auth-story__footer {
  align-items: center;
  color: rgba(253, 186, 116, 0.55);
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
  color: #fed7aa;
}

.auth-form-panel {
  background: #ffffff;
  color: #020617;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: auto;
}

:global(html.dark) .auth-form-panel {
  background: #0b1220;
  color: #e5e7eb;
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


.auth-support {
  align-items: center;
  color: #3d495d;
  display: flex;
  gap: 14px;
  font-size: 0.9rem;
}

:global(html.dark) .auth-support {
  color: #cbd5e1;
}

.auth-support a {
  color: #0f1727;
  font-weight: 600;
  text-decoration: none;
}

:global(html.dark) .auth-support a {
  color: #f8fafc;
}

.auth-support a:hover {
  text-decoration: underline;
}

.auth-mobile-brand {
  align-items: center;
  background: linear-gradient(180deg, #ffffff, rgba(247, 250, 255, 0.86));
  border: 1px solid rgba(208, 217, 231, 0.92);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  display: none;
  gap: 10px;
  padding: 10px 12px;
  font-weight: 700;
}

:global(html.dark) .auth-mobile-brand {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(17, 24, 39, 0.96));
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
}

.auth-mobile-brand__mark {
  background: linear-gradient(135deg, #f97316, #f59e0b);
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
  color: #020617;
  font-size: 0.98rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

:global(html.dark) .auth-mobile-brand__name {
  color: #e5e7eb;
}

.auth-mobile-brand__subtitle {
  color: #475569;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.2;
}

:global(html.dark) .auth-mobile-brand__subtitle {
  color: #94a3b8;
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
  color: #020617;
  font-size: 2.25rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 8px;
}

.auth-form-head p {
  color: #475569;
  font-size: 0.95rem;
  margin: 0;
}

.auth-feedback {
  color: #be123c;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.45;
  margin: 0 0 14px;
  padding: 12px 14px;
}

.auth-feedback--success {
  background: #ecfdf3;
  border: 1px solid #b7ebc0;
  color: #0f7a4a;
}

.auth-form {
  display: grid;
  gap: 24px;
}

.auth-field {
  display: grid;
  gap: 8px;
}

.auth-field > span,
.auth-field__header > span {
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
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
  color: #475569;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  padding: 0;
}

.auth-inline-action:hover {
  color: #020617;
}

.auth-input-shell {
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
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

:global(html.dark) .auth-input-shell {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(148, 163, 184, 0.22);
}

.auth-input-shell:focus-within {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
}

:global(html.dark) .auth-input-shell:focus-within {
  border-color: #e5e7eb;
}

.auth-input-shell input {
  background: transparent;
  border: 0;
  color: #0f172a;
  font-size: 1.125rem;
  height: 48px;
  padding: 0;
  width: 100%;
}

:global(html.dark) .auth-input-shell input {
  color: #e5e7eb;
}

.auth-input-shell input:focus {
  outline: none;
}

.auth-input-shell input::placeholder {
  color: #94a3b8;
}

.auth-toggle {
  align-items: center;
  background: transparent;
  border: 0;
  color: #475569;
  cursor: pointer;
  display: inline-grid;
  height: 26px;
  justify-content: center;
  padding: 0;
  width: 26px;
}

.auth-toggle:hover {
  color: #020617;
}

:global(html.dark) .auth-toggle:hover {
  color: #e5e7eb;
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
  color: #475569;
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  font-size: 0.9rem;
}

:global(html.dark) .auth-remember {
  color: #94a3b8;
}

.auth-remember input {
  accent-color: #f97316;
  height: 16px;
  width: 16px;
}

.auth-recovery-note {
  background: #eef4ff;
  border: 1px solid #d6e2ff;
  border-radius: 11px;
  color: #334155;
  line-height: 1.5;
  margin: 0;
  padding: 11px 13px;
}

:global(html.dark) .auth-recovery-note {
  background: rgba(30, 41, 59, 0.78);
  border-color: rgba(96, 165, 250, 0.18);
  color: #dbeafe;
}

.auth-primary {
  background: linear-gradient(135deg, #f97316, #f59e0b);
  border: 0;
  border-radius: 11px;
  color: #ffffff;
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: 600;
  min-height: 52px;
  padding: 0 18px;
  transition:
    background 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

:global(html.dark) .auth-primary {
  background: #2563eb;
}

.auth-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ea6c0e, #d97706);
  box-shadow: 0 10px 22px rgba(249, 115, 22, 0.30);
  transform: translateY(-1px);
}

:global(html.dark) .auth-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.auth-primary:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.auth-divider {
  align-items: center;
  color: #475569;
  display: flex;
  gap: 14px;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  margin: 24px 0 20px;
  text-transform: uppercase;
}

:global(html.dark) .auth-divider {
  color: #94a3b8;
}

.auth-divider::before,
.auth-divider::after {
  background: #dde3ea;
  content: '';
  flex: 1;
  height: 1px;
}

:global(html.dark) .auth-divider::before,
:global(html.dark) .auth-divider::after {
  background: rgba(148, 163, 184, 0.2);
}

.auth-sso {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.auth-sso-button {
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(208, 217, 231, 0.92);
  border-radius: 11px;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  font-size: 0.92rem;
  font-weight: 500;
  gap: 10px;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

:global(html.dark) .auth-sso-button {
  background: rgba(15, 23, 42, 0.96);
  border-color: rgba(148, 163, 184, 0.2);
  color: #e5e7eb;
}

.auth-sso-button:hover {
  background: rgba(247, 250, 255, 0.86);
  border-color: rgba(208, 217, 231, 0.92);
  transform: translateY(-1px);
}

:global(html.dark) .auth-sso-button:hover {
  background: rgba(17, 24, 39, 0.96);
}

.auth-sso-button svg {
  flex-shrink: 0;
  height: 18px;
  width: 18px;
}

.auth-demo {
  color: #3d495d;
  font-size: 0.92rem;
  margin: 18px 0 0;
  text-align: center;
}

:global(html.dark) .auth-demo {
  color: #cbd5e1;
}

.auth-demo a {
  color: #ea580c;
  font-weight: 700;
  text-decoration: none;
}

:global(html.dark) .auth-demo a {
  color: #f8fafc;
}

.auth-demo a:hover {
  color: #c2410c;
  text-decoration: underline;
}

.auth-proof {
  align-items: center;
  border-top: 1px solid #dde3ea;
  color: #475569;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
  margin-top: 28px;
  padding-top: 20px;
}

:global(html.dark) .auth-proof {
  border-color: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.auth-proof span {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  font-size: 0.84rem;
}

.auth-proof svg {
  color: #475569;
  height: 16px;
  width: 16px;
}

:global(html.dark) .auth-proof svg {
  color: #94a3b8;
}

.auth-mobile-footer {
  display: none;
  color: #475569;
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


/* ─── Footer links ─── */
.auth-footer-copy { color: rgba(255,255,255,.28); font-size: 11px; }
.auth-footer-links { align-items: center; display: flex; gap: 8px; }
.auth-footer-link { background: none; border: none; color: rgba(255,255,255,.38); cursor: pointer; font-size: 11px; padding: 0; transition: color .15s; }
.auth-footer-link:hover { color: rgba(255,255,255,.72); }
.auth-footer-dot { background: rgba(255,255,255,.2); border-radius: 50%; display: inline-block; height: 3px; width: 3px; }

/* ─── Legal modal ─── */
.lm-overlay {
  align-items: center; backdrop-filter: blur(6px); background: rgba(0,0,0,.55);
  display: flex; inset: 0; justify-content: center; padding: 20px;
  position: fixed; z-index: 9999;
}
.lm-modal {
  background: #15232d; border: 1px solid rgba(255,255,255,.08); border-radius: 24px;
  display: flex; flex-direction: column; max-height: 80vh; max-width: 720px;
  overflow: hidden; width: 100%;
}
.lm-header {
  align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,.06);
  display: flex; flex-shrink: 0; justify-content: space-between; padding: 32px 36px 24px;
}
.lm-title { color: #fff; font-size: 32px; font-weight: 700; letter-spacing: -.03em; line-height: 1.1; margin: 0 0 6px; }
.lm-subtitle { color: rgba(255,255,255,.38); font-size: 12px; margin: 0; }
.lm-close {
  align-items: center; background: rgba(255,255,255,.06); border: none; border-radius: 10px;
  color: rgba(255,255,255,.45); cursor: pointer; display: flex; flex-shrink: 0;
  height: 36px; justify-content: center; margin-top: 4px; transition: background .15s, color .15s; width: 36px;
}
.lm-close:hover { background: rgba(255,255,255,.12); color: #fff; }
.lm-body { flex: 1; overflow-y: auto; padding: 32px 36px; }
.lm-body::-webkit-scrollbar { width: 4px; }
.lm-body::-webkit-scrollbar-track { background: transparent; }
.lm-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
.lm-inner { max-width: 65ch; }
.lm-intro {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px; color: rgba(255,255,255,.65); font-size: 14px; line-height: 1.7;
  margin: 0 0 32px; padding: 16px 20px;
}
.lm-intro strong { color: rgba(255,255,255,.85); }
.lm-section { margin-bottom: 32px; }
.lm-section h3 { color: #fff; font-size: 13px; font-weight: 600; letter-spacing: .02em; margin: 0 0 10px; text-transform: uppercase; }
.lm-section p { color: rgba(255,255,255,.72); font-size: 15px; line-height: 1.8; margin: 0; }
.lm-section p strong, .lm-section li strong { color: rgba(255,255,255,.9); }
.lm-section ul { list-style: none; margin: 0; padding: 0; }
.lm-section li { color: rgba(255,255,255,.72); font-size: 15px; line-height: 1.8; padding-left: 20px; position: relative; }
.lm-section li::before { color: rgba(255,255,255,.22); content: '—'; left: 0; position: absolute; }
.lm-foot { border-top: 1px solid rgba(255,255,255,.06); display: flex; flex-shrink: 0; justify-content: flex-end; padding: 20px 36px; }
.lm-accept { background: #fff; border: none; border-radius: 10px; color: #15232d; cursor: pointer; font-size: 14px; font-weight: 600; padding: 10px 28px; transition: opacity .15s; }
.lm-accept:hover { opacity: .88; }
@media (max-width: 640px) {
  .lm-modal { border-radius: 16px; max-height: 90dvh; }
  .lm-header { padding: 24px 20px 18px; }
  .lm-title { font-size: 24px; }
  .lm-body { padding: 24px 20px; }
  .lm-foot { padding: 16px 20px; }
}</style>
