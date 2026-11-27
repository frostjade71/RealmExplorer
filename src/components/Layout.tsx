import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from './FeedbackStates'

import { CookieBanner } from './CookieBanner'
import { CommunityOneWidget } from './CommunityOneWidget'
import { scrollToTop } from '../lib/scroll'

function RouteFallback() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) return
    scrollToTop()
    return () => scrollToTop()
  }, [hash])

  return (
    <div className="flex-grow flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  )
}

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 flex flex-col">
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait" onExitComplete={() => { if (!location.hash) scrollToTop() }}>
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />

      <CookieBanner />
      <CommunityOneWidget />
    </div>
  )
}
