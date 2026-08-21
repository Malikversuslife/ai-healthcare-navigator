import { ProviderMatch } from '../../../shared/types'
import { formatCurrency } from '../../../shared/utils'

interface ProviderCardProps {
  match: ProviderMatch
  onSelect?: (providerId: string) => void
}

const MATCH_REASON_LABELS: Record<string, string> = {
  specialty_match: 'Specialty match',
  provider_type_match: 'Provider type match',
  location_match: 'In your area',
  insurance_match: 'Accepts your insurance',
  available: 'Currently available',
  lower_cost: 'Competitive pricing',
  high_rating: 'Highly rated',
  nearby: 'Nearby',
}

function ProviderCard({ match, onSelect }: ProviderCardProps) {
  const { provider, matchReasons, insuranceStatus, distanceKm } = match

  const availabilityConfig = {
    available: { text: 'Available today', color: 'text-teal-600' },
    limited: { text: 'Limited availability', color: 'text-amber-600' },
    unavailable: { text: 'Currently unavailable', color: 'text-ink-400' },
  }

  const availability = availabilityConfig[provider.availability]

  const insuranceConfig: Record<string, { text: string; color: string } | null> = {
    accepted: { text: 'Accepts your selected insurance', color: 'text-teal-600' },
    not_accepted: { text: 'Does not list your selected insurance', color: 'text-amber-600' },
    unknown: null,
  }

  const insurance = insuranceConfig[insuranceStatus]

  return (
    <div
      className="bg-white rounded-xl border border-ink-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onSelect?.(provider.id)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-ink-900 text-base">{provider.name}</h4>
          <p className="text-sm text-ink-500 mt-0.5">{provider.specialty}</p>
          <p className="text-xs text-ink-400 mt-0.5 capitalize">{provider.type.replace('-', ' ')}</p>
        </div>
        <span className={`text-sm font-medium ${availability.color}`}>
          {availability.text}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-ink-600 mb-2">
        <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{provider.location.area}, {provider.location.city}</span>
        {distanceKm !== null && (
          <span className="text-xs text-ink-400 ml-1">({distanceKm} km)</span>
        )}
      </div>

      {/* Rating + Cost */}
      <div className="flex items-center gap-4 text-sm mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium text-ink-700">{provider.rating}</span>
        </div>
        <span className="text-sm text-ink-700">
          From {formatCurrency(provider.consultationFee)}
        </span>
      </div>

      {/* Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {matchReasons.map(reason => (
            <span
              key={reason}
              className="inline-block px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full font-medium"
            >
              {MATCH_REASON_LABELS[reason] ?? reason}
            </span>
          ))}
        </div>
      )}

      {/* Insurance Status */}
      {insurance && (
        <div className="mb-3">
          <span className={`text-xs font-medium ${insurance.color}`}>
            {insurance.text}
          </span>
        </div>
      )}

      {/* Action Button */}
      <button className="w-full px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
        View provider
      </button>
    </div>
  )
}

export default ProviderCard
