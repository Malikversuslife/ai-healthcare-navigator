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

Respond with a JSON object containing:
{
  "response": "Your conversational response to the user",
  "extractedContext": {
    "concern": "string or null - the main health concern",
    "symptoms": ["array of symptoms mentioned"],
    "duration": "sudden, recent, ongoing, or null",
    "severity": "number 1-10 or null"
  },
  "isReadyForRecommendation": true/false,
  "followUpQuestion": "string or null - only if more info needed"
}

Duration mapping:
- "sudden": just started, minutes/hours ago, today
- "recent": 1-7 days
- "ongoing": more than a week, chronic

Severity mapping:
- Extract if user mentions a number (1-10)
- Map words: mild=2-3, moderate=5-6, severe=7-8, extreme=9-10

Be conversational but efficient. Ask only what's missing. Never ask for information already provided.`

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

function getContextCompleteness(context: NavigateRequest['context']): number {
  let completeness = 0
  if (context.concern) completeness += 30
  if (context.symptoms.length > 0) completeness += 20
  if (context.duration) completeness += 25
  if (context.severity !== null && context.severity !== undefined) completeness += 15
  if (context.location) completeness += 10
  return completeness
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
    const completeness = getContextCompleteness(context)

    const userMessage = `Current context:
- Concern: ${context.concern || 'not provided'}
- Symptoms: ${context.symptoms.length > 0 ? context.symptoms.join(', ') : 'not provided'}
- Duration: ${context.duration || 'not provided'}
- Severity: ${context.severity !== null ? context.severity : 'not provided'}
- Missing information: ${missingFields.length > 0 ? missingFields.join(', ') : 'none'}
- Context completeness: ${completeness}%

User message: "${message}"

Extract information from this message. If context completeness is already 70% or higher, set isReadyForRecommendation to true.`

    const client = new OpenAI({ apiKey })
    
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const content = completion.choices[0]?.message?.content
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
      isReadyForRecommendation: false
    }))
  }
}
