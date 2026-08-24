import { Message } from '../../../shared/types'

interface MessageItemProps {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div className="mb-10">
      <p className={`text-caption uppercase tracking-wide mb-1.5 ${
        isUser ? 'text-ink-500' : 'text-aubergine-600'
      }`}>
        {isUser ? 'You' : (
          <span className="flex items-center gap-1.5">
            Hanya
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-aubergine-600" />
          </span>
        )}
      </p>

      {isUser ? (
        <div className="bg-soft-stone-100 rounded-2xl rounded-br-md px-5 py-3 text-body text-ink-900 leading-relaxed max-w-[85%]">
          {message.content}
        </div>
      ) : (
        <div className="text-body text-ink-800 leading-relaxed">
          {message.content}
        </div>
      )}
    </div>
  )
}

export default MessageItem
