import { Hammer, BookOpen, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AnimatedPage } from '../components/AnimatedPage'

export function BlogPage() {
  return (
    <AnimatedPage>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-zinc-500 mx-auto mb-6" />
          <h1 className="text-2xl font-pixel text-white mb-2 uppercase tracking-wider">
            The Blog
          </h1>
          <p className="text-zinc-500 font-headline text-sm mb-8">
            Under Construction
          </p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-realm-green hover:underline font-headline text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back Home
          </Link>
        </div>
      </div>
    </AnimatedPage>
  )
}
