import { useRef } from 'react'
import PathwayGraphic from '../components/PathwayGraphic'
import { useInView } from '../hooks/useInView'

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef)

  return (
    <section ref={sectionRef} className="bg-bone-100 py-section-lg">
      <div className="section-narrow text-center">
        <h2 className={`marketing-reveal ${isInView ? 'is-visible' : ''} font-display text-display-xl text-ink-900 mb-20 text-balance`}>
          Care isn't<br />
          <span className="italic text-aubergine-600">always obvious.</span>
        </h2>

        {/* Questions — positional variation, not cards */}
        <div className="relative max-w-3xl mx-auto mb-16 h-64 sm:h-52">
          {/* Question 1 — left */}
          <p className={`marketing-question marketing-reveal ${isInView ? 'is-visible' : ''} absolute top-0 left-0 text-body-lg text-ink-400 italic`}>
            Can this wait until tomorrow?
          </p>
          {/* Question 2 — right, slightly lower */}
          <p className={`marketing-question marketing-reveal reveal-delay-1 ${isInView ? 'is-visible' : ''} absolute top-12 right-0 text-body-lg text-ink-500 italic`}>
            Do I need a specialist?
          </p>
          {/* Question 3 — center, lower */}
          <p className={`marketing-question marketing-reveal reveal-delay-2 ${isInView ? 'is-visible' : ''} absolute top-24 left-1/2 -translate-x-1/2 text-body-lg text-ink-400 italic`}>
            Where can I go nearby?
          </p>
          {/* Question 4 — left, even lower */}
          <p className={`marketing-question marketing-reveal reveal-delay-3 ${isInView ? 'is-visible' : ''} absolute top-36 left-4 text-body-lg text-ink-300 italic`}>
            Does this provider accept my insurance?
          </p>
          {/* Question 5 — right, bottom */}
          <p className={`marketing-question marketing-reveal reveal-delay-4 ${isInView ? 'is-visible' : ''} absolute bottom-0 right-8 text-body-lg text-ink-500 italic`}>
            What kind of doctor do I need?
          </p>
        </div>

        {/* Waypoint path — introduces direction after uncertainty */}
        <div className={`marketing-reveal reveal-delay-5 ${isInView ? 'is-visible' : ''} flex justify-center`}>
          <PathwayGraphic className="w-full max-w-md" activeSteps={0} />
        </div>
      </div>
    </section>
  )
}
