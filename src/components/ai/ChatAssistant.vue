<script setup>
import { ref, nextTick } from 'vue'
import { businessApi } from '../../services/businessApi'

const isOpen = ref(false)
const message = ref('')
const chatHistory = ref([
  { role: 'assistant', content: '¡Hola! Soy tu asistente inteligente de Contex360. ¿Cómo puedo ayudarte hoy con tu negocio?' }
])
const isLoading = ref(false)
const scrollContainer = ref(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (!message.value.trim() || isLoading.value) return

  const userMsg = message.value
  chatHistory.value.push({ role: 'user', content: userMsg })
  message.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    // Mapear el historial al formato requerido por Google Generative AI
    // Omitimos el último elemento porque es el mensaje actual que ya se envía por separado
    // IMPORTANTE: El historial DEBE comenzar con un mensaje de 'user'
    let historyToSend = chatHistory.value.slice(0, -1)
    
    // Encontrar el primer índice que sea de tipo 'user'
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

    const response = await businessApi.chatWithAi(userMsg, mappedHistory)
    if (response && response.role && response.content) {
      chatHistory.value.push(response)
    } else if (response && response.content) {
      chatHistory.value.push({ role: 'assistant', content: response.content })
    } else {
      throw new Error('Respuesta inválida del servidor')
    }
  } catch (error) {
    console.error('Chat error:', error)
    chatHistory.value.push({ 
      role: 'assistant', 
      content: 'Lo siento, tuve un problema procesando tu solicitud. Por favor intenta de nuevo en unos momentos.' 
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
  <div class="ai-assistant-wrapper" :class="{ 'is-open': isOpen }">
    <!-- Trigger Button -->
    <button @click="isOpen = !isOpen" class="chat-trigger" :class="{ 'is-active': isOpen }">
      <span v-if="!isOpen" class="material-symbols-outlined text-[24px]">auto_awesome</span>
      <span v-else class="material-symbols-outlined text-[24px]">close</span>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <div class="avatar">✨</div>
        <div class="info">
          <h3>Asistente Contex360</h3>
          <p>Inteligencia Artificial Activa</p>
        </div>
      </div>

      <div class="chat-body" ref="scrollContainer">
        <div v-for="(msg, index) in chatHistory" :key="index" :class="['message', msg?.role || 'assistant']">
          <div class="bubble">
            {{ msg?.content || '...' }}
            
            <!-- Suggested Action Button -->
            <div v-if="msg?.suggestedAction" class="action-wrapper">
              <button @click="$emit('navigate', msg.suggestedAction === 'view_billing' ? 'billing' : msg.suggestedAction === 'manage_inventory' ? 'inventory' : 'dashboard')" class="action-btn">
                {{ msg.suggestedAction === 'view_billing' ? 'Ir a Facturación' : msg.suggestedAction === 'manage_inventory' ? 'Ver Inventario' : 'Ir al Dashboard' }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="isLoading" class="message assistant typing">
          <div class="bubble">...</div>
        </div>
      </div>

      <div class="chat-footer">
        <input 
          v-model="message" 
          @keyup.enter="sendMessage"
          placeholder="Pregúntame algo sobre tu negocio..." 
          type="text"
        />
        <button @click="sendMessage" :disabled="!message.trim() || isLoading">
          ➔
        </button>
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
  color: white;
  font-size: 1.5rem;
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

.chat-trigger.is-active {
  background: #2563EB;
}

.chat-window {
  width: 24rem;
  height: 32rem;
  background: #FFFFFF;
  border: 1px solid #F4F4F5;
  border-radius: 24px;
  margin-bottom: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-header {
  padding: 1.25rem;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.06));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-header .avatar {
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.chat-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
}

.chat-header p {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.chat-body {
  flex: 1;
  padding: 1.25rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.bubble {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.user .bubble {
  background: #2563EB;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.assistant .bubble {
  background: #F4F4F5;
  color: #18181B;
  border-bottom-left-radius: 0.25rem;
  font-weight: 500;
}

.action-wrapper {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  width: 100%;
  padding: 0.5rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 0.5rem;
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #10b981;
  color: white;
}

.chat-footer {
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 0.5rem;
}

.chat-footer input {
  flex: 1;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  color: #18181B !important;
  background-color: #FFFFFF !important;
}

.chat-footer input:focus {
  border-color: #2563EB;
}

.chat-footer button {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: #2563EB;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.chat-footer button:hover:not(:disabled) {
  background: #1D4ED8;
}

.chat-footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
