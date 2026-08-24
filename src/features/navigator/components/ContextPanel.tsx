import { UserHealthContext } from '../../../shared/types'

interface ContextPanelProps {
  userContext: UserHealthContext
}

function ContextPanel({ userContext }: ContextPanelProps) {
  const lines: string[] = []

  if (userContext.concern) {
    lines.push(userContext.concern)
  }

  if (userContext.symptoms.length > 0) {
    lines.push(userContext.symptoms.join(', '))
  }

  if (userContext.duration) {
    lines.push(userContext.duration)
  }

  if (userContext.severity) {
    if (userContext.severity.description) {
      lines.push(userContext.severity.description)
    } else if (userContext.severity.value !== undefined) {
      lines.push(`Severity reported: ${userContext.severity.value}/10`)
    }
  }

  if (lines.length === 0) return null

  return (
    <div className="bg-bone-50 border border-ink-100 rounded-2xl p-5">
      <p className="text-caption text-ink-500 uppercase tracking-wide mb-3">
        Hanya understands
      </p>
      <div className="space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-body-sm text-ink-800 leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ContextPanel
