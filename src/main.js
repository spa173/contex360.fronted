import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import './style.css'
import './assets/styles.css'
import App from './App.vue'
import router from './router/index.ts'
import { useStateStore } from './stores/stateStore'
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(pinia)
app.use(router)
app.use(head)

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
    
    // Hydrate persisted state with AES-GCM decryption
    await stateStore.hydrateState()
  } catch (error) {
    console.warn('Bootstrap error:', error)
  }
  app.mount('#app')

  // Load non-critical Material Symbols icon font after the app is interactive,
  // so it does not block first paint / LCP. CSP-safe: runs from a 'self' module,
  // not an inline onload handler (which the strict script-src would block).
  loadIconFont()
}

function loadIconFont() {
  if (document.getElementById('material-symbols-font')) return
  const link = document.createElement('link')
  link.id = 'material-symbols-font'
  link.rel = 'stylesheet'
  // display=block: hide the ligature text until the font loads, so users never
  // see raw glyph names ("chevron_right") if the icon font is briefly unavailable.
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400..500,0,0&display=block'
  document.head.appendChild(link)
}

bootstrap()
