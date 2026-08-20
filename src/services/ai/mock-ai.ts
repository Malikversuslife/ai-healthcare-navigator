import { UserHealthContext } from '../../shared/types'
import { AIService, AIExtractionResult } from './types'

const SEVERITY_KEYWORDS = {
  severe: ['severe', 'extreme', 'terrible', 'worst', 'unbearable', 'intense', 'sharp'],
  moderate: ['moderate', 'noticeable', 'significant', 'bothersome', 'uncomfortable'],
  mild: ['mild', 'slight', 'minor', 'light', 'barely', 'little'],
}

const DURATION_KEYWORDS = {
  sudden: ['just now', 'suddenly', 'started', 'minutes ago', 'recently', 'today'],
  recent: ['yesterday', 'few days', 'this week', '2 days', '3 days', '4 days'],
  ongoing: ['weeks', 'months', 'years', 'chronic', 'long time', 'always', 'week'],
}

const CONCERN_PATTERNS = [
  { pattern: /head(ache)?|migraine/i, concern: 'headache' },
  { pattern: /stomach|abdomen|belly|tummy/i, concern: 'stomach pain' },
  { pattern: /fever|temperature|hot|burning up/i, concern: 'fever' },
  { pattern: /cough|coughing/i, concern: 'cough' },
  { pattern: /cold|flu|runny nose|sneezing/i, concern: 'cold/flu symptoms' },
  { pattern: /back pain|lower back|spine/i, concern: 'back pain' },
  { pattern: /skin|rash|itch|eczema|acne/i, concern: 'skin condition' },
  { pattern: /eye|vision|blurry/i, concern: 'eye/vision issue' },
  { pattern: /ear|hearing|tinnitus/i, concern: 'ear/hearing issue' },
  { pattern: /tooth|dental|teeth|gum/i, concern: 'dental issue' },
  { pattern: /joint|knee|shoulder|hip|ankle/i, concern: 'joint pain' },
  { pattern: /anxiety|stress|depression|mental|panic/i, concern: 'mental health' },
  { pattern: /pregnant|pregnancy|baby/i, concern: 'pregnancy-related' },
  { pattern: /child|kid|baby|infant/i, concern: 'pediatric issue' },
]

interface ExtractionResult {
  concern: string | null
  symptoms: string[]
  duration: string | null
  severity: number | null
}

function extractConcern(message: string): string | null {
  for (const { pattern, concern } of CONCERN_PATTERNS) {
    if (pattern.test(message)) return concern
  }
  return null
}

function extractSymptoms(message: string): string[] {
  const symptoms: string[] = []
  const lower = message.toLowerCase()

  const symptomPatterns = [
    /pain|ache|hurt/i,
    /nausea|vomit|throwing up/i,
    /dizzy|lightheaded|faint/i,
    /tired|fatigue|exhausted|weak/i,
    /swelling|swollen/i,
    /numbness|tingling/i,
    /bleeding/i,
    /discharge/i,
  ]

  symptomPatterns.forEach(pattern => {
    const match = lower.match(pattern)
    if (match) {
      symptoms.push(match[0])
    }
  })

  return symptoms
}

function extractDuration(message: string): string | null {
  const lower = message.toLowerCase()

  // Check for specific duration mentions
  if (DURATION_KEYWORDS.sudden.some(k => lower.includes(k))) return 'sudden'
  if (DURATION_KEYWORDS.recent.some(k => lower.includes(k))) return 'recent'
  if (DURATION_KEYWORDS.ongoing.some(k => lower.includes(k))) return 'ongoing'

  // Check for numeric duration (e.g., "18 hours", "2 days", "3 weeks")
  const timeMatch = lower.match(/(\d+)\s*(hour|day|week|month|minute)/)
  if (timeMatch) {
    const num = parseInt(timeMatch[1])
    const unit = timeMatch[2]
    if (unit === 'minute' || (unit === 'hour' && num <= 24)) return 'sudden'
    if (unit === 'hour' || (unit === 'day' && num <= 7)) return 'recent'
    return 'ongoing'
  }

  return null
}

function extractSeverity(message: string): number | null {
  const lower = message.toLowerCase()

  // Check for severity keywords
  if (SEVERITY_KEYWORDS.severe.some(k => lower.includes(k))) return 8
  if (SEVERITY_KEYWORDS.moderate.some(k => lower.includes(k))) return 5
  if (SEVERITY_KEYWORDS.mild.some(k => lower.includes(k))) return 2

  // Check for numeric severity (e.g., "7 out of 10", "severity 8")
  const numberMatch = lower.match(/(\d+)\s*(out of|\/)\s*10/)
  if (numberMatch) {
    const num = parseInt(numberMatch[1])
    if (num >= 1 && num <= 10) return num
  }

  // Check for standalone number 1-10
  const standaloneMatch = lower.match(/\b([1-9]|10)\b/)
  if (standaloneMatch) {
    const num = parseInt(standaloneMatch[1])
    if (num >= 1 && num <= 10) return num
  }

  return null
}

function extractInformation(message: string): ExtractionResult {
  return {
    concern: extractConcern(message),
    symptoms: extractSymptoms(message),
    duration: extractDuration(message),
    severity: extractSeverity(message),
  }
}

function getMissingInformation(context: UserHealthContext): string[] {
  const missing: string[] = []
  if (!context.concern) missing.push('concern')
  if (!context.duration) missing.push('duration')
  if (context.severity === null || context.severity === undefined) missing.push('severity')
  if (context.symptoms.length === 0) missing.push('symptoms')
  return missing
}

function getFollowUpQuestion(context: UserHealthContext): string {
  const missing = getMissingInformation(context)

  if (missing.includes('concern')) {
    return 'What brings you here today? Can you describe what you\'re experiencing?'
  }
  if (missing.includes('duration')) {
    return 'How long have you been experiencing this?'
  }
  if (missing.includes('severity')) {
    return 'On a scale of 1 to 10, how would you rate the severity?'
  }
  if (missing.includes('symptoms')) {
    return 'Are there any other symptoms you\'re experiencing alongside this?'
  }
  return 'Can you tell me more about what you\'re experiencing?'
}

export class MockAIService implements AIService {
  async processMessage(
    message: string,
    context: UserHealthContext
  ): Promise<AIExtractionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))

    // Extract information from message
    const extracted = extractInformation(message)

    // Build updated context - only update fields that were actually extracted
    const updatedContext: Partial<UserHealthContext> = {}

    if (extracted.concern) {
      updatedContext.concern = extracted.concern
    }
    if (extracted.symptoms.length > 0) {
      // Merge symptoms, avoiding duplicates
      const existingSymptoms = new Set(context.symptoms.map(s => s.toLowerCase()))
      const newSymptoms = extracted.symptoms.filter(s => !existingSymptoms.has(s.toLowerCase()))
      if (newSymptoms.length > 0) {
        updatedContext.symptoms = [...context.symptoms, ...newSymptoms]
      }
    }
    if (extracted.duration) {
      updatedContext.duration = extracted.duration
    }
    if (extracted.severity !== null) {
      updatedContext.severity = extracted.severity
    }

    // Get appropriate follow-up
    const mergedContext: UserHealthContext = {
      ...context,
      ...updatedContext,
    }
    const followUp = getFollowUpQuestion(mergedContext)

    // Generate contextual response
    let response = ''
    if (extracted.concern || extracted.symptoms.length > 0 || extracted.duration || extracted.severity !== null) {
      response = `I understand. ${followUp}`
    } else {
      response = followUp
    }

    return {
      response,
      extractedContext: updatedContext,
      followUpQuestion: followUp,
    }
  }
}

export function createAIService(): AIService {
  return new MockAIService()
}
