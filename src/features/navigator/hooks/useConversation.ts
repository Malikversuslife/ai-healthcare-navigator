import { useReducer, useCallback, useRef } from 'react'
import {
  ConversationState,
  ConversationStep,
  Message,
  UserHealthContext,
  ProviderMatch,
  ProviderSearchContext,
  ConversationProgress,
  NavigationIntent,
  NavigationState,
  SafetyResult,
} from '../../../shared/types'
import { generateId } from '../../../shared/utils'
import { getAIService } from '../../../services/ai'
import { evaluateNavigation, evaluateEmergencySafety, buildEmergencyRecommendation, evaluateCarePathway, buildPathwayRecommendation } from '../engine'
import { normalizeSpecialty } from '../engine/specialty-normalization'
import { searchProviders } from './useProviderSearch'

type ConversationAction =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_STEP'; step: ConversationStep }
  | { type: 'UPDATE_CONTEXT'; context: Partial<UserHealthContext> }
  | { type: 'SET_RECOMMENDATION'; recommendation: NonNullable<ConversationState['recommendation']> }
  | { type: 'SET_PROVIDER_MATCHES'; matches: ProviderMatch[] }
  | { type: 'SET_LOCATION'; location: string }
  | { type: 'SET_INSURANCE'; insuranceId: string | null }
  | { type: 'UPDATE_PROGRESS'; progress: Partial<ConversationProgress> }
  | { type: 'SET_NAVIGATION_STATE'; state: NavigationState }
  | { type: 'SET_NAVIGATION_INTENT'; intent: NavigationIntent }
  | { type: 'SET_SAFETY_RESULT'; result: SafetyResult }
  | { type: 'RESET' }
  | { type: 'RESET_STARTED' }

const initialProgress: ConversationProgress = {
  concernCollected: false,
  symptomsCollected: false,
  durationCollected: false,
  severityCollected: false,
}

export function createInitialConversationState(): ConversationState {
  return {
    messages: [],
    currentStep: 'greeting',
    userContext: {
      concern: '',
      symptoms: [],
      duration: '',
    },
    recommendation: null,
    providerMatches: [],
    selectedInsurance: null,
    isLoading: false,
    progress: { ...initialProgress },
    navigationState: 'understanding',
    navigationIntent: 'general_healthcare',
    safetyResult: null,
  }
}

const initialState: ConversationState = createInitialConversationState()

export function createGreetingMessage(): Message {
  return {
    id: generateId(),
    role: 'assistant',
    content: 'Hello! I\'m your healthcare navigator. I\'ll help you understand what kind of care may be appropriate and find providers near you.\n\nWhat\'s bothering you today?',
    timestamp: Date.now(),
  }
}

export function createStartedConversationState(): ConversationState {
  return {
    ...createInitialConversationState(),
    messages: [createGreetingMessage()],
    currentStep: 'intake',
  }
}

function calculateProgress(context: UserHealthContext): ConversationProgress {
  return {
    concernCollected: !!context.concern,
    symptomsCollected: context.symptoms.length > 0,
    durationCollected: !!context.duration,
    severityCollected: context.severity !== undefined,
  }
}

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_STEP':
      return { ...state, currentStep: action.step }
    case 'UPDATE_CONTEXT': {
      const newContext = { ...state.userContext, ...action.context }
      return {
        ...state,
        userContext: newContext,
        progress: calculateProgress(newContext),
      }
    }
    case 'SET_RECOMMENDATION':
      return { ...state, recommendation: action.recommendation }
    case 'SET_PROVIDER_MATCHES':
      return { ...state, providerMatches: action.matches }
    case 'SET_LOCATION':
      return { ...state, userContext: { ...state.userContext, location: action.location } }
    case 'SET_INSURANCE':
      return { ...state, selectedInsurance: action.insuranceId }
    case 'UPDATE_PROGRESS':
      return { ...state, progress: { ...state.progress, ...action.progress } }
    case 'SET_NAVIGATION_STATE':
      return { ...state, navigationState: action.state }
    case 'SET_NAVIGATION_INTENT':
      return { ...state, navigationIntent: action.intent }
    case 'SET_SAFETY_RESULT':
      return { ...state, safetyResult: action.result }
    case 'RESET':
      return createInitialConversationState()
    case 'RESET_STARTED':
      return createStartedConversationState()
    default:
      return state
  }
}

function detectIntent(content: string): NavigationIntent {
  const lower = content.toLowerCase()

  if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
    return 'appointment'
  }
  if (
    (lower.includes('find') || lower.includes('need') || lower.includes('want') || lower.includes('looking')) &&
    (lower.includes('doctor') || lower.includes('provider') || lower.includes('specialist') || lower.includes('clinic'))
  ) {
    return 'find_provider'
  }
  if (lower.includes('find') && lower.includes('hospital')) {
    return 'find_hospital'
  }
  if (lower.includes('insurance') || lower.includes('coverage') || lower.includes('hmo') || lower.includes('nhis')) {
    return 'insurance'
  }
  if (lower.includes('follow') || lower.includes('treatment') || lower.includes('medication') || lower.includes('prescription')) {
    return 'treatment_followup'
  }

  return 'symptom_navigation'
}

function generateFollowUpPrompt(missingFields: string[]): string {
  const prompts: Record<string, string> = {
    concern: 'What brings you here today? Can you describe what you\'re experiencing?',
    symptoms: 'Are there any other symptoms you\'re experiencing alongside this?',
    duration: 'How long have you been experiencing this?',
    specialty: 'What type of healthcare provider are you looking for?',
    location: 'What city or area are you located in?',
    insurance: 'Do you have an insurance plan? If so, which one?',
  }

  for (const field of missingFields) {
    if (prompts[field]) {
      return prompts[field]
    }
  }

  return 'Can you tell me more about what you\'re experiencing?'
}

export function useConversation() {
  const [state, dispatch] = useReducer(conversationReducer, initialState)
  const sendingRef = useRef(false)

  const addMessage = useCallback((role: 'user' | 'assistant', content: string, metadata?: Message['metadata']) => {
    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
      metadata,
    }
    dispatch({ type: 'ADD_MESSAGE', message })
  }, [])

  const runProviderSearch = useCallback((overrides: Partial<ProviderSearchContext> = {}) => {
    const hasInsuranceOverride = Object.prototype.hasOwnProperty.call(overrides, 'insurance')
    const ctx: ProviderSearchContext = {
      city: overrides.city ?? state.userContext.location,
      specialty: overrides.specialty ?? (state.userContext.specialty ? normalizeSpecialty(state.userContext.specialty) : undefined),
      insurance: hasInsuranceOverride ? overrides.insurance : state.selectedInsurance ?? undefined,
    }

    const matches = searchProviders(ctx)
    dispatch({ type: 'SET_PROVIDER_MATCHES', matches })
  }, [state.userContext.location, state.userContext.specialty, state.selectedInsurance])

  const sendMessage = useCallback(async (content: string) => {
    if (sendingRef.current) return
    sendingRef.current = true

    addMessage('user', content)
    dispatch({ type: 'SET_LOADING', isLoading: true })

    // Detect intent from user message (application-owned)
    const intent = detectIntent(content)
    dispatch({ type: 'SET_NAVIGATION_INTENT', intent })

    // Set initial navigation state
    if (state.navigationState === 'understanding') {
      dispatch({ type: 'SET_NAVIGATION_STATE', state: 'collecting_context' })
    }

    try {
      const aiService = getAIService()

      // AI extracts structured context (AI only extracts, does not decide)
      const result = await aiService.processMessage(content, state.userContext)

      // Application merges extracted context
      // Filter null values — AI may return null for unextracted fields,
      // which would corrupt context (null !== undefined passes field-detection checks)
      const clean: Partial<UserHealthContext> = {}
      if (result.extractedContext) {
        for (const [key, value] of Object.entries(result.extractedContext)) {
          if (value !== null && value !== undefined) {
            ;(clean as Record<string, unknown>)[key] = value
          }
        }
        if (Object.keys(clean).length > 0) {
          dispatch({ type: 'UPDATE_CONTEXT', context: clean })
        }
      }

      // Build updated context from current state + cleaned extraction
      // (not from stale closure state — dispatch above updates state.userContext asynchronously)
      const updatedContext = { ...state.userContext, ...clean }

      // Stage 4B: Safety evaluation runs FIRST — before any navigation logic
      const safetyResult = evaluateEmergencySafety(updatedContext)
      dispatch({ type: 'SET_SAFETY_RESULT', result: safetyResult })

      if (safetyResult.triggered) {
        // Emergency interrupts normal flow — no further navigation evaluation
        dispatch({ type: 'SET_NAVIGATION_STATE', state: 'emergency' })
        dispatch({ type: 'SET_STEP', step: 'emergency' })

        const recommendation = buildEmergencyRecommendation()
        dispatch({ type: 'SET_RECOMMENDATION', recommendation })

        addMessage('assistant', 'This could be a medical emergency. Please call emergency services (112) immediately or go to the nearest emergency room.', {
          extractedContext: clean,
          recommendation,
        })
        dispatch({ type: 'SET_LOADING', isLoading: false })
        return
      }

      // Normal navigation evaluation (only runs if no emergency)
      const navAction = evaluateNavigation({
        intent,
        state: state.navigationState,
        userContext: updatedContext,
      })

      // Handle each action type
      switch (navAction.type) {
        case 'emergency': {
          // Defensive — should not happen if safety evaluation above is correct
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'emergency' })
          dispatch({ type: 'SET_STEP', step: 'emergency' })

          const recommendation = buildEmergencyRecommendation()
          dispatch({ type: 'SET_RECOMMENDATION', recommendation })

          addMessage('assistant', 'This could be a medical emergency. Please call emergency services (112) immediately or go to the nearest emergency room.', {
            extractedContext: clean,
            recommendation,
          })
          break
        }

        case 'collect_context': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'collecting_context' })
          dispatch({ type: 'SET_STEP', step: 'follow-up' })

          const appFollowUp = generateFollowUpPrompt(navAction.missingFields)

          addMessage('assistant', appFollowUp, {
            extractedContext: clean,
          })
          break
        }

        case 'safety_check': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'safety_check' })

          // Stage 4C: Evaluate care pathway (only runs after Stage 4B returns no emergency)
          const pathwayResult = evaluateCarePathway({
            intent,
            healthContext: updatedContext,
          })
          const recommendation = buildPathwayRecommendation(pathwayResult)

          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'recommendation' })
          dispatch({ type: 'SET_RECOMMENDATION', recommendation })
          dispatch({ type: 'SET_STEP', step: 'recommendation' })

          addMessage('assistant', result.response, {
            extractedContext: clean,
            recommendation,
          })
          break
        }

        case 'show_recommendation': {
          dispatch({ type: 'SET_STEP', step: 'recommendation' })
          addMessage('assistant', result.response, {
            extractedContext: clean,
            recommendation: state.recommendation ?? undefined,
          })
          break
        }

        case 'search_providers': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'provider_search' })
          dispatch({ type: 'SET_STEP', step: 'provider-search' })

          // Run provider search with normalized specialty
          const specialty = updatedContext.specialty ? normalizeSpecialty(updatedContext.specialty) : undefined
          runProviderSearch({ specialty })

          addMessage('assistant', result.response, {
            extractedContext: clean,
          })
          break
        }

        case 'check_insurance': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'insurance_check' })
          dispatch({ type: 'SET_STEP', step: 'coverage' })

          addMessage('assistant', result.response, {
            extractedContext: clean,
          })
          break
        }

        case 'start_appointment': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'appointment' })
          dispatch({ type: 'SET_STEP', step: 'intake' })

          addMessage('assistant', result.response, {
            extractedContext: clean,
          })
          break
        }

        case 'answer_general_question': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'complete' })
          dispatch({ type: 'SET_STEP', step: 'complete' })

          addMessage('assistant', result.response, {
            extractedContext: clean,
          })
          break
        }

        case 'complete': {
          addMessage('assistant', result.response, {
            extractedContext: clean,
          })
          break
        }
      }
    } catch {
      addMessage('assistant', 'I apologize, but I encountered an error. Please try again.')
    } finally {
      sendingRef.current = false
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }, [state.userContext, state.navigationState, state.recommendation, state.selectedInsurance, addMessage, runProviderSearch])

  const findProviders = useCallback((location?: string) => {
    const city = location || state.userContext.location
    dispatch({ type: 'SET_NAVIGATION_STATE', state: 'provider_search' })
    dispatch({ type: 'SET_STEP', step: 'provider-search' })
    runProviderSearch({ city })
  }, [state.userContext.location, runProviderSearch])

  const selectInsurance = useCallback((insuranceId: string | null) => {
    dispatch({ type: 'SET_INSURANCE', insuranceId: insuranceId })

    // Re-run search with updated insurance
    runProviderSearch({ insurance: insuranceId ?? undefined })
  }, [runProviderSearch])

  const setLocation = useCallback((location: string) => {
    dispatch({ type: 'SET_LOCATION', location })
    runProviderSearch({ city: location })
  }, [runProviderSearch])

  const goBackToGuidance = useCallback(() => {
    dispatch({ type: 'SET_NAVIGATION_STATE', state: 'recommendation' })
    dispatch({ type: 'SET_STEP', step: 'recommendation' })
  }, [])

  const startConversation = useCallback(() => {
    dispatch({ type: 'ADD_MESSAGE', message: createGreetingMessage() })
    dispatch({ type: 'SET_STEP', step: 'intake' })
  }, [])

  const reset = useCallback(() => {
    sendingRef.current = false
    dispatch({ type: 'RESET_STARTED' })
  }, [])

  return {
    state,
    sendMessage,
    findProviders,
    selectInsurance,
    setLocation,
    startConversation,
    goBackToGuidance,
    reset,
  }
}
