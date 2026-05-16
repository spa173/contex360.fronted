<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['select'])

const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)

const commands = [
  { id: 1, title: 'Crear Factura Nueva', description: 'Abrir formulario de facturación', icon: 'add_shopping_cart', shortcut: 'F', view: 'facturacion' },
  { id: 2, title: 'Ver Inventario', description: 'Consultar existencias', icon: 'warehouse', shortcut: 'I', view: 'inventario' },
  { id: 3, title: 'Registrar Entrada de Almacén', description: 'Carga de stock recibida', icon: 'inventory', shortcut: 'E', view: 'inventario' },
  { id: 4, title: 'Generar Reporte de Ventas', description: 'Análisis de ingresos mensual', icon: 'bar_chart', shortcut: 'R', view: 'reportes' },
  { id: 5, title: 'Consultar Asistente IA', description: 'Preguntar a Gemini sobre el ERP', icon: 'psychology', shortcut: 'Q', action: 'open-chat' },
]

function executeCommand(cmd) {
  if (cmd.view) {
    emit('select', { type: 'navigate', view: cmd.view })
  } else if (cmd.action) {
    emit('select', { type: 'action', action: cmd.action })
  }
  isOpen.value = false
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    selectedIndex.value = 0
  }
}

function handleKeyDown(e) {
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault()
    toggle()
  }
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm" @click="isOpen = false"></div>

        <!-- Command Palette -->
        <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-4 border-b border-[#F1F5F9]">
            <span class="material-symbols-outlined text-[#64748B]">search</span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="¿Qué quieres hacer hoy? (Ej: 'Crear factura')"
              class="flex-1 bg-transparent border-none outline-none text-[#1E293B] font-medium placeholder:text-[#94A3B8]"
              autoFocus
            />
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#E2E8F0] bg-[#F8F9FF] text-[10px] font-bold text-[#64748B]">
              ESC
            </div>
          </div>

          <!-- Command List -->
          <div class="max-height-[400px] overflow-y-auto p-2">
            <div 
              v-for="(cmd, idx) in commands" 
              :key="cmd.id"
              :class="['flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors', idx === selectedIndex ? 'bg-[#F1F5F9]' : 'hover:bg-[#F8F9FF]']"
              @mouseenter="selectedIndex = idx"
              @click="executeCommand(cmd)"
            >
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center transition-colors', idx === selectedIndex ? 'bg-white text-[#8455ef] shadow-sm' : 'bg-[#F1F5F9] text-[#64748B]']">
                <span class="material-symbols-outlined">{{ cmd.icon }}</span>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-[#1E293B]">{{ cmd.title }}</h4>
                <p class="text-[11px] font-medium text-[#64748B]">{{ cmd.description }}</p>
              </div>
              <div class="text-[10px] font-bold text-[#94A3B8] opacity-50">
                ⌘ {{ cmd.shortcut }}
              </div>
            </div>
          </div>

          <!-- Footer Info -->
          <div class="px-4 py-3 bg-[#F8F9FF] border-t border-[#F1F5F9] flex justify-between items-center text-[10px] font-bold text-[#64748B]">
            <div class="flex gap-4">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">keyboard_arrow_up</span> Navegar</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">keyboard_return</span> Seleccionar</span>
            </div>
            <p>IA Inteligente Activa</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

input::placeholder {
  font-weight: 500;
}
</style>
