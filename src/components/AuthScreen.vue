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
  <div class="auth-page bg-[#0B0F1A]">
    <div class="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <!-- Left Side: Dark Panel -->
      <aside class="hidden lg:flex flex-col justify-between p-12 bg-[#0B0F1A] text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
        </div>

        <div class="relative z-10">
          <header class="flex items-center gap-3 mb-16">
            <div class="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center font-bold text-emerald-400 text-xl">C</div>
            <div>
              <div class="text-xl font-bold tracking-tight">Contex360</div>
              <div class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Enterprise Resource Planning</div>
            </div>
          </header>

          <div class="max-w-md">
            <p class="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Plataforma ERP Empresarial</p>
            <h1 class="text-5xl font-bold leading-[1.1] mb-6 tracking-tight">
              Plataforma Integral de <br/>
              <span class="text-emerald-400">Gestión Empresarial</span>
            </h1>
            <p class="text-slate-400 text-lg leading-relaxed mb-12">
              Optimiza tus finanzas, inventarios y cumplimiento DIAN con la suite contable más avanzada del mercado.
            </p>

            <ul class="space-y-4">
              <li v-for="feat in ['Multi-tenant con aislamiento completo', 'Reportes financieros en tiempo real', 'Integración DIAN automatizada', 'Seguridad bancaria AES-256']" :key="feat" class="flex items-center gap-3 text-slate-300">
                <div class="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <svg class="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-sm font-medium">{{ feat }}</span>
              </li>
            </ul>
          </div>
        </div>

        <footer class="relative z-10 flex items-center gap-6 text-slate-500 text-xs font-medium">
          <span>&copy; 2026 Contex360</span>
          <div class="flex gap-4">
            <button @click="showTermsModal = true" class="hover:text-white transition-colors">Términos</button>
            <button @click="showPrivacyModal = true" class="hover:text-white transition-colors">Privacidad</button>
          </div>
        </footer>
      </aside>

      <!-- Right Side: White Panel -->
      <section class="bg-white flex flex-col justify-center items-center p-8 lg:p-24 relative">
        <!-- Mobile Logo -->
        <header class="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-white">C</div>
          <span class="font-bold text-slate-900">Contex360</span>
        </header>

        <div class="w-full max-w-sm">
          <template v-if="requiresPasswordChange">
            <div class="mb-10">
              <h2 class="text-3xl font-bold text-slate-900 mb-2">Contraseña expirada</h2>
              <p class="text-slate-600">Por seguridad debes establecer una nueva para continuar.</p>
            </div>
            
            <p v-if="errorMessage" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-100 text-red-600 text-sm font-medium">{{ errorMessage }}</p>

            <form @submit.prevent="handleChangePassword" class="space-y-6">
              <div class="space-y-1.5">
                <label class="text-sm font-bold text-slate-900 ml-1">Nueva contraseña</label>
                <input v-model="newPassword" type="password" placeholder="Mínimo 8 caracteres" class="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 outline-none transition-all" />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-bold text-slate-900 ml-1">Confirmar contraseña</label>
                <input v-model="newPasswordConfirm" type="password" placeholder="Repite la contraseña" class="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 outline-none transition-all" />
              </div>
              <button
                type="submit"
                :disabled="changePasswordLoading || newPassword.length < 8 || newPassword !== newPasswordConfirm"
                class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all"
              >
                {{ changePasswordLoading ? 'Actualizando...' : 'Guardar y continuar' }}
              </button>
            </form>
          </template>

          <template v-else>
            <div class="mb-10">
              <h2 class="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Bienvenido</h2>
              <p class="text-slate-600 font-medium">Ingresa tus credenciales para acceder</p>
            </div>

            <p v-if="errorMessage" class="mb-6 p-4 bg-red-50 rounded-lg border border-red-100 text-red-600 text-sm font-medium">{{ errorMessage }}</p>
            <p v-if="statusMessage" class="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-600 text-sm font-medium">{{ statusMessage }}</p>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div class="space-y-1.5">
                <label class="text-sm font-bold text-slate-900 ml-1">Correo electrónico</label>
                <input v-model="email" type="email" placeholder="nombre@empresa.com" class="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 outline-none transition-all" required />
              </div>

              <div class="space-y-1.5">
                <div class="flex justify-between items-center px-1">
                  <label class="text-sm font-bold text-slate-900">Contraseña</label>
                  <button type="button" @click="toggleRecoveryHelp" class="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">¿Olvidaste tu contraseña?</button>
                </div>
                <div class="relative">
                  <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" class="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 outline-none transition-all" required />
                  <button type="button" @click="togglePassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                    <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.076m3.313-3.313A10.01 10.01 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21m-2.102-2.102L3 3" /></svg>
                  </button>
                </div>
              </div>

              <div v-if="requiresTotp" class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label class="text-xs font-bold text-slate-900 uppercase tracking-widest">Código 2FA</label>
                <input v-model="totpCode" type="text" maxlength="6" placeholder="000000" class="w-full h-12 bg-white border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] text-slate-900 outline-none focus:border-slate-900" />
                <p class="text-[10px] text-slate-500 text-center">Ingresa el código de 6 dígitos de tu app autenticadora</p>
              </div>

              <div class="flex items-center gap-2 py-2">
                <input v-model="rememberMe" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <span class="text-sm font-medium text-slate-600">Recordar dispositivo</span>
              </div>

              <button
                type="submit"
                :disabled="!isFormValid || isLoading || (requiresTotp && totpCode.length < 6)"
                class="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all"
              >
                {{ isLoading ? 'Verificando...' : 'Iniciar sesión' }}
              </button>
            </form>

            <p class="mt-8 text-center text-sm text-slate-500">
              ¿No tienes cuenta? <button @click="$emit('request-demo')" class="font-bold text-slate-900 hover:underline">Solicita una demo</button>
            </p>

            <div class="mt-12 pt-8 border-t border-slate-100 flex justify-center gap-8 opacity-40 grayscale">
              <span class="text-[10px] font-bold text-slate-900 tracking-widest">SSL</span>
              <span class="text-[10px] font-bold text-slate-900 tracking-widest">AES-256</span>
              <span class="text-[10px] font-bold text-slate-900 tracking-widest">ISO 27001</span>
              <span class="text-[10px] font-bold text-slate-900 tracking-widest">SOC 2</span>
            </div>
          </template>
        </div>
      </section>
    </div>

    <!-- Modals (restored) -->
    <div v-if="showTermsModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <header class="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Términos de Uso</h2>
            <p class="text-xs text-slate-500">Actualizado: 12 de mayo de 2026</p>
          </div>
          <button @click="showTermsModal = false" class="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <div class="flex-1 overflow-y-auto p-8 text-slate-600 text-sm leading-relaxed space-y-6">
          <p>Al acceder y utilizar <strong>Contex360</strong> usted acepta los presentes términos. Si no está de acuerdo, no debe utilizar el servicio.</p>
          <div class="space-y-2">
            <h3 class="font-bold text-slate-900">1. Descripción del servicio</h3>
            <p>Contex360 es una plataforma ERP SaaS con gestión contable, facturación electrónica DIAN, inventario, analítica y control de acceso.</p>
          </div>
          <div class="space-y-2">
            <h3 class="font-bold text-slate-900">2. Condiciones de acceso</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Acceso mediante credenciales asignadas por el administrador.</li>
              <li>Cada usuario es responsable de la confidencialidad de su contraseña.</li>
              <li>El uso compartido de credenciales está estrictamente prohibido.</li>
            </ul>
          </div>
        </div>
        <footer class="p-6 border-t border-slate-100 flex justify-end">
          <button @click="showTermsModal = false" class="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl">Entendido</button>
        </footer>
      </div>
    </div>

    <div v-if="showPrivacyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <header class="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Política de Privacidad</h2>
            <p class="text-xs text-slate-500">Ley 1581 de 2012</p>
          </div>
          <button @click="showPrivacyModal = false" class="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <div class="flex-1 overflow-y-auto p-8 text-slate-600 text-sm leading-relaxed space-y-6">
          <p>De conformidad con la <strong>Ley 1581 de 2012</strong>, Contex360 informa su política de tratamiento de datos personales.</p>
          <div class="space-y-2">
            <h3 class="font-bold text-slate-900">1. Seguridad</h3>
            <p>TLS 1.2+ en tránsito, AES-256 en reposo, hashing bcrypt para contraseñas. Proveedores certificados SOC 2 e ISO 27001.</p>
          </div>
          <div class="space-y-2">
            <h3 class="font-bold text-slate-900">2. Derechos del titular</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li>Conocer, actualizar y rectificar sus datos.</li>
              <li>Suprimir datos cuando no sean necesarios.</li>
              <li>Revocar la autorización para el tratamiento.</li>
            </ul>
          </div>
        </div>
        <footer class="p-6 border-t border-slate-100 flex justify-end">
          <button @click="showPrivacyModal = false" class="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl">Entendido</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  /* Forcing light appearance for the login card area regardless of global theme */
  color-scheme: light;
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
