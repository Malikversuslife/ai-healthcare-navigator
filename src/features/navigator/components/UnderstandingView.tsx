import { useRef, useEffect } from 'react'
import { Message, UserHealthContext, ConversationProgress } from '../../../shared/types'
import { VisualState } from '../hooks/useVisualState'
import MessageItem from './MessageItem'
import Composer from './Composer'
import WaypointProgress from './WaypointProgress'
import ContextPanel from './ContextPanel'

interface UnderstandingViewProps {
  messages: Message[]
  userContext: UserHealthContext
  progress: ConversationProgress
  visualState: VisualState
  isLoading: boolean
  onSend: (message: string) => void
}

function UnderstandingView({ messages, userContext, progress, visualState, isLoading, onSend }: UnderstandingViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const hasContext = userContext.concern || userContext.symptoms.length > 0

  // Hide the first assistant greeting — active transcript starts from user's first message
  const visibleMessages = messages.length > 1 ? messages.slice(1) : messages

  return (
    <div className="flex gap-6 max-w-4xl mx-auto min-w-0">
      {/* Conversation column */}
      <div className="flex-1 min-w-0">
        <WaypointProgress progress={progress} visualState={visualState} />

        <div>
          {visibleMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="mb-10 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-aubergine-600" />
              <span className="text-body-sm text-ink-500">Understanding...</span>
            </div>
          )}
        </div>

        <div ref={scrollRef} />

        <div className="sticky bottom-0 pt-4 pb-2 bg-bone-50">
          <Composer
            onSend={onSend}
            disabled={isLoading}
            placeholder="Add something..."
          />
        </div>
      </div>

      {/* Context rail — desktop only */}
      {hasContext && (
        <aside className="hidden lg:block w-64 shrink-0 pt-4">
          <ContextPanel userContext={userContext} />
        </aside>
      )}
    </div>
  )
}

export default UnderstandingView
