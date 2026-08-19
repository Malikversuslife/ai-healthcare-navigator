import { useState } from 'react'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'

interface LocationPromptProps {
  onLocationSelect: (location: string) => void
  onSkip?: () => void
}

function LocationPrompt({ onLocationSelect, onSkip }: LocationPromptProps) {
  const [manualLocation, setManualLocation] = useState('')
  const [useBrowser, setUseBrowser] = useState<boolean | null>(null)

  const handleBrowserLocation = async () => {
    setUseBrowser(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })

      // In a real app, we'd reverse geocode this
      // For MVP, we'll use a simplified approach
      const { latitude, longitude } = position.coords

      // Simple city detection based on coordinates (mock)
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
      // Browser geolocation failed, fall back to manual
      setUseBrowser(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualLocation.trim()) {
      onLocationSelect(manualLocation.trim())
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Find providers near you
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        To show you the most relevant healthcare providers, please share your location.
      </p>

      {useBrowser === null && (
        <div className="space-y-3">
          <Button onClick={handleBrowserLocation} className="w-full">
            Use my current location
          </Button>
          <Button
            variant="secondary"
            onClick={() => setUseBrowser(false)}
            className="w-full"
          >
            Enter location manually
          </Button>
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="w-full">
              Skip for now
            </Button>
          )}
        </div>
      )}

      {useBrowser === false && (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <Input
            label="City or Area"
            placeholder="e.g., Lagos, Victoria Island"
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={!manualLocation.trim()}>
              Search Providers
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setUseBrowser(null)}
            >
              Back
            </Button>
          </div>
        </form>
      )}

      {useBrowser === true && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Detecting your location...</p>
        </div>
      )}
    </div>
  )
}

export default LocationPrompt
