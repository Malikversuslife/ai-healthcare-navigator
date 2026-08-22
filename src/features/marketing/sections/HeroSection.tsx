import { Link } from 'react-router-dom'
import ConversationDemo from '../components/ConversationDemo'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background — full-bleed editorial photo placeholder */}
      <div className="absolute inset-0 bg-ink-900">
        {/* Photography placeholder: contemporary Nigerian living room, warm natural light */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-aubergine-900 to-ink-900 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(90,45,95,0.3),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col section-container pt-28 sm:pt-32 pb-12">
        {/* Headline area */}
        <div className="flex-1 flex flex-col justify-center max-w-5xl">
          <h1 className="font-display text-hero text-bone-100 mb-6 text-balance">
            Know where<br />
            <span className="italic text-aubergine-300">to go next.</span>
          </h1>
          <p className="text-body-lg text-soft-stone-300 max-w-xl mb-10 leading-relaxed">
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

        {/* Product mockup — oversized, editorial */}
        <div className="mt-12 lg:mt-16 max-w-2xl lg:max-w-3xl">
          <ConversationDemo />
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bone-100 to-transparent" />
    </section>
  )
}
