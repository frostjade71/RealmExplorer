import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useSubmitBanAppeal } from '../hooks/appeals'


import greenHammer from '../assets/moderation/239280-green-hammer.png'
import trashyAxolotl from '../assets/moderation/9648-trashyaxolotl.png'

export function AppealPage() {
  const { user, profile, signInWithDiscord, signOut } = useAuth()
  const { mutateAsync: submitAppeal, isPending } = useSubmitBanAppeal()
  const [reason, setReason] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleLogin = async () => {
    await signInWithDiscord('/appeal')
  }

  const handleSwitchAccount = async () => {
    await signOut()
    // Give it a brief moment to clear state before initiating new login
    setTimeout(async () => {
      await signInWithDiscord('/appeal')
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile?.discord_username || !profile?.discord_id) {
      toast.error('Discord information not found on your profile.')
      return
    }

    if (!reason.trim()) {
      toast.error('Please provide an appeal reason.')
      return
    }

    try {
      await submitAppeal({
        discord_username: profile.discord_username,
        discord_id: profile.discord_id,
        appeal_reason: reason,
        user_id: user?.id
      })

      setIsSubmitted(true)
      toast.success('Appeal submitted successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit appeal')
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-xl p-6 md:p-8 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-realm-green/20 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6">
            <span className="material-symbols-outlined text-realm-green text-2xl md:text-3xl">check_circle</span>
          </div>
          <h2 className="text-xl md:text-2xl font-pixel text-white mb-3 md:mb-4">Appeal Submitted</h2>
          <p className="text-sm md:text-base text-white/60 mb-5 md:mb-6">
            Your ban appeal has been sent to our moderation team. We will review it shortly.
          </p>
          <a href="/" className="inline-block px-5 py-2.5 md:px-6 md:py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-headline text-sm md:text-base">
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/10 rounded-xl p-5 md:p-8"
        >
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <img src={greenHammer} alt="Ban Appeal" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            <div>
              <h1 className="text-lg md:text-2xl font-pixel text-white tracking-tighter">Ban Appeal</h1>
              <p className="text-white/60 text-xs md:text-sm mt-1 font-headline">Submit a request to appeal a ban from our Discord Server</p>
            </div>
          </div>

          {!user ? (
            <div className="text-center py-8 md:py-10 bg-black/20 rounded-lg border border-white/5">
              <img src={trashyAxolotl} alt="Authentication Required" className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 object-contain opacity-50 drop-shadow-md grayscale opacity-40" />
              <h3 className="text-lg md:text-xl font-headline text-white mb-2">Authentication Required</h3>
              <p className="text-white/60 mb-5 md:mb-6 text-xs md:text-sm px-4">
                You must log in with Discord to submit a ban appeal. This is required to verify your identity.
              </p>
              <button
                onClick={handleLogin}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-headline transition-colors inline-flex items-center gap-2 text-sm md:text-base"
              >
                Login with Discord
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  {profile?.discord_avatar ? (
                    <img src={profile.discord_avatar} alt="Avatar" className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/50 text-xl md:text-2xl">person</span>
                    </div>
                  )}
                  <div>
                    <p className="text-white/60 font-headline uppercase tracking-wider text-[9px] md:text-[10px]">Appealing As</p>
                    <p className="text-white font-headline font-medium text-sm md:text-base">{profile?.discord_username || 'Unknown'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="flex items-center gap-2 text-white/60 hover:text-white p-2 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                  title="Switch Account"
                >
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  <span className="hidden md:block text-sm font-headline">Switch Account</span>
                </button>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-headline text-white/60 mb-2">Appeal Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder:text-white/20 focus:outline-none focus:border-realm-green transition-colors min-h-[120px] md:min-h-[150px] resize-y font-headline"
                  placeholder="Explain why you were banned and why you believe the ban should be lifted..."
                  required
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 md:p-4 text-orange-200 text-xs md:text-sm font-headline">
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-orange-500 text-lg md:text-xl">info</span>
                  <p>
                    Submitting false or joke appeals may result in a permanent ban. Please be honest and thorough in your explanation.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 md:pt-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-realm-green hover:bg-realm-green-hover text-zinc-950 px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-headline font-bold transition-colors disabled:opacity-50 flex items-center gap-2 text-sm md:text-base"
                >
                  {isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px] md:text-[18px]">progress_activity</span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Appeal'
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
