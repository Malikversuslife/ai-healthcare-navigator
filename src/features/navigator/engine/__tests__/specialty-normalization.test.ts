import { describe, it, expect } from 'vitest'
import { normalizeSpecialty, isSpecialtyMatch } from '../specialty-normalization'

describe('normalizeSpecialty', () => {
  describe('dermatology', () => {
    it('normalizes "dermatologist" to Dermatology', () => {
      expect(normalizeSpecialty('dermatologist')).toBe('Dermatology')
    })

    it('normalizes "skin doctor" to Dermatology', () => {
      expect(normalizeSpecialty('skin doctor')).toBe('Dermatology')
    })

    it('normalizes "dermatology" to Dermatology', () => {
      expect(normalizeSpecialty('dermatology')).toBe('Dermatology')
    })

    it('normalizes "skin specialist" to Dermatology', () => {
      expect(normalizeSpecialty('skin specialist')).toBe('Dermatology')
    })
  })

  describe('cardiology', () => {
    it('normalizes "cardiologist" to Cardiology', () => {
      expect(normalizeSpecialty('cardiologist')).toBe('Cardiology')
    })

    it('normalizes "heart doctor" to Cardiology', () => {
      expect(normalizeSpecialty('heart doctor')).toBe('Cardiology')
    })
  })

  describe('general practice', () => {
    it('normalizes "general doctor" to General Practice', () => {
      expect(normalizeSpecialty('general doctor')).toBe('General Practice')
    })

    it('normalizes "primary care doctor" to General Practice', () => {
      expect(normalizeSpecialty('primary care doctor')).toBe('General Practice')
    })

    it('normalizes "gp" to General Practice', () => {
      expect(normalizeSpecialty('gp')).toBe('General Practice')
    })
  })

  describe('physiotherapy', () => {
    it('normalizes "physio" to Physiotherapy', () => {
      expect(normalizeSpecialty('physio')).toBe('Physiotherapy')
    })

    it('normalizes "physiotherapist" to Physiotherapy', () => {
      expect(normalizeSpecialty('physiotherapist')).toBe('Physiotherapy')
    })
  })

  describe('ophthalmology', () => {
    it('normalizes "eye doctor" to Ophthalmology', () => {
      expect(normalizeSpecialty('eye doctor')).toBe('Ophthalmology')
    })

    it('normalizes "optometrist" to Optometry', () => {
      expect(normalizeSpecialty('optometrist')).toBe('Optometry')
    })
  })

  describe('dentistry', () => {
    it('normalizes "dentist" to Dentistry', () => {
      expect(normalizeSpecialty('dentist')).toBe('Dentistry')
    })

    it('normalizes "dental" to Dentistry', () => {
      expect(normalizeSpecialty('dental')).toBe('Dentistry')
    })
  })

  describe('pediatrics', () => {
    it('normalizes "child doctor" to Pediatrics', () => {
      expect(normalizeSpecialty('child doctor')).toBe('Pediatrics')
    })

    it('normalizes "paediatrician" to Pediatrics', () => {
      expect(normalizeSpecialty('paediatrician')).toBe('Pediatrics')
    })
  })

  describe('known specialties pass through', () => {
    it('passes "Dermatology" through unchanged', () => {
      expect(normalizeSpecialty('Dermatology')).toBe('Dermatology')
    })

    it('passes "Multi-Specialty Hospital" through unchanged', () => {
      expect(normalizeSpecialty('Multi-Specialty Hospital')).toBe('Multi-Specialty Hospital')
    })
  })

  describe('unknown input returns original', () => {
    it('returns "rash doctor" unchanged (no symptom inference)', () => {
      expect(normalizeSpecialty('rash doctor')).toBe('rash doctor')
    })

    it('returns "headache specialist" unchanged (no symptom inference)', () => {
      expect(normalizeSpecialty('headache specialist')).toBe('headache specialist')
    })
  })
})

describe('isSpecialtyMatch', () => {
  it('matches dermatologist request to Dermatology provider', () => {
    expect(isSpecialtyMatch('dermatologist', 'Dermatology')).toBe(true)
  })

  it('matches heart doctor request to Cardiology provider', () => {
    expect(isSpecialtyMatch('heart doctor', 'Cardiology')).toBe(true)
  })

  it('Multi-Specialty Hospital does NOT match unrelated specialties', () => {
    expect(isSpecialtyMatch('dermatologist', 'Multi-Specialty Hospital')).toBe(false)
    expect(isSpecialtyMatch('cardiologist', 'Multi-Specialty Hospital')).toBe(false)
  })

  it('Multi-Specialty Hospital matches only if specialty is explicitly listed', () => {
    // A provider listing "Dermatology / Multi-Specialty Hospital" would match
    expect(isSpecialtyMatch('dermatologist', 'Dermatology / Multi-Specialty Hospital')).toBe(true)
  })

  it('does not match dermatologist request to Cardiology provider', () => {
    expect(isSpecialtyMatch('dermatologist', 'Cardiology')).toBe(false)
  })

  it('does not match dentist request to Dermatology provider', () => {
    expect(isSpecialtyMatch('dentist', 'Dermatology')).toBe(false)
  })

  it('General Consultation matches General Practice request', () => {
    expect(isSpecialtyMatch('general doctor', 'General Consultation')).toBe(true)
    expect(isSpecialtyMatch('gp', 'General Consultation')).toBe(true)
  })

  it('General Consultation does not match specialist request', () => {
    expect(isSpecialtyMatch('dermatologist', 'General Consultation')).toBe(false)
  })
})
