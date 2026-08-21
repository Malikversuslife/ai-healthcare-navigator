import { Provider, ProviderMatch, ProviderSearchContext } from '../../../shared/types'
import providersData from '../data/mock-providers.json'
import { rankProviders } from '../engine/provider-matching'

export function searchProviders(context: ProviderSearchContext): ProviderMatch[] {
  return rankProviders(providersData as Provider[], context)
}

export function getProviderById(id: string): Provider | undefined {
  return providersData.find(p => p.id === id) as Provider | undefined
}

export function checkCoverage(
  providerId: string,
  insuranceId: string
): { covered: boolean; details: string; estimatedCost: number } | null {
  const provider = getProviderById(providerId)
  if (!provider) return null

  const isAccepted = provider.acceptedInsurance.includes(insuranceId)
  if (isAccepted) {
    return {
      covered: true,
      details: `This provider is listed as accepting your selected insurance plan.`,
      estimatedCost: Math.round(provider.consultationFee * 0.1),
    }
  }

  return {
    covered: false,
    details: `This provider does not list your selected insurance plan. You may need to pay the full consultation fee.`,
    estimatedCost: provider.consultationFee,
  }
}
