import ProductMockup from './ProductMockup'

export default function RecommendationDemo({ className = '' }: { className?: string }) {
  return (
    <ProductMockup className={className} label="Next step">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-caption text-ink-400 uppercase tracking-wider mb-2 font-medium">
            Recommended next step
          </p>
          <h3 className="text-xl sm:text-2xl font-display text-ink-900">
            Speak with a healthcare professional.
          </h3>
        </div>

        {/* Reasoning */}
        <p className="text-body text-ink-600 leading-relaxed mb-8 max-w-lg">
          Based on what you've described, getting evaluated by an appropriate clinician would be a reasonable next step. An eye specialist can properly examine your eye and determine the cause.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-aubergine-600 text-white rounded-xl px-6 py-3.5 text-body-sm font-medium text-center">
            Find care near me
          </div>
          <div className="flex-1 bg-bone-100 text-ink-700 rounded-xl px-6 py-3.5 text-body-sm font-medium text-center border border-soft-stone-200">
            See why
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-caption text-ink-400 mt-6 leading-relaxed">
          Hanya navigates — it does not diagnose. This is guidance, not medical advice.
        </p>
      </div>
    </ProductMockup>
  )
}
