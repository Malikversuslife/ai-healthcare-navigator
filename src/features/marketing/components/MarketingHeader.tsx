import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Find care', href: '#find-care' },
  { label: 'Safety', href: '#safety' },
  { label: 'About', href: '#about' },
]

export function getMobileMenuButtonLabel(isOpen: boolean): string {
  return isOpen ? 'Close navigation menu' : 'Open navigation menu'
}

export default function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bone-100/90 backdrop-blur-md border-b border-soft-stone-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="section-container flex items-center justify-between h-16 sm:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/hanya-logo.svg"
            alt=""
            className="w-7 h-7 sm:w-8 sm:h-8"
          />
          <span className="text-lg font-semibold text-ink-900 tracking-tight">
            Hanya
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body-sm text-ink-600 hover:text-ink-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/navigator"
            className="text-body-sm font-medium text-white bg-aubergine-600 hover:bg-aubergine-700 px-5 py-2.5 rounded-full transition-colors"
          >
            Start with Hanya
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <Link
            to="/navigator"
            className="min-h-11 inline-flex items-center text-body-sm font-medium text-white bg-aubergine-600 hover:bg-aubergine-700 px-4 py-2 rounded-full transition-colors"
          >
            Start
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="marketing-mobile-menu"
            aria-label={getMobileMenuButtonLabel(mobileMenuOpen)}
            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full border border-soft-stone-200 bg-bone-100/80 text-ink-800 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M5 7h14M5 12h14M5 17h14" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div id="marketing-mobile-menu" className="md:hidden border-t border-soft-stone-100 bg-bone-100/95 backdrop-blur-md">
          <div className="section-container py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-11 inline-flex items-center text-body-sm text-ink-700 hover:text-ink-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
