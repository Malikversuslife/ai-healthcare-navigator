import {
  UserHealthContext,
  NavigationIntent,
  SafetySignal,
  SafetySignalMatch,
  SafetyResult,
} from '../../../shared/types'

// ---------------------------------------------------------------------------
// Stage 4B — Emergency Safety Engine v1
//
// This is NOT a diagnostic engine.
// This is NOT a comprehensive clinical triage system.
//
// The sole purpose is to detect a deliberately limited set of predefined
// high-risk signals that should interrupt normal navigation and direct
// the user toward emergency care.
//
// NO MATCH ≠ SAFE
// Never represent a negative safety result as medical clearance.
//
// This prototype safety engine is not comprehensive clinical triage and
// must not be used as a substitute for professional medical assessment.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Negation detection
// ---------------------------------------------------------------------------

const NEGATION_PREFIXES = [
  'no ', 'not ', "don't ", 'do not ', "doesn't ", 'does not ',
  "didn't ", 'did not ', "won't ", 'will not ', "can't ", 'cannot ',
  'never ', 'without ', 'no longer ',
]

const POST_KEYWORD_NEGATION = [
  ' is not', ' is no', " isn't", ' was not', " wasn't",
  ' is not happening', ' not happening',
]

const HISTORICAL_MARKERS = [
  'yesterday', 'last week', 'last month', 'last year',
  'ago', 'previously', 'before', 'earlier', 'in the past',
  'when i was', 'as a child', 'when i was a child',
  'two years ago', 'a few years ago', 'years ago',
  'a long time ago', 'back then',
]

function hasNegation(text: string, keyword: string): boolean {
  const lower = text.toLowerCase()
  const kwLower = keyword.toLowerCase()
  const idx = lower.indexOf(kwLower)
  if (idx === -1) return false

  // Check BEFORE the keyword: look for negation words within 80 chars
  const before = lower.substring(Math.max(0, idx - 80), idx)
  if (NEGATION_PREFIXES.some(prefix => before.includes(prefix))) return true

  // Check AFTER the keyword (e.g. "cannot breathe is not happening")
  const after = lower.substring(idx + kwLower.length, idx + kwLower.length + 30)
  if (POST_KEYWORD_NEGATION.some(suffix => after.startsWith(suffix))) return true

  return false
}

function isHistoricalContext(text: string): boolean {
  const lower = text.toLowerCase()
  return HISTORICAL_MARKERS.some(marker => lower.includes(marker))
}

// ---------------------------------------------------------------------------
// Safety signal definitions
// ---------------------------------------------------------------------------

interface SafetySignalRule {
  signal: SafetySignal
  check: (context: UserHealthContext) => SafetySignalMatch | null
}

function combineText(context: UserHealthContext): string {
  return [context.concern, ...context.symptoms].join(' ').toLowerCase()
}

const SAFETY_SIGNAL_RULES: SafetySignalRule[] = [
  // A. Airway compromise / choking
  {
    signal: 'airway_compromise',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      // Must have airway-related keywords
      const airwayKeywords = [
        'choking', 'airway blocked', 'throat swelling',
        'tongue swelling', 'can\'t breathe', 'unable to breathe',
        'can\'t speak', 'unable to speak',
      ]

      const hasAirway = airwayKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasAirway) return null

      // Must NOT be clearly historical
      if (isHistoricalContext(combined)) return null

      // Collect matched indicators
      for (const kw of airwayKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'airway_compromise',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // B. Severe breathing difficulty
  {
    signal: 'severe_breathing_difficulty',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const breathingKeywords = [
        'struggling to breathe', 'cannot breathe', 'can\'t breathe',
        'gasping for air', 'severe shortness of breath',
        'unable to breathe', 'difficulty breathing',
      ]

      // Must have severity modifier OR a strong breathing phrase
      const strongPhrases = [
        'struggling to breathe', 'cannot breathe', 'can\'t breathe',
        'gasping for air', 'unable to breathe',
      ]

      const hasStrong = strongPhrases.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      const hasBreathingKeyword = breathingKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasStrong && !hasBreathingKeyword) return null
      if (isHistoricalContext(combined)) return null

      // For weaker phrases like "difficulty breathing", require severity modifier
      if (!hasStrong) {
        const severityModifiers = ['severe', 'very', 'extremely', 'bad', 'terrible']
        const hasSeverity = severityModifiers.some(m => combined.includes(m))
        if (!hasSeverity) return null
      }

      for (const kw of breathingKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'severe_breathing_difficulty',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // C. Loss of consciousness
  {
    signal: 'loss_of_consciousness',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const consciousnessKeywords = [
        'unconscious', 'passed out', 'not waking',
        'cannot wake', 'won\'t wake', 'not responsive',
        'lost consciousness', 'blackout',
      ]

      const hasConsciousness = consciousnessKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasConsciousness) return null
      if (isHistoricalContext(combined)) return null

      // Exclude "nearly passed out" / "almost passed out"
      const nearMiss = ['nearly', 'almost', 'felt like']
      const isNearMiss = nearMiss.some(nm => combined.includes(nm) && combined.includes('pass'))
      if (isNearMiss) return null

      for (const kw of consciousnessKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'loss_of_consciousness',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // D. Major uncontrolled bleeding
  {
    signal: 'major_bleeding',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const bleedingKeywords = [
        'bleeding heavily', 'severe bleeding', 'uncontrolled bleeding',
        'losing a lot of blood', 'rapidly losing blood',
        'bleeding and won\'t stop', 'bleeding and will not stop',
      ]

      const hasBleeding = bleedingKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasBleeding) return null
      if (isHistoricalContext(combined)) return null

      for (const kw of bleedingKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'major_bleeding',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // E. Severe allergic reaction affecting airway/breathing
  {
    signal: 'severe_allergic_reaction',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      // Swelling keywords
      const swellingKeywords = [
        'tongue swelling', 'mouth swelling', 'throat swelling',
        'swollen tongue', 'swollen mouth', 'swollen throat',
        'swelling of tongue', 'swelling of mouth', 'swelling of throat',
      ]

      // Breathing keywords
      const breathingKeywords = [
        'difficulty breathing', 'struggling to breathe',
        'wheezing', 'can\'t breathe', 'airway',
      ]

      const hasSwelling = swellingKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      const hasBreathing = breathingKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      // Must have BOTH swelling AND breathing involvement
      if (!hasSwelling || !hasBreathing) return null
      if (isHistoricalContext(combined)) return null

      for (const kw of [...swellingKeywords, ...breathingKeywords]) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'severe_allergic_reaction',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // F. Stroke-like sudden neurological signs
  {
    signal: 'stroke_signs',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      // Must have sudden onset language
      const suddenOnset = ['suddenly', 'sudden', 'just now', 'just happened', 'out of nowhere']
      const hasSudden = suddenOnset.some(s => combined.includes(s))
      if (!hasSudden) return null

      // Neurological signs (includes direct "stroke" mention)
      const neurologicalSigns = [
        'stroke', 'face dropped', 'face drooping', 'facial weakness',
        'arm numb', 'arm weak', 'arm weakness', 'numbness in arm',
        'speech slurred', 'speech difficulty', 'slurred speech',
        'can\'t speak', 'difficulty speaking',
      ]

      const hasNeurological = neurologicalSigns.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasNeurological) return null
      if (isHistoricalContext(combined)) return null

      for (const kw of neurologicalSigns) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'stroke_signs',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // G. High-risk chest symptoms
  {
    signal: 'high_risk_chest_symptoms',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const chestKeywords = [
        'chest pain', 'chest discomfort', 'chest tightness',
        'pressure in chest', 'crushing chest',
      ]

      const hasChest = chestKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasChest) return null
      if (isHistoricalContext(combined)) return null

      for (const kw of chestKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'high_risk_chest_symptoms',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },

  // H. Active/prolonged seizure
  {
    signal: 'active_seizure',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const seizureKeywords = [
        'seizure happening now', 'having a seizure',
        'repeated seizures', 'seizure and not waking',
        'seizure and hasn\'t regained', 'prolonged seizure',
        'ongoing seizure', 'continuous seizure',
        'seizure without recovery',
      ]

      const hasSeizure = seizureKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })

      if (!hasSeizure) return null
      if (isHistoricalContext(combined)) return null

      for (const kw of seizureKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }

      return {
        signal: 'active_seizure',
        matchedIndicators: indicators,
        source: combined.includes(ctx.concern.toLowerCase()) ? 'concern' : 'symptom',
      }
    },
  },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function evaluateEmergencySafety(
  context: UserHealthContext
): SafetyResult {
  const signals: SafetySignalMatch[] = []

  for (const rule of SAFETY_SIGNAL_RULES) {
    const match = rule.check(context)
    if (match) {
      signals.push(match)
    }
  }

  return {
    triggered: signals.length > 0,
    signals,
  }
}

export function determineIntentFromContext(
  context: UserHealthContext
): NavigationIntent {
  if (context.concern || context.symptoms.length > 0) {
    return 'symptom_navigation'
  }
  return 'general_healthcare'
}

// Re-export types for convenience
export type { SafetySignal, SafetySignalMatch, SafetyResult }
