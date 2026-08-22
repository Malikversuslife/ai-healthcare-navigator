interface PathwayGraphicProps {
  className?: string
  variant?: 'horizontal' | 'vertical'
  activeSteps?: number
}

export default function PathwayGraphic({ className = '', variant = 'horizontal', activeSteps = 3 }: PathwayGraphicProps) {
  const steps = [
    { label: 'Uncertainty', x: 0 },
    { label: 'Understand', x: 1 },
    { label: 'Next step', x: 2 },
    { label: 'Care', x: 3 },
  ]

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-start gap-0 ${className}`}>
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              {/* Waypoint dot */}
              <div className={`w-3 h-3 rounded-full transition-colors ${
                i < activeSteps
                  ? 'bg-aubergine-600'
                  : 'bg-soft-stone-300'
              }`} />
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div className={`w-px h-12 ${
                  i < activeSteps - 1
                    ? 'bg-aubergine-600'
                    : 'bg-soft-stone-300'
                }`} />
              )}
            </div>
            <span className={`text-body-sm font-medium ${
              i < activeSteps ? 'text-ink-900' : 'text-ink-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <svg
      viewBox="0 0 480 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {steps.map((step, i) => {
        const cx = 60 + i * 120
        const isActive = i < activeSteps
        return (
          <g key={step.label}>
            {/* Connecting line */}
            {i > 0 && (
              <line
                x1={cx - 80}
                y1={20}
                x2={cx - 40}
                y2={20}
                stroke={i <= activeSteps ? '#5A2D5F' : '#D9D4C9'}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
            {/* Waypoint */}
            <circle
              cx={cx}
              cy={20}
              r={isActive ? 6 : 5}
              fill={isActive ? '#5A2D5F' : '#E6E2D9'}
              stroke={isActive ? '#5A2D5F' : '#D9D4C9'}
              strokeWidth={isActive ? 0 : 1}
            />
            {/* Label */}
            <text
              x={cx}
              y={48}
              textAnchor="middle"
              fill={isActive ? '#171A18' : '#ADB5BD'}
              fontSize="12"
              fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
              fontWeight={isActive ? '500' : '400'}
            >
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
