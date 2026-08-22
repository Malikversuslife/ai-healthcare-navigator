export default function BrandMomentSection() {
  return (
    <section className="bg-ink-900 py-section-lg overflow-hidden">
      <div className="section-narrow text-center">
        <h2 className="font-display text-display-xl text-bone-100 mb-20 text-balance">
          From uncertainty<br />
          <span className="italic text-aubergine-300">to direction.</span>
        </h2>

        {/* Dramatically enlarged pathway — spans most of viewport width */}
        <div className="relative max-w-6xl mx-auto px-4">
          <svg
            viewBox="0 0 1100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-hidden="true"
          >
            {/* Connecting lines — elegant, restrained */}
            <line x1="100" y1="40" x2="400" y2="40" stroke="#5A2D5F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="400" y1="40" x2="700" y2="40" stroke="#5A2D5F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="700" y1="40" x2="1000" y2="40" stroke="#3D3D3D" strokeWidth="1" strokeLinecap="round" strokeDasharray="6 4" />

            {/* Waypoint 1 — Uncertainty (active) */}
            <circle cx="100" cy="40" r="12" fill="#5A2D5F" />
            <circle cx="100" cy="40" r="20" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.25" />
            <text x="100" y="80" textAnchor="middle" fill="#F4F1EA" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Uncertainty
            </text>

            {/* Waypoint 2 — Understand (active) */}
            <circle cx="400" cy="40" r="12" fill="#5A2D5F" />
            <circle cx="400" cy="40" r="20" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.25" />
            <text x="400" y="80" textAnchor="middle" fill="#F4F1EA" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Understand
            </text>

            {/* Waypoint 3 — Next step (active) */}
            <circle cx="700" cy="40" r="12" fill="#5A2D5F" />
            <circle cx="700" cy="40" r="20" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.25" />
            <text x="700" y="80" textAnchor="middle" fill="#F4F1EA" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Next step
            </text>

            {/* Waypoint 4 — Care (dimmed) */}
            <circle cx="1000" cy="40" r="10" fill="#3D3D3D" />
            <text x="1000" y="80" textAnchor="middle" fill="#6B6B6B" fontSize="14" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="400">
              Care
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
