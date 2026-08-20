import { UserHealthContext } from '../../shared/types'
import { AIService, AIExtractionResult } from './types'

interface APIResponse {
  response: string
  extractedContext: {
    concern: string | null
    symptoms: string[]
    duration: string | null
    severity: number | null
  }
  followUpQuestion: string | null
}

export class OpenAIAIService implements AIService {
  private apiEndpoint: string

  constructor() {
    this.apiEndpoint = '/api/ai/navigate'
  }

  async processMessage(
    message: string,
    context: UserHealthContext
  ): Promise<AIExtractionResult> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: APIResponse = await response.json()

      // Validate and sanitize the response
      const extractedContext: Partial<UserHealthContext> = {}

      if (data.extractedContext.concern) {
        extractedContext.concern = data.extractedContext.concern
      }
      if (data.extractedContext.symptoms && data.extractedContext.symptoms.length > 0) {
        // Merge symptoms, avoiding duplicates
        const existingSymptoms = new Set(context.symptoms.map(s => s.toLowerCase()))
        const newSymptoms = data.extractedContext.symptoms.filter(
          s => !existingSymptoms.has(s.toLowerCase())
        )
        if (newSymptoms.length > 0) {
          extractedContext.symptoms = [...context.symptoms, ...newSymptoms]
        }
      }
      if (data.extractedContext.duration) {
        extractedContext.duration = data.extractedContext.duration
      }
      if (data.extractedContext.severity !== null && data.extractedContext.severity !== undefined) {
        extractedContext.severity = data.extractedContext.severity
      }

      return {
        response: data.response,
        extractedContext,
        followUpQuestion: data.followUpQuestion || undefined,
      }

    } catch (error) {
      console.error('AI service error:', error)

      // Fallback to a safe default response
      return {
        response: 'I apologize, but I encountered an error processing your message. Could you please rephrase or try again?',
        extractedContext: {},
      }
    }
  }
}
