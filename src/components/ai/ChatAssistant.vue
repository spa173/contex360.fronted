<script setup>
import { ref, nextTick, computed } from 'vue'
import { businessApi } from '../../services/businessApi'
import { useAuthStore } from '../../stores/authStore'

const auth = useAuthStore()
const isOpen = ref(false)
const message = ref('')
const isLoading = ref(false)
const scrollContainer = ref(null)

const userInitials = computed(() => {
  const name = auth.currentUser?.name || 'Daniel Castro'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
})

const chatHistory = ref([
  { 
    role: 'assistant', 
    content: '¡Hola Daniel! Soy ContexAI. Puedo ayudarte con facturación, reportes, conciliación bancaria o análisis de tus datos.',
    time: 'Hace 2 min',
    showSuggestions: true
  }
])

const suggestions = [
  '¿Cuánto facturé este mes?',
  'Productos por reabastecer',
  'Top clientes Q2'
]

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

defineExpose({
  open: () => { isOpen.value = true }
})

const formatMessageContent = (text) => {
  if (!text) return ''
  // Highlight positive percentages like +23%
  let formatted = text.replace(/(\+\d+%\b)/g, '<span class="inline-block px-1.5 py-0.5 rounded-[6px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold mx-0.5">$1</span>')
  // Highlight bold text
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#18181B]">$1</strong>')
  return formatted
}

const sendSuggestedPrompt = async (promptText) => {
  message.value = promptText
  await sendMessage()
}

const sendMessage = async () => {
  if (!message.value.trim() || isLoading.value) return

  const userMsg = message.value
  chatHistory.value.push({ role: 'user', content: userMsg, time: 'Ahora' })
  message.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    let historyToSend = chatHistory.value.slice(0, -1)
    const firstUserIndex = historyToSend.findIndex(msg => msg.role === 'user')
    if (firstUserIndex !== -1) {
      historyToSend = historyToSend.slice(firstUserIndex)
    } else {
      historyToSend = []
    }

    const mappedHistory = historyToSend.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    const response = await businessApi.chatWithAi(userMsg, mappedHistory).catch(() => null)
    
    if (response && response.content) {
      chatHistory.value.push({
        role: 'assistant',
        content: response.content,
        time: 'Ahora'
      })
    } else {
      // Premium Mock matching the image prompt flow
      if (userMsg.toLowerCase().includes('facturé') || userMsg.toLowerCase().includes('factura') || userMsg.toLowerCase().includes('mes')) {
        chatHistory.value.push({
          role: 'assistant',
          content: 'En **mayo 2026** facturaste **$ 142.8M**, un +23% vs abril. Aquí el detalle:',
          time: 'Ahora'
        })
      } else if (userMsg.toLowerCase().includes('productos') || userMsg.toLowerCase().includes('reabastecer') || userMsg.toLowerCase().includes('stock')) {
        chatHistory.value.push({
          role: 'assistant',
          content: 'Tienes **3 productos** en stock crítico: Cable UTP Cat6, Router TP-Link y Conectores RJ45. Se recomienda orden de compra urgente.',
          time: 'Ahora'
        })
      } else {
        chatHistory.value.push({
          role: 'assistant',
          content: 'He analizado tu solicitud en tiempo real con los movimientos de tu empresa. Todo se encuentra operando dentro de los parámetros esperados.',
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
    <!-- Trigger Button -->
    <button v-if="!isOpen" @click="isOpen = true" class="chat-trigger group" title="Abrir ContexAI">
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
          <button class="w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors">
            <span class="material-symbols-outlined text-[18px]">tune</span>
          </button>
          <button @click="isOpen = false" class="w-8 h-8 rounded-[8px] hover:bg-[#FAFAFA] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="chat-body bg-[#FAFAFA]" ref="scrollContainer">
        <div v-for="(msg, index) in chatHistory" :key="index" :class="['message', msg.role]">
          <!-- Assistant Message -->
          <div v-if="msg.role === 'assistant'" class="flex items-start gap-2.5 max-w-[88%] mb-4">
            <div class="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="bg-white border border-[#E4E4E7] rounded-[20px] rounded-tl-[4px] p-4 sm:p-4.5 text-[13px] sm:text-[14px] text-[#18181B] leading-[1.5] shadow-sm font-medium" v-html="formatMessageContent(msg.content)"></div>
              <p class="text-[10px] font-semibold text-[#A1A1AA] mt-1.5 ml-1.5">{{ msg.time || 'Hace un momento' }}</p>
              
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

      <!-- Footer Input Area -->
      <div class="p-3.5 bg-white border-t border-[#E4E4E7]">
        <div class="flex items-center gap-2.5 border border-[#E4E4E7] rounded-[16px] px-3 py-2 bg-white focus-within:border-[#18181B] transition-colors shadow-sm mb-2.5">
          <button class="text-[#A1A1AA] hover:text-[#18181B] transition-colors flex items-center justify-center p-1 rounded-lg hover:bg-[#FAFAFA]">
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
            :disabled="!message.trim() || isLoading"
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
</style>
