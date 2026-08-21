# Stage 4C — Non-Emergency Care Navigation Foundation

## Purpose

Stage 4C determines the appropriate **navigation pathway** after Stage 4B returns no supported emergency signal. It is NOT a diagnostic system and does NOT determine medical urgency.

**Core principle**: This product is a healthcare navigator, not a diagnostician.

## Supported Pathways

```ts
type CarePathway =
  | 'prompt_medical_review'
  | 'primary_care'
  | 'provider_or_specialist'
  | 'informational_navigation'
```

### primary_care
The navigation default for non-emergency symptom concerns requiring first-contact healthcare navigation. Does NOT imply the condition is low-risk.

**Example**: "I've been having recurring headaches for several days."
**Direction**: "Starting with a primary care clinician would be a reasonable next step."

### provider_or_specialist
Used when the user's intent identifies a specific type of healthcare professional.

**Example**: "I need a dermatologist."
**Direction**: "I can help you find the type of healthcare professional you're looking for."

### informational_navigation
Healthcare-system or educational questions that don't require symptom triage.

**Example**: "What does a dermatologist do?"
**Direction**: Answer the navigation question without unnecessary triage.

### prompt_medical_review
Conservative intermediate pathway when escalation factors are detected. NOT equivalent to a diagnosis or urgent care.

**Example**: "This has been getting rapidly worse."
**Direction**: "Because of the changes you've described, it would be reasonable to seek medical assessment promptly."

## Navigation Order

```
User message
↓
AI extraction
↓
Structured context
↓
Stage 4B Safety Engine
↓
Emergency signal?
├── YES → emergency pathway
└── NO
      ↓
Context sufficient?
├── NO → collect missing context
└── YES
      ↓
Stage 4C pathway evaluation
      ↓
Navigation recommendation
```

**Stage 4C MUST NOT bypass Stage 4B.**

## Escalation Factors

```ts
type NavigationEscalationFactor =
  | 'rapidly_worsening'
  | 'significant_functional_impact'
  | 'recurrent_worsening'
  | 'persistent_concerning_change'
```

These are deliberately limited general factors. No disease-specific rules.

### How factors are detected

- **rapidly_worsening**: User describes symptoms as rapidly worsening (via `symptomTrend` or text matching)
- **significant_functional_impact**: User cannot perform normal activities (via `functionalImpact.level` or text matching)
- **recurrent_worsening**: Recurrent episodes that are worsening over time
- **persistent_concerning_change**: Persistent symptoms not improving, combined with worsening trend

## What Stage 4C Does NOT Do

- Does NOT create disease-specific diagnosis rules
- Does NOT use severity alone as a threshold (severity >= 7 → prompt medical review is NOT implemented)
- Does NOT use duration alone as a threshold (3 days → primary care is NOT implemented)
- Does NOT determine medical urgency
- Does NOT replace professional medical assessment

## AI/Application Boundary

### AI may extract:
- concern
- symptoms
- duration
- severity as stated
- symptom trend
- functional impact
- explicit provider intent
- other user-provided context

### AI must NOT return:
- carePathway
- urgency
- careLevel
- emergency
- diagnosis

Application code owns all pathway decisions.

## Existing Intent Routing

Direct navigation is preserved for:
- `find_provider` → provider search
- `find_hospital` → provider search
- `appointment` → appointment flow
- `insurance` → insurance check
- `treatment_followup` → follow-up navigation
- `general_healthcare` → informational navigation

These are NOT forced through symptom intake.

## Recommendation Language

### Primary care
"Starting with a primary care clinician would be a reasonable next step. They can assess your concern and refer you if needed."

### Prompt medical review
"Because of the changes you've described, it would be reasonable to seek medical assessment promptly."

### Provider/specialist
"I can help you find the type of healthcare professional you're looking for."

### Informational
Answer the navigation question without unnecessary triage.

### Never say:
- "You are safe."
- "This isn't serious."
- "You definitely don't need emergency care."
- "You have..."
- "This is probably..."
- "You only need..."
- "There's nothing to worry about."

## Why self_care Is Excluded

Self-care is intentionally not included in Stage 4C. The product should not direct users to self-care without clinical evaluation. All non-emergency pathways lead to healthcare professional evaluation.

## NO EMERGENCY SIGNAL ≠ SAFE

A negative safety result from Stage 4B must never be treated as medical clearance. Stage 4C operates in the space between "no supported emergency" and "needs professional evaluation."

## Limitations

1. Escalation factors are text-based and may miss nuanced descriptions
2. The pathway engine does not have access to clinical knowledge
3. `prompt_medical_review` is conservative by design — it may escalate cases that could be managed at primary care
4. The system cannot detect hidden urgency that isn't expressed in the user's words
5. This is a navigation tool, not a medical assessment

## Clinical Review Requirement

Before production deployment, this pathway logic MUST be reviewed by qualified healthcare professionals. The current implementation is a navigation foundation, not a clinical decision system.
