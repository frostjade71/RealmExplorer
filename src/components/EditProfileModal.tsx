import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { X, Plus, Trash2, Share2, Globe, Save, Mail, GripVertical } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch } from 'react-icons/si'
import { CustomSelect } from './CustomSelect'
import type { SocialLink, SocialPlatform } from '../types'
import { useUpdateProfileMutation } from '../hooks/mutations'
import { toast } from 'sonner'

interface ReorderableSocialLink extends SocialLink {
  localId: string
}

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  initialLinks: SocialLink[]
}

import { createPortal } from 'react-dom'

export function EditProfileModal({ isOpen, onClose, profileId, initialLinks }: EditProfileModalProps) {
  const [links, setLinks] = useState<ReorderableSocialLink[]>([])
  const updateMutation = useUpdateProfileMutation()
  
  // Reset state when modal opens to ensure cancelled changes don't persist
  useEffect(() => {
    if (isOpen) {
      setLinks((initialLinks || []).map(link => ({
        ...link,
        localId: Math.random().toString(36).substr(2, 9)
      })))
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
    { key: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
  ]

  const handleAddLink = () => {
    setLinks([...links, { 
      platform: 'website', 
      url: '', 
      localId: Math.random().toString(36).substr(2, 9) 
    }])
  }

  const handleRemoveLink = (localId: string) => {
    setLinks(links.filter(l => l.localId !== localId))
  }

  const handleUpdateLink = (localId: string, field: keyof SocialLink, value: string) => {
    const newLinks = [...links]
    const index = newLinks.findIndex(l => l.localId === localId)
    if (index !== -1) {
      newLinks[index] = { ...newLinks[index], [field]: value }
      setLinks(newLinks)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Filter out empty links and remove localId
    const validLinks = links
      .filter(l => l.url.trim() !== '')
      .map(({ localId, ...cleanLink }) => ({
        ...cleanLink,
        url: cleanLink.platform === 'email' 
          ? cleanLink.url.replace(/^mailto:/i, '').trim()
          : cleanLink.url.trim()
      }))

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-pixel text-lg text-white uppercase tracking-wider">Personal Links</h3>
                  <p className="text-[10px] text-zinc-500 font-headline uppercase tracking-widest font-bold">Manage your social presence</p>
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

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto scrollbar-none flex-grow">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-headline">
                    Your Social Links
                  </label>
                  <button
                    type="button"
                    disabled={links.length >= 6}
                    onClick={handleAddLink}
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${links.length >= 6 ? 'text-zinc-600 cursor-not-allowed' : 'text-realm-green hover:text-[#85fc7e]'}`}
                  >
                    <Plus className="w-3 h-3" /> Add Link {links.length >= 6 && '(Limit reached)'}
                  </button>
                </div>

                <Reorder.Group 
                  axis="y" 
                  values={links} 
                  onReorder={setLinks}
                  className="space-y-3 min-h-[120px] pb-32 px-1"
                >
                  {links.map((link) => (
                    <Reorder.Item 
                      key={link.localId}
                      value={link}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 items-center group"
                    >
                      <div className="cursor-grab active:cursor-grabbing p-1 text-zinc-700 hover:text-zinc-400 transition-colors shrink-0">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="flex-1 flex gap-2 items-center bg-zinc-950 border border-zinc-800 p-2 rounded-lg min-w-0 transition-all duration-300">
                        <CustomSelect
                          value={link.platform}
                          onChange={(val) => handleUpdateLink(link.localId, 'platform', val as SocialPlatform)}
                          options={socialOptions}
                          className="w-auto md:w-36 flex-shrink-0"
                          hideLabelMobile={true}
                        />
                        <div className="h-4 w-px bg-zinc-800 mx-1 flex-shrink-0" />
                        <input
                          type={link.platform === 'email' ? 'text' : 'url'}
                          required
                          placeholder={link.platform === 'email' ? 'your@email.com' : 'https://...'}
                          className="flex-1 min-w-0 bg-transparent border-none text-sm text-white outline-none font-headline focus:ring-0"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.localId, 'url', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link.localId)}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                  {links.length === 0 && (
                    <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-950/50">
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
              </form>

              <div className="p-6 border-t border-zinc-800 bg-black/20 shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-2 md:px-4 rounded-lg font-headline font-bold text-[10px] md:text-xs text-zinc-500 hover:text-white transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      // Trigger form submit manually since button is outside form now for layout
                      const form = (e.currentTarget.closest('.relative') as HTMLElement).querySelector('form');
                      if (form) form.requestSubmit();
                    }}
                    disabled={updateMutation.isPending}
                    className="flex-[2] bg-realm-green text-realm-green-dark py-3 px-2 md:px-4 rounded-lg font-headline font-bold text-[10px] md:text-xs hover:bg-[#85fc7e] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {updateMutation.isPending ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
