import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { SiDiscord, SiKofi, SiInstagram } from 'react-icons/si'
import logo from '../assets/rerealm.webp'

export function Footer() {
  return (
    <footer className="bg-[#111811] dark:bg-black w-full py-5 md:py-12 px-8 mt-auto border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start gap-3 md:gap-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg" />
            <div className="w-px h-5 md:h-6 bg-white/20"></div>
            <p className="font-headline text-[10px] md:text-xs tracking-widest text-white/40 uppercase">Realm Explorer</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 my-1">
            <a 
              href="https://ko-fi.com/P5P11XJVKI" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white/40 hover:text-[#FF5E5B] transition-all hover:scale-110 p-1"
              title="Support Frost on Ko-fi"
            >
              <SiKofi className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a 
              href="https://discord.com/invite/realmexplorer" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white/40 hover:text-[#5865F2] transition-all hover:scale-110 p-1"
              title="Join our Discord"
            >
              <SiDiscord className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a 
              href="https://www.instagram.com/realmexplorer.xyz" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white/40 hover:text-[#E4405F] transition-all hover:scale-110 p-1"
              title="Follow us on Instagram"
            >
              <SiInstagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a 
              href="https://github.com/Realm-Explorer" 
              target="_blank" 
              rel="noreferrer" 
              className="text-white/40 hover:text-white transition-all hover:scale-110 p-1"
              title="View GitHub"
            >
              <Github className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
          <p className="font-body text-[10px] md:text-xs text-white/40">
            v1.9.2 | © 2026 Realm Explorer
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 md:gap-y-0 gap-x-4 md:gap-x-8 lg:gap-x-12 w-full md:w-fit">
          {/* About */}
          <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <h5 className="text-white font-pixel text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">About</h5>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">About Us</Link>
              <a 
                href="https://discord.com/channels/1258132272419311676/1491872395160584202" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors"
              >
                Changelog
              </a>
              <Link 
                to="/status" 
                className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors"
              >
                Status
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
            <h5 className="text-white font-pixel text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">Resources</h5>
            <div className="flex flex-col gap-2">
              <Link to="/docs" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Documentation</Link>
              <a 
                href="https://discord.com/invite/realmexplorer" 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center md:items-start gap-3 md:gap-4 text-center md:text-left col-span-2 md:col-span-1 mt-2 md:mt-0">
            <h5 className="text-white font-pixel text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">Legal</h5>
            <div className="flex flex-col gap-2">
              <Link to="/terms" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Terms of Use</Link>
              <Link to="/privacy" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Privacy Policy</Link>
              <Link to="/copyright" className="text-white/60 hover:text-green-400 underline decoration-1 underline-offset-4 text-[10px] md:text-xs font-headline transition-colors">Copyright Policy & DMCA</Link>
            </div>
          </div>
        </div>
        
      </div>

      <div className="mt-4 md:mt-6 w-full">
        <p className="font-headline text-[8px] md:text-[9px] text-white/20 uppercase tracking-widest text-center">
          NOT AN OFFICIAL MINECRAFT SERVICE. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT.
        </p>
      </div>
    </footer>
  )
}
