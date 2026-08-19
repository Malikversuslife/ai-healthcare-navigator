import { Provider, CoverageStatus } from '../../../shared/types'
import { formatCurrency } from '../../../shared/utils'

interface ProviderCardProps {
  provider: Provider
  coverageStatus?: CoverageStatus
  onSelect?: (provider: Provider) => void
}

function ProviderCard({ provider, coverageStatus, onSelect }: ProviderCardProps) {
  const availabilityConfig = {
    available: { text: 'Available today', color: 'text-teal-600' },
    limited: { text: 'Limited availability', color: 'text-amber-600' },
    unavailable: { text: 'Currently unavailable', color: 'text-ink-400' },
  }

  const availability = availabilityConfig[provider.availability]

  const coverageConfig: Record<CoverageStatus, { text: string; color: string } | null> = {
    covered: { text: 'Covered by your insurance', color: 'text-teal-600' },
    'not-covered': { text: 'Not covered', color: 'text-red-600' },
    'requires-authorization': { text: 'Requires authorization', color: 'text-amber-600' },
    unknown: null,
  }

  const coverage = coverageStatus ? coverageConfig[coverageStatus] : null

  return (
    <div 
      className="bg-white rounded-xl border border-ink-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onSelect?.(provider)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-ink-900 text-base">{provider.name}</h4>
          <p className="text-sm text-ink-500 mt-0.5">{provider.specialty}</p>
        </div>
        <span className={`text-sm font-medium ${availability.color}`}>
          {availability.text}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-ink-600 mb-3">
        <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{provider.location.area}, {provider.location.city}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-ink-700">{provider.rating}</span>
          </div>
          <span className="text-sm text-ink-700">
            From {formatCurrency(provider.consultationFee)}
          </span>
        </div>

        <button className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
          View provider
        </button>
      </div>

      {coverage && (
        <div className="mt-3 pt-3 border-t border-ink-100">
          <span className={`text-xs font-medium ${coverage.color}`}>
            {coverage.text}
          </span>
        </div>
      )}
    </div>
  )
}

export default ProviderCard
