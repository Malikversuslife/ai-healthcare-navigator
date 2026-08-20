import { useReducer, useCallback } from 'react'
import {
  ConversationState,
  ConversationStep,
  Message,
  UserHealthContext,
  Provider,
  ConversationProgress,
} from '../../../shared/types'
import { generateId } from '../../../shared/utils'
import { getAIService } from '../../../services/ai'
import { containsEmergencyIndicators, isContextSufficient, determineCareLevel, buildRecommendation } from './useNavigation'
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
    severity: null,
  },
  recommendation: null,
  providers: [],
  selectedInsurance: null,
  isLoading: false,
  progress: initialProgress,
}

function calculateProgress(context: UserHealthContext): ConversationProgress {
  return {
    concernCollected: !!context.concern,
    symptomsCollected: context.symptoms.length > 0,
    durationCollected: !!context.duration,
    severityCollected: context.severity !== null && context.severity !== undefined,
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
    case 'RESET':
      return initialState
    default:
      return state
  }
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
    // Add user message
    addMessage('user', content)
    dispatch({ type: 'SET_LOADING', isLoading: true })

    try {
      const aiService = getAIService()

      // Process with AI service
      const result = await aiService.processMessage(content, state.userContext)

      // Update context with extracted information
      if (result.extractedContext) {
        dispatch({ type: 'UPDATE_CONTEXT', context: result.extractedContext })
      }

      const updatedContext = { ...state.userContext, ...result.extractedContext }

      // Check for emergency
      if (containsEmergencyIndicators(updatedContext)) {
        addMessage('assistant', result.response, { extractedContext: result.extractedContext })
        dispatch({ type: 'SET_STEP', step: 'recommendation' })
        dispatch({ type: 'SET_LOADING', isLoading: false })
        return
      }

      // If context is sufficient, determine care level
      if (isContextSufficient(updatedContext)) {
        const careLevel = determineCareLevel(updatedContext)
        const recommendation = buildRecommendation(updatedContext, careLevel)

        addMessage('assistant', result.response, {
          extractedContext: result.extractedContext,
          recommendation,
        })

        dispatch({ type: 'SET_RECOMMENDATION', recommendation })
        dispatch({ type: 'SET_STEP', step: 'recommendation' })
      } else {
        // Continue conversation
        addMessage('assistant', result.response, {
          extractedContext: result.extractedContext,
        })
        dispatch({ type: 'SET_STEP', step: 'follow-up' })
      }
    } catch {
      addMessage('assistant', 'I apologize, but I encountered an error. Please try again.')
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }, [state.userContext, addMessage])

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

    // Re-filter providers with new insurance
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
    // Re-search with new location
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
