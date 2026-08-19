import { UserHealthContext } from '../../shared/types'
import { AIService, AIExtractionResult } from './types'

const EMERGENCY_KEYWORDS = [
  'chest pain', 'difficulty breathing', 'can\'t breathe', 'not breathing',
  'severe bleeding', 'unconscious', 'stroke', 'seizure', 'anaphylaxis',
  'heart attack', 'overdose', 'suicide', 'choking', 'severe allergic reaction',
]

const SEVERITY_KEYWORDS = {
  severe: ['severe', 'extreme', 'terrible', 'worst', 'unbearable', 'intense', 'sharp'],
  moderate: ['moderate', 'noticeable', 'significant', 'bothersome', 'uncomfortable'],
  mild: ['mild', 'slight', 'minor', 'light', 'barely', 'little'],
}

const DURATION_KEYWORDS = {
  sudden: ['just now', 'suddenly', 'started', 'minutes ago', 'recently'],
  recent: ['today', 'yesterday', 'few days', 'this week'],
  ongoing: ['weeks', 'months', 'years', 'chronic', 'long time', 'always'],
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

const FOLLOW_UP_QUESTIONS = [
  'Can you tell me more about what you\'re experiencing?',
  'How long have you had this symptom?',
  'On a scale of 1 to 10, how would you rate the severity?',
  'Are there any other symptoms you\'re experiencing?',
  'Has this happened before?',
]

function isEmergency(message: string): boolean {
  const lower = message.toLowerCase()
  return EMERGENCY_KEYWORDS.some(keyword => lower.includes(keyword))
}

function extractSeverity(message: string): number {
  const lower = message.toLowerCase()
  if (SEVERITY_KEYWORDS.severe.some(k => lower.includes(k))) return 8
  if (SEVERITY_KEYWORDS.moderate.some(k => lower.includes(k))) return 5
  if (SEVERITY_KEYWORDS.mild.some(k => lower.includes(k))) return 2
  const numberMatch = lower.match(/(\d+)/)
  if (numberMatch) {
    const num = parseInt(numberMatch[1])
    if (num >= 1 && num <= 10) return num
  }
  return 5
}

function extractDuration(message: string): string {
  const lower = message.toLowerCase()
  if (DURATION_KEYWORDS.sudden.some(k => lower.includes(k))) return 'sudden'
  if (DURATION_KEYWORDS.recent.some(k => lower.includes(k))) return 'recent'
  if (DURATION_KEYWORDS.ongoing.some(k => lower.includes(k))) return 'ongoing'
  return 'recent'
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
    if (pattern.test(lower)) {
      symptoms.push(lower.match(pattern)?.[0] || '')
    }
  })

  return symptoms
}

function extractConcern(message: string): string | null {
  for (const { pattern, concern } of CONCERN_PATTERNS) {
    if (pattern.test(message)) return concern
  }
  return null
}

function getContextCompleteness(context: UserHealthContext): number {
  let completeness = 0
  if (context.concern) completeness += 30
  if (context.symptoms.length > 0) completeness += 20
  if (context.duration) completeness += 25
  if (context.severity) completeness += 15
  if (context.location) completeness += 10
  return completeness
}

function getFollowUpQuestion(context: UserHealthContext): string {
  if (!context.concern) {
    return 'What brings you here today? Can you describe what you\'re experiencing?'
  }
  if (!context.duration) {
    return 'How long have you been experiencing this?'
  }
  if (context.severity === 5) {
    return 'On a scale of 1 to 10, how would you rate the severity of your symptoms?'
  }
  return FOLLOW_UP_QUESTIONS[Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)]
}

export class MockAIService implements AIService {
  async processMessage(
    message: string,
    context: UserHealthContext
  ): Promise<AIExtractionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    // Emergency check
    if (isEmergency(message)) {
      return {
        response: 'Based on what you\'re describing, this sounds like it could be a medical emergency. Please call 112 or go to the nearest emergency room immediately. If you\'re in Lagos, you can also call 01-112.',
        extractedContext: { ...context, concern: 'emergency', severity: 10 },
        isReadyForRecommendation: false,
      }
    }

    // Extract information from message
    const extractedConcern = extractConcern(message)
    const extractedSeverity = extractSeverity(message)
    const extractedDuration = extractDuration(message)
    const extractedSymptoms = extractSymptoms(message)

    const updatedContext: Partial<UserHealthContext> = {
      concern: extractedConcern || context.concern,
      symptoms: extractedSymptoms.length > 0 ? extractedSymptoms : context.symptoms,
      severity: extractedSeverity !== 5 ? extractedSeverity : context.severity,
      duration: extractedDuration !== 'recent' ? extractedDuration : context.duration,
    }

    // Merge with existing context
    const mergedContext: UserHealthContext = {
      ...context,
      ...updatedContext,
    }

    // Check if we have enough information
    const completeness = getContextCompleteness(mergedContext)
    const isReady = completeness >= 70

    if (isReady) {
      const concernText = mergedContext.concern || 'your concern'
      return {
        response: `Thank you for sharing that information about your ${concernText}. Based on what you've told me, I can now provide you with a care recommendation and help you find appropriate healthcare providers.`,
        extractedContext: updatedContext,
        isReadyForRecommendation: true,
      }
    }

    // Need more information
    const followUp = getFollowUpQuestion(mergedContext)
    return {
      response: `I understand. ${followUp}`,
      extractedContext: updatedContext,
      isReadyForRecommendation: false,
      followUpQuestion: followUp,
    }
  }
}

export function createAIService(): AIService {
  return new MockAIService()
}
