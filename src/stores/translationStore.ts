import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    currentLanguage: 'es',
    translations: {} as Record<string, string>,
    isTranslating: false,
    availableLanguages: [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' },
      { code: 'fr', name: 'Français' }
    ]
  }),

  actions: {
    async setLanguage(langCode: string, originalTexts: Record<string, string>) {
      if (langCode === 'es') {
        this.currentLanguage = 'es'
        this.translations = {} // Use original
        return
      }

      this.isTranslating = true
      try {
        const token = localStorage.getItem('contex360-auth-token')
        const response = await axios.post(`${API_URL}/ai/translate`, {
          texts: originalTexts,
          targetLang: langCode
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.translations = response.data
        this.currentLanguage = langCode
      } catch (error) {
        console.error('Translation error:', error)
      } finally {
        this.isTranslating = false
      }
    },

    t(key: string, defaultValue: string) {
      return this.translations[key] || defaultValue
    }
  }
})
