<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { businessApi } from '../services/businessApi'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const emit = defineEmits(['request-demo', 'show-terms', 'show-privacy'])

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
</script>

<template>
  <div class="pattern-bg min-h-screen flex items-center justify-center p-4 md:p-8 font-inter">
    <main class="w-full max-w-[480px]">
      <!-- Brand Header -->
      <div class="flex flex-col items-center mb-8">
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-[40px] text-[#0051d5]">business_center</span>
          <h1 class="text-3xl font-bold text-[#0b1c30] tracking-tight">Contex360</h1>
        </div>
        <p class="text-sm text-[#45464d]">ERP Administrativo y Contable</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
        
        <!-- Password Change Flow -->
        <template v-if="requiresPasswordChange">
          <div class="mb-8 text-center">
            <h2 class="text-xl font-semibold text-[#0b1c30] mb-2">Contraseña expirada</h2>
            <p class="text-sm text-[#45464d]">Tu contraseña ha vencido. Por seguridad debes establecer una nueva.</p>
          </div>
          
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center">
            {{ errorMessage }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1">Nueva contraseña</label>
              <input 
                v-model="newPassword" 
                type="password" 
                class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1">Confirmar contraseña</label>
              <input 
                v-model="newPasswordConfirm" 
                type="password" 
                class="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all"
                placeholder="Repite la nueva contraseña"
              />
            </div>
            <button 
              @click="handleChangePassword"
              class="w-full py-4 bg-[#131b2e] text-white font-semibold text-sm rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              :disabled="changePasswordLoading || newPassword.length < 8"
            >
              {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y continuar' }}
            </button>
          </div>
        </template>

        <!-- Normal Login Flow -->
        <template v-else>
          <div class="mb-8 text-center">
            <h2 class="text-xl font-semibold text-[#0b1c30] mb-2">Bienvenido de nuevo</h2>
            <p class="text-sm text-[#45464d]">Ingresa tus credenciales para acceder</p>
          </div>

          <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center">
            {{ errorMessage }}
          </div>
          
          <div v-if="statusMessage" class="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-lg text-center">
            {{ statusMessage }}
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1" for="email">Correo electrónico</label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-4 text-[#76777d] text-[20px]">mail</span>
                <input 
                  id="email" 
                  v-model="email"
                  type="email" 
                  required
                  placeholder="nombre@empresa.com"
                  class="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all placeholder:text-[#76777d]/60"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-medium text-[#45464d] mb-2 ml-1" for="password">Contraseña</label>
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-4 text-[#76777d] text-[20px]">lock</span>
                <input 
                  id="password" 
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  placeholder="••••••••"
                  class="w-full pl-12 pr-12 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#0b1c30] focus:ring-2 focus:ring-[#0051d5]/20 focus:border-[#0051d5] outline-none transition-all placeholder:text-[#76777d]/60"
                />
                <button 
                  type="button"
                  @click="togglePassword"
                  class="absolute right-4 text-[#76777d] hover:text-[#0b1c30] transition-colors"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- 2FA Block -->
            <div v-if="requiresTotp" class="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <label class="block text-xs font-bold text-[#0b1c30]">🔐 Código de verificación (2FA)</label>
              <input 
                v-model="totpCode"
                type="text"
                maxlength="6"
                placeholder="000000"
                class="w-full px-4 py-2 text-center text-lg font-mono tracking-[0.5em] border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0051d5]/20 outline-none"
              />
              <p class="text-[10px] text-[#45464d] text-center italic">Ingresa el código de 6 dígitos de tu aplicación.</p>
            </div>

            <!-- Helpers -->
            <div class="space-y-3 py-2">
              <label class="flex items-start gap-2 cursor-pointer group">
                <input v-model="hasAcceptedPrivacy" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-[#E2E8F0] text-[#0051d5] focus:ring-[#0051d5]/20" />
                <span class="text-xs text-[#45464d] group-hover:text-[#0b1c30] transition-colors">
                  Acepto la Política de Tratamiento de Datos (Ley 1581)
                </span>
              </label>

              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 cursor-pointer group">
                  <input v-model="rememberMe" type="checkbox" class="w-4 h-4 rounded border-[#E2E8F0] text-[#0051d5] focus:ring-[#0051d5]/20" />
                  <span class="text-xs text-[#45464d] group-hover:text-[#0b1c30] transition-colors">Recordarme</span>
                </label>
                <a @click.prevent="forgotAccessOpen = true" class="text-xs text-[#0051d5] hover:underline font-semibold cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              
              <p v-if="forgotAccessOpen" class="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 text-center animate-in fade-in slide-in-from-top-1">
                Por favor, contacta al administrador de tu sistema para restablecer tu acceso.
              </p>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="w-full py-4 bg-[#131b2e] text-white font-semibold text-sm rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              :disabled="isLoading || (requiresTotp && totpCode.length < 6)"
            >
              <span>{{ isLoading ? 'Verificando...' : 'Entrar' }}</span>
              <span class="material-symbols-outlined text-[20px]">login</span>
            </button>
          </form>
        </template>

        <!-- Footer -->
        <div class="mt-8 pt-8 border-t border-[#E2E8F0] text-center">
          <p class="text-sm text-[#45464d]">
            ¿No tienes una cuenta? 
            <a @click.prevent="$emit('request-demo')" class="text-[#0051d5] font-semibold hover:underline cursor-pointer">Solicita una demo</a>
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="flex justify-center items-center gap-6 mt-8">
        <div class="flex items-center gap-1 text-[#45464d] opacity-60">
          <span class="material-symbols-outlined text-[16px]">language</span>
          <span class="text-[12px]">Español (Colombia)</span>
        </div>
        <div class="flex items-center gap-1 text-[#45464d] opacity-60">
          <span class="material-symbols-outlined text-[16px]">verified_user</span>
          <span class="text-[12px]">Conexión Segura</span>
        </div>
      </div>
    </main>

    <!-- Decoration -->
    <div class="hidden lg:block fixed bottom-12 right-12 opacity-[0.03] pointer-events-none">
      <span class="material-symbols-outlined text-[240px]">account_balance</span>
    </div>
  </div>
</template>

<style scoped>
.pattern-bg {
  background-color: #f8f9ff;
  background-image: radial-gradient(#d3e4fe 1px, transparent 1px);
  background-size: 24px 24px;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
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
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
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
  accent-color: #059669;
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
  background: linear-gradient(135deg, #1D4ED8, #2563EB);
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
  background: linear-gradient(135deg, #1E40AF, #1D4ED8);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.30);
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
  color: #059669;
  font-weight: 700;
  text-decoration: none;
}

:global(html.dark) .auth-demo a {
  color: #f8fafc;
}

.auth-demo a:hover {
  color: #047857;
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
