import { useState, useRef, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '@/i18n'

interface AssetTagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}

export function AssetTagInput({ value, onChange, disabled }: AssetTagInputProps) {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input) }}
          placeholder={value.length === 0 ? t.assets.addTag : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      )}
    </div>
  )
}
