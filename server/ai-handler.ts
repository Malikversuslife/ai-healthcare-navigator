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
3. Determine how long they've had the symptom (duration)
4. Understand severity if mentioned
5. Ask one follow-up question at a time to gather missing information

Duration mapping:
- "sudden": just started, minutes/hours ago, today
- "recent": 1-7 days
- "ongoing": more than a week, chronic

Severity mapping:
- Extract if user mentions a number (1-10)
- Map words: mild=2-3, moderate=5-6, severe=7-8, extreme=9-10

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
          enum: ['sudden', 'recent', 'ongoing', null],
          description: 'How long the user has had the symptom',
        },
        severity: {
          type: ['number', 'null'],
          description: 'Severity rating 1-10 or null',
        },
      },
      required: ['concern', 'symptoms', 'duration', 'severity'],
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
    severity: number | null
    location?: string
    insurance?: string
  }
}

function getMissingFields(context: NavigateRequest['context']): string[] {
  const missing: string[] = []
  if (!context.concern) missing.push('concern')
  if (context.symptoms.length === 0) missing.push('symptoms')
  if (!context.duration) missing.push('duration')
  if (context.severity === null || context.severity === undefined) missing.push('severity')
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Only allow POST
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
- Severity: ${context.severity !== null ? context.severity : 'not provided'}
- Missing information: ${missingFields.length > 0 ? missingFields.join(', ') : 'none'}

User message: "${message}"

Extract information from this message.`

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
