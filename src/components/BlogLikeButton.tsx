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

  if (variant === 'large') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading || toggleLikeMutation.isPending}
        className="group flex flex-col items-center gap-2 p-4 transition-transform active:scale-95"
      >
        <div className="relative">
          <img 
            src={heartIcon} 
            alt="Heart" 
            className={`w-12 h-12 transition-all duration-300 ${isLiked ? '' : 'grayscale brightness-50 opacity-40 group-hover:grayscale-0 group-hover:opacity-100'}`}
          />
        </div>
        
        <div className="text-center">
          <span className="block text-2xl font-pixel text-white leading-none mb-1">
            {count}
          </span>
          <span className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-realm-green transition-colors">
            {isLiked ? 'You Hearten This' : 'Drop a Heart'}
          </span>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || toggleLikeMutation.isPending}
      className="flex items-center gap-2 transition-transform active:scale-95 group"
    >
      <img
        src={heartIcon}
        alt="Heart"
        className={`w-4 h-4 transition-all ${isLiked ? '' : 'grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100'}`}
      />
      <span className={`text-[10px] font-pixel transition-colors ${isLiked ? 'text-white' : 'text-white/20 group-hover:text-white/60'}`}>
        {count}
      </span>
    </button>
  )
}
