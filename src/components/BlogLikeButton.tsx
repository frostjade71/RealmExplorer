import { useAuth } from '../contexts/AuthContext'
import { useBlogPostLikes } from '../hooks/queries'
import { useToggleBlogPostLikeMutation } from '../hooks/mutations'
import heartIcon from '../assets/blog/minecraftheart.png'
import { toast } from 'sonner'

interface BlogLikeButtonProps {
  postId: string
  variant?: 'small' | 'large'
}

export function BlogLikeButton({ postId, variant = 'small' }: BlogLikeButtonProps) {
  const { user } = useAuth()
  const { data: likes, isLoading } = useBlogPostLikes(postId, user?.id)
  const toggleLikeMutation = useToggleBlogPostLikeMutation()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error('Login Required', {
        description: 'You must be logged in to heart this post!'
      })
      return
    }

    toggleLikeMutation.mutate({
      postId,
      userId: user.id,
      hasLiked: !!likes?.hasLiked
    })
  }

  const isLiked = !!likes?.hasLiked
  const count = likes?.count || 0

  const getTooltipText = () => {
    if (isLoading) return 'Loading likes...'
    const users = likes?.likedBy || []
    if (users.length === 0) return 'No likes yet'
    
    if (users.length === 1) {
      return `${users[0]} has liked this`
    }
    if (users.length === 2) {
      return `${users[0]} and ${users[1]} have liked this`
    }
    if (users.length === 3) {
      return `${users[0]}, ${users[1]}, and ${users[2]} have liked this`
    }
    return `${users[0]}, ${users[1]}, and ${users.length - 2} others have liked this`
  }

  if (variant === 'large') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || toggleLikeMutation.isPending}
        className="group flex flex-col items-center gap-2 p-4 transition-transform active:scale-95 relative group/tooltip"
      >
        <div className="relative">
          <img 
            src={heartIcon} 
            alt="Heart" 
            className={`w-12 h-12 transition-all duration-300 ${isLiked ? '' : 'grayscale brightness-50 opacity-40 group-hover:grayscale-0 group-hover:opacity-100'}`}
          />
        </div>
        
        <div className="text-center">
          <span className="block text-2xl font-headline font-bold text-white leading-none mb-1">
            {count}
          </span>
          <span className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-realm-green transition-colors">
            {isLiked ? 'You Hearten This' : 'Drop a Heart'}
          </span>
        </div>

        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover/tooltip:block bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 rounded shadow-xl text-white font-sans text-[10px] tracking-normal normal-case whitespace-nowrap z-50 pointer-events-none">
          {getTooltipText()}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || toggleLikeMutation.isPending}
      className="flex items-center gap-2 transition-transform active:scale-95 group relative group/tooltip"
    >
      <img
        src={heartIcon}
        alt="Heart"
        className={`w-4 h-4 transition-all ${isLiked ? '' : 'grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100'}`}
      />
      <span className={`text-[10px] font-sans font-semibold transition-colors ${isLiked ? 'text-white' : 'text-white/20 group-hover:text-white/60'}`}>
        {count}
      </span>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover/tooltip:block bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 rounded shadow-xl text-white font-sans text-[10px] tracking-normal normal-case whitespace-nowrap z-50 pointer-events-none">
        {getTooltipText()}
      </div>
    </button>
  )
}
