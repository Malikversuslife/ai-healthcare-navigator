import {
  CareNavigationContext,
  CarePathwayResult,
  NavigationEscalationFactor,
  UserHealthContext,
} from '../../../shared/types'

// ---------------------------------------------------------------------------
// Stage 4C — Non-Emergency Care Navigation Foundation
//
// This determines the appropriate NAVIGATION PATHWAY, not diagnosis.
//
// Stage 4B emergency must have already returned no supported signal
// before this function is called.
//
// NO EMERGENCY SIGNAL ≠ MEDICALLY SAFE.
// This product is a healthcare navigator, not a diagnostic system.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Escalation factor detection
//
// A deliberately limited set of general escalation factors.
// No disease-specific rules. No severity thresholds. No duration thresholds.
// ---------------------------------------------------------------------------

function detectEscalationFactors(
  context: UserHealthContext
): NavigationEscalationFactor[] {
  const factors: NavigationEscalationFactor[] = []
  const lowerConcern = context.concern.toLowerCase()
  const lowerSymptoms = context.symptoms.map(s => s.toLowerCase()).join(' ')
  const combined = `${lowerConcern} ${lowerSymptoms}`

  // Rapidly worsening
  if (context.symptomTrend === 'rapidly_worsening') {
    factors.push('rapidly_worsening')
  } else if (
    combined.includes('rapidly worsen') ||
    combined.includes('getting worse quickly') ||
    combined.includes('getting much worse') ||
    combined.includes('suddenly worse')
  ) {
    factors.push('rapidly_worsening')
  }

  // Significant functional impact
  if (context.functionalImpact?.level === 'significant') {
    factors.push('significant_functional_impact')
  } else if (
    combined.includes("can't work") ||
    combined.includes('unable to work') ||
    combined.includes("can't get out of bed") ||
    combined.includes('unable to get out of bed') ||
    combined.includes("can't go to work") ||
    combined.includes('unable to go to work') ||
    combined.includes("can't function") ||
    combined.includes('unable to function') ||
    combined.includes("can't do normal") ||
    combined.includes('unable to do normal') ||
    combined.includes('haven\'t been able to go to work') ||
    combined.includes('cannot go to work') ||
    combined.includes('bedridden')
  ) {
    factors.push('significant_functional_impact')
  }

  // Recurrent worsening
  if (context.symptomTrend === 'worsening') {
    // Check if this is a recurrent pattern
    if (
      combined.includes('recurring') ||
      combined.includes('keeps coming back') ||
      combined.includes('keeps returning') ||
      combined.includes('happening again') ||
      combined.includes('getting worse each time') ||
      combined.includes('worse each episode')
    ) {
      factors.push('recurrent_worsening')
    }
  }

  // Persistent concerning change
  if (
    combined.includes('persistent') ||
    combined.includes('ongoing') ||
    combined.includes('hasn\'t improved') ||
    combined.includes('has not improved') ||
    combined.includes('not getting better') ||
    combined.includes('not improving') ||
    combined.includes('still happening') ||
    combined.includes('still going on')
  ) {
    // Only flag as persistent_concerning_change if combined with worsening trend
    // or significant duration mentioned
    if (context.symptomTrend === 'worsening' || context.symptomTrend === 'rapidly_worsening') {
      factors.push('persistent_concerning_change')
    }
  }

  return factors
}

// ---------------------------------------------------------------------------
// Pathway evaluation
//
// Conceptual order:
//   1. General healthcare question → informational_navigation
//   2. Explicit provider/specialist intent → provider_or_specialist
//   3. Supported escalation factors → prompt_medical_review
//   4. Otherwise, sufficient symptom context → primary_care
// ---------------------------------------------------------------------------

export function evaluateCarePathway(
  context: CareNavigationContext
): CarePathwayResult {
  const { intent, healthContext } = context
  const rationale: string[] = []
  const escalationFactors = detectEscalationFactors(healthContext)

  // 1. General healthcare questions → informational_navigation
  if (intent === 'general_healthcare') {
    rationale.push('General healthcare question does not require symptom triage')
    return {
      pathway: 'informational_navigation',
      escalationFactors,
      rationale,
    }
  }

  // 2. Explicit provider/specialist intent → provider_or_specialist
  if (
    intent === 'find_provider' ||
    intent === 'find_hospital'
  ) {
    rationale.push('User is seeking a specific type of healthcare professional or facility')
    return {
      pathway: 'provider_or_specialist',
      escalationFactors,
      rationale,
    }
  }

  // 3. Supported escalation factors → prompt_medical_review
  if (escalationFactors.length > 0) {
    if (escalationFactors.includes('rapidly_worsening')) {
      rationale.push('Symptoms described as rapidly worsening')
    }
    if (escalationFactors.includes('significant_functional_impact')) {
      rationale.push('Reported significant impact on daily functioning')
    }
    if (escalationFactors.includes('recurrent_worsening')) {
      rationale.push('Recurrent episodes appearing to worsen over time')
    }
    if (escalationFactors.includes('persistent_concerning_change')) {
      rationale.push('Persistent symptoms not improving despite ongoing duration')
    }
    return {
      pathway: 'prompt_medical_review',
      escalationFactors,
      rationale,
    }
  }

  // 4. Otherwise → primary_care (navigation default for non-emergency symptom concerns)
  if (intent === 'symptom_navigation' || intent === 'treatment_followup') {
    rationale.push('Non-emergency symptom concern requiring first-contact healthcare navigation')
    return {
      pathway: 'primary_care',
      escalationFactors,
      rationale,
    }
  }

  // 5. Fallback — any other intent with sufficient context
  rationale.push('Healthcare navigation request without escalation factors')
  return {
    pathway: 'primary_care',
    escalationFactors,
    rationale,
  }
}
