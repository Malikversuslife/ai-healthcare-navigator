import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useConversation } from '../hooks/useConversation'
import { useVisualState } from '../hooks/useVisualState'
import WelcomeView from './WelcomeView'
import UnderstandingView from './UnderstandingView'
import GuidanceView from './GuidanceView'
import FindCareView from './FindCareView'
import ProviderDetailView from './ProviderDetailView'
import EmergencyView from './EmergencyView'
import CompleteView from './CompleteView'
import { emergencyConfig } from '../../../shared/config'
import { ProviderMatch } from '../../../shared/types'

export const URGENT_HELP_BUTTON_LABEL = 'Need urgent help?'
export const NAVIGATOR_BRAND_HOME_LABEL = 'Hanya home'
export const NAVIGATOR_BRAND_HOME_PATH = '/'

export function shouldSendInitialMessage(
  initialMessage: string | undefined,
  hasStarted: boolean,
  consumed: boolean
): boolean {
  return !!initialMessage && hasStarted && !consumed
}

export function findSelectedProviderMatch(
  providerMatches: ProviderMatch[],
  selectedProviderId: string | null
): ProviderMatch | null {
  return selectedProviderId
    ? providerMatches.find((m) => m.provider.id === selectedProviderId) ?? null
    : null
}

function Navigator() {
  const location = useLocation()
  const initialMessage = (location.state as { initialMessage?: string })?.initialMessage

  const {
    state,
    sendMessage,
    findProviders,
    setLocation,
    startConversation,
    goBackToGuidance,
    reset,
    selectInsurance,
  } = useConversation()

  const { visualState, messages, userContext, recommendation, providerMatches, isLoading, progress } =
    useVisualState(state)

  const hasStarted = useRef(false)
  const initialMessageConsumed = useRef(false)
  const [urgentHelpOpen, setUrgentHelpOpen] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)

  const selectedProviderMatch = findSelectedProviderMatch(providerMatches, selectedProviderId)

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true
      startConversation()
    }
  }, [startConversation])

  useEffect(() => {
    if (shouldSendInitialMessage(initialMessage, hasStarted.current, initialMessageConsumed.current)) {
      initialMessageConsumed.current = true
      setTimeout(() => {
        sendMessage(initialMessage!)
      }, 500)
    }
  }, [initialMessage, sendMessage])

  useEffect(() => {
    if (selectedProviderId && !selectedProviderMatch) {
      setSelectedProviderId(null)
    }
  }, [selectedProviderId, selectedProviderMatch])

  const handleReset = () => {
    initialMessageConsumed.current = true
    setSelectedProviderId(null)
    setUrgentHelpOpen(false)
    reset()
  }

  const renderContent = () => {
    // Provider detail takes priority when a provider is selected
    if (selectedProviderId && selectedProviderMatch) {
      return (
        <ProviderDetailView
          match={selectedProviderMatch}
          progress={progress}
          visualState={visualState}
          selectedInsurance={state.selectedInsurance}
          onBack={() => setSelectedProviderId(null)}
        />
      )
    }

    switch (visualState) {
      case 'welcome':
        return <WelcomeView onSend={sendMessage} isLoading={isLoading} />

      case 'understanding':
        return (
          <UnderstandingView
            messages={messages}
            userContext={userContext}
            progress={progress}
            visualState={visualState}
            isLoading={isLoading}
            onSend={sendMessage}
          />
        )

      case 'guidance':
        return (
          <GuidanceView
            recommendation={recommendation!}
            progress={progress}
            visualState={visualState}
            onFindProviders={() => findProviders()}
          />
        )

      case 'find_care':
        return (
          <FindCareView
            providerMatches={providerMatches}
            userContext={userContext}
            selectedInsurance={state.selectedInsurance}
            progress={progress}
            visualState={visualState}
            onSelectProvider={setSelectedProviderId}
            onLocationSelect={setLocation}
            onSelectInsurance={selectInsurance}
            onBack={goBackToGuidance}
          />
        )

      case 'emergency':
        return <EmergencyView />

      case 'complete':
        return <CompleteView recommendation={recommendation} onReset={handleReset} />

      case 'loading':
        return (
          <div className="flex items-center justify-center py-20">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-aubergine-600 mr-2" />
            <span className="text-body-sm text-ink-500">Understanding...</span>
          </div>
        )

      default:
        return <WelcomeView onSend={sendMessage} isLoading={isLoading} />
    }
  }

  return (
    <div className="min-h-screen bg-bone-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-ink-100 bg-bone-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between" style={{ minHeight: '56px' }}>
          <Link
            to={NAVIGATOR_BRAND_HOME_PATH}
            aria-label={NAVIGATOR_BRAND_HOME_LABEL}
            className="min-h-11 -ml-2 px-2 inline-flex items-center gap-2.5 rounded-xl text-ink-900 transition-colors hover:bg-white/70 focus-visible:bg-white/70"
          >
            <svg className="w-6 h-6 text-aubergine-600" viewBox="0 0 24 24" fill="none">
              <path d="M6 4v16M18 4v16M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span className="text-body font-semibold text-ink-900">Hanya</span>
          </Link>

          <button
            type="button"
            onClick={() => setUrgentHelpOpen(!urgentHelpOpen)}
            aria-expanded={urgentHelpOpen}
            aria-controls="urgent-help-panel"
            className="min-h-11 px-3 -mr-3 text-body-sm text-ink-600 hover:text-red-600 transition-colors"
          >
            {URGENT_HELP_BUTTON_LABEL}
          </button>
        </div>

        {urgentHelpOpen && (
          <div id="urgent-help-panel" className="border-t border-ink-100 bg-white">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <p className="text-body-sm text-ink-700 mb-2">
                If you or someone near you is experiencing a medical emergency, please call emergency services immediately.
              </p>
              <a
                href={`tel:${emergencyConfig.emergencyNumber}`}
                className="inline-flex min-h-11 items-center px-4 py-2 bg-red-600 text-white rounded-xl text-body-sm font-medium hover:bg-red-700 transition-colors"
              >
                Call {emergencyConfig.emergencyNumber}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:py-10">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <p className="text-center text-body-sm text-ink-500 font-medium mb-1">
            Hanya guides. It doesn&apos;t diagnose.
          </p>
          <p className="text-center text-caption text-ink-500">
            Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Navigator
