import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { SiDiscord, SiKofi } from 'react-icons/si'
import logo from '../assets/rerealm.webp'

export function Footer() {
  return (
    <footer className="bg-[#111811] dark:bg-black w-full py-5 md:py-12 px-8 mt-auto border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg" />
            <div className="w-px h-5 md:h-6 bg-white/20"></div>
            <p className="font-headline text-[10px] md:text-xs tracking-widest text-white/40 uppercase">Realm Explorer</p>
          </div>
          <p className="text-white/60 text-[11px] md:text-sm max-w-xs text-center md:text-left font-body leading-relaxed">
            Exploring the blocks, building the community. Crafting the ultimate server discovery, one chunk at a time.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <div className="flex flex-col gap-3 md:gap-4">
            <h5 className="text-white font-pixel text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">Platform</h5>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Terms of Service</Link>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Privacy Policy</Link>
          </div>
          <div className="flex flex-col gap-3 md:gap-4">
            <h5 className="text-white font-pixel text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">Support</h5>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Documentation</Link>
            <Link to="#" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Contact Support</Link>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-3 md:gap-4">
            <a 
              href="https://ko-fi.com/P5P11XJVKI" 
              target="_blank" 
              rel="noreferrer" 
              className="px-3 md:px-4 h-9 md:h-10 bg-white/5 rounded-lg flex items-center gap-2 text-white hover:bg-[#FF5E5B] hover:text-white transition-all hover:scale-105"
              title="Support Frost on Ko-fi"
            >
              <SiKofi className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-headline font-medium">Support Frost on Ko-fi</span>
            </a>
            <a 
              href="https://discord.com/invite/realmexplorer" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 md:w-10 md:h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-[#5865F2] hover:text-white transition-all hover:scale-110"
              title="Join our Discord"
            >
              <SiDiscord className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a 
              href="https://github.com/frostjade71" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 md:w-10 md:h-10 bg-white/5 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 hover:text-white transition-all hover:scale-110"
              title="View GitHub"
            >
              <Github className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
          <p className="font-body text-[10px] md:text-xs text-white/40">v0.9.8-RC | © 2026 Realm Explorer</p>
        </div>
      </div>
    </footer>
  )
}
