import PathwayGraphic from '../components/PathwayGraphic'

export default function ProblemSection() {
  return (
    <section className="bg-bone-100 py-section-lg">
      <div className="section-narrow text-center">
        <h2 className="font-display text-display-xl text-ink-900 mb-20 text-balance">
          Care isn't<br />
          <span className="italic text-aubergine-600">always obvious.</span>
        </h2>

        {/* Questions — positional variation, not cards */}
        <div className="relative max-w-3xl mx-auto mb-16 h-64 sm:h-52">
          {/* Question 1 — left */}
          <p className="absolute top-0 left-0 text-body-lg text-ink-400 italic">
            Can this wait until tomorrow?
          </p>
          {/* Question 2 — right, slightly lower */}
          <p className="absolute top-12 right-0 text-body-lg text-ink-500 italic">
            Do I need a specialist?
          </p>
          {/* Question 3 — center, lower */}
          <p className="absolute top-24 left-1/2 -translate-x-1/2 text-body-lg text-ink-400 italic">
            Where can I go nearby?
          </p>
          {/* Question 4 — left, even lower */}
          <p className="absolute top-36 left-4 text-body-lg text-ink-300 italic">
            Does this provider accept my insurance?
          </p>
          {/* Question 5 — right, bottom */}
          <p className="absolute bottom-0 right-8 text-body-lg text-ink-500 italic">
            What kind of doctor do I need?
          </p>
        </div>

        {/* Waypoint path — introduces direction after uncertainty */}
        <div className="flex justify-center">
          <PathwayGraphic className="w-full max-w-md" activeSteps={0} />
        </div>
      </div>
    </section>
  )
}
