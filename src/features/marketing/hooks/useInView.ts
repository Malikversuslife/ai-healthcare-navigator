import { RefObject, useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useInView<T extends Element>(ref: RefObject<T>, rootMargin = '0px 0px -15% 0px'): boolean {
  const [isInView, setIsInView] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsInView(true)
      return
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold: 0.2 }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [prefersReducedMotion, ref, rootMargin])

  return isInView
}
