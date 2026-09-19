import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Type, PaintBucket } from 'lucide-react'
import { toast } from 'sonner'
import mcGif from '../assets/category/gif/6128-minecraft.gif'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSetting } from '../hooks/queries'
import { useUpdateSiteSettingMutation } from '../hooks/mutations'

interface HomepageIntroModalProps {
  isOpen: boolean
  onClose: () => void
}

export interface IntroWord {
  word: string
  color: string
}

export const DEFAULT_INTRO: IntroWord[] = [
  { word: "Ber", color: "#85fc7e" },
  { word: "Months", color: "#ffffff" },
  { word: "yippie", color: "#ffffff" }
]

export function HomepageIntroModal({ isOpen, onClose }: HomepageIntroModalProps) {
  const { profile } = useAuth()
  const { data: settingRow, isLoading } = useSiteSetting('homepage_intro')
  const introData = settingRow?.value as IntroWord[] | undefined
  const updateSetting = useUpdateSiteSettingMutation()
  
  const [inputText, setInputText] = useState('')
  const [words, setWords] = useState<IntroWord[]>([])

  useEffect(() => {
    if (introData) {
      setWords(introData)
      setInputText(introData.map(w => w.word).join(' '))
    } else if (!isLoading) {
      setWords(DEFAULT_INTRO)
      setInputText(DEFAULT_INTRO.map(w => w.word).join(' '))
    }
  }, [introData, isLoading, isOpen])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setInputText(newText)
    
    const newWords = newText.split(' ').filter(w => w.length > 0)
    const updatedWords = newWords.map((word, i) => {
      const existingColor = words[i]?.color || '#ffffff'
      return { word, color: existingColor }
    })
    setWords(updatedWords)
  }

  const handleColorChange = (index: number, newColor: string) => {
    const updatedWords = [...words]
    updatedWords[index].color = newColor
    setWords(updatedWords)
  }

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'homepage_intro',
        value: words,
        adminId: profile?.id,
        adminName: profile?.discord_username
      })
      toast.success('Homepage Intro Updated', {
        description: 'The changes will now reflect on the homepage.'
      })
      onClose()
    } catch (err: any) {
      toast.error('Failed to update', { description: err.message })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pixel text-white text-lg">Homepage Intro</h2>
                <p className="text-white/40 font-headline text-xs mt-1">Customize the text above "Explore Every Realm"</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#85fc7e]/30 border-t-[#85fc7e] rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline font-bold text-white text-sm mb-3">Live Preview</h3>
                  <div className="bg-[#0f120f] border border-white/10 rounded-xl p-8 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                    <div className="inline-flex items-center gap-2 relative z-10">
                      <img src={mcGif} alt="Icon" className="w-5 h-5 object-contain drop-shadow-md" />
                      <span className="font-pixel text-[9px] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {words.map((w, i) => (
                          <span key={i} style={{ color: w.color }} className="mr-1 last:mr-0">
                            {w.word}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-headline font-bold text-white text-sm mb-3">Text Content</h3>
                  <input
                    type="text"
                    value={inputText}
                    onChange={handleTextChange}
                    placeholder="Enter intro text (e.g. Ber Months yippie)"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-headline text-sm focus:outline-none focus:border-[#85fc7e] transition-colors"
                  />
                </div>

                {words.length > 0 && (
                  <div>
                    <h3 className="font-headline font-bold text-white text-sm mb-3 flex items-center gap-2">
                      <PaintBucket className="w-4 h-4 text-white/40" />
                      Word Colors
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {words.map((w, i) => (
                        <div key={i} className="bg-black border border-white/5 rounded-xl p-3 flex flex-col gap-2">
                          <span className="font-pixel text-[10px] text-white/60 truncate">{w.word}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={w.color}
                              onChange={(e) => handleColorChange(i, e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <span className="font-headline text-xs text-white/40 uppercase font-mono">{w.color}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={updateSetting.isPending}
              className="px-6 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider bg-[#85fc7e] hover:bg-[#85fc7e]/80 text-zinc-950 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateSetting.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
