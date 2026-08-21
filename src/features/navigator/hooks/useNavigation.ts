import { UserHealthContext, NavigationIntent, NavigationState, NavigationAction, NavigationContext, SafetyResult, CareNavigationContext, CarePathwayResult } from '../../../shared/types'
import { evaluateEmergencySafety as engineEvaluateEmergencySafety, isContextSufficient as engineIsContextSufficient, getMissingContextFields as engineGetMissingContextFields, evaluateNavigation as engineEvaluateNavigation, evaluateCarePathway as engineEvaluateCarePathway } from '../engine'

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

export function evaluateCarePathway(context: CareNavigationContext): CarePathwayResult {
  return engineEvaluateCarePathway(context)
}

export type { NavigationIntent, NavigationState, NavigationAction, NavigationContext, SafetyResult, CareNavigationContext, CarePathwayResult }
