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
      <div className="text-center py-8 bg-white rounded-xl border border-ink-200">
        <p className="text-ink-600">No providers found matching your criteria.</p>
        <p className="text-sm text-ink-400 mt-2">Try adjusting your location or insurance selection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-ink-200 p-4">
        <h3 className="text-lg font-semibold text-ink-900 mb-1">
          Find care near you
        </h3>
        <p className="text-sm text-ink-500">
          Here's what we'd suggest based on your needs
        </p>
      </div>

      {/* Provider Cards */}
      <div className="space-y-3">
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
