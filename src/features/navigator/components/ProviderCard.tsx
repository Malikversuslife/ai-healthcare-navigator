import { Provider, CoverageStatus } from '../../../shared/types'
import { formatCurrency } from '../../../shared/utils'
import { Card, CardContent } from '../../../shared/components/Card'

interface ProviderCardProps {
  provider: Provider
  coverageStatus?: CoverageStatus
  onSelect?: (provider: Provider) => void
}

function ProviderCard({ provider, coverageStatus, onSelect }: ProviderCardProps) {
  const availabilityColors = {
    available: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-gray-100 text-gray-600',
  }

  const coverageColors: Record<CoverageStatus, string> = {
    covered: 'bg-green-100 text-green-800',
    'not-covered': 'bg-red-100 text-red-800',
    'requires-authorization': 'bg-yellow-100 text-yellow-800',
    unknown: 'bg-gray-100 text-gray-600',
  }

  const coverageLabels: Record<CoverageStatus, string> = {
    covered: 'Covered',
    'not-covered': 'Not Covered',
    'requires-authorization': 'Requires Authorization',
    unknown: 'Coverage Unknown',
  }

  return (
    <div className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect?.(provider)}><Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{provider.name}</h4>
            <p className="text-sm text-gray-600">{provider.specialty}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${availabilityColors[provider.availability]}`}>
            {provider.availability === 'available' ? 'Available' :
             provider.availability === 'limited' ? 'Limited' : 'Unavailable'}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          📍 {provider.location.area}, {provider.location.city}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            ⭐ {provider.rating}
          </span>
          <span className="text-gray-600">
            {formatCurrency(provider.consultationFee)}
          </span>
        </div>

        {coverageStatus && (
          <div className="mt-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${coverageColors[coverageStatus]}`}>
              {coverageLabels[coverageStatus]}
            </span>
          </div>
        )}

        {provider.acceptedInsurance.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Accepted insurance: {provider.acceptedInsurance.length} plans
          </p>
        )}
      </CardContent>
    </Card></div>
  )
}

export default ProviderCard
