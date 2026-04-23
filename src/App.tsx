import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/react"

import { Toaster } from 'sonner'
import { DevEgressWarning } from './components/DevEgressWarning'

import { HelmetProvider } from 'react-helmet-async'

function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <DevEgressWarning />
      <Analytics />
      <SpeedInsights />
      <Toaster 
        theme="dark" 
        richColors 
        duration={3000}
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(24, 24, 27, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
    </HelmetProvider>
  )
}

export default App
