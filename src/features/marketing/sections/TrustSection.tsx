const PRINCIPLES = [
  {
    title: 'Organizes what you report',
    description: 'Hanya structures the information you share into a clear picture of your situation.',
  },
  {
    title: 'Emergency-aware',
    description: 'Recognizes predefined safety patterns and escalates immediately when appropriate.',
  },
  {
    title: 'Recommends pathways',
    description: 'Suggests the most appropriate care pathway — not diagnoses, not prescriptions.',
  },
  {
    title: 'Helps you find providers',
    description: 'Connects you with healthcare options that match your needs and location.',
  },
  {
    title: 'Privacy-aware prototype',
    description: 'The Navigator does not require an account; OpenAI mode processes relevant context through Hanya\'s server.',
  },
  {
    title: 'Transparent',
    description: 'Hanya explains why it suggests a particular next step. No black boxes.',
  },
]

export default function TrustSection() {
  return (
    <section id="safety" className="bg-bone-100 py-section-lg">
      <div className="section-narrow">
        <h2 className="font-display text-display-xl text-ink-900 mb-16 text-balance">
          Guidance you<br />
          <span className="italic text-aubergine-600">can trust.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <h3 className="text-body font-semibold text-ink-900 mb-2">{p.title}</h3>
              <p className="text-body-sm text-ink-500 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
