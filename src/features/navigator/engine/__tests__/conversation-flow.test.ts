import { describe, it, expect } from 'vitest'
import { MockAIService } from '../../../../services/ai/mock-ai'
import { UserHealthContext } from '../../../../shared/types'
import { getMissingContextFields } from '../context'
import { evaluateNavigation } from '../navigation'

describe('Conversation flow regression', () => {
  const service = new MockAIService()
  const emptyContext: UserHealthContext = {
    concern: '',
    symptoms: [],
    duration: '',
  }

  describe('concern extraction must advance beyond initial question', () => {
    it('extracts concern from "I have a red eye"', async () => {
      const result = await service.processMessage('I have a red eye', emptyContext)
      expect(result.extractedContext.concern).toBe('eye/vision issue')
    })

    it('concern extraction causes missing-fields to no longer include concern', async () => {
      const result = await service.processMessage('I have a red eye', emptyContext)
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }
      const missing = getMissingContextFields('symptom_navigation', merged)
      expect(missing).not.toContain('concern')
    })
  })

  describe('second message must enrich, not reset context', () => {
    it('"It hurts a lot and the eye is teary" adds symptoms without losing concern', async () => {
      const firstResult = await service.processMessage('I have a red eye', emptyContext)
      const afterFirst: UserHealthContext = { ...emptyContext, ...firstResult.extractedContext }

      const secondResult = await service.processMessage(
        'It hurts a lot and the eye is teary',
        afterFirst
      )
      const afterSecond: UserHealthContext = { ...afterFirst, ...secondResult.extractedContext }

      expect(afterSecond.concern).toBe('eye/vision issue')
      expect(afterSecond.symptoms.length).toBeGreaterThan(0)
    })

    it('context accumulates across multiple turns', async () => {
      const r1 = await service.processMessage('I have a red eye', emptyContext)
      const c1: UserHealthContext = { ...emptyContext, ...r1.extractedContext }

      const r2 = await service.processMessage('It hurts a lot and the eye is teary', c1)
      const c2: UserHealthContext = { ...c1, ...r2.extractedContext }

      const r3 = await service.processMessage('For about 2 days now', c2)
      const c3: UserHealthContext = { ...c2, ...r3.extractedContext }

      expect(c3.concern).toBe('eye/vision issue')
      expect(c3.symptoms.length).toBeGreaterThan(0)
      expect(c3.duration).toBeTruthy()
    })
  })

  describe('generic intake question must not repeat after valid info supplied', () => {
    it('after concern is extracted, concern is not in missing fields', async () => {
      const result = await service.processMessage('I have a red eye', emptyContext)
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }

      const navAction = evaluateNavigation({
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: merged,
      })

      expect(navAction.type).toBe('collect_context')
      if (navAction.type === 'collect_context') {
        expect(navAction.missingFields).not.toContain('concern')
      }
    })

    it('after concern + symptoms extracted, concern and symptoms not in missing fields', async () => {
      const r1 = await service.processMessage('I have a red eye', emptyContext)
      const c1: UserHealthContext = { ...emptyContext, ...r1.extractedContext }

      const r2 = await service.processMessage('It hurts a lot', c1)
      const c2: UserHealthContext = { ...c1, ...r2.extractedContext }

      const navAction = evaluateNavigation({
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: c2,
      })

      expect(navAction.type).toBe('collect_context')
      if (navAction.type === 'collect_context') {
        expect(navAction.missingFields).not.toContain('concern')
        expect(navAction.missingFields).not.toContain('symptoms')
      }
    })
  })

  describe('explicit specialty request — "eye doctor"', () => {
    it('extracts ophthalmologist from "I need to see an eye doctor"', async () => {
      const result = await service.processMessage('I need to see an eye doctor', emptyContext)
      expect(result.extractedContext.specialty).toBe('ophthalmologist')
    })

    it('does NOT extract ophthalmology from "I have a red eye" (symptom-only)', async () => {
      const result = await service.processMessage('I have a red eye', emptyContext)
      expect(result.extractedContext.specialty).toBeUndefined()
    })

    it('detects find_provider intent for "I need to see an eye doctor"', async () => {
      const r1 = await service.processMessage('I need to see an eye doctor', emptyContext)
      const merged: UserHealthContext = { ...emptyContext, ...r1.extractedContext }

      const navAction = evaluateNavigation({
        intent: 'find_provider',
        state: 'collecting_context',
        userContext: merged,
      })

      expect(navAction.type).toBe('collect_context')
      if (navAction.type === 'collect_context') {
        expect(navAction.missingFields).toContain('location')
      }
    })
  })

  describe('context survives subsequent turns', () => {
    it('concern remains present after three messages', async () => {
      const r1 = await service.processMessage('I have a headache', emptyContext)
      const c1: UserHealthContext = { ...emptyContext, ...r1.extractedContext }

      const r2 = await service.processMessage('For three days', c1)
      const c2: UserHealthContext = { ...c1, ...r2.extractedContext }

      const r3 = await service.processMessage('It is moderate', c2)
      const c3: UserHealthContext = { ...c2, ...r3.extractedContext }

      expect(c3.concern).toBe('headache')
      expect(c3.symptoms.length).toBeGreaterThan(0)
      expect(c3.duration).toBe('For three days')
      expect(c3.severity).toBeDefined()
    })
  })

  describe('progress calculation reflects collected information', () => {
    it('concern collected after first message', async () => {
      const result = await service.processMessage('I have a red eye', emptyContext)
      const merged: UserHealthContext = { ...emptyContext, ...result.extractedContext }

      expect(!!merged.concern).toBe(true)
      expect(merged.symptoms.length).toBe(0)
      expect(!!merged.duration).toBe(false)
    })

    it('concern + symptoms collected after second message', async () => {
      const r1 = await service.processMessage('I have a red eye', emptyContext)
      const c1: UserHealthContext = { ...emptyContext, ...r1.extractedContext }

      const r2 = await service.processMessage('It hurts a lot', c1)
      const c2: UserHealthContext = { ...c1, ...r2.extractedContext }

      expect(!!c2.concern).toBe(true)
      expect(c2.symptoms.length).toBeGreaterThan(0)
      expect(!!c2.duration).toBe(false)
    })
  })

  describe('safety behavior unchanged', () => {
    it('emergency detection still triggers for chest pain + breathing difficulty', async () => {
      // Mock AI has no chest concern pattern, so we test with the combined context
      // that the safety engine actually evaluates (concern + symptoms together)
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['struggling to breathe'],
        duration: '30 minutes',
      }

      const navAction = evaluateNavigation({
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: context,
      })

      expect(navAction.type).toBe('emergency')
    })

    it('severity 9 alone does NOT trigger emergency', async () => {
      const context: UserHealthContext = {
        concern: 'pain',
        symptoms: ['pain'],
        duration: '1 hour',
        severity: { value: 9 },
      }

      const navAction = evaluateNavigation({
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: context,
      })

      expect(navAction.type).not.toBe('emergency')
    })

    it('chest soreness alone does NOT trigger emergency', async () => {
      const context: UserHealthContext = {
        concern: 'chest soreness after exercising',
        symptoms: [],
        duration: '1 hour',
      }

      const navAction = evaluateNavigation({
        intent: 'symptom_navigation',
        state: 'collecting_context',
        userContext: context,
      })

      expect(navAction.type).not.toBe('emergency')
    })
  })
})
