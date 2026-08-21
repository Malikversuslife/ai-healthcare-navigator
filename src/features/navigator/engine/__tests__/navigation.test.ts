import { describe, it, expect } from 'vitest'
import { evaluateNavigation, determineCareLevel, buildRecommendation } from '../navigation'
import { UserHealthContext, NavigationContext } from '../../../../shared/types'

describe('evaluateNavigation', () => {
  describe('emergency detection via safety boundary', () => {
    it('returns emergency action for chest pain with breathing difficulty', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'chest pain',
          symptoms: ['struggling to breathe'],
          duration: '30 minutes',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).toBe('emergency')
    })

    it('does NOT trigger emergency for bare chest soreness', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'chest soreness after exercising',
          symptoms: [],
          duration: '1 hour',
        },
      }
      const action = evaluateNavigation(context)
      expect(action.type).not.toBe('emergency')
    })

    it('severity 9 alone does NOT trigger emergency', () => {
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
      expect(action.type).not.toBe('emergency')
    })
  })

  describe('symptom_navigation', () => {
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
    it('safety is evaluated before recommendation logic', () => {
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'recommendation',
        userContext: {
          concern: 'sudden stroke symptoms',
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
  it('returns primary_care as placeholder for all contexts', () => {
    // Stage 4A: care-level determination is intentionally incomplete.
    // All paths return primary_care as a safe placeholder.
    const contexts: UserHealthContext[] = [
      {
        concern: 'headache',
        symptoms: ['headache'],
        duration: 'since yesterday',
      },
      {
        concern: 'pain',
        symptoms: ['pain'],
        duration: '1 hour',
        severity: { value: 7 },
      },
      {
        concern: 'pain',
        symptoms: ['pain'],
        duration: '1 day',
        severity: { value: 4 },
      },
      {
        concern: 'mild cold',
        symptoms: ['runny nose'],
        duration: '3 days',
      },
    ]

    for (const context of contexts) {
      expect(determineCareLevel(context)).toBe('primary_care')
    }
  })

  it('severity 7 does NOT independently produce urgent_care', () => {
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 hour',
      severity: { value: 7 },
    }
    expect(determineCareLevel(context)).not.toBe('urgent_care')
  })

  it('severity 4 does NOT independently produce primary_care from rules', () => {
    // It returns primary_care, but only because ALL contexts return
    // primary_care as a placeholder — not because of a severity rule.
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 day',
      severity: { value: 4 },
    }
    expect(determineCareLevel(context)).toBe('primary_care')
  })

  it('low/no severity does NOT automatically produce self_care', () => {
    const context: UserHealthContext = {
      concern: 'mild headache',
      symptoms: ['headache'],
      duration: 'a few hours',
    }
    expect(determineCareLevel(context)).not.toBe('self_care')
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

  it('builds primary_care recommendation', () => {
    const context: UserHealthContext = {
      concern: 'mild headache',
      symptoms: ['headache'],
      duration: 'a few hours',
    }
    const rec = buildRecommendation(context, 'primary_care')
    expect(rec.careLevel).toBe('primary_care')
    expect(rec.disclaimer).toBeTruthy()
  })
})
