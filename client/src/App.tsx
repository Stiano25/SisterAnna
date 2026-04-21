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

const pageSeo: Record<string, { title: string; description: string; noindex?: boolean }> = {
  home: {
    title: 'Sister Anna Ali (Anna Hadija Ali) | Official Family Website',
    description:
      'Official family website for Sister Anna Ali (Anna Hadija Ali, Sr Anna Ali): biography, faith testimony, mission updates, and verified memorial information.'
  },
  life: {
    title: 'Anna Hadija Ali (Sister Anna Ali) Personal Life | Official Biography',
    description:
      'Discover the official family biography of Anna Hadija Ali (Sister Anna Ali), including early life, conversion, vocation, and legacy.'
  },
  visions: {
    title: "Sr Anna Ali Visions of Jesus | Sister Anna Ali Testimony",
    description:
      'Learn about the testimony of Sr Anna Ali (Sister Anna Ali), including reported visions of Jesus and Eucharistic messages preserved by her family.'
  },
  mission: {
    title: 'Sister Anna Ali Mission | Official Family Outreach and Mercy Works',
    description:
      'Follow official family mission updates inspired by Sister Anna Ali (Anna Ali), including mercy projects, events, and community faith outreach.'
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
    description: 'Administration area for managing memorial content and site updates.',
    noindex: true
  }
}

function App() {
  const { currentPage, direction, goTo, goBack, reset } = useNavigation()
  const seo = pageSeo[currentPage] ?? pageSeo.home
  const canonicalPath =
    currentPage === 'home'
      ? '/'
      : currentPage === 'admin'
        ? '/admin'
        : currentPage === 'search'
          ? '/search'
          : `/${encodeURIComponent(currentPage)}`
  const canonicalUrl = `https://www.srannalifamily.com${canonicalPath}`
  const robotsValue = seo.noindex ? 'noindex, nofollow' : 'index, follow'

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
        <meta name="robots" content={robotsValue} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.srannalifamily.com/images/sister-anna-ali.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content="https://www.srannalifamily.com/images/sister-anna-ali.jpg" />
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
