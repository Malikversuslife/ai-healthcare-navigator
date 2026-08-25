import { MockContextItem, MockConversationScript, MockConversationTurn, useMockConversation } from '../hooks/useMockConversation'

interface MockConversationProps {
  script: MockConversationScript
  variant?: 'light' | 'dark'
  className?: string
  messageClassName?: string
  contextClassName?: string
  contextLayout?: 'chips' | 'rows'
  contextPlaceholder?: string
}

function MessageBubble({ turn, variant }: { turn: MockConversationTurn; variant: 'light' | 'dark' }) {
  const isUser = turn.speaker === 'user'
  const assistantClass = variant === 'dark'
    ? 'bg-bone-100/10 backdrop-blur-sm text-bone-100 rounded-bl-md'
    : 'bg-bone-100 text-ink-900 rounded-bl-md'

  return (
    <div className={`mock-turn flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 ${isUser ? 'bg-aubergine-600 text-white rounded-br-md' : assistantClass}`}>
        <p className="text-body-sm leading-relaxed">{turn.text}</p>
      </div>
    </div>
  )
}

function TypingIndicator({ variant }: { variant: 'light' | 'dark' }) {
  return (
    <div className="mock-turn flex items-center gap-2 pt-1" aria-hidden="true">
      <span className={`mock-typing-dot w-1.5 h-1.5 rounded-full ${variant === 'dark' ? 'bg-aubergine-400' : 'bg-aubergine-500'}`} />
      <span className={`mock-typing-dot w-1.5 h-1.5 rounded-full ${variant === 'dark' ? 'bg-aubergine-400' : 'bg-aubergine-500'}`} />
      <span className={`mock-typing-dot w-1.5 h-1.5 rounded-full ${variant === 'dark' ? 'bg-aubergine-400' : 'bg-aubergine-500'}`} />
    </div>
  )
}

function ContextChip({ item, variant }: { item: MockContextItem; variant: 'light' | 'dark' }) {
  const chipClass = variant === 'dark'
    ? 'bg-ink-900/60 backdrop-blur-sm border-soft-stone-100/10 text-soft-stone-300'
    : 'bg-bone-50 border-soft-stone-100 text-ink-600'

  return (
    <div className={`mock-context-item border rounded-full px-4 py-1.5 text-caption ${chipClass}`}>
      <span className="text-aubergine-300 font-medium">{item.label.toUpperCase()}</span> · {item.value}
    </div>
  )
}

function ContextRow({ item }: { item: MockContextItem }) {
  return (
    <div className="mock-context-item flex items-start gap-3 bg-bone-50 rounded-xl p-4">
      <span className="text-aubergine-400 text-body mt-0.5">•</span>
      <div>
        <p className="text-caption text-ink-400">{item.label}</p>
        <p className="text-body-sm font-medium text-ink-900 mt-0.5">{item.value}</p>
      </div>
    </div>
  )
}

export default function MockConversation({
  script,
  variant = 'light',
  className = '',
  messageClassName = '',
  contextClassName = '',
  contextLayout = 'chips',
  contextPlaceholder,
}: MockConversationProps) {
  const state = useMockConversation(script)
  const isRestarting = !state.isFading && state.visibleTurns.length === 0 && script.turns.length > 0
  const visibleTurns = isRestarting ? [script.turns[0]] : state.visibleTurns

  return (
    <div className={`${state.isFading ? 'mock-conversation-fading' : ''} ${isRestarting ? 'mock-conversation-restarting' : ''} ${className}`} aria-hidden="true">
      <div className={`mock-conversation-messages ${messageClassName}`}>
        {visibleTurns.map((turn) => (
          <MessageBubble key={`${turn.revealAt}-${turn.text}`} turn={turn} variant={variant} />
        ))}
        {state.isTyping && <TypingIndicator variant={variant} />}
      </div>

      <div className={contextClassName}>
        {state.visibleContext.length === 0 && contextPlaceholder && (
          <p className="text-body-sm text-ink-400">{contextPlaceholder}</p>
        )}
        {state.visibleContext.map((item) => (
          contextLayout === 'rows'
            ? <ContextRow key={item.label} item={item} />
            : <ContextChip key={item.label} item={item} variant={variant} />
        ))}
      </div>
    </div>
  )
}
