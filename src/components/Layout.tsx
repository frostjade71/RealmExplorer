import { Outlet, useLocation, ScrollRestoration } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnimatePresence } from 'framer-motion'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-dvh flex flex-col pt-20">
      <ScrollRestoration />
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
