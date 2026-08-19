import { CareRecommendation } from '../../../shared/types'
import { getCareLevelInfo } from '../data/care-levels'
import { Card, CardHeader, CardContent } from '../../../shared/components/Card'
import Button from '../../../shared/components/Button'

interface CareRecommendationProps {
  recommendation: CareRecommendation
  onFindProviders: () => void
}

function CareRecommendationCard({ recommendation, onFindProviders }: CareRecommendationProps) {
  const careLevelInfo = getCareLevelInfo(recommendation.careLevel)

  const careLevelColors = {
    'emergency-care': 'bg-red-100 text-red-800 border-red-200',
    'urgent-care': 'bg-orange-100 text-orange-800 border-orange-200',
    'same-day-care': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'routine-care': 'bg-green-100 text-green-800 border-green-200',
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Care Recommendation</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${careLevelColors[recommendation.careLevel]}`}>
            {careLevelInfo?.name}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{recommendation.reasoning}</p>

        {careLevelInfo && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Examples of conditions at this level:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {careLevelInfo.examples.map((example, i) => (
                <li key={i}>{example}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> {recommendation.disclaimer}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">Recommended next steps:</p>
          {recommendation.nextSteps.map((step: { label: string; description: string }, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary-600 mt-0.5">•</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{step.label}</p>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button onClick={onFindProviders} className="w-full">
            Find Healthcare Providers
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CareRecommendationCard
