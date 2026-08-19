import { AIService } from './types'
import { MockAIService } from './mock-ai'

let serviceInstance: AIService | null = null

export function getAIService(): AIService {
  if (!serviceInstance) {
    serviceInstance = new MockAIService()
  }
  return serviceInstance
}
