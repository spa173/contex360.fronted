<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useHelpStore } from '../../stores/helpStore'
import { businessApi } from '../../services/businessApi'

const auth = useAuthStore()
const helpStore = useHelpStore()
const emit = defineEmits(['notify', 'navigate'])

const searchQuery = ref('')
const activeCategory = ref('all')
const expandedFaq = ref(null)

onMounted(() => {
  helpStore.fetchHelpData()
})

const categories = computed(() => [
  { id: 'all', label: 'Todos', icon: 'apps' },
  ...helpStore.categories
])

const filteredArticles = computed(() => {
  let results = helpStore.articles

  if (activeCategory.value !== 'all') {
    results = results.filter(a => a.categoryId === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    results = results.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q)
    )
  }
  return results
})

const filteredFaqs = computed(() => {
  if (!searchQuery.value.trim()) return helpStore.faqs
  const q = searchQuery.value.toLowerCase()
  return helpStore.faqs.filter(f =>
    f.question.toLowerCase().includes(q) ||
    f.answer.toLowerCase().includes(q)
  )
})

function toggleFaq(id) {
  expandedFaq.value = expandedFaq.value === id ? null : id
}

// Article detail view
const selectedArticle = ref(null)
function openArticle(article) { selectedArticle.value = article }
function closeArticle() { selectedArticle.value = null }

// Support ticket modal
const showTicketModal = ref(false)
const ticketForm = ref({ subject: '', description: '', priority: 'media' })
const ticketSubmitting = ref(false)

function openTicketModal() { showTicketModal.value = true }
function closeTicketModal() {
  showTicketModal.value = false
  ticketForm.value = { subject: '', description: '', priority: 'media' }
}

async function submitTicket() {
  if (!ticketForm.value.subject.trim() || !ticketForm.value.description.trim()) return
  ticketSubmitting.value = true
  try {
    await businessApi.createSupportTicket({
      subject: ticketForm.value.subject,
      description: ticketForm.value.description,
      priority: ticketForm.value.priority,
    })
    closeTicketModal()
    emit('notify', { message: 'Ticket enviado', detail: 'Tu solicitud fue registrada. Nuestro equipo te contactará en menos de 4 horas hábiles.' })
  } catch {
    emit('notify', { message: 'Error al enviar', detail: 'No se pudo crear el ticket. Intenta de nuevo.' })
  } finally {
    ticketSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-1">
        <span class="material-symbols-outlined text-[28px] text-[#2563EB]">help</span>
        <h1 class="text-[24px] font-extrabold tracking-tight text-[#18181B]">Centro de Ayuda</h1>
      </div>
      <p class="text-[14px] text-[#71717A] font-medium ml-[40px]">Encuentra guías, tutoriales y respuestas a las preguntas más frecuentes sobre Contex360.</p>
    </div>

    <!-- Search -->
    <div class="relative mb-8">
      <div class="flex items-center gap-3 border border-[#E4E4E7] rounded-[14px] px-4 py-3.5 bg-white focus-within:border-[#2563EB] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all shadow-sm">
        <span class="material-symbols-outlined text-[20px] text-[#A1A1AA]">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar artículos, guías o preguntas frecuentes..."
          class="flex-1 bg-transparent outline-none text-[14px] text-[#18181B] placeholder:text-[#A1A1AA] font-medium"
        />
        <kbd v-if="!searchQuery" class="hidden sm:inline-block text-[10px] font-mono text-[#A1A1AA] border border-[#E4E4E7] rounded px-1.5 py-0.5 bg-[#FAFAFA]">⌘K</kbd>
      </div>
    </div>

    <!-- Article Detail View -->
    <div v-if="selectedArticle" class="animate-in fade-in duration-200">
      <button @click="closeArticle" class="flex items-center gap-1.5 text-[13px] font-semibold text-[#71717A] hover:text-[#18181B] mb-5 transition-colors">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        Volver al Centro de Ayuda
      </button>

      <div class="bg-white border border-[#E4E4E7] rounded-[16px] p-6 sm:p-8 shadow-sm">
        <div class="flex items-start gap-4 mb-6">
          <div class="w-12 h-12 rounded-[12px] bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[24px] text-[#2563EB]">{{ selectedArticle.icon }}</span>
          </div>
          <div>
            <h2 class="text-[20px] font-extrabold tracking-tight text-[#18181B] mb-1">{{ selectedArticle.title }}</h2>
            <div class="flex items-center gap-3 text-[12px] font-medium text-[#A1A1AA]">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">schedule</span> {{ selectedArticle.readTime }} de lectura</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">folder</span> {{ categories.find(c => c.id === selectedArticle.categoryId)?.label }}</span>
            </div>
          </div>
        </div>

        <p class="text-[14px] text-[#71717A] leading-relaxed mb-6">{{ selectedArticle.summary }}</p>

        <div class="border-t border-[#F4F4F5] pt-6">
          <h3 class="text-[14px] font-bold text-[#18181B] mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-[#2563EB]">checklist</span>
            Paso a paso
          </h3>
          <ol class="space-y-3">
            <li v-for="(step, idx) in selectedArticle.steps" :key="idx" class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
              <p class="text-[14px] text-[#18181B] font-medium leading-relaxed">{{ step }}</p>
            </li>
          </ol>
        </div>

        <div class="border-t border-[#F4F4F5] mt-8 pt-6 flex items-center justify-between">
          <p class="text-[12px] text-[#A1A1AA] font-medium">¿Te fue útil este artículo?</p>
          <div class="flex gap-2">
            <button @click="emit('notify', { message: 'Gracias por tu feedback', detail: 'Nos alegra que este artículo te haya sido útil.' })" class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#E4E4E7] text-[12px] font-semibold text-[#18181B] hover:bg-[#FAFAFA] transition-colors">
              <span class="material-symbols-outlined text-[16px] text-emerald-500">thumb_up</span> Sí
            </button>
            <button @click="emit('notify', { message: 'Gracias por tu feedback', detail: 'Trabajaremos en mejorar este artículo.' })" class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#E4E4E7] text-[12px] font-semibold text-[#18181B] hover:bg-[#FAFAFA] transition-colors">
              <span class="material-symbols-outlined text-[16px] text-rose-400">thumb_down</span> No
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content (hidden when article is open) -->
    <div v-else>
      <!-- Category Tabs -->
      <div class="flex flex-wrap gap-2 mb-6" v-if="!helpStore.isLoading">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          :class="[
            'flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[12px] font-semibold transition-all border',
            activeCategory === cat.id
              ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
              : 'bg-white text-[#71717A] border-[#E4E4E7] hover:text-[#18181B] hover:border-[#D4D4D8]'
          ]"
        >
          <span class="material-symbols-outlined text-[16px]">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="helpStore.isLoading" class="flex items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Articles Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <button
          v-for="article in filteredArticles"
          :key="article.id"
          @click="openArticle(article)"
          class="text-left bg-white border border-[#E4E4E7] rounded-[14px] p-5 hover:border-[#2563EB]/40 hover:shadow-md transition-all group cursor-pointer"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="w-9 h-9 rounded-[10px] bg-[#2563EB]/10 flex items-center justify-center group-hover:bg-[#2563EB]/15 transition-colors">
              <span class="material-symbols-outlined text-[18px] text-[#2563EB]">{{ article.icon }}</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">{{ categories.find(c => c.id === article.categoryId)?.label }}</span>
          </div>
          <h3 class="text-[14px] font-bold text-[#18181B] mb-1.5 group-hover:text-[#2563EB] transition-colors leading-snug">{{ article.title }}</h3>
          <p class="text-[12px] text-[#71717A] leading-relaxed line-clamp-2">{{ article.summary }}</p>
          <div class="flex items-center gap-1.5 mt-3 text-[11px] font-medium text-[#A1A1AA]">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            {{ article.readTime }}
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="!helpStore.isLoading && filteredArticles.length === 0" class="text-center py-12">
        <span class="material-symbols-outlined text-[40px] text-[#D4D4D8] mb-3">search_off</span>
        <p class="text-[14px] font-bold text-[#18181B] mb-1">Sin resultados</p>
        <p class="text-[12px] text-[#71717A]">No encontramos artículos que coincidan con tu búsqueda. Intenta con otros términos.</p>
      </div>

      <!-- FAQ Section -->
      <div class="mb-8">
        <div class="flex items-center gap-2.5 mb-5">
          <span class="material-symbols-outlined text-[22px] text-[#2563EB]">quiz</span>
          <h2 class="text-[18px] font-extrabold tracking-tight text-[#18181B]">Preguntas Frecuentes</h2>
        </div>

        <div class="space-y-2">
          <div
            v-for="faq in filteredFaqs"
            :key="faq.id"
            class="bg-white border border-[#E4E4E7] rounded-[12px] overflow-hidden transition-all"
            :class="{ 'border-[#2563EB]/30': expandedFaq === faq.id }"
          >
            <button
              @click="toggleFaq(faq.id)"
              class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FAFAFA] transition-colors"
            >
              <span class="text-[13px] font-bold text-[#18181B] pr-4 leading-snug">{{ faq.question }}</span>
              <span
                class="material-symbols-outlined text-[18px] text-[#A1A1AA] transition-transform flex-shrink-0"
                :class="{ 'rotate-180': expandedFaq === faq.id }"
              >expand_more</span>
            </button>
            <div
              v-if="expandedFaq === faq.id"
              class="px-5 pb-4 text-[13px] text-[#71717A] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support Card -->
      <div class="bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] rounded-[16px] p-6 sm:p-8 text-white shadow-lg">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div class="w-14 h-14 rounded-[14px] bg-white/15 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-[28px]">support_agent</span>
          </div>
          <div class="flex-1">
            <h3 class="text-[16px] font-extrabold tracking-tight mb-1">¿No encontraste lo que buscabas?</h3>
            <p class="text-[13px] font-medium text-blue-100 leading-relaxed">Nuestro equipo de soporte está disponible de lunes a viernes de 8:00 a.m. a 6:00 p.m. (COT). Tiempo de respuesta promedio: 2 horas.</p>
          </div>
          <button
            @click="openTicketModal"
            class="px-5 py-2.5 bg-white text-[#2563EB] rounded-[10px] text-[13px] font-bold hover:bg-blue-50 transition-colors shadow-sm flex-shrink-0 flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[18px]">mail</span>
            Contactar soporte
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Support Ticket Modal -->
  <Teleport to="body">
    <div v-if="showTicketModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4" @click.self="closeTicketModal">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="closeTicketModal"></div>
      <div class="relative bg-white rounded-[18px] shadow-[0_8px_60px_rgba(0,0,0,0.18)] w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F4F4F5]">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[22px] text-[#2563EB]">support_agent</span>
            <h2 class="text-[16px] font-extrabold tracking-tight text-[#18181B]">Nuevo ticket de soporte</h2>
          </div>
          <button @click="closeTicketModal" class="w-7 h-7 rounded-[8px] hover:bg-[#F4F4F5] flex items-center justify-center text-[#A1A1AA] hover:text-[#18181B] transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Form -->
        <div class="px-6 py-5 space-y-4">
          <!-- Subject -->
          <div>
            <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Asunto</label>
            <input
              v-model="ticketForm.subject"
              type="text"
              placeholder="Describe brevemente el problema..."
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all"
            />
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Prioridad</label>
            <div class="flex gap-2">
              <button
                v-for="p in [{ value: 'baja', label: 'Baja', color: 'emerald' }, { value: 'media', label: 'Media', color: 'amber' }, { value: 'alta', label: 'Alta', color: 'orange' }, { value: 'critica', label: 'Crítica', color: 'rose' }]"
                :key="p.value"
                @click="ticketForm.priority = p.value"
                :class="[
                  'flex-1 py-2 rounded-[8px] text-[12px] font-bold border transition-all',
                  ticketForm.priority === p.value
                    ? 'bg-[#18181B] text-white border-[#18181B]'
                    : 'bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#D4D4D8]'
                ]"
              >{{ p.label }}</button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5">Descripción</label>
            <textarea
              v-model="ticketForm.description"
              rows="4"
              placeholder="Explica con detalle qué ocurre, qué pasos seguiste y qué resultado esperabas..."
              class="w-full border border-[#E4E4E7] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-all resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[#F4F4F5] bg-[#FAFAFA] flex items-center justify-between gap-3">
          <p class="text-[11px] text-[#A1A1AA]">Tiempo de respuesta: <span class="font-semibold text-[#18181B]">≤ 4 horas hábiles</span></p>
          <div class="flex gap-2">
            <button @click="closeTicketModal" class="px-4 py-2 rounded-[8px] border border-[#E4E4E7] text-[12px] font-semibold text-[#71717A] hover:bg-white transition-colors">
              Cancelar
            </button>
            <button
              @click="submitTicket"
              :disabled="!ticketForm.subject.trim() || !ticketForm.description.trim() || ticketSubmitting"
              class="px-4 py-2 rounded-[8px] bg-[#2563EB] text-white text-[12px] font-bold hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span v-if="ticketSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span class="material-symbols-outlined text-[15px]" v-else>send</span>
              {{ ticketSubmitting ? 'Enviando...' : 'Enviar ticket' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
