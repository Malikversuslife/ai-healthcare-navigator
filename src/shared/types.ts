export type CareLevel =
  | 'routine-care'
  | 'same-day-care'
  | 'urgent-care'
  | 'emergency-care'

export type CoverageStatus =
  | 'covered'
  | 'not-covered'
  | 'requires-authorization'
  | 'unknown'

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
  severity: number
  location?: string
  insurance?: string
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

export interface ConversationState {
  messages: Message[]
  currentStep: ConversationStep
  userContext: UserHealthContext
  recommendation: CareRecommendation | null
  providers: Provider[]
  selectedInsurance: string | null
  isLoading: boolean
}
