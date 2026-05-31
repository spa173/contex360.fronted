<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { businessApi } from '../services/businessApi'
import { changeExpiredPassword } from '../services/authApi'
import { decryptData } from '../utils/security'
import { toast } from 'vue-sonner'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Iniciar Sesión',
  meta: [
    { name: 'description', content: 'Accede a tu panel de facturación electrónica, inventario y contabilidad en Contex360.' },
    { property: 'og:title', content: 'Iniciar Sesión' },
    { property: 'og:description', content: 'Accede a tu panel de facturación electrónica, inventario y contabilidad en Contex360.' },
    { name: 'twitter:title', content: 'Iniciar Sesión' },
    { name: 'twitter:description', content: 'Accede a tu panel de facturación electrónica, inventario y contabilidad en Contex360.' },
  ]
})

const authStore = useAuthStore()

defineEmits(['request-demo', 'show-terms', 'show-privacy', 'forgot-password', 'back'])

const email = ref('')
const password = ref('')
const selectedTenant = ref('Contex360 Cloud')
const showPassword = ref(false)
const isLoading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')
const statusMessage = ref('')
const requiresTotp = ref(false)
const totpCode = ref('')
const requiresPasswordChange = ref(false)
const resetToken = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const changePasswordLoading = ref(false)
const hasAcceptedPrivacy = ref(false)

// ── Validación de email (RFC 5322 simplificado) ──────────────────────────────
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const isEmailValid = computed(() => EMAIL_RE.test(email.value.trim()))

// ── Política de contraseña para app financiera ────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',    label: 'Mínimo 12 caracteres',          test: (p: string) => p.length >= 12 },
  { id: 'upper',     label: 'Al menos una mayúscula',         test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',     label: 'Al menos una minúscula',         test: (p: string) => /[a-z]/.test(p) },
  { id: 'digit',     label: 'Al menos un número',             test: (p: string) => /\d/.test(p) },
  { id: 'special',   label: 'Al menos un símbolo (!@#$...)',  test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
]

const newPasswordStrength = computed(() =>
  PASSWORD_RULES.map(r => ({ ...r, passed: r.test(newPassword.value) }))
)

const isPasswordStrong = (pw: string) => PASSWORD_RULES.every(r => r.test(pw))

const isFormValid = computed(() => isEmailValid.value && password.value.length > 0)

onMounted(async () => {
  const savedEmail = localStorage.getItem('contex360-remember-email')
  if (savedEmail) {
    try {
      email.value = await decryptData(savedEmail)
    } catch {
      email.value = savedEmail
    }
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
      totpCode: requiresTotp.value && totpCode.value ? totpCode.value : undefined,
      privacyAccepted: hasAcceptedPrivacy.value,
      rememberMe: rememberMe.value,
    }

    const result = await authStore.loginWithBackend(credentials)

    if (result?.requiresTotp) {
      requiresTotp.value = true
      errorMessage.value = ''
      return
    }

    if (result?.requiresPasswordChange) {
      requiresPasswordChange.value = true
      resetToken.value = result.resetToken || ''
      errorMessage.value = ''
      return
    }

    if (result?.requiresPrivacyConsent) {
      showPrivacyConsentModal.value = true
      errorMessage.value = ''
      return
    }

    if (!result.ok) {
      errorMessage.value = result.message || 'Credenciales inválidas. Por favor, verifica tus datos.'
      return
    }

    statusMessage.value = result.message || 'Sesión iniciada.'
  } catch (error) {
    errorMessage.value = (error instanceof Error ? error.message : String(error)) || 'Error de conexión. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const handleChangePassword = async () => {
  if (!isPasswordStrong(newPassword.value)) {
    errorMessage.value = 'La contraseña debe tener mínimo 12 caracteres, mayúsculas, minúsculas, números y símbolos.'
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }
  changePasswordLoading.value = true
  errorMessage.value = ''
  try {
    let res
    if (resetToken.value) {
      res = await changeExpiredPassword(resetToken.value, password.value, newPassword.value)
    } else {
      res = await businessApi.changePassword(password.value, newPassword.value)
    }
    if (res.ok) {
      requiresPasswordChange.value = false
      resetToken.value = ''
      password.value = newPassword.value
      statusMessage.value = 'Contraseña actualizada. Iniciando sesión...'
      await handleSubmit()
    }
  } catch (err) {
    errorMessage.value = (err instanceof Error ? err.message : String(err)) || 'Error al cambiar la contraseña.'
  } finally {
    changePasswordLoading.value = false
  }
}

const showPrivacyConsentModal = ref(false)
const privacyConsentLoading = ref(false)

const handleAcceptPrivacy = async () => {
  privacyConsentLoading.value = true
  try {
    hasAcceptedPrivacy.value = true
    showPrivacyConsentModal.value = false
    toast.success('Política de privacidad aceptada.')
    await handleSubmit()
  } catch {
    toast.error('Error al procesar la política.')
  } finally {
    privacyConsentLoading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="min-h-screen bg-white font-['Inter'] relative overflow-hidden">
    <!-- Subtle blue radial accent (top-right) -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-40 -right-40 w-[900px] h-[600px] rounded-full opacity-60"
      style="background: radial-gradient(closest-side, rgba(37,99,235,0.08), transparent 70%);"
    />

    <!-- Top bar: back button -->
    <div class="relative max-w-[1440px] mx-auto px-6 lg:px-12 pt-8">
      <button
        class="flex items-center gap-2 text-[#71717A] hover:text-[#18181B] transition-colors font-semibold text-sm"
        @click="$emit('back')"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Volver al inicio
      </button>
    </div>

    <!-- Two-column shell -->
    <div
      class="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 lg:gap-14 items-center"
    >
      <!-- ============ LEFT: brand + pillars ============ -->
      <section class="max-w-[640px] animate-in fade-in slide-in-from-left-4 duration-700">
        <!-- Brand -->
        <div class="inline-flex items-center gap-3 mb-7">
          <svg
            class="c360-mark flex-shrink-0"
            width="44"
            height="44"
            viewBox="0 0 56 56"
            aria-hidden="true"
          >
            <rect
              width="56"
              height="56"
              rx="12"
              fill="#18181B"
            />
            <g class="rotor">
              <path
                d="M44 18 A 16 16 0 1 0 44 38"
                stroke="#fff"
                stroke-width="5.5"
                stroke-linecap="round"
                fill="none"
              />
              <path
                d="M44 18 A 16 16 0 0 1 44 38"
                stroke="#2563EB"
                stroke-width="5.5"
                stroke-linecap="round"
                fill="none"
              />
            </g>
          </svg>
          <span class="font-bold text-[20px] tracking-tight text-[#18181B]">Contex360</span>
        </div>

        <!-- Headline -->
        <h1
          class="text-[40px] lg:text-[52px] leading-[1.02] tracking-[-0.03em] font-bold text-[#18181B] mb-4"
          style="text-wrap: balance;"
        >
          Su back-office en un solo <em class="not-italic text-[#2563EB]">workspace</em>.
        </h1>
        <p class="text-[16px] lg:text-[17px] leading-[1.55] text-[#71717A] max-w-[460px] mb-9">
          La plataforma administrativa de grado Enterprise para empresas que no pueden permitirse la fricción.
        </p>

        <!-- Trust pillars -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-7 max-w-[520px]">
          <div class="border-t border-[#E4E4E7] pt-3.5">
            <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Cumplimiento DIAN nativo</b>
            <span class="text-[13px] text-[#71717A] leading-[1.45]">Facturación electrónica certificada y nómina en tiempo real.</span>
          </div>
          <div class="border-t border-[#E4E4E7] pt-3.5">
            <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Multi-empresa</b>
            <span class="text-[13px] text-[#71717A] leading-[1.45]">Consolide múltiples razones sociales bajo una sola cuenta.</span>
          </div>
          <div class="border-t border-[#E4E4E7] pt-3.5">
            <b class="block font-semibold text-[14px] text-[#18181B] mb-1">2FA + Auditoría</b>
            <span class="text-[13px] text-[#71717A] leading-[1.45]">Verificación TOTP y bitácora completa de cada acción.</span>
          </div>
          <div class="border-t border-[#E4E4E7] pt-3.5">
            <b class="block font-semibold text-[14px] text-[#18181B] mb-1">Datos protegidos</b>
            <span class="text-[13px] text-[#71717A] leading-[1.45]">Ley 1581 de 2012 y cifrado SSL/TLS extremo a extremo.</span>
          </div>
        </div>

        <!-- Trust chips -->
        <div class="mt-10 flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
            <span class="material-symbols-outlined text-[14px]">lock</span>
            Encriptación SSL/TLS 1.3
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
            <span class="material-symbols-outlined text-[14px]">verified_user</span>
            Cumplimiento DIAN
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#E4E4E7] rounded-full text-[11px] text-[#71717A] bg-white">
            <span class="material-symbols-outlined text-[14px]">shield</span>
            Ley 1581 de 2012
          </span>
        </div>
      </section>

      <!-- ============ RIGHT: login card ============ -->
      <main class="w-full max-w-[460px] mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="bg-white rounded-[18px] border border-[#E4E4E7] p-8 lg:p-9 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_24px_60px_-20px_rgba(10,10,10,0.12)]">
          <h2 class="text-[22px] font-bold tracking-[-0.02em] text-[#18181B] mb-1">
            Inicie sesión
          </h2>
          <p class="text-[13px] text-[#71717A] mb-7">
            Bienvenido de vuelta. Use sus credenciales corporativas.
          </p>

          <!-- Error / Status Messages -->
          <div
            v-if="errorMessage"
            class="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold rounded-xl text-center"
          >
            {{ errorMessage }}
          </div>
          <div
            v-if="statusMessage"
            class="mb-5 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-bold rounded-xl text-center"
          >
            {{ statusMessage }}
          </div>

          <!-- Password Change Flow -->
          <template v-if="requiresPasswordChange">
            <div class="space-y-5">
              <div class="text-center">
                <p class="text-[13px] text-[#71717A] font-medium">
                  Su contraseña ha expirado. Por favor establezca una nueva.
                </p>
              </div>
              <div>
                <label
                  class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
                  for="newPassword"
                >Nueva Contraseña</label>
                <input
                  id="newPassword"
                  v-model="newPassword"
                  name="newPassword"
                  autocomplete="new-password"
                  type="password"
                  class="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-[10px] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] transition-all text-[14px] font-medium text-[#18181B]"
                >
              </div>

              <!-- New password strength checklist -->
              <div
                v-if="newPassword.length > 0"
                class="mt-2 space-y-1 animate-in fade-in duration-200"
              >
                <p class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Requisitos de seguridad
                </p>
                <div
                  v-for="rule in newPasswordStrength"
                  :key="rule.id"
                  class="flex items-center gap-2 text-[11px] font-medium"
                  :class="rule.passed ? 'text-emerald-600' : 'text-[#A1A1AA]'"
                >
                  <span class="material-symbols-outlined text-[13px]">{{ rule.passed ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  {{ rule.label }}
                </div>
              </div>

              <div>
                <label
                  class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
                  for="newPasswordConfirm"
                >Confirmar Contraseña</label>
                <input
                  id="newPasswordConfirm"
                  v-model="newPasswordConfirm"
                  name="newPasswordConfirm"
                  autocomplete="new-password"
                  type="password"
                  class="w-full px-4 py-3 bg-white border border-[#E4E4E7] rounded-[10px] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] transition-all text-[14px] font-medium text-[#18181B]"
                >
              </div>
              <button
                class="w-full py-3.5 bg-[#2563EB] text-white font-semibold text-[15px] rounded-[10px] hover:bg-[#1D4ED8] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                :disabled="changePasswordLoading"
                @click="handleChangePassword"
              >
                <span>{{ changePasswordLoading ? 'Actualizando...' : 'Guardar y Acceder' }}</span>
                <span
                  v-if="!changePasswordLoading"
                  class="material-symbols-outlined text-[18px]"
                >arrow_forward</span>
              </button>
            </div>
          </template>

          <!-- Normal Login Flow -->
          <template v-else>
            <form
              class="space-y-5"
              @submit.prevent="handleSubmit"
            >
              <!-- Email -->
              <div>
                <label
                  class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
                  for="email"
                >Correo Electrónico</label>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">mail</span>
                  <input
                    id="email"
                    v-model="email"
                    name="email"
                    autocomplete="username"
                    type="email"
                    required
                    placeholder="nombre@empresa.com"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                  >
                </div>
              </div>

              <!-- Tenant Selector -->
              <div>
                <label
                  class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-2 block"
                  for="tenant"
                >Organización / Workspace</label>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] px-3.5 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">apartment</span>
                  <select
                    id="tenant"
                    v-model="selectedTenant"
                    name="tenant"
                    autocomplete="off"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] appearance-none cursor-pointer border-0"
                  >
                    <option>Contex360 Cloud</option>
                    <option>Seleccionar al iniciar sesión...</option>
                  </select>
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA] pointer-events-none">expand_more</span>
                </div>
              </div>

              <!-- Password -->
              <div>
                <div class="flex justify-between items-baseline mb-2">
                  <label
                    class="text-[11px] font-bold text-[#71717A] uppercase tracking-wider"
                    for="password"
                  >Contraseña</label>
                  <button
                    type="button"
                    class="text-[11px] font-semibold text-[#2563EB] hover:underline"
                    @click="$emit('forgot-password')"
                  >
                    ¿Olvidó su acceso?
                  </button>
                </div>
                <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[10px] pl-3.5 pr-1 bg-white focus-within:border-[#18181B] focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                  <span class="material-symbols-outlined text-[18px] text-[#A1A1AA]">lock</span>
                  <input
                    id="password"
                    v-model="password"
                    name="password"
                    autocomplete="current-password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="flex-1 py-3 bg-transparent outline-none text-[14px] font-medium text-[#18181B] placeholder:text-[#A1A1AA] border-0"
                  >
                  <button
                    type="button"
                    class="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-colors"
                    @click="togglePassword"
                  >
                    <span class="material-symbols-outlined text-[18px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>



              <!-- 2FA Block -->
              <div
                v-if="requiresTotp"
                class="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-300"
              >
                <label
                  class="block text-[11px] font-bold text-[#18181B] uppercase tracking-wider text-center"
                  for="totpCode"
                >🔐 Código de Verificación</label>
                <input
                  id="totpCode"
                  v-model="totpCode"
                  name="totpCode"
                  autocomplete="one-time-code"
                  type="text"
                  maxlength="6"
                  placeholder="000000"
                  class="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.5em] border border-[#E4E4E7] rounded-xl focus:border-[#2563EB] outline-none"
                >
              </div>

              <!-- Policies & Remember -->
              <div class="space-y-3 pt-1">
                <label
                  class="flex items-start gap-3 cursor-pointer group"
                  for="hasAcceptedPrivacy"
                >
                  <input
                    id="hasAcceptedPrivacy"
                    v-model="hasAcceptedPrivacy"
                    name="hasAcceptedPrivacy"
                    autocomplete="off"
                    type="checkbox"
                    class="mt-0.5 w-4 h-4 flex-shrink-0 rounded border-[#E4E4E7] text-[#2563EB] focus:ring-[#2563EB]/20 transition-all"
                  >
                  <span class="text-[12px] text-[#71717A] font-medium group-hover:text-[#18181B] transition-colors leading-snug">
                    Acepto los <button
                      type="button"
                      class="text-[#2563EB] hover:underline font-semibold bg-transparent border-0 p-0 inline"
                      @click.stop="$emit('show-privacy')"
                    >términos y condiciones</button>.
                  </span>
                </label>
                <label
                  class="flex items-center gap-3 cursor-pointer group"
                  for="rememberMe"
                >
                  <input
                    id="rememberMe"
                    v-model="rememberMe"
                    name="rememberMe"
                    autocomplete="off"
                    type="checkbox"
                    class="w-4 h-4 flex-shrink-0 rounded border-[#E4E4E7] text-[#2563EB] focus:ring-[#2563EB]/20 transition-all"
                  >
                  <span class="text-[12px] text-[#71717A] font-medium group-hover:text-[#18181B] transition-colors">Mantener sesión iniciada</span>
                </label>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="w-full py-3.5 bg-[#2563EB] text-white font-semibold text-[15px] rounded-[10px] hover:bg-[#1D4ED8] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-[#2563EB]/10 disabled:opacity-50"
                :disabled="isLoading || (requiresTotp && totpCode.length < 6)"
              >
                <span>{{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}</span>
                <span
                  v-if="!isLoading"
                  class="material-symbols-outlined text-[18px]"
                >login</span>
                <span
                  v-else
                  class="material-symbols-outlined animate-spin text-[18px]"
                >progress_activity</span>
              </button>
            </form>
          </template>

          <!-- Footer link -->
          <div class="mt-7 pt-6 border-t border-[#F4F4F5] text-center">
            <p class="text-[13px] text-[#71717A] font-medium">
              ¿No tiene una cuenta?
              <button
                class="text-[#2563EB] font-semibold hover:underline ml-1"
                @click="$emit('request-demo')"
              >
                Solicite una demo
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal de Consentimiento Ley 1581 -->
    <div
      v-if="showPrivacyConsentModal"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div class="bg-white w-[90%] max-w-[480px] rounded-[16px] shadow-2xl border border-[#E4E4E7] overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="px-6 py-5 border-b border-[#F4F4F5]">
          <h3 class="text-[18px] font-bold text-[#18181B] tracking-tight">
            Política de Privacidad
          </h3>
          <p class="text-[13px] text-[#71717A] mt-1">
            Ley 1581 de 2012 — Protección de datos personales
          </p>
        </div>
        <div class="p-6 max-h-[400px] overflow-y-auto">
          <div class="text-[13px] text-[#3F3F46] leading-[1.6] space-y-4">
            <p><strong>Contex360</strong> trata los datos personales de acuerdo con la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2012.</p>
            <p><strong>Finalidad:</strong> Sus datos serán utilizados exclusivamente para la prestación del servicio de facturación electrónica, contabilidad y gestión empresarial.</p>
            <p><strong>Derechos:</strong> Usted tiene derecho a acceder, rectificar, suprimir y solicitar la portabilidad de sus datos personales, así como a oponerse a su tratamiento.</p>
            <p><strong>Responsable:</strong> Contex360 — Datos de contacto: soporte@contex360.com</p>
            <p class="text-[12px] text-[#A1A1AA]">
              Al aceptar, autoriza el tratamiento de sus datos personales conforme a esta política.
            </p>
          </div>
        </div>
        <div class="px-6 py-4 bg-[#FAFAFA] border-t border-[#F4F4F5] flex justify-end gap-3">
          <button
            class="px-5 py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] disabled:opacity-50 flex items-center gap-2"
            :disabled="privacyConsentLoading"
            @click="handleAcceptPrivacy"
          >
            <span
              v-if="privacyConsentLoading"
              class="material-symbols-outlined animate-spin text-[16px]"
            >progress_activity</span>
            {{ privacyConsentLoading ? 'Procesando...' : 'Aceptar y Continuar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}
.c360-mark .rotor { transform-origin: 28px 28px; animation: spin 8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Force Contrast for Enterprise Grade Visibility */
input:not([type="checkbox"]), select {
  color: #18181B !important;
  background-color: transparent !important;
}

input::placeholder {
  color: #A1A1AA !important;
}

/* Fix Autofill Blue Background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #18181B !important;
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s !important;
}
</style>
