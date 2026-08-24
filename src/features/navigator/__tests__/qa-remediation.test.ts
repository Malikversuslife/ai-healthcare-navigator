import { describe, expect, it } from 'vitest'
import {
  getGeolocationRecoveryMessage,
  mapCoordinatesToSupportedCity,
  unsupportedCoordinatesMessage,
} from '../utils/location'
import {
  conversationReducer,
  createInitialConversationState,
  createStartedConversationState,
} from '../hooks/useConversation'
import { deriveVisualState } from '../hooks/useVisualState'
import { shouldShowLocationPrompt } from '../components/FindCareView'
import { findSelectedProviderMatch, shouldSendInitialMessage } from '../components/Navigator'
import { searchProviders } from '../hooks/useProviderSearch'
import { ConversationState, ProviderMatch } from '../../../shared/types'

function dirtyConversationState(): ConversationState {
  return {
    ...createInitialConversationState(),
    messages: [
      { id: 'm1', role: 'assistant', content: 'hello', timestamp: 1 },
      { id: 'm2', role: 'user', content: 'I have a headache', timestamp: 2 },
    ],
    currentStep: 'provider-search',
    userContext: {
      concern: 'headache',
      symptoms: ['headache'],
      duration: '2 days',
      severity: { value: 7 },
      specialty: 'General Practice',
      location: 'Lagos',
    },
    recommendation: {
      pathway: 'primary_care',
      reasoning: 'Seek first-contact care.',
      disclaimer: 'Not medical advice.',
      nextSteps: [{ type: 'find-provider', label: 'Find care', description: 'Find providers' }],
    },
    providerMatches: searchProviders({ city: 'Lagos' }),
    selectedInsurance: 'nhis',
    isLoading: true,
    navigationState: 'provider_search',
    navigationIntent: 'find_provider',
    safetyResult: { triggered: true, signals: [] },
  }
}

describe('QA remediation - location recovery', () => {
  it('maps recognized supported coordinates to the correct supported city', () => {
    expect(mapCoordinatesToSupportedCity(6.45, 3.4)).toBe('Lagos')
    expect(mapCoordinatesToSupportedCity(9.05, 7.5)).toBe('Abuja')
    expect(mapCoordinatesToSupportedCity(7.42, 3.9)).toBe('Ibadan')
    expect(mapCoordinatesToSupportedCity(4.82, 7.0)).toBe('Port Harcourt')
  })

  it('does not map unsupported coordinates to Lagos', () => {
    expect(mapCoordinatesToSupportedCity(51.5072, -0.1276)).toBeNull()
  })

  it('uses manual-location recovery copy for unsupported coordinates', () => {
    expect(unsupportedCoordinatesMessage).toBe(
      "We couldn't determine your city from your device location. Enter your city or area to continue."
    )
  })

  it('exposes manual recovery for permission denied', () => {
    expect(getGeolocationRecoveryMessage({ code: 1 })).toBe(
      "Location access wasn't granted. Enter your city or area instead."
    )
  })

  it('exposes manual recovery for unavailable location', () => {
    expect(getGeolocationRecoveryMessage({ code: 2 })).toBe(
      "We couldn't determine your location. Enter your city or area instead."
    )
  })

  it('exposes manual recovery for location timeout', () => {
    expect(getGeolocationRecoveryMessage({ code: 3 })).toBe(
      "We couldn't determine your location in time. Enter your city or area instead."
    )
  })
})

describe('QA remediation - reset', () => {
  it('reset clears conversation context', () => {
    const resetState = conversationReducer(dirtyConversationState(), { type: 'RESET' })
    expect(resetState.userContext).toEqual({ concern: '', symptoms: [], duration: '' })
    expect(resetState.progress).toEqual({
      concernCollected: false,
      symptomsCollected: false,
      durationCollected: false,
      severityCollected: false,
    })
  })

  it('reset clears provider results', () => {
    const resetState = conversationReducer(dirtyConversationState(), { type: 'RESET' })
    expect(resetState.providerMatches).toEqual([])
  })

  it('reset clears recommendation', () => {
    const resetState = conversationReducer(dirtyConversationState(), { type: 'RESET' })
    expect(resetState.recommendation).toBeNull()
  })

  it('reset clears insurance selection', () => {
    const resetState = conversationReducer(dirtyConversationState(), { type: 'RESET' })
    expect(resetState.selectedInsurance).toBeNull()
  })

  it('reset-started returns a valid fresh-start experience', () => {
    const freshState = conversationReducer(dirtyConversationState(), { type: 'RESET_STARTED' })
    expect(freshState.messages).toHaveLength(1)
    expect(freshState.messages[0].role).toBe('assistant')
    expect(freshState.currentStep).toBe('intake')
    expect(freshState.navigationState).toBe('understanding')
    expect(deriveVisualState(freshState)).toBe('welcome')
  })

  it('reset does not leave stale provider-detail state visible', () => {
    const match = dirtyConversationState().providerMatches[0] as ProviderMatch
    expect(findSelectedProviderMatch([match], match.provider.id)).toBe(match)
    expect(findSelectedProviderMatch([], match.provider.id)).toBeNull()
  })
})

describe('QA remediation - initial message', () => {
  it('initialMessage is sent exactly once when available', () => {
    expect(shouldSendInitialMessage('I have a cough', true, false)).toBe(true)
  })

  it('rerender or state transition does not resend initialMessage after consumption', () => {
    expect(shouldSendInitialMessage('I have a cough', true, true)).toBe(false)
    expect(shouldSendInitialMessage('I have a cough', false, false)).toBe(false)
    expect(shouldSendInitialMessage(undefined, true, false)).toBe(false)
  })
})

describe('QA remediation - provider recovery', () => {
  it('zero provider results expose a usable location-change path', () => {
    const state = {
      ...createStartedConversationState(),
      navigationState: 'provider_search' as const,
      userContext: { concern: 'rash', symptoms: ['rash'], duration: '2 days', location: 'Unsupported City' },
      providerMatches: [],
    }

    expect(deriveVisualState(state)).toBe('find_care')
    expect(shouldShowLocationPrompt(0, state.userContext.location, true)).toBe(true)
  })

  it('changing location reruns provider search with the updated city', () => {
    const abujaResults = searchProviders({ city: 'Abuja', specialty: 'General Practice' })
    const lagosResults = searchProviders({ city: 'Lagos', specialty: 'General Practice' })

    expect(abujaResults.length).toBeGreaterThan(0)
    expect(abujaResults.some((match) => match.provider.location.city === 'Abuja')).toBe(true)
    expect(lagosResults.length).toBeGreaterThan(0)
    expect(lagosResults.some((match) => match.provider.location.city === 'Lagos')).toBe(true)
  })

  it('changing location preserves existing healthcare context inputs', () => {
    const state = dirtyConversationState()
    const updated = conversationReducer(state, { type: 'SET_LOCATION', location: 'Abuja' })

    expect(updated.userContext.concern).toBe(state.userContext.concern)
    expect(updated.userContext.symptoms).toEqual(state.userContext.symptoms)
    expect(updated.userContext.duration).toBe(state.userContext.duration)
    expect(updated.userContext.severity).toEqual(state.userContext.severity)
    expect(updated.userContext.specialty).toBe(state.userContext.specialty)
    expect(updated.userContext.location).toBe('Abuja')
  })

  it('insurance filtering still works after changing location', () => {
    const results = searchProviders({ city: 'Abuja', insurance: 'hygeia' })

    expect(results.length).toBeGreaterThan(0)
    expect(results[0].provider.location.city).toBe('Abuja')
    expect(results[0].provider.acceptedInsurance).toContain('hygeia')
  })
})
