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
            /* Minecraft style launcher button */
            .c1w-bubble {
              border-radius: 0px !important;
              border: 3px solid #101010 !important;
              box-shadow: 
                inset 2px 2px 0 rgba(107, 227, 119, 0.5), 
                inset -2px -2px 0 rgba(0, 0, 0, 0.8), 
                3px 3px 0 rgba(0, 0, 0, 0.65) !important;
              background-image: url('/badges/Minecraft-Text-Bubble-Iconic-Representation-PNG.png') !important;
              background-size: 65% !important;
              background-repeat: no-repeat !important;
              background-position: center !important;
              background-color: #206324 !important;
              transition: all 0.15s ease-in-out !important;
            }
            .c1w-bubble:hover {
              background-color: #28792d !important;
              box-shadow: 
                inset 2px 2px 0 rgba(107, 227, 119, 0.7), 
                inset -2px -2px 0 rgba(0, 0, 0, 0.9), 
                4px 4px 0 rgba(0, 0, 0, 0.7) !important;
            }
            .c1w-bubble:active {
              background-color: #1a521e !important;
              transform: translate(2px, 2px) !important;
              box-shadow: 
                inset 2px 2px 0 rgba(0, 0, 0, 0.9), 
                inset -2px -2px 0 rgba(107, 227, 119, 0.3), 
                1px 1px 0 rgba(0, 0, 0, 0.5) !important;
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

            /* Minecraft Chat Panel/Modal Overhaul */
            .c1w-panel {
              border-radius: 0px !important;
              border: 4px solid #101010 !important;
              background-color: #313233 !important;
              box-shadow: 
                inset 2px 2px 0 rgba(255, 255, 255, 0.15), 
                inset -2px -2px 0 rgba(0, 0, 0, 0.75), 
                6px 6px 0 rgba(0, 0, 0, 0.75) !important;
              overflow: hidden !important;
            }

            /* Desktop card layout */
            @media (min-width: 481px) {
              .c1w-panel {
                border-radius: 0px !important;
                border: 4px solid #101010 !important;
                background-color: #313233 !important;
                box-shadow: 
                  inset 2px 2px 0 rgba(255, 255, 255, 0.15), 
                  inset -2px -2px 0 rgba(0, 0, 0, 0.75), 
                  6px 6px 0 rgba(0, 0, 0, 0.75) !important;
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
                height: 520px !important;
                max-height: calc(100vh - 120px) !important;
                border-radius: 0px !important;
                border: 4px solid #101010 !important;
                background-color: #313233 !important;
                box-shadow: 
                  inset 2px 2px 0 rgba(255, 255, 255, 0.15), 
                  inset -2px -2px 0 rgba(0, 0, 0, 0.75), 
                  6px 6px 0 rgba(0, 0, 0, 0.75) !important;
              }
            }

            /* Panel Header */
            .c1w-panel header, .c1w-header, .c1w-topbar, [class*="header"] {
              border-radius: 0px !important;
              background-color: #242526 !important;
              border-bottom: 3px solid #101010 !important;
            }

            /* Header Buttons (Close / Refresh) */
            .c1w-panel header button, .c1w-header button, [class*="header"] button {
              border-radius: 0px !important;
              background-color: #2b2b2b !important;
              border: 2px solid #101010 !important;
              border-top: 2px solid rgba(255, 255, 255, 0.2) !important;
              border-left: 2px solid rgba(255, 255, 255, 0.2) !important;
              border-bottom: 2px solid rgba(0, 0, 0, 0.8) !important;
              border-right: 2px solid rgba(0, 0, 0, 0.8) !important;
              color: #ffffff !important;
              box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5) !important;
            }
            .c1w-panel header button:active, .c1w-header button:active {
              transform: translate(1px, 1px) !important;
            }

            /* Message Bubbles - Minecraft Sharp Style */
            .c1w-panel [class*="message"], .c1w-panel [class*="bubble"] {
              border-radius: 0px !important;
            }

            /* User Message */
            [data-sender="user"], .c1w-message-user, [class*="userMessage"], [class*="UserMessage"] {
              border-radius: 0px !important;
              background-color: #206324 !important;
              color: #ffffff !important;
              border: 2px solid #101010 !important;
              box-shadow: 
                inset 1px 1px 0 rgba(107, 227, 119, 0.5), 
                inset -1px -1px 0 rgba(0, 0, 0, 0.8), 
                2px 2px 0 rgba(0, 0, 0, 0.5) !important;
            }

            /* Assistant / Bot Message */
            [data-sender="assistant"], .c1w-message-bot, .c1w-message-assistant, [class*="botMessage"], [class*="assistantMessage"] {
              border-radius: 0px !important;
              background-color: #242526 !important;
              color: #f4f4f5 !important;
              border: 2px solid #101010 !important;
              box-shadow: 
                inset 1px 1px 0 rgba(255, 255, 255, 0.12), 
                inset -1px -1px 0 rgba(0, 0, 0, 0.8), 
                2px 2px 0 rgba(0, 0, 0, 0.5) !important;
            }

            /* Chat Input / Composer Area */
            .c1w-panel footer, [class*="composer"], [class*="inputContainer"], [class*="input-container"] {
              border-radius: 0px !important;
              background-color: #242526 !important;
              border-top: 3px solid #101010 !important;
            }

            .c1w-panel input, .c1w-panel textarea {
              border-radius: 0px !important;
              background-color: #1a1b1c !important;
              border: 2px solid #101010 !important;
              color: #ffffff !important;
              box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.7) !important;
            }
            .c1w-panel input:focus, .c1w-panel textarea:focus {
              border-color: #206324 !important;
              outline: none !important;
            }

            /* Send / Action Buttons */
            .c1w-panel button[type="submit"], [class*="sendButton"], [class*="send-button"] {
              border-radius: 0px !important;
              background-color: #206324 !important;
              border: 2px solid #101010 !important;
              border-top: 2px solid rgba(107, 227, 119, 0.6) !important;
              border-left: 2px solid rgba(107, 227, 119, 0.6) !important;
              border-bottom: 2px solid rgba(0, 0, 0, 0.9) !important;
              border-right: 2px solid rgba(0, 0, 0, 0.9) !important;
              color: #ffffff !important;
              box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5) !important;
            }
            .c1w-panel button[type="submit"]:hover, [class*="sendButton"]:hover {
              background-color: #28792d !important;
            }
            .c1w-panel button[type="submit"]:active, [class*="sendButton"]:active {
              transform: translate(1px, 1px) !important;
              box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5) !important;
            }

            /* Suggestion / Quick Prompt Chips */
            [class*="prompt"], [class*="suggestion"], [class*="chip"] {
              border-radius: 0px !important;
              background-color: #2b2b2b !important;
              border: 2px solid #101010 !important;
              border-top: 2px solid rgba(255, 255, 255, 0.15) !important;
              border-left: 2px solid rgba(255, 255, 255, 0.15) !important;
              border-bottom: 2px solid rgba(0, 0, 0, 0.8) !important;
              border-right: 2px solid rgba(0, 0, 0, 0.8) !important;
              color: #e4e4e7 !important;
              box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4) !important;
            }
            [class*="prompt"]:hover, [class*="suggestion"]:hover, [class*="chip"]:hover {
              background-color: #353637 !important;
              color: #ffffff !important;
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
    '/server/',
    '/admin',
    '/profile',
    '/submit'
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
