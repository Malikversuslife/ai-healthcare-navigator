import { describe, it, expect } from 'vitest'
import { rankProviders } from '../provider-matching'
import { Provider, ProviderSearchContext } from '../../../../shared/types'

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Dermatology Clinic Lagos',
    type: 'clinic',
    specialty: 'Dermatology',
    location: {
      city: 'Lagos',
      area: 'Lekki',
      address: '22 Admiralty Way, Lekki',
      coordinates: { lat: 6.4470, lng: 3.4550 },
    },
    availability: 'available',
    acceptedInsurance: ['nhis', 'leadway'],
    consultationFee: 25000,
    rating: 4.6,
  },
  {
    id: 'p2',
    name: 'Cardiology Centre Abuja',
    type: 'clinic',
    specialty: 'Cardiology',
    location: {
      city: 'Abuja',
      area: 'Wuse',
      address: '23 Ahmadu Bello Way',
      coordinates: { lat: 9.0570, lng: 7.4890 },
    },
    availability: 'available',
    acceptedInsurance: ['nhis', 'axa-mansard'],
    consultationFee: 35000,
    rating: 4.7,
  },
  {
    id: 'p3',
    name: 'General Clinic Ikeja',
    type: 'clinic',
    specialty: 'General Practice',
    location: {
      city: 'Lagos',
      area: 'Ikeja',
      address: '15 Awolowo Road',
      coordinates: { lat: 6.6000, lng: 3.3500 },
    },
    availability: 'available',
    acceptedInsurance: ['nhis', 'hygeia'],
    consultationFee: 12000,
    rating: 4.3,
  },
  {
    id: 'p4',
    name: 'Multi-Specialty Hospital',
    type: 'hospital',
    specialty: 'Multi-Specialty Hospital',
    location: {
      city: 'Lagos',
      area: 'Victoria Island',
      address: '8 Adeola Odeku Street',
      coordinates: { lat: 6.4281, lng: 3.4219 },
    },
    availability: 'limited',
    acceptedInsurance: ['nhis', 'leadway', 'axa-mansard'],
    consultationFee: 28000,
    rating: 4.5,
  },
  {
    id: 'p5',
    name: 'Unrelated High-Rated Clinic',
    type: 'clinic',
    specialty: 'Ophthalmology',
    location: {
      city: 'Lagos',
      area: 'Surulere',
      address: '45 Bode Thomas Street',
      coordinates: { lat: 6.5260, lng: 3.3590 },
    },
    availability: 'available',
    acceptedInsurance: ['nhis'],
    consultationFee: 15000,
    rating: 4.9,
  },
]

describe('rankProviders', () => {
  describe('specialty matching', () => {
    it('ranks dermatology match first for dermatologist request', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      expect(results[0].provider.id).toBe('p1')
      expect(results[0].matchReasons).toContain('specialty_match')
    })

    it('Multi-Specialty Hospital matches any specialty request', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const multiSpecialty = results.find(m => m.provider.id === 'p4')
      expect(multiSpecialty?.matchReasons).toContain('specialty_match')
    })
  })

  describe('rating protection', () => {
    it('4.5 dermatology match ranks above 4.9 unrelated provider', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const dermMatch = results.findIndex(m => m.provider.id === 'p1')
      const unrelated = results.findIndex(m => m.provider.id === 'p5')
      expect(dermMatch).toBeLessThan(unrelated)
    })
  })

  describe('location', () => {
    it('filters by city - Lagos request returns Lagos providers only', () => {
      const context: ProviderSearchContext = {
        city: 'Lagos',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const cities = results.map(m => m.provider.location.city)
      expect(cities).not.toContain('Abuja')
    })

    it('area match receives location_match reason', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
        area: 'Lekki',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      expect(results[0].provider.id).toBe('p1')
      expect(results[0].matchReasons).toContain('location_match')
    })
  })

  describe('insurance', () => {
    it('insurance match contributes positively', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
        insurance: 'nhis',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const dermResult = results.find(m => m.provider.id === 'p1')
      expect(dermResult?.insuranceStatus).toBe('accepted')
      expect(dermResult?.matchReasons).toContain('insurance_match')
    })

    it('provider without insurance still appears', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
        insurance: 'nonexistent',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const dermResult = results.find(m => m.provider.id === 'p1')
      expect(dermResult).toBeDefined()
      expect(dermResult?.insuranceStatus).toBe('not_accepted')
    })

    it('insurance status is accepted not covered', () => {
      const context: ProviderSearchContext = {
        insurance: 'nhis',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const nhisAccepted = results.filter(m => m.insuranceStatus === 'accepted')
      expect(nhisAccepted.length).toBeGreaterThan(0)
      nhisAccepted.forEach(m => {
        expect(m.insuranceStatus).toBe('accepted')
      })
    })
  })

  describe('availability', () => {
    it('available ranks above unavailable when otherwise equal', () => {
      const available: Provider = {
        id: 'avail',
        name: 'Available Clinic',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 25000,
        rating: 4.6,
      }
      const unavailable: Provider = {
        id: 'unavail',
        name: 'Unavailable Clinic',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '456 Test' },
        availability: 'unavailable',
        acceptedInsurance: [],
        consultationFee: 25000,
        rating: 4.6,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([available, unavailable], context)
      expect(results[0].provider.id).toBe('avail')
      expect(results[0].matchReasons).toContain('available')
    })
  })

  describe('distance', () => {
    it('closer provider receives distance advantage', () => {
      const closeProvider: Provider = {
        id: 'close',
        name: 'Close Clinic',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test', coordinates: { lat: 6.4470, lng: 3.4550 } },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 25000,
        rating: 4.0,
      }
      const farProvider: Provider = {
        id: 'far',
        name: 'Far Clinic',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Ikeja', address: '456 Test', coordinates: { lat: 6.6000, lng: 3.3500 } },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 25000,
        rating: 4.0,
      }
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
        userCoordinates: { lat: 6.4470, lng: 3.4550 },
      }
      const results = rankProviders([closeProvider, farProvider], context)
      expect(results[0].provider.id).toBe('close')
      expect(results[0].distanceKm).toBe(0)
    })
  })

  describe('cost', () => {
    it('cost does not override stronger specialty match', () => {
      const cheapUnrelated: Provider = {
        id: 'cheap',
        name: 'Cheap Clinic',
        type: 'clinic',
        specialty: 'Ophthalmology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 5000,
        rating: 4.0,
      }
      const expensiveDerm: Provider = {
        id: 'expensive',
        name: 'Expensive Dermatology',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '456 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 50000,
        rating: 4.0,
      }
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
      }
      const results = rankProviders([cheapUnrelated, expensiveDerm], context)
      expect(results[0].provider.id).toBe('expensive')
    })
  })

  describe('unknown location', () => {
    it('no location returns all providers', () => {
      const context: ProviderSearchContext = {}
      const results = rankProviders(MOCK_PROVIDERS, context)
      expect(results.length).toBe(MOCK_PROVIDERS.length)
    })
  })

  describe('zero results', () => {
    it('returns empty for unmatched city', () => {
      const context: ProviderSearchContext = {
        city: 'New York',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      expect(results.length).toBe(0)
    })
  })

  describe('informational pathway', () => {
    it('informational_navigation does not require provider search', () => {
      const context: ProviderSearchContext = {
        pathway: 'informational_navigation',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('score structure', () => {
    it('every result has provider, score, matchReasons, insuranceStatus, distanceKm', () => {
      const context: ProviderSearchContext = { city: 'Lagos' }
      const results = rankProviders(MOCK_PROVIDERS, context)
      results.forEach(match => {
        expect(match).toHaveProperty('provider')
        expect(match).toHaveProperty('score')
        expect(match).toHaveProperty('matchReasons')
        expect(match).toHaveProperty('insuranceStatus')
        expect(match).toHaveProperty('distanceKm')
        expect(typeof match.score).toBe('number')
        expect(Array.isArray(match.matchReasons)).toBe(true)
      })
    })

    it('results are sorted by score descending', () => {
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders(MOCK_PROVIDERS, context)
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })
  })
})
