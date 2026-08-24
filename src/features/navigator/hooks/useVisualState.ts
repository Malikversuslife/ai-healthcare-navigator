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

export function deriveVisualState(state: ConversationState): VisualState {
    if (state.isLoading) return 'loading'
    if (state.navigationState === 'emergency') return 'emergency'
    if (state.navigationState === 'complete') return 'complete'
    if (state.navigationState === 'recommendation' && state.recommendation) return 'guidance'
    if (state.navigationState === 'provider_search') return 'find_care'

    const msgCount = state.messages.length
    if (msgCount === 0) return 'welcome'
    if (msgCount === 1) return 'welcome'

    return 'understanding'
}

export function useVisualState(state: ConversationState): VisualStateResult {
  const visualState = useMemo<VisualState>(() => deriveVisualState(state), [
    state.isLoading,
    state.navigationState,
    state.recommendation,
    state.messages.length,
  ])

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
