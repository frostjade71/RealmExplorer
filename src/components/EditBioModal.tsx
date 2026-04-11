import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useUpdateProfileMutation } from '../hooks/mutations'
import { toast } from 'sonner'

interface EditBioModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  initialBio: string | null
}

export function EditBioModal({ isOpen, onClose, profileId, initialBio }: EditBioModalProps) {
  const [bio, setBio] = useState(initialBio || '')
  const updateMutation = useUpdateProfileMutation()
  const maxLength = 250
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setBio(initialBio || '')
    }
  }, [isOpen, initialBio])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    updateMutation.mutate(
      { id: profileId, bio: bio.trim() },
      {
        onSuccess: () => {
          toast.success('Bio Updated', {
            description: 'Your profile bio has been saved successfully.'
          })
          onClose()
        },
        onError: (err: any) => {
          toast.error('Update Failed', {
            description: err.message || 'Failed to update bio. Please try again.'
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
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-pixel text-lg text-white">Edit Bio</h3>
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
                    Short Bio
                  </label>
                  <span className={`text-[10px] font-bold font-headline ${bio.length >= maxLength ? 'text-red-400' : 'text-zinc-500'}`}>
                    {bio.length}/{maxLength}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, maxLength))}
                    placeholder="Write a little bit about yourself..."
                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white outline-none focus:border-realm-green/50 transition-all resize-none font-headline"
                  />
                  <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-lg font-headline font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-realm-green text-realm-green-dark py-3 px-4 rounded-lg font-headline font-bold hover:bg-[#85fc7e] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
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
