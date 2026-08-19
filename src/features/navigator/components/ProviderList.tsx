import { Provider, CoverageStatus } from '../../../shared/types'
import ProviderCard from './ProviderCard'
import { checkCoverage } from '../hooks/useProviderSearch'

interface ProviderListProps {
  providers: Provider[]
  selectedInsurance?: string | null
  onSelectProvider?: (provider: Provider) => void
}

function ProviderList({ providers, selectedInsurance, onSelectProvider }: ProviderListProps) {
  if (providers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No providers found matching your criteria.</p>
        <p className="text-sm text-gray-500 mt-2">Try adjusting your location or insurance selection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Available Providers ({providers.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {providers.map(provider => {
          let coverageStatus: CoverageStatus | undefined
          if (selectedInsurance) {
            const coverage = checkCoverage(provider.id, selectedInsurance)
            coverageStatus = coverage?.covered ? 'covered' : 'not-covered'
          }

          return (
            <ProviderCard
              key={provider.id}
              provider={provider}
              coverageStatus={coverageStatus}
              onSelect={onSelectProvider}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ProviderList
