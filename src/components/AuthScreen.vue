<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { businessApi } from '../services/businessApi'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()

const emit = defineEmits(['request-demo', 'show-terms', 'show-privacy', 'back'])

const email = ref('')
const password = ref('')
const selectedTenant = ref('Contex360 Cloud')
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
      rememberMe: rememberMe.value,
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
      errorMessage.value = result.message || 'Credenciales inválidas. Por favor, verifica tus datos.'
      return
    }

    statusMessage.value = result.message || 'Sesión iniciada.'
  } catch (error) {
    errorMessage.value = error?.message || 'Error de conexión. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (newPassword.value.length < 8) {
    errorMessage.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }
  changePasswordLoading.value = true
  errorMessage.value = ''
  try {
    const res = await businessApi.changePassword(password.value, newPassword.value)
    if (res.ok) {
      requiresPasswordChange.value = false
      password.value = newPassword.value
      statusMessage.value = 'Contraseña actualizada. Iniciando sesión...'
      await handleSubmit()
    }
  } catch (err) {
    errorMessage.value = err?.message || 'Error al cambiar la contraseña.'
  } finally {
    changePasswordLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleSso = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
  window.location.href = `${backendUrl}/auth/oauth/google`
}
</script>

<template>
  <main class="page">

    <!-- ── Columna izquierda: marca y pilares ── -->
    <section class="left">
      <div class="brand">
        <span class="logo-mark">C</span>
        <b>Contex360</b>
      </div>

      <h1>Su back-office en un solo <em>workspace</em>.</h1>
      <p class="lede">La plataforma administrativa de grado Enterprise para empresas que no pueden permitirse la fricción.</p>

      <div class="pillars">
        <div class="pillar">
          <b>Cumplimiento DIAN nativo</b>
          <span>Facturación electrónica certificada y nómina en tiempo real.</span>
        </div>
        <div class="pillar">
          <b>Multi-empresa</b>
          <span>Consolide hasta 50 razones sociales bajo una sola cuenta.</span>
        </div>
        <div class="pillar">
          <b>SSO + Auditoría</b>
          <span>Microsoft, Google y SAML 2.0 con bitácora completa.</span>
        </div>
        <div class="pillar">
          <b>API abierta</b>
          <span>Conecte ERP, e-commerce y bancos sin intermediarios.</span>
        </div>
      </div>

      <div class="trustrow">
        <span class="chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>
          Encriptación SSL/TLS 1.3
        </span>
        <span class="chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
          ISO 27001
        </span>
        <span class="chip">SOC 2 Type II</span>
      </div>
    </section>

    <!-- ── Columna derecha: formulario ── -->
    <div class="card">

      <!-- Cambio de contraseña forzado -->
      <template v-if="requiresPasswordChange">
        <h2>Nueva contraseña</h2>
        <p class="sub">Su contraseña ha expirado. Establezca una nueva para continuar.</p>

        <div v-if="errorMessage" class="msg msg--error">{{ errorMessage }}</div>

        <div class="form">
          <div>
            <label class="label" for="np">Nueva contraseña</label>
            <div class="input-wrap">
              <input id="np" v-model="newPassword" type="password" placeholder="Mínimo 8 caracteres" />
            </div>
          </div>
          <div>
            <label class="label" for="npc">Confirmar contraseña</label>
            <div class="input-wrap">
              <input id="npc" v-model="newPasswordConfirm" type="password" placeholder="Repita la nueva contraseña" />
            </div>
          </div>
          <button class="btn-primary" type="button" :disabled="changePasswordLoading" @click="handleChangePassword">
            {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y acceder' }}
          </button>
        </div>
      </template>

      <!-- Login normal -->
      <template v-else>
        <h2>Inicie sesión</h2>
        <p class="sub">Bienvenido de vuelta. Use sus credenciales corporativas.</p>

        <div v-if="errorMessage" class="msg msg--error">{{ errorMessage }}</div>
        <div v-if="statusMessage" class="msg msg--ok">{{ statusMessage }}</div>

        <form class="form" @submit.prevent="handleSubmit">

          <!-- Email -->
          <div>
            <label class="label" for="email">Correo electrónico</label>
            <div class="input-wrap">
              <span class="ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
              </span>
              <input id="email" v-model="email" name="email" type="email" placeholder="nombre@empresa.com" required />
            </div>
          </div>

          <!-- Workspace -->
          <div>
            <label class="label" for="ws">Organización / Workspace</label>
            <div class="input-wrap">
              <span class="ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>
              </span>
              <select id="ws" v-model="selectedTenant" name="workspace">
                <option>Contex360 Cloud</option>
                <option>Seleccionar al iniciar sesión...</option>
              </select>
              <span class="ic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </div>
          </div>

          <!-- Contraseña -->
          <div>
            <div class="row-head">
              <label class="label" for="pwd" style="margin-bottom:0">Contraseña</label>
              <button type="button" class="link" @click="forgotAccessOpen = !forgotAccessOpen">¿Olvidó su acceso?</button>
            </div>
            <div class="input-wrap with-action">
              <span class="ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>
              </span>
              <input id="pwd" v-model="password" name="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" required />
              <button class="icon-btn" type="button" aria-label="Mostrar contraseña" @click="togglePassword">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <template v-if="showPassword">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </template>
                  <template v-else>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </template>
                </svg>
              </button>
            </div>
            <p v-if="forgotAccessOpen" class="hint-warn">Por favor contacte al administrador de su organización para restablecer su acceso.</p>
          </div>

          <!-- TOTP -->
          <div v-if="requiresTotp" class="totp-block">
            <label class="label" style="text-align:center;display:block">🔐 Código de verificación (2FA)</label>
            <input
              v-model="totpCode"
              type="text"
              maxlength="6"
              placeholder="000000"
              class="totp-input"
            />
          </div>

          <!-- Políticas -->
          <label class="check-label">
            <input v-model="hasAcceptedPrivacy" type="checkbox" class="check-input" />
            <span class="check-box" :class="{ on: hasAcceptedPrivacy }" />
            Acepto la Política de Tratamiento de Datos Personales.
          </label>

          <label class="check-label">
            <input v-model="rememberMe" type="checkbox" class="check-input" />
            <span class="check-box" :class="{ on: rememberMe }" />
            Mantener sesión iniciada
          </label>

          <!-- Botón principal -->
          <button
            class="btn-primary"
            type="submit"
            :disabled="isLoading || (requiresTotp && totpCode.length < 6)"
          >
            <span>{{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}</span>
            <svg v-if="!isLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </button>

          <div class="divider"><span>O</span></div>

          <!-- SSO -->
          <button class="btn-ghost" type="button" @click="handleSso">
            Continuar con SSO empresarial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>

          <div class="footer-line">
            ¿No tiene cuenta?
            <button type="button" class="link" @click="$emit('request-demo')">Solicite una demo</button>
          </div>
        </form>
      </template>
    </div>

  </main>
</template>

<style scoped>
:root {
  --ink: #0a0a0a;
  --ink-2: #1a1a1a;
  --muted: #6b7280;
  --muted-2: #9ca3af;
  --line: #e5e7eb;
  --bg: #ffffff;
  --bg-2: #f7f8fa;
  --blue: #2563eb;
  --blue-d: #1d4ed8;
}

* { box-sizing: border-box; }

.page {
  min-height: 100vh;
  padding: 48px;
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 56px;
  align-items: center;
  background:
    radial-gradient(900px 500px at 90% 0%, rgba(37,99,235,0.06), transparent 60%),
    var(--bg);
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

/* ── Left ── */
.left { padding: 0 8px; max-width: 640px; }

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.logo-mark {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--ink); color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 20px;
}
.brand b { font-weight: 700; font-size: 17px; letter-spacing: -0.01em; }

.left h1 {
  font-size: 52px; line-height: 1.02; letter-spacing: -0.03em;
  font-weight: 700; margin: 0 0 16px; text-wrap: balance;
}
.left h1 em { font-style: normal; color: var(--blue); }

.lede {
  font-size: 17px; color: var(--muted); line-height: 1.55;
  margin: 0 0 36px; max-width: 460px;
}

.pillars { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 28px; max-width: 520px; }
.pillar { border-top: 1px solid var(--line); padding-top: 14px; }
.pillar b { display: block; font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.pillar span { font-size: 13px; color: var(--muted); line-height: 1.4; }

.trustrow { margin-top: 40px; display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border: 1px solid var(--line); border-radius: 999px;
  font-size: 11px; color: var(--muted); background: #fff;
}

/* ── Card ── */
.card {
  background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 36px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02), 0 24px 60px -20px rgba(10,10,10,0.12);
}
.card h2 { font-size: 22px; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.02em; }
.card .sub { font-size: 13px; color: var(--muted); margin: 0 0 24px; }

/* Mensajes */
.msg {
  margin-bottom: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
.msg--error { background: #fef2f2; border: 1px solid #fee2e2; color: #dc2626; }
.msg--ok    { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }

/* Form */
.form { display: flex; flex-direction: column; gap: 20px; }

.label {
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--muted); font-weight: 500; margin-bottom: 8px; display: block;
}

.input-wrap {
  border: 1px solid var(--line); border-radius: 10px; padding: 4px 14px;
  background: #fff; display: flex; align-items: center; gap: 10px;
  transition: border-color .15s, box-shadow .15s;
}
.input-wrap:focus-within {
  border-color: var(--ink);
  box-shadow: 0 0 0 4px rgba(10,10,10,0.04);
}
.input-wrap input,
.input-wrap select {
  flex: 1; border: none; outline: none; background: transparent;
  font: inherit; font-size: 14px; padding: 10px 0; color: var(--ink);
  appearance: none; -webkit-appearance: none;
}
.input-wrap.with-action { padding-right: 8px; }
.ic { color: var(--muted-2); display: inline-flex; flex-shrink: 0; }

.icon-btn {
  background: transparent; border: none; padding: 6px; border-radius: 6px;
  cursor: pointer; color: var(--muted); display: inline-flex; align-items: center;
}
.icon-btn:hover { background: var(--bg-2); color: var(--ink); }

.row-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }

.link {
  background: none; border: none; padding: 0;
  color: var(--blue); text-decoration: none; font-weight: 600; font-size: 12px;
  cursor: pointer;
}
.link:hover { text-decoration: underline; }

.hint-warn { font-size: 11px; color: #d97706; font-weight: 500; margin-top: 6px; }

/* TOTP */
.totp-block {
  padding: 16px; background: rgba(37,99,235,0.04);
  border: 1px solid rgba(37,99,235,0.12); border-radius: 12px;
}
.totp-input {
  width: 100%; margin-top: 10px; padding: 12px;
  text-align: center; font-size: 20px; font-family: monospace;
  letter-spacing: 0.5em; border: 1px solid var(--line);
  border-radius: 10px; outline: none;
  transition: border-color .15s;
}
.totp-input:focus { border-color: var(--blue); }

/* Checkbox custom */
.check-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--ink-2); cursor: pointer;
}
.check-input { display: none; }
.check-box {
  width: 16px; height: 16px; border: 1.5px solid var(--line);
  border-radius: 4px; display: inline-block; position: relative; flex-shrink: 0;
  transition: background .15s, border-color .15s;
}
.check-box.on { background: var(--blue); border-color: var(--blue); }
.check-box.on::after {
  content: ''; position: absolute; left: 4px; top: 1px;
  width: 4px; height: 8px; border: solid #fff; border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Botones */
.btn-primary {
  width: 100%; background: var(--blue); color: #fff; border: none;
  padding: 14px 18px; border-radius: 10px; font: inherit; font-weight: 600;
  font-size: 15px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  transition: background .15s ease;
}
.btn-primary:hover:not(:disabled) { background: var(--blue-d); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-ghost {
  width: 100%; border: 1px solid var(--line); background: #fff;
  padding: 12px 14px; border-radius: 10px; font: inherit;
  font-size: 14px; font-weight: 500; color: var(--ink-2); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-ghost:hover { background: var(--bg-2); }

.divider {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  gap: 10px; color: var(--muted); font-size: 11px; letter-spacing: 0.08em;
}
.divider::before,
.divider::after { content: ''; height: 1px; background: var(--line); }

.footer-line { text-align: center; font-size: 13px; color: var(--muted); }

/* Autofill fix */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--ink) !important;
  -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
  transition: background-color 5000s ease-in-out 0s !important;
}

/* ── Responsive ── */
@media (max-width: 980px) {
  .page {
    grid-template-columns: 1fr;
    padding: 32px 20px;
    gap: 32px;
  }
  .left h1 { font-size: 36px; }
  .pillars { max-width: none; }
  .card { padding: 24px; }
}
</style>
