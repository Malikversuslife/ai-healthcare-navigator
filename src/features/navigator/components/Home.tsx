import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          What should I do next?
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Describe your healthcare concern, and we'll help you understand the
          appropriate next step — whether it's seeing a doctor, visiting a
          clinic, or seeking emergency care.
        </p>
        <Link
          to="/navigator"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Start Navigation
        </Link>
        <p className="mt-6 text-sm text-gray-500">
          This is a navigation tool, not a diagnostic service. Always consult
          a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  )
}

export default Home
