import { useState, useRef, useEffect } from 'react'

interface FAQItemProps {
  question: string
  answer: string
  isOpen?: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div className="border-b border-soft-stone-200">
      <button
        onClick={onToggle}
        className="w-full min-h-11 flex items-center justify-between py-6 text-left group hover:text-aubergine-600 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-lg sm:text-xl font-display text-ink-900 pr-8">
          {question}
        </span>
        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-400 group-hover:text-aubergine-600 transition-colors">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <div
        ref={contentRef}
        style={{ height: height ? `${height}px` : '0px' }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <p className={`pb-6 text-body text-ink-600 leading-relaxed max-w-3xl transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const items = [
    { question: 'What is Hanya?', answer: 'Hanya is a healthcare navigation tool that helps you understand what kind of care may be appropriate and guides you toward the right next step.' },
    { question: 'Does Hanya diagnose medical conditions?', answer: 'No. Hanya never diagnoses, prescribes, or claims medical certainty. It helps organize what you share and recommends appropriate care pathways.' },
    { question: 'How does Hanya decide what I should do next?', answer: 'Hanya uses the information you provide — your symptoms, duration, and situation — to evaluate which care pathway is most appropriate. It explains its reasoning.' },
    { question: 'Can Hanya help me find healthcare providers?', answer: 'Yes. When a provider visit is recommended, Hanya helps you find options that match your location, specialty need, and insurance.' },
    { question: 'Does Hanya verify insurance coverage?', answer: 'Hanya shows whether a provider lists your selected insurance plan. It does not guarantee coverage — always confirm directly with the provider.' },
    { question: 'What happens if something sounds like an emergency?', answer: 'Hanya has built-in safety awareness. If your symptoms suggest a potential emergency, it will immediately recommend calling emergency services or seeking urgent care.' },
    { question: 'Is my information private?', answer: 'The Navigator does not require an account in this MVP. OpenAI-backed mode sends relevant conversation context through Hanya\'s server endpoint for AI processing; fallback mode uses local structured extraction.' },
  ]

  return (
    <section id="about" className="bg-bone-100 py-section">
      <div className="section-narrow">
        <h2 className="font-display text-display text-ink-900 mb-16 text-balance">
          Questions,<br />
          <span className="italic text-aubergine-600">answered.</span>
        </h2>

        <div className="border-t border-soft-stone-200">
          {items.map((item, index) => (
            <FAQItem
              key={item.question}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
