import { useState, useRef, useEffect } from 'react'

interface ComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function canSubmitComposer(value: string, disabled = false): boolean {
  return !!value.trim() && !disabled
}

export function shouldSubmitComposerKey(key: string, shiftKey: boolean): boolean {
  return key === 'Enter' && !shiftKey
}

function Composer({ onSend, disabled = false, placeholder = "Describe what's going on..." }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!canSubmitComposer(value, disabled)) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (shouldSubmitComposerKey(e.key, e.shiftKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div className="relative rounded-2xl bg-white">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Message Hanya"
        aria-describedby="composer-help"
        className="block w-full resize-none min-h-[64px] max-h-40 px-4 pt-3 pb-14 pr-16 bg-white border border-ink-200 rounded-2xl text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-aubergine-600/20 focus:border-aubergine-600 transition-colors disabled:opacity-50 text-body leading-relaxed overflow-y-auto"
      />
      <span id="composer-help" className="sr-only">
        Press Enter to send. Press Shift and Enter for a new line.
      </span>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmitComposer(value, disabled)}
        aria-label="Send message"
        aria-disabled={!canSubmitComposer(value, disabled)}
        className="absolute right-3 bottom-3 min-w-11 min-h-11 w-11 h-11 flex items-center justify-center bg-aubergine-600 text-white rounded-full hover:bg-aubergine-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default Composer
