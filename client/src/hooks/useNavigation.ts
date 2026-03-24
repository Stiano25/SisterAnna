import { useState, useCallback } from 'react'
import type { PageId } from '../types'

export const useNavigation = () => {
  const [stack, setStack] = useState<PageId[]>(['home'])
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const currentPage = stack[stack.length - 1]

  const goTo = useCallback((pageId: PageId) => {
    setDirection('forward')
    setStack(prev => [...prev, pageId])
  }, [])

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      setDirection('back')
      setStack(prev => prev.slice(0, -1))
    }
  }, [stack.length])

  const reset = useCallback(() => {
    setDirection('back')
    setStack(['home'])
  }, [])

  return {
    currentPage,
    direction,
    goTo,
    goBack,
    reset,
    canGoBack: stack.length > 1
  }
}