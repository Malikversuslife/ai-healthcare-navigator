export default function UnderstandingSection() {
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
              <div className="p-6 sm:p-8 space-y-4">
                {/* Assistant */}
                <div className="flex justify-start">
                  <div className="bg-bone-100 text-ink-900 rounded-2xl rounded-bl-md px-5 py-3 max-w-[90%]">
                    <p className="text-body-sm leading-relaxed">Hello. I'm Hanya, your healthcare navigator. What brings you here today?</p>
                  </div>
                </div>
                {/* User */}
                <div className="flex justify-end">
                  <div className="bg-aubergine-600 text-white rounded-2xl rounded-br-md px-5 py-3 max-w-[90%]">
                    <p className="text-body-sm leading-relaxed">I've had a sharp pain in my left eye since yesterday.</p>
                  </div>
                </div>
                {/* Assistant */}
                <div className="flex justify-start">
                  <div className="bg-bone-100 text-ink-900 rounded-2xl rounded-bl-md px-5 py-3 max-w-[90%]">
                    <p className="text-body-sm leading-relaxed">I'm sorry you're dealing with that. Let me understand a little more.</p>
                  </div>
                </div>
                {/* Typing */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-aubergine-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-aubergine-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-aubergine-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
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
                <div className="space-y-3">
                  {[
                    { label: 'Concern', value: 'Left eye pain', icon: '◉' },
                    { label: 'Duration', value: 'Since yesterday', icon: '◷' },
                    { label: 'Trend', value: 'Ongoing', icon: '↗' },
                    { label: 'Symptoms', value: 'No vision loss reported', icon: '—' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 bg-bone-50 rounded-xl p-4">
                      <span className="text-aubergine-400 text-body mt-0.5">{item.icon}</span>
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
