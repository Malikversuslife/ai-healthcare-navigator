import { useReducer, useCallback } from 'react'
import {
  ConversationState,
  ConversationStep,
  Message,
  UserHealthContext,
  Provider,
  ConversationProgress,
  NavigationIntent,
  NavigationState,
} from '../../../shared/types'
import { generateId } from '../../../shared/utils'
import { getAIService } from '../../../services/ai'
import { evaluateNavigation, determineCareLevel, buildRecommendation } from '../engine'
import { searchProviders } from './useProviderSearch'

type ConversationAction =
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_STEP'; step: ConversationStep }
  | { type: 'UPDATE_CONTEXT'; context: Partial<UserHealthContext> }
  | { type: 'SET_RECOMMENDATION'; recommendation: NonNullable<ConversationState['recommendation']> }
  | { type: 'SET_PROVIDERS'; providers: Provider[] }
  | { type: 'SET_LOCATION'; location: string }
  | { type: 'SET_INSURANCE'; insuranceId: string }
  | { type: 'UPDATE_PROGRESS'; progress: Partial<ConversationProgress> }
  | { type: 'SET_NAVIGATION_STATE'; state: NavigationState }
  | { type: 'SET_NAVIGATION_INTENT'; intent: NavigationIntent }
  | { type: 'RESET' }

const initialProgress: ConversationProgress = {
  concernCollected: false,
  symptomsCollected: false,
  durationCollected: false,
  severityCollected: false,
}

const initialState: ConversationState = {
  messages: [],
  currentStep: 'greeting',
  userContext: {
    concern: '',
    symptoms: [],
    duration: '',
  },
  recommendation: null,
  providers: [],
  selectedInsurance: null,
  isLoading: false,
  progress: initialProgress,
  navigationState: 'understanding',
  navigationIntent: 'general_healthcare',
}

function calculateProgress(context: UserHealthContext): ConversationProgress {
  return {
    concernCollected: !!context.concern,
    symptomsCollected: context.symptoms.length > 0,
    durationCollected: !!context.duration,
    severityCollected: context.severity !== undefined,
  }
}

function conversationReducer(
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
    case 'SET_PROVIDERS':
      return { ...state, providers: action.providers }
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
    case 'RESET':
      return initialState
    default:
      return state
  }
}

function detectIntent(content: string): NavigationIntent {
  const lower = content.toLowerCase()

  if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
    return 'appointment'
  }
  if (lower.includes('find') && (lower.includes('doctor') || lower.includes('provider') || lower.includes('specialist') || lower.includes('clinic'))) {
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

  const sendMessage = useCallback(async (content: string) => {
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
      if (result.extractedContext) {
        dispatch({ type: 'UPDATE_CONTEXT', context: result.extractedContext })
      }

      const updatedContext = { ...state.userContext, ...result.extractedContext }

      // Application evaluates navigation (safety → context → action)
      const navAction = evaluateNavigation({
        intent,
        state: state.navigationState,
        userContext: updatedContext,
      })

      // Handle each action type
      switch (navAction.type) {
        case 'emergency': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'emergency' })
          dispatch({ type: 'SET_STEP', step: 'recommendation' })

          const recommendation = buildRecommendation(updatedContext, 'emergency')
          dispatch({ type: 'SET_RECOMMENDATION', recommendation })

          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
            recommendation,
          })
          break
        }

        case 'collect_context': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'collecting_context' })
          dispatch({ type: 'SET_STEP', step: 'follow-up' })

          // Application determines the follow-up question based on missing fields
          const appFollowUp = generateFollowUpPrompt(navAction.missingFields)

          // Use AI response if it has content, otherwise use application-determined prompt
          const responseText = result.response || appFollowUp

          addMessage('assistant', responseText, {
            extractedContext: result.extractedContext,
          })
          break
        }

        case 'safety_check': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'safety_check' })

          // Context sufficient for symptom navigation — determine care level
          const careLevel = determineCareLevel(updatedContext)
          const recommendation = buildRecommendation(updatedContext, careLevel)

          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'recommendation' })
          dispatch({ type: 'SET_RECOMMENDATION', recommendation })
          dispatch({ type: 'SET_STEP', step: 'recommendation' })

          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
            recommendation,
          })
          break
        }

        case 'show_recommendation': {
          dispatch({ type: 'SET_STEP', step: 'recommendation' })
          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
            recommendation: state.recommendation ?? undefined,
          })
          break
        }

        case 'search_providers': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'provider_search' })
          dispatch({ type: 'SET_STEP', step: 'provider-search' })

          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
          })
          break
        }

        case 'check_insurance': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'insurance_check' })
          dispatch({ type: 'SET_STEP', step: 'coverage' })

          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
          })
          break
        }

        case 'start_appointment': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'appointment' })
          dispatch({ type: 'SET_STEP', step: 'intake' })

          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
          })
          break
        }

        case 'answer_general_question': {
          dispatch({ type: 'SET_NAVIGATION_STATE', state: 'complete' })
          dispatch({ type: 'SET_STEP', step: 'complete' })

          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
          })
          break
        }

        case 'complete': {
          addMessage('assistant', result.response, {
            extractedContext: result.extractedContext,
          })
          break
        }
      }
    } catch {
      addMessage('assistant', 'I apologize, but I encountered an error. Please try again.')
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }, [state.userContext, state.navigationState, state.recommendation, addMessage])

  const findProviders = useCallback((location?: string) => {
    const filter = {
      careLevel: state.recommendation?.careLevel,
      location: location || state.userContext.location,
      insurance: state.selectedInsurance || undefined,
    }

    const providers = searchProviders(filter)
    dispatch({ type: 'SET_PROVIDERS', providers })
    dispatch({ type: 'SET_STEP', step: 'provider-search' })
  }, [state.recommendation, state.userContext.location, state.selectedInsurance])

  const selectInsurance = useCallback((insuranceId: string) => {
    dispatch({ type: 'SET_INSURANCE', insuranceId: insuranceId })

    if (state.providers.length > 0) {
      const filtered = state.providers.filter((p: Provider) =>
        p.acceptedInsurance.includes(insuranceId)
      )
      if (filtered.length > 0) {
        dispatch({ type: 'SET_PROVIDERS', providers: filtered })
      }
    }
  }, [state.providers])

  const setLocation = useCallback((location: string) => {
    dispatch({ type: 'SET_LOCATION', location })
    findProviders(location)
  }, [findProviders])

  const startConversation = useCallback(() => {
    const greeting: Message = {
      id: generateId(),
      role: 'assistant',
      content: 'Hello! I\'m your healthcare navigator. I\'ll help you understand what kind of care may be appropriate and find providers near you.\n\nWhat\'s bothering you today?',
      timestamp: Date.now(),
    }
    dispatch({ type: 'ADD_MESSAGE', message: greeting })
    dispatch({ type: 'SET_STEP', step: 'intake' })
  }, [])

  return {
    state,
    sendMessage,
    findProviders,
    selectInsurance,
    setLocation,
    startConversation,
    reset: () => dispatch({ type: 'RESET' }),
  }
}
