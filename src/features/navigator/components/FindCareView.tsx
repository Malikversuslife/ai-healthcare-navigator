import { useState } from 'react'
import { ProviderMatch, UserHealthContext, ConversationProgress } from '../../../shared/types'
import { VisualState } from '../hooks/useVisualState'
import ProviderCard from './ProviderCard'
import LocationPrompt from './LocationPrompt'
import WaypointProgress from './WaypointProgress'
import insuranceData from '../data/mock-insurance.json'

const INITIAL_COUNT = 3

interface FindCareViewProps {
  providerMatches: ProviderMatch[]
  userContext: UserHealthContext
  selectedInsurance: string | null
  progress: ConversationProgress
  visualState: VisualState
  onSelectProvider: (providerId: string) => void
  onLocationSelect: (location: string) => void
  onSelectInsurance: (insuranceId: string) => void
  onBack: () => void
}

function FindCareView({
  providerMatches,
  userContext,
  selectedInsurance,
  progress,
  visualState,
  onSelectProvider,
  onLocationSelect,
  onSelectInsurance,
  onBack,
}: FindCareViewProps) {
  const [showAll, setShowAll] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const showLocationPrompt = providerMatches.length === 0 && !userContext.location
  const hasResults = providerMatches.length > 0

  const contextLine = (() => {
    const parts: string[] = []
    if (userContext.specialty) parts.push(userContext.specialty)
    parts.push('options')
    if (userContext.location) parts.push(`near ${userContext.location}`)
    return parts.join(' ')
  })()

  const visibleMatches = showAll
    ? providerMatches
    : providerMatches.slice(0, INITIAL_COUNT)
  const hasMore = providerMatches.length > INITIAL_COUNT && !showAll

  return (
    <div className="max-w-3xl mx-auto">
      <WaypointProgress progress={progress} visualState={visualState} />

      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-body-sm text-ink-500 hover:text-ink-700 transition-colors mb-4"
        >
          Back to guidance
        </button>
        <h2 className="font-display text-display-sm text-ink-900 mb-2">
          Find care that fits.
        </h2>
        <p className="text-body-sm text-ink-500">
          Based on your next step and location, these are the most relevant options we found.
        </p>
      </div>

      {showLocationPrompt && (
        <LocationPrompt onLocationSelect={onLocationSelect} />
      )}

      {hasResults && (
        <>
          {/* Context line */}
          <p className="text-body-sm text-ink-500 mb-4">
            {contextLine}
          </p>

          {/* Insurance filters — visually subordinate */}
          <div className="mb-6">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="text-body-sm text-ink-500 hover:text-ink-700 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {selectedInsurance && (
                <span className="text-aubergine-600">· 1 active</span>
              )}
            </button>

            {filtersOpen && (
              <div className="mt-3 bg-white border border-ink-100 rounded-2xl p-4">
                <p className="text-body-sm font-medium text-ink-700 mb-2">
                  Insurance
                </p>
                <div className="flex flex-wrap gap-2">
                  {insuranceData.map((insurance) => (
                    <button
                      key={insurance.id}
                      onClick={() => onSelectInsurance(insurance.id)}
                      className={`px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors ${
                        selectedInsurance === insurance.id
                          ? 'bg-aubergine-600 text-white'
                          : 'bg-soft-stone-50 text-ink-600 hover:bg-soft-stone-100'
                      }`}
                    >
                      {insurance.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result count */}
          <p className="text-caption text-ink-400 mb-4">
            {providerMatches.length} {providerMatches.length === 1 ? 'option' : 'options'} found
          </p>

          {/* Best matches */}
          {showAll && (
            <p className="text-caption text-ink-500 uppercase tracking-wide mb-3">
              Best matches
            </p>
          )}

          <div className="space-y-3">
            {visibleMatches.map((match) => (
              <ProviderCard
                key={match.provider.id}
                match={match}
                onSelect={onSelectProvider}
              />
            ))}
          </div>

          {/* See more */}
          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-4 w-full py-3 text-body-sm font-medium text-ink-500 hover:text-ink-700 border border-ink-100 rounded-2xl hover:border-ink-200 transition-colors"
            >
              See more options
            </button>
          )}
        </>
      )}

      {/* Empty state */}
      {!showLocationPrompt && !hasResults && (
        <div className="text-center py-12">
          <p className="text-body text-ink-600 mb-2">
            No providers found for this search.
          </p>
          <p className="text-body-sm text-ink-400">
            Try adjusting your location or insurance filter.
          </p>
        </div>
      )}
    </div>
  )
}

export default FindCareView
