import { useBlogPosts } from '../hooks/queries'
import { useDeleteBlogPostMutation } from '../hooks/mutations'
import { type BlogPost } from '../types'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Search, X, Plus, Edit2, Trash2, Calendar, User, BookOpen } from 'lucide-react'
import { AdminBlogEditor } from '../components/AdminBlogEditor'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function AdminBlogPage() {
  const { profile } = useAuth()
  const { data: posts = [], isLoading: loading } = useBlogPosts()
  const deleteMutation = useDeleteBlogPostMutation()

  const [searchQuery, setSearchQuery] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)

  const filteredPosts = useMemo(() => {
    return posts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [posts, searchQuery])

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post)
    setIsEditorOpen(true)
  }

  const handleCreate = () => {
    setSelectedPost(null)
    setIsEditorOpen(true)
  }

  const handleDelete = () => {
    if (!postToDelete || !profile) return

    deleteMutation.mutate(
      { 
        id: postToDelete.id, 
        image_url: postToDelete.image_url,
        adminId: profile.id,
        adminName: profile.discord_username || 'Admin'
      },
      {
        onSuccess: () => {
          toast.success('Post Deleted', {
            description: `"${postToDelete.title}" has been removed.`
          })
          setPostToDelete(null)
        },
        onError: (err: any) => {
          toast.error('Deletion Failed', { description: err.message })
        }
      }
    )
  }

  if (loading) return <LoadingSpinner />

  return (
    <AnimatedPage>
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FramerIn>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-realm-green text-sm">article</span>
            <span className="text-white/40 font-headline text-[10px] tracking-[0.2em] uppercase font-bold text-sm">Official News</span>
          </div>
          <h1 className="text-3xl font-pixel text-white mb-2">Manage Blog</h1>
          <p className="text-white/40 font-headline text-sm max-w-xl">Create and edit official announcements and community updates.</p>
        </FramerIn>
        
        <FramerIn delay={0.1}>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-4 bg-realm-green text-zinc-950 rounded-lg font-headline font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Plus size={16} />
            Create New Post
          </button>
        </FramerIn>
      </div>

      <FramerIn delay={0.15} className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-realm-green transition-all outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </FramerIn>

      <FramerIn delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, idx) => (
            <motion.div
              layout
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-zinc-900 border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-white/10 transition-all"
            >
              {/* Card Image */}
              <div className="h-48 relative overflow-hidden bg-zinc-800">
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-black/60 border border-white/10 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest text-realm-green">
                    {post.status}
                  </span>
                  {post.is_featured && (
                    <span className="px-3 py-1 bg-realm-green text-zinc-950 border border-white/10 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-pixel text-white mb-2 line-clamp-2 uppercase group-hover:text-realm-green transition-colors leading-tight">
                  {post.title}
                </h3>
                
                <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 text-white/30 text-[10px] font-headline uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      {post.profiles?.discord_username || 'Staff'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-headline font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => setPostToDelete(post)}
                      className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/5 rounded-lg border border-white/5 border-dashed">
              <div className="flex flex-col items-center gap-4 text-white/20">
                <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                  <BookOpen size={32} />
                </div>
                <div className="font-headline italic">
                  {searchQuery ? 'No posts matching search...' : 'No blog posts yet.'}
                </div>
                {!searchQuery && (
                  <button onClick={handleCreate} className="text-realm-green font-bold uppercase text-[10px] tracking-widest hover:underline">
                    Create the first news entry
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </FramerIn>

      <AdminBlogEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        post={selectedPost}
      />

      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${postToDelete?.title}"? This will also remove the cover image from storage. This action cannot be undone.`}
        confirmLabel="Delete Post"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </AnimatedPage>
  )
}
