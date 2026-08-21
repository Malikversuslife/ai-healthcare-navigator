import { UserHealthContext, Severity } from '../../shared/types'
import { AIService, AIExtractionResult } from './types'

interface APIResponse {
  response: string
  extractedContext: {
    concern: string | null
    symptoms: string[]
    duration: string | null
    severity: { value?: number; description?: string } | null
    functionalImpact: { level?: 'none' | 'mild' | 'significant'; description?: string } | null
    symptomTrend: 'improving' | 'stable' | 'worsening' | 'rapidly_worsening' | 'unknown' | null
    specialty: string | null
    location: string | null
    insurance: string | null
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
      if (data.extractedContext.severity) {
        const sev = data.extractedContext.severity
        const severity: Severity = {}
        if (sev.value !== undefined && sev.value !== null) {
          severity.value = sev.value
        }
        if (sev.description) {
          severity.description = sev.description
        }
        if (severity.value !== undefined || severity.description) {
          extractedContext.severity = severity
        }
      }
      if (data.extractedContext.functionalImpact) {
        const fi = data.extractedContext.functionalImpact
        if (fi.level) {
          extractedContext.functionalImpact = {
            level: fi.level,
            ...(fi.description && { description: fi.description }),
          }
        }
      }
      if (data.extractedContext.symptomTrend) {
        extractedContext.symptomTrend = data.extractedContext.symptomTrend
      }
      if (data.extractedContext.specialty) {
        extractedContext.specialty = data.extractedContext.specialty
      }
      if (data.extractedContext.location) {
        extractedContext.location = data.extractedContext.location
      }
      if (data.extractedContext.insurance) {
        extractedContext.insurance = data.extractedContext.insurance
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
