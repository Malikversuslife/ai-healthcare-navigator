import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link to="/" className="text-xl font-semibold text-gray-900">
          AI Healthcare Navigator
        </Link>
      </div>
    </header>
  )
}

export default Header
