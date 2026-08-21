import { describe, it, expect } from 'vitest'
import { containsEmergencyIndicators } from '../safety'
import { UserHealthContext } from '../../../../shared/types'

describe('containsEmergencyIndicators', () => {
  it('returns triggered: false for non-emergency symptoms', () => {
    const context: UserHealthContext = {
      concern: 'headache',
      symptoms: ['headache'],
      duration: 'since yesterday',
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(false)
    expect(result.indicators).toHaveLength(0)
  })

  it('returns triggered: true for chest pain in concern', () => {
    const context: UserHealthContext = {
      concern: 'chest pain',
      symptoms: [],
      duration: '30 minutes',
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(true)
    expect(result.indicators.some(i => i.includes('chest pain'))).toBe(true)
  })

  it('returns triggered: true for chest pain in symptoms', () => {
    const context: UserHealthContext = {
      concern: 'discomfort',
      symptoms: ['chest pain'],
      duration: '10 minutes',
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(true)
    expect(result.indicators.some(i => i.includes('symptom: chest pain'))).toBe(true)
  })

  it('returns triggered: true for difficulty breathing', () => {
    const context: UserHealthContext = {
      concern: 'difficulty breathing',
      symptoms: [],
      duration: 'sudden',
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(true)
  })

  it('returns triggered: true for seizure in symptoms', () => {
    const context: UserHealthContext = {
      concern: 'episode',
      symptoms: ['seizure'],
      duration: '20 minutes',
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(true)
  })

  it('does NOT trigger emergency on severity alone', () => {
    const context: UserHealthContext = {
      concern: 'general discomfort',
      symptoms: ['discomfort'],
      duration: '2 hours',
      severity: { value: 10 },
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(false)
  })

  it('does NOT trigger emergency on severity 9', () => {
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 hour',
      severity: { value: 9 },
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(false)
  })

  it('severity alone does not trigger even with high value', () => {
    const context: UserHealthContext = {
      concern: 'mild cold',
      symptoms: ['runny nose'],
      duration: '3 days',
      severity: { value: 9 },
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(false)
  })
})
