import React from 'react'
import { X } from 'lucide-react'

interface SectionSearchBarProps {
  value: string
  onChange: (value: string) => void
  onDismiss: () => void
}

const SectionSearchBar: React.FC<SectionSearchBarProps> = ({
  value,
  onChange,
  onDismiss
}) => {
  return (
    <div className="mb-8 pb-6 border-b border-memorial-line spiritual-inset">
      <p className="text-sm text-memorial-muted leading-relaxed mb-4">
        Type a keyword to jump to a section, or tap{' '}
        <span className="font-bold text-memorial-ink">✕</span> to read the full page.
      </p>
      <div className="flex items-end gap-3">
        <div className="flex-1 min-w-0">
          <label htmlFor="section-filter" className="sr-only">
            Filter sections
          </label>
          <input
            id="section-filter"
            type="search"
            autoComplete="off"
            placeholder="Search within this page…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-memorial-line focus:border-memorial-accent focus:ring-0 focus:outline-none py-2 px-0 text-base text-memorial-ink placeholder:text-memorial-muted/70 transition-colors rounded-none shadow-none"
          />
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 p-2 text-memorial-accent hover:text-memorial-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Dismiss filter and read full page"
        >
          <X className="w-6 h-6" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

export default SectionSearchBar
