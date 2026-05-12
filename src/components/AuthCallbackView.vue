<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStateStore } from '../stores/stateStore'

const store = useStateStore()
const router = useRouter()

const statusMessage = ref('Verificando tu sesion segura...')
const errorMessage = ref('')

const finishAuth = async () => {
  const ok = await store.refreshSessionWithBackend()

  if (ok) {
    statusMessage.value = 'Sesion lista. Redirigiendo...'
    await router.replace('/')
    return
  }

  statusMessage.value = 'No pudimos validar la sesion.'
  errorMessage.value = 'Vuelve al login e intenta otra vez.'
}

const goBack = async () => {
  await router.replace('/')
}

onMounted(() => {
  void finishAuth()
})
</script>

<template>
  <div class="callback-page">
    <section class="callback-card" aria-label="Finalizando acceso">
      <div class="callback-spinner" aria-hidden="true"></div>
      <p class="callback-kicker">Acceso corporativo</p>
      <h1>Completando inicio de sesión</h1>
      <p class="callback-copy">{{ statusMessage }}</p>
      <p v-if="errorMessage" class="callback-error" role="alert">{{ errorMessage }}</p>
      <button v-if="errorMessage" class="callback-button" type="button" @click="goBack">
        Volver al login
      </button>
    </section>
  </div>
</template>

<style scoped>
.callback-page {
  align-items: center;
  background:
    radial-gradient(circle at top, rgba(37, 99, 235, 0.08), transparent 35%),
    linear-gradient(180deg, #f5f7fb 0%, #edf2ff 100%);
  color: #0f1727;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.callback-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 24px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  max-width: 440px;
  padding: 34px 30px 28px;
  text-align: center;
  width: 100%;
}

.callback-spinner {
  animation: spin 1s linear infinite;
  border: 3px solid rgba(59, 130, 246, 0.16);
  border-top-color: #2563eb;
  border-radius: 50%;
  height: 42px;
  margin: 0 auto 18px;
  width: 42px;
}

.callback-kicker {
  color: #2563eb;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  margin: 0 0 10px;
  text-transform: uppercase;
}

.callback-card h1 {
  font-size: clamp(1.6rem, 2.4vw, 2.15rem);
  letter-spacing: -0.05em;
  line-height: 1.05;
  margin: 0 0 10px;
}

.callback-copy {
  color: #5f6b80;
  line-height: 1.55;
  margin: 0;
}

.callback-error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 14px;
  color: #be123c;
  line-height: 1.5;
  margin: 18px 0 0;
  padding: 12px 14px;
}

.callback-button {
  background: #111827;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  font-size: 0.96rem;
  font-weight: 600;
  margin-top: 18px;
  min-height: 44px;
  padding: 0 18px;
}

.callback-button:hover {
  background: #1f2937;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
