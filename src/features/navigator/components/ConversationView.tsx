import { useState, useEffect, useRef } from 'react'
import { Message } from '../../../shared/types'
import { useConversation } from '../hooks/useConversation'
import MessageBubble from './MessageBubble'
import CareRecommendationCard from './CareRecommendation'
import ProviderList from './ProviderList'
import LocationPrompt from './LocationPrompt'
import Spinner from '../../../shared/components/Spinner'
import Input from '../../../shared/components/Input'
import Button from '../../../shared/components/Button'
import insuranceData from '../data/mock-insurance.json'

function ConversationView() {
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

  useEffect(() => {
    startConversation()
  }, [startConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages])

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

  const handleLocationSelect = (location: string) => {
    setLocation(location)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Healthcare Navigator</h2>
          <p className="text-primary-100 text-sm">Describe your health concern and we'll guide you to the right care</p>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6">
          {state.messages.map((message: Message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {state.isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <Spinner size="sm" />
              </div>
            </div>
          )}

          {/* Location Prompt */}
          {state.currentStep === 'provider-search' && state.providers.length === 0 && !state.userContext.location && (
            <LocationPrompt onLocationSelect={handleLocationSelect} />
          )}

          {/* Care Recommendation */}
          {state.recommendation && (
            <CareRecommendationCard
              recommendation={state.recommendation}
              onFindProviders={() => findProviders()}
            />
          )}

          {/* Provider List */}
          {state.providers.length > 0 && (
            <ProviderList
              providers={state.providers}
              selectedInsurance={state.selectedInsurance}
            />
          )}

          {/* Insurance Selection */}
          {state.currentStep === 'provider-search' && state.providers.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Select your insurance (optional)</h4>
              <div className="flex flex-wrap gap-2">
                {insuranceData.map(insurance => (
                  <Button
                    key={insurance.id}
                    variant={state.selectedInsurance === insurance.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => selectInsurance(insurance.id)}
                  >
                    {insurance.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {state.currentStep !== 'recommendation' && state.currentStep !== 'provider-search' && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your health concern..."
                disabled={state.isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || state.isLoading}
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-gray-500 mt-4">
        This is a healthcare navigation tool, not a diagnostic service. Always consult a healthcare professional for medical advice.
      </p>
    </div>
  )
}

export default ConversationView
