import { describe, it, expect } from 'vitest'
import { isContextSufficient, getMissingContextFields } from '../context'
import { UserHealthContext } from '../../../../shared/types'

describe('isContextSufficient', () => {
  describe('symptom_navigation', () => {
    it('returns false when concern is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: ['headache'],
        duration: 'since yesterday',
      }
      expect(isContextSufficient('symptom_navigation', context)).toBe(false)
    })

    it('returns false when symptoms are missing', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: [],
        duration: 'since yesterday',
      }
      expect(isContextSufficient('symptom_navigation', context)).toBe(false)
    })

    it('returns false when duration is missing', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: '',
      }
      expect(isContextSufficient('symptom_navigation', context)).toBe(false)
    })

    it('returns true when concern, symptoms, and duration are present', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: 'since yesterday',
      }
      expect(isContextSufficient('symptom_navigation', context)).toBe(true)
    })

    it('severity is recommended but not required', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: 'since yesterday',
      }
      expect(isContextSufficient('symptom_navigation', context)).toBe(true)
    })
  })

  describe('find_provider', () => {
    it('returns false when specialty is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        location: 'Lagos',
      }
      expect(isContextSufficient('find_provider', context)).toBe(false)
    })

    it('returns false when location is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'cardiologist',
      }
      expect(isContextSufficient('find_provider', context)).toBe(false)
    })

    it('returns true when specialty and location are present', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'cardiologist',
        location: 'Lagos',
      }
      expect(isContextSufficient('find_provider', context)).toBe(true)
    })
  })

  describe('find_hospital', () => {
    it('returns false when location is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      expect(isContextSufficient('find_hospital', context)).toBe(false)
    })

    it('returns true when location is present', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        location: 'Abuja',
      }
      expect(isContextSufficient('find_hospital', context)).toBe(true)
    })
  })

  describe('appointment', () => {
    it('returns false when specialty is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        location: 'Lagos',
      }
      expect(isContextSufficient('appointment', context)).toBe(false)
    })

    it('returns true when specialty and location are present', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'dermatologist',
        location: 'Lagos',
      }
      expect(isContextSufficient('appointment', context)).toBe(true)
    })
  })

  describe('insurance', () => {
    it('returns false when insurance is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      expect(isContextSufficient('insurance', context)).toBe(false)
    })

    it('returns true when insurance is present', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        insurance: 'nhis',
      }
      expect(isContextSufficient('insurance', context)).toBe(true)
    })
  })

  describe('treatment_followup', () => {
    it('returns false when concern is missing', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      expect(isContextSufficient('treatment_followup', context)).toBe(false)
    })

    it('returns true when concern is present', () => {
      const context: UserHealthContext = {
        concern: 'follow-up on medication',
        symptoms: [],
        duration: '',
      }
      expect(isContextSufficient('treatment_followup', context)).toBe(true)
    })
  })

  describe('general_healthcare', () => {
    it('always returns true — no symptom context required', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      expect(isContextSufficient('general_healthcare', context)).toBe(true)
    })
  })
})

describe('getMissingContextFields', () => {
  it('returns missing fields for symptom_navigation', () => {
    const context: UserHealthContext = {
      concern: 'headache',
      symptoms: [],
      duration: '',
    }
    const missing = getMissingContextFields('symptom_navigation', context)
    expect(missing).toContain('symptoms')
    expect(missing).toContain('duration')
    expect(missing).not.toContain('concern')
  })

  it('returns empty array when all required fields present', () => {
    const context: UserHealthContext = {
      concern: 'headache',
      symptoms: ['headache'],
      duration: 'since yesterday',
    }
    const missing = getMissingContextFields('symptom_navigation', context)
    expect(missing).toHaveLength(0)
  })

  it('returns missing fields for find_provider', () => {
    const context: UserHealthContext = {
      concern: '',
      symptoms: [],
      duration: '',
    }
    const missing = getMissingContextFields('find_provider', context)
    expect(missing).toContain('specialty')
    expect(missing).toContain('location')
  })

  it('returns empty array for general_healthcare', () => {
    const context: UserHealthContext = {
      concern: '',
      symptoms: [],
      duration: '',
    }
    const missing = getMissingContextFields('general_healthcare', context)
    expect(missing).toHaveLength(0)
  })
})
