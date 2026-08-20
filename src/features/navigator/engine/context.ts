import { UserHealthContext, NavigationIntent } from '../../../shared/types'

interface IntentRequirements {
  required: string[]
  recommended: string[]
}

const INTENT_REQUIREMENTS: Record<NavigationIntent, IntentRequirements> = {
  symptom_navigation: {
    required: ['concern', 'symptoms', 'duration'],
    recommended: ['severity'],
  },
  find_provider: {
    required: ['specialty', 'location'],
    recommended: [],
  },
  find_hospital: {
    required: ['location'],
    recommended: [],
  },
  appointment: {
    required: ['specialty', 'location'],
    recommended: [],
  },
  insurance: {
    required: ['insurance'],
    recommended: [],
  },
  treatment_followup: {
    required: ['concern'],
    recommended: ['symptoms', 'duration'],
  },
  general_healthcare: {
    required: [],
    recommended: [],
  },
}

export function isContextSufficient(
  intent: NavigationIntent,
  context: UserHealthContext
): boolean {
  const requirements = INTENT_REQUIREMENTS[intent]
  return requirements.required.every(field => {
    switch (field) {
      case 'concern':
        return !!context.concern
      case 'symptoms':
        return context.symptoms.length > 0
      case 'duration':
        return !!context.duration
      case 'severity':
        return context.severity !== undefined
      case 'specialty':
        return !!context.specialty
      case 'location':
        return !!context.location
      case 'insurance':
        return !!context.insurance
      default:
        return true
    }
  })
}

export function getMissingContextFields(
  intent: NavigationIntent,
  context: UserHealthContext
): string[] {
  const requirements = INTENT_REQUIREMENTS[intent]
  const missing: string[] = []

  for (const field of requirements.required) {
    const present = (() => {
      switch (field) {
        case 'concern':
          return !!context.concern
        case 'symptoms':
          return context.symptoms.length > 0
        case 'duration':
          return !!context.duration
        case 'severity':
          return context.severity !== undefined
        case 'specialty':
          return !!context.specialty
        case 'location':
          return !!context.location
        case 'insurance':
          return !!context.insurance
        default:
          return true
      }
    })()

    if (!present) {
      missing.push(field)
    }
  }

  return missing
}
