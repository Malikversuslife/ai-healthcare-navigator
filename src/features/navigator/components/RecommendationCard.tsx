import { CareRecommendation } from '../../../shared/types'

interface RecommendationCardProps {
  recommendation: CareRecommendation
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <div className="border border-ink-100 rounded-2xl p-6 md:p-8">
      <p className="text-caption text-aubergine-600 uppercase tracking-wide mb-3">
        Your next step
      </p>

      <p className="text-body-lg text-ink-800 leading-relaxed mb-6">
        {recommendation.reasoning}
      </p>

      {recommendation.nextSteps.length > 0 && (
        <div className="space-y-4 mb-6">
          <p className="text-body-sm font-medium text-ink-700">What you can do</p>
          {recommendation.nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="text-caption text-ink-500 mt-1 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-body-sm font-medium text-ink-800">{step.label}</p>
                <p className="text-body-sm text-ink-600 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-caption text-ink-500 leading-relaxed">
        {recommendation.disclaimer}
      </p>
    </div>
  )
}

export default RecommendationCard
