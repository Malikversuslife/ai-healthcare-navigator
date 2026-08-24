import { ProviderMatch } from '../../../shared/types'

interface ProviderCardProps {
  match: ProviderMatch
  onSelect: (providerId: string) => void
}

const AVAILABILITY_LABELS = {
  available: 'Available today',
  limited: 'Limited availability',
  unavailable: 'Currently unavailable',
} as const

const MATCH_REASON_LABELS: Record<string, string> = {
  specialty_match: 'Specialist match',
  provider_type_match: 'Appropriate care type',
  location_match: 'In your area',
  insurance_match: 'Listed for your selected insurance',
  available: 'Currently available',
  lower_cost: 'Lower cost option',
  high_rating: 'Highly rated',
  nearby: 'Nearby',
}

function ProviderCard({ match, onSelect }: ProviderCardProps) {
  const { provider, matchReasons, insuranceStatus, distanceKm } = match

  return (
    <div className="bg-white border border-ink-100 rounded-2xl p-5 hover:border-ink-200 transition-colors">
      {/* Name and specialty */}
      <h3 className="text-body font-medium text-ink-900 mb-0.5 break-words">{provider.name}</h3>
      <p className="text-body-sm text-ink-500 mb-2">{provider.specialty}</p>

      {/* Location */}
      <p className="text-body-sm text-ink-600 mb-1">
        {provider.location.area}, {provider.location.city}
        {distanceKm !== null && (
          <span className="text-ink-400"> · {distanceKm.toFixed(1)} km</span>
        )}
      </p>

      {/* Match reasons */}
      {matchReasons.length > 0 && (
        <div className="mt-3 mb-3">
          <p className="text-caption text-ink-400 uppercase tracking-wide mb-1.5">
            Why this matches
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.map((reason) => (
              <span
                key={reason}
                className="px-2.5 py-0.5 bg-soft-stone-50 text-ink-600 rounded-full text-caption"
              >
                {MATCH_REASON_LABELS[reason] ?? reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability, price, insurance, view details */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-3 pt-3 border-t border-ink-100">
        <div className="space-y-0.5">
          <p className="text-body-sm text-ink-700">
            {AVAILABILITY_LABELS[provider.availability]}
          </p>
          <p className="text-caption text-ink-500">
            Consultation: ₦{provider.consultationFee.toLocaleString()}
          </p>
          {insuranceStatus === 'accepted' && (
            <p className="text-caption text-aubergine-600">
              Accepts your insurance
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect(provider.id)}
          className="min-h-11 inline-flex items-center text-body-sm font-medium text-aubergine-600 hover:text-aubergine-700 transition-colors shrink-0"
        >
          View details →
        </button>
      </div>

      {insuranceStatus === 'not_accepted' && (
        <p className="text-caption text-ink-400 mt-3 border-t border-ink-100 pt-3">
          This provider is not listed as accepting your selected insurance plan.
        </p>
      )}
    </div>
  )
}

export default ProviderCard
