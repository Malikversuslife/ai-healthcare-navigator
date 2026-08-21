import { ProviderMatch } from '../../../shared/types'
import ProviderCard from './ProviderCard'

interface ProviderListProps {
  matches: ProviderMatch[]
  onSelectProvider?: (providerId: string) => void
}

function ProviderList({ matches, onSelectProvider }: ProviderListProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-ink-200">
        <p className="text-ink-600 font-medium">No exact matches found</p>
        <p className="text-sm text-ink-400 mt-2 mb-4">
          We couldn't find providers matching all your filters.
        </p>
        <div className="space-y-1 text-sm text-ink-500">
          <p>You can try:</p>
          <p>Expanding your search area</p>
          <p>Checking nearby cities</p>
          <p>Removing the insurance filter</p>
        </div>
      </div>
    )
  }

  // Separate exact matches from partial matches
  const hasSpecialtyFilter = matches.some(m =>
    m.matchReasons.includes('specialty_match')
  )
  const exactMatches = matches.filter(m =>
    m.matchReasons.includes('specialty_match') || !hasSpecialtyFilter
  )
  const partialMatches = hasSpecialtyFilter
    ? matches.filter(m => !m.matchReasons.includes('specialty_match'))
    : []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-ink-200 p-4">
        <h3 className="text-lg font-semibold text-ink-900 mb-1">
          Matches for your search
        </h3>
        <p className="text-sm text-ink-500">
          {exactMatches.length} provider{exactMatches.length !== 1 ? 's' : ''} match your criteria
          {partialMatches.length > 0 && ` (${partialMatches.length} partial match${partialMatches.length !== 1 ? 'es' : ''})`}
        </p>
      </div>

      {/* Exact Matches */}
      <div className="space-y-3">
        {exactMatches.map(match => (
          <ProviderCard
            key={match.provider.id}
            match={match}
            onSelect={onSelectProvider}
          />
        ))}
      </div>

      {/* Partial Matches */}
      {partialMatches.length > 0 && (
        <>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-3">
            <p className="text-sm text-amber-800 font-medium">
              Partial matches — these may still be useful
            </p>
            <p className="text-xs text-amber-600 mt-1">
              These providers don't fully match your specialty request but may be relevant.
            </p>
          </div>
          <div className="space-y-3">
            {partialMatches.map(match => (
              <ProviderCard
                key={match.provider.id}
                match={match}
                onSelect={onSelectProvider}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProviderList
