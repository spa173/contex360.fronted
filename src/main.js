import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/styles.css'
import App from './App.vue'
import router from './router/index.ts'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

try {
  const stateStore = useStateStore(pinia)
  const themeStore = useThemeStore(pinia)
  themeStore.initializeTheme()
  await stateStore.migrateSecrets()
} catch (error) {
  console.warn('No fue posible migrar las credenciales locales.', error)
}

app.mount('#app')
