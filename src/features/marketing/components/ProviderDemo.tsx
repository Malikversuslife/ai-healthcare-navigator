import ProductMockup from './ProductMockup'

const MOCK_PROVIDERS = [
  {
    name: 'Dr. Amara Okafor',
    specialty: 'Ophthalmology',
    type: 'Eye Clinic',
    location: 'Lekki, Lagos',
    distance: '2.4 km',
    availability: 'Available today',
    availabilityColor: 'text-teal-600',
    fee: '₦15,000',
    rating: '4.8',
    reasons: ['Specialty match', 'In Lekki', 'Accepts your insurance'],
  },
  {
    name: 'ClearView Eye Centre',
    specialty: 'Ophthalmology',
    type: 'Specialist Clinic',
    location: 'Victoria Island, Lagos',
    distance: '5.1 km',
    availability: 'Available today',
    availabilityColor: 'text-teal-600',
    fee: '₦12,000',
    rating: '4.6',
    reasons: ['Specialty match', 'Competitive pricing'],
  },
]

export default function ProviderDemo({ className = '' }: { className?: string }) {
  return (
    <ProductMockup className={className} label="Find care">
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-body font-medium text-ink-900">Matches for your search</p>
          <p className="text-body-sm text-ink-500 mt-0.5">2 providers match your criteria</p>
        </div>

        <div className="space-y-4">
          {MOCK_PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="bg-bone-50 rounded-xl p-5 border border-soft-stone-100"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-body font-medium text-ink-900">{provider.name}</p>
                  <p className="text-body-sm text-ink-500">{provider.specialty} · {provider.type}</p>
                </div>
                <span className={`text-body-sm font-medium ${provider.availabilityColor}`}>
                  {provider.availability}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-body-sm text-ink-600 mb-3">
                <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{provider.location}</span>
                <span className="text-ink-400">({provider.distance})</span>
              </div>

              {/* Rating + Fee */}
              <div className="flex items-center gap-4 text-body-sm text-ink-600 mb-3">
                <span>★ {provider.rating}</span>
                <span>From {provider.fee}</span>
              </div>

              {/* Match reasons */}
              <div className="flex flex-wrap gap-1.5">
                {provider.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="inline-block px-2.5 py-0.5 bg-aubergine-50 text-aubergine-600 text-caption rounded-full font-medium"
                  >
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProductMockup>
  )
}
