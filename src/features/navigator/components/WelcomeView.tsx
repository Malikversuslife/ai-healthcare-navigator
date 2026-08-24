import Composer from './Composer'

interface WelcomeViewProps {
  onSend: (message: string) => void
  isLoading: boolean
}

const STARTER_ACTIONS = [
  "I've had a headache since yesterday",
  "I need to see an eye doctor",
  "Find a clinic near me",
  "I have a red, teary eye",
]

function WelcomeView({ onSend, isLoading }: WelcomeViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="font-display text-display text-ink-900 mb-4 text-balance">
          What can I help you figure out today?
        </h1>

        <p className="text-body text-ink-500 mb-10">
          Tell Hanya what&apos;s going on. You don&apos;t need to know what kind of care you need.
        </p>

        <div className="mb-8">
          <Composer onSend={onSend} disabled={isLoading} />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {STARTER_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => onSend(action)}
              disabled={isLoading}
              className="px-4 py-2 bg-white border border-ink-200 rounded-full text-body-sm text-ink-600 hover:border-aubergine-300 hover:text-aubergine-700 transition-colors disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WelcomeView
