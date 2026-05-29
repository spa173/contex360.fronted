import { ref, onMounted } from 'vue'
import { getApiBaseUrl } from '../services/apiBase'

interface LegalDoc {
  version: string
  lastUpdated: string
  title: string
  content: string
}

export function useLegal(endpoint: string) {
  const doc = ref<LegalDoc | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/legal/${endpoint}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      doc.value = await res.json()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  })

  return { doc, loading, error }
}

export function formatLegalContent(text: string): string {
  return text
    .split('\n')
    .filter(Boolean)
    .map(p => {
      if (/^\d+\./.test(p.trim())) {
        return `<p class="text-[13px] leading-relaxed text-[#18181B] mt-5 font-semibold">${p.trim()}</p>`
      }
      return `<p class="text-[13px] leading-relaxed text-[#52525B] mt-2">${p.trim()}</p>`
    })
    .join('')
}
