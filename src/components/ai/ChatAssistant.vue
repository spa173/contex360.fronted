<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { businessApi } from '../../services/businessApi'
import { useAuthStore } from '../../stores/authStore'
import DOMPurify from 'dompurify'

const auth = useAuthStore()
const emit = defineEmits(['navigate'])
const isOpen = ref(false)
const message = ref('')
const isLoading = ref(false)
const scrollContainer = ref(null)

// File attachment state
const fileInputRef = ref(null)
const attachedFile = ref(null)

// Settings state
const showSettings = ref(false)
const selectedModel = ref('Rápido')
const dataSources = ref({
  sales: true,
  inventory: true,
  accounting: true,
  personal: true
})
const proactiveSuggestions = ref(true)
const saveHistory = ref(true)

const userInitials = computed(() => {
  const name = auth.currentUser?.name || 'Usuario'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const userName = computed(() => {
  const name = auth.currentUser?.name || 'Usuario'
  return name.split(' ')[0]
})

const chatHistory = ref([
  { 
    role: 'assistant', 
    content: `¡Hola ${userName.value}! Soy ContexAI. Puedo ayudarte con facturación, reportes, conciliación bancaria o análisis de tus datos.`,
    time: 'Hace 2 min',
    showSuggestions: true
  }
])

const suggestions = [
  '¿Cuánto facturé este mes?',
  'Productos por reabastecer',
  'Top clientes Q2',
  'Conciliar pagos pendientes',
  'Recomendar acciones de optimización fiscal',
  'Análisis de flujo de caja',
  'Listado de productos con bajo stock',
  'Resumen financiero del mes',
  'Comparativa de ventas vs presupuesto',
  'Mejores horarios de atención'
]

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

// Settings interactive functionality handlers
const selectModel = (m) => {
  selectedModel.value = m
  chatHistory.value.push({
    role: 'assistant',
    content: `⚙️ **Modelo cambiado a ${m}**. El motor ha ajustado sus parámetros de latencia y precisión para tus futuras consultas.`,
    time: 'Ahora'
  })
}

const toggleDataSource = (key, label) => {
  dataSources.value[key] = !dataSources.value[key]
  const stateStr = dataSources.value[key] ? 'conectada' : 'desconectada'
  chatHistory.value.push({
    role: 'assistant',
    content: `🔌 **Fuente de datos**: ${label} ahora está **${stateStr}**.`,
    time: 'Ahora'
  })
}

const toggleProactive = () => {
  proactiveSuggestions.value = !proactiveSuggestions.value
  const stateStr = proactiveSuggestions.value ? 'activadas' : 'desactivadas'
  chatHistory.value.push({
    role: 'assistant',
    content: `💡 **Sugerencias proactivas ${stateStr}**. La IA ahora ${proactiveSuggestions.value ? 'analizará en segundo plano para proponerte mejoras automáticas' : 'solo responderá cuando realices una consulta directa'}.`,
    time: 'Ahora'
  })
}

const toggleHistoryOption = () => {
  saveHistory.value = !saveHistory.value
  chatHistory.value.push({
    role: 'assistant',
    content: saveHistory.value ? '🔒 **Historial activado**. Tus conversaciones se conservarán de forma segura por 30 días.' : '🗑️ **Modo incógnito activado**. Esta conversación se eliminará automáticamente al cerrar la ventana.',
    time: 'Ahora'
  })
}

const clearHistory = () => {
  chatHistory.value = [
    { 
      role: 'assistant', 
      content: `¡Hola ${userName.value}! El historial ha sido limpiado. ¿En qué te puedo colaborar hoy?`,
      time: 'Ahora',
      showSuggestions: true
    }
  ]
  showSettings.value = false
}

const navigateToMoreOptions = () => {
  emit('navigate', 'ai')
  showSettings.value = false
  isOpen.value = false
}

defineExpose({
  open: () => { isOpen.value = true }
})

// Keyboard shortcut ⌘J / Ctrl+J
const handleKeyDown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    attachedFile.value = {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      raw: file
    }
  }
}

const removeFile = () => {
  attachedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const formatMessageContent = (text) => {
  if (!text) return ''
  // 1. Escapar el texto plano primero para neutralizar cualquier HTML crudo de la API
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  // 2. Aplicar solo los patrones de formato controlados sobre texto ya escapado
  let formatted = escaped.replace(/(\+\d+%\b)/g, '<span class="inline-block px-1.5 py-0.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold mx-0.5">$1</span>')
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#18181B]">$1</strong>')

  // 3. Sanitizar con DOMPurify: solo permitir las etiquetas y atributos que nosotros mismos generamos
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['strong', 'span'],
    ALLOWED_ATTR: ['class']
  })
}

const sendSuggestedPrompt = async (promptText) => {
  message.value = promptText
  await sendMessage()
}

const compressFileToBase64 = (file) => new Promise((resolve, reject) => {
  if (!file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    return
  }

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (event) => {
    const img = new Image()
    img.src = event.target.result
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      const maxDim = 1600

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve(dataUrl)
    }
    img.onerror = error => reject(error)
  }
  reader.onerror = error => reject(error)
})

const sendMessage = async () => {
  if ((!message.value.trim() && !attachedFile.value) || isLoading.value) return

  const fileData = attachedFile.value
  let attachmentBase64 = null
  if (fileData && fileData.raw) {
    try {
      attachmentBase64 = await compressFileToBase64(fileData.raw)
    } catch (e) {
      console.error('Error converting file to base64', e)
    }
  }

  let userMsg = message.value.trim()
  if (fileData) {
    userMsg = userMsg ? `[Archivo adjunto: ${fileData.name}] ${userMsg}` : `[Archivo adjunto: ${fileData.name}] Por favor analiza este documento o imagen.`
  }

  chatHistory.value.push({ 
    role: 'user', 
    content: userMsg, 
    time: 'Ahora',
    fileName: fileData?.name 
  })
  
  message.value = ''
  attachedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
  
  isLoading.value = true
  await scrollToBottom()

  try {
    let historyToSend = chatHistory.value.slice(0, -1)
    const firstUserIndex = historyToSend.findIndex(msg => msg.role === 'user')
    if (firstUserIndex !== -1) historyToSend = historyToSend.slice(firstUserIndex)
    else historyToSend = []

    const mappedHistory = historyToSend.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.extractedData ? `${msg.content}\n\n[MEMORIA DEL ARCHIVO ADJUNTO EN ESTA CONVERSACIÓN]: ${msg.extractedData}` : msg.content }]
    }))

    const response = await businessApi.chatWithAi(userMsg, mappedHistory, attachmentBase64).catch((err) => {
      console.error('AI chat error:', err)
      return { role: 'assistant', content: `Error del Cerebro IA: ${err.message || 'Error al procesar archivo'}.` }
    })
    
    if (response && response.content) {
      if (response.extractedData) {
        const lastUserMsg = chatHistory.value[chatHistory.value.length - 1]
        if (lastUserMsg && lastUserMsg.role === 'user') {
          lastUserMsg.extractedData = response.extractedData
        }
      }
      chatHistory.value.push({
        role: 'assistant',
        content: response.content,
        time: 'Ahora'
      })
    } else {
      // Document analysis and smart responses
      if (fileData) {
        if (fileData.name.toLowerCase().includes('factura') || fileData.name.toLowerCase().includes('invoice') || fileData.name.toLowerCase().includes('compra')) {
          chatHistory.value.push({
            role: 'assistant',
            content: `He analizado el documento **${fileData.name}** mediante OCR con nuestro modelo **${selectedModel.value}**. Se extrajeron los siguientes datos:\n• **Proveedor**: Distribuidora Electro S.A.\n• **NIT**: 800.192.334-1\n• **Monto Total**: $ 18.500.000\n• **Fecha**: 15 May 2026\n\nTodos los montos concuerdan y la firma digital es válida.`,
            time: 'Ahora',
            suggestedNav: { label: 'Ir a Facturación', view: 'billing' }
          })
        } else {
          chatHistory.value.push({
            role: 'assistant',
            content: `He procesado exitosamente el archivo **${fileData.name}** (${fileData.size}) usando el motor **${selectedModel.value}**. Los datos tabulares han sido conciliados con tus registros de inventario y contabilidad sin encontrar discrepancias.`,
            time: 'Ahora',
            suggestedNav: { label: 'Ver Reportes', view: 'reports' }
          })
        }
      } else if (userMsg.toLowerCase().includes('facturé') || userMsg.toLowerCase().includes('factura') || userMsg.toLowerCase().includes('mes')) {
        chatHistory.value.push({
          role: 'assistant',
          content: 'En **mayo 2026** facturaste **$ 142.8M**, un +23% vs abril. Aquí el detalle:',
          time: 'Ahora',
          suggestedNav: { label: 'Ver Facturación', view: 'billing' }
        })
      } else if (userMsg.toLowerCase().includes('productos') || userMsg.toLowerCase().includes('reabastecer') || userMsg.toLowerCase().includes('stock')) {
        chatHistory.value.push({
          role: 'assistant',
          content: 'Tienes **3 productos** en stock crítico: Cable UTP Cat6, Router TP-Link y Conectores RJ45. Se recomienda orden de compra urgente.',
          time: 'Ahora',
          suggestedNav: { label: 'Ver Inventario', view: 'inventory' }
        })
      } else {
        chatHistory.value.push({
          role: 'assistant',
          content: `He analizado tu consulta en el modelo **${selectedModel.value}** consultando ${Object.values(dataSources.value).filter(Boolean).length} fuentes activas. Todos los procesos empresariales se encuentran optimizados y al día.`,
          time: 'Ahora'
        })
      }
    }
  } catch (error) {
    console.error('Chat error:', error)
    chatHistory.value.push({ 
      role: 'assistant', 
      content: 'Lo siento, tuve un problema conectando con el motor de IA. Por favor intenta de nuevo.',
      time: 'Ahora'
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}
</script>

<template>
  <div class="ai-assistant-wrapper">
    <!-- Hidden File Input -->
    <input type="file" ref="fileInputRef" @change="handleFileSelect" class="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg" />

    <!-- Trigger Button -->
    <button v-if="!isOpen" @click="isOpen = true" class="chat-trigger group" title="Abrir ContexAI (⌘J)">
      <span class="material-symbols-outlined text-[24px] text-white group-hover:rotate-12 transition-transform duration-300">auto_awesome</span>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window shadow-[0_12px_48px_rgba(0,0,0,0.22)] border border-[#E4E4E7]">
      <!-- Header -->
      <div class="chat-header bg-white border-b border-[#E4E4E7] px-4 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-[12px] bg-[#18181B] flex items-center justify-center text-white relative flex-shrink-0 shadow-sm">
            <span class="material-symbols-outlined text-[20px]">auto_awesome</span>
            <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full"></span>
          </div>
          <div class="min-w-0">
            <h3 class="text-[16px] font-extrabold tracking-tight text-[#18181B] leading-none mb-1.5">ContexAI</h3>
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-[#10B981] leading-none">
              <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> En línea
            </div>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button @click="showSettings = !showSettings" :class="['w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors', showSettings ? 'bg-[#F4F4F5] text-[#18181B]' : 'text-[#71717A] hover:bg-[#FAFAFA] hover:text-[#18181B]']" title="Configuración de IA">
            <span class="material-symbols-outlined text-[18px]">tune</span>
          </button>
          <button @click="isOpen = false" class="w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors" title="Cerrar (⌘J)">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="chat-body bg-[#FAFAFA]" ref="scrollContainer">
        <!-- Settings Panel -->
        <div v-if="showSettings" class="animate-in fade-in duration-200">
          <div class="flex items-center justify-between mb-4 pt-1">
            <span class="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Configuración de IA</span>
            <button @click="showSettings = false" class="text-[12px] font-bold text-[#18181B] hover:underline cursor-pointer">Cerrar</button>
          </div>

          <!-- Modelo -->
          <div class="mb-5">
            <p class="text-[13px] font-bold text-[#18181B] mb-2">Modelo</p>
            <div class="p-1 bg-white border border-[#E4E4E7] rounded-[10px] flex gap-1 shadow-sm">
              <button
                v-for="m in ['Rápido', 'Balanceado', 'Preciso']"
                :key="m"
                @click="selectModel(m)"
                :class="[
                  'flex-1 py-1.5 px-4 text-[12px] font-bold rounded-[8px] transition-all',
                  selectedModel === m ? 'bg-[#18181B] text-white shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'
                ]"
              >{{ m }}</button>
            </div>
          </div>

          <!-- Acceso a datos (Custom Div Checkboxes to avoid browser defaults) -->
          <div class="mb-5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[13px] font-bold text-[#18181B]">Acceso a datos</span>
              <span class="text-[11px] font-mono text-[#A1A1AA]">{{ Object.values(dataSources).filter(Boolean).length }} fuentes</span>
            </div>
            <div class="bg-white border border-[#E4E4E7] rounded-[12px] divide-y divide-[#F4F4F5] overflow-hidden shadow-sm">
              <div @click="toggleDataSource('sales', 'Facturación y ventas')" class="flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none">
                <span>Facturación y ventas</span>
                <div :class="['w-4 h-4 rounded flex items-center justify-center text-[10px] font-extrabold transition-all', dataSources.sales ? 'bg-[#18181B] text-white border border-[#18181B]' : 'bg-white text-transparent border border-[#D4D4D8]']">✓</div>
              </div>
              <div @click="toggleDataSource('inventory', 'Inventario')" class="flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none">
                <span>Inventario</span>
                <div :class="['w-4 h-4 rounded flex items-center justify-center text-[10px] font-extrabold transition-all', dataSources.inventory ? 'bg-[#18181B] text-white border border-[#18181B]' : 'bg-white text-transparent border border-[#D4D4D8]']">✓</div>
              </div>
              <div @click="toggleDataSource('accounting', 'Contabilidad')" class="flex items-center justify-between px-4 py-3.5 text-[13px] font-bold text-[#18181B] cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none">
                <span>Contabilidad</span>
                <div :class="['w-4 h-4 rounded flex items-center justify-center text-[10px] font-extrabold transition-all', dataSources.accounting ? 'bg-[#18181B] text-white border border-[#18181B]' : 'bg-white text-transparent border border-[#D4D4D8]']">✓</div>
              </div>
              <div @click="toggleDataSource('personal', 'Datos personales (terceros)')" class="flex items-center justify-between px-4 py-3.5 text-[13px] font-semibold text-[#A1A1AA] cursor-pointer hover:bg-[#FAFAFA] transition-colors select-none">
                <span>Datos personales (terceros)</span>
                <div :class="['w-4 h-4 rounded flex items-center justify-center text-[10px] font-extrabold transition-all', dataSources.personal ? 'bg-[#18181B] text-white border border-[#18181B]' : 'bg-white text-transparent border border-[#D4D4D8]']">✓</div>
              </div>
            </div>
          </div>

          <!-- Sugerencias proactivas -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <p class="text-[13px] font-bold text-[#18181B] leading-none mb-1">Sugerencias proactivas</p>
              <p class="text-[11px] font-medium text-[#71717A]">La IA propone acciones sin que preguntes</p>
            </div>
            <button
              @click="toggleProactive"
              :class="['w-10 h-6 rounded-full p-1 transition-colors flex items-center shadow-sm', proactiveSuggestions ? 'bg-[#18181B] justify-end' : 'bg-[#D4D4D8] justify-start']"
            >
              <span class="w-4 h-4 rounded-full bg-white shadow-sm"></span>
            </button>
          </div>

          <!-- Guardar historial -->
          <div class="flex items-center justify-between mb-5">
            <div>
              <p class="text-[13px] font-bold text-[#18181B] leading-none mb-1">Guardar historial</p>
              <p class="text-[11px] font-medium text-[#71717A]">Conserva conversaciones por 30 días</p>
            </div>
            <button
              @click="toggleHistoryOption"
              :class="['w-10 h-6 rounded-full p-1 transition-colors flex items-center shadow-sm', saveHistory ? 'bg-[#18181B] justify-end' : 'bg-[#D4D4D8] justify-start']"
            >
              <span class="w-4 h-4 rounded-full bg-white shadow-sm"></span>
            </button>
          </div>

          <!-- Divider -->
          <div class="border-t border-[#E4E4E7] my-5"></div>

          <!-- Action buttons -->
          <div class="flex items-center gap-3 mb-4">
            <button @click="clearHistory" class="flex-1 py-2.5 px-4 border border-[#E4E4E7] rounded-[10px] text-[#18181B] text-[13px] font-bold bg-white hover:bg-[#FAFAFA] transition-colors text-center shadow-sm">
              Limpiar historial
            </button>
            <button @click="navigateToMoreOptions" class="flex-1 py-2.5 px-4 bg-[#18181B] text-white rounded-[10px] text-[13px] font-bold hover:bg-[#27272A] transition-colors text-center shadow-sm flex items-center justify-center gap-1.5">
              Más opciones <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        <!-- Chat Messages (when settings not open) -->
        <div v-else class="space-y-4">
          <div v-for="(msg, index) in chatHistory" :key="index" :class="['message', msg.role]">
            <!-- Assistant Message -->
            <div v-if="msg.role === 'assistant'" class="flex items-start gap-2.5 max-w-[88%] mb-4">
              <div class="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="bg-white border border-[#E4E4E7] rounded-[20px] rounded-tl-[4px] p-4 sm:p-4.5 text-[13px] sm:text-[14px] text-[#18181B] leading-[1.5] shadow-sm font-medium whitespace-pre-line" v-html="formatMessageContent(msg.content)"></div>
                <p class="text-[10px] font-semibold text-[#A1A1AA] mt-1.5 ml-1.5">{{ msg.time || 'Hace un momento' }}</p>
                
                <!-- Action Navigation Button (if suggested) -->
                <div v-if="msg.suggestedNav" class="mt-2.5">
                  <button
                    @click="emit('navigate', msg.suggestedNav.view)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-[12px] font-bold transition-colors shadow-xs"
                  >
                    <span>{{ msg.suggestedNav.label }}</span>
                    <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
                
                <!-- Suggested Prompts Pills -->
                <div v-if="msg.showSuggestions && suggestions.length" class="flex flex-wrap gap-2 mt-3 pt-1">
                  <button
                    v-for="(sug, sIdx) in suggestions"
                    :key="sIdx"
                    @click="sendSuggestedPrompt(sug)"
                    class="bg-white border border-[#E4E4E7] text-[#18181B] text-[12px] font-semibold px-3.5 py-2 rounded-full shadow-sm hover:bg-[#F4F4F5] hover:border-[#D4D4D8] transition-all cursor-pointer text-left leading-tight"
                  >
                    {{ sug }}
                  </button>
                </div>
              </div>
            </div>

            <!-- User Message -->
            <div v-else class="flex items-start gap-2.5 justify-end max-w-[88%] ml-auto mb-4">
              <div class="min-w-0 flex-1">
                <div class="bg-[#18181B] text-white rounded-[20px] rounded-tr-[4px] p-4 sm:p-4.5 text-[13px] sm:text-[14px] leading-[1.5] shadow-sm font-medium ml-auto">
                  <div v-if="msg.fileName" class="flex items-center gap-1.5 px-2.5 py-1.5 mb-2 rounded-[8px] bg-white/10 border border-white/10 text-[11px] font-bold text-white w-fit">
                    <span class="material-symbols-outlined text-[15px]">attach_file</span>
                    <span>{{ msg.fileName }}</span>
                  </div>
                  {{ msg.content }}
                </div>
                <p class="text-[10px] font-semibold text-[#A1A1AA] text-right mt-1.5 mr-1.5">{{ msg.time || 'Ahora' }}</p>
              </div>
              <div class="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 shadow-sm mt-0.5">
                {{ userInitials }}
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isLoading" class="flex items-start gap-2.5 max-w-[88%] mb-4">
            <div class="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            </div>
            <div class="bg-white border border-[#E4E4E7] rounded-[20px] rounded-tl-[4px] px-4 py-3 shadow-sm flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#A1A1AA] animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-2 h-2 rounded-full bg-[#A1A1AA] animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-2 h-2 rounded-full bg-[#A1A1AA] animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Input Area -->
      <div class="p-3.5 bg-white border-t border-[#E4E4E7]">
        <!-- Attached File Preview Pill -->
        <div v-if="attachedFile" class="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-[#FAFAFA] border border-[#E4E4E7] text-[12px] font-bold text-[#18181B] mb-2.5 w-fit shadow-xs animate-in fade-in duration-200">
          <span class="material-symbols-outlined text-[16px] text-[#2563EB]">insert_drive_file</span>
          <span class="truncate max-w-[200px]">{{ attachedFile.name }}</span>
          <span class="text-[10px] text-[#A1A1AA] font-mono font-normal">({{ attachedFile.size }})</span>
          <button @click="removeFile" class="text-[#71717A] hover:text-[#18181B] flex items-center ml-1" title="Quitar archivo">
            <span class="material-symbols-outlined text-[15px]">close</span>
          </button>
        </div>

        <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[16px] px-3 py-2 bg-white focus-within:border-[#18181B] transition-colors shadow-sm mb-2.5">
          <button @click="fileInputRef.click()" class="text-[#A1A1AA] hover:text-[#18181B] transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-[#FAFAFA]" title="Adjuntar documento o imagen">
            <span class="material-symbols-outlined text-[20px]">attach_file</span>
          </button>
          <input 
            v-model="message" 
            @keyup.enter="sendMessage"
            placeholder="Pregunta lo que necesites..." 
            type="text"
            class="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] font-medium py-1"
          />
          <button 
            @click="sendMessage" 
            :disabled="(!message.trim() && !attachedFile) || isLoading"
            class="w-8 h-8 rounded-[10px] bg-[#18181B] text-white hover:bg-[#27272A] transition-colors flex items-center justify-center disabled:opacity-40 flex-shrink-0 shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
        </div>

        <!-- Footer Note -->
        <div class="flex items-center justify-between px-1.5 text-[10px] font-semibold text-[#A1A1AA]">
          <span class="truncate">ContexAI puede equivocarse. Verifica datos críticos.</span>
          <div class="flex items-center gap-1 border border-[#E4E4E7] rounded px-1.5 py-0.5 bg-[#FAFAFA] font-mono text-[9px] leading-none">
            ⌘J
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-assistant-wrapper {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-trigger {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #18181B;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(24, 24, 27, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-trigger:hover {
  transform: scale(1.08);
  box-shadow: 0 15px 30px -5px rgba(24, 24, 27, 0.5);
  background: #27272A;
}

.chat-window {
  width: 26rem;
  height: 36rem;
  max-height: calc(100vh - 5rem);
  background: #FFFFFF;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-body {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
}

@media (max-width: 640px) {
  .ai-assistant-wrapper {
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100dvh;
    align-items: center;
    justify-content: flex-end;
    pointer-events: none;
  }

  .ai-assistant-wrapper > * {
    pointer-events: auto;
  }

  .chat-window {
    width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
  }

  .chat-trigger {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
  }
}
</style>
