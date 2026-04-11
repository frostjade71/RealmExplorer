import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { AnimatePresence } from 'framer-motion'

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
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 flex flex-col">
        <AnimatePresence mode="wait" onExitComplete={scrollToTop}>
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
