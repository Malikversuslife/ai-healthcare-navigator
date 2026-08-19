import { UserHealthContext, CareLevel, CareRecommendation } from '../../../shared/types'

const EMERGENCY_SYMPTOMS = [
  'chest pain',
  'difficulty breathing',
  'severe bleeding',
  'unconscious',
  'stroke',
  'seizure',
]

const URGENT_SYMPTOMS = [
  'severe pain',
  'high fever',
  'persistent vomiting',
  'difficulty swallowing',
  'severe allergic reaction',
]

export function containsEmergencyIndicators(context: UserHealthContext): boolean {
  const lowerConcern = context.concern.toLowerCase()
  const lowerSymptoms = context.symptoms.map((s: string) => s.toLowerCase())

  if (EMERGENCY_SYMPTOMS.some((s: string) => lowerConcern.includes(s))) return true
  if (lowerSymptoms.some((s: string) => EMERGENCY_SYMPTOMS.some((e: string) => s.includes(e)))) return true
  if (context.severity >= 9) return true
  return false
}

export function determineCareLevel(context: UserHealthContext): CareLevel {
  // Emergency
  if (containsEmergencyIndicators(context)) return 'emergency-care'

  // Urgent - severe symptoms or high severity
  if (context.severity >= 7) return 'urgent-care'
  if (URGENT_SYMPTOMS.some((s: string) => context.symptoms.some((sym: string) => sym.toLowerCase().includes(s)))) {
    return 'urgent-care'
  }

  // Same-day - moderate severity or recent onset with moderate symptoms
  if (context.severity >= 4) return 'same-day-care'

  // Routine - mild symptoms
  return 'routine-care'
}

export function buildRecommendation(
  _context: UserHealthContext,
  careLevel: CareLevel
): CareRecommendation {
  const recommendations: Record<CareLevel, Omit<CareRecommendation, 'careLevel'>> = {
    'emergency-care': {
      reasoning: 'Based on the severity of your symptoms, you should seek immediate emergency care.',
      confidence: 0.9,
      disclaimer: 'This is not a medical diagnosis. If you are experiencing a medical emergency, please call 112 or go to the nearest emergency room immediately.',
      nextSteps: [
        { type: 'emergency', label: 'Call Emergency Services', description: 'Dial 112 immediately' },
        { type: 'find-provider', label: 'Find Nearest Hospital', description: 'Locate an emergency room near you' },
      ],
    },
    'urgent-care': {
      reasoning: 'Your symptoms suggest you should be seen by a healthcare provider today or as soon as possible.',
      confidence: 0.75,
      disclaimer: 'This guidance is based on the information you provided. A healthcare professional can provide a proper evaluation.',
      nextSteps: [
        { type: 'find-provider', label: 'Find Urgent Care', description: 'Locate an urgent care center or walk-in clinic' },
        { type: 'learn-more', label: 'Learn About Your Symptoms', description: 'Find reliable health information' },
      ],
    },
    'same-day-care': {
      reasoning: 'Based on your symptoms, you should consider visiting a clinic or hospital within the next 24 hours.',
      confidence: 0.7,
      disclaimer: 'This recommendation is based on the information you shared. Please consult a healthcare professional for proper evaluation.',
      nextSteps: [
        { type: 'find-provider', label: 'Find a Clinic', description: 'Locate a clinic near you' },
        { type: 'learn-more', label: 'Self-Care Tips', description: 'Basic care information while you wait' },
      ],
    },
    'routine-care': {
      reasoning: 'Your symptoms appear to be manageable. You should schedule an appointment with a healthcare provider within the next few days.',
      confidence: 0.65,
      disclaimer: 'This is general guidance based on the information you provided. A healthcare professional can provide personalized advice.',
      nextSteps: [
        { type: 'find-provider', label: 'Find a Doctor', description: 'Schedule an appointment with a primary care provider' },
        { type: 'learn-more', label: 'Self-Care Tips', description: 'What you can do at home' },
      ],
    },
  }

  const rec = recommendations[careLevel]

  return {
    careLevel,
    ...rec,
  }
}
