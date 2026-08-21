import { UserHealthContext, CareLevel, CareRecommendation, NavigationIntent, NavigationState, NavigationAction, NavigationContext, SafetyResult } from '../../../shared/types'
import { evaluateEmergencySafety as engineEvaluateEmergencySafety, isContextSufficient as engineIsContextSufficient, getMissingContextFields as engineGetMissingContextFields, evaluateNavigation as engineEvaluateNavigation, determineCareLevel as engineDetermineCareLevel, buildRecommendation as engineBuildRecommendation } from '../engine'

export function evaluateEmergencySafety(context: UserHealthContext): SafetyResult {
  return engineEvaluateEmergencySafety(context)
}

export function isContextSufficient(intent: NavigationIntent, context: UserHealthContext): boolean {
  return engineIsContextSufficient(intent, context)
}

export function getMissingContextFields(intent: NavigationIntent, context: UserHealthContext): string[] {
  return engineGetMissingContextFields(intent, context)
}

export function evaluateNavigation(navContext: NavigationContext): NavigationAction {
  return engineEvaluateNavigation(navContext)
}

export function determineCareLevel(context: UserHealthContext): CareLevel {
  return engineDetermineCareLevel(context)
}

export function buildRecommendation(context: UserHealthContext, careLevel: CareLevel): CareRecommendation {
  return engineBuildRecommendation(context, careLevel)
}

export type { NavigationIntent, NavigationState, NavigationAction, NavigationContext, SafetyResult }
