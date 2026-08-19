import { CareRecommendation } from '../../../shared/types'
import { getCareLevelInfo } from '../data/care-levels'

interface CareRecommendationProps {
  recommendation: CareRecommendation
  onFindProviders: () => void
}

function CareRecommendationCard({ recommendation, onFindProviders }: CareRecommendationProps) {
  const careLevelInfo = getCareLevelInfo(recommendation.careLevel)

  const careLevelStyles = {
    'emergency-care': {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800',
      icon: '🚨',
    },
    'urgent-care': {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800',
      icon: '⚡',
    },
    'same-day-care': {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      icon: '📅',
    },
    'routine-care': {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      badge: 'bg-teal-100 text-teal-800',
      icon: '✓',
    },
  }

  const styles = careLevelStyles[recommendation.careLevel]

  return (
    <div className={`rounded-2xl border-2 ${styles.border} ${styles.bg} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{styles.icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Your next step</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${styles.badge}`}>
            {careLevelInfo?.name}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-ink-700 mb-4 leading-relaxed">{recommendation.reasoning}</p>

      {/* Care Level Description */}
      {careLevelInfo && (
        <div className="mb-4 p-3 bg-white rounded-xl border border-ink-100">
          <p className="text-sm text-ink-600">{careLevelInfo.description}</p>
        </div>
      )}

      {/* Next Steps */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium text-ink-700">What we recommend:</p>
        {recommendation.nextSteps.map((step: { type: string; label: string; description: string }, i: number) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <div>
              <p className="text-sm font-medium text-ink-900">{step.label}</p>
              <p className="text-sm text-ink-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onFindProviders}
        className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
      >
        Find a provider
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-ink-500 mt-4 leading-relaxed">
        {recommendation.disclaimer}
      </p>
    </div>
  )
}

export default CareRecommendationCard
