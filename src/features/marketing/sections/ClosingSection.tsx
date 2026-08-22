import { Link } from 'react-router-dom'

export default function ClosingSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed photography placeholder — echoes hero but different composition */}
      {/* Required: Different angle/setting than hero. Perhaps a person walking outdoors, */}
      {/* warm afternoon light, or someone in a market with a phone. Quiet, purposeful. */}
      <div className="absolute inset-0 bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-tl from-ink-900 via-aubergine-900 to-ink-900 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(90,45,95,0.25),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-5">
        <h2 className="font-display text-display-xl text-bone-100 mb-6 text-balance">
          You don't have<br />
          <span className="italic text-aubergine-300">to figure it out alone.</span>
        </h2>
        <p className="text-body-lg text-soft-stone-300 mb-10">
          Know where to go next.
        </p>
        <Link
          to="/navigator"
          className="inline-flex items-center justify-center bg-aubergine-600 text-white px-10 py-4 rounded-full text-body font-medium hover:bg-aubergine-700 transition-colors"
        >
          Start with Hanya
        </Link>
      </div>

      {/* Top gradient from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-bone-100 to-transparent" />
    </section>
  )
}
