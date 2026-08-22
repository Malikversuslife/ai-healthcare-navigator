import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Full-bleed photography */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle overlay for text contrast — not opaque, photograph remains visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-ink-900/20" />
      </div>

      {/* Content — integrated composition, not stacked */}
      <div className="relative z-10 flex-1 flex flex-col section-container pt-28 sm:pt-32 pb-16">
        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
          {/* Left: Headline + CTA */}
          <div className="flex-1 max-w-2xl">
            <h1 className="font-display text-hero text-bone-100 mb-6 text-balance leading-[0.95]">
              Know where<br />
              <span className="italic text-aubergine-300">to go next.</span>
            </h1>
            <p className="text-body-lg text-soft-stone-300 max-w-md mb-10 leading-relaxed">
              When you're unsure what kind of care you need, Hanya helps you understand your options and find the right next step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/navigator"
                className="inline-flex items-center justify-center bg-aubergine-600 text-white px-8 py-4 rounded-full text-body font-medium hover:bg-aubergine-700 transition-colors"
              >
                Start with Hanya
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center text-soft-stone-300 hover:text-bone-100 px-8 py-4 text-body font-medium transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right: Floating product composition — conversation UI + context chips */}
          <div className="flex-1 hidden lg:flex flex-col items-end gap-4 w-full max-w-lg">
            {/* Context chips — extremely restrained */}
            <div className="flex gap-3 mb-2">
              <div className="bg-ink-900/60 backdrop-blur-sm border border-soft-stone-100/10 rounded-full px-4 py-1.5 text-caption text-soft-stone-300">
                <span className="text-aubergine-300 font-medium">ONGOING</span> · Since yesterday
              </div>
              <div className="bg-ink-900/60 backdrop-blur-sm border border-soft-stone-100/10 rounded-full px-4 py-1.5 text-caption text-soft-stone-300">
                <span className="text-aubergine-300 font-medium">LOCATION</span> · Lekki, Lagos
              </div>
            </div>

            {/* Main product object — conversation interface */}
            <div className="bg-ink-900/70 backdrop-blur-md border border-soft-stone-100/10 rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-5 space-y-3">
                {/* Assistant message */}
                <div className="flex justify-start">
                  <div className="bg-bone-100/10 backdrop-blur-sm text-bone-100 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-body-sm leading-relaxed">Hello. I'm Hanya, your healthcare navigator. What brings you here today?</p>
                  </div>
                </div>
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-aubergine-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-body-sm leading-relaxed">I've had a sharp pain in my left eye since yesterday.</p>
                  </div>
                </div>
                {/* Assistant follow-up */}
                <div className="flex justify-start">
                  <div className="bg-bone-100/10 backdrop-blur-sm text-bone-100 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-body-sm leading-relaxed">I'm sorry you're dealing with that. Let me understand a little more.</p>
                  </div>
                </div>
                {/* Typing indicator */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-aubergine-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-aubergine-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-aubergine-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bone-100 to-transparent" />
    </section>
  )
}
