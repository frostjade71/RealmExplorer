import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Loader2, FileText, Layers, Tags, Type, Link, CheckCircle, Package, PackageOpen, Braces, Glasses, Hammer, PlusCircle, Paintbrush, Activity, Edit3, Eye, Trash2, GripVertical, Globe, Plus, Plug, Mail } from 'lucide-react'
import { SiDiscord, SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiTwitch, SiGithub, SiX, SiPatreon, SiKofi } from 'react-icons/si'
import { AnimatedPage } from '../components/AnimatedPage'
import { CustomSelect } from '../components/CustomSelect'
import { ImageUpload } from '../components/ImageUpload'
import { FileUpload } from '../components/FileUpload'
import { RichText } from '../components/RichText'
import { FabricIcon, ForgeIcon, QuiltIcon, NeoForgeIcon, VanillaIcon, PaperIcon, SpigotIcon, PurpurIcon, BukkitIcon } from '../components/icons/PlatformIcons'
import { useProject, useUserProjects } from '../hooks/queries'
import { useSubmitProjectMutation, useUploadProjectFileMutation } from '../hooks/mutations'
import { sendProjectReviewNotification } from '../lib/discord'
import type { ProjectType, SocialLink } from '../types'
import { motion, Reorder } from 'framer-motion'
import { slugify } from '../lib/urlUtils'

interface ReorderableSocialLink extends SocialLink {
  localId: string;
}

const CATEGORIES = {
  java: ['Mods', 'Modpacks', 'Datapacks', 'Shaders', 'Plugins', 'Builds'],
  bedrock: ['Add-ons', 'Resource Pack', 'Behavior Pack', 'Builds']
}

const PLATFORMS = ['Vanilla', 'Fabric', 'Forge', 'NeoForge', 'Paper', 'Quilt', 'Spigot', 'Purpur', 'Bucket']
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
const LICENSES = ['MIT', 'Apache 2.0', 'GPLv3', 'Custom']

export function ProjectSubmitPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('id')
  const defaultType = searchParams.get('type') as ProjectType || 'java'

  const { data: existingProject, isLoading: loadingProject } = useProject(projectId || undefined)
  const submitMutation = useSubmitProjectMutation()
  const uploadMutation = useUploadProjectFileMutation()

  const isEditing = !!projectId;
  const { data: userProjects = [] } = useUserProjects(user?.id);

  const limits = {
    socialLinks: 4,
    listings: isAdmin ? 5 : 1
  };

  useEffect(() => {
    if (!isEditing && userProjects.length >= limits.listings) {
      toast.error("Project Limit Reached", {
        description: `Your current tier allows up to ${limits.listings} project${limits.listings > 1 ? 's' : ''}.`
      });
      navigate("/dashboard?tab=projects");
    }
  }, [isEditing, userProjects, limits.listings, navigate]);

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
    social_links: [] as ReorderableSocialLink[],
    changelogs: [] as any[],
  })

  const [projectFile, setProjectFile] = useState<File | null>(null)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [projectIconBlob, setProjectIconBlob] = useState<Blob | null>(null)
  const [projectGalleryBlob, setProjectGalleryBlob] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [changelogTitle, setChangelogTitle] = useState('')
  const [changelogDescription, setChangelogDescription] = useState('')
  const changelogFileInputRef = React.useRef<HTMLInputElement>(null)

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
        social_links: (existingProject.social_links || []).map((l: any) => ({ ...l, localId: crypto.randomUUID() })),
        changelogs: existingProject.changelogs || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('You must be logged in to submit a project.')
      return
    }

    const slug = slugify(formData.name);

    if (!existingProject) {
      const { data: existingProjects } = await supabase.from('projects').select('id').eq('slug', slug);
      if (existingProjects && existingProjects.length > 0) {
        toast.error('A project with this name already exists. Please choose a different name.')
        return
      }
    }

    if (!projectIconBlob && !formData.icon_url) {
      toast.error('Missing Project Icon', { description: 'Please upload a project icon.' })
      return
    }

    if (!projectFile && !existingProject?.file_url) {
      const allowedExts = formData.type === 'java' ? '.zip, .jar, .schem, .litematic' : '.zip, .mcaddon, .mcpack, .mcworld';
      toast.error('Missing Project File', { description: `Please upload a project file (${allowedExts}).` })
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
        JSON.stringify([...formData.platforms].sort()) !== JSON.stringify([...(existingProject?.platforms || [])].sort()) ||
        JSON.stringify(formData.social_links.map(l => ({ platform: l.platform, url: l.url }))) !== JSON.stringify(existingProject?.social_links || []) ||
        JSON.stringify(formData.changelogs) !== JSON.stringify(existingProject?.changelogs || []);

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
        
        if (existingProject?.icon_url) {
          try {
            const oldUrl = new URL(existingProject.icon_url)
            const pathParts = oldUrl.pathname.split('/project-files/')
            if (pathParts.length > 1) {
              const oldPath = decodeURIComponent(pathParts[1])
              await supabase.storage.from('project-files').remove([oldPath])
            }
          } catch (e) {
            console.error('Failed to delete old icon:', e)
          }
        }
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
        
        const oldGalleryUrl = existingProject?.gallery && existingProject.gallery.length > 0 ? existingProject.gallery[0] : null;
        if (oldGalleryUrl) {
          try {
            const oldUrl = new URL(oldGalleryUrl)
            const pathParts = oldUrl.pathname.split('/project-files/')
            if (pathParts.length > 1) {
              const oldPath = decodeURIComponent(pathParts[1])
              await supabase.storage.from('project-files').remove([oldPath])
            }
          } catch (e) {
            console.error('Failed to delete old gallery image:', e)
          }
        }
      }

      if (projectFile) {
        let folderId: string = crypto.randomUUID();
        let oldPath: string | null = null;
        
        if (existingProject?.file_url) {
          try {
            const oldUrl = new URL(existingProject.file_url)
            const pathParts = oldUrl.pathname.split('/project-files/')
            if (pathParts.length > 1) {
              oldPath = decodeURIComponent(pathParts[1])
              const folderMatch = oldPath.match(/^files\/([^\/]+)\//)
              if (folderMatch) {
                folderId = folderMatch[1]
              }
            }
          } catch (e) {
            console.error('Failed to parse old project file URL:', e)
          }
        }

        const path = `files/${folderId}/${projectFile.name}`
        finalFileUrl = await uploadMutation.mutateAsync({ file: projectFile, path })
        
        if (oldPath && oldPath !== path) {
          try {
            await supabase.storage.from('project-files').remove([oldPath])
          } catch (e) {
            console.error('Failed to delete old project file:', e)
          }
        }
      }

      if (licenseFile && formData.license === 'Custom') {
        const fileExt = licenseFile.name.split('.').pop()
        const path = `licenses/${crypto.randomUUID()}.${fileExt}`
        finalLicenseUrl = await uploadMutation.mutateAsync({ file: licenseFile, path })
        
        if (existingProject?.custom_license_url) {
          try {
            const oldUrl = new URL(existingProject.custom_license_url)
            const pathParts = oldUrl.pathname.split('/project-files/')
            if (pathParts.length > 1) {
              const oldPath = decodeURIComponent(pathParts[1])
              await supabase.storage.from('project-files').remove([oldPath])
            }
          } catch (e) {
            console.error('Failed to delete old license file:', e)
          }
        }
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
        slug: existingProject?.slug || slug,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        compatibility: formData.compatibility,
        platforms: formData.platforms,
        license: formData.license,
        custom_license_url: finalLicenseUrl,
        icon_url: finalIconUrl || null,
        gallery: finalGalleryUrl ? [finalGalleryUrl] : [],
        social_links: formData.social_links.map(l => ({ platform: l.platform, url: l.url })),
        changelogs: formData.changelogs,
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
      navigate('/dashboard?tab=projects')
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
          onClick={() => navigate('/dashboard?tab=projects')}
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
              label={`Project File (${formData.type === 'java' ? '.zip, .jar, .schem' : '.zip, .mcaddon, .mcpack, .mcworld'})`}
              accept={formData.type === 'java' ? '.zip,.jar,.schem,.litematic,application/java-archive,application/zip' : '.zip,.mcaddon,.mcpack,.mcworld,application/octet-stream,application/zip'}
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
                  const lower = c.toLowerCase();
                  const Icon = lower.includes('modpacks') ? PackageOpen :
                               lower.includes('mods') ? Package :
                               lower.includes('datapacks') ? Braces :
                               lower.includes('shaders') ? Glasses :
                               lower.includes('plugins') ? Plug :
                               lower.includes('resource') ? Paintbrush :
                               lower.includes('builds') ? Hammer :
                               lower.includes('behavior') ? Activity :
                               lower.includes('add-ons') ? PlusCircle :
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

            <div className="space-y-4 col-span-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                  <Link className="w-3 h-3" /> Social Links
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.social_links.length >= limits.socialLinks) {
                      toast.warning('Limit Reached', {
                        description: `You can only add up to ${limits.socialLinks} social links.`
                      })
                      return
                    }
                    setFormData(prev => ({
                      ...prev,
                      social_links: [...prev.social_links, { platform: 'discord', url: '', localId: crypto.randomUUID() }]
                    }))
                  }}
                  disabled={formData.social_links.length >= limits.socialLinks}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              {formData.social_links.length === 0 ? (
                <div className="text-center py-6 bg-zinc-950/50 border border-dashed border-zinc-800 rounded-lg">
                  <Globe className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 font-headline text-xs">No social links added yet.</p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={formData.social_links}
                  onReorder={(newOrder) => setFormData(prev => ({ ...prev, social_links: newOrder }))}
                  className="space-y-2"
                >
                  {formData.social_links.map((link, index) => (
                    <Reorder.Item
                      key={link.localId}
                      value={link}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-zinc-950 border border-zinc-800 p-2 sm:p-3 rounded-lg group relative"
                    >
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-600 hover:text-zinc-400 transition-colors hidden sm:block touch-none">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 sm:w-auto sm:flex-none">
                          <CustomSelect
                            value={link.platform}
                            onChange={(val) => {
                              const newLinks = [...formData.social_links]
                              newLinks[index].platform = val as any
                              setFormData(prev => ({ ...prev, social_links: newLinks }))
                            }}
                            options={[
                              { key: 'discord', label: 'Discord', icon: <SiDiscord className="w-4 h-4 text-zinc-400" /> },
                              { key: 'github', label: 'GitHub', icon: <SiGithub className="w-4 h-4 text-zinc-400" /> },
                              { key: 'x', label: 'X (Twitter)', icon: <SiX className="w-4 h-4 text-zinc-400" /> },
                              { key: 'youtube', label: 'YouTube', icon: <SiYoutube className="w-4 h-4 text-zinc-400" /> },
                              { key: 'instagram', label: 'Instagram', icon: <SiInstagram className="w-4 h-4 text-zinc-400" /> },
                              { key: 'tiktok', label: 'TikTok', icon: <SiTiktok className="w-4 h-4 text-zinc-400" /> },
                              { key: 'twitch', label: 'Twitch', icon: <SiTwitch className="w-4 h-4 text-zinc-400" /> },
                              { key: 'facebook', label: 'Facebook', icon: <SiFacebook className="w-4 h-4 text-zinc-400" /> },
                              { key: 'patreon', label: 'Patreon', icon: <SiPatreon className="w-4 h-4 text-zinc-400" /> },
                              { key: 'kofi', label: 'Ko-fi', icon: <SiKofi className="w-4 h-4 text-zinc-400" /> },
                              { key: 'website', label: 'Website', icon: <Globe className="w-4 h-4 text-zinc-400" /> },
                              { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-zinc-400" /> },
                            ]}
                            className="w-auto flex-shrink-0"
                            hideLabel={true}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:flex-1">
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-realm-green transition-all font-headline text-xs"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...formData.social_links]
                            newLinks[index].url = e.target.value
                            setFormData(prev => ({ ...prev, social_links: newLinks }))
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newLinks = formData.social_links.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, social_links: newLinks }))
                          }}
                          className="p-2.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                          title="Remove Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
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

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest font-headline flex items-center gap-2">
                <FileText className="w-3 h-3" /> Changelog
              </label>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 md:p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 font-headline uppercase tracking-widest">
                    Changelog Title
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Your Project 1.2"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline text-sm"
                    value={changelogTitle}
                    onChange={(e) => setChangelogTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 font-headline uppercase tracking-widest">
                    Description
                  </label>
                  <textarea
                    maxLength={2000}
                    placeholder="What's new in this update?"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline resize-y min-h-[120px] text-sm"
                    value={changelogDescription}
                    onChange={(e) => setChangelogDescription(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!changelogTitle.trim() || !changelogDescription.trim()) {
                        toast.error('Missing Changelog Info', { description: 'Please fill in both title and description.' })
                        return
                      }
                      
                      changelogFileInputRef.current?.click()
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-headline font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add & Update File
                  </button>
                  <input
                    type="file"
                    ref={changelogFileInputRef}
                    accept={formData.type === 'java' ? '.zip,.jar,.schem,.litematic,application/java-archive,application/zip' : '.zip,.mcaddon,.mcpack,.mcworld,application/octet-stream,application/zip'}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      if (file.size > 30 * 1024 * 1024) {
                        toast.error('File too large', { description: 'Project file must be under 30MB.' })
                        if (changelogFileInputRef.current) changelogFileInputRef.current.value = ''
                        return
                      }

                      const newChangelog = {
                        title: changelogTitle.trim(),
                        description: changelogDescription.trim(),
                        created_at: new Date().toISOString()
                      }
                      
                      setFormData(prev => ({
                        ...prev,
                        changelogs: [newChangelog, ...prev.changelogs]
                      }))
                      
                      setChangelogTitle('')
                      setChangelogDescription('')
                      setProjectFile(file)
                      
                      if (changelogFileInputRef.current) changelogFileInputRef.current.value = ''
                      
                      toast.success('Changelog Added', { description: 'Project File updated with the new upload.' })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </div>
                
                {formData.changelogs.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-800 space-y-4">
                    <h4 className="text-sm font-bold text-white font-headline">Recent Changelogs</h4>
                    <div className="space-y-3">
                      {formData.changelogs.map((log: any, idx: number) => (
                        <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg relative group">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                changelogs: prev.changelogs.filter((_, i) => i !== idx)
                              }))
                            }}
                            className="absolute top-3 right-3 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <h5 className="text-white font-bold text-sm mb-1">{log.title}</h5>
                          <p className="text-zinc-400 text-xs font-body whitespace-pre-wrap">{log.description}</p>
                          <div className="text-zinc-600 text-[10px] uppercase font-headline tracking-widest mt-2">
                            {new Date(log.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                  {PLATFORMS.map(platform => {
                    const lower = platform.toLowerCase();
                    let Icon = VanillaIcon;
                    if (lower === 'fabric') Icon = FabricIcon;
                    else if (lower === 'neoforge') Icon = NeoForgeIcon;
                    else if (lower.includes('forge')) Icon = ForgeIcon;
                    else if (lower === 'quilt') Icon = QuiltIcon;
                    else if (lower === 'vanilla') Icon = VanillaIcon;
                    else if (lower === 'paper') Icon = PaperIcon;
                    else if (lower === 'spigot') Icon = SpigotIcon;
                    else if (lower === 'purpur') Icon = PurpurIcon;
                    else if (lower === 'bucket' || lower === 'bukkit') Icon = BukkitIcon;
                    
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => toggleArrayItem('platforms', platform)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all active:scale-95 border ${
                          formData.platforms.includes(platform) 
                            ? 'bg-realm-green/10 text-realm-green border-realm-green' 
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${formData.platforms.includes(platform) ? 'text-realm-green' : 'text-zinc-400'}`} />
                        {platform}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 mt-8 border-t border-zinc-800 flex justify-end gap-3 flex-wrap md:flex-nowrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/dashboard?tab=projects")}
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
