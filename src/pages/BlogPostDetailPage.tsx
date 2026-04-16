// BlogPostDetailPage.tsx
import { useParams, Link } from 'react-router-dom'
import { useBlogPost } from '../hooks/queries'
import { LoadingSpinner } from '../components/FeedbackStates'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { ArrowLeft, Calendar, User, Share2, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { BlogLikeButton } from '../components/BlogLikeButton'
import { toast } from 'sonner'

export function BlogPostDetailPage() {
  const { slug } = useParams()
  const { data: post, isLoading } = useBlogPost(slug)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: `Check out this blog post: ${post?.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link Copied!', {
        description: 'Blog post URL has been copied to your clipboard.'
      })
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-pixel text-white mb-4 uppercase">Post Not Found</h1>
        <Link to="/blog" className="text-realm-green hover:underline font-headline text-sm uppercase tracking-widest font-bold">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <AnimatedPage>
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <FramerIn>
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors font-headline text-xs font-bold uppercase tracking-widest mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </FramerIn>

        {/* Hero Section */}
        <FramerIn delay={0.1}>
          <div className="mb-10 flex flex-col items-center text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-white/30 mb-6">
                <span className="flex items-center gap-1.5 text-realm-green/60">
                  <Calendar size={12} />
                  {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                </span>
                
                <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User size={12} />
                    {post.profiles?.discord_username || 'Staff'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <BlogLikeButton postId={post.id} />
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-headline text-white mb-8 md:mb-10 uppercase leading-none tracking-tight text-center font-bold">
                {post.title}
              </h1>
          </div>

          {post.image_url && (
            <div className="max-w-2xl mx-auto aspect-video rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10 shadow-3xl mb-12 relative flex items-center justify-center">
              <img src={post.image_url} alt="" className="max-w-full max-h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          )}
        </FramerIn>

        {/* Main Content */}
        <FramerIn delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <ReactMarkdown 
              remarkPlugins={[remarkBreaks, remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-6 leading-relaxed text-white/60 text-sm md:text-base font-headline">{children}</p>,
                h1: ({ children }) => <h1 className="text-2xl md:text-4xl font-headline text-white mt-12 mb-10 uppercase leading-tight tracking-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl md:text-3xl font-headline text-white mt-10 mb-8 uppercase leading-tight tracking-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg md:text-2xl font-headline text-white mt-8 mb-6 uppercase leading-tight tracking-tight">{children}</h3>,
                ul: ({ children }) => <ul className="space-y-4 mb-8 list-disc pl-6 text-white/60 font-headline">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-4 mb-8 list-decimal pl-6 text-white/60 font-headline">{children}</ol>,
                li: ({ children }) => <li className="pl-2">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-realm-green hover:underline decoration-realm-green/30 underline-offset-4 transition-all">
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-12 border-white/5" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-realm-green bg-realm-green/5 px-6 py-4 rounded-r-xl my-8 italic text-white/80 font-headline text-sm md:text-base">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => <code className="bg-zinc-800 text-realm-green px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                pre: ({ children }) => (
                  <pre className="bg-zinc-900 border border-white/5 rounded-2xl p-6 my-8 overflow-x-auto no-scrollbar font-mono text-xs md:text-sm">
                    {children}
                  </pre>
                ),
              }}
            >
              {post.content || ''}
            </ReactMarkdown>
          </div>
        </FramerIn>

        {/* Footer Actions */}
        <FramerIn delay={0.3} className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-realm-green/10 border border-realm-green/20 flex items-center justify-center p-1">
                {post.profiles?.discord_avatar ? (
                  <img src={post.profiles.discord_avatar} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={20} className="text-realm-green" />
                )}
              </div>
              <div>
                <p className="text-[8px] font-headline font-bold text-white/20 uppercase tracking-widest">Posted By</p>
                <div className="flex items-center gap-4">
                  <p className="text-xs font-pixel text-white uppercase">{post.profiles?.discord_username || 'Realm Staff'}</p>
                  <BlogLikeButton postId={post.id} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleShare}
              className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-headline font-bold uppercase tracking-widest"
            >
              <Share2 size={14} />
              Share
            </button>
            <a 
              href="https://discord.gg/vcwrEznJhG"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-realm-green/10 text-realm-green border border-realm-green/20 hover:bg-realm-green hover:text-zinc-950 transition-all text-xs font-headline font-bold uppercase tracking-widest"
            >
              <MessageCircle size={14} />
              Discuss on Discord
            </a>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
  )
}
