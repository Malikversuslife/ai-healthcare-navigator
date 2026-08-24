import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Message } from '../../../shared/types'
import { useConversation } from '../hooks/useConversation'
import MessageBubble from './MessageBubble'
import CareRecommendationCard from './CareRecommendation'
import EmergencyAlert from './EmergencyAlert'
import ProviderList from './ProviderList'
import LocationPrompt from './LocationPrompt'
import Spinner from '../../../shared/components/Spinner'
import insuranceData from '../data/mock-insurance.json'
import ConversationProgress from './ConversationProgress'

function ConversationView() {
  const location = useLocation()
  const initialMessage = (location.state as { initialMessage?: string })?.initialMessage

  const {
    state,
    sendMessage,
    findProviders,
    selectInsurance,
    setLocation,
    startConversation,
  } = useConversation()

  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true
      startConversation()
    }
  }, [startConversation])

  useEffect(() => {
    if (initialMessage && hasStarted.current && state.messages.length === 1) {
      setTimeout(() => {
        sendMessage(initialMessage)
      }, 500)
    }
  }, [initialMessage, state.messages.length, sendMessage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

  useEffect(() => {
    if (!state.isLoading && state.currentStep !== 'recommendation' && state.currentStep !== 'provider-search') {
      inputRef.current?.focus()
    }
  }, [state.isLoading, state.currentStep])

  const handleSend = async () => {
    if (!inputValue.trim() || state.isLoading) return
    const message = inputValue
    setInputValue('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickReply = async (reply: string) => {
    await sendMessage(reply)
  }

  const handleLocationSelect = (location: string) => {
    setLocation(location)
  }

  const handleSelectProvider = (providerId: string) => {
    // Provider selected — for now just log. Booking not yet implemented.
    void providerId
  }

  const showInput = state.currentStep !== 'recommendation' &&
                    state.currentStep !== 'provider-search' &&
                    state.currentStep !== 'location-prompt'

  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress Indicator */}
        <ConversationProgress progress={state.progress} currentStep={state.currentStep} />

        {/* Main Chat Container */}
        <div className="bg-white rounded-2xl border border-ink-200 shadow-sm overflow-hidden mt-4">
          {/* Messages Area */}
          <div className="h-[500px] md:h-[600px] overflow-y-auto p-4 md:p-6">
            {state.messages.map((message: Message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onQuickReply={handleQuickReply}
              />
            ))}

            {state.isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-ink-100 rounded-2xl px-4 py-3">
                  <Spinner size="sm" />
                </div>
              </div>
            )}

            {/* Location Prompt */}
            {state.currentStep === 'provider-search' && state.providerMatches.length === 0 && !state.userContext.location && (
              <LocationPrompt onLocationSelect={handleLocationSelect} />
            )}

            {/* Emergency Alert */}
            {state.navigationState === 'emergency' && (
              <EmergencyAlert />
            )}

            {/* Care Recommendation (non-emergency) */}
            {state.recommendation && state.navigationState !== 'emergency' && (
              <CareRecommendationCard
                recommendation={state.recommendation}
                onFindProviders={() => findProviders()}
              />
            )}

            {/* Provider List */}
            {state.providerMatches.length > 0 && (
              <ProviderList
                matches={state.providerMatches}
                onSelectProvider={handleSelectProvider}
              />
            )}

            {/* Insurance Selection */}
            {state.currentStep === 'provider-search' && state.providerMatches.length > 0 && (
              <div className="mt-6 bg-ink-50 rounded-xl p-4 border border-ink-100">
                <h4 className="font-medium text-ink-900 mb-3">Select your insurance (optional)</h4>
                <div className="flex flex-wrap gap-2">
                  {insuranceData.map(insurance => (
                    <button
                      key={insurance.id}
                      onClick={() => selectInsurance(insurance.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        state.selectedInsurance === insurance.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-ink-200 text-ink-700 hover:border-teal-400'
                      }`}
                    >
                      {insurance.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {showInput && (
            <div className="border-t border-ink-100 p-4 bg-ink-50">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your health concern..."
                  disabled={state.isLoading}
                  className="flex-1 px-4 py-3 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || state.isLoading}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-xs text-ink-400 mt-4 px-4">
          This is a healthcare navigation tool, not a diagnostic service. Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  )
}

export default ConversationView
