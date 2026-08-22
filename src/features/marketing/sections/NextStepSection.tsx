import RecommendationDemo from '../components/RecommendationDemo'

export default function NextStepSection() {
  return (
    <section className="bg-soft-stone-50 py-section-lg">
      <div className="section-container">
        {/* Text */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <h2 className="font-display text-display-xl text-ink-900 mb-6 text-balance">
            Understand what<br />
            <span className="italic text-aubergine-600">to do next.</span>
          </h2>
          <p className="text-body-lg text-ink-500 max-w-xl leading-relaxed">
            Hanya navigates. It does not diagnose. It helps you understand the most appropriate next step based on what you share.
          </p>
        </div>

        {/* Oversized product demo */}
        <div className="max-w-3xl">
          <RecommendationDemo />
        </div>
      </div>
    </section>
  )
}
