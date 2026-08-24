import { useState, useRef, useEffect } from 'react'

interface ComposerProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
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
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Send message"
        className="w-full resize-none px-4 py-3 pr-12 bg-white border border-ink-200 rounded-2xl text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-aubergine-600/20 focus:border-aubergine-600 transition-colors disabled:opacity-50 text-body leading-relaxed"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        aria-label="Send message"
        className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-aubergine-600 text-white rounded-full hover:bg-aubergine-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default Composer
