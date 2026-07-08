import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Loader2, FileText, Layers, Tags, Type, Link, CheckCircle, Wrench, Package, Database, Sparkles, Puzzle, Hammer, PlusCircle, Paintbrush, Activity, Edit3, Eye } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { CustomSelect } from '../components/CustomSelect'
import { ImageUpload } from '../components/ImageUpload'
import { FileUpload } from '../components/FileUpload'
import { RichText } from '../components/RichText'
import { useProject } from '../hooks/queries'
import { useSubmitProjectMutation, useUploadProjectFileMutation } from '../hooks/mutations'
import { sendProjectReviewNotification } from '../lib/discord'
import type { ProjectType } from '../types'
import { motion } from 'framer-motion'

const CATEGORIES = {
  java: ['Mods', 'Modpacks', 'Datapacks', 'Shaders', 'Plugins', 'Builds'],
  bedrock: ['Add-ons', 'Resource Pack', 'Behavior Pack', 'Builds']
}

const PLATFORMS = ['Fabric', 'NeoForge', 'Forge', 'Quilt', 'Vanilla']
const VERSIONS = [
  '26.3-snapshot-3',
  '26.2',
  '26.1.x',
  '1.21.x',
  '1.20.x',
  '1.19.x',
  '1.18.x',
  '1.17.x',
  '1.16.x',
  '1.15.x',
  '1.14.x'
]
const LICENSES = ['MIT', 'Apache 2.0', 'GPLv3', 'All Rights Reserved', 'Custom']

export function ProjectSubmitPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('id')
  const defaultType = searchParams.get('type') as ProjectType || 'java'

  const { data: existingProject, isLoading: loadingProject } = useProject(projectId || undefined)
  const submitMutation = useSubmitProjectMutation()
  const uploadMutation = useUploadProjectFileMutation()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: defaultType,
    category: CATEGORIES[defaultType][0],
    compatibility: [] as string[],
    platforms: [] as string[],
    license: 'MIT',
    custom_license_url: '',
    icon_url: '',
    gallery_url: '',
    short_description: '',
  })

  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [projectIconBlob, setProjectIconBlob] = useState<Blob | null>(null)
  const [projectGalleryBlob, setProjectGalleryBlob] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (existingProject) {
      setFormData({
        name: existingProject.name,
        description: existingProject.description,
        type: existingProject.type as ProjectType,
        category: existingProject.category,
        compatibility: existingProject.compatibility || [],
        platforms: existingProject.platforms || [],
        license: existingProject.license || 'MIT',
        custom_license_url: existingProject.custom_license_url || '',
        icon_url: existingProject.icon_url || '',
        gallery_url: (existingProject.gallery && existingProject.gallery.length > 0) ? existingProject.gallery[0] : '',
        short_description: existingProject.short_description || '',
      })
    }
  }, [existingProject])

  // Handle category change if type changes
  useEffect(() => {
    if (!existingProject) {
      setFormData(prev => ({ ...prev, category: CATEGORIES[prev.type as ProjectType][0] }))
    }
  }, [formData.type, existingProject])



  const toggleArrayItem = (field: 'compatibility' | 'platforms', value: string) => {
    setFormData(prev => {
      const current = prev[field]
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 10000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to submit a project.')
      return
    }

    if (!projectIconBlob && !formData.icon_url) {
      toast.error('Missing Project Icon', { description: 'Please upload a project icon.' })
      return
    }

    if (!projectFile && !existingProject?.file_url) {
      toast.error('Missing Project File', { description: 'Please upload a project file (.zip, .mcworld, .jar).' })
      return
    }

    if (!formData.name.trim()) {
      toast.error('Missing Name', { description: 'Please enter a project name.' })
      return
    }

    if (!formData.description.trim()) {
      toast.error('Missing Description', { description: 'Please enter a project description.' })
      return
    }

    if (formData.compatibility.length === 0) {
      toast.error('Missing Versions', { description: 'Please select at least one Minecraft version.' })
      return
    }

    if (formData.type === 'java' && formData.platforms.length === 0) {
      toast.error('Missing Platforms', { description: 'Please select at least one platform.' })
      return
    }

    if (formData.license === 'Custom' && !licenseFile && !existingProject?.custom_license_url) {
      toast.error('Missing License', { description: 'Please upload your custom license file.' })
      return
    }

    setIsSubmitting(true)
    try {
      const hasChanges = 
        projectFile !== null || 
        licenseFile !== null || 
        projectIconBlob !== null ||
        projectGalleryBlob !== null ||
        formData.name !== existingProject?.name ||
        formData.description !== existingProject?.description ||
        formData.short_description !== existingProject?.short_description ||
        formData.type !== existingProject?.type ||
        formData.category !== existingProject?.category ||
        formData.license !== existingProject?.license ||
        formData.gallery_url !== ((existingProject?.gallery && existingProject.gallery.length > 0) ? existingProject.gallery[0] : '') ||
        JSON.stringify([...formData.compatibility].sort()) !== JSON.stringify([...(existingProject?.compatibility || [])].sort()) ||
        JSON.stringify([...formData.platforms].sort()) !== JSON.stringify([...(existingProject?.platforms || [])].sort());

      if (existingProject && !hasChanges) {
        toast.info('No changes detected', { description: 'Your project is already up to date.' })
        setIsSubmitting(false)
        return
      }

      let finalFileUrl = existingProject?.file_url || null
      let finalLicenseUrl = existingProject?.custom_license_url || null
      let finalIconUrl = formData.icon_url
      let finalGalleryUrl = formData.gallery_url

      if (projectIconBlob) {
        const filePath = `${user.id}/${Math.random().toString(36).substring(2)}-${Date.now()}.webp`
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, projectIconBlob, {
            contentType: 'image/webp',
            upsert: true,
            cacheControl: 'public, max-age=31536000, immutable'
          })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(filePath)
          
        finalIconUrl = publicUrl
      }

      if (projectGalleryBlob) {
        const filePath = `${user.id}/${Math.random().toString(36).substring(2)}-${Date.now()}-gallery.webp`
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, projectGalleryBlob, {
            contentType: 'image/webp',
            upsert: true,
            cacheControl: 'public, max-age=31536000, immutable'
          })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(filePath)
          
        finalGalleryUrl = publicUrl
      }

      if (projectFile) {
        const fileExt = projectFile.name.split('.').pop()
        const path = `files/${crypto.randomUUID()}.${fileExt}`
        finalFileUrl = await uploadMutation.mutateAsync({ file: projectFile, path })
      }

      if (licenseFile && formData.license === 'Custom') {
        const fileExt = licenseFile.name.split('.').pop()
        const path = `licenses/${crypto.randomUUID()}.${fileExt}`
        finalLicenseUrl = await uploadMutation.mutateAsync({ file: licenseFile, path })
      }

      let notificationStatus = 'pending'
      if (existingProject) {
        const iconChanged = finalIconUrl !== existingProject.icon_url
        const galleryChanged = finalGalleryUrl !== ((existingProject.gallery && existingProject.gallery.length > 0) ? existingProject.gallery[0] : '')
        
        if (iconChanged && galleryChanged) notificationStatus = 'Review Icon & Gallery'
        else if (iconChanged) notificationStatus = 'Review Icon'
        else if (galleryChanged) notificationStatus = 'Review Gallery'
        else notificationStatus = 'Review Text'
      }

      const projectData = {
        id: projectId || undefined,
        owner_id: user.id,
        name: formData.name,
        slug: existingProject?.slug || generateSlug(formData.name),
        description: formData.description,
        type: formData.type,
        category: formData.category,
        compatibility: formData.compatibility,
        platforms: formData.platforms,
        license: formData.license,
        custom_license_url: finalLicenseUrl,
        icon_url: finalIconUrl || null,
        gallery: finalGalleryUrl ? [finalGalleryUrl] : [],
        short_description: formData.short_description,
        file_url: finalFileUrl,
        status: (e.nativeEvent as SubmitEvent).submitter?.getAttribute('name') === 'submit_review' ? 'pending' : (existingProject?.status || 'draft')
      } as any

      await submitMutation.mutateAsync(projectData)
      
      if (projectData.status === 'pending' && existingProject?.status !== 'pending') {
        await sendProjectReviewNotification({
          projectName: projectData.name,
          iconUrl: projectData.icon_url,
          status: notificationStatus
        })
      }

      toast.success(projectId ? 'Project updated successfully' : 'Project submitted successfully')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error('Submission Failed', { description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingProject) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
  }

  return (
    <AnimatedPage className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="font-pixel text-2xl md:text-3xl text-white uppercase mb-2">
            {projectId ? 'Edit Listing' : `Listing for ${formData.type === 'java' ? 'Java' : 'Bedrock'}`}
          </h1>
          <p className="text-zinc-400 font-headline">Fill in the details for your project.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-800">
            <ImageUpload
              label="Project Icon"
              immediateUpload={false}
              onUpload={(url, file) => {
                setFormData({ ...formData, icon_url: url })
                if (file) setProjectIconBlob(file)
                else setProjectIconBlob(null)
              }}
              value={formData.icon_url}
              aspectRatio="square"
              bucket="project-files"
            />
            
            <FileUpload
              label="Project File (.zip, .mcworld, .jar)"
              accept=".zip,.mcworld,.jar"
              maxSizeMB={30}
              immediateUpload={false}
              value={existingProject?.file_url || projectFile ? 'local-file' : ''}
              initialFilename={projectFile ? projectFile.name : (existingProject?.file_url ? 'File uploaded' : '')}
              onUpload={(_url, file) => setProjectFile(file)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                <Type className="w-3 h-3" /> Name
              </label>
              <input
                required
                type="text"
                maxLength={100}
                placeholder="e.g. Farmer's Delight"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                <Tags className="w-3 h-3" /> Category
              </label>
              <CustomSelect
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={CATEGORIES[formData.type as ProjectType].map(c => {
                  const Icon = c === 'Mods' ? Wrench :
                               c === 'Modpacks' ? Package :
                               c === 'Datapacks' ? Database :
                               c === 'Shaders' ? Sparkles :
                               c === 'Plugins' ? Puzzle :
                               c === 'Builds' ? Hammer :
                               c === 'Add-ons' ? PlusCircle :
                               c === 'Resource Pack' ? Paintbrush :
                               c === 'Behavior Pack' ? Activity :
                               Layers;
                  
                  return { 
                    key: c, 
                    label: c, 
                    icon: <Icon className="w-4 h-4 text-zinc-400" /> 
                  }
                })}
                placeholder="Select Category"
              />
            </div>

            <div className={`space-y-2 col-span-2 md:col-span-1 ${formData.license === 'Custom' ? 'row-span-2' : ''}`}>
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                <Link className="w-3 h-3" /> License
              </label>
              <CustomSelect
                value={formData.license}
                onChange={(val) => setFormData({ ...formData, license: val })}
                options={LICENSES.map(c => ({ 
                  key: c, 
                  label: c, 
                  icon: <FileText className="w-4 h-4 text-zinc-400" /> 
                }))}
                placeholder="Select License"
              />
              
              {formData.license === 'Custom' && (
                <div className="mt-4">
                  <FileUpload
                    label="Custom License (.md, .txt)"
                    accept=".md,.txt"
                    maxSizeMB={5}
                    immediateUpload={false}
                    value={existingProject?.custom_license_url || licenseFile ? 'local-file' : ''}
                    initialFilename={licenseFile ? licenseFile.name : (existingProject?.custom_license_url ? 'License uploaded' : '')}
                    onUpload={(_url, file) => setLicenseFile(file)}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                <FileText className="w-3 h-3" /> Short Description
              </label>
              <input
                required
                type="text"
                maxLength={120}
                placeholder="A brief catchy tagline for your project..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Description
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[10px] font-bold font-headline text-realm-green hover:text-[#85fc7e] transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    {showPreview ? (
                      <>
                        <Edit3 className="w-3 h-3" /> Edit
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Preview
                      </>
                    )}
                  </button>
                  <span
                    className={`text-[10px] font-bold font-headline transition-colors ${formData.description.length >= 5000 ? "text-red-400" : "text-zinc-500"}`}
                  >
                    {formData.description.length}/5000
                  </span>
                </div>
              </div>
              {showPreview ? (
                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-[13px] md:text-sm min-h-[200px] overflow-y-auto">
                  <RichText content={formData.description || "Nothing to preview."} />
                </div>
              ) : (
                <textarea
                  required
                  maxLength={5000}
                  placeholder="Describe your project, features, installation instructions, etc..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-[13px] md:text-sm outline-none focus:border-realm-green transition-all font-headline resize-y focus:ring-1 focus:ring-realm-green/30 min-h-[200px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                <FileText className="w-3 h-3" /> Gallery
              </label>
              <div className="max-w-xs">
                <ImageUpload
                  label=""
                  immediateUpload={false}
                  onUpload={(url, file) => {
                    setFormData({ ...formData, gallery_url: url })
                    if (file) setProjectGalleryBlob(file)
                    else setProjectGalleryBlob(null)
                  }}
                  value={formData.gallery_url}
                  aspectRatio="video"
                  bucket="project-files"
                />
              </div>
              <p className="text-zinc-500 text-[10px] font-headline">Max 1 picture, PNG/JPG up to 5MB.</p>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2 mb-3">
                <CheckCircle className="w-3 h-3" /> Minecraft Versions
              </label>
              <div className="flex flex-wrap gap-2">
                {VERSIONS.map(version => (
                  <button
                    key={version}
                    type="button"
                    onClick={() => toggleArrayItem('compatibility', version)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all active:scale-95 border ${
                      formData.compatibility.includes(version) 
                        ? 'bg-realm-green/10 text-realm-green border-realm-green' 
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {version}
                  </button>
                ))}
              </div>
            </div>

            {formData.type === 'java' && (
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2 mb-3">
                  <Layers className="w-3 h-3" /> Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => toggleArrayItem('platforms', platform)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all active:scale-95 border ${
                        formData.platforms.includes(platform) 
                          ? 'bg-realm-green/10 text-realm-green border-realm-green' 
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-8 border-t border-zinc-800 flex justify-end gap-3 flex-wrap md:flex-nowrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-lg font-headline font-bold text-zinc-500 hover:text-white transition-colors whitespace-nowrap"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              name="submit_review"
              disabled={submitMutation.isPending || isSubmitting}
              className={`bg-[#4EC44E] text-[#002202] px-8 py-3 rounded-lg font-headline font-bold transition-all shadow-lg whitespace-nowrap ${submitMutation.isPending || isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-[#85fc7e] hover:shadow-green-500/20"}`}
            >
              {isSubmitting || submitMutation.isPending
                ? "Saving..."
                : projectId
                  ? "Save Changes"
                  : "Submit for Review"}
            </motion.button>
          </div>
        </form>
      </div>
    </AnimatedPage>
  )
}
