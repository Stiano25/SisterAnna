import { useState, useCallback } from 'react'
import type { PageId } from '../types'

export const useNavigation = () => {
  const getPageFromUrl = (): PageId => {
    if (typeof window === 'undefined') {
      return 'home'
    }

    if (window.location.pathname === '/admin') {
      return 'admin'
    }

    const page = new URLSearchParams(window.location.search).get('page')
    return page && page.trim() ? page : 'home'
  }

  const syncUrlForPage = (pageId: PageId) => {
    if (typeof window === 'undefined') {
      return
    }

    const url = new URL(window.location.href)

    if (pageId === 'admin') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState({}, '', '/admin')
      }
      return
    }

    url.pathname = '/'
    if (pageId === 'home') {
      url.searchParams.delete('page')
    } else {
      url.searchParams.set('page', pageId)
    }
    window.history.pushState({}, '', `${url.pathname}${url.search}`)
  }

  const initialPage: PageId = getPageFromUrl()

  const [stack, setStack] = useState<PageId[]>([initialPage])
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const currentPage = stack[stack.length - 1]

  const goTo = useCallback((pageId: PageId) => {
    setDirection('forward')
    syncUrlForPage(pageId)
    setStack(prev => [...prev, pageId])
  }, [])

  const goBack = useCallback(() => {
    if (stack.length > 1) {
      setDirection('back')
      setStack(prev => prev.slice(0, -1))
      const nextPage = stack[stack.length - 2]
      syncUrlForPage(nextPage)
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