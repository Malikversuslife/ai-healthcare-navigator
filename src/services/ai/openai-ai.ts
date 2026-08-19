import OpenAI from 'openai'
import { UserHealthContext } from '../../shared/types'
import { AIService, AIExtractionResult } from './types'

const SYSTEM_PROMPT = `You are a healthcare navigation assistant. Your role is to extract structured information from user messages about health concerns.

IMPORTANT RULES:
1. You MUST NOT diagnose medical conditions
2. You MUST NOT recommend specific treatments or medications
3. You MUST NOT determine urgency levels or care categories
4. You ONLY extract information and ask clarifying questions

Your job is to:
1. Extract the health concern from the user's message
2. Identify symptoms mentioned
3. Determine how long they've had the symptom (duration)
4. Understand severity if mentioned
5. Ask one follow-up question at a time to gather missing information

Respond with a JSON object containing:
{
  "response": "Your conversational response to the user",
  "extractedContext": {
    "concern": "string or null - the main health concern",
    "symptoms": ["array of symptoms mentioned"],
    "duration": "sudden, recent, ongoing, or null",
    "severity": "number 1-10 or null"
  },
  "isReadyForRecommendation": true/false,
  "followUpQuestion": "string or null - only if more info needed"
}

Duration mapping:
- "sudden": just started, minutes/hours ago, today
- "recent": 1-7 days
- "ongoing": more than a week, chronic

Severity mapping:
- Extract if user mentions a number (1-10)
- Map words: mild=2-3, moderate=5-6, severe=7-8, extreme=9-10

Be conversational but efficient. Ask only what's missing. Never ask for information already provided.`

function getMissingFields(context: UserHealthContext): string[] {
  const missing: string[] = []
  if (!context.concern) missing.push('concern')
  if (context.symptoms.length === 0) missing.push('symptoms')
  if (!context.duration) missing.push('duration')
  if (context.severity === null || context.severity === undefined) missing.push('severity')
  return missing
}

function getContextCompleteness(context: UserHealthContext): number {
  let completeness = 0
  if (context.concern) completeness += 30
  if (context.symptoms.length > 0) completeness += 20
  if (context.duration) completeness += 25
  if (context.severity !== null && context.severity !== undefined) completeness += 15
  if (context.location) completeness += 10
  return completeness
}

interface OpenAIExtractionResponse {
  response: string
  extractedContext: {
    concern: string | null
    symptoms: string[]
    duration: string | null
    severity: number | null
  }
  isReadyForRecommendation: boolean
  followUpQuestion: string | null
}

export class OpenAIAIService implements AIService {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async processMessage(
    message: string,
    context: UserHealthContext
  ): Promise<AIExtractionResult> {
    try {
      const missingFields = getMissingFields(context)
      const completeness = getContextCompleteness(context)

      const userMessage = `Current context:
- Concern: ${context.concern || 'not provided'}
- Symptoms: ${context.symptoms.length > 0 ? context.symptoms.join(', ') : 'not provided'}
- Duration: ${context.duration || 'not provided'}
- Severity: ${context.severity !== null ? context.severity : 'not provided'}
- Missing information: ${missingFields.length > 0 ? missingFields.join(', ') : 'none'}
- Context completeness: ${completeness}%

User message: "${message}"

Extract information from this message. If context completeness is already 70% or higher, set isReadyForRecommendation to true.`

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      const parsed: OpenAIExtractionResponse = JSON.parse(content)

      // Validate and sanitize the response
      const extractedContext: Partial<UserHealthContext> = {}

      if (parsed.extractedContext.concern) {
        extractedContext.concern = parsed.extractedContext.concern
      }
      if (parsed.extractedContext.symptoms && parsed.extractedContext.symptoms.length > 0) {
        // Merge symptoms, avoiding duplicates
        const existingSymptoms = new Set(context.symptoms.map(s => s.toLowerCase()))
        const newSymptoms = parsed.extractedContext.symptoms.filter(
          s => !existingSymptoms.has(s.toLowerCase())
        )
        if (newSymptoms.length > 0) {
          extractedContext.symptoms = [...context.symptoms, ...newSymptoms]
        }
      }
      if (parsed.extractedContext.duration) {
        extractedContext.duration = parsed.extractedContext.duration
      }
      if (parsed.extractedContext.severity !== null && parsed.extractedContext.severity !== undefined) {
        extractedContext.severity = parsed.extractedContext.severity
      }

      return {
        response: parsed.response,
        extractedContext,
        isReadyForRecommendation: parsed.isReadyForRecommendation,
        followUpQuestion: parsed.followUpQuestion || undefined,
      }

    } catch (error) {
      console.error('OpenAI service error:', error)
      
      // Fallback to a safe default response
      return {
        response: 'I apologize, but I encountered an error processing your message. Could you please rephrase or try again?',
        extractedContext: {},
        isReadyForRecommendation: false,
      }
    }
  }
}
