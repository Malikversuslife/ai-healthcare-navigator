import { CareRecommendation } from '../../../shared/types'

interface CareRecommendationProps {
  recommendation: CareRecommendation
  onFindProviders: () => void
}

const PATHWAY_DISPLAY = {
  emergency: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: '\u{1F6A8}',
    title: 'Emergency Care',
  },
  prompt_medical_review: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: '\u{26A0}\u{FE0F}',
    title: 'Seek Medical Assessment',
  },
  primary_care: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    icon: '\u{1F4CB}',
    title: 'Start with Primary Care',
  },
  provider_or_specialist: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-800',
    icon: '\u{1F50D}',
    title: 'Find the Right Provider',
  },
  informational_navigation: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    icon: '\u{2139}\u{FE0F}',
    title: 'Healthcare Navigation',
  },
}

function CareRecommendationCard({ recommendation, onFindProviders }: CareRecommendationProps) {
  const styles = PATHWAY_DISPLAY[recommendation.pathway]

  const showFindProvider = recommendation.pathway === 'emergency'
    || recommendation.pathway === 'primary_care'
    || recommendation.pathway === 'prompt_medical_review'
    || recommendation.pathway === 'provider_or_specialist'

  return (
    <div className={`rounded-2xl border-2 ${styles.border} ${styles.bg} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{styles.icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Your next step</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${styles.badge}`}>
            {styles.title}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-ink-700 mb-4 leading-relaxed">{recommendation.reasoning}</p>

      {/* Next Steps */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium text-ink-700">What we recommend:</p>
        {recommendation.nextSteps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">{'\u{2022}'}</span>
            <div>
              <p className="text-sm font-medium text-ink-900">{step.label}</p>
              <p className="text-sm text-ink-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      {showFindProvider && (
        <button
          onClick={onFindProviders}
          className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          Find a provider
        </button>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-ink-500 mt-4 leading-relaxed">
        {recommendation.disclaimer}
      </p>
    </div>
  )
}

export default CareRecommendationCard
