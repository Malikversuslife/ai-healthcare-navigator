import PathwayGraphic from '../components/PathwayGraphic'

const QUESTIONS = [
  'Can this wait until tomorrow?',
  'Do I need a specialist?',
  'Where can I go nearby?',
  'Does this provider accept my insurance?',
  'What kind of doctor do I need?',
]

export default function ProblemSection() {
  return (
    <section className="bg-bone-100 py-section-lg">
      <div className="section-narrow text-center">
        <h2 className="font-display text-display-xl text-ink-900 mb-8 text-balance">
          Care isn't<br />
          <span className="italic text-aubergine-600">always obvious.</span>
        </h2>

        {/* Questions — editorial, not cards */}
        <div className="max-w-2xl mx-auto mb-12">
          {QUESTIONS.map((q, i) => (
            <p
              key={i}
              className="text-body-lg text-ink-500 py-3 border-b border-soft-stone-100 last:border-0"
            >
              {q}
            </p>
          ))}
        </div>

        {/* Subtle pathway graphic */}
        <div className="flex justify-center">
          <PathwayGraphic className="w-full max-w-md" activeSteps={0} />
        </div>
      </div>
    </section>
  )
}
