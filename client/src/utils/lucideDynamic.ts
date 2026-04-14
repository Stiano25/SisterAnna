import type { ComponentType, LazyExoticComponent } from 'react'
import { lazy } from 'react'
// Full icon registry (kebab-case keys → dynamic import loaders)
import dynamicIconImports from 'lucide-react/dynamicIconImports'

export type LazyLucide = LazyExoticComponent<ComponentType<any>>

const importMap = dynamicIconImports as Record<string, () => Promise<{ default: ComponentType<any> }>>

/** All Lucide icon slugs in kebab-case (e.g. `book-open`, `eye`). */
export const LUCIDE_ICON_KEBAB_KEYS = Object.freeze(
  Object.keys(importMap).sort((a, b) => a.localeCompare(b))
)

export function pascalCaseToKebab(iconName: string): string {
  if (!iconName.trim()) return 'cross'
  const s = iconName.trim()
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

export function kebabToPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join('')
}

const lazyCache = new Map<string, LazyLucide | null>()

export function getLazyLucideIcon(kebabKey: string): LazyLucide | null {
  const key = kebabKey.trim().toLowerCase()
  if (lazyCache.has(key)) return lazyCache.get(key) ?? null

  const loader = importMap[key]
  if (!loader) {
    lazyCache.set(key, null)
    return null
  }

  const Lazy = lazy(loader as () => Promise<{ default: ComponentType<any> }>) as LazyLucide
  lazyCache.set(key, Lazy)
  return Lazy
}

export function resolveStoredIconToKebab(stored: string): string {
  const t = stored.trim()
  if (!t) return 'cross'
  if (t.includes('-')) return t.toLowerCase()
  return pascalCaseToKebab(t)
}
