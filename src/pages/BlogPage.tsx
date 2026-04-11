import { BookOpen, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedPage } from '../components/AnimatedPage'

export function BlogPage() {
  return (
    <AnimatedPage>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 md:p-8">
        <div className="max-w-[320px] md:max-w-md w-full bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8 md:p-12 text-center">
          <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-zinc-600 mx-auto mb-4 md:mb-6" />
          <h1 className="text-sm md:text-2xl font-pixel text-white mb-2 uppercase tracking-tight md:tracking-wider">
            The Blog
          </h1>
          <p className="text-zinc-500 font-headline text-[10px] md:text-sm mb-6 md:mb-8 uppercase tracking-[0.2em]">
            Under Construction
          </p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-realm-green hover:text-white transition-colors font-headline text-xs md:text-sm font-bold uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            Go Back Home
          </Link>
        </div>
      </div>
    </AnimatedPage>
  )
}
