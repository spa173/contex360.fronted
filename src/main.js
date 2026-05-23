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

app.config.errorHandler = (err, instance, info) => {
  console.error('Global Vue Error Handler atrapó un error:', err, 'Info:', info)
  const errorEvent = new CustomEvent('global-vue-error', { 
    detail: { error: err, info } 
  })
  window.dispatchEvent(errorEvent)
}

async function bootstrap() {
  try {
    const stateStore = useStateStore(pinia)
    const themeStore = useThemeStore(pinia)
    themeStore.initializeTheme()
    
    // Migracion segura si el metodo existe
    if (typeof stateStore.migrateSecrets === 'function') {
      await stateStore.migrateSecrets()
    }
  } catch (error) {
    console.warn('Bootstrap error:', error)
  }
  app.mount('#app')
}

bootstrap()
