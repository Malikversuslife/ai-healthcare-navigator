import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

export default function ProviderDiscoverySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef)

  return (
    <section ref={sectionRef} id="find-care" className="bg-soft-stone-50 py-section-lg overflow-hidden">
      <div className="section-container">
        {/* Text */}
        <div className={`marketing-reveal ${isInView ? 'is-visible' : ''} max-w-3xl mb-12 lg:mb-16`}>
          <h2 className="font-display text-display-xl text-ink-900 mb-6 text-balance">
            Find care<br />
            <span className="italic text-aubergine-600">that fits.</span>
          </h2>
          <p className="text-body-lg text-ink-500 max-w-xl leading-relaxed">
            When a provider visit is appropriate, Hanya helps you find options that match your location, specialty need, and insurance.
          </p>
        </div>

        {/* Oversized provider discovery interface — extends beyond standard container */}
        <div className={`marketing-reveal reveal-delay-1 ${isInView ? 'is-visible' : ''} bg-white rounded-2xl sm:rounded-3xl border border-soft-stone-100 shadow-sm overflow-hidden`}>
          {/* Search/context bar */}
          <div className="border-b border-soft-stone-100 px-8 py-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-bone-50 rounded-full px-4 py-2">
              <span className="text-caption text-ink-400">Specialty</span>
              <span className="text-body-sm font-medium text-ink-900">Ophthalmology</span>
            </div>
            <div className="flex items-center gap-2 bg-bone-50 rounded-full px-4 py-2">
              <span className="text-caption text-ink-400">Location</span>
              <span className="text-body-sm font-medium text-ink-900">Lekki, Lagos</span>
            </div>
            <div className="flex items-center gap-2 bg-bone-50 rounded-full px-4 py-2">
              <span className="text-caption text-ink-400">Insurance</span>
              <span className="text-body-sm font-medium text-ink-900">NHIS</span>
            </div>
          </div>

          {/* Results header */}
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-ink-900">Matches for your search</p>
              <p className="text-body-sm text-ink-500 mt-0.5">3 providers match your criteria</p>
            </div>
          </div>

          {/* Provider results — oversized, detailed */}
          <div className="px-8 pb-8 space-y-4">
            {/* Provider 1 */}
            <div className={`marketing-provider-card marketing-reveal reveal-delay-2 ${isInView ? 'is-visible' : ''} bg-bone-50 rounded-2xl p-6 border border-soft-stone-100`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-lg font-medium text-ink-900">Dr. Amara Okafor</p>
                  <p className="text-body-sm text-ink-500">Ophthalmology · Eye Clinic</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-teal-600">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Available today
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-ink-600 mb-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Lekki, Lagos
                </span>
                <span>2.4 km away</span>
                <span>★ 4.8</span>
                <span>From ₦15,000</span>
              </div>

              <div className="marketing-match-reasons flex flex-wrap gap-2">
                {['Specialty match', 'In Lekki', 'Accepts your insurance'].map((reason) => (
                  <span
                    key={reason}
                    className="inline-block px-3 py-1 bg-aubergine-50 text-aubergine-600 text-caption rounded-full font-medium"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {/* Provider 2 */}
            <div className={`marketing-provider-card marketing-reveal reveal-delay-3 ${isInView ? 'is-visible' : ''} bg-bone-50 rounded-2xl p-6 border border-soft-stone-100`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-lg font-medium text-ink-900">ClearView Eye Centre</p>
                  <p className="text-body-sm text-ink-500">Ophthalmology · Specialist Clinic</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-teal-600">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Available today
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-ink-600 mb-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Victoria Island, Lagos
                </span>
                <span>5.1 km away</span>
                <span>★ 4.6</span>
                <span>From ₦12,000</span>
              </div>

              <div className="marketing-match-reasons flex flex-wrap gap-2">
                {['Specialty match', 'Competitive pricing'].map((reason) => (
                  <span
                    key={reason}
                    className="inline-block px-3 py-1 bg-aubergine-50 text-aubergine-600 text-caption rounded-full font-medium"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {/* Provider 3 */}
            <div className={`marketing-provider-card marketing-reveal reveal-delay-4 ${isInView ? 'is-visible' : ''} bg-bone-50 rounded-2xl p-6 border border-soft-stone-100`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-lg font-medium text-ink-900">Lagos University Teaching Hospital</p>
                  <p className="text-body-sm text-ink-500">Ophthalmology · Teaching Hospital</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ink-500">
                  <span className="w-2 h-2 rounded-full bg-ink-300" />
                  Next available: Tomorrow
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-ink-600 mb-4">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Surulere, Lagos
                </span>
                <span>8.3 km away</span>
                <span>★ 4.4</span>
                <span>From ₦8,000</span>
              </div>

              <div className="marketing-match-reasons flex flex-wrap gap-2">
                {['Specialty match', 'Teaching hospital', 'Accepts your insurance'].map((reason) => (
                  <span
                    key={reason}
                    className="inline-block px-3 py-1 bg-aubergine-50 text-aubergine-600 text-caption rounded-full font-medium"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
