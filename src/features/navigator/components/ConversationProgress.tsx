import { ConversationProgress as ProgressType, ConversationStep } from '../../../shared/types'

interface ConversationProgressProps {
  progress: ProgressType
  currentStep: ConversationStep
}

function ConversationProgress({ progress, currentStep }: ConversationProgressProps) {
  const steps = [
    { key: 'concern', label: "What you're experiencing", collected: progress.concernCollected },
    { key: 'duration', label: "How long it's been happening", collected: progress.durationCollected },
    { key: 'severity', label: 'How severe it is', collected: progress.severityCollected },
  ]

  const isComplete = steps.every(s => s.collected)
  const showProgress = currentStep === 'intake' || currentStep === 'follow-up'

  if (!showProgress) return null

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-4 shadow-sm">
      <p className="text-sm font-medium text-ink-700 mb-3">Understanding your concern</p>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.key} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              step.collected 
                ? 'bg-teal-600 text-white' 
                : 'bg-ink-100 text-ink-400'
            }`}>
              {step.collected ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 bg-ink-400 rounded-full"></span>
              )}
            </div>
            <span className={`text-sm ${step.collected ? 'text-ink-700' : 'text-ink-500'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {!isComplete && (
        <p className="text-xs text-ink-400 mt-3">
          Finding the right care
        </p>
      )}
    </div>
  )
}

export default ConversationProgress
