import { Message } from '../../../shared/types'
import { formatTime } from '../../../shared/utils'

interface MessageBubbleProps {
  message: Message
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-primary-200' : 'text-gray-500'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}

export default MessageBubble
