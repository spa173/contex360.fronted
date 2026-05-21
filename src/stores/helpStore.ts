import { defineStore } from 'pinia'
import { businessApi } from '../services/businessApi'

export interface HelpCategory {
  id: string
  label: string
  icon: string
}

export interface HelpArticle {
  id: number
  categoryId: string
  title: string
  summary: string
  readTime: string
  icon: string
  steps: string[]
  category?: HelpCategory
}

export interface HelpFaq {
  id: number
  question: string
  answer: string
}

interface HelpState {
  categories: HelpCategory[]
  articles: HelpArticle[]
  faqs: HelpFaq[]
  isLoading: boolean
  error: string | null
}

export const useHelpStore = defineStore('help', {
  state: (): HelpState => ({
    categories: [],
    articles: [],
    faqs: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchHelpData() {
      this.isLoading = true
      this.error = null
      try {
        const [categoriesRes, articlesRes, faqsRes] = await Promise.all([
          businessApi.getHelpCategories(),
          businessApi.getHelpArticles(),
          businessApi.getHelpFaqs(),
        ])
        
        this.categories = categoriesRes
        this.articles = articlesRes
        this.faqs = faqsRes
      } catch (e: any) {
        console.error('Failed to load help center data:', e)
        this.error = e.message || 'Error loading help center data'
      } finally {
        this.isLoading = false
      }
    },
  },
})
