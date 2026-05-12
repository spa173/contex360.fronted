import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY no está configurada. La IA no estará disponible.')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  if (!genAI) throw new Error('Gemini API no configurada. Agrega VITE_GEMINI_API_KEY al .env')
  return genAI.getGenerativeModel({ model: modelName })
}

export async function askGemini(prompt: string, modelName = 'gemini-1.5-flash'): Promise<string> {
  const model = getGeminiModel(modelName)
  const result = await model.generateContent(prompt)
  return result.response.text()
}
