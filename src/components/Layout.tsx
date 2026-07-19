import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnimatePresence } from 'framer-motion'

import { CookieBanner } from './CookieBanner'
import { CommunityOneWidget } from './CommunityOneWidget'

function RouteFallback() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-realm-green/30 border-t-realm-green rounded-full animate-spin" />
    </div>
  )
}

function scrollToTop() {
  const doScroll = () => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
  }
  
  doScroll()
  setTimeout(doScroll, 50)
  setTimeout(doScroll, 150)
}

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 flex flex-col">
        <Suspense fallback={<RouteFallback />}>
          <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
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
