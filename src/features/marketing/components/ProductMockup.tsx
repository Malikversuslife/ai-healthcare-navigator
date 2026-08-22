import { ReactNode } from 'react'

interface ProductMockupProps {
  children: ReactNode
  className?: string
  label?: string
}

export default function ProductMockup({ children, className = '', label }: ProductMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <p className="text-caption text-ink-400 uppercase tracking-wider mb-4 font-medium">
          {label}
        </p>
      )}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-soft-stone-100 shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  )
}
