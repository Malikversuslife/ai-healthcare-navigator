import { CareRecommendation } from '../../../shared/types'

interface CompleteViewProps {
  recommendation: CareRecommendation | null
  onReset: () => void
}

function CompleteView({ recommendation, onReset }: CompleteViewProps) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="w-12 h-12 rounded-full bg-aubergine-50 flex items-center justify-center mx-auto mb-6">
        <svg className="w-6 h-6 text-aubergine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-display text-heading text-ink-900 mb-3">
        You&apos;re all set
      </h2>

      <p className="text-body text-ink-600 mb-8 leading-relaxed">
        We&apos;ve mapped out your next steps. If anything changes or you have new questions, you can always start a new conversation.
      </p>

      {recommendation && (
        <div className="bg-white border border-ink-100 rounded-2xl p-6 mb-8 text-left">
          <p className="text-caption text-ink-400 uppercase tracking-wide mb-2">
            Your recommendation
          </p>
          <p className="text-body-sm text-ink-700 leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="px-6 py-3 bg-aubergine-600 text-white rounded-2xl font-medium text-body-sm hover:bg-aubergine-700 transition-colors"
      >
        Start a new conversation
      </button>
    </div>
  )
}

export default CompleteView
