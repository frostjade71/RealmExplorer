import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

interface ImageUploadProps {
  label: string
  onUpload: (url: string) => void
  value?: string
  aspectRatio?: 'square' | 'video'
}

export function ImageUpload({ label, onUpload, value, aspectRatio = 'square' }: ImageUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUploadPath = useRef<string | null>(null)

  // Smooth counter animation
  const progressSpring = useSpring(0, { bounce: 0, duration: 400 })
  const progressDisplay = useTransform(progressSpring, (p) => `${Math.round(p)}%`)

  useEffect(() => {
    progressSpring.set(uploadProgress)
  }, [uploadProgress, progressSpring])

  // Sync preview with value prop when it changes (e.g. after async data fetch)
  useEffect(() => {
    if (value !== undefined) {
      setPreview(value)
    }
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file || !user) return

      // Enforce 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.')
        return
      }

      setUploading(true)
      setUploadProgress(10) // Start progress

      // Cleanup previous session-uploaded image if it exists
      if (currentUploadPath.current) {
        await supabase.storage
          .from('server-assets')
          .remove([currentUploadPath.current])
        currentUploadPath.current = null
      }

      // Create a unique file path: user_id/timestamp-filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase Storage
      // Note: onUploadProgress is not supported in the basic upload types/method for fetch
      setUploadProgress(40)
      
      const { error: uploadError } = await supabase.storage
        .from('server-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      setUploadProgress(80)

      // Update current session path
      currentUploadPath.current = filePath

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('server-assets')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      await new Promise(r => setTimeout(r, 400)) // delay to let the animation show

      setPreview(publicUrl)
      onUpload(publicUrl)
    } catch (error: any) {
      console.error('Error uploading image:', error.message)
      alert('Error uploading image. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeImage = async () => {
    // If we just uploaded this in the current session, delete it from storage
    if (currentUploadPath.current) {
      await supabase.storage
        .from('server-assets')
        .remove([currentUploadPath.current])
      currentUploadPath.current = null
    }
    
    setPreview('')
    onUpload('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">
        {label}
      </label>
      
      <div 
        className={`relative group rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950/50 hover:border-realm-green transition-all overflow-hidden ${
          aspectRatio === 'square' ? 'aspect-square max-w-[200px]' : 'aspect-video'
        }`}
      >
        <div 
          className="w-full h-full flex flex-col items-center justify-center relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div 
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 z-20"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <Loader2 className="absolute inset-0 w-full h-full text-realm-green animate-spin opacity-20" />
                  <motion.span className="text-[10px] font-pixel text-realm-green">
                    {progressDisplay}
                  </motion.span>
                </div>
                <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-realm-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </motion.div>
            ) : preview ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative"
              >
                <img 
                  src={preview} 
                  alt="preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Upload className="w-6 h-6 text-realm-green" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest font-headline">Change Photo</span>
                </div>
                {/* Remove button separate from the main click container */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                  className="absolute top-2 right-2 z-30 bg-red-500/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-6"
              >
                <ImageIcon className="w-8 h-8 text-zinc-600 mb-2 group-hover:text-realm-green transition-colors" />
                <span className="text-xs text-zinc-500 font-headline text-center group-hover:text-zinc-300">
                  Click to upload {aspectRatio === 'square' ? 'Icon' : 'Banner'}
                </span>
                <span className="text-[10px] text-zinc-700 mt-1 uppercase font-headline">PNG, JPG up to 5MB</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
