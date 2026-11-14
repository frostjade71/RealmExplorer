import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Image as ImageIcon, UploadCloud, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSetting } from '../hooks/queries'
import { useUpdateSiteSettingMutation } from '../hooks/mutations'
import { supabase } from '../lib/supabase'
import { convertToWebP } from '../lib/imageUtils'

interface HomepageCoverModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HomepageCoverModal({ isOpen, onClose }: HomepageCoverModalProps) {
  const { profile } = useAuth()
  const { data: settingRow, isLoading: isLoadingSetting } = useSiteSetting('homepage_cover')
  const updateSetting = useUpdateSiteSettingMutation()

  // Saved URL from database
  const savedUrl = (
    typeof settingRow?.value === 'string'
      ? settingRow.value
      : settingRow?.value?.url || null
  ) as string | null

  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [isResetToDefault, setIsResetToDefault] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileDetails, setFileDetails] = useState<{ originalSize: number; webpSize: number; name: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Reset local state when modal opens or savedUrl updates
  useEffect(() => {
    if (isOpen) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      setPendingBlob(null)
      setIsResetToDefault(false)
      setIsConverting(false)
      setIsUploading(false)
      setFileDetails(null)
    }
  }, [isOpen, savedUrl])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', { description: 'Please select an image file (PNG, JPG, WebP, etc.).' })
      return
    }

    try {
      setIsConverting(true)
      // Convert to high-resolution WebP (up to 2560x1440) for crisp hero background
      const webpBlob = await convertToWebP(file, 0.82, 2560, 1440)

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
      const newObjectUrl = URL.createObjectURL(webpBlob)
      objectUrlRef.current = newObjectUrl

      setPendingBlob(webpBlob)
      setIsResetToDefault(false)
      setFileDetails({
        originalSize: file.size,
        webpSize: webpBlob.size,
        name: file.name
      })
      toast.success('Image optimized to WebP', {
        description: `Ready to save: ${(webpBlob.size / 1024).toFixed(0)} KB`
      })
    } catch (err: any) {
      console.error('Failed to convert image:', err)
      toast.error('Image Processing Failed', { description: err.message || 'Could not optimize image to WebP.' })
    } finally {
      setIsConverting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // Clear input so same file can be re-selected if desired
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleResetToDefault = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
    setPendingBlob(null)
    setIsResetToDefault(true)
    setFileDetails(null)
  }

  const handleSave = async () => {
    setIsUploading(true)
    try {
      let finalCoverUrl: string | null = savedUrl

      // 1. If admin selected a new image, upload only now to avoid multiple uploads
      if (pendingBlob) {
        const filePath = `covers/homepage-cover-${Date.now()}.webp`
        const { error: uploadError } = await supabase.storage
          .from('main_bucket')
          .upload(filePath, pendingBlob, {
            contentType: 'image/webp',
            cacheControl: 'public, max-age=31536000, immutable',
            upsert: true
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('main_bucket')
          .getPublicUrl(filePath)

        finalCoverUrl = publicUrl

        // Try to remove previous custom cover file from main_bucket if applicable
        if (savedUrl && savedUrl.includes('main_bucket')) {
          try {
            const oldPath = savedUrl.split('/main_bucket/')[1]
            if (oldPath) {
              await supabase.storage.from('main_bucket').remove([oldPath])
            }
          } catch {
            // Ignore cleanup errors
          }
        }
      } else if (isResetToDefault) {
        finalCoverUrl = null

        if (savedUrl && savedUrl.includes('main_bucket')) {
          try {
            const oldPath = savedUrl.split('/main_bucket/')[1]
            if (oldPath) {
              await supabase.storage.from('main_bucket').remove([oldPath])
            }
          } catch {
            // Ignore cleanup errors
          }
        }
      }

      // 2. Update site_settings
      await updateSetting.mutateAsync({
        key: 'homepage_cover',
        value: finalCoverUrl ? { url: finalCoverUrl } : null,
        adminId: profile?.id,
        adminName: profile?.discord_username
      })

      // Update client-side local cache for instant homepage UX
      if (finalCoverUrl) {
        localStorage.setItem('homepage_cover_url', finalCoverUrl)
      } else {
        localStorage.removeItem('homepage_cover_url')
      }

      toast.success('Homepage Cover Updated', {
        description: finalCoverUrl ? 'New hero background cover is now live.' : 'Reverted to default hero background.'
      })
      onClose()
    } catch (err: any) {
      console.error('Failed to save cover setting:', err)
      toast.error('Failed to Save', { description: err.message || 'An error occurred while uploading cover.' })
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  const isChanged = Boolean(pendingBlob || (isResetToDefault && savedUrl !== null))

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
          className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pixel text-white text-lg">Homepage Cover</h2>
                <p className="text-white/40 font-headline text-xs mt-1">Change the hero section background cover image</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            {isLoadingSetting ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#85fc7e]/30 border-t-[#85fc7e] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Upload Area */}
                <div>
                  <h3 className="font-headline font-bold text-white text-sm mb-2">Upload Image</h3>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/png,image/jpeg,image/webp,image/avif" 
                    className="hidden" 
                  />

                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !isConverting && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                      dragOver 
                        ? 'border-[#85fc7e] bg-[#85fc7e]/5' 
                        : 'border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02]'
                    }`}
                  >
                    {isConverting ? (
                      <div className="py-3 flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-[#85fc7e] rounded-full animate-spin" />
                        <span className="text-white text-xs font-headline font-medium">Converting to WebP...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-headline text-sm text-white font-medium">
                            Click or drag image here to upload
                          </p>
                          <p className="font-body text-xs text-white/40 mt-1">
                            PNG, JPG, or WebP. Automatically converted to optimized WebP.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {fileDetails && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-headline text-white/60 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5">
                      <div className="flex items-center gap-2 truncate max-w-[220px]">
                        <ImageIcon className="w-3.5 h-3.5 text-[#85fc7e] shrink-0" />
                        <span className="truncate text-white/80">{fileDetails.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="line-through text-white/40">{(fileDetails.originalSize / 1024).toFixed(0)} KB</span>
                        <span className="text-[#85fc7e] font-bold">{(fileDetails.webpSize / 1024).toFixed(0)} KB (WebP)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset to default option */}
                {(savedUrl || pendingBlob) && !isResetToDefault && (
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2.5 text-xs font-headline text-white/70">
                      <RotateCcw className="w-4 h-4 text-white/40" />
                      <span>Revert hero section back to default image</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-3 py-1.5 rounded-lg text-xs font-headline font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                    >
                      Use Default
                    </button>
                  </div>
                )}

                {isResetToDefault && (
                  <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-[#85fc7e]/20 rounded-xl">
                    <div className="flex items-center gap-2.5 text-xs font-headline text-[#85fc7e]">
                      <RotateCcw className="w-4 h-4 text-[#85fc7e]" />
                      <span>Hero section will be reverted to default image upon saving</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={isUploading || isConverting}
              className="px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!isChanged || isUploading || isConverting}
              className="px-6 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider bg-[#85fc7e] hover:bg-[#85fc7e]/80 text-zinc-950 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
                  Saving & Uploading...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
