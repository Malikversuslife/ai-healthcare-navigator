import { UserHealthContext, CareLevel, CareRecommendation, NavigationIntent, NavigationState, NavigationAction, NavigationContext } from '../../../shared/types'
import { containsEmergencyIndicators as engineContainsEmergencyIndicators, isContextSufficient as engineIsContextSufficient, getMissingContextFields as engineGetMissingContextFields, evaluateNavigation as engineEvaluateNavigation, determineCareLevel as engineDetermineCareLevel, buildRecommendation as engineBuildRecommendation } from '../engine'

export function containsEmergencyIndicators(context: UserHealthContext): boolean {
  return engineContainsEmergencyIndicators(context).triggered
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

export type { NavigationIntent, NavigationState, NavigationAction, NavigationContext }
