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

    it('Multi-Specialty Hospital does NOT match unrelated specialty', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const multiSpecialty = results.find(m => m.provider.id === 'p4')
      // Multi-Specialty Hospital specialty is "Multi-Specialty Hospital"
      // — it does NOT contain "dermatology", so it should NOT get specialty_match
      expect(multiSpecialty?.matchReasons).not.toContain('specialty_match')
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

  describe('area → city normalization', () => {
    it('searching "Lekki" resolves to Lagos providers', () => {
      const context: ProviderSearchContext = {
        area: 'Lekki',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const cities = results.map(m => m.provider.location.city)
      expect(cities).not.toContain('Abuja')
      expect(results.length).toBeGreaterThan(0)
    })

    it('searching "Wuse" resolves to Abuja providers', () => {
      const context: ProviderSearchContext = {
        area: 'Wuse',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      const cities = results.map(m => m.provider.location.city)
      expect(cities).toContain('Abuja')
      expect(cities).not.toContain('Lagos')
    })

    it('area match narrows to specific providers when available', () => {
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        area: 'Lekki',
      }
      const results = rankProviders(MOCK_PROVIDERS, context)
      // Should find the Lekki dermatology clinic
      expect(results[0].provider.id).toBe('p1')
      expect(results[0].matchReasons).toContain('location_match')
    })
  })

  describe('match reasons — lower_cost and high_rating', () => {
    it('low-cost provider gets lower_cost reason', () => {
      const cheap: Provider = {
        id: 'cheap',
        name: 'Cheap Dermatology',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 5000,
        rating: 4.0,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([cheap], context)
      expect(results[0].matchReasons).toContain('lower_cost')
    })

    it('high-rated provider gets high_rating reason', () => {
      const highRated: Provider = {
        id: 'high',
        name: 'High Rated Dermatology',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 25000,
        rating: 4.8,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([highRated], context)
      expect(results[0].matchReasons).toContain('high_rating')
    })

    it('expensive provider does NOT get lower_cost', () => {
      const expensive: Provider = {
        id: 'exp',
        name: 'Expensive Dermatology',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 45000,
        rating: 4.0,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([expensive], context)
      expect(results[0].matchReasons).not.toContain('lower_cost')
    })

    it('average-rated provider does NOT get high_rating', () => {
      const avg: Provider = {
        id: 'avg',
        name: 'Average Dermatology',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 25000,
        rating: 4.2,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([avg], context)
      expect(results[0].matchReasons).not.toContain('high_rating')
    })
  })

  describe('nearby match reason', () => {
    it('provider within 10km gets nearby reason', () => {
      const close: Provider = {
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
      const context: ProviderSearchContext = {
        specialty: 'dermatologist',
        city: 'Lagos',
        userCoordinates: { lat: 6.4480, lng: 3.4560 },
      }
      const results = rankProviders([close], context)
      expect(results[0].matchReasons).toContain('nearby')
    })

    it('provider >10km away does NOT get nearby reason', () => {
      const far: Provider = {
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
      const results = rankProviders([far], context)
      expect(results[0].matchReasons).not.toContain('nearby')
    })
  })

  describe('multi-specialty hospital — specialty matching', () => {
    it('Multi-Specialty Hospital does NOT get specialty_match for unrelated specialty', () => {
      const multi: Provider = {
        id: 'multi',
        name: 'Multi Hospital',
        type: 'hospital',
        specialty: 'Multi-Specialty Hospital',
        location: { city: 'Lagos', area: 'Victoria Island', address: '8 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 20000,
        rating: 4.5,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([multi], context)
      expect(results[0].matchReasons).not.toContain('specialty_match')
    })

    it('provider with explicit specialty match gets specialty_match', () => {
      const derm: Provider = {
        id: 'derm',
        name: 'Dermatology Clinic',
        type: 'clinic',
        specialty: 'Dermatology',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 20000,
        rating: 4.5,
      }
      const context: ProviderSearchContext = { specialty: 'dermatologist', city: 'Lagos' }
      const results = rankProviders([derm], context)
      expect(results[0].matchReasons).toContain('specialty_match')
    })
  })

  describe('general practice matches all provider types', () => {
    it('general_practice request accepts clinic', () => {
      const clinic: Provider = {
        id: 'clinic1',
        name: 'General Clinic',
        type: 'clinic',
        specialty: 'General Practice',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 10000,
        rating: 4.0,
      }
      const context: ProviderSearchContext = { specialty: 'general_practice', city: 'Lagos' }
      const results = rankProviders([clinic], context)
      expect(results[0].matchReasons).toContain('provider_type_match')
    })

    it('general_practice request accepts hospital', () => {
      const hospital: Provider = {
        id: 'hosp1',
        name: 'General Hospital',
        type: 'hospital',
        specialty: 'General Practice',
        location: { city: 'Lagos', area: 'Lekki', address: '123 Test' },
        availability: 'available',
        acceptedInsurance: [],
        consultationFee: 10000,
        rating: 4.0,
      }
      const context: ProviderSearchContext = { specialty: 'general_practice', city: 'Lagos' }
      const results = rankProviders([hospital], context)
      expect(results[0].matchReasons).toContain('provider_type_match')
    })
  })
})
