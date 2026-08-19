import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-ink-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b border-ink-100 ${className}`}>
      {children}
    </div>
  )
}

function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 border-t border-ink-100 ${className}`}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardContent, CardFooter }
