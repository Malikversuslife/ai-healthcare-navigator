import { IncomingMessage, ServerResponse } from 'http'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are a healthcare navigation assistant. Your role is to extract structured information from user messages about health concerns.

IMPORTANT RULES:
1. You MUST NOT diagnose medical conditions
2. You MUST NOT recommend specific treatments or medications
3. You MUST NOT determine urgency levels or care categories
4. You ONLY extract information and ask clarifying questions

Your job is to:
1. Extract the health concern from the user's message
2. Identify symptoms mentioned
3. Preserve the user's actual duration description (do not convert to categories)
4. Extract severity as a number (1-10) if provided, or as a description (mild/moderate/severe) if provided
5. If the user describes how their symptoms affect daily activities, extract functional impact
6. If the user describes how symptoms are changing over time, extract symptom trend
7. Extract specialty ONLY when the user explicitly states a specialty or provider type (e.g., "I need a dermatologist", "looking for a cardiologist")
8. Extract location ONLY when the user explicitly states a city, area, or neighborhood (e.g., "in Lagos", "in Lekki", "in Abuja")
9. Extract insurance ONLY when the user explicitly states an insurance plan or HMO (e.g., "I have NHIS", "with Leadway insurance")
10. Ask one follow-up question at a time to gather missing information

Duration: Preserve exactly what the user says (e.g., "about 18 hours", "since yesterday", "a few weeks")

Severity: If user provides a number, use { "value": N }. If user provides a description, use { "description": "word" }. Do not invent numerical values when the user did not provide them.

Functional impact: ONLY extract when the user explicitly describes impact on daily activities (e.g., "I can't go to work", "I can't sleep", "I can't do my normal activities"). Do NOT infer from severity or duration.

Symptom trend: ONLY extract when the user explicitly describes how symptoms are changing (e.g., "it's getting worse quickly", "it's improving", "it's been the same"). Do NOT infer from severity or duration.

Specialty: ONLY extract when user explicitly mentions a specialty name (dermatologist, cardiologist, pediatrician, etc.) or provider type. Do NOT infer specialty from symptoms. "I have a rash" does NOT produce specialty. "I need a dermatologist" DOES produce specialty.

Location: ONLY extract when user explicitly mentions a city, area, or neighborhood name. Do NOT infer location from other context.

Insurance: ONLY extract when user explicitly mentions an insurance plan, HMO, or provider name. Do NOT infer insurance status.

Be conversational but efficient. Ask only what's missing. Never ask for information already provided.`

const EXTRACTION_SCHEMA = {
  type: 'object' as const,
  properties: {
    response: {
      type: 'string',
      description: 'Your conversational response to the user',
    },
    extractedContext: {
      type: 'object',
      properties: {
        concern: {
          type: ['string', 'null'],
          description: 'The main health concern extracted from the message',
        },
        symptoms: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of symptoms mentioned',
        },
        duration: {
          type: ['string', 'null'],
          description: 'The user\'s actual duration description, preserved as-is',
        },
        severity: {
          type: ['object', 'null'],
          properties: {
            value: {
              type: ['number', 'null'],
              description: 'Numeric severity 1-10 if user provided a number',
            },
            description: {
              type: ['string', 'null'],
              description: 'Text description if user said mild/moderate/severe',
            },
          },
          description: 'Severity as number or description, not both',
        },
        functionalImpact: {
          type: ['object', 'null'],
          properties: {
            level: {
              type: ['string', 'null'],
              enum: ['none', 'mild', 'significant'],
              description: 'Impact level ONLY if user explicitly describes impact on daily activities',
            },
            description: {
              type: ['string', 'null'],
              description: 'User\'s own description of impact',
            },
          },
          description: 'Functional impact — ONLY when user explicitly describes inability to work or do daily activities. Do NOT infer from severity or duration.',
        },
        symptomTrend: {
          type: ['string', 'null'],
          enum: ['improving', 'stable', 'worsening', 'rapidly_worsening', 'unknown'],
          description: 'Symptom trend — ONLY when user explicitly describes how symptoms are changing. Do NOT infer from severity or duration.',
        },
        specialty: {
          type: ['string', 'null'],
          description: 'Medical specialty or provider type ONLY when user explicitly states it (e.g., "dermatologist", "cardiologist"). Do NOT infer from symptoms.',
        },
        location: {
          type: ['string', 'null'],
          description: 'City, area, or neighborhood ONLY when user explicitly states it (e.g., "Lagos", "Lekki", "Abuja"). Do NOT infer from other context.',
        },
        insurance: {
          type: ['string', 'null'],
          description: 'Insurance plan, HMO, or provider ONLY when user explicitly states it (e.g., "NHIS", "Leadway"). Do NOT infer insurance status.',
        },
      },
      required: ['concern', 'symptoms', 'duration', 'severity', 'functionalImpact', 'symptomTrend', 'specialty', 'location', 'insurance'],
    },
    followUpQuestion: {
      type: ['string', 'null'],
      description: 'A follow-up question to gather more information, or null if enough info',
    },
  },
  required: ['response', 'extractedContext', 'followUpQuestion'],
}

interface NavigateRequest {
  message: string
  context: {
    concern: string
    symptoms: string[]
    duration: string
    severity?: { value?: number; description?: string }
    functionalImpact?: { level?: 'none' | 'mild' | 'significant'; description?: string }
    symptomTrend?: 'improving' | 'stable' | 'worsening' | 'rapidly_worsening' | 'unknown'
    specialty?: string
    location?: string
    insurance?: string
  }
}

function getMissingFields(context: NavigateRequest['context']): string[] {
  const missing: string[] = []
  if (!context.concern) missing.push('concern')
  if (context.symptoms.length === 0) missing.push('symptoms')
  if (!context.duration) missing.push('duration')
  if (!context.severity) missing.push('severity')
  return missing
}

function parseBody(req: IncomingMessage): Promise<NavigateRequest> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

export async function handleNavigate(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server' }))
    return
  }

  try {
    const { message, context } = await parseBody(req)

    if (!message || typeof message !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid request: message is required' }))
      return
    }

    const missingFields = getMissingFields(context)

    const userMessage = `Current context:
- Concern: ${context.concern || 'not provided'}
- Symptoms: ${context.symptoms.length > 0 ? context.symptoms.join(', ') : 'not provided'}
- Duration: ${context.duration || 'not provided'}
- Severity: ${context.severity ? JSON.stringify(context.severity) : 'not provided'}
- Specialty: ${context.specialty || 'not provided'}
- Location: ${context.location || 'not provided'}
- Insurance: ${context.insurance || 'not provided'}
- Missing information: ${missingFields.length > 0 ? missingFields.join(', ') : 'none'}

User message: "${message}"

Extract information from this message. Preserve the user's actual duration description. Extract specialty, location, and insurance ONLY when explicitly stated.`

    const client = new OpenAI({ apiKey })

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'extraction_result',
          schema: EXTRACTION_SCHEMA,
          strict: true,
        },
      },
      temperature: 0.3,
      max_output_tokens: 500,
    })

    const content = response.output_text
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(parsed))

  } catch (error) {
    console.error('AI API error:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      error: 'Failed to process request',
      response: 'I apologize, but I encountered an error. Could you please try again?',
      extractedContext: {},
      followUpQuestion: null,
    }))
  }
}
