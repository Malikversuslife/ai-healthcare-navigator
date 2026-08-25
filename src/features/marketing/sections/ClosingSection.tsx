import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

export default function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef)

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Full-bleed photography — West African route/path, intentional crop */}
      <div className="absolute inset-0">
        <img
          src="/images/closing.jpg"
          alt=""
          className="w-full h-full object-cover object-[center_40%] sm:object-center photo-warm"
        />
        {/* Overlay for text contrast — warm evening feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/30 to-ink-900/20" />
      </div>

      {/* Content */}
      <div className={`marketing-reveal ${isInView ? 'is-visible' : ''} relative z-10 text-center px-5`}>
        <h2 className="font-display text-display-xl text-bone-100 mb-6 text-balance">
          You don't have<br />
          <span className="italic text-aubergine-300">to figure it out alone.</span>
        </h2>
        <p className="text-body-lg text-soft-stone-200 mb-10">
          Know where to go next.
        </p>
        <Link
          to="/navigator"
          className="marketing-tactile inline-flex min-h-11 items-center justify-center bg-aubergine-600 text-white px-10 py-4 rounded-full text-body font-medium hover:bg-aubergine-700 transition-colors"
        >
          Start with Hanya
        </Link>
      </div>

      {/* Top gradient from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-bone-100 to-transparent" />
    </section>
  )
}
