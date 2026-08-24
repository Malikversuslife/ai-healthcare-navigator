import { ConversationProgress } from '../../../shared/types'
import { VisualState } from '../hooks/useVisualState'

interface WaypointProgressProps {
  progress: ConversationProgress
  visualState: VisualState
}

function WaypointProgress({ progress, visualState }: WaypointProgressProps) {
  const contextReady = progress.concernCollected &&
    (progress.durationCollected || progress.severityCollected)

  function stepState(index: number): 'complete' | 'active' | 'future' {
    if (index === 0) return contextReady ? 'complete' : 'active'
    if (index === 1) {
      if (visualState === 'guidance' || visualState === 'find_care' || visualState === 'emergency' || visualState === 'complete') return 'complete'
      if (contextReady) return 'active'
      return 'future'
    }
    if (index === 2) {
      if (visualState === 'find_care' || visualState === 'emergency' || visualState === 'complete') return 'complete'
      if (visualState === 'guidance') return 'active'
      return 'future'
    }
    return 'future'
  }

  return (
    <div className="flex items-center gap-2 mb-8">
      {['Understanding', 'Next step', 'Find care'].map((label, i) => {
        const state = stepState(i)
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  state === 'complete'
                    ? 'bg-aubergine-600'
                    : state === 'active'
                      ? 'bg-aubergine-400'
                      : 'bg-ink-200'
                }`}
              />
              <span
                className={`text-caption transition-colors ${
                  state === 'complete'
                    ? 'text-ink-700'
                    : state === 'active'
                      ? 'text-aubergine-600'
                      : 'text-ink-500'
                }`}
              >
                {label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`w-5 h-px ${
                  state === 'complete'
                    ? 'bg-aubergine-300'
                    : state === 'active'
                      ? 'bg-aubergine-200'
                      : 'bg-ink-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WaypointProgress
