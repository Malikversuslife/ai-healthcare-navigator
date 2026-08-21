/**
 * Haversine distance calculation between two coordinates.
 * Returns distance in kilometres.
 */

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function calculateDistance(
  userCoordinates: { lat: number; lng: number },
  providerCoordinates: { lat: number; lng: number }
): number {
  const dLat = toRadians(providerCoordinates.lat - userCoordinates.lat)
  const dLng = toRadians(providerCoordinates.lng - userCoordinates.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(userCoordinates.lat)) *
      Math.cos(toRadians(providerCoordinates.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return Math.round(EARTH_RADIUS_KM * c * 10) / 10
}
