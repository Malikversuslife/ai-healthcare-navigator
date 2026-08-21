import { describe, it, expect } from 'vitest'
import { evaluateEmergencySafety } from '../safety'
import { UserHealthContext } from '../../../../shared/types'

describe('evaluateEmergencySafety', () => {
  // -----------------------------------------------------------------------
  // False positive protection
  // -----------------------------------------------------------------------
  describe('false positive protection', () => {
    it('returns triggered: false for non-emergency symptoms', () => {
      const context: UserHealthContext = {
        concern: 'headache',
        symptoms: ['headache'],
        duration: 'since yesterday',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(false)
      expect(result.signals).toHaveLength(0)
    })

    it('does NOT trigger on severity alone', () => {
      const context: UserHealthContext = {
        concern: 'general discomfort',
        symptoms: ['discomfort'],
        duration: '2 hours',
        severity: { value: 10 },
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(false)
    })

    it('does NOT trigger on severity 9', () => {
      const context: UserHealthContext = {
        concern: 'pain',
        symptoms: ['pain'],
        duration: '1 hour',
        severity: { value: 9 },
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(false)
    })

    it('severity alone does not trigger even with high value', () => {
      const context: UserHealthContext = {
        concern: 'mild cold',
        symptoms: ['runny nose'],
        duration: '3 days',
        severity: { value: 9 },
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // Negation awareness
  // -----------------------------------------------------------------------
  describe('negation awareness', () => {
    it('does NOT trigger airway_compromise when negated', () => {
      const context: UserHealthContext = {
        concern: 'throat',
        symptoms: ['I do NOT have trouble breathing', 'no throat swelling'],
        duration: '1 day',
      }
      const result = evaluateEmergencySafety(context)
      const airwaySignal = result.signals.find(s => s.signal === 'airway_compromise')
      expect(airwaySignal).toBeUndefined()
    })

    it('does NOT trigger severe_breathing_difficulty when negated', () => {
      const context: UserHealthContext = {
        concern: 'chest',
        symptoms: ['I do NOT have difficulty breathing', 'cannot breathe is not happening'],
        duration: '2 hours',
      }
      const result = evaluateEmergencySafety(context)
      const breathingSignal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(breathingSignal).toBeUndefined()
    })

    it('does NOT trigger loss_of_consciousness when negated', () => {
      const context: UserHealthContext = {
        concern: 'dizzy',
        symptoms: ['I did NOT pass out', 'never lost consciousness'],
        duration: '30 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const consciousnessSignal = result.signals.find(s => s.signal === 'loss_of_consciousness')
      expect(consciousnessSignal).toBeUndefined()
    })

    it('does NOT trigger major_bleeding when negated', () => {
      const context: UserHealthContext = {
        concern: 'cut',
        symptoms: ['not bleeding heavily', 'I will not lose a lot of blood'],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const bleedingSignal = result.signals.find(s => s.signal === 'major_bleeding')
      expect(bleedingSignal).toBeUndefined()
    })

    it('does NOT trigger stroke_signs when negated', () => {
      const context: UserHealthContext = {
        concern: 'head',
        symptoms: ['suddenly my face did NOT drop', 'speech is not slurred'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const strokeSignal = result.signals.find(s => s.signal === 'stroke_signs')
      expect(strokeSignal).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // Historical vs current symptoms
  //
  // Time words like "yesterday", "ago", "earlier" do NOT automatically
  // mean a symptom is resolved. Only suppress when wording clearly
  // describes a resolved or remote event.
  // -----------------------------------------------------------------------
  describe('historical vs current symptoms', () => {
    it('does NOT trigger for seizure when I was a child', () => {
      const context: UserHealthContext = {
        concern: 'seizure',
        symptoms: ['I had a seizure when I was a child'],
        duration: 'years ago',
      }
      const result = evaluateEmergencySafety(context)
      const seizureSignal = result.signals.find(s => s.signal === 'active_seizure')
      expect(seizureSignal).toBeUndefined()
    })

    it('does NOT trigger for trouble breathing two years ago', () => {
      const context: UserHealthContext = {
        concern: 'breathing',
        symptoms: ['I had trouble breathing two years ago'],
        duration: 'two years ago',
      }
      const result = evaluateEmergencySafety(context)
      const breathingSignal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(breathingSignal).toBeUndefined()
    })

    it('does NOT trigger for passed out last year', () => {
      const context: UserHealthContext = {
        concern: 'fainting',
        symptoms: ['I passed out last year'],
        duration: 'last year',
      }
      const result = evaluateEmergencySafety(context)
      const consciousnessSignal = result.signals.find(s => s.signal === 'loss_of_consciousness')
      expect(consciousnessSignal).toBeUndefined()
    })

    it('does NOT trigger for historical chest pain that resolved', () => {
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['I had chest pain previously but it resolved'],
        duration: 'previously',
      }
      const result = evaluateEmergencySafety(context)
      const chestSignal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(chestSignal).toBeUndefined()
    })

    // --- Current symptoms MUST NOT be suppressed ---

    it('triggers for struggling to breathe since yesterday (current)', () => {
      const context: UserHealthContext = {
        concern: 'breathing',
        symptoms: ['struggling to breathe since yesterday'],
        duration: 'since yesterday',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const breathingSignal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(breathingSignal).toBeDefined()
    })

    it('triggers for bleeding an hour ago that still won\'t stop (current)', () => {
      const context: UserHealthContext = {
        concern: 'bleeding',
        symptoms: ['started bleeding an hour ago and it still won\'t stop'],
        duration: 'an hour ago',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const bleedingSignal = result.signals.find(s => s.signal === 'major_bleeding')
      expect(bleedingSignal).toBeDefined()
    })

    it('triggers for chest pain earlier with breathing difficulty still present (current)', () => {
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['had chest pain earlier and I still have it now, struggling to breathe'],
        duration: 'earlier',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const chestSignal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(chestSignal).toBeDefined()
    })
  })

  // -----------------------------------------------------------------------
  // A. Airway compromise
  // -----------------------------------------------------------------------
  describe('airway_compromise', () => {
    it('triggers for choking', () => {
      const context: UserHealthContext = {
        concern: 'choking',
        symptoms: [],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'airway_compromise')
      expect(signal).toBeDefined()
      expect(signal?.matchedIndicators).toContain('choking')
    })

    it('triggers for throat swelling', () => {
      const context: UserHealthContext = {
        concern: 'throat swelling',
        symptoms: [],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'airway_compromise')
      expect(signal).toBeDefined()
    })

    it('triggers for tongue swelling', () => {
      const context: UserHealthContext = {
        concern: 'tongue swelling',
        symptoms: [],
        duration: '15 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'airway_compromise')
      expect(signal).toBeDefined()
    })

    it('triggers for can\'t breathe', () => {
      const context: UserHealthContext = {
        concern: 'can\'t breathe',
        symptoms: [],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'airway_compromise')
      expect(signal).toBeDefined()
    })
  })

  // -----------------------------------------------------------------------
  // B. Severe breathing difficulty
  // -----------------------------------------------------------------------
  describe('severe_breathing_difficulty', () => {
    it('triggers for struggling to breathe', () => {
      const context: UserHealthContext = {
        concern: 'struggling to breathe',
        symptoms: [],
        duration: '20 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(signal).toBeDefined()
    })

    it('triggers for severe difficulty breathing', () => {
      const context: UserHealthContext = {
        concern: 'severe difficulty breathing',
        symptoms: [],
        duration: '1 hour',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(signal).toBeDefined()
    })

    it('triggers for gasping for air', () => {
      const context: UserHealthContext = {
        concern: 'gasping for air',
        symptoms: [],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(signal).toBeDefined()
    })

    it('does NOT trigger for mild difficulty breathing without severity modifier', () => {
      const context: UserHealthContext = {
        concern: 'difficulty breathing',
        symptoms: [],
        duration: '2 days',
      }
      const result = evaluateEmergencySafety(context)
      const breathingSignal = result.signals.find(s => s.signal === 'severe_breathing_difficulty')
      expect(breathingSignal).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // C. Loss of consciousness
  // -----------------------------------------------------------------------
  describe('loss_of_consciousness', () => {
    it('triggers for passed out', () => {
      const context: UserHealthContext = {
        concern: 'passed out',
        symptoms: [],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'loss_of_consciousness')
      expect(signal).toBeDefined()
    })

    it('triggers for not waking', () => {
      const context: UserHealthContext = {
        concern: 'not waking',
        symptoms: [],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'loss_of_consciousness')
      expect(signal).toBeDefined()
    })

    it('does NOT trigger for nearly passed out', () => {
      const context: UserHealthContext = {
        concern: 'dizzy',
        symptoms: ['nearly passed out'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const consciousnessSignal = result.signals.find(s => s.signal === 'loss_of_consciousness')
      expect(consciousnessSignal).toBeUndefined()
    })

    it('does NOT trigger for almost passed out', () => {
      const context: UserHealthContext = {
        concern: 'dizzy',
        symptoms: ['almost passed out'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const consciousnessSignal = result.signals.find(s => s.signal === 'loss_of_consciousness')
      expect(consciousnessSignal).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // D. Major bleeding
  // -----------------------------------------------------------------------
  describe('major_bleeding', () => {
    it('triggers for bleeding heavily', () => {
      const context: UserHealthContext = {
        concern: 'cut',
        symptoms: ['bleeding heavily'],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'major_bleeding')
      expect(signal).toBeDefined()
    })

    it('triggers for severe bleeding', () => {
      const context: UserHealthContext = {
        concern: 'wound',
        symptoms: ['severe bleeding'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'major_bleeding')
      expect(signal).toBeDefined()
    })

    it('triggers for uncontrolled bleeding', () => {
      const context: UserHealthContext = {
        concern: 'injury',
        symptoms: ['uncontrolled bleeding'],
        duration: '15 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'major_bleeding')
      expect(signal).toBeDefined()
    })
  })

  // -----------------------------------------------------------------------
  // E. Severe allergic reaction
  // -----------------------------------------------------------------------
  describe('severe_allergic_reaction', () => {
    it('triggers for throat swelling with breathing difficulty', () => {
      const context: UserHealthContext = {
        concern: 'allergic reaction',
        symptoms: ['throat swelling', 'difficulty breathing'],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'severe_allergic_reaction')
      expect(signal).toBeDefined()
    })

    it('triggers for mouth swelling with wheezing', () => {
      const context: UserHealthContext = {
        concern: 'allergic reaction',
        symptoms: ['mouth swelling', 'wheezing'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'severe_allergic_reaction')
      expect(signal).toBeDefined()
    })

    it('does NOT trigger for swelling without breathing involvement', () => {
      const context: UserHealthContext = {
        concern: 'allergic reaction',
        symptoms: ['throat swelling'],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const allergicSignal = result.signals.find(s => s.signal === 'severe_allergic_reaction')
      expect(allergicSignal).toBeUndefined()
    })

    it('does NOT trigger for breathing difficulty without swelling', () => {
      const context: UserHealthContext = {
        concern: 'allergic reaction',
        symptoms: ['difficulty breathing'],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const allergicSignal = result.signals.find(s => s.signal === 'severe_allergic_reaction')
      expect(allergicSignal).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // F. Stroke signs
  // -----------------------------------------------------------------------
  describe('stroke_signs', () => {
    it('triggers for sudden face drooping with slurred speech', () => {
      const context: UserHealthContext = {
        concern: 'sudden symptoms',
        symptoms: ['face dropped', 'slurred speech'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'stroke_signs')
      expect(signal).toBeDefined()
    })

    it('triggers for sudden arm numbness with speech difficulty', () => {
      const context: UserHealthContext = {
        concern: 'sudden symptoms',
        symptoms: ['arm numb', 'speech difficulty'],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'stroke_signs')
      expect(signal).toBeDefined()
    })

    it('does NOT trigger without sudden onset', () => {
      const context: UserHealthContext = {
        concern: 'face',
        symptoms: ['face drooping', 'slurred speech'],
        duration: '2 days',
      }
      const result = evaluateEmergencySafety(context)
      const strokeSignal = result.signals.find(s => s.signal === 'stroke_signs')
      expect(strokeSignal).toBeUndefined()
    })

    it('does NOT trigger for neurological symptoms without sudden onset', () => {
      const context: UserHealthContext = {
        concern: 'weakness',
        symptoms: ['arm weak', 'difficulty speaking'],
        duration: '1 week',
      }
      const result = evaluateEmergencySafety(context)
      const strokeSignal = result.signals.find(s => s.signal === 'stroke_signs')
      expect(strokeSignal).toBeUndefined()
    })
  })

  // -----------------------------------------------------------------------
  // G. High-risk chest symptoms
  //
  // Chest symptom alone does NOT trigger.
  // Must have chest symptom + at least one high-risk feature.
  // -----------------------------------------------------------------------
  describe('high_risk_chest_symptoms', () => {
    it('does NOT trigger for bare chest soreness after exercising', () => {
      const context: UserHealthContext = {
        concern: 'chest soreness after exercising',
        symptoms: [],
        duration: '1 hour',
      }
      const result = evaluateEmergencySafety(context)
      const chestSignal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(chestSignal).toBeUndefined()
    })

    it('does NOT trigger for mild chest discomfort alone', () => {
      const context: UserHealthContext = {
        concern: 'chest discomfort',
        symptoms: [],
        duration: '2 hours',
      }
      const result = evaluateEmergencySafety(context)
      const chestSignal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(chestSignal).toBeUndefined()
    })

    it('does NOT trigger for chest tightness alone', () => {
      const context: UserHealthContext = {
        concern: 'chest tightness',
        symptoms: [],
        duration: '30 minutes',
      }
      const result = evaluateEmergencySafety(context)
      const chestSignal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(chestSignal).toBeUndefined()
    })

    it('triggers for severe chest pain with struggling to breathe', () => {
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['struggling to breathe'],
        duration: '20 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(signal).toBeDefined()
    })

    it('triggers for chest pain with passed out', () => {
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['passed out'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(signal).toBeDefined()
    })

    it('triggers for crushing chest pain (crushing is severity modifier)', () => {
      const context: UserHealthContext = {
        concern: 'crushing chest pain',
        symptoms: [],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(signal).toBeDefined()
    })

    it('triggers for chest pain with difficulty breathing', () => {
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['difficulty breathing'],
        duration: '20 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(signal).toBeDefined()
    })

    it('triggers for chest pain with collapse', () => {
      const context: UserHealthContext = {
        concern: 'chest pain',
        symptoms: ['collapsed'],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'high_risk_chest_symptoms')
      expect(signal).toBeDefined()
    })
  })

  // -----------------------------------------------------------------------
  // H. Active seizure
  // -----------------------------------------------------------------------
  describe('active_seizure', () => {
    it('triggers for seizure happening now', () => {
      const context: UserHealthContext = {
        concern: 'seizure happening now',
        symptoms: [],
        duration: '5 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'active_seizure')
      expect(signal).toBeDefined()
    })

    it('triggers for repeated seizures', () => {
      const context: UserHealthContext = {
        concern: 'repeated seizures',
        symptoms: [],
        duration: '30 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'active_seizure')
      expect(signal).toBeDefined()
    })

    it('triggers for prolonged seizure', () => {
      const context: UserHealthContext = {
        concern: 'prolonged seizure',
        symptoms: [],
        duration: '10 minutes',
      }
      const result = evaluateEmergencySafety(context)
      expect(result.triggered).toBe(true)
      const signal = result.signals.find(s => s.signal === 'active_seizure')
      expect(signal).toBeDefined()
    })

    it('does NOT trigger for historical seizure when I was a child', () => {
      const context: UserHealthContext = {
        concern: 'seizure',
        symptoms: ['I had a seizure when I was a child'],
        duration: 'years ago',
      }
      const result = evaluateEmergencySafety(context)
      const seizureSignal = result.signals.find(s => s.signal === 'active_seizure')
      expect(seizureSignal).toBeUndefined()
    })
  })
})
