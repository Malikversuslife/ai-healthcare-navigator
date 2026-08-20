import { CareLevel } from '../../../shared/types'

export interface CareLevelInfo {
  id: CareLevel
  name: string
  description: string
  examples: string[]
}

export const CARE_LEVELS: CareLevelInfo[] = [
  {
    id: 'emergency',
    name: 'Emergency Care',
    description: 'Immediate medical attention required. Call emergency services or go to the nearest emergency room.',
    examples: ['Chest pain', 'Difficulty breathing', 'Severe injuries', 'Stroke symptoms'],
  },
  {
    id: 'urgent_care',
    name: 'Urgent Care',
    description: 'Needs prompt medical attention within hours. Visit an urgent care center or emergency department.',
    examples: ['High fever', 'Severe pain', 'Persistent vomiting', 'Deep cuts'],
  },
  {
    id: 'primary_care',
    name: 'Primary Care',
    description: 'Should be seen by a healthcare provider within 24 hours or schedule an appointment.',
    examples: ['Moderate pain', 'Persistent symptoms', 'Minor injuries', 'Infections'],
  },
  {
    id: 'self_care',
    name: 'Self-Care',
    description: 'Schedule an appointment with a healthcare provider within the next few days if symptoms persist.',
    examples: ['Mild symptoms', 'Check-ups', 'Chronic condition management', 'Preventive care'],
  },
]

export function getCareLevelInfo(careLevel: CareLevel): CareLevelInfo | undefined {
  return CARE_LEVELS.find(c => c.id === careLevel)
}
