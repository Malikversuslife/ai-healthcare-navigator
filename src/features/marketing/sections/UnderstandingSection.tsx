import { MockConversationScript, useMockConversation } from '../hooks/useMockConversation'

const UNDERSTANDING_SCRIPT: MockConversationScript = {
  loopDuration: 11200,
  fadeAt: 10100,
  typingAt: 7600,
  turns: [
    { speaker: 'assistant', text: 'What can I help you figure out today?', revealAt: 500 },
    { speaker: 'user', text: 'I\'ve had headaches on and off for three days.', revealAt: 1900 },
    { speaker: 'assistant', text: 'Have they been getting worse, or staying about the same?', revealAt: 3500 },
    { speaker: 'user', text: 'About the same.', revealAt: 5200 },
    { speaker: 'assistant', text: 'Okay. Let me organize what you\'ve shared.', revealAt: 6700 },
  ],
  context: [
    { label: 'Concern', value: 'Headaches', revealAt: 2300 },
    { label: 'Duration', value: 'Three days', revealAt: 2800 },
    { label: 'Trend', value: 'Stable', revealAt: 5600 },
  ],
}

export default function UnderstandingSection() {
  const conversation = useMockConversation(UNDERSTANDING_SCRIPT)

  return (
    <section id="how-it-works" className="bg-soft-stone-50 py-section-lg overflow-hidden">
      <div className="section-container">
        {/* Text */}
        <div className="max-w-3xl mb-12 lg:mb-20">
          <h2 className="font-display text-display-xl text-ink-900 mb-6 text-balance">
            Just tell Hanya<br />
            <span className="italic text-aubergine-600">what's going on.</span>
          </h2>
          <p className="text-body-lg text-ink-500 max-w-xl leading-relaxed">
            Start naturally. Hanya gathers the context it needs without making you figure out the healthcare system first.
          </p>
        </div>

        {/* Large left/right composition — 60-75% width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
          {/* Left: Large conversation interface */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-soft-stone-100 shadow-sm overflow-hidden">
              <div className={`p-6 sm:p-8 ${conversation.isFading ? 'mock-conversation-fading' : ''}`} aria-hidden="true">
                <div className="min-h-[332px] space-y-4">
                  {conversation.visibleTurns.map((turn) => (
                    <div key={`${turn.revealAt}-${turn.text}`} className={`mock-turn flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] rounded-2xl px-5 py-3 ${turn.speaker === 'user' ? 'bg-aubergine-600 text-white rounded-br-md' : 'bg-bone-100 text-ink-900 rounded-bl-md'}`}>
                        <p className="text-body-sm leading-relaxed">{turn.text}</p>
                      </div>
                    </div>
                  ))}
                  {conversation.isTyping && (
                    <div className="mock-turn flex items-center gap-2 pt-1" aria-hidden="true">
                      <span className="mock-typing-dot w-1.5 h-1.5 rounded-full bg-aubergine-500" />
                      <span className="mock-typing-dot w-1.5 h-1.5 rounded-full bg-aubergine-500" />
                      <span className="mock-typing-dot w-1.5 h-1.5 rounded-full bg-aubergine-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Subtle waypoint connection — desktop only */}
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
            <svg width="2" height="200" viewBox="0 0 2 200" fill="none" className="opacity-30">
              <line x1="1" y1="0" x2="1" y2="200" stroke="#5A2D5F" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Right: Structured understanding panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-soft-stone-100 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <p className="text-caption text-ink-400 uppercase tracking-wider mb-5 font-medium">
                  Structured understanding
                </p>
                <div className={`min-h-[224px] space-y-3 ${conversation.isFading ? 'mock-conversation-fading' : ''}`} aria-hidden="true">
                  {conversation.visibleContext.length === 0 && (
                    <p className="text-body-sm text-ink-400">Listening for useful context...</p>
                  )}
                  {conversation.visibleContext.map((item) => (
                    <div key={item.label} className="mock-context-item flex items-start gap-3 bg-bone-50 rounded-xl p-4">
                      <span className="text-aubergine-400 text-body mt-0.5">•</span>
                      <div>
                        <p className="text-caption text-ink-400">{item.label}</p>
                        <p className="text-body-sm font-medium text-ink-900 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
