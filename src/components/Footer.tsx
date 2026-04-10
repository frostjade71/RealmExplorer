import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { SiDiscord, SiKofi } from 'react-icons/si'

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
            <a 
              href="https://ko-fi.com/P5P11XJVKI" 
              target="_blank" 
              rel="noreferrer" 
              className="px-4 h-10 bg-white/5 rounded-lg flex items-center gap-2 text-white hover:bg-[#FF5E5B] hover:text-white transition-all hover:scale-105"
              title="Support Frost on Ko-fi"
            >
              <SiKofi className="w-5 h-5" />
              <span className="text-xs font-headline font-medium">Support Frost on Ko-fi</span>
            </a>
            <a 
              href="https://discord.com/invite/realmexplorer" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-[#5865F2] hover:text-white transition-all hover:scale-110"
              title="Join our Discord"
            >
              <SiDiscord className="w-5 h-5" />
            </a>
            <a 
              href="https://github.com/frostjade71" 
              target="_blank" 
              rel="noreferrer" 
              className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 hover:text-white transition-all hover:scale-110"
              title="View GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
          <p className="font-body text-xs text-white/40">v0.5.0-beta | © 2026 Realm Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
