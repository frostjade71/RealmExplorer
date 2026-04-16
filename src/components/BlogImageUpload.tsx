import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { convertToWebP } from '../lib/imageUtils'
import { useAuth } from '../contexts/AuthContext'
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

interface BlogImageUploadProps {
  label: string
  onUpload: (url: string) => void
  value?: string
}

export function BlogImageUpload({ label, onUpload, value }: BlogImageUploadProps) {
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

  useEffect(() => {
    if (value !== undefined) {
      setPreview(value)
    }
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file || !user) return

      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.')
        return
      }

      setUploading(true)
      setUploadProgress(10)

      // Convert to WebP
      setUploadProgress(20)
      const webpBlob = await convertToWebP(file)
      
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.webp`
      const filePath = `entries/${fileName}`

      setUploadProgress(40)
      
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, webpBlob, {
          contentType: 'image/webp',
          upsert: true
        })

      if (uploadError) throw uploadError

      setUploadProgress(80)
      currentUploadPath.current = filePath

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      setUploadProgress(100)
      await new Promise(r => setTimeout(r, 400))

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
    // Note: Actual storage cleanup of old images is handled by the mutation logic
    // but we cleanup if they just uploaded it in THIS session and change their mind.
    if (currentUploadPath.current) {
      await supabase.storage
        .from('blog-images')
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
        className="relative group rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/50 hover:border-realm-green transition-all overflow-hidden aspect-video max-w-2xl"
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
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-center">
                  <Upload className="w-6 h-6 text-realm-green" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest font-headline px-4">Change Cover Image</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                  className="absolute top-4 right-4 z-30 bg-red-500/80 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:border-realm-green/50 transition-colors">
                  <ImageIcon className="w-8 h-8 text-zinc-600 group-hover:text-realm-green transition-colors" />
                </div>
                <span className="text-sm text-zinc-400 font-headline font-bold uppercase tracking-widest mb-1 group-hover:text-white transition-colors">
                  Upload Cover Image
                </span>
                <span className="text-[10px] text-zinc-600 uppercase font-headline tracking-tighter">
                  WebP, PNG, JPG up to 5MB (16:9 recommended)
                </span>
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
