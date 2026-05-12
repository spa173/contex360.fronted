<script setup lang="ts">
import { ref } from 'vue'
import { businessApi } from '@/services/businessApi'

type Step = 'idle' | 'setup' | 'confirm' | 'disable' | 'done'

const step = ref<Step>('idle')
const qrCodeUrl = ref('')
const secret = ref('')
const code = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

async function startSetup() {
  loading.value = true
  error.value = ''
  try {
    const data = await businessApi.totpSetup()
    qrCodeUrl.value = data.qrCodeUrl
    secret.value = data.secret
    step.value = 'setup'
  } catch (e: any) {
    error.value = e.message || 'Error al iniciar configuracion 2FA.'
  } finally {
    loading.value = false
  }
}

async function confirmCode() {
  if (!code.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const res = await businessApi.totpConfirm(code.value.trim())
    message.value = res.message
    step.value = 'done'
  } catch (e: any) {
    error.value = e.message || 'Codigo incorrecto. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

async function disableTotp() {
  if (!code.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const res = await businessApi.totpDisable(code.value.trim())
    message.value = res.message
    step.value = 'idle'
    code.value = ''
  } catch (e: any) {
    error.value = e.message || 'Codigo incorrecto.'
  } finally {
    loading.value = false
  }
}

function reset() {
  step.value = 'idle'
  code.value = ''
  error.value = ''
  message.value = ''
  qrCodeUrl.value = ''
  secret.value = ''
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Autenticacion en dos pasos (2FA)</h1>
      <p class="text-slate-500 text-sm mt-1">Protege tu cuenta con Google Authenticator o cualquier app TOTP.</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
      {{ error }}
    </div>

    <!-- Exito final -->
    <div v-if="step === 'done'" class="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
      <div class="text-4xl">✅</div>
      <p class="text-green-800 font-semibold text-lg">{{ message }}</p>
      <p class="text-green-700 text-sm">A partir de ahora necesitaras el codigo de tu app autenticadora al iniciar sesion.</p>
      <button @click="reset" class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
        Entendido
      </button>
    </div>

    <!-- Paso 1: Idle -->
    <div v-else-if="step === 'idle'" class="space-y-4">
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🔐</span>
          <div>
            <p class="font-semibold text-slate-800">2FA desactivado</p>
            <p class="text-slate-500 text-sm">Tu cuenta solo esta protegida por contrasena.</p>
          </div>
        </div>
        <button
          @click="startSetup"
          :disabled="loading"
          class="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Cargando...' : 'Activar 2FA' }}
        </button>
        <button
          @click="step = 'disable'"
          class="w-full py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition"
        >
          Desactivar 2FA existente
        </button>
      </div>
    </div>

    <!-- Paso 2: Escanear QR -->
    <div v-else-if="step === 'setup'" class="space-y-4">
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="font-semibold text-slate-800">Paso 1 — Escanea el codigo QR</h2>
        <p class="text-slate-500 text-sm">Abre <strong>Google Authenticator</strong>, <strong>Authy</strong> o cualquier app TOTP y escanea:</p>
        <div class="flex justify-center py-2">
          <img :src="qrCodeUrl" alt="QR Code 2FA" class="w-48 h-48 rounded-lg border border-slate-200" />
        </div>
        <div class="bg-slate-50 rounded-lg p-3">
          <p class="text-xs text-slate-500 mb-1">O ingresa el codigo manual:</p>
          <p class="font-mono text-sm text-slate-800 break-all select-all">{{ secret }}</p>
        </div>
        <button @click="step = 'confirm'" class="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
          Ya lo escane, continuar
        </button>
      </div>
    </div>

    <!-- Paso 3: Confirmar codigo -->
    <div v-else-if="step === 'confirm'" class="space-y-4">
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 class="font-semibold text-slate-800">Paso 2 — Confirma el codigo</h2>
        <p class="text-slate-500 text-sm">Ingresa el codigo de 6 digitos que muestra tu app autenticadora:</p>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="000000"
          class="w-full text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @keyup.enter="confirmCode"
        />
        <button
          @click="confirmCode"
          :disabled="loading || code.length < 6"
          class="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Verificando...' : 'Activar 2FA' }}
        </button>
        <button @click="step = 'setup'" class="w-full text-slate-500 text-sm hover:text-slate-700">
          Volver atras
        </button>
      </div>
    </div>

    <!-- Desactivar 2FA -->
    <div v-else-if="step === 'disable'" class="space-y-4">
      <div class="bg-white border border-red-100 rounded-xl p-6 space-y-4">
        <h2 class="font-semibold text-red-700">Desactivar 2FA</h2>
        <p class="text-slate-500 text-sm">Ingresa el codigo actual de tu app autenticadora para confirmar:</p>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="000000"
          class="w-full text-center text-2xl tracking-widest font-mono border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400"
          @keyup.enter="disableTotp"
        />
        <button
          @click="disableTotp"
          :disabled="loading || code.length < 6"
          class="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Desactivando...' : 'Confirmar desactivacion' }}
        </button>
        <button @click="reset" class="w-full text-slate-500 text-sm hover:text-slate-700">Cancelar</button>
      </div>
    </div>
  </div>
</template>
