import { AIService } from './types'
import { MockAIService } from './mock-ai'
import { OpenAIAIService } from './openai-ai'

let serviceInstance: AIService | null = null

export function getAIService(): AIService {
  if (serviceInstance) {
    return serviceInstance
  }

  const mode = import.meta.env.VITE_AI_MODE || 'mock'

  if (mode === 'openai') {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini'
    
    if (!apiKey) {
      console.error('VITE_OPENAI_API_KEY is not set. Falling back to mock AI.')
      serviceInstance = new MockAIService()
    } else {
      serviceInstance = new OpenAIAIService(apiKey, model)
    }
  } else {
    serviceInstance = new MockAIService()
  }

  return serviceInstance
}

export function resetAIService(): void {
  serviceInstance = null
}
