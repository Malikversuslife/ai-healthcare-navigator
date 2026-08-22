export default function BrandMomentSection() {
  return (
    <section className="bg-ink-900 py-section-lg overflow-hidden">
      <div className="section-narrow text-center">
        <h2 className="font-display text-display-xl text-bone-100 mb-20 text-balance">
          From uncertainty<br />
          <span className="italic text-aubergine-300">to direction.</span>
        </h2>

        {/* Dramatically scaled waypoint system — spans most of viewport width */}
        <div className="relative max-w-5xl mx-auto px-4">
          <svg
            viewBox="0 0 900 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            aria-hidden="true"
          >
            {/* Connecting lines */}
            <line x1="100" y1="30" x2="350" y2="30" stroke="#5A2D5F" strokeWidth="2" strokeLinecap="round" />
            <line x1="350" y1="30" x2="600" y2="30" stroke="#5A2D5F" strokeWidth="2" strokeLinecap="round" />
            <line x1="600" y1="30" x2="800" y2="30" stroke="#3D3D3D" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 4" />

            {/* Waypoint 1 — Uncertainty (active) */}
            <circle cx="100" cy="30" r="10" fill="#5A2D5F" />
            <circle cx="100" cy="30" r="16" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.3" />
            <text x="100" y="65" textAnchor="middle" fill="#F4F1EA" fontSize="13" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Uncertainty
            </text>

            {/* Waypoint 2 — Understand (active) */}
            <circle cx="350" cy="30" r="10" fill="#5A2D5F" />
            <circle cx="350" cy="30" r="16" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.3" />
            <text x="350" y="65" textAnchor="middle" fill="#F4F1EA" fontSize="13" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Understand
            </text>

            {/* Waypoint 3 — Next step (active) */}
            <circle cx="600" cy="30" r="10" fill="#5A2D5F" />
            <circle cx="600" cy="30" r="16" fill="none" stroke="#5A2D5F" strokeWidth="1" opacity="0.3" />
            <text x="600" y="65" textAnchor="middle" fill="#F4F1EA" fontSize="13" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="500">
              Next step
            </text>

            {/* Waypoint 4 — Care (dimmed) */}
            <circle cx="800" cy="30" r="8" fill="#3D3D3D" />
            <text x="800" y="65" textAnchor="middle" fill="#6B6B6B" fontSize="13" fontFamily="Plus Jakarta Sans, system-ui, sans-serif" fontWeight="400">
              Care
            </text>
          </svg>
        </div>
      </div>
    </section>
  )
}
