import { UserHealthContext, NavigationIntent } from '../../../shared/types'

// STAGE 4A — MINIMAL SAFETY BOUNDARY.
//
// This rule set is INTENTIONALLY INCOMPLETE and must NOT be treated as
// comprehensive clinical triage. It establishes the interface and
// integration point for the safety engine.
//
// The emergency symptom list and severity thresholds will be defined
// using reputable clinical/public-health guidance in Stage 4B.
//
// Do NOT add medical rules here. Do NOT expand this list based on
// assumptions about what constitutes an emergency.
//
// The current keyword list is a structural placeholder only.

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

  // NOTE: Severity alone must NOT become the medical emergency engine.
  // Do not add `severity >= N → emergency` rules here.
  // Emergency detection must be based on clinical indicators, not
  // a single numerical value.

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
