import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-400 hover:text-zinc-200 transition-all"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-realm-green" /> : <Copy size={14} />}
    </button>
  )
}

export function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  return (
    <div className="relative group">
      <CopyButton text={code} />
      <pre className="bg-zinc-950 border border-white/5 rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className={`language-${language} text-zinc-300`}>{code}</code>
      </pre>
    </div>
  )
}
