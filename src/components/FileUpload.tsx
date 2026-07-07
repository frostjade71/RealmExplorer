import { useState, useRef, useEffect } from 'react'
import { Upload, X, Loader2, FileText } from 'lucide-react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface FileUploadProps {
  label: string
  onUpload: (url: string, file: File | null) => void
  value?: string
  accept?: string
  maxSizeMB?: number
  bucket?: string
  immediateUpload?: boolean
  initialFilename?: string
}

export function FileUpload({ 
  label, 
  onUpload, 
  value, 
  accept = "*", 
  maxSizeMB = 30, 
  bucket = 'project-files',
  immediateUpload = true,
  initialFilename = ''
}: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState(value || '')
  const [fileName, setFileName] = useState(initialFilename || (value ? 'File uploaded' : ''))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentUploadPath = useRef<string | null>(null)

  const progressSpring = useSpring(0, { bounce: 0, duration: 400 })
  const progressDisplay = useTransform(progressSpring, (p) => `${Math.round(p)}%`)

  useEffect(() => {
    progressSpring.set(uploadProgress)
  }, [uploadProgress, progressSpring])

  useEffect(() => {
    if (value !== undefined) {
      setFileUrl(value)
      if (value && !fileName) {
        setFileName('File uploaded')
      }
    }
  }, [value, fileName])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error('File too large', { description: `File must be under ${maxSizeMB}MB.` })
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      setFileName(file.name)

      if (immediateUpload) {
        if (!user) return
        setUploading(true)
        setUploadProgress(10)
        
        if (currentUploadPath.current) {
          await supabase.storage.from(bucket).remove([currentUploadPath.current])
          currentUploadPath.current = null
        }

        setUploadProgress(30)
        const fileExt = file.name.split('.').pop()
        const path = `files/${crypto.randomUUID()}.${fileExt}`
        
        setUploadProgress(60)
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: true })

        if (uploadError) throw uploadError

        setUploadProgress(90)
        currentUploadPath.current = path

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(path)

        setUploadProgress(100)
        await new Promise(r => setTimeout(r, 400))

        setFileUrl(publicUrl)
        onUpload(publicUrl, file)
      } else {
        // Fake loading for local state
        setUploading(true)
        setUploadProgress(20)
        await new Promise(r => setTimeout(r, 200))
        setUploadProgress(60)
        await new Promise(r => setTimeout(r, 200))
        setUploadProgress(100)
        await new Promise(r => setTimeout(r, 200))
        setFileUrl('local-file')
        onUpload('local-file', file)
      }

    } catch (error: any) {
      console.error('Error uploading file:', error.message)
      toast.error('Error uploading file. Please try again.')
      setFileName('')
      setFileUrl('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = async () => {
    if (currentUploadPath.current && immediateUpload) {
      await supabase.storage
        .from(bucket)
        .remove([currentUploadPath.current])
      currentUploadPath.current = null
    }
    
    setFileUrl('')
    setFileName('')
    onUpload('', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
        <FileText className="w-3 h-3" /> {label}
      </label>
      <div 
        className="w-full h-[200px] border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950 flex flex-col items-center justify-center relative hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden group"
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
          ) : fileUrl ? (
            <motion.div 
              key="uploaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center z-20 w-full h-full"
            >
              <FileText className="w-8 h-8 text-realm-green mb-2" />
              <span className="text-sm font-headline text-realm-green font-bold text-center px-4 max-w-full truncate">
                {fileName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="absolute top-2 right-2 z-30 bg-red-500/80 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
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
              className="flex flex-col items-center justify-center z-20"
            >
              <Upload className="w-8 h-8 text-zinc-600 mb-2 group-hover:text-realm-green transition-colors" />
              <span className="text-sm font-headline text-zinc-400 font-bold group-hover:text-zinc-300">
                Upload File
              </span>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">
                Up to {maxSizeMB}MB
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <input 
          type="file" 
          ref={fileInputRef}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  )
}
