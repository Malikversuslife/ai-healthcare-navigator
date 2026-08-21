export type CareLevel =
  | 'self_care'
  | 'primary_care'
  | 'urgent_care'
  | 'emergency'

export type CarePathway =
  | 'prompt_medical_review'
  | 'primary_care'
  | 'provider_or_specialist'
  | 'informational_navigation'

export type NavigationEscalationFactor =
  | 'rapidly_worsening'
  | 'significant_functional_impact'
  | 'recurrent_worsening'
  | 'persistent_concerning_change'

export type SymptomTrend =
  | 'improving'
  | 'stable'
  | 'worsening'
  | 'rapidly_worsening'
  | 'unknown'

export interface FunctionalImpact {
  level?: 'none' | 'mild' | 'significant'
  description?: string
}

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

export interface CareNavigationContext {
  intent: NavigationIntent
  healthContext: UserHealthContext
}

export interface CarePathwayResult {
  pathway: CarePathway
  escalationFactors: NavigationEscalationFactor[]
  rationale: string[]
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
  availability: 'available' | 'limited' | 'unavailable'
  nextAvailable?: string
  acceptedInsurance: string[]
  consultationFee: number
  rating: number
}

export type ProviderMatchReason =
  | 'specialty_match'
  | 'provider_type_match'
  | 'location_match'
  | 'insurance_match'
  | 'available'
  | 'lower_cost'
  | 'high_rating'
  | 'nearby'

export interface ProviderMatch {
  provider: Provider
  score: number
  matchReasons: ProviderMatchReason[]
  insuranceStatus: 'accepted' | 'not_accepted' | 'unknown'
  distanceKm: number | null
}

export interface ProviderSearchContext {
  pathway?: CarePathway
  specialty?: string
  providerType?: Provider['type']
  city?: string
  area?: string
  insurance?: string
  userCoordinates?: { lat: number; lng: number }
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
  pathway: CarePathway | 'emergency'
  reasoning: string
  disclaimer: string
  nextSteps: NextStep[]
}

export interface NextStep {
  type: 'find-provider' | 'self-care' | 'emergency' | 'learn-more' | 'info'
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
  functionalImpact?: FunctionalImpact
  symptomTrend?: SymptomTrend
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
    providerMatches?: ProviderMatch[]
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
  providerMatches: ProviderMatch[]
  selectedInsurance: string | null
  isLoading: boolean
  progress: ConversationProgress
  navigationState: NavigationState
  navigationIntent: NavigationIntent
  safetyResult: SafetyResult | null
}
