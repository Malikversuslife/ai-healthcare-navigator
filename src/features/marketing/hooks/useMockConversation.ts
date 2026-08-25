import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export type MockConversationSpeaker = 'assistant' | 'user'

export interface MockConversationTurn {
  speaker: MockConversationSpeaker
  text: string
  revealAt: number
}

export interface MockContextItem {
  label: string
  value: string
  revealAt: number
}

export interface MockConversationScript {
  turns: MockConversationTurn[]
  context: MockContextItem[]
  typingAt: number
  fadeAt: number
  loopDuration: number
}

export interface MockConversationState {
  visibleTurns: MockConversationTurn[]
  visibleContext: MockContextItem[]
  isTyping: boolean
  isFading: boolean
}

export function getMockConversationState(
  script: MockConversationScript,
  elapsed: number,
  prefersReducedMotion: boolean
): MockConversationState {
  if (prefersReducedMotion) {
    return {
      visibleTurns: script.turns,
      visibleContext: script.context,
      isTyping: false,
      isFading: false,
    }
  }

  return {
    visibleTurns: script.turns.filter((turn) => elapsed >= turn.revealAt),
    visibleContext: script.context.filter((item) => elapsed >= item.revealAt),
    isTyping: elapsed >= script.typingAt && elapsed < script.fadeAt,
    isFading: elapsed >= script.fadeAt,
  }
}

export function useMockConversation(script: MockConversationScript): MockConversationState {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setElapsed(script.loopDuration)
      return
    }

    const startedAt = window.performance.now()
    const interval = window.setInterval(() => {
      setElapsed((window.performance.now() - startedAt) % script.loopDuration)
    }, 120)

    return () => window.clearInterval(interval)
  }, [prefersReducedMotion, script.loopDuration])

  return useMemo(
    () => getMockConversationState(script, elapsed, prefersReducedMotion),
    [elapsed, prefersReducedMotion, script]
  )
}
