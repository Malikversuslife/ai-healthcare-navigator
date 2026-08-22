import { UserHealthContext, Severity, FunctionalImpact, SymptomTrend } from '../../shared/types'
import { AIService, AIExtractionResult } from './types'

const CONCERN_PATTERNS = [
  { pattern: /head(ache)?|migraine/i, concern: 'headache' },
  { pattern: /stomach|abdomen|belly|tummy/i, concern: 'stomach pain' },
  { pattern: /fever|temperature|hot|burning up/i, concern: 'fever' },
  { pattern: /cough|coughing/i, concern: 'cough' },
  { pattern: /cold|flu|runny nose|sneezing/i, concern: 'cold/flu symptoms' },
  { pattern: /back pain|lower back|spine/i, concern: 'back pain' },
  { pattern: /skin|rash|itch|eczema|acne/i, concern: 'skin condition' },
  { pattern: /eye|vision|blurry/i, concern: 'eye/vision issue' },
  { pattern: /ear|hearing|tinnitus/i, concern: 'ear/hearing issue' },
  { pattern: /tooth|dental|teeth|gum/i, concern: 'dental issue' },
  { pattern: /joint|knee|shoulder|hip|ankle/i, concern: 'joint pain' },
  { pattern: /anxiety|stress|depression|mental|panic/i, concern: 'mental health' },
  { pattern: /pregnant|pregnancy|baby/i, concern: 'pregnancy-related' },
  { pattern: /child|kid|baby|infant/i, concern: 'pediatric issue' },
]

interface ExtractionResult {
  concern: string | null
  symptoms: string[]
  duration: string | null
  severity: Severity | null
  functionalImpact: FunctionalImpact | null
  symptomTrend: SymptomTrend | null
  specialty: string | null
  location: string | null
  insurance: string | null
}

function extractConcern(message: string): string | null {
  for (const { pattern, concern } of CONCERN_PATTERNS) {
    if (pattern.test(message)) return concern
  }
  return null
}

function extractSymptoms(message: string): string[] {
  const symptoms: string[] = []
  const lower = message.toLowerCase()

  const symptomPatterns = [
    /pain|ache|hurt/i,
    /nausea|vomit|throwing up/i,
    /dizzy|lightheaded|faint/i,
    /tired|fatigue|exhausted|weak/i,
    /swelling|swollen/i,
    /numbness|tingling/i,
    /bleeding/i,
    /discharge/i,
  ]

  symptomPatterns.forEach(pattern => {
    const match = lower.match(pattern)
    if (match) {
      symptoms.push(match[0])
    }
  })

  return symptoms
}

function extractDuration(message: string): string | null {
  // Preserve the user's actual description — do not convert to categories

  // Check for explicit duration mentions and return the raw phrase
  const durationPatterns = [
    /(?:for|since|about|around|approximately|over|under|less than|more than)\s+[\w\s]+(?:hour|minute|day|week|month|year)s?/i,
    /\d+\s*(?:hour|minute|day|week|month|year)s?\b/i,
    /just now|suddenly|started|minutes ago|today|yesterday|few days|this week|chronic|long time/i,
  ]

  for (const pattern of durationPatterns) {
    const match = message.match(pattern)
    if (match) {
      return match[0].trim()
    }
  }

  return null
}

function extractSeverity(message: string): Severity | null {
  const lower = message.toLowerCase()

  // Check for numeric severity (e.g., "7 out of 10", "severity 8")
  const numberMatch = lower.match(/(\d+)\s*(out of|\/)\s*10/)
  if (numberMatch) {
    const num = parseInt(numberMatch[1])
    if (num >= 1 && num <= 10) {
      return { value: num }
    }
  }

  // Check for standalone number 1-10 in severity context
  if (lower.includes('severity') || lower.includes('rate') || lower.includes('scale')) {
    const standaloneMatch = lower.match(/\b([1-9]|10)\b/)
    if (standaloneMatch) {
      const num = parseInt(standaloneMatch[1])
      if (num >= 1 && num <= 10) {
        return { value: num }
      }
    }
  }

  // Check for severity keywords — store as description, NOT as numerical value
  if (/(?:severe|extreme|terrible|worst|unbearable|intense|sharp)/i.test(lower)) {
    return { description: 'severe' }
  }
  if (/(?:moderate|noticeable|significant|bothersome|uncomfortable)/i.test(lower)) {
    return { description: 'moderate' }
  }
  if (/(?:mild|slight|minor|light|barely|little)/i.test(lower)) {
    return { description: 'mild' }
  }

  return null
}

function extractFunctionalImpact(message: string): FunctionalImpact | null {
  const lower = message.toLowerCase()

  // Significant impact
  if (
    lower.includes("can't work") ||
    lower.includes('unable to work') ||
    lower.includes("can't get out of bed") ||
    lower.includes('unable to get out of bed') ||
    lower.includes("can't go to work") ||
    lower.includes('unable to go to work') ||
    lower.includes("can't function") ||
    lower.includes('unable to function') ||
    lower.includes("can't do normal") ||
    lower.includes('unable to do normal') ||
    lower.includes('bedridden') ||
    lower.includes("can't do daily") ||
    lower.includes('unable to do daily') ||
    lower.includes("can't do anything") ||
    lower.includes('unable to do anything')
  ) {
    return { level: 'significant', description: 'User reported inability to perform normal activities' }
  }

  // Mild impact
  if (
    lower.includes('still work') ||
    lower.includes('can still work') ||
    lower.includes('manageable') ||
    lower.includes("can still do") ||
    lower.includes('affects') ||
    lower.includes('interferes') ||
    lower.includes('bothers')
  ) {
    return { level: 'mild', description: 'User reported some impact on daily activities' }
  }

  // None
  if (
    lower.includes('no impact') ||
    lower.includes("doesn't affect") ||
    lower.includes('does not affect') ||
    lower.includes('not affecting')
  ) {
    return { level: 'none' }
  }

  return null
}

function extractSymptomTrend(message: string): SymptomTrend | null {
  const lower = message.toLowerCase()

  // Rapidly worsening
  if (
    lower.includes('rapidly worsen') ||
    lower.includes('getting worse quickly') ||
    lower.includes('getting much worse') ||
    lower.includes('suddenly worse') ||
    lower.includes('rapidly getting worse')
  ) {
    return 'rapidly_worsening'
  }

  // Worsening
  if (
    lower.includes('worsening') ||
    lower.includes('getting worse') ||
    lower.includes('becoming worse') ||
    lower.includes('worse than') ||
    lower.includes('more painful') ||
    lower.includes('increasing')
  ) {
    return 'worsening'
  }

  // Improving
  if (
    lower.includes('improving') ||
    lower.includes('getting better') ||
    lower.includes('better than') ||
    lower.includes('less painful') ||
    lower.includes('subsiding') ||
    lower.includes('easing')
  ) {
    return 'improving'
  }

  // Stable
  if (
    lower.includes('same') ||
    lower.includes('stable') ||
    lower.includes('unchanged') ||
    lower.includes('no change') ||
    lower.includes('consistent') ||
    lower.includes('about the same')
  ) {
    return 'stable'
  }

  return null
}

function extractSpecialty(message: string): string | null {
  const lower = message.toLowerCase()

  const specialtyPatterns = [
    { pattern: /dermatolog/i, specialty: 'dermatologist' },
    { pattern: /cardiolog/i, specialty: 'cardiologist' },
    { pattern: /pediatr/i, specialty: 'pediatrician' },
    { pattern: /neurolog/i, specialty: 'neurologist' },
    { pattern: /orthoped/i, specialty: 'orthopedic surgeon' },
    { pattern: /ophthalmolog/i, specialty: 'ophthalmologist' },
    { pattern: /eye doctor/i, specialty: 'ophthalmologist' },
    { pattern: /ENT|ear.?nose.?throat/i, specialty: 'ENT specialist' },
    { pattern: /gynecolog|OB.?GYN/i, specialty: 'gynecologist' },
    { pattern: /urolog/i, specialty: 'urologist' },
    { pattern: /psychiatr/i, specialty: 'psychiatrist' },
    { pattern: /psycholog/i, specialty: 'psychologist' },
    { pattern: /dentist|dental/i, specialty: 'dentist' },
    { pattern: /general.?pract|GP|primary.?care/i, specialty: 'general practice' },
    { pattern: /internist|internal.?medicine/i, specialty: 'internal medicine' },
    { pattern: /pulmonolog|lung/i, specialty: 'pulmonologist' },
    { pattern: /gastroenterolog/i, specialty: 'gastroenterologist' },
    { pattern: /endocrinolog|diabet/i, specialty: 'endocrinologist' },
    { pattern: /nephrolog|kidney/i, specialty: 'nephrologist' },
    { pattern: /rheumatolog/i, specialty: 'rheumatologist' },
    { pattern: /oncolog|cancer/i, specialty: 'oncologist' },
  ]

  for (const { pattern, specialty } of specialtyPatterns) {
    if (pattern.test(lower)) return specialty
  }

  return null
}

function extractLocation(message: string): string | null {
  const lower = message.toLowerCase()

  const locationPatterns = [
    { pattern: /lagos/i, location: 'Lagos' },
    { pattern: /abuja/i, location: 'Abuja' },
    { pattern: /ibadan/i, location: 'Ibadan' },
    { pattern: /port.?harcourt|PH/i, location: 'Port Harcourt' },
    { pattern: /ilorin/i, location: 'Ilorin' },
    { pattern: /lekki/i, location: 'Lekki' },
    { pattern: /ikeja/i, location: 'Ikeja' },
    { pattern: /victoria.?island|VI/i, location: 'Victoria Island' },
    { pattern: /surulere/i, location: 'Surulere' },
    { pattern: /yaba/i, location: 'Yaba' },
    { pattern: /wuse/i, location: 'Wuse' },
    { pattern: /maitama/i, location: 'Maitama' },
    { pattern: /garki/i, location: 'Garki' },
    { pattern: /jabi/i, location: 'Jabi' },
  ]

  for (const { pattern, location } of locationPatterns) {
    if (pattern.test(lower)) return location
  }

  return null
}

function extractInsurance(message: string): string | null {
  const lower = message.toLowerCase()

  const insurancePatterns = [
    { pattern: /NHIS|national.?health.?insurance/i, insurance: 'nhis' },
    { pattern: /leadway/i, insurance: 'leadway' },
    { pattern: /AXA.?Mansard|AXA/i, insurance: 'axa_mansard' },
    { pattern: /hygeia/i, insurance: 'hygeia' },
    { pattern: /clearline/i, insurance: 'clearline' },
    { pattern: /stadler/i, insurance: 'stadler' },
    { pattern: /total.?health.?trust|THT/i, insurance: 'total_health_trust' },
    { pattern: /reliance.?HMO|reliance/i, insurance: 'reliance_hmo' },
    { pattern: /loginso/i, insurance: 'loginso' },
    { pattern: /aiico/i, insurance: 'aiico' },
  ]

  for (const { pattern, insurance } of insurancePatterns) {
    if (pattern.test(lower)) return insurance
  }

  return null
}

function extractInformation(message: string): ExtractionResult {
  return {
    concern: extractConcern(message),
    symptoms: extractSymptoms(message),
    duration: extractDuration(message),
    severity: extractSeverity(message),
    functionalImpact: extractFunctionalImpact(message),
    symptomTrend: extractSymptomTrend(message),
    specialty: extractSpecialty(message),
    location: extractLocation(message),
    insurance: extractInsurance(message),
  }
}

function getMissingInformation(context: UserHealthContext): string[] {
  const missing: string[] = []
  if (!context.concern) missing.push('concern')
  if (!context.duration) missing.push('duration')
  if (context.severity === undefined) missing.push('severity')
  if (context.symptoms.length === 0) missing.push('symptoms')
  return missing
}

function getFollowUpQuestion(context: UserHealthContext): string {
  const missing = getMissingInformation(context)

  if (missing.includes('concern')) {
    return 'What brings you here today? Can you describe what you\'re experiencing?'
  }
  if (missing.includes('duration')) {
    return 'How long have you been experiencing this?'
  }
  if (missing.includes('severity')) {
    return 'How would you describe the severity? You can say something like "mild", "moderate", or "severe", or rate it 1 to 10.'
  }
  if (missing.includes('symptoms')) {
    return 'Are there any other symptoms you\'re experiencing alongside this?'
  }
  return 'Can you tell me more about what you\'re experiencing?'
}

export class MockAIService implements AIService {
  async processMessage(
    message: string,
    context: UserHealthContext
  ): Promise<AIExtractionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))

    // Extract information from message
    const extracted = extractInformation(message)

    // Build updated context — only update fields that were actually extracted
    const updatedContext: Partial<UserHealthContext> = {}

    if (extracted.concern) {
      updatedContext.concern = extracted.concern
    }
    if (extracted.symptoms.length > 0) {
      // Merge symptoms, avoiding duplicates
      const existingSymptoms = new Set(context.symptoms.map(s => s.toLowerCase()))
      const newSymptoms = extracted.symptoms.filter(s => !existingSymptoms.has(s.toLowerCase()))
      if (newSymptoms.length > 0) {
        updatedContext.symptoms = [...context.symptoms, ...newSymptoms]
      }
    }
    if (extracted.duration) {
      updatedContext.duration = extracted.duration
    }
    if (extracted.severity !== null) {
      updatedContext.severity = extracted.severity
    }
    if (extracted.functionalImpact !== null) {
      updatedContext.functionalImpact = extracted.functionalImpact
    }
    if (extracted.symptomTrend !== null) {
      updatedContext.symptomTrend = extracted.symptomTrend
    }
    if (extracted.specialty !== null) {
      updatedContext.specialty = extracted.specialty
    }
    if (extracted.location !== null) {
      updatedContext.location = extracted.location
    }
    if (extracted.insurance !== null) {
      updatedContext.insurance = extracted.insurance
    }

    // Get appropriate follow-up
    const mergedContext: UserHealthContext = {
      ...context,
      ...updatedContext,
    }
    const followUp = getFollowUpQuestion(mergedContext)

    // Generate contextual response
    let response = ''
    if (extracted.concern || extracted.symptoms.length > 0 || extracted.duration || extracted.severity !== null) {
      response = `I understand. ${followUp}`
    } else {
      response = followUp
    }

    return {
      response,
      extractedContext: updatedContext,
      followUpQuestion: followUp,
    }
  }
}

export function createAIService(): AIService {
  return new MockAIService()
}
