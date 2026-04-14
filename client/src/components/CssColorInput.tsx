import React, { useMemo } from 'react'

function cssToPickerHex(input: string): string {
  const t = input.trim()
  if (/^#[0-9A-Fa-f]{6}$/i.test(t)) return t.toLowerCase()
  if (/^#[0-9A-Fa-f]{3}$/i.test(t) && t.length === 4) {
    const r = t[1]
    const g = t[2]
    const b = t[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return '#ffffff'
}

type CssColorInputProps = {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  placeholder?: string
  /** Shown next to the swatch for screen readers */
  ariaLabel?: string
}

/**
 * Native color picker plus a text field for any valid CSS color (rgb(), hsl(), etc.).
 */
const CssColorInput: React.FC<CssColorInputProps> = ({
  value,
  onChange,
  disabled,
  placeholder,
  ariaLabel = 'Choose color'
}) => {
  const pickerHex = useMemo(() => cssToPickerHex(value || '#ffffff'), [value])

  return (
    <div className="flex items-stretch gap-2 sm:gap-3 mt-1">
      <div className="shrink-0 rounded-xl border border-memorial-line bg-memorial-card p-1 shadow-sm hover:border-memorial-accent/40 transition-colors">
        <input
          type="color"
          value={pickerHex}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 sm:h-11 sm:w-14 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded-lg border-0 bg-transparent block"
          aria-label={ariaLabel}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent border border-memorial-line rounded-xl px-3 py-2.5 text-sm text-memorial-ink outline-none font-mono disabled:opacity-50"
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  )
}

export default CssColorInput
