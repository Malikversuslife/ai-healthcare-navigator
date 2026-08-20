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
    // OpenAI service now calls our server-side API
    // No API key is exposed to the client
    serviceInstance = new OpenAIAIService()
  } else {
    serviceInstance = new MockAIService()
  }

  return serviceInstance
}

export function resetAIService(): void {
  serviceInstance = null
}
