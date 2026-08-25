import { describe, it, expect } from 'vitest'
import { evaluateNavigation, buildPathwayRecommendation, buildEmergencyRecommendation } from '../navigation'
import { evaluateCarePathway } from '../pathway'
import { NavigationContext, CareNavigationContext } from '../../../../shared/types'

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

describe('evaluateCarePathway', () => {
  describe('primary_care', () => {
    it('returns primary_care for recurring headaches with sufficient context', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'headache',
          symptoms: ['headache'],
          duration: 'several days',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('primary_care')
      expect(result.escalationFactors).toHaveLength(0)
    })

    it('returns primary_care for symptom navigation without escalation', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'stomach pain',
          symptoms: ['nausea'],
          duration: '2 days',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('primary_care')
    })
  })

  describe('provider_or_specialist', () => {
    it('returns provider_or_specialist for explicit provider intent', () => {
      const context: CareNavigationContext = {
        intent: 'find_provider',
        healthContext: {
          concern: '',
          symptoms: [],
          duration: '',
          specialty: 'dermatologist',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('provider_or_specialist')
    })

    it('returns provider_or_specialist for hospital search', () => {
      const context: CareNavigationContext = {
        intent: 'find_hospital',
        healthContext: {
          concern: '',
          symptoms: [],
          duration: '',
          location: 'Lagos',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('provider_or_specialist')
    })
  })

  describe('informational_navigation', () => {
    it('returns informational_navigation for general healthcare question', () => {
      const context: CareNavigationContext = {
        intent: 'general_healthcare',
        healthContext: {
          concern: '',
          symptoms: [],
          duration: '',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('informational_navigation')
    })
  })

  describe('prompt_medical_review', () => {
    it('returns prompt_medical_review for rapidly worsening symptoms', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'pain',
          symptoms: ['pain'],
          duration: '3 days',
          symptomTrend: 'rapidly_worsening',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('prompt_medical_review')
      expect(result.escalationFactors).toContain('rapidly_worsening')
    })

    it('returns prompt_medical_review for significant functional impact', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'back pain',
          symptoms: ['pain'],
          duration: '1 week',
          functionalImpact: { level: 'significant' },
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('prompt_medical_review')
      expect(result.escalationFactors).toContain('significant_functional_impact')
    })

    it('returns prompt_medical_review for can\'t go to work (via functionalImpact)', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'migraine',
          symptoms: ['headache', 'nausea'],
          duration: '3 days',
          functionalImpact: { level: 'significant', description: 'User reported inability to go to work' },
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('prompt_medical_review')
      expect(result.escalationFactors).toContain('significant_functional_impact')
    })
  })

  describe('severity protection', () => {
    it('severity value = 8 does NOT independently determine pathway', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'pain',
          symptoms: ['pain'],
          duration: '1 day',
          severity: { value: 8 },
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).not.toBe('prompt_medical_review')
      expect(result.pathway).toBe('primary_care')
    })
  })

  describe('duration protection', () => {
    it('duration two weeks does NOT independently determine escalation', () => {
      const context: CareNavigationContext = {
        intent: 'symptom_navigation',
        healthContext: {
          concern: 'cough',
          symptoms: ['cough'],
          duration: 'two weeks',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).not.toBe('prompt_medical_review')
      expect(result.pathway).toBe('primary_care')
    })
  })

  describe('emergency precedence', () => {
    it('emergency pathway is handled before Stage 4C (integration test)', () => {
      // This tests the full flow: safety check → pathway
      // If safety triggers, Stage 4C should never run
      const context: NavigationContext = {
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: {
          concern: 'chest pain',
          symptoms: ['struggling to breathe'],
          duration: '10 minutes',
        },
      }
      const action = evaluateNavigation(context)
      // Safety should catch this before pathway evaluation
      expect(action.type).toBe('emergency')
    })
  })

  describe('provider + emergency', () => {
    it('provider intent with emergency symptoms goes to emergency', () => {
      const context: NavigationContext = {
        intent: 'find_provider',
        state: 'collecting_context',
        userContext: {
          concern: 'dermatologist',
          symptoms: ['struggling to breathe'],
          duration: '5 minutes',
          specialty: 'dermatologist',
          location: 'Lagos',
        },
      }
      const action = evaluateNavigation(context)
      // Safety check runs first — emergency takes precedence
      expect(action.type).toBe('emergency')
    })
  })

  describe('general healthcare without symptoms', () => {
    it('informational navigation does not require symptom intake', () => {
      const context: CareNavigationContext = {
        intent: 'general_healthcare',
        healthContext: {
          concern: '',
          symptoms: [],
          duration: '',
        },
      }
      const result = evaluateCarePathway(context)
      expect(result.pathway).toBe('informational_navigation')
    })
  })
})

describe('buildPathwayRecommendation', () => {
  it('builds primary_care recommendation with pathway identity', () => {
    const result = evaluateCarePathway({
      intent: 'symptom_navigation',
      healthContext: {
        concern: 'headache',
        symptoms: ['headache'],
        duration: '3 days',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('primary_care')
    expect(rec.reasoning).toContain('primary care')
    expect(rec.disclaimer).toBeTruthy()
  })

  it('builds prompt_medical_review recommendation with pathway identity', () => {
    const result = evaluateCarePathway({
      intent: 'symptom_navigation',
      healthContext: {
        concern: 'pain',
        symptoms: ['pain'],
        duration: '3 days',
        symptomTrend: 'rapidly_worsening',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('prompt_medical_review')
    expect(rec.reasoning).toContain('medical assessment')
  })

  it('builds provider_or_specialist recommendation with pathway identity', () => {
    const result = evaluateCarePathway({
      intent: 'find_provider',
      healthContext: {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'dermatologist',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('provider_or_specialist')
    expect(rec.reasoning).toContain('healthcare professional')
  })

  it('builds informational_navigation recommendation with pathway identity', () => {
    const result = evaluateCarePathway({
      intent: 'general_healthcare',
      healthContext: {
        concern: '',
        symptoms: [],
        duration: '',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('informational_navigation')
    expect(rec.reasoning).toContain('information')
  })
})

describe('buildEmergencyRecommendation', () => {
  it('builds emergency recommendation with pathway identity', () => {
    const rec = buildEmergencyRecommendation()
    expect(rec.pathway).toBe('emergency')
    expect(rec.nextSteps.some(s => s.type === 'emergency')).toBe(true)
    expect(rec.nextSteps.some(s => s.type === 'find-provider')).toBe(false)
    expect(rec.disclaimer).toContain('not determine or rule out')
  })

  it('does not expose unsupported emergency facility discovery', () => {
    const rec = buildEmergencyRecommendation()
    const emergencyCopy = rec.nextSteps
      .map(step => `${step.label} ${step.description}`.toLowerCase())
      .join(' ')

    expect(rec.nextSteps).toHaveLength(1)
    expect(rec.nextSteps[0].label).toBe('Call Emergency Services')
    expect(emergencyCopy).not.toContain('nearest hospital')
    expect(emergencyCopy).not.toContain('emergency room')
  })
})

describe('pathway identity preservation', () => {
  it('prompt_medical_review remains prompt_medical_review and is NOT converted to urgent_care', () => {
    const result = evaluateCarePathway({
      intent: 'symptom_navigation',
      healthContext: {
        concern: 'pain',
        symptoms: ['pain'],
        duration: '3 days',
        symptomTrend: 'rapidly_worsening',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('prompt_medical_review')
    expect(rec.pathway).not.toBe('urgent_care')
  })

  it('informational_navigation is NOT represented as primary_care', () => {
    const result = evaluateCarePathway({
      intent: 'general_healthcare',
      healthContext: {
        concern: '',
        symptoms: [],
        duration: '',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('informational_navigation')
    expect(rec.pathway).not.toBe('primary_care')
  })

  it('provider_or_specialist is NOT represented as primary_care', () => {
    const result = evaluateCarePathway({
      intent: 'find_provider',
      healthContext: {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'cardiologist',
      },
    })
    const rec = buildPathwayRecommendation(result)
    expect(rec.pathway).toBe('provider_or_specialist')
    expect(rec.pathway).not.toBe('primary_care')
  })

  it('emergency recommendation uses pathway emergency, not careLevel', () => {
    const rec = buildEmergencyRecommendation()
    expect(rec.pathway).toBe('emergency')
    expect(rec).not.toHaveProperty('careLevel')
  })
})
