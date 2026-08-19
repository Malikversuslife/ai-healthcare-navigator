import { Message } from '../../../shared/types'
import { formatTime } from '../../../shared/utils'

interface MessageBubbleProps {
  message: Message
  onQuickReply?: (reply: string) => void
}

const DURATION_OPTIONS = [
  'Less than a day',
  '1–3 days',
  '4–7 days',
  'More than a week',
  'Not sure',
]

const SEVERITY_OPTIONS = [
  'Mild',
  'Moderate',
  'Severe',
  'Not sure',
]

function MessageBubble({ message, onQuickReply }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  // Check if we should show quick replies
  const showDurationQuickReply = !isUser && 
    message.content.toLowerCase().includes('how long') &&
    onQuickReply

  const showSeverityQuickReply = !isUser && 
    (message.content.toLowerCase().includes('severity') || 
     message.content.toLowerCase().includes('scale of 1 to 10')) &&
    onQuickReply

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? '' : ''}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-md'
              : 'bg-ink-100 text-ink-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${isUser ? 'text-right text-ink-400' : 'text-ink-400'}`}>
          {formatTime(message.timestamp)}
        </p>

        {/* Quick Reply Options */}
        {showDurationQuickReply && (
          <div className="mt-3 flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onQuickReply(option)}
                className="px-3 py-1.5 bg-white border border-ink-200 rounded-lg text-sm text-ink-700 hover:border-teal-400 hover:text-teal-700 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {showSeverityQuickReply && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SEVERITY_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => onQuickReply(option)}
                className="px-3 py-1.5 bg-white border border-ink-200 rounded-lg text-sm text-ink-700 hover:border-teal-400 hover:text-teal-700 transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
