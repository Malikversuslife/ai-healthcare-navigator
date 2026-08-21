import {
  CareLevel,
  CareRecommendation,
  NavigationContext,
  NavigationAction,
  CarePathway,
  CarePathwayResult,
} from '../../../shared/types'
import { emergencyConfig } from '../../../shared/config'
import { evaluateEmergencySafety } from './safety'
import { isContextSufficient, getMissingContextFields } from './context'
import { evaluateCarePathway } from './pathway'

export { evaluateEmergencySafety }
export { evaluateCarePathway }

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

// ---------------------------------------------------------------------------
// Pathway-based recommendation building
//
// Maps CarePathway to a CareRecommendation for UI display.
// The pathway is determined by application logic, not the AI.
// ---------------------------------------------------------------------------

function pathwayToCareLevel(pathway: CarePathway): CareLevel {
  switch (pathway) {
    case 'prompt_medical_review':
      return 'urgent_care'
    case 'primary_care':
      return 'primary_care'
    case 'provider_or_specialist':
      return 'primary_care'
    case 'informational_navigation':
      return 'primary_care'
  }
}

export function buildPathwayRecommendation(
  pathwayResult: CarePathwayResult
): CareRecommendation {
  const { pathway } = pathwayResult

  const recommendations: Record<CarePathway, Omit<CareRecommendation, 'careLevel'>> = {
    primary_care: {
      reasoning: 'Starting with a primary care clinician would be a reasonable next step. They can assess what you\'re experiencing and refer you if needed.',
      disclaimer: 'This guidance is based on the information you provided. A healthcare professional can provide a proper evaluation.',
      nextSteps: [
        { type: 'find-provider', label: 'Find primary care', description: 'Locate a clinic or primary care provider near you' },
        { type: 'learn-more', label: 'Learn more', description: 'Find reliable health information about your concern' },
      ],
    },
    provider_or_specialist: {
      reasoning: 'I can help you find the type of healthcare professional you\'re looking for.',
      disclaimer: 'This navigation is based on the type of provider you mentioned. A healthcare professional can provide proper evaluation.',
      nextSteps: [
        { type: 'find-provider', label: 'Find provider', description: 'Search for the type of healthcare professional you need' },
      ],
    },
    prompt_medical_review: {
      reasoning: 'Because of the changes you\'ve described, it would be reasonable to seek medical assessment promptly.',
      disclaimer: 'This is not a diagnosis. This recommendation is based on the information you shared. Please consult a healthcare professional.',
      nextSteps: [
        { type: 'find-provider', label: 'Find a provider', description: 'Locate a healthcare provider who can assess your concern' },
        { type: 'learn-more', label: 'Learn more', description: 'Find reliable health information' },
      ],
    },
    informational_navigation: {
      reasoning: 'Here is the information you requested.',
      disclaimer: 'This is general healthcare navigation information. For personal medical advice, please consult a healthcare professional.',
      nextSteps: [
        { type: 'learn-more', label: 'Learn more', description: 'Find reliable health information' },
      ],
    },
  }

  const rec = recommendations[pathway]
  const careLevel = pathwayToCareLevel(pathway)

  return { careLevel, ...rec }
}
