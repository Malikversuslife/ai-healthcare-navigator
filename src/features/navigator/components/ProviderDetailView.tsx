import { ProviderMatch, ConversationProgress } from '../../../shared/types'
import { VisualState } from '../hooks/useVisualState'
import WaypointProgress from './WaypointProgress'

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

interface ProviderDetailViewProps {
  match: ProviderMatch
  progress: ConversationProgress
  visualState: VisualState
  selectedInsurance: string | null
  onBack: () => void
}

function ProviderDetailView({
  match,
  progress,
  visualState,
  selectedInsurance,
  onBack,
}: ProviderDetailViewProps) {
  const { provider, matchReasons, insuranceStatus, distanceKm } = match

  return (
    <div className="max-w-2xl mx-auto">
      <WaypointProgress progress={progress} visualState={visualState} />

      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 inline-flex items-center text-body-sm text-ink-500 hover:text-ink-700 transition-colors mb-4"
        >
          Back to results
        </button>
      </div>

      <article>
        <header className="mb-6">
          <h2 className="font-display text-display-sm text-ink-900 mb-1 break-words">
            {provider.name}
          </h2>
          <p className="text-body text-ink-500">{provider.specialty}</p>
        </header>

        {/* Location */}
        <section className="mb-6">
          <p className="text-body-sm text-ink-700">
            {provider.location.area}, {provider.location.city}
          </p>
          <p className="text-body-sm text-ink-500 mt-0.5">
            {provider.location.address}
          </p>
          {distanceKm !== null && (
            <p className="text-body-sm text-ink-500 mt-0.5">
              {distanceKm.toFixed(1)} km from you
            </p>
          )}
        </section>

        {/* Key details */}
        <section className="bg-white border border-ink-100 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-caption text-ink-400 uppercase tracking-wide mb-1">
                Availability
              </p>
              <p className="text-body-sm text-ink-800">
                {AVAILABILITY_LABELS[provider.availability]}
              </p>
            </div>
            <div>
              <p className="text-caption text-ink-400 uppercase tracking-wide mb-1">
                Consultation fee
              </p>
              <p className="text-body-sm text-ink-800">
                ₦{provider.consultationFee.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-caption text-ink-400 uppercase tracking-wide mb-1">
                Rating
              </p>
              <p className="text-body-sm text-ink-800">
                {provider.rating} / 5
              </p>
            </div>
            <div>
              <p className="text-caption text-ink-400 uppercase tracking-wide mb-1">
                Type
              </p>
              <p className="text-body-sm text-ink-800 capitalize">
                {provider.type.replace('-', ' ')}
              </p>
            </div>
          </div>
        </section>

        {/* Match reasons */}
        {matchReasons.length > 0 && (
          <section className="mb-6">
            <p className="text-caption text-ink-500 uppercase tracking-wide mb-3">
              Why Hanya surfaced this
            </p>
            <div className="flex flex-wrap gap-2">
              {matchReasons.map((reason) => (
                <span
                  key={reason}
                  className="px-3 py-1 bg-soft-stone-50 text-ink-600 rounded-full text-body-sm"
                >
                  {MATCH_REASON_LABELS[reason] ?? reason}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Accepted insurance */}
        {provider.acceptedInsurance.length > 0 && (
          <section className="mb-6">
            <p className="text-caption text-ink-500 uppercase tracking-wide mb-2">
              Accepted insurance
            </p>
            <div className="flex flex-wrap gap-1.5">
              {provider.acceptedInsurance.map((ins) => (
                <span
                  key={ins}
                  className="px-2.5 py-0.5 bg-soft-stone-50 text-ink-600 rounded-full text-caption"
                >
                  {ins}
                </span>
              ))}
            </div>
            {selectedInsurance && insuranceStatus === 'accepted' && (
              <p className="text-body-sm text-aubergine-600 mt-2">
                Accepts your selected insurance plan
              </p>
            )}
            {selectedInsurance && insuranceStatus === 'not_accepted' && (
              <p className="text-body-sm text-ink-500 mt-2">
                This provider is listed as accepting your selected insurance plan.
              </p>
            )}
          </section>
        )}

        {/* Back */}
        <div className="pt-4 border-t border-ink-100">
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 inline-flex items-center text-body-sm font-medium text-ink-600 hover:text-ink-800 transition-colors"
          >
            ← Back to results
          </button>
        </div>
      </article>
    </div>
  )
}

export default ProviderDetailView
