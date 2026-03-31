import { useState, useCallback } from 'react'
import type { PageId } from '../types'

export const useNavigation = () => {
  const initialPage: PageId =
    typeof window !== 'undefined' && window.location.pathname === '/admin' ? 'admin' : 'home'

  const [stack, setStack] = useState<PageId[]>([initialPage])
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const currentPage = stack[stack.length - 1]

  const goTo = useCallback((pageId: PageId) => {
    setDirection('forward')
    if (typeof window !== 'undefined') {
      const path = pageId === 'admin' ? '/admin' : '/'
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path)
      }
    }
    setStack(prev => [...prev, pageId])
  }, [])

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      setDirection('back')
      setStack(prev => prev.slice(0, -1))
      if (typeof window !== 'undefined') {
        const nextPage = stack[stack.length - 2]
        const path = nextPage === 'admin' ? '/admin' : '/'
        if (window.location.pathname !== path) {
          window.history.pushState({}, '', path)
        }
      }
    }
  }, [stack.length])

  const reset = useCallback(() => {
    setDirection('back')
    setStack(['home'])
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }
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