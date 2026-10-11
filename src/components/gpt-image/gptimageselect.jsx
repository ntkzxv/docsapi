
import { useEffect, useRef, useState } from 'react'

export default function GPTImageSelect({
  label,
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  const current = options.find(([key]) => key === value)

  useEffect(() => {
    if (!open) return

    const closeOutside = event => {
      if (!root.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const closeEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
    }
  }, [open])

  return (
    <div className="choice-field" ref={root}>
      <span className="choice-label">{label}</span>

      <button
        type="button"
        className={`custom-select-trigger ${open ? 'is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{current?.[1] ?? 'Select an option'}</span>
        <span className="select-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="custom-select-menu"
          role="listbox"
          aria-label={label}
        >
          {options.map(([key, text]) => (
            <button
              key={key || 'default'}
              type="button"
              role="option"
              aria-selected={value === key}
              className={value === key ? 'is-selected' : ''}
              onClick={() => {
                onChange(key)
                setOpen(false)
              }}
            >
              {text}

              {value === key && (
                <span className="option-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
