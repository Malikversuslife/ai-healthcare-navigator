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

  it('returns triggered: true for severity >= 9', () => {
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 hour',
      severity: { value: 9 },
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(true)
    expect(result.indicators.some(i => i.includes('severity: 9'))).toBe(true)
  })

  it('returns triggered: false for severity 8', () => {
    const context: UserHealthContext = {
      concern: 'pain',
      symptoms: ['pain'],
      duration: '1 hour',
      severity: { value: 8 },
    }
    const result = containsEmergencyIndicators(context)
    expect(result.triggered).toBe(false)
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
})
