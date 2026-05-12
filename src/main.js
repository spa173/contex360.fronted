import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/styles.css'
import App from './App.vue'
import router from './router/index.ts'
import { useStateStore } from './stores/stateStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

try {
  const stateStore = useStateStore(pinia)
  await stateStore.migrateSecrets()
} catch (error) {
  console.warn('No fue posible migrar las credenciales locales.', error)
}

app.mount('#app')
