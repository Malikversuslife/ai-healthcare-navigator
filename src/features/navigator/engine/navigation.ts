import {
  UserHealthContext,
  CareLevel,
  CareRecommendation,
  NavigationContext,
  NavigationAction,
} from '../../../shared/types'
import { emergencyConfig } from '../../../shared/config'
import { evaluateEmergencySafety } from './safety'
import { isContextSufficient, getMissingContextFields } from './context'

export { evaluateEmergencySafety }

export function evaluateNavigation(
  navContext: NavigationContext
): NavigationAction {
  const { intent, state, userContext } = navContext

  // Safety check is always evaluated first
  const safety = evaluateEmergencySafety(userContext)
  if (safety.triggered) {
    return { type: 'emergency' }
  }

  // If we're already in recommendation/provider/insurance/appointment states,
  // continue that flow
  if (state === 'recommendation') {
    return { type: 'show_recommendation' }
  }
  if (state === 'provider_search') {
    return { type: 'search_providers' }
  }
  if (state === 'insurance_check') {
    return { type: 'check_insurance' }
  }
  if (state === 'appointment') {
    return { type: 'start_appointment' }
  }
  if (state === 'complete') {
    return { type: 'complete' }
  }

  // For general healthcare, no context collection needed
  if (intent === 'general_healthcare') {
    return { type: 'answer_general_question' }
  }

  // For find_provider and find_hospital with sufficient context
  if (intent === 'find_provider' || intent === 'find_hospital') {
    if (isContextSufficient(intent, userContext)) {
      return { type: 'search_providers' }
    }
    const missing = getMissingContextFields(intent, userContext)
    return { type: 'collect_context', missingFields: missing }
  }

  // For appointment with sufficient context
  if (intent === 'appointment') {
    if (isContextSufficient(intent, userContext)) {
      return { type: 'start_appointment' }
    }
    const missing = getMissingContextFields(intent, userContext)
    return { type: 'collect_context', missingFields: missing }
  }

  // For insurance
  if (intent === 'insurance') {
    if (isContextSufficient(intent, userContext)) {
      return { type: 'check_insurance' }
    }
    const missing = getMissingContextFields(intent, userContext)
    return { type: 'collect_context', missingFields: missing }
  }

  // For symptom_navigation and treatment_followup
  if (isContextSufficient(intent, userContext)) {
    return { type: 'safety_check' }
  }

  const missing = getMissingContextFields(intent, userContext)
  return { type: 'collect_context', missingFields: missing }
}

export function buildEmergencyRecommendation(): CareRecommendation {
  return {
    careLevel: 'emergency',
    reasoning: 'What you\'ve described may need immediate medical attention.',
    disclaimer: 'This tool cannot determine or rule out a medical emergency. This is not a medical diagnosis.',
    nextSteps: [
      { type: 'emergency', label: 'Call Emergency Services', description: `Dial ${emergencyConfig.emergencyNumber} immediately` },
      { type: 'find-provider', label: 'Find Nearest Hospital', description: 'Locate an emergency room near you' },
    ],
  }
}

// STAGE 4A PLACEHOLDER — intentionally incomplete.
// Care-level determination rules must NOT be invented here.
// This function will be populated with clinically-grounded rules in Stage 4C.
// Do not add severity thresholds, symptom-based rules, or any medical logic.
// For now, all paths return 'primary_care' as a safe placeholder that
// directs the user to a healthcare provider without making medical claims.
export function determineCareLevel(_context: UserHealthContext): CareLevel {
  return 'primary_care'
}

export function buildRecommendation(
  _context: UserHealthContext,
  careLevel: CareLevel
): CareRecommendation {
  const recommendations: Record<CareLevel, Omit<CareRecommendation, 'careLevel'>> = {
    emergency: {
      reasoning: 'What you\'ve described may need immediate medical attention.',
      disclaimer: 'This tool cannot determine or rule out a medical emergency. This is not a medical diagnosis.',
      nextSteps: [
        { type: 'emergency', label: 'Call Emergency Services', description: `Dial ${emergencyConfig.emergencyNumber} immediately` },
        { type: 'find-provider', label: 'Find Nearest Hospital', description: 'Locate an emergency room near you' },
      ],
    },
    urgent_care: {
      reasoning: 'Your symptoms suggest you should be seen by a healthcare provider today or as soon as possible.',
      disclaimer: 'This guidance is based on the information you provided. A healthcare professional can provide a proper evaluation.',
      nextSteps: [
        { type: 'find-provider', label: 'Find Urgent Care', description: 'Locate an urgent care center or walk-in clinic' },
        { type: 'learn-more', label: 'Learn About Your Symptoms', description: 'Find reliable health information' },
      ],
    },
    primary_care: {
      reasoning: 'Based on your symptoms, you should consider visiting a clinic or scheduling an appointment with a primary care provider.',
      disclaimer: 'This recommendation is based on the information you shared. Please consult a healthcare professional for proper evaluation.',
      nextSteps: [
        { type: 'find-provider', label: 'Find a Clinic', description: 'Locate a clinic near you' },
        { type: 'learn-more', label: 'Self-Care Tips', description: 'Basic care information while you wait' },
      ],
    },
    self_care: {
      reasoning: 'Your symptoms appear to be manageable. You may want to schedule an appointment with a healthcare provider if symptoms persist.',
      disclaimer: 'This is general guidance based on the information you provided. A healthcare professional can provide personalized advice.',
      nextSteps: [
        { type: 'find-provider', label: 'Find a Doctor', description: 'Schedule an appointment with a primary care provider' },
        { type: 'learn-more', label: 'Self-Care Tips', description: 'What you can do at home' },
      ],
    },
  }

  const rec = recommendations[careLevel]
  return { careLevel, ...rec }
}
