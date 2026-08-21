/**
 * Specialty Normalization
 *
 * Deterministic mapping from user-described provider terms to standard specialties.
 * This is NOT symptom-to-specialty inference — it normalizes explicit provider requests.
 *
 * "I need a dermatologist" → Dermatology
 * "I have a rash" → NOT automatically Dermatology
 */

const SPECIALTY_MAP: Record<string, string> = {
  // Dermatology
  'skin doctor': 'Dermatology',
  'dermatologist': 'Dermatology',
  'dermatology': 'Dermatology',
  'skin specialist': 'Dermatology',

  // Ophthalmology / Optometry
  'eye doctor': 'Ophthalmology',
  'ophthalmologist': 'Ophthalmology',
  'optometrist': 'Optometry',
  'optician': 'Optometry',
  'vision specialist': 'Ophthalmology',

  // Cardiology
  'heart doctor': 'Cardiology',
  'cardiologist': 'Cardiology',
  'cardiology': 'Cardiology',
  'heart specialist': 'Cardiology',

  // General Practice / Primary Care
  'general doctor': 'General Practice',
  'primary care doctor': 'General Practice',
  'primary care': 'General Practice',
  'family doctor': 'Family Medicine',
  'family medicine': 'Family Medicine',
  'gp': 'General Practice',
  'general practitioner': 'General Practice',
  'clinic': 'General Practice',

  // Physiotherapy
  'physio': 'Physiotherapy',
  'physiotherapist': 'Physiotherapy',
  'physiotherapy': 'Physiotherapy',
  'physical therapy': 'Physiotherapy',

  // Dentistry
  'dentist': 'Dentistry',
  'dental': 'Dentistry',
  'dental clinic': 'Dentistry',
  'tooth doctor': 'Dentistry',

  // Pediatrics
  'child doctor': 'Pediatrics',
  'paediatrician': 'Pediatrics',
  'pediatrician': 'Pediatrics',
  'pediatrics': 'Pediatrics',
  'children doctor': 'Pediatrics',

  // Obstetrics / Gynecology
  'pregnancy doctor': 'Obstetrics & Gynecology',
  'gynecologist': 'Obstetrics & Gynecology',
  'obstetrician': 'Obstetrics & Gynecology',
  'obgyn': 'Obstetrics & Gynecology',
  'women health': 'Obstetrics & Gynecology',

  // ENT
  'ear doctor': 'ENT',
  'ent': 'ENT',
  'ENT': 'ENT',
  'ear nose throat': 'ENT',

  // Orthopedics
  'bone doctor': 'Orthopedics',
  'orthopedic': 'Orthopedics',
  'orthopedist': 'Orthopedics',
  'orthopaedic': 'Orthopedics',

  // Neurology
  'brain doctor': 'Neurology',
  'neurologist': 'Neurology',
  'neurology': 'Neurology',

  // Psychiatry / Mental Health
  'therapist': 'Psychiatry',
  'psychiatrist': 'Psychiatry',
  'mental health': 'Psychiatry',
  'counsellor': 'Psychiatry',
  'counselor': 'Psychiatry',

  // Urology
  'urologist': 'Urology',
  'urology': 'Urology',
}

const SPECIALTY_ALIASES: Record<string, string> = {
  'Dermatology': 'Dermatology',
  'Ophthalmology': 'Ophthalmology',
  'Optometry': 'Optometry',
  'Cardiology': 'Cardiology',
  'General Practice': 'General Practice',
  'Family Medicine': 'Family Medicine',
  'Physiotherapy': 'Physiotherapy',
  'Dentistry': 'Dentistry',
  'Pediatrics': 'Pediatrics',
  'Obstetrics & Gynecology': 'Obstetrics & Gynecology',
  'ENT': 'ENT',
  'Orthopedics': 'Orthopedics',
  'Neurology': 'Neurology',
  'Psychiatry': 'Psychiatry',
  'Urology': 'Urology',
  'Multi-Specialty Hospital': 'Multi-Specialty Hospital',
  'General Consultation': 'General Consultation',
}

/**
 * Normalizes user-described provider terms to standard specialties.
 * Returns the standard specialty name, or the original input if no mapping found.
 * Does NOT infer specialties from symptoms.
 */
export function normalizeSpecialty(userInput: string): string {
  const lower = userInput.toLowerCase().trim()

  // Direct match from specialty map
  if (SPECIALTY_MAP[lower]) {
    return SPECIALTY_MAP[lower]
  }

  // Check if already a known specialty
  if (SPECIALTY_ALIASES[userInput]) {
    return SPECIALTY_ALIASES[userInput]
  }

  // Return original — do not invent mappings
  return userInput
}

/**
 * Checks if two specialties are a match.
 * Multi-Specialty Hospital matches any requested specialty.
 */
export function isSpecialtyMatch(
  requestedSpecialty: string,
  providerSpecialty: string
): boolean {
  const normalized = normalizeSpecialty(requestedSpecialty)
  const providerNorm = providerSpecialty.toLowerCase().trim()

  // Multi-Specialty Hospital matches any requested specialty
  if (providerNorm.includes('multi-specialty') || providerNorm.includes('multi specialty')) {
    return true
  }

  // General Consultation matches general/family requests
  if (providerNorm.includes('general consultation')) {
    if (normalized === 'General Practice' || normalized === 'Family Medicine') {
      return true
    }
  }

  // Direct match
  return providerNorm.includes(normalized.toLowerCase())
}
