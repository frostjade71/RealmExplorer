import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useBlogPost } from '../hooks/queries'
import { LoadingSpinner } from '../components/FeedbackStates'
import errorImage from '../assets/error/teto-but-re.webp'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { BlogLikeButton } from '../components/BlogLikeButton'
import { BlogViewCount } from '../components/BlogViewCount'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { SiDiscord } from 'react-icons/si'

import { MetaTags } from '../components/MetaTags'

export function BlogPostDetailPage() {
  const { slug } = useParams()
  const { data: post, isLoading } = useBlogPost(slug)
  const [localViews, setLocalViews] = useState<number | null>(null)

  useEffect(() => {
    if (!post?.id) return

    const storageKey = `blog_post_viewed_${post.id}`
    const hasViewed = localStorage.getItem(storageKey)

    if (!hasViewed) {
      localStorage.setItem(storageKey, 'true')
      setLocalViews((post.views ?? 0) + 1)
      supabase.rpc('increment_blog_post_views', { post_id: post.id })
        .then(({ error }) => {
          if (error) {
            console.error('Failed to increment view count:', error)
          }
        })
    } else {
      setLocalViews(post.views ?? 0)
    }
  }, [post?.id, post?.views])

  const displayViews = localViews !== null ? localViews : (post?.views ?? 0)

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
      <AnimatedPage className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500 p-4 flex flex-col items-center">
          <img src={errorImage} alt="Not Found" className="w-24 h-24 md:w-32 md:h-32 object-contain mb-2" />
          <div className="space-y-2 px-4">
            <h2 className="text-2xl md:text-3xl font-headline text-white font-bold tracking-tight">
              <span className="text-realm-green mr-3">404</span>
              Post Not Found
            </h2>
            <p className="text-xs md:text-sm text-on-surface-variant font-body max-w-sm mx-auto">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
          </div>
          <div className="pt-4">
            <Link 
              to="/blog" 
              className="inline-flex items-center justify-center px-4 py-2.5 font-headline text-sm font-semibold text-black bg-realm-green rounded hover:bg-primary-fixed transition-colors duration-200"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  const metaDescription = post.content 
    ? post.content.substring(0, 160).replace(/[#*`]/g, '') + '...' 
    : `Read ${post.title} on the Realm Explorer blog.`;

  return (
    <>
      <MetaTags 
        title={post.title}
        description={metaDescription}
        image={post.image_url || undefined}
        url={`/blog/${post.slug}`}
        type="article"
      />
      <AnimatedPage>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
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
          <div className="mb-10 flex flex-col items-start text-left">
              <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-3 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-white/30 mb-6">
                <span className="flex items-center gap-1.5 text-realm-green/60">
                  <Calendar size={12} />
                  {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                </span>
                
                <span className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                
                <div className="flex items-center gap-4">
                  {post.profiles?.discord_username ? (
                    <Link to={`/profile/${post.profiles.discord_username}`} className="flex items-center gap-1.5 hover:text-realm-green transition-colors">
                      <User size={12} />
                      {post.profiles.discord_username}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <User size={12} />
                      Staff
                    </span>
                  )}
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <div className="flex items-center gap-3">
                    <BlogViewCount views={displayViews} />
                    <BlogLikeButton postId={post.id} />
                  </div>
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-headline text-white mb-8 md:mb-10 uppercase leading-none tracking-tight text-left font-bold break-words">
                {post.title}
              </h1>
          </div>
        </FramerIn>
 
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image */}
          {post.image_url && (
            <div className="w-full lg:w-1/2 flex-shrink-0 lg:sticky lg:top-24 self-start">
              <FramerIn delay={0.15}>
                <div className="aspect-video rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 shadow-3xl relative flex items-center justify-center">
                  <img src={post.image_url} alt="" fetchPriority="high" loading="eager" decoding="sync" className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </FramerIn>
            </div>
          )}
 
          {/* Main Content */}
          <div className={`w-full ${post.image_url ? 'lg:w-1/2' : ''}`}>
            <FramerIn delay={0.2}>
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
              {(post.content || '').replace(/\n{3,}/g, match => '\n\n' + '&nbsp;\n\n'.repeat(match.length - 2))}
            </ReactMarkdown>
              </div>
            </FramerIn>
          </div>
        </div>
 
        {/* Footer Actions */}
        <FramerIn delay={0.3} className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {post.profiles?.discord_username ? (
                <Link to={`/profile/${post.profiles.discord_username}`} className="block w-10 h-10 rounded-full bg-realm-green/10 border border-realm-green/20 hover:border-realm-green transition-all p-1 shrink-0 overflow-hidden">
                  {post.profiles.discord_avatar ? (
                    <img src={post.profiles.discord_avatar} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={20} className="text-realm-green" />
                    </div>
                  )}
                </Link>
              ) : (
                <div className="w-10 h-10 rounded-full bg-realm-green/10 border border-realm-green/20 flex items-center justify-center p-1 shrink-0">
                  <User size={20} className="text-realm-green" />
                </div>
              )}
              <div>
                <p className="text-[8px] font-headline font-bold text-white/20 uppercase tracking-widest">Posted By</p>
                <div className="flex items-center gap-4">
                  {post.profiles?.discord_username ? (
                    <Link to={`/profile/${post.profiles.discord_username}`} className="text-xs font-pixel text-white uppercase hover:text-realm-green transition-colors">
                      {post.profiles.discord_username}
                    </Link>
                  ) : (
                    <p className="text-xs font-pixel text-white uppercase">Realm Staff</p>
                  )}
                  <div className="flex items-center gap-3">
                    <BlogViewCount views={displayViews} />
                    <BlogLikeButton postId={post.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={handleShare}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] font-headline font-bold uppercase tracking-widest whitespace-nowrap"
            >
              <Share2 size={12} />
              Share
            </button>
            <a 
              href="https://discord.com/channels/1258132272419311676/1456663092061802540"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 hover:bg-[#5865F2] hover:text-white transition-all text-[10px] font-headline font-bold uppercase tracking-widest whitespace-nowrap"
            >
              <SiDiscord size={12} />
              Discuss
            </a>
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
    </>
  )
}
