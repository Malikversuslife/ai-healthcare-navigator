import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

export default function NextStepSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef)

  return (
    <section ref={sectionRef} className="bg-bone-100 py-section-lg overflow-hidden">
      <div className="section-container">
        {/* Reversed composition: product on left, text on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Oversized recommendation interface */}
          <div className={`marketing-reveal ${isInView ? 'is-visible' : ''} lg:col-span-7 order-2 lg:order-1`}>
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-soft-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 sm:p-10">
                {/* Header */}
                <p className="text-caption text-ink-400 uppercase tracking-wider mb-3 font-medium">
                  Recommended next step
                </p>
                <h3 className={`marketing-reveal reveal-delay-1 ${isInView ? 'is-visible' : ''} text-2xl sm:text-3xl font-display text-ink-900 mb-4 leading-tight`}>
                  Speak with a healthcare professional.
                </h3>

                {/* Reasoning */}
                <p className={`marketing-reveal reveal-delay-2 ${isInView ? 'is-visible' : ''} text-body text-ink-600 leading-relaxed mb-8 max-w-lg`}>
                  Based on what you've described, getting evaluated by an appropriate clinician would be a reasonable next step. An eye specialist can properly examine your eye and determine the cause.
                </p>

                {/* Actions */}
                <div className={`marketing-reveal reveal-delay-3 ${isInView ? 'is-visible' : ''} flex flex-col sm:flex-row gap-3`}>
                  <div className="marketing-tactile flex-1 bg-aubergine-600 text-white rounded-xl px-6 py-4 text-body-sm font-medium text-center cursor-pointer hover:bg-aubergine-700 transition-colors">
                    Find care near me
                  </div>
                  <div className="marketing-tactile flex-1 bg-bone-50 text-ink-700 rounded-xl px-6 py-4 text-body-sm font-medium text-center border border-soft-stone-200 cursor-pointer hover:bg-soft-stone-100 transition-colors">
                    See why
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-caption text-ink-400 mt-8 leading-relaxed">
                  Hanya navigates — it does not diagnose. This is guidance, not medical advice.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div className={`marketing-reveal reveal-delay-1 ${isInView ? 'is-visible' : ''} lg:col-span-5 order-1 lg:order-2`}>
            <h2 className="font-display text-display-xl text-ink-900 mb-6 text-balance">
              Understand what<br />
              <span className="italic text-aubergine-600">to do next.</span>
            </h2>
            <p className="text-body-lg text-ink-500 leading-relaxed">
              Hanya navigates. It does not diagnose. It helps you understand the most appropriate next step based on what you share.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
