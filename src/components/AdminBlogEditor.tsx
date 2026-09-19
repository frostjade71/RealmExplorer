import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { type BlogPost } from '../types'
import { useAuth } from '../contexts/AuthContext'
import { useCreateBlogPostMutation, useUpdateBlogPostMutation } from '../hooks/mutations'
import { BlogImageUpload } from './BlogImageUpload'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'

interface AdminBlogEditorProps {
  isOpen: boolean
  onClose: () => void
  post?: BlogPost | null
}

export function AdminBlogEditor({ isOpen, onClose, post }: AdminBlogEditorProps) {
  const { profile } = useAuth()
  const createMutation = useCreateBlogPostMutation()
  const updateMutation = useUpdateBlogPostMutation()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState<BlogPost['category']>('Event/News')
  const [isFeatured, setIsFeatured] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setContent(post.content || '')
      setImageUrl(post.image_url || '')
      setCategory(post.category || 'Event/News')
      setIsFeatured(post.is_featured || false)
    } else {
      setTitle('')
      setSlug('')
      setContent('')
      setImageUrl('')
      setCategory('Event/News')
      setIsFeatured(false)
    }
    setPreviewMode(false)
  }, [post, isOpen])

  // Auto-generate slug from title
  useEffect(() => {
    if (!post && title) {
      setSlug(title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''))
    }
  }, [title, post])

  const handleClose = async () => {
    if (imageUrl && imageUrl !== post?.image_url && imageUrl.includes('blog-images/entries/')) {
      try {
        const path = imageUrl.split('blog-images/')[1];
        if (path) {
          await supabase.storage.from('blog-images').remove([path]);
        }
      } catch (err) {
        console.error('Failed to cleanup orphaned image:', err);
      }
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    const data = {
      authorId: profile.id,
      title,
      slug,
      content,
      image_url: imageUrl,
      category,
      is_featured: isFeatured,
      adminId: profile.id,
      adminName: profile.discord_username
    }

    try {
      if (post) {
        await updateMutation.mutateAsync({ 
          ...data, 
          id: post.id, 
          old_image_url: post.image_url 
        })
        toast.success('Post Updated', { description: 'The changes have been saved.' })
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Post Published', { description: 'Your new post is live!' })
      }
      onClose()
    } catch (error: any) {
      toast.error('Operation Failed', { description: error.message })
    }
  }

  if (!isOpen) return null

  const editorContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-pixel text-white uppercase tracking-tighter">
                  {post ? 'Edit Blog Post' : 'New Blog Entry'}
                </h2>
                <p className="text-[10px] font-headline text-white/40 uppercase tracking-[0.2em]">
                  {post ? 'Updating Official News' : 'Drafting Community Update'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-headline font-bold uppercase tracking-widest transition-all ${
                  previewMode 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{previewMode ? 'edit' : 'visibility'}</span>
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
            {!previewMode ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Post Title</label>
                      <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a catchy title..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">URL Slug</label>
                      <input
                        required
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="post-url-slug"
                        className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/60 font-mono outline-none focus:border-realm-green/30"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {(['Server Spotlight', 'Event/News', 'Changelog'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl border-2 font-pixel text-[8px] uppercase tracking-widest transition-all ${
                              category === cat 
                                ? 'bg-realm-green border-realm-green text-zinc-950 shadow-sm' 
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div 
                        onClick={() => setIsFeatured(!isFeatured)}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${isFeatured ? 'bg-realm-green' : 'bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: isFeatured ? 26 : 2 }}
                          className={`absolute top-1 w-4 h-4 rounded-full shadow-sm ${isFeatured ? 'bg-zinc-950' : 'bg-white/40'}`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-white uppercase tracking-widest font-headline block">Feature this post</label>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest leading-none mt-1">Pin to top of blog list</p>
                      </div>
                    </div>
                  </div>

                  <BlogImageUpload
                    label="Cover Image"
                    value={imageUrl}
                    onUpload={setImageUrl}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline">Content (Markdown)</label>
                    <span className="text-[10px] text-white/20 font-headline uppercase tracking-widest">Supports Markdown Rendering</span>
                  </div>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your amazing story here..."
                    rows={12}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none resize-none font-headline leading-relaxed"
                  />
                </div>
              </>
            ) : (
              <div className="max-w-6xl mx-auto py-10 px-6">
                {/* Hero Section */}
                <div className="mb-10 flex flex-col items-start text-left">
                  <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-white/30 mb-6">
                    <span className="flex items-center gap-1.5 text-realm-green/60">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {format(post?.created_at ? new Date(post.created_at) : new Date(), 'MMMM dd, yyyy')}
                    </span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">person</span>
                      {profile?.discord_username || 'Staff'}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-xs font-headline uppercase text-realm-green">Preview Draft</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-headline text-white mb-8 md:mb-10 uppercase leading-none tracking-tight text-left font-bold break-words">
                    {title || 'Post Title'}
                  </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                  {imageUrl && (
                    <div className="w-full lg:w-1/2 flex-shrink-0 lg:sticky lg:top-24 self-start">
                      <div className="aspect-video rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 shadow-3xl relative flex items-center justify-center">
                        <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`w-full ${imageUrl ? 'lg:w-1/2' : ''}`}>
                    <div className="overflow-hidden">
                      <ReactMarkdown 
                        remarkPlugins={[remarkBreaks, remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-4 leading-relaxed text-white/60 text-sm md:text-base font-headline break-words">{children}</p>,
                          h1: ({ children }) => <h1 className="text-2xl md:text-4xl font-headline text-white mt-8 mb-4 uppercase leading-tight tracking-tight break-words">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl md:text-3xl font-headline text-white mt-6 mb-3 uppercase leading-tight tracking-tight break-words">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg md:text-2xl font-headline text-white mt-4 mb-2 uppercase leading-tight tracking-tight break-words">{children}</h3>,
                          ul: ({ children }) => <ul className="space-y-2 mb-4 list-disc pl-6 text-white/60 font-headline break-words">{children}</ul>,
                          ol: ({ children }) => <ol className="space-y-2 mb-4 list-decimal pl-6 text-white/60 font-headline break-words">{children}</ol>,
                          li: ({ children }) => <li className="pl-2">{children}</li>,
                          strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline decoration-realm-green/30 underline-offset-4 transition-all break-all">
                              {children}
                            </a>
                          ),
                          img: ({ src, alt }) => (
                            <img 
                              src={src} 
                              alt={alt} 
                              loading="lazy"
                              decoding="async"
                              className="max-w-full h-auto rounded-2xl border border-white/10 my-8 shadow-2xl mx-auto" 
                            />
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-8 border border-white/5 rounded-xl no-scrollbar">
                              <table className="min-w-full text-left border-collapse">{children}</table>
                            </div>
                          ),
                          th: ({ children }) => <th className="p-4 border-b border-white/10 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest bg-white/[0.02]">{children}</th>,
                          td: ({ children }) => <td className="p-4 border-b border-white/5 text-white/60 text-xs md:text-sm">{children}</td>,
                          hr: () => <hr className="my-12 border-white/5" />,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-realm-green bg-realm-green/5 px-6 py-4 rounded-r-xl my-8 italic text-white/80 font-headline text-sm md:text-base break-words">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => <code className="bg-zinc-800 text-realm-green px-1.5 py-0.5 rounded text-sm font-mono break-all">{children}</code>,
                          pre: ({ children }) => (
                            <pre className="bg-zinc-900 border border-white/5 rounded-2xl p-6 my-8 overflow-x-auto no-scrollbar font-mono text-xs md:text-sm">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {(content || '').replace(/\n{3,}/g, match => '\n\n' + '&nbsp;\n\n'.repeat(match.length - 2))}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-end gap-4 bg-black/20">
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-xl text-xs font-headline font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !title || !content}
              className="flex items-center gap-2 px-8 py-3 bg-realm-green text-zinc-950 rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-md"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-zinc-950/20 border-t-zinc-950 rounded-full animate-spin" />
              ) : post ? (
                <span className="material-symbols-outlined text-base">save</span>
              ) : (
                <span className="material-symbols-outlined text-base">send</span>
              )}
              {post ? 'Save Changes' : 'Publish Blog'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(editorContent, document.getElementById('modal-root')!)
}
