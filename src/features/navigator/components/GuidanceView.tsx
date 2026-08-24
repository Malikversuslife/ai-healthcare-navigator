import { CareRecommendation, ConversationProgress } from '../../../shared/types'
import { VisualState } from '../hooks/useVisualState'
import RecommendationCard from './RecommendationCard'
import WaypointProgress from './WaypointProgress'

interface GuidanceViewProps {
  recommendation: CareRecommendation
  progress: ConversationProgress
  visualState: VisualState
  onFindProviders: () => void
}

function GuidanceView({ recommendation, progress, visualState, onFindProviders }: GuidanceViewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <WaypointProgress progress={progress} visualState={visualState} />

      <div className="mb-8">
        <p className="text-caption text-aubergine-600 uppercase tracking-wide mb-2">
          Hanya
        </p>
        <h2 className="font-display text-display-sm text-ink-900">
          Based on what you&apos;ve shared
        </h2>
      </div>

      <RecommendationCard recommendation={recommendation} />

      <div className="mt-8 flex justify-start">
        <button
          onClick={onFindProviders}
          className="px-8 py-4 bg-aubergine-600 text-white rounded-2xl font-medium text-body hover:bg-aubergine-700 transition-colors"
        >
          Find care now
        </button>
      </div>
    </div>
  )
}

export default GuidanceView
