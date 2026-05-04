import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Image as ImageIcon, Loader2, Save, Trash2, Crop } from 'lucide-react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { convertToWebP } from '../lib/imageUtils'
import { useUpdateProfileMutation } from '../hooks/mutations'
import { toast } from 'sonner'
import type { Profile } from '../types'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../lib/cropUtils'

interface EditBannerModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile
}

export function EditBannerModal({ isOpen, onClose, profile }: EditBannerModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(profile.discord_banner)
  const [isUploading, setIsUploading] = useState(false)
  
  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropping, setIsCropping] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateMutation = useUpdateProfileMutation()

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File too large', { description: 'Please select an image under 5MB.' })
        return
      }
      if (!selected.type.startsWith('image/')) {
        toast.error('Invalid file type', { description: 'Please select a PNG or JPG image.' })
        return
      }
      
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string)
        setIsCropping(true)
      })
      reader.readAsDataURL(selected)
    }
  }

  const handleCropCancel = () => {
    setIsCropping(false)
    setImageSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropConfirm = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return
      
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedImage) {
        const croppedUrl = URL.createObjectURL(croppedImage)
        setPreview(croppedUrl)
        setFile(new File([croppedImage], 'banner.webp', { type: 'image/webp' }))
        setIsCropping(false)
      }
    } catch (e) {
      console.error(e)
      toast.error('Crop Failed')
    }
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    setImageSrc(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    // If no changes, just close
    if (!file && preview === profile.discord_banner) {
      onClose()
      return
    }

    setIsUploading(true)
    try {
      let finalUrl = preview

      if (file) {
        // 1. Optimize image (already cropped and converted to webp by getCroppedImg, but we can double check)
        const webpBlob = await convertToWebP(file, 0.7, 1280, 720)
        
        // 2. Upload to storage
        const fileName = `banner-${Date.now()}.webp`
        const filePath = `${profile.id}/banners/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('server-assets')
          .upload(filePath, webpBlob, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('server-assets')
          .getPublicUrl(filePath)
        
        finalUrl = publicUrl

        // 3. Delete old custom banner from storage if it exists
        if (profile.discord_banner && profile.discord_banner.includes('server-assets/')) {
          const oldPath = profile.discord_banner.split('server-assets/').pop()
          if (oldPath) {
            await supabase.storage.from('server-assets').remove([oldPath])
          }
        }
      } else if (!preview && profile.discord_banner) {
        // Removing banner case
        if (profile.discord_banner.includes('server-assets/')) {
          const oldPath = profile.discord_banner.split('server-assets/').pop()
          if (oldPath) {
            await supabase.storage.from('server-assets').remove([oldPath])
          }
        }
      }

      // 4. Update profile record
      await updateMutation.mutateAsync({
        id: profile.id,
        discord_banner: finalUrl
      })

      toast.success('Banner Updated', {
        description: 'Your profile banner has been saved successfully.'
      })
      onClose()
    } catch (err: any) {
      console.error('Banner update failed:', err)
      toast.error('Update Failed', {
        description: err.message || 'Failed to upload banner. Please try again.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
          >
            {isCropping ? (
              <div className="flex flex-col h-[500px]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <h3 className="font-pixel text-sm text-white uppercase">Adjust Banner</h3>
                  <button onClick={handleCropCancel} className="text-zinc-500 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="relative flex-grow bg-black">
                  <Cropper
                    image={imageSrc!}
                    crop={crop}
                    zoom={zoom}
                    aspect={21 / 9}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    classes={{
                      containerClassName: "rounded-none",
                      cropAreaClassName: "border-2 border-realm-green shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                    }}
                  />
                </div>

                <div className="p-6 bg-zinc-900 flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase font-headline">Zoom</span>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 accent-realm-green"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCropCancel}
                      className="flex-1 py-3 px-4 rounded-lg font-headline font-bold text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCropConfirm}
                      className="flex-[2] bg-realm-green text-realm-green-dark py-3 px-4 rounded-lg font-headline font-bold text-xs hover:bg-[#85fc7e] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Crop className="w-4 h-4" />
                      Apply Crop
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-pixel text-lg text-white uppercase tracking-wider">Update Banner</h3>
                    <p className="text-[10px] text-zinc-500 font-headline uppercase tracking-widest font-bold">Customize your profile appearance</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div 
                  className={`relative group rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950/50 hover:border-realm-green transition-all overflow-hidden aspect-video flex flex-col items-center justify-center cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <div className="w-full h-full relative">
                      <img 
                        src={preview} 
                        alt="Banner Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <Upload className="w-6 h-6 text-realm-green" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest font-headline">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <ImageIcon className="w-10 h-10 text-zinc-700 mb-3 group-hover:text-realm-green transition-colors" />
                      <p className="text-xs font-bold text-zinc-400 font-headline uppercase tracking-wider group-hover:text-zinc-200 transition-colors">Click to upload image</p>
                      <p className="text-[10px] text-zinc-600 mt-2 font-headline uppercase">PNG, JPG up to 5MB</p>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-30">
                      <Loader2 className="w-8 h-8 text-realm-green animate-spin" />
                      <p className="text-[10px] font-pixel text-realm-green uppercase animate-pulse">Uploading...</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  {preview && (
                    <button
                      onClick={handleRemove}
                      disabled={isUploading}
                      className="p-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Remove Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    disabled={isUploading}
                    className="flex-1 py-3 px-4 rounded-lg font-headline font-bold text-xs text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUploading || (!file && preview === profile.discord_banner)}
                    className="flex-[2] bg-realm-green text-realm-green-dark py-3 px-4 rounded-lg font-headline font-bold text-xs hover:bg-[#85fc7e] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isUploading ? 'Saving...' : 'Save Banner'}
                  </button>
                </div>
              </div>
            )}

            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
