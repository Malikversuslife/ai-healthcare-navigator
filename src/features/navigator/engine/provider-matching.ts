/**
 * Provider Matching & Ranking Engine
 *
 * This is NOT a medical provider recommendation engine.
 * It answers: "Which available providers match the user's stated navigation needs and preferences?"
 *
 * The score is an APPLICATION RANKING SCORE.
 * It is NOT: medical confidence, diagnostic confidence, clinical suitability, treatment quality score.
 *
 * All ranking is application-controlled. The LLM must NOT rank providers.
 */

import { Provider } from '../../../shared/types'
import { ProviderMatch, ProviderSearchContext, ProviderMatchReason } from '../../../shared/types'
import { isSpecialtyMatch } from './specialty-normalization'
import { calculateDistance } from '../../../shared/utils/distance'

// ---------------------------------------------------------------------------
// Ranking weights — documented, transparent, deterministic
// ---------------------------------------------------------------------------

const WEIGHTS = {
  specialtyMatch: 30,
  providerTypeMatch: 15,
  cityMatch: 15,
  areaMatch: 10,
  insuranceMatch: 12,
  availability: 8,
  distance: 5,
  rating: 3,
  cost: 2,
} as const

const MAX_DISTANCE_KM = 100
const MAX_CONSULTATION_FEE = 50000

// ---------------------------------------------------------------------------
// Candidate retrieval — basic filtering before scoring
// ---------------------------------------------------------------------------

function retrieveCandidates(
  providers: Provider[],
  context: ProviderSearchContext
): Provider[] {
  let candidates = [...providers]

  // City filter: if city is specified, only providers in that city (or telehealth)
  if (context.city) {
    const cityLower = context.city.toLowerCase()
    candidates = candidates.filter(p =>
      p.location.city.toLowerCase().includes(cityLower) ||
      p.type === 'telehealth'
    )
  }

  return candidates
}

// ---------------------------------------------------------------------------
// Match factor scoring
// ---------------------------------------------------------------------------

function scoreSpecialty(
  provider: Provider,
  requestedSpecialty?: string
): { score: number; matched: boolean } {
  if (!requestedSpecialty) {
    return { score: 0, matched: false }
  }

  const matched = isSpecialtyMatch(requestedSpecialty, provider.specialty)
  return {
    score: matched ? WEIGHTS.specialtyMatch : 0,
    matched,
  }
}

function scoreProviderType(
  provider: Provider,
  requestedType?: Provider['type']
): { score: number; matched: boolean } {
  if (!requestedType) {
    return { score: 0, matched: false }
  }

  const matched = provider.type === requestedType
  return {
    score: matched ? WEIGHTS.providerTypeMatch : 0,
    matched,
  }
}

function scoreCity(
  provider: Provider,
  searchCity?: string
): { score: number; matched: boolean } {
  if (!searchCity) {
    return { score: 0, matched: false }
  }

  const matched = provider.location.city.toLowerCase().includes(searchCity.toLowerCase())
  return {
    score: matched ? WEIGHTS.cityMatch : 0,
    matched,
  }
}

function scoreArea(
  provider: Provider,
  searchArea?: string
): { score: number; matched: boolean } {
  if (!searchArea) {
    return { score: 0, matched: false }
  }

  const matched = provider.location.area.toLowerCase().includes(searchArea.toLowerCase())
  return {
    score: matched ? WEIGHTS.areaMatch : 0,
    matched,
  }
}

function scoreInsurance(
  provider: Provider,
  insurance?: string
): { score: number; status: 'accepted' | 'not_accepted' | 'unknown' } {
  if (!insurance) {
    return { score: 0, status: 'unknown' }
  }

  const accepted = provider.acceptedInsurance.includes(insurance)
  return {
    score: accepted ? WEIGHTS.insuranceMatch : 0,
    status: accepted ? 'accepted' : 'not_accepted',
  }
}

function scoreAvailability(provider: Provider): number {
  switch (provider.availability) {
    case 'available':
      return WEIGHTS.availability
    case 'limited':
      return Math.round(WEIGHTS.availability * 0.5)
    case 'unavailable':
      return 0
  }
}

function scoreDistance(
  provider: Provider,
  userCoordinates?: { lat: number; lng: number }
): { score: number; distanceKm: number | null } {
  if (!userCoordinates || !provider.location.coordinates) {
    return { score: 0, distanceKm: null }
  }

  const distanceKm = calculateDistance(userCoordinates, provider.location.coordinates)

  // Closer = higher score, linearly scaled
  const normalized = Math.max(0, 1 - distanceKm / MAX_DISTANCE_KM)
  return {
    score: Math.round(normalized * WEIGHTS.distance),
    distanceKm,
  }
}

function scoreRating(rating: number): number {
  // Rating is a minor factor — scaled to WEIGHTS.rating range
  const normalized = (rating - 3) / 2 // 3.0 → 0, 5.0 → 1
  return Math.round(Math.max(0, Math.min(1, normalized)) * WEIGHTS.rating)
}

function scoreCost(fee: number): number {
  // Lower cost = slightly higher score — minor factor
  const normalized = 1 - Math.min(fee, MAX_CONSULTATION_FEE) / MAX_CONSULTATION_FEE
  return Math.round(normalized * WEIGHTS.cost)
}

// ---------------------------------------------------------------------------
// Match reason labels
// ---------------------------------------------------------------------------

function buildMatchReasons(
  specialtyMatch: boolean,
  providerTypeMatch: boolean,
  cityMatch: boolean,
  areaMatch: boolean,
  insuranceStatus: 'accepted' | 'not_accepted' | 'unknown',
  availability: Provider['availability'],
  distanceKm: number | null
): ProviderMatchReason[] {
  const reasons: ProviderMatchReason[] = []

  if (specialtyMatch) reasons.push('specialty_match')
  if (providerTypeMatch) reasons.push('provider_type_match')
  if (cityMatch) reasons.push('location_match')
  if (areaMatch) reasons.push('location_match')
  if (insuranceStatus === 'accepted') reasons.push('insurance_match')
  if (availability === 'available') reasons.push('available')
  if (distanceKm !== null && distanceKm < 10) reasons.push('nearby')
  if (distanceKm !== null && distanceKm < 5) reasons.push('lower_cost')

  return reasons
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Ranks providers based on the user's stated navigation needs and preferences.
 *
 * The score represents match against user-specified criteria.
 * It does NOT represent clinical quality, medical suitability,
 * or a recommendation that one provider is medically superior to another.
 */
export function rankProviders(
  providers: Provider[],
  context: ProviderSearchContext
): ProviderMatch[] {
  const candidates = retrieveCandidates(providers, context)

  const matches: ProviderMatch[] = candidates.map(provider => {
    const specialty = scoreSpecialty(provider, context.specialty)
    const providerType = scoreProviderType(provider, context.providerType)
    const city = scoreCity(provider, context.city)
    const area = scoreArea(provider, context.area)
    const insurance = scoreInsurance(provider, context.insurance)
    const availabilityScore = scoreAvailability(provider)
    const distance = scoreDistance(provider, context.userCoordinates)
    const ratingScore = scoreRating(provider.rating)
    const costScore = scoreCost(provider.consultationFee)

    const totalScore =
      specialty.score +
      providerType.score +
      city.score +
      area.score +
      insurance.score +
      availabilityScore +
      distance.score +
      ratingScore +
      costScore

    const matchReasons = buildMatchReasons(
      specialty.matched,
      providerType.matched,
      city.matched,
      area.matched,
      insurance.status,
      provider.availability,
      distance.distanceKm
    )

    return {
      provider,
      score: totalScore,
      matchReasons,
      insuranceStatus: insurance.status,
      distanceKm: distance.distanceKm,
    }
  })

  // Sort by score descending, then by rating as tiebreaker
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.provider.rating - a.provider.rating
  })

  return matches
}
