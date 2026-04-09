import React, { useState } from 'react'
import { Terminal, Globe, MessageSquare, Link2, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RichTextProps {
  content: string
  className?: string
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null

  // Linkification Regex: handles http, https, www, and simple domains like play.example.com
  const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi

  // Keywords for special formatting
  const KEYWORDS = {
    'Java IP:': { icon: Terminal, color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/10' },
    'Bedrock IP:': { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/10' },
    'Discord:': { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-400/5', border: 'border-indigo-400/10' },
    'Website:': { icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/10' },
    'Port:': { icon: null, color: 'text-zinc-400', bg: null, border: null }
  }

  const linkify = (text: string) => {
    const parts = text.split(URL_REGEX)
    return parts.map((part, i) => {
      if (part.match(URL_REGEX)) {
        let href = part
        if (!href.match(/^https?:\/\//i)) {
          href = `https://${href.startsWith('www.') ? href : href}`
        }
        
        // Clean trailing punctuation
        const cleanHref = href.replace(/[.,!?;:]$/, '')
        const cleanPart = part.replace(/[.,!?;:]$/, '')
        const punctuation = part.slice(cleanPart.length)

        return (
          <React.Fragment key={i}>
            <a
              href={cleanHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-realm-green hover:underline break-all transition-all"
            >
              {cleanPart}
            </a>
            {punctuation}
          </React.Fragment>
        )
      }
      return part
    })
  }

  const lines = content.split('\n')

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lineIdx) => {
        // Check if line starts with a keyword
        const matchingKeyword = Object.entries(KEYWORDS).find(([key]) => 
          line.trim().toLowerCase().startsWith(key.toLowerCase())
        )

        if (matchingKeyword) {
          const [key, theme] = matchingKeyword
          const Icon = theme.icon
          const restOfLine = line.trim().slice(key.length).trim()
          
          return (
            <SpecialLine 
              key={lineIdx} 
              label={key} 
              content={restOfLine} 
              theme={theme} 
              linkify={linkify}
              Icon={Icon}
            />
          )
        }

        return (
          <p key={lineIdx} className="leading-relaxed">
            {linkify(line)}
          </p>
        )
      })}
    </div>
  )
}

function SpecialLine({ label, content, theme, linkify, Icon }: any) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    // Extract IP if this is an IP field
    const textToCopy = content.split(' ')[0] // Take the first word (usually the IP/Link)
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isIP = label.includes('IP')

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${theme.bg || 'bg-zinc-900/40'} ${theme.border || 'border-zinc-800'} hover:border-realm-green/30 my-2`}
    >
      {Icon && <Icon className={`w-4 h-4 ${theme.color} shrink-0`} />}
      <div className="flex-1 text-sm font-headline">
        <span className={`font-bold uppercase tracking-wider text-[10px] opacity-60 mr-2`}>
          {label}
        </span>
        <span className="text-zinc-200">
          {linkify(content)}
        </span>
      </div>
      
      {isIP && (
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-500 hover:text-realm-green transition-all"
          title="Copy to clipboard"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check className="w-3.5 h-3.5 text-realm-green" />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}
    </motion.div>
  )
}
