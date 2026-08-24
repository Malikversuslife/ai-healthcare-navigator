import { describe, it, expect } from 'vitest'
import { MockAIService } from '../../../../services/ai/mock-ai'
import { evaluateEmergencySafety } from '../safety'
import { UserHealthContext } from '../../../../shared/types'

// ---------------------------------------------------------------------------
// Fallback safety tests — verify MockAIService extraction feeds the existing
// safety engine correctly without OpenAI.
//
// MockAIService should extract user-stated information.
// safety.ts remains the only place that decides emergency.
// ---------------------------------------------------------------------------

describe('Fallback safety — MockAIService extraction for safety engine', () => {
  const service = new MockAIService()
  const emptyContext: UserHealthContext = {
    concern: '',
    symptoms: [],
    duration: '',
  }

  // -----------------------------------------------------------------------
  // 1. Chest pain + breathing difficulty → emergency
  // -----------------------------------------------------------------------
  describe('chest pain + breathing difficulty', () => {
    it('extracts "chest pain" as concern', async () => {
      const result = await service.processMessage(
        "I'm having severe chest pain and I can't breathe properly.",
        emptyContext
      )
      expect(result.extractedContext.concern).toBe('severe chest pain')
    })

    it('extracts breathing difficulty as symptom', async () => {
      const result = await service.processMessage(
        "I'm having severe chest pain and I can't breathe properly.",
        emptyContext
      )
      expect(result.extractedContext.symptoms).toContain("can't breathe")
    })

    it('safety engine triggers for chest pain + breathing difficulty', async () => {
      const result = await service.processMessage(
        "I'm having severe chest pain and I can't breathe properly.",
        emptyContext
      )
      const merged: UserHealthContext = {
        ...emptyContext,
        ...result.extractedContext,
      }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(true)
      expect(safety.signals.some(s => s.signal === 'high_risk_chest_symptoms')).toBe(true)
    })

    it('safety engine triggers for "Chest pain and I\'m struggling to breathe"', async () => {
      const result = await service.processMessage(
        "Chest pain and I'm struggling to breathe.",
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(true)
    })

    it('safety engine triggers for "I have chest pain and I passed out"', async () => {
      const result = await service.processMessage(
        'I have chest pain and I passed out.',
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(true)
    })

    it('safety engine triggers for "Crushing chest pain"', async () => {
      const result = await service.processMessage(
        'Crushing chest pain.',
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // 2. Severity alone must NOT trigger emergency
  // -----------------------------------------------------------------------
  describe('severity alone does not trigger', () => {
    it('safety engine does NOT trigger for "My pain is 9 out of 10"', async () => {
      const result = await service.processMessage(
        'My pain is 9 out of 10.',
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // 3. Chest symptom alone must NOT trigger
  // -----------------------------------------------------------------------
  describe('chest symptom alone does not trigger', () => {
    it('safety engine does NOT trigger for "My chest is sore after exercising"', async () => {
      const result = await service.processMessage(
        'My chest is sore after exercising.',
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // 4. Historical examples must NOT trigger
  // -----------------------------------------------------------------------
  describe('historical symptoms do not trigger', () => {
    it('safety engine does NOT trigger for "I passed out last year"', async () => {
      const result = await service.processMessage(
        'I passed out last year.',
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(false)
    })

    it('safety engine triggers for current breathing difficulty despite time reference', async () => {
      const result = await service.processMessage(
        "I'm struggling to breathe since yesterday.",
        emptyContext
      )
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const safety = evaluateEmergencySafety(merged)
      expect(safety.triggered).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // 5. Multi-turn context accumulation
  // -----------------------------------------------------------------------
  describe('multi-turn context accumulation', () => {
    it('preserves concern across turns', async () => {
      const turn1 = await service.processMessage('I have a red, teary eye.', emptyContext)
      const ctx1: UserHealthContext = { ...emptyContext, ...turn1.extractedContext }

      const turn2 = await service.processMessage('It hurts.', ctx1)
      const ctx2: UserHealthContext = { ...ctx1, ...turn2.extractedContext }

      expect(ctx2.concern).toBeTruthy()
      expect(ctx2.symptoms.length).toBeGreaterThan(0)
    })

    it('accumulates symptoms without losing concern', async () => {
      const turn1 = await service.processMessage('I have a red, teary eye.', emptyContext)
      const ctx1: UserHealthContext = { ...emptyContext, ...turn1.extractedContext }

      const turn2 = await service.processMessage('It hurts a lot and the eye is teary.', ctx1)
      const ctx2: UserHealthContext = { ...ctx1, ...turn2.extractedContext }

      expect(ctx2.concern).toBeTruthy()
      expect(ctx2.symptoms.length).toBeGreaterThanOrEqual(1)
    })

    it('preserves duration when set in later turn', async () => {
      const turn1 = await service.processMessage('I have a headache.', emptyContext)
      const ctx1: UserHealthContext = { ...emptyContext, ...turn1.extractedContext }

      const turn2 = await service.processMessage('For 2 days.', ctx1)
      const ctx2: UserHealthContext = { ...ctx1, ...turn2.extractedContext }

      expect(ctx2.duration).toBeTruthy()
    })
  })

  // -----------------------------------------------------------------------
  // 6. Null fields do not overwrite existing context
  // -----------------------------------------------------------------------
  describe('null fields do not overwrite', () => {
    it('does not overwrite existing concern when extraction returns null', async () => {
      const ctxWithConcern: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: '2 days',
      }
      const result = await service.processMessage('For 2 days.', ctxWithConcern)
      // concern should not be in extractedContext since it was null
      expect(result.extractedContext.concern).toBeUndefined()
    })

    it('preserves existing symptoms when new message has no symptoms', async () => {
      const ctxWithSymptoms: UserHealthContext = {
        concern: 'eye issue',
        symptoms: ['red eye', 'teary'],
        duration: '',
      }
      const result = await service.processMessage('For 2 days.', ctxWithSymptoms)
      // New symptoms should not overwrite existing — extraction should merge
      const merged: UserHealthContext = { ...ctxWithSymptoms, ...result.extractedContext }
      expect(merged.symptoms).toContain('red eye')
      expect(merged.symptoms).toContain('teary')
    })
  })

  // -----------------------------------------------------------------------
  // 7. Explicit specialty behavior
  // -----------------------------------------------------------------------
  describe('explicit specialty extraction', () => {
    it('extracts ophthalmologist from "I need to see an eye doctor"', async () => {
      const result = await service.processMessage(
        'I need to see an eye doctor.',
        emptyContext
      )
      expect(result.extractedContext.specialty).toBe('ophthalmologist')
    })

    it('does NOT extract ophthalmology from "I have a red eye"', async () => {
      const result = await service.processMessage(
        'I have a red eye.',
        emptyContext
      )
      expect(result.extractedContext.specialty).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // 8. No API error exposed to user
  // -----------------------------------------------------------------------
  describe('fallback does not expose errors', () => {
    it('MockAIService always returns a valid response', async () => {
      const result = await service.processMessage('test message', emptyContext)
      expect(result.response).toBeTruthy()
      expect(typeof result.response).toBe('string')
      expect(result.extractedContext).toBeDefined()
    })

    it('MockAIService does not throw on any input', async () => {
      await expect(service.processMessage('', emptyContext)).resolves.toBeDefined()
      await expect(service.processMessage('??!!!', emptyContext)).resolves.toBeDefined()
    })
  })

  // -----------------------------------------------------------------------
  // 9. No duplicate messages from extraction
  // -----------------------------------------------------------------------
  describe('single response per turn', () => {
    it('returns exactly one response string', async () => {
      const result = await service.processMessage(
        'I have chest pain and cannot breathe.',
        emptyContext
      )
      expect(typeof result.response).toBe('string')
      expect(result.response.length).toBeGreaterThan(0)
      // The response should be a single coherent message
      expect(result.response).not.toContain('undefined')
      expect(result.response).not.toContain('null')
    })
  })
})
