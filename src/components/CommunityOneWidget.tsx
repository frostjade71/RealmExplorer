import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function CommunityOneWidget() {
  const location = useLocation()
  
  useEffect(() => {
    // reset history and such uwu
    if (!sessionStorage.getItem('c1w_session_active')) {
      localStorage.removeItem('cm1w:d2b124bc-618a-4c1b-af0a-3cdd84f5c2ed')
      sessionStorage.setItem('c1w_session_active', 'true')
    }

    // disable animation
    // @ts-ignore
    if (!window.__c1wFetchPatched) {
      const originalFetch = window.fetch
      window.fetch = async function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as any)?.url || (args[0] as any)?.href
        const response = await originalFetch.apply(this, args as any)
        
        if (url && url.includes('config.json') && url.includes('d2b124bc-618a-4c1b-af0a-3cdd84f5c2ed')) {
          const clone = response.clone()
          try {
            const data = await clone.json()
            data.launcher_animation = ''
            return new Response(JSON.stringify(data), {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers
            })
          } catch (e) {
            return response
          }
        }
        return response
      }
      // @ts-ignore
      window.__c1wFetchPatched = true
    }

    // inject custom CSS cuz i dont like how it looks originally
    // @ts-ignore
    if (!window.__c1wShadowPatched) {
      const originalAttachShadow = Element.prototype.attachShadow
      Element.prototype.attachShadow = function(init) {
        const shadow = originalAttachShadow.call(this, { ...init, mode: 'open' })
        
        if (this.hasAttribute('data-cm1-widget')) {
          const style = document.createElement('style')
          style.innerHTML = `
            /* Rounded square launcher style */
            .c1w-bubble {
              border-radius: 8px !important; 
              background-image: url('/badges/Minecraft-Text-Bubble-Iconic-Representation-PNG.png') !important;
              background-size: 70% !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
              background-color: #267c26ff !important;
            }
            /* Hide default icon */
            .c1w-bubble svg, .c1w-bubble .c1w-bubble-emoji {
              display: none !important;
            }
            /* Move button left on desktop */
            @media (min-width: 768px) {
              .c1w-root.align-right {
                right: 32px !important;
              }
            }
            /* Mobile card layout */
            @media (max-width: 480px) {
              .c1w-panel {
                position: absolute !important;
                bottom: 72px !important;
                left: auto !important;
                right: 0 !important;
                top: auto !important;
                width: 380px !important;
                max-width: calc(100vw - 36px) !important;
                height: 500px !important;
                max-height: calc(100vh - 120px) !important;
                border-radius: 12px !important;
                border: 1px solid var(--c1w-border) !important;
                box-shadow: var(--c1w-shadow) !important;
              }
            }
            /* Custom scrollbar */
            * {
              scrollbar-color: #1a3d1a #050805 !important;
            }
            ::-webkit-scrollbar {
              width: 8px !important;
            }
            ::-webkit-scrollbar-track {
              background: #050805 !important;
            }
            ::-webkit-scrollbar-thumb {
              background: #1a3d1a !important;
              border-radius: 10px !important;
              border: 2px solid #050805 !important;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #4EC44E !important;
            }
          `
          shadow.appendChild(style)
        }
        return shadow
      }
      // @ts-ignore
      window.__c1wShadowPatched = true
    }

    // widget script
    if (!document.getElementById('c1-widget-script')) {
      const s = document.createElement("script")
      s.id = 'c1-widget-script'
      s.src = "https://communityone.io/static/js/widget/loader.js"
      s.defer = true
      s.dataset.publicId = "d2b124bc-618a-4c1b-af0a-3cdd84f5c2ed"
      document.body.appendChild(s)
    }

    return () => {
      const script = document.getElementById('c1-widget-script')
      if (script) script.remove()
      
      const widget = document.querySelector('[data-cm1-widget]')
      if (widget) widget.remove()

      // reset tracking
      // @ts-ignore
      if (window.__cm1WidgetMounted) {
        // @ts-ignore
        delete window.__cm1WidgetMounted['d2b124bc-618a-4c1b-af0a-3cdd84f5c2ed']
      }
    }
  }, [])

  const hiddenPaths = [
    '/servers',
    '/admin',
    '/profile',
    '/dashboard/analytics',
    '/submit',
    '/status'
  ]
  const shouldHideWidget = hiddenPaths.some(path => location.pathname.startsWith(path))

  return (
    <style>{`
      /* Position behind mobile overlay */
      [data-cm1-widget] {
        z-index: 55 !important;
      }
      
      ${shouldHideWidget ? `
        [data-cm1-widget] {
          display: none !important;
        }
      ` : ''}
    `}</style>
  )
}
