import { useRef } from 'react'
import { useInView } from '../hooks/useInView'

export default function BrandMomentSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef)

  return (
    <section ref={sectionRef} className="bg-ink-900 py-section-lg overflow-hidden">
      <div className="section-narrow text-center">
        <h2 className={`marketing-reveal ${isInView ? 'is-visible' : ''} font-display text-display-xl text-bone-100 mb-20 text-balance`}>
          From uncertainty<br />
          <span className="italic text-aubergine-300">to direction.</span>
        </h2>

        {/* Dramatically enlarged pathway — spans most of viewport width */}
        <div className={`brand-pathway ${isInView ? 'is-visible' : ''} relative max-w-6xl mx-auto px-4`}>
          <svg
            viewBox="0 0 1100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-hidden="true"
          >
            {/* Connecting lines — elegant, restrained */}
            <line className="brand-path-line line-1" x1="100" y1="40" x2="400" y2="40" stroke="#5A2D5F" strokeWidth="1.5" strokeLinecap="round" />
            <line className="brand-path-line line-2" x1="400" y1="40" x2="700" y2="40" stroke="#5A2D5F" strokeWidth="1.5" strokeLinecap="round" />
            <line className="brand-path-line line-3" x1="700" y1="40" x2="1000" y2="40" stroke="#3D3D3D" strokeWidth="1" strokeLinecap="round" strokeDasharray="6 4" />

            {/* Waypoint 1 — Uncertainty (active) */}
            <circle className="brand-path-node node-1" cx="100" cy="40" r="12" fill="#5A2D5F" />
            <circle className="brand-path-node node-1" cx="100" cy="40" r="20" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.25" />
            <text className="brand-path-node node-1" x="100" y="80" textAnchor="middle" fill="#F4F1EA" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Uncertainty
            </text>

            {/* Waypoint 2 — Understand (active) */}
            <circle className="brand-path-node node-2" cx="400" cy="40" r="12" fill="#5A2D5F" />
            <circle className="brand-path-node node-2" cx="400" cy="40" r="20" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.25" />
            <text className="brand-path-node node-2" x="400" y="80" textAnchor="middle" fill="#F4F1EA" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Understand
            </text>

            {/* Waypoint 3 — Next step (active) */}
            <circle className="brand-path-node node-3" cx="700" cy="40" r="12" fill="#5A2D5F" />
            <circle className="brand-path-node node-3" cx="700" cy="40" r="20" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.25" />
            <text className="brand-path-node node-3" x="700" y="80" textAnchor="middle" fill="#F4F1EA" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Next step
            </text>

            {/* Waypoint 4 — Care (dimmed) */}
            <circle className="brand-path-node node-4" cx="1000" cy="40" r="10" fill="#3D3D3D" />
            <text className="brand-path-node node-4" x="1000" y="80" textAnchor="middle" fill="#6B6B6B" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="400">
              Care
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
