import ProductMockup from './ProductMockup'

const MESSAGES = [
  {
    role: 'assistant' as const,
    content: 'Hello. I\'m Hanya, your healthcare navigator. What brings you here today?',
  },
  {
    role: 'user' as const,
    content: 'I\'ve had a sharp pain in my left eye since yesterday.',
  },
  {
    role: 'assistant' as const,
    content: 'I\'m sorry you\'re dealing with that. Let me understand a little more.',
  },
]

const STRUCTURED_CONTEXT = {
  concern: 'Left eye pain',
  duration: 'Since yesterday',
  trend: 'Ongoing',
  symptoms: 'No vision loss reported',
}

export default function ConversationDemo({ className = '' }: { className?: string }) {
  return (
    <ProductMockup className={className} label="Understanding">
      <div className="p-6 sm:p-8">
        {/* Messages */}
        <div className="space-y-4 mb-6">
          {MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-aubergine-600 text-white rounded-br-md'
                    : 'bg-bone-100 text-ink-900 rounded-bl-md'
                }`}
              >
                <p className="text-body-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Structured context extraction */}
        <div className="border-t border-soft-stone-100 pt-6">
          <p className="text-caption text-ink-400 uppercase tracking-wider mb-3 font-medium">
            Structured understanding
          </p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(STRUCTURED_CONTEXT).map(([key, value]) => (
              <div key={key} className="bg-bone-50 rounded-xl p-3">
                <p className="text-caption text-ink-400 capitalize">{key}</p>
                <p className="text-body-sm font-medium text-ink-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next question indicator */}
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-aubergine-400 animate-pulse" />
          <p className="text-body-sm text-ink-500 italic">Hanya asks about symptoms...</p>
        </div>
      </div>
    </ProductMockup>
  )
}
