export type SupportedLocationCity = 'Lagos' | 'Abuja' | 'Ibadan' | 'Port Harcourt'

const GEOLOCATION_PERMISSION_DENIED = 1
const GEOLOCATION_POSITION_UNAVAILABLE = 2
const GEOLOCATION_TIMEOUT = 3

export const unsupportedCoordinatesMessage =
  "We couldn't determine your city from your device location. Enter your city or area to continue."

export function mapCoordinatesToSupportedCity(
  latitude: number,
  longitude: number
): SupportedLocationCity | null {
  if (latitude > 6.4 && latitude < 6.6 && longitude > 3.3 && longitude < 3.5) {
    return 'Lagos'
  }
  if (latitude > 8.9 && latitude < 9.2 && longitude > 7.4 && longitude < 7.6) {
    return 'Abuja'
  }
  if (latitude > 7.3 && latitude < 7.5 && longitude > 3.8 && longitude < 4.1) {
    return 'Ibadan'
  }
  if (latitude > 4.7 && latitude < 4.9 && longitude > 6.9 && longitude < 7.1) {
    return 'Port Harcourt'
  }

  return null
}

export function getGeolocationRecoveryMessage(error?: Pick<GeolocationPositionError, 'code'>): string {
  if (!error) {
    return 'Your browser does not support location access. Enter your city or area instead.'
  }

  if (error.code === GEOLOCATION_PERMISSION_DENIED) {
    return "Location access wasn't granted. Enter your city or area instead."
  }

  if (error.code === GEOLOCATION_TIMEOUT) {
    return "We couldn't determine your location in time. Enter your city or area instead."
  }

  if (error.code === GEOLOCATION_POSITION_UNAVAILABLE) {
    return "We couldn't determine your location. Enter your city or area instead."
  }

  return "We couldn't determine your location. Enter your city or area instead."
}
