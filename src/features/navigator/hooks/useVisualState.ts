import { useMemo } from 'react'
import {
  ConversationState,
  NavigationState,
  CareRecommendation,
  ProviderMatch,
  ConversationProgress,
  UserHealthContext,
  SafetyResult,
} from '../../../shared/types'

export type VisualState =
  | 'welcome'
  | 'understanding'
  | 'guidance'
  | 'find_care'
  | 'emergency'
  | 'complete'
  | 'loading'
  | 'error'

interface VisualStateResult {
  visualState: VisualState
  messages: ConversationState['messages']
  userContext: UserHealthContext
  recommendation: CareRecommendation | null
  providerMatches: ProviderMatch[]
  isLoading: boolean
  progress: ConversationProgress
  navigationState: NavigationState
  safetyResult: SafetyResult | null
  selectedInsurance: string | null
}

export function useVisualState(state: ConversationState): VisualStateResult {
  const visualState = useMemo<VisualState>(() => {
    if (state.navigationState === 'emergency') return 'emergency'
    if (state.navigationState === 'complete') return 'complete'
    if (state.navigationState === 'recommendation' && state.recommendation) return 'guidance'
    if (state.navigationState === 'provider_search' && state.providerMatches.length > 0) return 'find_care'
    if (state.navigationState === 'provider_search' && state.providerMatches.length === 0) return 'loading'

    const msgCount = state.messages.length
    if (msgCount === 0) return 'welcome'
    if (msgCount === 1) return 'welcome'

    return 'understanding'
  }, [state.navigationState, state.recommendation, state.providerMatches.length, state.messages.length])

  return {
    visualState,
    messages: state.messages,
    userContext: state.userContext,
    recommendation: state.recommendation,
    providerMatches: state.providerMatches,
    isLoading: state.isLoading,
    progress: state.progress,
    navigationState: state.navigationState,
    safetyResult: state.safetyResult,
    selectedInsurance: state.selectedInsurance,
  }
}
