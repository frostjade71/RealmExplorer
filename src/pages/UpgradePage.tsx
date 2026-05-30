import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, ShieldCheck, Image as ImageIcon, PlusCircle, Share2, FileText, Sparkles, ArrowUp, X, Ticket, ChevronDown, Users, Tag } from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import { FramerIn } from '../components/FramerIn'
import { useAuth } from '../contexts/AuthContext'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../components/FeedbackStates'
import { useIsMobile } from '../hooks/useMediaQuery'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { useCancelSubscriptionMutation } from '../hooks/mutations'
import { toast } from 'sonner'
const upgradeHero = '/upgrades/upgradehero.webp'
const goldGradient = '/upgrades/gold-minecraft-gradient.webp'
const goldIngot = '/upgrades/9515-mc-gold-ingot.png'
import directoryHero from '../assets/hero/directoryhero.jpg'
const successGif = '/upgrades/4364-verification-icon.gif'
import snowBlocksBg from '../assets/sponsors/Key art Snow Blocks cr,Ilya Vdovyuk.jpg'
import heartIcon from '../assets/blog/minecraftheart.png'

export function UpgradePage() {
  const isMobile = useIsMobile()
  const { user, profile, hasPremiumPerks, signInWithDiscord } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const cancelMutation = useCancelSubscriptionMutation()
  const [voucherCode, setVoucherCode] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [isVoucherOpen, setIsVoucherOpen] = useState(false)
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)

  const handleRedeemVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Please enter a voucher code')
      return
    }

    setIsRedeeming(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-voucher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          code: voucherCode.trim(),
          userId: user?.id
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Voucher Redeemed!', {
          description: 'Your Explorer+ benefits are now active.'
        })
        setIsSuccess(true)
      } else {
        throw new Error(result.error || 'Failed to redeem voucher')
      }
    } catch (err: any) {
      console.error("Voucher Redemption Error", err)
      toast.error('Redemption Failed', {
        description: err.message || 'Invalid or expired code.'
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  useEffect(() => {
    let timer: any
    if (isCancelModalOpen) {
      setCountdown(5)
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setCountdown(0)
    }
    return () => clearInterval(timer)
  }, [isCancelModalOpen])

  const benefits = [
    { 
      title: 'Increased Limits', 
      desc: 'Submit up to 5 servers/realms instead of 1.', 
      icon: <PlusCircle className="w-5 h-5 text-green-400" /> 
    },
    { 
      title: 'Golden Role', 
      desc: 'Exclusive Gold Ingot role for your profile .', 
      icon: <img src={goldIngot} alt="" className="w-6 h-6 object-contain" /> 
    },
    { 
      title: 'Priority Exploration', 
      desc: 'Your listings has a higher chance to be on the top when users shuffle.', 
      icon: <ArrowUp className="w-5 h-5 text-yellow-400" /> 
    },
    { 
      title: 'Profile Banner', 
      desc: 'Add a custom banner to your explorer profile.', 
      icon: <ImageIcon className="w-5 h-5 text-realm-green" /> 
    },
    { 
      title: 'Extended Gallery', 
      desc: 'Upload up to 5 images per listing gallery.', 
      icon: <ImageIcon className="w-5 h-5 text-blue-400" /> 
    },
    { 
      title: 'Styled Server', 
      desc: 'Golden borders for your listings to stand out.', 
      icon: <Sparkles className="w-5 h-5 text-amber-400" /> 
    },
    { 
      title: 'Social Connectivity', 
      desc: 'Add up to 6 social links to your profile and listings.', 
      icon: <Share2 className="w-5 h-5 text-indigo-400" /> 
    },
    { 
      title: 'Rich Descriptions', 
      desc: 'Up to 5,000 characters for server descriptions.', 
      icon: <FileText className="w-5 h-5 text-purple-400" /> 
    },
    {
      title: 'Staff Members',
      desc: "Showcase up to 6 trusted staff members directly on your server's page.",
      icon: <Users className="w-5 h-5 text-cyan-400" />
    },
    {
      title: 'Discount Sponsorship',
      desc: 'Enjoy 30% discount on server sponsorships, saving you $3.00 on every promotion.',
      icon: <Tag className="w-5 h-5 text-rose-400" />
    },
    { 
      title: 'Priority Support', 
      desc: 'Direct access to staff for listing issues.', 
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> 
    },
    { 
      title: 'Supporter Role', 
      desc: 'Get the Supporter role and Explorer+ role on our Discord server.', 
      icon: <Zap className="w-5 h-5 text-orange-400" /> 
    },
  ]

  if (isSuccess) {
    return (
      <AnimatedPage className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-zinc-900 border border-realm-green/30 p-8 md:p-12 rounded-xl shadow-2xl overflow-hidden max-w-lg w-full mx-auto"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img src={directoryHero} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950/90" />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6">
              <img src={successGif} alt="Success" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-pixel text-xl md:text-2xl text-white mb-4 uppercase drop-shadow-lg">Payment Successful!</h1>
            <p className="text-zinc-300 font-headline text-xs md:text-sm mb-8 max-w-md mx-auto drop-shadow-md leading-relaxed">
              Welcome to <span className="text-amber-400 font-bold italic">Explorer+</span>! Your benefits are now active. 
              It may take a few minutes for your role to update site-wide.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-realm-green text-zinc-950 px-6 md:px-8 py-3 rounded-lg font-headline font-bold text-[10px] md:text-sm uppercase tracking-widest hover:bg-realm-green/80 transition-all shadow-xl"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>
      </AnimatedPage>
    )
  }

  return (
    <>
    <AnimatedPage>
      <header className="relative pt-32 pb-16 md:pb-20 px-8 overflow-hidden min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-center bg-zinc-950">
        {/* Cinematic Background */}
        <motion.img 
          initial={isMobile ? { opacity: 0.5 } : { scale: 1.1, opacity: 0 }}
          animate={isMobile ? { opacity: 0.5 } : { scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={upgradeHero} 
          alt="Upgrade Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 block will-change-[opacity,transform]"
        />
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-amber-950/60 z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-20 flex flex-col items-center text-center will-change-transform">
          <FramerIn>
            <div className={`inline-flex items-center gap-2 bg-zinc-800/90 border-t-2 border-l-2 border-white/20 border-r-2 border-b-2 border-black/50 px-3 py-1 mb-6 md:mb-8 text-amber-400 shadow-[2px_2px_0px_rgba(0,0,0,0.4)] ${isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-md'}`}>
              <img src={goldIngot} alt="Explorer+" className="w-5 h-5 object-contain" />
              <span className="font-pixel text-[8px] md:text-[9px] tracking-widest uppercase">Explorer+</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-pixel text-white mb-6 drop-shadow-2xl uppercase tracking-tight">
              Become an <span className="text-amber-400 italic">Explorer+</span>
            </h1>
            <p className="text-white/90 font-headline text-sm md:text-lg max-w-2xl mx-auto drop-shadow-lg leading-relaxed px-4">
              Support the growth of Realm Explorer and unlock exclusive features, 
              increased limits, and a premium look for your profile and listings.
            </p>
          </FramerIn>
        </div>

        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none"></div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Benefits List */}
          <div className="space-y-6">
            <h2 className="font-pixel text-sm text-white/50 uppercase tracking-widest mb-8">Explorer+ Benefits</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {benefits.map((benefit, i) => (
                <FramerIn key={i} delay={0.2 + (i * 0.05)} className="bg-zinc-900/50 border border-white/5 p-3 md:p-5 rounded-lg hover:border-white/10 transition-all group">
                  <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4">
                    <div className="shrink-0 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                    <div>
                      <h3 className="text-white font-headline font-bold text-[11px] md:text-sm mb-1">{benefit.title}</h3>
                      <p className="text-zinc-500 font-headline text-[9px] md:text-[11px] leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                </FramerIn>
              ))}
            </div>
          </div>

          {/* Pricing Card */}
          <FramerIn delay={0.4} className="sticky top-24">
            <div className="bg-[#313233] border-4 border-[#101010] p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative overflow-hidden group">
              {/* Inner Highlight Borders */}
              <div className="absolute inset-0 border-t-4 border-l-4 border-white/10 pointer-events-none" />
              <div className="absolute inset-0 border-b-4 border-r-4 border-black/40 pointer-events-none" />
              
              {/* Background Gradient overlay */}
              <img src={goldGradient} className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" alt="" />
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/40 via-transparent to-zinc-950/40 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="inline-block bg-amber-400 text-zinc-950 px-3 py-1 border-2 border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)] font-headline font-black text-[10px] uppercase tracking-tighter mb-4">
                  Best Value
                </div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-pixel text-lg text-white uppercase mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">Monthly Subscription</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-pixel text-amber-400 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">$2.49</span>
                      <span className="text-zinc-500 font-headline text-xs line-through">$4.99</span>
                      <span className="text-zinc-500 font-headline text-xs">/mo</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <Check className="w-4 h-4 text-realm-green" />
                    Billed monthly, cancel anytime
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <Check className="w-4 h-4 text-realm-green" />
                    Instant role activation
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                    <Check className="w-4 h-4 text-realm-green" />
                    Support future development
                  </div>
                </div>

                {profile?.role === 'explorer+' ? (
                  <div className="space-y-4">
                    <div className="bg-amber-400/10 border-2 border-[#101010] p-4 shadow-[4px_4px_0_rgba(0,0,0,0.3)] text-center relative">
                      <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />
                      <p className="text-amber-400 font-headline font-bold text-[10px] uppercase tracking-widest">
                        You are already an Explorer+
                      </p>
                      {profile?.subscription_expires_at && (
                        <p className="text-zinc-400 font-headline text-[9px] mt-2 uppercase tracking-wider">
                          Expires: {new Date(profile.subscription_expires_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => setIsCancelModalOpen(true)}
                      className="w-full bg-red-950/20 text-red-500/80 py-3 border-2 border-red-900/30 hover:bg-red-950/40 hover:text-red-400 transition-all font-pixel text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 relative group/cancel"
                    >
                      <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none opacity-50" />
                      <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      Cancel Subscription
                    </button>
                  </div>
                ) : !user ? (
                  <button 
                    onClick={() => signInWithDiscord('/upgrade')}
                    className="w-full bg-zinc-800 text-white py-4 border-4 border-[#101010] shadow-[4px_4px_0_rgba(0,0,0,0.4)] font-headline font-bold text-sm uppercase tracking-widest hover:bg-zinc-700 transition-all relative"
                  >
                    <div className="absolute inset-0 border-t-2 border-l-2 border-white/5 pointer-events-none" />
                    Login to Upgrade
                  </button>
                ) : (
                  <div className="space-y-6">
                    {isProcessing && (
                      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="text-white font-pixel text-[10px] uppercase mt-4 animate-pulse">Processing Payment...</p>
                      </div>
                    )}
                    <div className="border-4 border-[#101010] p-1 bg-white/5 shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
                      <PayPalScriptProvider options={{ 
                        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
                        currency: "USD",
                        intent: "capture"
                      }}>
                        <PayPalButtons 
                          style={{ 
                            layout: "vertical",
                            color: "gold",
                            shape: "rect",
                            label: "pay"
                          }}
                          onError={(err) => {
                            console.error("PayPal Checkout Error:", err);
                            toast.error("PayPal Error");
                          }}
                          disabled={isProcessing}
                          createOrder={async (_data, actions) => {
                            return actions.order.create({
                              intent: "CAPTURE",
                              purchase_units: [{
                                amount: {
                                  currency_code: "USD",
                                  value: "2.49"
                                },
                                description: "Explorer+ Monthly Subscription"
                              }]
                            });
                          }}
                          onApprove={async (data) => {
                            setIsProcessing(true);
                            try {
                              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-checkout`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                                },
                                body: JSON.stringify({
                                  orderId: data.orderID,
                                  userId: user?.id
                                })
                              });

                              const result = await response.json();
                              
                              if (result.success) {
                                setIsSuccess(true);
                              } else {
                                throw new Error(result.error || 'Failed to capture payment');
                              }
                            } catch (err: any) {
                              console.error("PayPal Capture Error", err);
                              alert(err.message || "Something went wrong with the payment. Please contact support.");
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                        />
                      </PayPalScriptProvider>
                    </div>

                    {/* Voucher Section */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsVoucherOpen(!isVoucherOpen)}
                        className="flex items-center gap-2 mx-auto text-zinc-500 hover:text-amber-400 transition-colors group/vbtn"
                      >
                        <Ticket className={`w-3 h-3 ${isVoucherOpen ? 'text-amber-400' : 'text-zinc-600 group-hover/vbtn:text-amber-400'}`} />
                        <span className="font-pixel text-[8px] uppercase tracking-widest">
                          {isVoucherOpen ? 'Close Voucher' : 'Have a voucher?'}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isVoucherOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isVoucherOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-zinc-950/40 border-2 border-[#101010] p-4 relative">
                              <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                  type="text" 
                                  placeholder="ENTER CODE"
                                  value={voucherCode}
                                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                  className="w-full sm:flex-1 bg-zinc-900 border-2 border-[#101010] px-3 py-2 text-white font-pixel text-[10px] focus:border-amber-400/50 outline-none transition-all placeholder:text-zinc-700 text-center sm:text-left"
                                />
                                <button 
                                  onClick={handleRedeemVoucher}
                                  disabled={isRedeeming || !voucherCode.trim()}
                                  className="w-full sm:w-auto bg-zinc-800 text-white px-6 py-2 border-2 border-[#101010] font-pixel text-[8px] uppercase hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative"
                                >
                                  <div className="absolute inset-0 border-t border-l border-white/10 pointer-events-none" />
                                  {isRedeeming ? '...' : 'Redeem'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <p className="text-center text-[9px] text-zinc-500 font-headline mt-6 uppercase tracking-wider">
                  Secure payment via PayPal. By purchasing, you agree to our Terms of Service.
                </p>
              </div>
            </div>
          </FramerIn>
        </div>
      </div>


      {/* Tier Comparison Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-32">
        <FramerIn delay={0.6}>
          <div>
            <div className="text-center mb-8">
              <h2 className="font-pixel text-lg md:text-xl text-white uppercase mb-3">Tier Comparison</h2>
              <p className="text-zinc-500 font-headline text-xs md:text-sm">See how Explorer+ takes your profile to the next level.</p>
            </div>

            <div className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm shadow-2xl w-full">
              <div className="overflow-x-auto font-headline">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-900/50">
                      <th className="py-4 px-4 md:py-6 md:px-8 font-pixel text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest text-center md:text-left">Features</th>
                      <th className="py-4 px-4 md:py-6 md:px-8 font-pixel text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest text-center">Explorer</th>
                      <th className="py-4 px-4 md:py-6 md:px-8 font-pixel text-[9px] md:text-[10px] text-amber-400 uppercase tracking-widest text-center bg-amber-400/5">Explorer+</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Shuffle Priority', free: false, plus: true },
                      { name: 'Server Listing Limit', free: '1 Server', plus: '5 Servers' },
                      { name: 'Image Gallery Size', free: '1 Image', plus: '5 Images' },
                      { name: 'Sponsorships', free: '$9.99', plus: '$6.99 (30% Discount)' },
                      { name: 'Description Length', free: '2,000 Chars', plus: '5,000 Chars' },
                      { name: 'Shuffle Cooldown', free: '6 Seconds', plus: '2 Seconds' },
                      { name: 'Social Links', free: '2 Links', plus: '6 Links' },
                      { name: 'Profile Banner', free: false, plus: true },
                      { name: 'Golden Profile Border', free: false, plus: true },
                      { name: 'Discord Roles', free: false, plus: true },
                      { name: 'Priority Support', free: false, plus: true },
                      { name: 'Animated Elements', free: false, plus: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 md:py-5 md:px-8 text-white text-[10px] md:text-sm font-medium text-center md:text-left">{row.name}</td>
                        <td className="py-3 px-4 md:py-5 md:px-8 text-center">
                          {typeof row.free === 'string' ? (
                            <span className="text-zinc-500 text-[9px] md:text-xs">{row.free}</span>
                          ) : row.free ? (
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-realm-green mx-auto" />
                          ) : (
                            <X className="w-3 h-3 md:w-4 md:h-4 text-zinc-700 mx-auto" />
                          )}
                        </td>
                        <td className="py-3 px-4 md:py-5 md:px-8 text-center bg-amber-400/[0.02]">
                          {typeof row.plus === 'string' ? (
                            <span className="text-amber-400 font-bold text-[9px] md:text-xs">{row.plus}</span>
                          ) : row.plus ? (
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-amber-400 mx-auto" />
                          ) : (
                            <X className="w-3 h-3 md:w-4 md:h-4 text-zinc-700 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </FramerIn>
      </div>

      {/* Sponsoring Section */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 pb-32 border-t border-zinc-800 pt-16">
        <FramerIn delay={0.7}>
          <div>
            <div className="text-center mb-8">
              <h2 className="font-pixel text-lg md:text-xl text-white uppercase mb-3">Sponsorship Slot</h2>
              <p className="text-zinc-500 font-headline text-xs md:text-sm">Promote your individual server listing at the very top.</p>
            </div>

            <div className="bg-[#313233] border-4 border-[#101010] p-6 md:p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative overflow-hidden group rounded-xl">
              <div className="absolute inset-0 border-t-4 border-l-4 border-white/10 pointer-events-none" />
              <div className="absolute inset-0 border-b-4 border-r-4 border-black/40 pointer-events-none" />
              
              <img src={snowBlocksBg} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" alt="" />
              
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/40 via-transparent to-zinc-950/40 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col gap-6 text-left">
                <div>
                  <div className="inline-block bg-[#5ce1e6] text-zinc-950 px-3 py-1 border-2 border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)] font-headline font-black text-[10px] uppercase tracking-tighter mb-4">
                    Boost Exposure
                  </div>
                  <h3 className="font-pixel text-md text-white uppercase mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                    30-Day Sponsorship Slot
                  </h3>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-pixel text-[#5ce1e6] drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                        {hasPremiumPerks ? '$6.99' : '$9.99'}
                      </span>
                      {!hasPremiumPerks && (
                        <span className="text-zinc-500 font-headline text-xs line-through">$14.99</span>
                      )}
                      {hasPremiumPerks && (
                        <span className="text-[#5ce1e6] font-headline text-xs px-2 py-0.5 bg-[#5ce1e6]/10 rounded border border-[#5ce1e6]/20">30% OFF</span>
                      )}
                      <span className="text-zinc-500 font-headline text-xs">/ 30 days</span>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                      <Check className="w-4 h-4 text-realm-green" />
                      Featured in top Sponsors section
                    </div>
                    <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                      <Check className="w-4 h-4 text-realm-green" />
                      Dynamic display to all visitors
                    </div>
                    <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                      <Check className="w-4 h-4 text-realm-green" />
                      Extend or renew at any time
                    </div>
                    <div className="flex items-center gap-3 text-zinc-300 font-headline text-xs">
                      <img src={heartIcon} alt="" className="w-4 h-4 object-contain" />
                      Supporting the platform wholeheartedly
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/40 border-2 border-[#101010] p-6 relative rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />
                  
                  <h4 className="font-pixel text-xs md:text-sm text-white uppercase mb-2">
                    Want to Pin a Specific Listing?
                  </h4>
                  <p className="text-zinc-400 font-headline text-xs mb-6">
                    Sponsor your Realm/Server Now!
                  </p>

                  <button 
                    onClick={() => window.location.href = '/dashboard#sponsor'}
                    className="inline-flex items-center gap-2 bg-[#5ce1e6] text-zinc-950 px-6 py-3 border-2 border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.3)] font-headline font-bold text-xs uppercase hover:bg-[#4bc7cc] transition-all rounded w-full justify-center"
                  >
                    Sponsor Listing
                    <ArrowUp className="w-3.5 h-3.5 rotate-45" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FramerIn>
      </div>

      {/* FAQ You */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-32 border-t border-zinc-800 pt-16">
        <FramerIn delay={0.8}>
          <div className="text-center mb-10">
            <h2 className="font-pixel text-lg md:text-xl text-white uppercase mb-3">FAQ</h2>
            <p className="text-zinc-500 font-headline text-xs md:text-sm">Common questions regarding our tiers and checkout process.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is the difference between Explorer+ and a Sponsorship Slot?",
                a: "Explorer+ is a sitewide monthly subscription that upgrades your user account (unlocking things like a custom profile banner, a higher listing limit of 5, longer descriptions, and higher shuffle priority). A Sponsorship Slot is a one-time 30-day payment specifically for a single server or realm listing that features it prominently in the dynamic Sponsors section at the top of the directory."
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes! You can cancel your Explorer+ monthly subscription at any time directly from this page or your Dashboard. Once cancelled, your premium features will remain active until the end of your current billing period. Sponsoring Slots are one-time 30-day purchases and do not auto-renew, so there is no active subscription to cancel."
              },
              {
                q: "How long does a Sponsorship Slot last?",
                a: "Each server sponsorship lasts for exactly 30 days. You can choose to extend the sponsorship or purchase another slot at any time from your Dashboard, which will add another 30 days to your server's active sponsored time."
              },
              {
                q: "Can I sponsor multiple listings?",
                a: "Yes! You can sponsor as many of your approved server or realm listings as you'd like. Sponsoring is purchased individually per listing on the Dashboard."
              },
              {
                q: "Is my payment information secure?",
                a: "Absolutely. All transactions are securely processed directly through PayPal. We do not store any of your credit card details or sensitive payment credentials on our servers."
              }
            ].map((faq, i) => {
              const isOpen = activeFaqIndex === i;
              return (
                <div 
                  key={i} 
                  className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden transition-all duration-300 shadow-md"
                >
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : i)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-headline hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-white font-bold text-sm md:text-base leading-snug">{faq.q}</span>
                    <motion.div 
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[#5ce1e6] shrink-0"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 text-zinc-400 font-headline text-xs md:text-sm leading-relaxed border-t border-white/[0.03]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </FramerIn>
      </div>
    </AnimatedPage>
    
    <ConfirmationModal
      isOpen={isCancelModalOpen}
      onClose={() => setIsCancelModalOpen(false)}
      onConfirm={async () => {
        if (!user) return
        try {
          await cancelMutation.mutateAsync({ userId: user.id })
          toast.success('Subscription Cancelled', { 
            description: 'Your premium features have been revoked and account reverted to Explorer.' 
          })
        } catch (err: any) {
          toast.error('Failed to cancel', { 
            description: err.message || 'Something went wrong.' 
          })
        } finally {
          setIsCancelModalOpen(false)
        }
      }}
      title="Cancel Explorer+"
      message="Are you sure you want to cancel your Explorer+ subscription? Your custom banner will be cleared, social links trimmed, and extra servers archived immediately."
      confirmLabel={countdown > 0 ? `${countdown}s` : "Yes, Cancel"}
      confirmDisabled={countdown > 0}
      isDangerous={true}
      variant="pixel"
      isLoading={cancelMutation.isPending}
    />
    </>

  )
}
