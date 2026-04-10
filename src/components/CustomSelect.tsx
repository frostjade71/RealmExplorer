import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Option {
  key: string
  label: string
  icon: React.ReactNode
}

interface CustomSelectProps {
  value: string
  onChange: (value: any) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select an option', className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(o => o.key === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 md:px-4 py-3 text-white flex items-center justify-between hover:border-zinc-700 transition-all font-headline group focus:ring-1 focus:ring-realm-green/30 outline-none"
      >
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="flex-shrink-0">
            {selectedOption?.icon}
          </div>
          <span className={`text-sm ${selectedOption ? 'text-white' : 'text-zinc-500'} hidden md:block`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-1.5 backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChange(option.key)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-headline relative group/item ${
                    value === option.key 
                    ? 'bg-realm-green/10 text-realm-green border border-realm-green/20' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`flex-shrink-0 transition-transform duration-300 ${value === option.key ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                    {option.icon}
                  </div>
                  <span className="flex-grow text-left font-medium">
                    {option.label}
                  </span>
                  {value === option.key && (
                    <motion.div 
                      layoutId="active-check"
                      className="w-1 h-3 bg-realm-green rounded-full shadow-[0_0_8px_rgba(78,196,78,0.5)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
