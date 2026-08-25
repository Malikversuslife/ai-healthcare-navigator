import { describe, expect, it } from 'vitest'
import { getMockConversationState, MockConversationScript } from '../hooks/useMockConversation'

const script: MockConversationScript = {
  loopDuration: 10000,
  fadeAt: 9000,
  typingAt: 7000,
  turns: [
    { speaker: 'assistant', text: 'First', revealAt: 500 },
    { speaker: 'user', text: 'Second', revealAt: 1500 },
  ],
  context: [
    { label: 'Concern', value: 'Headache', revealAt: 1700 },
  ],
}

describe('mock conversation presentation timing', () => {
  it('reveals turns and context only after their configured times', () => {
    expect(getMockConversationState(script, 1000, false).visibleTurns).toHaveLength(1)
    expect(getMockConversationState(script, 1000, false).visibleContext).toHaveLength(0)

    const later = getMockConversationState(script, 2000, false)
    expect(later.visibleTurns).toHaveLength(2)
    expect(later.visibleContext).toHaveLength(1)
  })

  it('shows typing during the configured resting window', () => {
    expect(getMockConversationState(script, 7500, false).isTyping).toBe(true)
    expect(getMockConversationState(script, 9500, false).isTyping).toBe(false)
  })

  it('shows complete static content for reduced-motion users', () => {
    const state = getMockConversationState(script, 0, true)

    expect(state.visibleTurns).toHaveLength(2)
    expect(state.visibleContext).toHaveLength(1)
    expect(state.isTyping).toBe(false)
    expect(state.isFading).toBe(false)
  })
})
