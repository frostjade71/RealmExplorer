import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Share2, Globe, Save } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from 'react-icons/si'
import { CustomSelect } from './CustomSelect'
import type { SocialLink, SocialPlatform } from '../types'
import { useUpdateProfileMutation } from '../hooks/mutations'
import { toast } from 'sonner'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  initialLinks: SocialLink[]
}

export function EditProfileModal({ isOpen, onClose, profileId, initialLinks }: EditProfileModalProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks || [])
  const updateMutation = useUpdateProfileMutation()
  
  // Reset state when modal opens to ensure cancelled changes don't persist
  useEffect(() => {
    if (isOpen) {
      setLinks(initialLinks || [])
    }
  }, [isOpen, initialLinks])

  const socialOptions = [
    { key: 'website', label: 'Website', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'discord', label: 'Discord', icon: <SiDiscord className="w-3.5 h-3.5" /> },
    { key: 'instagram', label: 'Instagram', icon: <SiInstagram className="w-3.5 h-3.5" /> },
    { key: 'youtube', label: 'YouTube', icon: <SiYoutube className="w-3.5 h-3.5" /> },
    { key: 'tiktok', label: 'TikTok', icon: <SiTiktok className="w-3.5 h-3.5" /> },
    { key: 'facebook', label: 'Facebook', icon: <SiFacebook className="w-3.5 h-3.5" /> },
    { key: 'twitch', label: 'Twitch', icon: <SiTwitch className="w-3.5 h-3.5" /> },
  ]

  const handleAddLink = () => {
    setLinks([...links, { platform: 'website', url: '' }])
  }

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out empty links
    const validLinks = links.filter(l => l.url.trim() !== '')

    updateMutation.mutate(
      { id: profileId, social_links: validLinks },
      {
        onSuccess: () => {
          toast.success('Profile Updated', {
            description: 'Your personal links have been saved successfully.'
          })
          onClose()
        },
        onError: (err: any) => {
          toast.error('Update Failed', {
            description: err.message || 'Failed to update links. Please try again.'
          })
        }
      }
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-pixel text-lg text-white">Personal Links</h3>
                  <p className="text-xs text-zinc-500 font-headline">Manage your social presence</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-headline">
                    Your Social Links
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-realm-green hover:text-[#85fc7e] transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>

                <div className="space-y-3 min-h-[120px] pb-12">
                  {links.map((link, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 items-center group"
                      style={{ zIndex: links.length - index }}
                    >
                      <div className="flex-1 flex gap-2 items-center bg-zinc-950 border border-zinc-800 p-2 rounded-xl">
                        <CustomSelect
                          value={link.platform}
                          onChange={(val) => handleUpdateLink(index, 'platform', val as SocialPlatform)}
                          options={socialOptions}
                          className="w-[52px] md:w-36 flex-shrink-0"
                        />
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          className="flex-1 bg-transparent border-none text-sm text-white outline-none font-headline"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}

                  {links.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                      <Share2 className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                      <p className="text-zinc-600 text-[10px] font-headline uppercase tracking-widest">No links added yet</p>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="mt-4 text-xs font-bold text-realm-green hover:underline font-headline"
                      >
                        Add your first link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-headline font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-realm-green text-realm-green-dark py-3 px-4 rounded-xl font-headline font-bold hover:bg-[#85fc7e] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
