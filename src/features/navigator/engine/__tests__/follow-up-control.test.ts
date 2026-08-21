import { describe, it, expect } from 'vitest'
import { getMissingContextFields } from '../context'
import { UserHealthContext } from '../../../../shared/types'

// These tests prove that the APPLICATION controls which field is collected next.
// The AI cannot override which field the Navigation Engine determines is missing.

describe('application-controlled follow-up fields', () => {
  describe('symptom_navigation', () => {
    it('missing duration results in duration being the missing field', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: '',
      }
      const missing = getMissingContextFields('symptom_navigation', context)
      expect(missing).toEqual(['duration'])
    })

    it('missing symptoms results in symptoms being the missing field', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: [],
        duration: 'since yesterday',
      }
      const missing = getMissingContextFields('symptom_navigation', context)
      expect(missing).toEqual(['symptoms'])
    })

    it('missing concern results in concern being the missing field', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: ['headache'],
        duration: 'since yesterday',
      }
      const missing = getMissingContextFields('symptom_navigation', context)
      expect(missing).toEqual(['concern'])
    })

    it('severity is NOT in missing fields even when absent', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: 'since yesterday',
      }
      const missing = getMissingContextFields('symptom_navigation', context)
      expect(missing).not.toContain('severity')
    })

    it('returns fields in consistent order regardless of context', () => {
      // Application always checks the same fields in the same order
      const context1: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const context2: UserHealthContext = {
        concern: 'headache',
        symptoms: [],
        duration: '',
      }
      const missing1 = getMissingContextFields('symptom_navigation', context1)
      const missing2 = getMissingContextFields('symptom_navigation', context2)

      // Both should have 'symptoms' and 'duration' in the same order
      expect(missing1).toContain('symptoms')
      expect(missing1).toContain('duration')
      expect(missing2).toContain('symptoms')
      expect(missing2).toContain('duration')
    })
  })

  describe('find_provider', () => {
    it('missing specialty results in specialty being the missing field', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        location: 'Lagos',
      }
      const missing = getMissingContextFields('find_provider', context)
      expect(missing).toEqual(['specialty'])
    })

    it('missing location results in location being the missing field', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'cardiologist',
      }
      const missing = getMissingContextFields('find_provider', context)
      expect(missing).toEqual(['location'])
    })

    it('both missing returns both fields', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const missing = getMissingContextFields('find_provider', context)
      expect(missing).toContain('specialty')
      expect(missing).toContain('location')
    })
  })

  describe('find_hospital', () => {
    it('missing location results in location being the missing field', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const missing = getMissingContextFields('find_hospital', context)
      expect(missing).toEqual(['location'])
    })
  })

  describe('insurance', () => {
    it('missing insurance results in insurance being the missing field', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const missing = getMissingContextFields('insurance', context)
      expect(missing).toEqual(['insurance'])
    })
  })

  describe('appointment', () => {
    it('missing specialty and location results in both fields', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const missing = getMissingContextFields('appointment', context)
      expect(missing).toContain('specialty')
      expect(missing).toContain('location')
    })
  })

  describe('general_healthcare', () => {
    it('always returns empty — no fields required', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const missing = getMissingContextFields('general_healthcare', context)
      expect(missing).toHaveLength(0)
    })
  })

  describe('field ordering consistency', () => {
    it('symptom_navigation always checks concern before symptoms before duration', () => {
      const context: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
      }
      const missing = getMissingContextFields('symptom_navigation', context)
      const concernIdx = missing.indexOf('concern')
      const symptomsIdx = missing.indexOf('symptoms')
      const durationIdx = missing.indexOf('duration')

      // All should be present and in order
      expect(concernIdx).toBe(0)
      expect(symptomsIdx).toBe(1)
      expect(durationIdx).toBe(2)
    })
  })
})
