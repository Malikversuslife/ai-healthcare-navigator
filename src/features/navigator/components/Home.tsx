import { Link, useNavigate } from 'react-router-dom'

const EXAMPLE_PROMPTS = [
  "I've had a headache since yesterday",
  "I need to see a dermatologist",
  "I need an eye test",
  "Find a clinic near me",
]

function Home() {
  const navigate = useNavigate()

  const handleExampleClick = (prompt: string) => {
    navigate('/navigator', { state: { initialMessage: prompt } })
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-cream-50">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold text-ink-900 mb-6 leading-tight">
            Get help finding the right next step in your healthcare
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg md:text-xl text-ink-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tell us what's going on. We'll help you understand what kind of care may be 
            appropriate, find nearby providers, and understand your options.
          </p>

          {/* Primary CTA */}
          <Link
            to="/navigator"
            className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            Start with what's bothering you
          </Link>

          {/* Example Prompts */}
          <div className="mt-12">
            <p className="text-sm text-ink-500 mb-4">Or try an example:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleExampleClick(prompt)}
                  className="px-4 py-2 bg-white border border-ink-200 rounded-lg text-sm text-ink-700 hover:border-teal-400 hover:text-teal-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-ink-400 max-w-lg mx-auto">
            This is a healthcare navigation tool, not a diagnostic service. 
            Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home
