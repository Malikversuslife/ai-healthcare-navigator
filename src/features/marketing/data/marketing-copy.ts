export const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Find care', href: '#find-care' },
  { label: 'Safety', href: '#safety' },
  { label: 'About', href: '#about' },
] as const

export const HERO = {
  headline1: 'Know where',
  headline2: 'to go next.',
  supporting: 'When you\'re unsure what kind of care you need, Hanya helps you understand your options and find the right next step.',
  primaryCta: { label: 'Start with Hanya', href: '/navigator' },
  secondaryCta: { label: 'See how it works', href: '#how-it-works' },
} as const

export const PROBLEM = {
  headline1: 'Care isn\'t',
  headline2: 'always obvious.',
  questions: [
    'Can this wait until tomorrow?',
    'Do I need a specialist?',
    'Where can I go nearby?',
    'Does this provider accept my insurance?',
    'What kind of doctor do I need?',
  ],
} as const

export const UNDERSTANDING = {
  headline1: 'Just tell Hanya',
  headline2: 'what\'s going on.',
  supporting: 'Start naturally. Hanya gathers the context it needs without making you figure out the healthcare system first.',
} as const

export const NEXT_STEP = {
  headline1: 'Understand what',
  headline2: 'to do next.',
  supporting: 'Hanya navigates. It does not diagnose. It helps you understand the most appropriate next step based on what you share.',
} as const

export const PROVIDER_DISCOVERY = {
  headline1: 'Find care',
  headline2: 'that fits.',
  supporting: 'When a provider visit is appropriate, Hanya helps you find options that match your location, specialty need, and insurance.',
} as const

export const BRAND_MOMENT = {
  headline1: 'From uncertainty',
  headline2: 'to direction.',
  steps: [
    { label: 'Uncertainty', active: true },
    { label: 'Understand', active: true },
    { label: 'Next step', active: true },
    { label: 'Care', active: false },
  ],
} as const

export const PHOTO_BREAK = {
  headline1: 'Healthcare decisions',
  headline2: 'happen everywhere.',
  supporting: 'Not just in hospitals. In living rooms. On commutes. In quiet moments when something doesn\'t feel right.',
} as const

export const TRUST = {
  headline1: 'Guidance you',
  headline2: 'can trust.',
  principles: [
    { title: 'Organizes what you report', description: 'Hanya structures the information you share into a clear picture of your situation.' },
    { title: 'Emergency-aware', description: 'Recognizes predefined safety patterns and escalates immediately when appropriate.' },
    { title: 'Recommends pathways', description: 'Suggests the most appropriate care pathway — not diagnoses, not prescriptions.' },
    { title: 'Helps you find providers', description: 'Connects you with healthcare options that match your needs and location.' },
    { title: 'Private by design', description: 'Your health information stays between you and your device.' },
    { title: 'Transparent', description: 'Hanya explains why it suggests a particular next step. No black boxes.' },
  ],
} as const

export const FAQ = {
  headline1: 'Questions,',
  headline2: 'answered.',
  items: [
    {
      question: 'What is Hanya?',
      answer: 'Hanya is a healthcare navigation tool that helps you understand what kind of care may be appropriate and guides you toward the right next step.',
    },
    {
      question: 'Does Hanya diagnose medical conditions?',
      answer: 'No. Hanya never diagnoses, prescribes, or claims medical certainty. It helps organize what you share and recommends appropriate care pathways.',
    },
    {
      question: 'How does Hanya decide what I should do next?',
      answer: 'Hanya uses the information you provide — your symptoms, duration, and situation — to evaluate which care pathway is most appropriate. It explains its reasoning.',
    },
    {
      question: 'Can Hanya help me find healthcare providers?',
      answer: 'Yes. When a provider visit is recommended, Hanya helps you find options that match your location, specialty need, and insurance.',
    },
    {
      question: 'Does Hanya verify insurance coverage?',
      answer: 'Hanya shows whether a provider lists your selected insurance plan. It does not guarantee coverage — always confirm directly with the provider.',
    },
    {
      question: 'What happens if something sounds like an emergency?',
      answer: 'Hanya has built-in safety awareness. If your symptoms suggest a potential emergency, it will immediately recommend calling emergency services or seeking urgent care.',
    },
    {
      question: 'Is my information private?',
      answer: 'Yes. Hanya is private by design. Your health information stays between you and your device.',
    },
  ],
} as const

export const CLOSING = {
  headline1: 'You don\'t have',
  headline2: 'to figure it out alone.',
  supporting: 'Know where to go next.',
  cta: { label: 'Start with Hanya', href: '/navigator' },
} as const

export const FOOTER = {
  tagline: 'Healthcare navigation for everyday life.',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Find care', href: '#find-care' },
        { label: 'Safety', href: '#safety' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help', href: '#' },
        { label: 'Guides', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ],
    },
  ],
  origin: 'Designed and built in Nigeria.',
} as const
