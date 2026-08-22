import ConversationDemo from '../components/ConversationDemo'

export default function UnderstandingSection() {
  return (
    <section id="how-it-works" className="bg-bone-100 py-section-lg">
      <div className="section-container">
        {/* Text */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <h2 className="font-display text-display-xl text-ink-900 mb-6 text-balance">
            Just tell Hanya<br />
            <span className="italic text-aubergine-600">what's going on.</span>
          </h2>
          <p className="text-body-lg text-ink-500 max-w-xl leading-relaxed">
            Start naturally. Hanya gathers the context it needs without making you figure out the healthcare system first.
          </p>
        </div>

        {/* Oversized product demo */}
        <div className="max-w-3xl">
          <ConversationDemo />
        </div>
      </div>
    </section>
  )
}
