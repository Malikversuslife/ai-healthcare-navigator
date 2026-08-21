import { describe, it, expect } from 'vitest'
import { MockAIService } from '../mock-ai'
import { UserHealthContext } from '../../../shared/types'

describe('MockAIService - Provider Navigation Extraction', () => {
  const service = new MockAIService()
  const emptyContext: UserHealthContext = {
    concern: '',
    symptoms: [],
    duration: '',
  }

  describe('specialty extraction', () => {
    it('extracts dermatologist when explicitly stated', async () => {
      const result = await service.processMessage('I need a dermatologist in Lagos', emptyContext)
      expect(result.extractedContext.specialty).toBe('dermatologist')
    })

    it('extracts cardiologist when explicitly stated', async () => {
      const result = await service.processMessage('Looking for a cardiologist', emptyContext)
      expect(result.extractedContext.specialty).toBe('cardiologist')
    })

    it('extracts pediatrician when explicitly stated', async () => {
      const result = await service.processMessage('I need a pediatrician for my child', emptyContext)
      expect(result.extractedContext.specialty).toBe('pediatrician')
    })

    it('does NOT extract specialty from symptoms alone', async () => {
      const result = await service.processMessage('I have a rash on my arm', emptyContext)
      expect(result.extractedContext.specialty).toBeUndefined()
    })

    it('does NOT extract specialty from "headache" alone', async () => {
      const result = await service.processMessage('I have a severe headache', emptyContext)
      expect(result.extractedContext.specialty).toBeUndefined()
    })
  })

  describe('location extraction', () => {
    it('extracts Lagos when explicitly stated', async () => {
      const result = await service.processMessage('I need a doctor in Lagos', emptyContext)
      expect(result.extractedContext.location).toBe('Lagos')
    })

    it('extracts Abuja when explicitly stated', async () => {
      const result = await service.processMessage('Looking for providers in Abuja', emptyContext)
      expect(result.extractedContext.location).toBe('Abuja')
    })

    it('extracts Lekki area', async () => {
      const result = await service.processMessage('I need a clinic in Lekki', emptyContext)
      expect(result.extractedContext.location).toBe('Lekki')
    })

    it('does NOT extract location when not stated', async () => {
      const result = await service.processMessage('I have a headache', emptyContext)
      expect(result.extractedContext.location).toBeUndefined()
    })
  })

  describe('insurance extraction', () => {
    it('extracts NHIS when explicitly stated', async () => {
      const result = await service.processMessage('I have NHIS insurance', emptyContext)
      expect(result.extractedContext.insurance).toBe('nhis')
    })

    it('extracts Leadway when explicitly stated', async () => {
      const result = await service.processMessage('I have Leadway insurance', emptyContext)
      expect(result.extractedContext.insurance).toBe('leadway')
    })

    it('extracts AXA Mansard when explicitly stated', async () => {
      const result = await service.processMessage('My insurance is AXA Mansard', emptyContext)
      expect(result.extractedContext.insurance).toBe('axa_mansard')
    })

    it('does NOT extract insurance when not stated', async () => {
      const result = await service.processMessage('I need a doctor', emptyContext)
      expect(result.extractedContext.insurance).toBeUndefined()
    })
  })

  describe('combined extraction', () => {
    it('extracts specialty, location, and insurance from a single message', async () => {
      const result = await service.processMessage(
        'I need a dermatologist in Lagos with NHIS insurance',
        emptyContext
      )
      expect(result.extractedContext.specialty).toBe('dermatologist')
      expect(result.extractedContext.location).toBe('Lagos')
      expect(result.extractedContext.insurance).toBe('nhis')
    })

    it('extracts specialty and location without insurance', async () => {
      const result = await service.processMessage(
        'Looking for a cardiologist in Abuja',
        emptyContext
      )
      expect(result.extractedContext.specialty).toBe('cardiologist')
      expect(result.extractedContext.location).toBe('Abuja')
      expect(result.extractedContext.insurance).toBeUndefined()
    })
  })

  describe('preserves existing context', () => {
    it('does not overwrite existing specialty if not extracted', async () => {
      const contextWithSpecialty: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'neurologist',
      }
      const result = await service.processMessage('I have a headache', contextWithSpecialty)
      expect(result.extractedContext.specialty).toBeUndefined()
    })

    it('overwrites specialty when explicitly stated in new message', async () => {
      const contextWithSpecialty: UserHealthContext = {
        concern: '',
        symptoms: [],
        duration: '',
        specialty: 'neurologist',
      }
      const result = await service.processMessage(
        'Actually, I need a dermatologist',
        contextWithSpecialty
      )
      expect(result.extractedContext.specialty).toBe('dermatologist')
    })
  })
})