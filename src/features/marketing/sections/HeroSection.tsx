import { Link } from 'react-router-dom'
import MockConversation from '../components/MockConversation'
import { MockConversationScript } from '../hooks/useMockConversation'

const HERO_SCRIPT: MockConversationScript = {
  loopDuration: 12000,
  fadeAt: 10800,
  typingAt: 8200,
  turns: [
    { speaker: 'assistant', text: 'Hi. I\'m Hanya, your healthcare navigator. What\'s going on?', revealAt: 600 },
    { speaker: 'user', text: 'I\'ve had a sharp pain in my left eye since yesterday.', revealAt: 2200 },
    { speaker: 'assistant', text: 'Has your vision changed, or is the pain getting worse?', revealAt: 3900 },
    { speaker: 'user', text: 'No vision changes. It just hasn\'t gone away.', revealAt: 5600 },
    { speaker: 'assistant', text: 'Got it. I\'ll help you understand the next step.', revealAt: 7200 },
  ],
  context: [
    { label: 'Concern', value: 'Left eye pain', revealAt: 2600 },
    { label: 'Duration', value: 'Since yesterday', revealAt: 3200 },
    { label: 'Trend', value: 'Ongoing', revealAt: 6400 },
  ],
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[105vh] lg:min-h-[110vh] flex flex-col overflow-hidden">
      {/* Full-bleed photography — intentional crop for mobile */}
      <div className="absolute inset-0">
        <img
          src="/images/hero.jpg"
          alt=""
          className="w-full h-full object-cover object-[center_30%] sm:object-center photo-warm"
        />
        {/* Subtle overlay for text contrast — photograph remains visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/75 via-ink-900/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-ink-900/10" />
      </div>

      {/* Content — integrated composition */}
      <div className="relative z-10 flex-1 flex flex-col section-container pt-32 sm:pt-36 lg:pt-40 pb-20 lg:pb-24">
        <div className="flex-1 flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-20">
          {/* Left: Headline + CTA — slightly reduced headline scale */}
          <div className="flex-1 max-w-2xl">
            <h1 className="font-display text-hero text-bone-100 mb-8 text-balance leading-[0.95]">
              Know where<br />
              <span className="italic text-aubergine-300">to go next.</span>
            </h1>
            <p className="text-body-lg text-soft-stone-300 max-w-md mb-12 leading-relaxed">
              When you're unsure what kind of care you need, Hanya helps you understand your options and find the right next step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/navigator"
                className="inline-flex min-h-11 items-center justify-center bg-aubergine-600 text-white px-8 py-4 rounded-full text-body font-medium hover:bg-aubergine-700 transition-colors"
              >
                Start with Hanya
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-11 items-center justify-center text-soft-stone-300 hover:text-bone-100 px-8 py-4 text-body font-medium transition-colors"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right: Floating product composition — conversation UI + context chips */}
          <div className="hero-conversation flex-1 hidden lg:flex flex-col items-end gap-5 w-full max-w-lg">
            <MockConversation
              script={HERO_SCRIPT}
              variant="dark"
              className="w-full flex flex-col items-end gap-5"
              contextClassName="min-h-[32px] flex flex-wrap justify-end gap-3 mb-2"
              messageClassName="hero-product-preview bg-ink-900/70 backdrop-blur-md border border-soft-stone-100/10 rounded-2xl w-full max-w-md min-h-[326px] shadow-2xl p-5 space-y-3"
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bone-100 to-transparent" />
    </section>
  )
}
