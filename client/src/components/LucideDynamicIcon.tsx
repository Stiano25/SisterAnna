import React, { Suspense, memo } from 'react'
import { Cross } from 'lucide-react'
import { getLazyLucideIcon, resolveStoredIconToKebab } from '../utils/lucideDynamic'

type LucideDynamicIconProps = {
  name: string
  className?: string
  strokeWidth?: number
}

const LucideDynamicIconInner: React.FC<LucideDynamicIconProps> = ({ name, className, strokeWidth = 1.5 }) => {
  const kebab = resolveStoredIconToKebab(name)
  const LazyIcon = getLazyLucideIcon(kebab)

  if (!LazyIcon) {
    return <Cross className={className} strokeWidth={strokeWidth} aria-hidden />
  }

  return (
    <Suspense fallback={<span className={className} aria-hidden style={{ display: 'inline-flex', width: '1em', height: '1em' }} />}>
      <LazyIcon className={className} strokeWidth={strokeWidth} aria-hidden />
    </Suspense>
  )
}

export default memo(LucideDynamicIconInner)
