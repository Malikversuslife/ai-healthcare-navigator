# AI Healthcare Navigator

## Project Role

You are the implementation agent for AI Healthcare Navigator.

This is an AI-powered healthcare navigation product, not a diagnostic tool.

The product helps people understand their next appropriate step in navigating healthcare:

- Determine appropriate care level
- Find appropriate healthcare providers
- Find hospitals and clinics
- Check insurance/HMO coverage
- Book appointments
- Organize treatment plans
- Manage follow-ups
- Organize healthcare information

The AI must NEVER present itself as a doctor or claim to diagnose a medical condition.

---

## Product Principle

The core product question is:

> "What should I do next?"

The product should help users move from uncertainty to an appropriate healthcare action.

The AI is a NAVIGATOR, not a DIAGNOSTICIAN.

---

## UX Principles

1. Clarity over complexity.
2. Action over information overload.
3. Conversational where conversation is useful.
4. Structured interfaces where structured information is better.
5. Never make the AI feel like a generic chatbot.
6. Always make the user's next step obvious.
7. Minimize unnecessary questions.
8. Preserve context throughout the healthcare journey.
9. Clearly distinguish AI guidance from professional medical advice.
10. Safety and trust take priority over visual novelty.

---

## Healthcare Safety

The product must not:

- Diagnose diseases
- Prescribe medication
- Change medication dosage
- Claim certainty about medical conditions
- Replace emergency services
- Present AI output as professional medical advice

The product may:

- Ask questions to understand the user's situation
- Identify potential urgency levels
- Recommend an appropriate category of care
- Explain why a certain care pathway may be appropriate
- Encourage professional evaluation
- Provide emergency escalation when appropriate

Safety-critical decisions should be designed so that uncertainty is clearly communicated.

---

## Engineering Principles

- Keep the architecture modular.
- Separate UI, business logic, AI logic and data access.
- Avoid hard-coding AI responses into UI components.
- Make AI functionality replaceable.
- Use mock data during early development.
- Do not introduce unnecessary dependencies.
- Do not over-engineer the MVP.
- Preserve existing functionality when modifying the application.
- Do not rewrite working code without a clear reason.
- Follow existing project conventions once established.

---

## Development Workflow

Before implementing a major feature:

1. Inspect the existing implementation.
2. Understand the current architecture.
3. Identify affected files.
4. Explain the implementation approach.
5. Implement the smallest coherent change.
6. Test the implementation.
7. Report what changed.
8. Never claim something works without verifying it.

---

## Important

Do not invent product requirements.

When a requirement has not yet been defined, identify the uncertainty instead of silently making a major product decision.

The product strategy and UX direction will be defined collaboratively before major implementation work.
