import { Link } from 'react-router-dom'

const COLUMNS = [
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
]

export default function MarketingFooter() {
  return (
    <footer className="bg-ink-900 text-soft-stone-300 py-section">
      <div className="section-container">
        {/* Top */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/hanya-logo.svg" alt="" className="w-7 h-7 brightness-0 invert opacity-90" />
              <span className="text-lg font-semibold text-bone-100 tracking-tight">Hanya</span>
            </Link>
            <p className="text-body-sm text-soft-stone-400 leading-relaxed">
              Healthcare navigation for everyday life.
            </p>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-caption font-semibold text-soft-stone-400 uppercase tracking-wider mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-body-sm text-soft-stone-400 hover:text-bone-100 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-ink-800 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-caption text-soft-stone-400">
            Designed and built in Nigeria.
          </p>
          <p className="text-caption text-soft-stone-400">
            Hanya is a navigation tool, not a medical service.
          </p>
        </div>
      </div>
    </footer>
  )
}
