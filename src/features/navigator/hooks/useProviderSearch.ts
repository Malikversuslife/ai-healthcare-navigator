import { Provider } from '../../../shared/types'
import providersData from '../data/mock-providers.json'

interface ProviderFilter {
  specialty?: string
  city?: string
  area?: string
  insurance?: string
}

export function searchProviders(filter: ProviderFilter): Provider[] {
  let results = [...providersData] as Provider[]

  // Filter by city
  if (filter.city) {
    const cityLower = filter.city.toLowerCase()
    results = results.filter(p =>
      p.location.city.toLowerCase().includes(cityLower)
    )
  }

  // Filter by area
  if (filter.area) {
    const areaLower = filter.area.toLowerCase()
    results = results.filter(p =>
      p.location.area.toLowerCase().includes(areaLower)
    )
  }

  // Filter by insurance
  if (filter.insurance) {
    results = results.filter(p =>
      p.acceptedInsurance.includes(filter.insurance!)
    )
  }

  // Filter by specialty (if care level maps to a specialty)
  if (filter.specialty) {
    const specialtyLower = filter.specialty.toLowerCase()
    results = results.filter(p =>
      p.specialty.toLowerCase().includes(specialtyLower)
    )
  }

  // Sort by rating
  results.sort((a, b) => b.rating - a.rating)

  return results
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
      details: `This provider accepts your insurance plan.`,
      estimatedCost: Math.round(provider.consultationFee * 0.1), // 10% co-pay
    }
  }

  return {
    covered: false,
    details: `This provider does not accept your insurance plan. You may need to pay the full consultation fee.`,
    estimatedCost: provider.consultationFee,
  }
}
