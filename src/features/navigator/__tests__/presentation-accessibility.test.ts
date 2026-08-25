import { describe, expect, it } from 'vitest'
import { canSubmitComposer, shouldSubmitComposerKey } from '../components/Composer'
import { NAVIGATOR_BRAND_HOME_LABEL, NAVIGATOR_BRAND_HOME_PATH, URGENT_HELP_BUTTON_LABEL } from '../components/Navigator'
import { getMobileMenuButtonLabel } from '../../marketing/components/MarketingHeader'

describe('presentation accessibility polish', () => {
  describe('composer behavior', () => {
    it('Composer Send remains a single submission action when text is present', () => {
      expect(canSubmitComposer('I have a headache')).toBe(true)
      expect(canSubmitComposer('   ')).toBe(false)
    })

    it('Enter still submits', () => {
      expect(shouldSubmitComposerKey('Enter', false)).toBe(true)
    })

    it('Shift+Enter permits newline', () => {
      expect(shouldSubmitComposerKey('Enter', true)).toBe(false)
    })

    it('sending state prevents duplicate submit', () => {
      expect(canSubmitComposer('I have a headache', true)).toBe(false)
    })
  })

  it('urgent-help control remains accessible by label', () => {
    expect(URGENT_HELP_BUTTON_LABEL).toBe('Need urgent help?')
  })

  it('navigator brand exposes an accessible home link contract', () => {
    expect(NAVIGATOR_BRAND_HOME_LABEL).toBe('Hanya home')
    expect(NAVIGATOR_BRAND_HOME_PATH).toBe('/')
  })

  it('responsive navigation exposes appropriate accessible labels', () => {
    expect(getMobileMenuButtonLabel(false)).toBe('Open navigation menu')
    expect(getMobileMenuButtonLabel(true)).toBe('Close navigation menu')
  })
})
