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
    const response = await businessApi.chatWithAi(userMsg)
    chatHistory.value.push(response)
  } catch {
    chatHistory.value.push({ role: 'assistant', content: 'Lo siento, tuve un problema conectando con el cerebro del sistema. ¿Podemos intentar de nuevo?' })
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
      <span v-if="!isOpen" class="icon">✨</span>
      <span v-else class="icon">✕</span>
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
        <div v-for="(msg, index) in chatHistory" :key="index" :class="['message', msg.role]">
          <div class="bubble">
            {{ msg.content }}
            
            <!-- Suggested Action Button -->
            <div v-if="msg.suggestedAction" class="action-wrapper">
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-trigger:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 30px -5px rgba(16, 185, 129, 0.5);
}

.chat-trigger.is-active {
  background: #1e293b;
  transform: rotate(90deg);
}

.chat-window {
  width: 22rem;
  height: 30rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  background: #10b981;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.assistant .bubble {
  background: white;
  color: #334155;
  border-bottom-left-radius: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
}

.chat-footer input:focus {
  border-color: #10b981;
}

.chat-footer button {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: #10b981;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.chat-footer button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
