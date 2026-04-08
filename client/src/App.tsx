import { Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNavigation } from './hooks/useNavigation'
import HeroScreen from './components/HeroScreen'
import ExplorerOverlay from './components/ExplorerOverlay'
import AdminPage from './components/AdminPage'
import PageLoader from './components/PageLoader'

const SubPage = lazy(() => import('./components/SubPage'))
const MissionPage = lazy(() => import('./components/MissionPage'))
const GalleryPage = lazy(() => import('./components/GalleryPage'))

function App() {
  const { currentPage, direction, goTo, goBack, reset } = useNavigation()

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroScreen onExplore={() => goTo('search')} />
      case 'mission':
        return (
          <Suspense fallback={<PageLoader label="Opening mission..." />}>
            <MissionPage onBack={goBack} />
          </Suspense>
        )
      case 'gallery':
        return (
          <Suspense fallback={<PageLoader label="Opening gallery..." />}>
            <GalleryPage onBack={goBack} />
          </Suspense>
        )
      case 'search':
        return <ExplorerOverlay onClose={reset} onNavigate={goTo} />
      case 'admin':
        return <AdminPage onBack={goBack} />
      default:
        return (
          <Suspense fallback={<PageLoader label="Opening section..." />}>
            <SubPage pageId={currentPage} onBack={goBack} />
          </Suspense>
        )
    }
  }

  return (
    <div className="min-h-screen bg-memorial spiritual-root">
      <div className="mx-auto w-full max-w-none px-0">
        <AnimatePresence mode="wait" custom={direction}>
          {renderPage()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
