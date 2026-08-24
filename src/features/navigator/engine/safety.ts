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

// ---------------------------------------------------------------------------
// Historical vs current context detection
//
// Time words like "yesterday", "ago", "earlier" do NOT automatically mean
// a symptom is resolved or historical. Only suppress when the wording
// clearly describes a resolved or remote event.
//
// Current indicators override historical markers:
//   "since yesterday" → current
//   "an hour ago and it still won't stop" → current
//   "earlier and I still have it now" → current
//
// Only suppress when NO current indicators are present alongside the
// historical markers.
// ---------------------------------------------------------------------------

const CURRENT_INDICATORS = [
  'since ', 'still ', 'and still ', 'right now', 'and now',
  'is happening', 'won\'t stop', 'will not stop', 'hasn\'t stopped',
  'has not stopped', 'ongoing', 'continuing', 'persisting',
]

const RESOLVED_OR_REMOTE_PATTERNS = [
  // "I had X when I was a child"
  'when i was',
  'as a child',
  // "I had X two years ago" (without current indicators)
  'years ago',
  'a long time ago',
  'back then',
  // "I had X last year/week/month" (without current indicators)
  'last year',
  'last week',
  'last month',
  // "I previously had X"
  'previously',
  'in the past',
]

function isResolvedOrRemoteContext(text: string): boolean {
  const lower = text.toLowerCase()

  // If ANY current indicator is present, the symptom is ongoing — do not suppress
  if (CURRENT_INDICATORS.some(indicator => lower.includes(indicator))) {
    return false
  }

  // Check for resolved/remote patterns
  if (RESOLVED_OR_REMOTE_PATTERNS.some(pattern => lower.includes(pattern))) {
    return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Safety signal definitions
// ---------------------------------------------------------------------------

interface SafetySignalRule {
  signal: SafetySignal
  check: (context: UserHealthContext) => SafetySignalMatch | null
}

function combineText(context: UserHealthContext): string {
  return [context.concern, ...context.symptoms, context.duration].filter(Boolean).join(' ').toLowerCase()
}

// Shared helper: check if any keyword in a list matches (not negated)
function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some(kw => {
    if (hasNegation(text, kw)) return false
    return text.includes(kw)
  })
}

const SAFETY_SIGNAL_RULES: SafetySignalRule[] = [
  // A. Airway compromise / choking
  {
    signal: 'airway_compromise',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const airwayKeywords = [
        'choking', 'airway blocked', 'throat swelling',
        'tongue swelling', 'can\'t breathe', 'unable to breathe',
        'can\'t speak', 'unable to speak',
      ]

      if (!hasAnyKeyword(combined, airwayKeywords)) return null
      if (isResolvedOrRemoteContext(combined)) return null

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

      const strongPhrases = [
        'struggling to breathe', 'cannot breathe', 'can\'t breathe',
        'gasping for air', 'unable to breathe',
      ]

      const hasStrong = hasAnyKeyword(combined, strongPhrases)
      const hasBreathingKeyword = hasAnyKeyword(combined, breathingKeywords)

      if (!hasStrong && !hasBreathingKeyword) return null
      if (isResolvedOrRemoteContext(combined)) return null

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

      if (!hasAnyKeyword(combined, consciousnessKeywords)) return null
      if (isResolvedOrRemoteContext(combined)) return null

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
        'won\'t stop bleeding', 'will not stop bleeding',
        'bleeding won\'t stop', 'bleeding that won\'t stop',
      ]

      // Also check for "bleeding" + "won't stop" as a combination
      // to match natural phrasing like "bleeding an hour ago and it still won't stop"
      const hasExactMatch = bleedingKeywords.some(kw => {
        if (hasNegation(combined, kw)) return false
        return combined.includes(kw)
      })
      const hasBleedingAndStopIssue =
        combined.includes('bleeding') &&
        (combined.includes('won\'t stop') || combined.includes('will not stop'))

      if (!hasExactMatch && !hasBleedingAndStopIssue) return null
      if (isResolvedOrRemoteContext(combined)) return null

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

      const swellingKeywords = [
        'tongue swelling', 'mouth swelling', 'throat swelling',
        'swollen tongue', 'swollen mouth', 'swollen throat',
        'swelling of tongue', 'swelling of mouth', 'swelling of throat',
      ]

      const breathingKeywords = [
        'difficulty breathing', 'struggling to breathe',
        'wheezing', 'can\'t breathe', 'airway',
      ]

      const hasSwelling = hasAnyKeyword(combined, swellingKeywords)
      const hasBreathing = hasAnyKeyword(combined, breathingKeywords)

      if (!hasSwelling || !hasBreathing) return null
      if (isResolvedOrRemoteContext(combined)) return null

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

      const suddenOnset = ['suddenly', 'sudden', 'just now', 'just happened', 'out of nowhere']
      const hasSudden = suddenOnset.some(s => combined.includes(s))
      if (!hasSudden) return null

      const neurologicalSigns = [
        'stroke', 'face dropped', 'face drooping', 'facial weakness',
        'arm numb', 'arm weak', 'arm weakness', 'numbness in arm',
        'speech slurred', 'speech difficulty', 'slurred speech',
        'can\'t speak', 'difficulty speaking',
      ]

      if (!hasAnyKeyword(combined, neurologicalSigns)) return null
      if (isResolvedOrRemoteContext(combined)) return null

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
  //
  // Chest symptom alone does NOT trigger. Must have a concerning combination:
  //   chest symptom + at least one high-risk feature.
  //
  // High-risk features:
  //   - Severe breathing difficulty keywords
  //   - Loss of consciousness keywords
  //   - Collapse/sudden deterioration
  //   - "crushing" as severity modifier (crushing chest pain alone qualifies)
  {
    signal: 'high_risk_chest_symptoms',
    check: (ctx) => {
      const combined = combineText(ctx)
      const indicators: string[] = []

      const chestKeywords = [
        'chest pain', 'chest discomfort', 'chest tightness',
        'pressure in chest', 'crushing chest',
      ]

      if (!hasAnyKeyword(combined, chestKeywords)) return null
      if (isResolvedOrRemoteContext(combined)) return null

      // Check for high-risk features alongside the chest symptom
      const highRiskFeatures = [
        // Breathing difficulty
        'struggling to breathe', 'cannot breathe', 'can\'t breathe',
        'gasping for air', 'unable to breathe', 'severe difficulty breathing',
        'severe shortness of breath', 'difficulty breathing',
        // Loss of consciousness / collapse
        'passed out', 'unconscious', 'collapsed', 'collapse',
        'not waking', 'lost consciousness',
        // "crushing" as severity modifier
        'crushing',
      ]

      const hasHighRiskFeature = hasAnyKeyword(combined, highRiskFeatures)

      if (!hasHighRiskFeature) return null

      // Collect matched indicators
      for (const kw of chestKeywords) {
        if (hasNegation(combined, kw)) continue
        if (combined.includes(kw)) indicators.push(kw)
      }
      for (const kw of highRiskFeatures) {
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

      if (!hasAnyKeyword(combined, seizureKeywords)) return null
      if (isResolvedOrRemoteContext(combined)) return null

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
