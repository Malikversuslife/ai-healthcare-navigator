import { describe, it, expect } from 'vitest'
import { calculateDistance } from '../../../shared/utils/distance'

describe('calculateDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const distance = calculateDistance(
      { lat: 6.5244, lng: 3.3792 },
      { lat: 6.5244, lng: 3.3792 }
    )
    expect(distance).toBe(0)
  })

  it('calculates distance between Lagos and Abuja approximately', () => {
    // Lagos: ~6.5244, 3.3792
    // Abuja: ~9.0579, 7.4951
    const distance = calculateDistance(
      { lat: 6.5244, lng: 3.3792 },
      { lat: 9.0579, lng: 7.4951 }
    )
    // Lagos to Abuja is approximately 500-550 km
    expect(distance).toBeGreaterThan(400)
    expect(distance).toBeLessThan(600)
  })

  it('calculates distance between nearby points in Lagos', () => {
    // Ikeja to Lekki — roughly 20-30 km
    const distance = calculateDistance(
      { lat: 6.6000, lng: 3.3500 },
      { lat: 6.4470, lng: 3.4550 }
    )
    expect(distance).toBeGreaterThan(10)
    expect(distance).toBeLessThan(50)
  })

  it('returns distance in kilometres', () => {
    const distance = calculateDistance(
      { lat: 6.5244, lng: 3.3792 },
      { lat: 6.6000, lng: 3.3500 }
    )
    // Should be a reasonable number, not in meters
    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(100)
  })

  it('is symmetric — distance A to B equals distance B to A', () => {
    const pointA = { lat: 6.5244, lng: 3.3792 }
    const pointB = { lat: 9.0579, lng: 7.4951 }

    const distanceAB = calculateDistance(pointA, pointB)
    const distanceBA = calculateDistance(pointB, pointA)

    expect(distanceAB).toBe(distanceBA)
  })
})
