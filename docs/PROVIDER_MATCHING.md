# Stage 5 — Provider Matching & Ranking Engine

## Purpose

Stage 5 turns a user's navigation outcome into transparent provider matches using mock provider data.

**This is NOT a medical provider recommendation engine.**

The system must not claim that a provider is clinically the "best" provider for the user's condition.

The system answers:

> "Which available providers match the user's stated navigation needs and preferences?"

---

## Architecture

```
User conversation
  ↓
AI extracts structured context
  ↓
Stage 4B Emergency Safety Engine
  ↓
Stage 4C Care Pathway Engine
  ↓
Stage 5 Provider Matching
  ↓
Ranked provider results
  ↓
User chooses provider
```

The LLM must NOT rank providers. Provider matching and ranking is deterministic application logic.

---

## Provider Match Model

```ts
export type ProviderMatchReason =
  | 'specialty_match'
  | 'provider_type_match'
  | 'location_match'
  | 'insurance_match'
  | 'available'
  | 'lower_cost'
  | 'high_rating'
  | 'nearby'

export interface ProviderMatch {
  provider: Provider
  score: number
  matchReasons: ProviderMatchReason[]
  insuranceStatus: 'accepted' | 'not_accepted' | 'unknown'
  distanceKm: number | null
}
```

### Score Meaning

The score is an **APPLICATION RANKING SCORE**. It represents how well a provider matches the user's stated navigation criteria.

It is NOT:
- Medical confidence
- Diagnostic confidence
- Clinical suitability
- Treatment quality score

---

## Ranking Factors & Weights

| Factor | Weight | Description |
|--------|--------|-------------|
| Specialty match | 30 | Strong — user explicitly requested this type |
| Provider type match | 15 | Strong — clinic/hospital/telehealth match |
| City match | 15 | Medium — provider is in the searched city |
| Insurance match | 12 | Medium — provider accepts user's insurance |
| Area match | 10 | Medium — provider is in the searched area |
| Availability | 8 | Medium — provider is currently available |
| Distance | 5 | Minor — closer providers get slight advantage |
| Rating | 3 | Minor — rating is demo data, not dominant |
| Cost | 2 | Minor — lower cost gets slight advantage |

---

## Hard Filters vs Ranking Factors

### Hard Filters (only when explicitly required)

**Specialty**: If the user explicitly requested a dermatologist, non-dermatology providers do not appear as direct matches. Multi-Specialty Hospitals match any specialty request.

**Location**: If searching Lagos, Abuja providers are excluded. Telehealth providers are always included.

### Ranking Factors (soft)

**Insurance**: Do NOT remove providers that don't accept the user's insurance. Instead, they appear lower with `insuranceStatus: 'not_accepted'`. This gives the user alternatives.

**Availability**: Unavailable providers remain visible but rank below available alternatives.

**Distance**: Closer providers get a slight advantage when coordinates are available.

---

## Search Context

```ts
export interface ProviderSearchContext {
  pathway?: CarePathway
  specialty?: string
  providerType?: Provider['type']
  city?: string
  area?: string
  insurance?: string
  userCoordinates?: { lat: number; lng: number }
}
```

Only uses fields actually known from application state. Does not invent missing user preferences.

---

## Specialty Normalization

Users may describe specialties differently. Deterministic normalization maps common terms to standard specialties.

| User Input | Standard Specialty |
|------------|-------------------|
| skin doctor | Dermatology |
| dermatologist | Dermatology |
| heart doctor | Cardiology |
| cardiologist | Cardiology |
| general doctor | General Practice |
| primary care doctor | General Practice |
| physio | Physiotherapy |
| eye doctor | Ophthalmology |
| dentist | Dentistry |
| child doctor | Pediatrics |

The supported vocabulary is deliberately small and explicit.

**Important**: "I need a dermatologist" may normalize to Dermatology. But "I have a rash" must NOT automatically become Dermatology. The system does NOT infer specialties from symptoms.

---

## Pathway Mapping

| Pathway | Provider Search Behavior |
|---------|------------------------|
| `primary_care` | Default search for General Practice, Family Medicine, clinics |
| `provider_or_specialist` | Use explicitly stated specialty/provider intent |
| `prompt_medical_review` | Search for general medical assessment — do NOT translate to specific specialty |
| `informational_navigation` | Do NOT automatically trigger provider search |

---

## Location

- Browser location when user grants permission
- Manually entered location when browser location is unavailable/denied
- Never silently assumes the user's exact location
- Provider search supports city, area, and coordinates

---

## Distance

Uses Haversine formula for geographical distance calculation. Returns distance in kilometres. Only calculated when both user and provider have coordinates.

---

## Insurance Compatibility

Insurance status uses three states:
- `accepted` — provider lists the insurance plan
- `not_accepted` — provider does not list it
- `unknown` — no insurance specified

**Do NOT claim "Your visit is covered."** Provider acceptance and actual insurance coverage are different.

Preferred wording: "This provider is listed as accepting your selected insurance plan."

---

## Match Explanation

Every result explains why it appears through `matchReasons`. The UI displays these as "Why this matches" labels.

Do not expose the raw numeric score prominently to users.

---

## Provider Data

Mock provider data is **demo data**. All providers are fictional. Do not fabricate real hospitals and present them as factual providers.

Provider data includes: specialties, insurance, availability, price, ratings, location, coordinates, provider types across Lagos, Abuja, Port Harcourt, Ibadan, and Ilorin.

---

## Emergency Boundary

Stage 5 must NEVER override Stage 4B. If an emergency signal appears: Stage 4B emergency → Emergency UI. NOT: Provider matching → Here are some clinics.

---

## AI Boundary

The AI may extract:
- Explicit specialty request
- Location stated by user
- Insurance stated by user

The AI must NOT:
- Rank providers
- Choose the "best" doctor
- Infer specialty from symptoms
- Determine provider quality
- Determine insurance coverage
- Fabricate provider information

All ranking is application-controlled.

---

## Known Limitations

1. Specialty normalization vocabulary is deliberately small — uncommon specialties may not normalize
2. Distance calculation is approximate (Haversine)
3. Ratings are demo data and should not be treated as real public reviews
4. Insurance matching checks list membership, not actual coverage
5. Availability is mock data — does not reflect real appointment slots
6. The system cannot assess clinical suitability — only match against stated criteria
