import { Link } from 'react-router-dom'
import { Mail, MessageSquare } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#111811] dark:bg-black w-full py-12 px-8 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-lg text-white">RE</span>
            <div className="w-px h-6 bg-white/20"></div>
            <p className="font-headline text-xs tracking-widest text-white/40 uppercase">Realm Explorer</p>
          </div>
          <p className="text-white/60 text-sm max-w-xs text-center md:text-left font-body">
            Exploring the blocks, building the community. Crafting the ultimate server discovery, one chunk at a time.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10">
          <div className="flex flex-col gap-4">
            <h5 className="text-white font-pixel text-[10px] uppercase tracking-widest">Platform</h5>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-2 underline-offset-4 text-xs font-headline transition-colors">Terms of Service</Link>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-2 underline-offset-4 text-xs font-headline transition-colors">Privacy Policy</Link>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="text-white font-pixel text-[10px] uppercase tracking-widest">Support</h5>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-2 underline-offset-4 text-xs font-headline transition-colors">Documentation</Link>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-2 underline-offset-4 text-xs font-headline transition-colors">Contact Support</Link>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-[#4EC44E] hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-[#4EC44E] hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
          <p className="font-body text-xs text-white/40">v0.1.1-beta | © 2026 Realm Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
