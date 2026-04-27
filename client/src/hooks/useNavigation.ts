import { useState, useCallback, useEffect } from 'react'
import type { PageId } from '../types'

const pageToPath = (pageId: PageId): string => {
  if (pageId === 'home') return '/'
  if (pageId === 'admin') return '/admin'
  if (pageId === 'search') return '/search'
  return `/${encodeURIComponent(pageId)}`
}

const pathToPage = (pathname: string): PageId => {
  if (pathname === '/admin') return 'admin'
  if (pathname === '/search') return 'search'
  if (pathname === '/' || pathname === '') return 'home'
  return decodeURIComponent(pathname.slice(1))
}

export const useNavigation = () => {
  const getPageFromUrl = (): PageId => {
    if (typeof window === 'undefined') {
      return 'home'
    }

    const legacyPage = new URLSearchParams(window.location.search).get('page')
    if (legacyPage && legacyPage.trim()) {
      const normalizedLegacyPage = legacyPage.trim()
      const nextPath = pageToPath(normalizedLegacyPage)
      if (window.location.pathname !== nextPath) {
        window.history.replaceState({}, '', nextPath)
      }
      return normalizedLegacyPage
    }

    return pathToPage(window.location.pathname)
  }

  const syncUrlForPage = (pageId: PageId) => {
    if (typeof window === 'undefined') {
      return
    }

    const nextPath = pageToPath(pageId)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
  }

  const initialPage: PageId = getPageFromUrl()

  const [stack, setStack] = useState<PageId[]>([initialPage])
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const currentPage = stack[stack.length - 1]

  useEffect(() => {
    const onPopState = () => {
      const legacyPage = new URLSearchParams(window.location.search).get('page')
      const nextPage = legacyPage && legacyPage.trim() ? legacyPage.trim() : pathToPage(window.location.pathname)
      setDirection('back')
      setStack([nextPage])
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const goTo = useCallback((pageId: PageId) => {
    setDirection('forward')
    syncUrlForPage(pageId)
    setStack(prev => (prev[prev.length - 1] === pageId ? prev : [...prev, pageId]))
  }, [])

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      setDirection('back')
      setStack(prev => prev.slice(0, -1))
      const nextPage = stack[stack.length - 2]
      syncUrlForPage(nextPage)
      return
    }
    // When a user lands directly on a deep URL (e.g. /life),
    // there is no in-app history stack to pop. Fall back to home.
    if (stack[0] !== 'home') {
      setDirection('back')
      setStack(['home'])
      syncUrlForPage('home')
    }
  }, [stack])

  const reset = useCallback(() => {
    setDirection('back')
    setStack(['home'])
    syncUrlForPage('home')
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