<script setup lang="ts">
import { ref } from 'vue'
import { businessApi } from '@/services/businessApi'
import { useAuthStore } from '@/stores/authStore'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Autenticación de Dos Factores',
  meta: [
    { name: 'description', content: 'Configura la verificación en dos pasos para tu cuenta Contex360.' },
  ]
})

const authStore = useAuthStore()

type Step = 'idle' | 'setup' | 'confirm' | 'disable' | 'done'

const step = ref<Step>('idle')
const qrCodeUrl = ref('')
const secret = ref('')
const code = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

async function startSetup() {
  loading.value = true; error.value = ''
  try {
    const data = await businessApi.totpSetup()
    qrCodeUrl.value = data.qrCodeUrl
    secret.value = data.secret
    step.value = 'setup'
  } catch (e: any) { error.value = e.message || 'Error al iniciar 2FA.' }
  finally { loading.value = false }
}

async function confirmCode() {
  if (!code.value.trim()) return
  loading.value = true; error.value = ''
  try {
    const res = await businessApi.totpConfirm(code.value.trim())
    message.value = res.message
    await authStore.refreshSessionWithBackend()
    step.value = 'done'
  } catch (e: any) { error.value = e.message || 'Código incorrecto.' }
  finally { loading.value = false }
}

async function disableTotp() {
  if (!code.value.trim()) return
  loading.value = true; error.value = ''
  try {
    const res = await businessApi.totpDisable(code.value.trim())
    message.value = res.message
    await authStore.refreshSessionWithBackend()
    step.value = 'idle'
    code.value = ''
  } catch (e: any) { error.value = e.message || 'Código incorrecto.' }
  finally { loading.value = false }
}

function reset() {
  step.value = 'idle'; code.value = ''; error.value = ''; message.value = ''
  qrCodeUrl.value = ''; secret.value = ''
}
</script>

<template>
  <section class="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2 text-[11px] font-medium text-[#A1A1AA]">
        <span>Cuenta</span><span class="material-symbols-outlined text-[14px]">chevron_right</span><span class="text-[#71717A]">Autenticación 2FA</span>
      </div>
      <h1 class="text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] text-[#18181B] mb-1">Autenticación en dos pasos</h1>
      <p class="text-[14px] text-[#71717A]">Protege tu cuenta con Google Authenticator, Authy o cualquier app TOTP.</p>
    </div>

    <div v-if="error" class="mb-5 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-semibold rounded-[10px]">{{ error }}</div>

    <!-- Done -->
    <div v-if="step === 'done'" class="bg-white border border-emerald-200 rounded-[14px] p-6 text-center">
      <div class="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 mb-4">
        <span class="material-symbols-outlined text-[28px]">check_circle</span>
      </div>
      <h2 class="text-[18px] font-bold tracking-tight text-[#18181B] mb-1">{{ message }}</h2>
      <p class="text-[13px] text-[#71717A] mb-5">Necesitarás tu app autenticadora al iniciar sesión.</p>
      <button @click="reset" class="px-5 py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A]">Entendido</button>
    </div>

    <!-- Idle -->
    <div v-else-if="step === 'idle'" class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
      <template v-if="authStore.currentUser?.twoFactorEnabled">
        <div class="flex items-start gap-4 mb-5">
          <div class="w-11 h-11 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <span class="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <p class="text-[15px] font-bold tracking-tight text-[#18181B] mb-0.5">2FA activado</p>
            <p class="text-[13px] text-[#71717A]">Tu cuenta está protegida por contraseña y verificación de dos factores (TOTP).</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="step = 'disable'" class="w-full py-2.5 bg-rose-600 text-white rounded-[10px] text-[13px] font-semibold hover:bg-rose-700 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">gpp_bad</span>
            Desactivar 2FA existente
          </button>
        </div>
      </template>
      <template v-else>
        <div class="flex items-start gap-4 mb-5">
          <div class="w-11 h-11 rounded-[10px] bg-amber-50 flex items-center justify-center text-amber-700 flex-shrink-0">
            <span class="material-symbols-outlined text-[22px]">shield_lock</span>
          </div>
          <div>
            <p class="text-[15px] font-bold tracking-tight text-[#18181B] mb-0.5">2FA desactivado</p>
            <p class="text-[13px] text-[#71717A]">Tu cuenta solo está protegida por contraseña.</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="startSetup" :disabled="loading" class="flex-1 py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] flex items-center justify-center gap-2 disabled:opacity-50">
            <span class="material-symbols-outlined text-[18px]">add_moderator</span>
            {{ loading ? 'Cargando...' : 'Activar 2FA' }}
          </button>
        </div>
      </template>
    </div>

    <!-- Setup -->
    <div v-else-if="step === 'setup'" class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
      <p class="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider mb-1">Paso 1 de 2</p>
      <h2 class="text-[16px] font-bold tracking-tight text-[#18181B] mb-2">Escanea el código QR</h2>
      <p class="text-[13px] text-[#71717A] mb-5">Abre <strong class="font-semibold text-[#18181B]">Google Authenticator</strong> o cualquier app TOTP.</p>
      <div class="flex justify-center py-4 mb-5">
        <img :src="qrCodeUrl" alt="Código QR de verificación en dos pasos para Google Authenticator" width="176" height="176" loading="eager" decoding="async" class="w-44 h-44 rounded-[12px] border border-[#E4E4E7]" />
      </div>
      <div class="bg-[#FAFAFA] rounded-[10px] p-3 border border-[#F4F4F5] mb-5">
        <p class="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">O código manual</p>
        <p class="font-mono text-[13px] text-[#18181B] select-all break-all">{{ secret }}</p>
      </div>
      <button @click="step = 'confirm'" class="w-full py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A]">Ya escané, continuar</button>
    </div>

    <!-- Confirm -->
    <div v-else-if="step === 'confirm'" class="bg-white border border-[#E4E4E7] rounded-[14px] p-6">
      <p class="text-[11px] font-bold text-[#2563EB] uppercase tracking-wider mb-1">Paso 2 de 2</p>
      <h2 class="text-[16px] font-bold tracking-tight text-[#18181B] mb-2">Confirma el código</h2>
      <p class="text-[13px] text-[#71717A] mb-5">Ingresa el código de 6 dígitos que muestra tu app.</p>
      <input v-model="code" type="text" inputmode="numeric" maxlength="6" placeholder="000000" @keyup.enter="confirmCode" class="w-full text-center text-[24px] tracking-[0.4em] font-mono border border-[#E4E4E7] rounded-[10px] px-4 py-3 text-[#18181B] outline-none focus:border-[#18181B] focus:ring-4 focus:ring-black/[0.04] mb-5" />
      <button @click="confirmCode" :disabled="loading || code.length < 6" class="w-full py-2.5 bg-[#18181B] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#27272A] mb-2 disabled:opacity-50">{{ loading ? 'Verificando...' : 'Activar 2FA' }}</button>
      <button @click="step = 'setup'" class="w-full py-2 text-[12px] text-[#71717A] hover:text-[#18181B]">← Volver atrás</button>
    </div>

    <!-- Disable -->
    <div v-else-if="step === 'disable'" class="bg-white border border-rose-200 rounded-[14px] p-6">
      <h2 class="text-[16px] font-bold tracking-tight text-rose-700 mb-2">Desactivar 2FA</h2>
      <p class="text-[13px] text-[#71717A] mb-5">Ingresa el código actual de tu app autenticadora.</p>
      <input v-model="code" type="text" inputmode="numeric" maxlength="6" placeholder="000000" @keyup.enter="disableTotp" class="w-full text-center text-[24px] tracking-[0.4em] font-mono border border-[#E4E4E7] rounded-[10px] px-4 py-3 text-[#18181B] outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 mb-5" />
      <button @click="disableTotp" :disabled="loading || code.length < 6" class="w-full py-2.5 bg-rose-600 text-white rounded-[10px] text-[13px] font-semibold hover:bg-rose-700 mb-2 disabled:opacity-50">{{ loading ? 'Desactivando...' : 'Confirmar desactivación' }}</button>
      <button @click="reset" class="w-full py-2 text-[12px] text-[#71717A] hover:text-[#18181B]">Cancelar</button>
    </div>
  </section>
</template>

<style scoped>
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24; }
</style>
