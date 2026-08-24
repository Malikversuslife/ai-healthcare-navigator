import { useState } from 'react'

interface LocationPromptProps {
  onLocationSelect: (location: string) => void
  onSkip?: () => void
}

const NIGERIAN_CITIES = [
  'Lagos',
  'Abuja',
  'Ibadan',
  'Port Harcourt',
  'Kano',
  'Ilorin',
  'Benin City',
  'Enugu',
]

function LocationPrompt({ onLocationSelect, onSkip }: LocationPromptProps) {
  const [manualLocation, setManualLocation] = useState('')
  const [useBrowser, setUseBrowser] = useState<boolean | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const handleBrowserLocation = async () => {
    setUseBrowser(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })

      const { latitude, longitude } = position.coords

      let city = 'Lagos'
      if (latitude > 6.4 && latitude < 6.6 && longitude > 3.3 && longitude < 3.5) {
        city = 'Lagos'
      } else if (latitude > 8.9 && latitude < 9.2 && longitude > 7.4 && longitude < 7.6) {
        city = 'Abuja'
      } else if (latitude > 7.3 && latitude < 7.5 && longitude > 3.8 && longitude < 4.1) {
        city = 'Ibadan'
      } else if (latitude > 4.7 && latitude < 4.9 && longitude > 6.9 && longitude < 7.1) {
        city = 'Port Harcourt'
      }

      onLocationSelect(city)
    } catch {
      setUseBrowser(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualLocation.trim()) {
      onLocationSelect(manualLocation.trim())
    }
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    onLocationSelect(city)
  }

  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-6 mb-4">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-aubergine-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-aubergine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ink-900 mb-2">
          Find providers near you
        </h3>
        <p className="text-sm text-ink-500">
          To show you the most relevant healthcare providers, please share your location.
        </p>
      </div>

      {useBrowser === null && (
        <div className="space-y-3">
          <button
            onClick={handleBrowserLocation}
            className="w-full px-4 py-3 bg-aubergine-600 text-white rounded-xl font-medium hover:bg-aubergine-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use my current location
          </button>
          
          <button
            onClick={() => setUseBrowser(false)}
            className="w-full px-4 py-3 bg-white border border-ink-200 text-ink-700 rounded-xl font-medium hover:border-aubergine-300 transition-colors"
          >
            Enter location manually
          </button>

          {onSkip && (
            <button
              onClick={onSkip}
              className="w-full px-4 py-2 text-ink-500 text-sm hover:text-ink-700 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      )}

      {useBrowser === false && !selectedCity && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-ink-700 mb-3">Select your city:</p>
            <div className="grid grid-cols-2 gap-2">
              {NIGERIAN_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className="px-3 py-2 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-700 hover:border-aubergine-300 hover:bg-aubergine-50 transition-colors text-left"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-ink-400">or enter manually</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="e.g., Victoria Island, Lagos"
              className="flex-1 px-4 py-2 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-aubergine-600/20 focus:border-aubergine-600"
            />
            <button
              type="submit"
              disabled={!manualLocation.trim()}
              className="px-4 py-2 bg-aubergine-600 text-white rounded-xl font-medium hover:bg-aubergine-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => setUseBrowser(null)}
            className="text-sm text-ink-500 hover:text-ink-700 transition-colors"
          >
            ← Back to options
          </button>
        </div>
      )}

      {useBrowser === true && (
        <div className="text-center py-4">
          <div className="animate-spin w-8 h-8 border-2 border-aubergine-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-ink-600">Detecting your location...</p>
        </div>
      )}
    </div>
  )
}

export default LocationPrompt
