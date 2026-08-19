import { CareLevel } from '../../../shared/types'

export interface CareLevelInfo {
  id: CareLevel
  name: string
  description: string
  examples: string[]
}

export const CARE_LEVELS: CareLevelInfo[] = [
  {
    id: 'emergency-care',
    name: 'Emergency Care',
    description: 'Immediate medical attention required. Call emergency services or go to the nearest emergency room.',
    examples: ['Chest pain', 'Difficulty breathing', 'Severe injuries', 'Stroke symptoms'],
  },
  {
    id: 'urgent-care',
    name: 'Urgent Care',
    description: 'Needs prompt medical attention within hours. Visit an urgent care center or emergency department.',
    examples: ['High fever', 'Severe pain', 'Persistent vomiting', 'Deep cuts'],
  },
  {
    id: 'same-day-care',
    name: 'Same-Day Care',
    description: 'Should be seen by a healthcare provider within 24 hours.',
    examples: ['Moderate pain', 'Persistent symptoms', 'Minor injuries', 'Infections'],
  },
  {
    id: 'routine-care',
    name: 'Routine Care',
    description: 'Schedule an appointment with a healthcare provider within the next few days.',
    examples: ['Mild symptoms', 'Check-ups', 'Chronic condition management', 'Preventive care'],
  },
]

export function getCareLevelInfo(careLevel: CareLevel): CareLevelInfo | undefined {
  return CARE_LEVELS.find(c => c.id === careLevel)
}
