<script setup>
import { computed, ref } from 'vue'
import { useStateStore } from '../stores/stateStore'

const store = useStateStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const forgotAccessOpen = ref(false)

const isFormValid = computed(() => email.value.includes('@') && password.value.length >= 6)

const handleSubmit = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''
  statusMessage.value = ''

  try {
    const result = await store.loginWithBackend({ email: email.value, password: password.value })

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
            <a href="#">Terminos de uso</a>
            <a href="#">Politica de privacidad</a>
          </footer>
        </div>
      </aside>

      <section class="auth-form-panel">
        <header class="auth-form-panel__topbar">
          <div class="auth-mobile-brand">
            <div class="auth-mobile-brand__mark" aria-hidden="true">C</div>
            <span>Contex360</span>
          </div>

          <div class="auth-support">
            <span>¿Necesitas ayuda?</span>
            <a href="mailto:soporte@contex360.local">Contactar soporte</a>
          </div>
        </header>

        <main class="auth-form-panel__main">
          <div class="auth-form-card">
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

              <div class="auth-row">
                <label class="auth-remember">
                  <input v-model="rememberMe" type="checkbox" />
                  <span>Recordar dispositivo</span>
                </label>
              </div>

              <p v-if="forgotAccessOpen" class="auth-recovery-note">
                Contacta a tu administrador para restablecer el acceso.
              </p>

              <button class="auth-primary" :disabled="!isFormValid || isLoading" type="submit">
                <span aria-hidden="true">{{ isLoading ? 'Verificando...' : 'Iniciar sesión' }}</span>
                <span class="sr-only">{{ isLoading ? 'Verificando...' : 'Iniciar sesion' }}</span>
              </button>
            </form>

            <div class="auth-divider">o continua con</div>

            <div class="auth-sso">
              <button class="auth-sso-button" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.54 12.28c0-.79-.07-1.55-.2-2.28H12v4.33h5.92a5.1 5.1 0 0 1-2.21 3.35v2.79h3.58c2.09-1.93 3.25-4.78 3.25-8.19Z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.67l-3.58-2.79c-.98.66-2.23 1.06-3.7 1.06-2.86 0-5.29-1.93-6.16-4.53H2.17v2.84A10.99 10.99 0 0 0 12 23Z" />
                  <path fill="#FBBC05" d="M5.84 14.07c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V7.07H2.17A10.95 10.95 0 0 0 1 12c0 1.78.43 3.46 1.17 4.93l3.67-2.86Z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.44 2.09 14.96 1 12 1 7.7 1 3.99 3.47 2.17 7.07l3.67 2.86C6.71 7.3 9.14 5.38 12 5.38Z" />
                </svg>
                <span>Google</span>
              </button>

              <button class="auth-sso-button" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#F35325" d="M1 1h10v10H1z" />
                  <path fill="#81BC06" d="M13 1h10v10H13z" />
                  <path fill="#05A6F0" d="M1 13h10v10H1z" />
                  <path fill="#FFBA08" d="M13 13h10v10H13z" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

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
          </div>
        </main>

        <footer class="auth-mobile-footer">
          &copy; 2026 Contex360. Todos los derechos reservados.
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  background: #f5f7fb;
  color: #0f1727;
  color-scheme: light;
  min-height: 100vh;
  overflow: hidden;
}

@media (min-width: 1101px) {
  .auth-page {
    zoom: 0.75;
  }
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  min-height: 100vh;
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
  height: 290px;
  right: 10%;
  top: 8%;
  width: 290px;
}

.auth-story__orb--bottom {
  bottom: -70px;
  height: 380px;
  right: -40px;
  width: 380px;
}

.auth-story__content {
  display: flex;
  flex-direction: column;
  gap: 36px;
  height: 100%;
  padding: 54px 42px 34px 42px;
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
  font-size: 1.1rem;
  font-weight: 700;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.auth-brand__name {
  font-size: 1.52rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
}

.auth-brand__subtitle {
  color: rgba(224, 233, 242, 0.62);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  margin-top: 5px;
  text-transform: uppercase;
}

.auth-story__copy {
  margin-top: 70px;
  max-width: 560px;
}

.auth-eyebrow {
  color: #27e0d2;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  margin: 0 0 18px;
  text-transform: uppercase;
}

.auth-story__copy h1 {
  font-size: clamp(2.95rem, 4.8vw, 4.55rem);
  font-weight: 400;
  letter-spacing: -0.06em;
  line-height: 0.98;
  margin: 0 0 28px;
  max-width: 640px;
}

.auth-story__copy h1 strong {
  display: block;
  font-weight: 700;
}

.auth-story__lead {
  color: rgba(234, 240, 248, 0.78);
  font-size: 1.08rem;
  line-height: 1.7;
  margin: 0;
  max-width: 560px;
}

.auth-metrics {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 2px 0 0;
  max-width: 560px;
}

.auth-metric dt {
  color: #ffffff;
  font-size: clamp(2.2rem, 3vw, 3rem);
  font-weight: 400;
  line-height: 1;
}

.auth-metric dd {
  color: rgba(221, 230, 240, 0.62);
  font-size: 0.95rem;
  margin: 8px 0 0;
}

.auth-features {
  display: grid;
  gap: 14px;
  list-style: none;
  margin: 0;
  max-width: 560px;
  padding: 0;
}

.auth-features li {
  align-items: center;
  display: flex;
  gap: 14px;
  font-size: 1rem;
  line-height: 1.4;
}

.auth-features svg {
  color: #27e0d2;
  flex-shrink: 0;
  height: 20px;
  width: 20px;
}

.auth-story__footer {
  align-items: center;
  color: rgba(221, 230, 240, 0.55);
  display: flex;
  flex-wrap: wrap;
  gap: 34px;
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
  background: #f5f7fb;
  color: #0f1727;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: auto;
}

.auth-form-panel__topbar {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding: 28px 34px 0;
}

.auth-support {
  align-items: center;
  color: #3d495d;
  display: flex;
  gap: 18px;
  font-size: 0.98rem;
}

.auth-support a {
  color: #0f1727;
  font-weight: 600;
  text-decoration: none;
}

.auth-support a:hover {
  text-decoration: underline;
}

.auth-mobile-brand {
  align-items: center;
  display: none;
  gap: 10px;
  font-weight: 700;
}

.auth-mobile-brand__mark {
  background: #182430;
  border-color: transparent;
  height: 32px;
  width: 32px;
}

.auth-form-panel__main {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 22px 42px 46px;
}

.auth-form-card {
  width: min(100%, 494px);
}

.auth-form-head {
  margin-bottom: 28px;
}

.auth-form-head h2 {
  color: #0e1727;
  font-size: clamp(2.15rem, 3vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.05em;
  line-height: 1.05;
  margin: 0 0 8px;
}

.auth-form-head p {
  color: #68778f;
  font-size: 1rem;
  margin: 0;
}

.auth-feedback {
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.45;
  margin: 0 0 18px;
  padding: 14px 16px;
}

.auth-feedback--success {
  background: #ecfdf3;
  border: 1px solid #b7ebc0;
  color: #0f7a4a;
}

.auth-feedback--error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #be123c;
}

.auth-form {
  display: grid;
  gap: 18px;
}

.auth-field {
  display: grid;
  gap: 10px;
}

.auth-field > span,
.auth-field__header > span {
  color: #0f1727;
  font-size: 1rem;
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
  color: #4b5563;
  cursor: pointer;
  font-size: 0.94rem;
  font-weight: 500;
  padding: 0;
}

.auth-inline-action:hover {
  color: #111827;
}

.auth-input-shell {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d6dbe5;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 48px;
  padding: 0 14px 0 16px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.auth-input-shell:focus-within {
  border-color: #344054;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
}

.auth-input-shell input {
  background: transparent;
  border: 0;
  color: #101828;
  font-size: 1rem;
  min-height: 56px;
  padding: 0;
  width: 100%;
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
  color: #7c8596;
  cursor: pointer;
  display: inline-grid;
  height: 28px;
  justify-content: center;
  padding: 0;
  width: 28px;
}

.auth-toggle:hover {
  color: #111827;
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
  font-size: 0.96rem;
}

.auth-remember input {
  accent-color: #111827;
  height: 16px;
  width: 16px;
}

.auth-recovery-note {
  background: #eef4ff;
  border: 1px solid #d6e2ff;
  border-radius: 12px;
  color: #334155;
  line-height: 1.5;
  margin: 0;
  padding: 12px 14px;
}

.auth-primary {
  background: #3d4654;
  border: 0;
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  min-height: 50px;
  padding: 0 18px;
  transition:
    background 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.auth-primary:hover:not(:disabled) {
  background: #2f3946;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.auth-primary:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.auth-divider {
  align-items: center;
  color: #93a1b5;
  display: flex;
  gap: 18px;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  margin: 30px 0 26px;
  text-transform: uppercase;
}

.auth-divider::before,
.auth-divider::after {
  background: #dde3ea;
  content: '';
  flex: 1;
  height: 1px;
}

.auth-sso {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.auth-sso-button {
  align-items: center;
  background: #ffffff;
  border: 1px solid #d7dee8;
  border-radius: 10px;
  color: #0f1727;
  cursor: pointer;
  display: inline-flex;
  font-weight: 500;
  gap: 12px;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.auth-sso-button:hover {
  background: #f8fafc;
  border-color: #cfd8e3;
  transform: translateY(-1px);
}

.auth-sso-button svg {
  flex-shrink: 0;
  height: 20px;
  width: 20px;
}

.auth-demo {
  color: #3c4453;
  font-size: 1rem;
  margin: 24px 0 0;
  text-align: center;
}

.auth-demo a {
  color: #0f1727;
  font-weight: 700;
  text-decoration: none;
}

.auth-demo a:hover {
  text-decoration: underline;
}

.auth-proof {
  align-items: center;
  border-top: 1px solid #e3e8ef;
  color: #68778f;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  margin-top: 36px;
  padding-top: 24px;
}

.auth-proof span {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  font-size: 0.9rem;
}

.auth-proof svg {
  color: #7b8798;
  height: 18px;
  width: 18px;
}

.auth-mobile-footer {
  display: none;
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
    justify-content: space-between;
    padding: 18px 18px 0;
  }

  .auth-mobile-brand {
    display: inline-flex;
  }

  .auth-support {
    display: none;
  }

  .auth-form-panel__main {
    align-items: flex-start;
    padding: 24px 18px 28px;
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
    padding: 0 18px 22px;
    text-align: center;
  }
}
</style>
