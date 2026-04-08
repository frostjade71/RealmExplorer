import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubmitServerMutation, useUpdateServerMutation } from '../hooks/mutations'
import { useServer } from '../hooks/queries'
import { supabase } from '../lib/supabase'
import type { ServerCategory } from '../types'
import { Server, Globe } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { ImageUpload } from '../components/ImageUpload'

export function SubmitPage() {
  const { id } = useParams()
  const isEditing = !!id
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [originalImageUrls, setOriginalImageUrls] = useState({ icon: '', banner: '' })
  const { data: serverData } = useServer(id)

  const [formData, setFormData] = useState({
    type: 'server' as 'server' | 'realm',
    name: '',
    description: '',
    category: 'smp' as ServerCategory,
    ip_or_code: '',
    website_url: '',
    icon_url: '',
    banner_url: ''
  })

  useEffect(() => {
    if (serverData?.server) {
      const { server } = serverData
      const initialData = {
        type: server.type as 'server' | 'realm',
        name: server.name,
        description: server.description || '',
        category: server.category as ServerCategory,
        ip_or_code: server.ip_or_code || '',
        website_url: server.website_url || '',
        icon_url: server.icon_url || '',
        banner_url: server.banner_url || ''
      }
      setFormData(initialData)
      setOriginalImageUrls({
        icon: server.icon_url || '',
        banner: server.banner_url || ''
      })
    }
  }, [serverData])

  const submitMutation = useSubmitServerMutation()
  const updateMutation = useUpdateServerMutation()

  const cleanupOldImages = async (newIcon: string, newBanner: string) => {
    const filesToDelete: string[] = []
    
    // Extract path from Supabase URL: .../public/server-assets/[path]
    const getPath = (url: string) => {
      if (!url || !url.includes('server-assets/')) return null
      return url.split('server-assets/').pop()
    }

    if (originalImageUrls.icon && originalImageUrls.icon !== newIcon) {
      const path = getPath(originalImageUrls.icon)
      if (path) filesToDelete.push(path)
    }

    if (originalImageUrls.banner && originalImageUrls.banner !== newBanner) {
      const path = getPath(originalImageUrls.banner)
      if (path) filesToDelete.push(path)
    }

    if (filesToDelete.length > 0) {
      try {
        await supabase.storage.from('server-assets').remove(filesToDelete)
        console.log('Cleaned up old images:', filesToDelete)
      } catch (err) {
        console.error('Failed to cleanup old images:', err)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')

    if (!formData.icon_url) {
      setError('Please upload a server icon.')
      return
    }

    if (isEditing) {
      const currentStatus = serverData?.server?.status || 'approved'
      const iconChanged = formData.icon_url !== originalImageUrls.icon
      const bannerChanged = formData.banner_url !== originalImageUrls.banner
      
      let newStatus: import('../types').ServerStatus = currentStatus
      if (iconChanged && bannerChanged) newStatus = 'Review Icon & Cover'
      else if (iconChanged) newStatus = 'Review Icon'
      else if (bannerChanged) newStatus = 'Review Cover'
      else if (currentStatus === 'rejected' || currentStatus === 'emailed') newStatus = 'pending'

      updateMutation.mutate(
        {
          id,
          ...formData,
          status: newStatus
        },
        {
          onSuccess: () => {
            cleanupOldImages(formData.icon_url, formData.banner_url)
            navigate('/dashboard')
          },
          onError: (err: any) => setError(err.message)
        }
      )
    } else {
      submitMutation.mutate(
        {
          owner_id: user.id,
          ...formData,
          status: 'pending'
        },
        {
          onSuccess: () => navigate('/dashboard'),
          onError: (err: any) => setError(err.message)
        }
      )
    }
  }

  const categories: ServerCategory[] = ['factions', 'kitpvp', 'skyblock', 'smp', 'modded', 'other']

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10 text-center">
        <FramerIn>
          <h1 className="text-3xl font-pixel text-white mb-4">
            {isEditing ? 'Edit Listing' : 'Submit Directory'}
          </h1>
          <p className="text-zinc-400 font-headline">
            {isEditing ? 'Modify your server or realm details below.' : 'Register your Server or Realm to our global index.'}
          </p>
        </FramerIn>
      </div>

      <FramerIn delay={0.2}>
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6 shadow-2xl">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl font-headline text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-800">
            <ImageUpload 
              label="Server Icon"
              onUpload={(url) => setFormData({ ...formData, icon_url: url })}
              value={formData.icon_url}
              aspectRatio="square"
            />
            <ImageUpload 
              label="Cover Banner"
              onUpload={(url) => setFormData({ ...formData, banner_url: url })}
              value={formData.banner_url}
              aspectRatio="video"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Entity Type</label>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'server' })}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-headline font-bold transition-all whitespace-nowrap ${formData.type === 'server' ? 'bg-realm-green/10 border-realm-green text-realm-green' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Server className="w-4 h-4" /> Server (Java)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'realm' })}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-headline font-bold transition-all whitespace-nowrap ${formData.type === 'realm' ? 'bg-realm-green/10 border-realm-green text-realm-green' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Globe className="w-4 h-4" /> Realm (Bedrock)
                </motion.button>
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Category</label>
              <select
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline cursor-pointer appearance-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ServerCategory })}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Name</label>
              <input
                required
                type="text"
                maxLength={100}
                placeholder="e.g. Hypixel Network"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">IP Address / Code</label>
              <input
                required
                type="text"
                placeholder={formData.type === 'server' ? 'play.example.com' : 'AbCdEf123GhIj456'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                value={formData.ip_or_code}
                onChange={e => setFormData({ ...formData, ip_or_code: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Website URL (Do Discord Invite Link this time)</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                value={formData.website_url}
                onChange={e => setFormData({ ...formData, website_url: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Description</label>
              <textarea
                required
                rows={5}
                placeholder="Tell players about your server..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline resize-y focus:ring-1 focus:ring-realm-green/30"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitMutation.isPending}
              className={`bg-[#4EC44E] text-[#002202] px-8 py-3 rounded-xl font-headline font-bold transition-all shadow-lg ${(submitMutation.isPending || updateMutation.isPending) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#85fc7e] hover:shadow-green-500/20'}`}
            >
              {(submitMutation.isPending || updateMutation.isPending) ? 'Saving...' : (isEditing ? 'Save Changes' : 'Submit for Review')}
            </motion.button>
          </div>
        </form>
      </FramerIn>
    </AnimatedPage>
  )
}
