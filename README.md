# Hanya

Know where to go next.

Hanya is an AI-assisted healthcare navigation prototype that helps people understand where to seek care without attempting to diagnose them.

## Problem

People often know something is wrong before they know what kind of care they need. They may be unsure whether to seek urgent care, book a routine visit, look for a specialist, check insurance fit, or gather more information first.

Hanya focuses on the practical next step: where to go next, what kind of care may be appropriate, and which provider options may fit the user's stated context.

## What Hanya Does

- Collects the user's concern through a guided conversation.
- Extracts structured health-navigation context from what the user shares.
- Checks predefined emergency safety signals before normal navigation.
- Recommends a care pathway such as emergency care, urgent care, primary care, specialist care, pharmacy care, or self-care guidance.
- Helps discover MVP provider options by location, specialty, and listed insurance acceptance.
- Preserves a clear boundary between navigation support and professional medical advice.

## Product Principles

- Hanya is a navigator, not a diagnostician.
- The core product question is: "What should I do next?"
- Safety and trust take priority over novelty.
- The application should make the next step obvious.
- AI can help interpret language, but deterministic product logic owns safety and pathway decisions.

## System Architecture

```text
User
↓
Conversation UI
↓
AI-assisted context extraction
↓
Structured UserHealthContext
↓
Deterministic Safety Engine
↓
Deterministic Care Pathway Engine
↓
Navigation Recommendation
↓
Provider Discovery
```

The LLM does not directly determine the healthcare pathway. It extracts structured context and can produce conversational responses. The deterministic safety engine and deterministic care pathway engine decide how the product navigates from that context.

## AI Responsibility Boundary

The AI may:

- Interpret natural-language input.
- Extract structured fields such as concern, symptoms, duration, severity description, location, specialty, and insurance when stated.
- Ask clarifying questions.
- Produce conversational text that supports the navigation flow.

The AI must not:

- Diagnose conditions.
- Prescribe treatment or medication.
- Determine emergency classification.
- Select the final care pathway.
- Rank providers.
- Verify insurance coverage or appointment availability.
- Replace emergency services or professional medical advice.

## Safety Model

Emergency handling is deterministic and intentionally conservative. The app evaluates structured context with `evaluateEmergencySafety()` before normal pathway generation.

If predefined emergency signals are detected, Hanya recommends calling Nigeria's emergency number, `112`. Hanya does not offer emergency-facility discovery because the current provider data does not reliably identify emergency-capable facilities.

Important safety limitation: absence of a detected emergency signal does not establish medical safety. The emergency detector is deliberately limited and is not a comprehensive triage system.

## AI Fallback

`VITE_AI_MODE` controls the AI implementation:

- `mock` uses local structured extraction through `MockAIService`.
- `openai` calls Hanya's server endpoint at `/api/ai/navigate` through `OpenAIAIService`.

If the OpenAI-backed client request fails, the app falls back to local mock extraction so the Navigator can continue. Local fallback extraction is less capable than OpenAI mode.

## Provider Discovery

Provider discovery is application logic, not medical judgment. It uses MVP provider data and ranks matches by stated navigation criteria such as location, specialty, provider type, and listed insurance acceptance.

Insurance language is limited to whether a provider is listed as accepting a selected plan. Hanya does not guarantee coverage, eligibility, cost, referral requirements, or claim approval.

## Location Behavior

Hanya supports limited device-location mapping for Lagos, Abuja, Ibadan, and Port Harcourt. Unsupported coordinates do not silently map to a default city. If browser location is unavailable, denied, timed out, or outside supported coordinate ranges, the user can enter a city or area manually.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Vitest
- OpenAI SDK for server-side OpenAI mode

## Project Structure

```text
src/app/                         App shell and routes
src/features/marketing/          Landing page and product marketing UI
src/features/navigator/          Navigator UI, hooks, data, and deterministic engines
src/features/navigator/engine/   Safety, pathway, provider matching, and navigation logic
src/services/ai/                 AI service boundary, OpenAI client adapter, and mock fallback
src/shared/                      Shared types, config, and utilities
server/                          Vite development server AI endpoint
docs/                            Product and engine documentation
```

## Running Locally

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## OpenAI Configuration

The implementation uses only these environment variables:

- `VITE_AI_MODE`: client-side mode selector, `mock` or `openai`.
- `OPENAI_API_KEY`: server-side OpenAI API key for `/api/ai/navigate`.
- `OPENAI_MODEL`: optional server-side OpenAI model name; defaults to `gpt-4o-mini`.

Do not expose a real OpenAI key in client code or commit one to the repository. In OpenAI mode, relevant conversation/context is sent through Hanya's server endpoint for AI processing. The current MVP does not require user accounts for the Navigator. This README does not claim medical-grade privacy, HIPAA compliance, encryption guarantees, or data-retention guarantees.

## Testing

Current verified test result: 259 passing tests across 12 test files.

Verification commands used for this documentation pass:

```bash
npx tsc --noEmit
npx vitest run
npx vite build
```

## MVP Limitations

- Hanya is not a diagnostic product.
- Hanya is a portfolio prototype, not a clinically validated healthcare product.
- Emergency detection is deliberately limited.
- No detected emergency signal does not mean the user is medically safe.
- Hanya does not prescribe medication or treatment.
- Hanya does not provide live appointment availability.
- Hanya does not guarantee insurance coverage.
- Provider information is MVP data and may be incomplete or outdated.
- Device-location mapping is limited and includes manual recovery when unsupported.
- Local fallback extraction is less capable than OpenAI-backed extraction.
- Emergency-facility discovery is not supported by the current provider data.
- The server endpoint is implemented for prototype OpenAI processing, not production clinical infrastructure.

## Project Status

Hanya is in MVP prototype status. The current architecture separates AI-assisted extraction from deterministic safety, care pathway, and provider discovery logic. Further work should preserve that boundary unless the product requirements and safety model are explicitly redesigned.
