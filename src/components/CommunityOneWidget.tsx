import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function CommunityOneWidget() {
  const location = useLocation()
  const isDirectoryPage = location.pathname === '/servers'

  useEffect(() => {
    // Check if script already exists to avoid duplicates
    if (document.querySelector('script[src*="communityone.io"]')) {
      return
    }

    const add = () => {
      const s = document.createElement("script")
      s.src = "https://communityone.io/static/js/widget/loader.js"
      s.defer = true
      s.setAttribute('data-public-id', "d2b124bc-618a-4c1b-af0a-3cdd84f5c2ed")
      document.body.appendChild(s)
    }

    if (document.body) {
      add()
    } else {
      document.addEventListener("DOMContentLoaded", add)
    }

    return () => {
      // Keep script alive across route changes
    }
  }, [location.pathname])

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* We target many possible selectors to ensure visibility and proper layering */
      div[id^="communityone-"], 
      #communityone-widget-container,
      .communityone-widget,
      iframe[src*="communityone.io"],
      #communityone-spark-widget {
        z-index: 9999 !important;
        position: fixed !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        transition: bottom 0.3s ease-in-out !important;
      }

      /* Desktop positioning */
      @media (min-width: 769px) {
        div[id^="communityone-"], 
        #communityone-widget-container,
        iframe[src*="communityone.io"],
        #communityone-spark-widget {
          bottom: 2rem !important;
          right: 1.5rem !important;
        }
      }

      /* Mobile positioning */
      @media (max-width: 768px) {
        div[id^="communityone-"], 
        #communityone-widget-container,
        iframe[src*="communityone.io"],
        #communityone-spark-widget {
          right: 1.5rem !important;
          bottom: ${isDirectoryPage ? '6.5rem' : '2rem'} !important;
        }
      }
    `}} />
  )
}
