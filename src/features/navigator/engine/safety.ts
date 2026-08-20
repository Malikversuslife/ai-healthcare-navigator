import { UserHealthContext, NavigationIntent } from '../../../shared/types'

const EMERGENCY_SYMPTOMS = [
  'chest pain',
  'difficulty breathing',
  'severe bleeding',
  'unconscious',
  'stroke',
  'seizure',
]

export interface SafetyResult {
  triggered: boolean
  indicators: string[]
}

export function containsEmergencyIndicators(context: UserHealthContext): SafetyResult {
  const indicators: string[] = []
  const lowerConcern = context.concern.toLowerCase()
  const lowerSymptoms = context.symptoms.map(s => s.toLowerCase())

  for (const symptom of EMERGENCY_SYMPTOMS) {
    if (lowerConcern.includes(symptom)) {
      indicators.push(`concern: ${symptom}`)
    }
    if (lowerSymptoms.some(s => s.includes(symptom))) {
      indicators.push(`symptom: ${symptom}`)
    }
  }

  if (context.severity?.value !== undefined && context.severity.value >= 9) {
    indicators.push(`severity: ${context.severity.value}`)
  }

  return {
    triggered: indicators.length > 0,
    indicators,
  }
}

export function determineIntentFromContext(
  context: UserHealthContext
): NavigationIntent {
  if (context.concern || context.symptoms.length > 0) {
    return 'symptom_navigation'
  }
  return 'general_healthcare'
}
