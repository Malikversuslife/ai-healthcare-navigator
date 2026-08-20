import { describe, it, expect } from 'vitest'
import { evaluateNavigation, determineCareLevel, buildRecommendation } from '../navigation'
import { UserHealthContext, NavigationContext } from '../../../../shared/types'

describe('evaluateNavigation', () => {
  describe('emergency detection', () => {
    it('returns emergency action for chest pain', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'chest pain',
          symptoms: ['chest pain'],
          duration: '30 minutes',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('emergency')
    })

    it('returns emergency action for severity >= 9', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'pain',
          symptoms: ['pain'],
          duration: '1 hour',
          severity: { value: 9 },
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('emergency')
    })
  })

  describe('symptom_navigation', () => {
    // Test 1 — Missing duration
    it('returns collect_context when duration is missing', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'headache',
          symptoms: ['headache'],
          duration: '',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('collect_context')
      if (action.type === 'collect_context') {
        expect(action.missingFields).toContain('duration')
      }
    })

    // Test 2 — Complete symptom context
    it('returns safety_check when context is complete', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'headache',
          symptoms: ['headache'],
          duration: 'since yesterday',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('safety_check')
    })
  })

  describe('find_provider', () => {
    // Test 3 — Provider search
    it('returns search_providers when specialty and location present', () => {
      const context: NavigationContext = {
        intent: 'find_provider',
        state: 'collecting_context',
        userContext: {
          concern: '',
          symptoms: [],
          duration: '',
          specialty: 'cardiologist',
          location: 'Lagos',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('search_providers')
    })

    it('returns collect_context when specialty is missing', () => {
      const context: NavigationContext = {
        intent: 'find_provider',
        state: 'collecting_context',
        userContext: {
          concern: '',
          symptoms: [],
          duration: '',
          location: 'Lagos',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('collect_context')
      if (action.type === 'collect_context') {
        expect(action.missingFields).toContain('specialty')
      }
    })
  })

  describe('find_hospital', () => {
    // Test 4 — Hospital search
    it('returns search_providers when location present', () => {
      const context: NavigationContext = {
        intent: 'find_hospital',
        state: 'collecting_context',
        userContext: {
          concern: '',
          symptoms: [],
          duration: '',
          location: 'Abuja',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('search_providers')
    })
  })

  describe('insurance', () => {
    // Test 5 — Insurance
    it('returns check_insurance when insurance present', () => {
      const context: NavigationContext = {
        intent: 'insurance',
        state: 'collecting_context',
        userContext: {
          concern: '',
          symptoms: [],
          duration: '',
          insurance: 'nhis',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('check_insurance')
    })
  })

  describe('general_healthcare', () => {
    // Test 6 — General healthcare
    it('returns answer_general_question without symptom intake', () => {
      const context: NavigationContext = {
        intent: 'general_healthcare',
        state: 'understanding',
        userContext: {
          concern: '',
          symptoms: [],
          duration: '',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('answer_general_question')
    })
  })

  describe('state preservation', () => {
    // Test 7 — Existing emergency boundary
    it('safety is evaluated before recommendation logic', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'recommendation',
        userContext: {
          concern: 'stroke symptoms',
          symptoms: ['stroke'],
          duration: '5 minutes',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('emergency')
    })

    it('preserves provider_search state when already in it', () => {
      const context: NavigationContext = {
        intent: 'find_provider',
        state: 'provider_search',
        userContext: {
          concern: '',
          symptoms: [],
          duration: '',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('search_providers')
    })
  })
})

describe('determineCareLevel', () => {
  it('returns emergency for emergency indicators', () => {
    const context: UserHealthContext = {
      concern: 'chest pain',
      symptoms: ['chest pain'],
      duration: '30 minutes',
    }
    expect(determineCareLevel(context)).toBe('emergency')
  })

  it('returns urgent_care for severity >= 7', () => {
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 hour',
      severity: { value: 7 },
    }
    expect(determineCareLevel(context)).toBe('urgent_care')
  })

  it('returns primary_care for severity >= 4', () => {
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 day',
      severity: { value: 5 },
    }
    expect(determineCareLevel(context)).toBe('primary_care')
  })

  it('returns self_care for low or no severity', () => {
    const context: UserHealthContext = {
      concern: 'mild headache',
      symptoms: ['headache'],
      duration: 'a few hours',
    }
    expect(determineCareLevel(context)).toBe('self_care')
  })
})

describe('buildRecommendation', () => {
  it('builds emergency recommendation', () => {
    const context: UserHealthContext = {
      concern: 'chest pain',
      symptoms: ['chest pain'],
      duration: '30 minutes',
    }
    const rec = buildRecommendation(context, 'emergency')
    expect(rec.careLevel).toBe('emergency')
    expect(rec.nextSteps.some(s => s.type === 'emergency')).toBe(true)
  })

  it('builds self_care recommendation', () => {
    const context: UserHealthContext = {
      concern: 'mild headache',
      symptoms: ['headache'],
      duration: 'a few hours',
    }
    const rec = buildRecommendation(context, 'self_care')
    expect(rec.careLevel).toBe('self_care')
    expect(rec.disclaimer).toBeTruthy()
  })
})
