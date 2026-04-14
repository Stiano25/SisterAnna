import React, { Suspense, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { LUCIDE_ICON_KEBAB_KEYS, kebabToPascalCase, pascalCaseToKebab, getLazyLucideIcon } from '../utils/lucideDynamic'

type LucideIconPickerProps = {
  /** Stored value: PascalCase (BookOpen) or kebab-case (book-open) */
  value: string
  onChange: (pascalName: string) => void
  disabled?: boolean
}

const PAGE_SIZE = 96

function LazyPreview({ kebab }: { kebab: string }) {
  const LazyIcon = getLazyLucideIcon(kebab)
  if (!LazyIcon) return <span className="w-4 h-4 inline-block" aria-hidden />
  const Icon = LazyIcon
  return (
    <Suspense fallback={<span className="w-4 h-4 inline-block animate-pulse bg-slate-200 rounded" aria-hidden />}>
      <Icon className="w-4 h-4 text-memorial-ink" strokeWidth={1.8} />
    </Suspense>
  )
}

const LucideIconPicker: React.FC<LucideIconPickerProps> = ({ value, onChange, disabled }) => {
  const [query, setQuery] = useState('')
  const [showCount, setShowCount] = useState(PAGE_SIZE)

  const selectedKebab = useMemo(() => pascalCaseToKebab(value || 'Cross'), [value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LUCIDE_ICON_KEBAB_KEYS
    return LUCIDE_ICON_KEBAB_KEYS.filter((k) => {
      const pascal = kebabToPascalCase(k).toLowerCase()
      return k.includes(q) || pascal.includes(q.replace(/\s+/g, ''))
    })
  }, [query])

  const visible = useMemo(() => filtered.slice(0, showCount), [filtered, showCount])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-memorial-line bg-white px-3 py-2">
        <Search className="w-4 h-4 text-memorial-muted flex-shrink-0" strokeWidth={1.8} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowCount(PAGE_SIZE)
          }}
          placeholder="Search icons (e.g. heart, book, cross)…"
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent border-0 text-sm text-memorial-ink outline-none focus:ring-0"
        />
      </div>
      <p className="text-xs text-memorial-muted">
        {filtered.length} icon{filtered.length === 1 ? '' : 's'}
        {filtered.length > visible.length ? ` — showing first ${visible.length}` : ''}
      </p>
      <div className="max-h-56 overflow-y-auto rounded-xl border border-memorial-line bg-white p-2 grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {visible.map((kebab) => {
          const pascal = kebabToPascalCase(kebab)
          const active = kebab === selectedKebab
          return (
            <button
              key={kebab}
              type="button"
              disabled={disabled}
              title={pascal}
              onClick={() => onChange(pascal)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-[10px] font-medium leading-tight transition-colors ${
                active
                  ? 'border-memorial-accent bg-memorial-accent/10 text-memorial-accent'
                  : 'border-transparent hover:border-memorial-line text-memorial-muted hover:text-memorial-ink'
              }`}
            >
              <LazyPreview kebab={kebab} />
              <span className="truncate w-full text-center">{pascal}</span>
            </button>
          )
        })}
      </div>
      {filtered.length > visible.length ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowCount((c) => c + PAGE_SIZE)}
          className="w-full text-sm font-semibold text-memorial-accent py-2 rounded-lg border border-memorial-line hover:bg-memorial-accent/5"
        >
          Load more icons
        </button>
      ) : null}
    </div>
  )
}

export default LucideIconPicker
