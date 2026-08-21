export type CareLevel =
  | 'self_care'
  | 'primary_care'
  | 'urgent_care'
  | 'emergency'

export type CoverageStatus =
  | 'covered'
  | 'not-covered'
  | 'requires-authorization'
  | 'unknown'

export interface Severity {
  value?: number
  description?: string
}

export type NavigationIntent =
  | 'symptom_navigation'
  | 'find_provider'
  | 'find_hospital'
  | 'appointment'
  | 'insurance'
  | 'treatment_followup'
  | 'general_healthcare'

export interface NavigationIntentResult {
  intent: NavigationIntent
}

export type NavigationState =
  | 'understanding'
  | 'collecting_context'
  | 'safety_check'
  | 'recommendation'
  | 'provider_search'
  | 'insurance_check'
  | 'appointment'
  | 'complete'
  | 'emergency'

export type NavigationAction =
  | { type: 'collect_context'; missingFields: string[] }
  | { type: 'safety_check' }
  | { type: 'show_recommendation' }
  | { type: 'search_providers' }
  | { type: 'check_insurance' }
  | { type: 'start_appointment' }
  | { type: 'answer_general_question' }
  | { type: 'emergency' }
  | { type: 'complete' }

export interface NavigationContext {
  intent: NavigationIntent
  state: NavigationState
  userContext: UserHealthContext
}

export type SafetySignal =
  | 'airway_compromise'
  | 'severe_breathing_difficulty'
  | 'loss_of_consciousness'
  | 'major_bleeding'
  | 'severe_allergic_reaction'
  | 'stroke_signs'
  | 'high_risk_chest_symptoms'
  | 'active_seizure'
  | 'other_supported_emergency'

export interface SafetySignalMatch {
  signal: SafetySignal
  matchedIndicators: string[]
  source: 'concern' | 'symptom' | 'context'
}

export interface SafetyResult {
  triggered: boolean
  signals: SafetySignalMatch[]
}

export interface Provider {
  id: string
  name: string
  type: 'clinic' | 'hospital' | 'urgent-care' | 'telehealth'
  specialty: string
  location: {
    city: string
    area: string
    address: string
    coordinates?: { lat: number; lng: number }
  }
  distance?: number
  availability: 'available' | 'limited' | 'unavailable'
  nextAvailable?: string
  acceptedInsurance: string[]
  consultationFee: number
  rating: number
}

export interface InsurancePlan {
  id: string
  name: string
  provider: string
}

export interface CoverageResult {
  providerId: string
  insuranceId: string
  status: CoverageStatus
  details?: string
  estimatedCost?: number
}

export interface CareRecommendation {
  careLevel: CareLevel
  reasoning: string
  disclaimer: string
  nextSteps: NextStep[]
}

export interface NextStep {
  type: 'find-provider' | 'self-care' | 'emergency' | 'learn-more'
  label: string
  description: string
}

export interface UserHealthContext {
  concern: string
  symptoms: string[]
  duration: string
  severity?: Severity
  specialty?: string
  location?: string
  insurance?: string
}

export interface ConversationProgress {
  concernCollected: boolean
  symptomsCollected: boolean
  durationCollected: boolean
  severityCollected: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  metadata?: {
    extractedContext?: Partial<UserHealthContext>
    recommendation?: CareRecommendation
    providers?: Provider[]
  }
}

export type ConversationStep =
  | 'greeting'
  | 'intake'
  | 'follow-up'
  | 'recommendation'
  | 'provider-search'
  | 'location-prompt'
  | 'coverage'
  | 'complete'
  | 'emergency'

export interface ConversationState {
  messages: Message[]
  currentStep: ConversationStep
  userContext: UserHealthContext
  recommendation: CareRecommendation | null
  providers: Provider[]
  selectedInsurance: string | null
  isLoading: boolean
  progress: ConversationProgress
  navigationState: NavigationState
  navigationIntent: NavigationIntent
  safetyResult: SafetyResult | null
}
