import { Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { useNavigation } from './hooks/useNavigation'
import HeroScreen from './components/HeroScreen'
import ExplorerOverlay from './components/ExplorerOverlay'
import AdminPage from './components/AdminPage'
import PageLoader from './components/PageLoader'

const SubPage = lazy(() => import('./components/SubPage'))
const MissionPage = lazy(() => import('./components/MissionPage'))
const GalleryPage = lazy(() => import('./components/GalleryPage'))

const pageSeo: Record<string, { title: string; description: string }> = {
  home: {
    title: 'Sister Anna Ali Legacy | Faith, Biography, and Resurrection Hope',
    description:
      "Explore Sister Anna Ali's legacy, family testimony, and Christian reflections on Jesus after resurrection."
  },
  life: {
    title: 'Sister Anna Ali Personal Life | Childhood and Vocation Journey',
    description:
      "Discover the personal life of Sister Anna Ali, including early faith formation, family background, and her path to religious vocation."
  },
  visions: {
    title: "Sister Anna Ali's Visions of Jesus | Divine Encounters",
    description:
      'Learn about reported visions of Jesus connected to Sister Anna Ali and the faith messages preserved in memorial testimony.'
  },
  mission: {
    title: 'Sister Anna Ali Missions | Works of Mercy and Ongoing Outreach',
    description:
      'Follow the ongoing mission inspired by Sister Anna Ali through service, mercy projects, and community faith initiatives.'
  },
  gallery: {
    title: 'Sister Anna Ali Gallery | Photos and Memorial Moments',
    description:
      "View photos and memorial moments from Sister Anna Ali's life, mission, and community remembrance."
  },
  videos: {
    title: 'Sister Anna Ali Videos | Testimonies and Reflections',
    description:
      'Watch testimonies, reflections, and documentary-style video content about Sister Anna Ali and her legacy.'
  },
  events: {
    title: 'Sister Anna Ali Events | Gatherings, Memorials, and Dates',
    description:
      'Find upcoming events, remembrance gatherings, and important dates connected to Sister Anna Ali.'
  },
  search: {
    title: 'Search Sister Anna Ali Content | Topics, Visions, Missions',
    description:
      "Search and explore Sister Anna Ali content by topic, including personal life, visions, mission updates, gallery, and events."
  },
  admin: {
    title: 'Sister Anna Ali Admin',
    description: 'Administration area for managing memorial content and site updates.'
  }
}

function App() {
  const { currentPage, direction, goTo, goBack, reset } = useNavigation()
  const seo = pageSeo[currentPage] ?? pageSeo.home
  const canonicalUrl =
    currentPage === 'home'
      ? 'https://www.srannalifamily.com/'
      : `https://www.srannalifamily.com/?page=${encodeURIComponent(currentPage)}`

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
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className="mx-auto w-full max-w-none px-0">
        <AnimatePresence mode="wait" custom={direction}>
          {renderPage()}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
