import React, { useState } from 'react'
import { Terminal, Globe, MessageSquare, Link2, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface RichTextProps {
  content: string
  className?: string
}

const KEYWORDS = {
  'Java IP:': { icon: Terminal, color: 'text-green-400', bg: 'bg-green-400/5', border: 'border-green-400/10' },
  'Bedrock IP:': { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/10' },
  'Discord:': { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-400/5', border: 'border-indigo-400/10' },
  'Website:': { icon: Link2, color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/10' },
  'Port:': { icon: null, color: 'text-zinc-400', bg: null, border: null }
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null

  return (
    <div className={`rich-text-content ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => {
            // Convert children to text to check for keywords
            const textContent = React.Children.toArray(children).map(child => {
              if (typeof child === 'string') return child
              return ''
            }).join('')

            const matchingKeyword = Object.entries(KEYWORDS).find(([key]) => 
              textContent.trim().toLowerCase().startsWith(key.toLowerCase())
            )

            if (matchingKeyword) {
              const [key, theme] = matchingKeyword
              const restOfContent = textContent.trim().slice(key.length).trim()
              return (
                <SpecialLine 
                  label={key} 
                  content={restOfContent} 
                  theme={theme} 
                  Icon={theme.icon}
                />
              )
            }

            return <p className="leading-relaxed mb-4 text-zinc-300 font-headline last:mb-0">{children}</p>
          },
          h1: ({ children }) => <h1 className="text-lg md:text-xl font-headline font-bold text-white mt-8 mb-4 uppercase tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base md:text-lg font-headline font-bold text-white mt-6 mb-3 uppercase tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm md:text-base font-headline font-bold text-white mt-4 mb-2 uppercase tracking-tight">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-zinc-400 font-headline">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-zinc-400 font-headline">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
          code: ({ children }) => <code className="bg-zinc-800 text-realm-green px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-realm-green bg-realm-green/5 px-6 py-4 rounded-r-xl my-6 italic text-zinc-300 font-headline">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-realm-green hover:underline break-all transition-all underline-offset-4"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 border-zinc-800" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function SpecialLine({ label, content, theme, Icon }: any) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const textToCopy = content.split(' ')[0]
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
          {content}
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
