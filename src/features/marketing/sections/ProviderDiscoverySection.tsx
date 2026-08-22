import ProviderDemo from '../components/ProviderDemo'

export default function ProviderDiscoverySection() {
  return (
    <section id="find-care" className="bg-bone-100 py-section-lg">
      <div className="section-container">
        {/* Text */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <h2 className="font-display text-display-xl text-ink-900 mb-6 text-balance">
            Find care<br />
            <span className="italic text-aubergine-600">that fits.</span>
          </h2>
          <p className="text-body-lg text-ink-500 max-w-xl leading-relaxed">
            When a provider visit is appropriate, Hanya helps you find options that match your location, specialty need, and insurance.
          </p>
        </div>

        {/* Oversized product demo */}
        <div className="max-w-3xl">
          <ProviderDemo />
        </div>
      </div>
    </section>
  )
}
