import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Search, MonitorPlay, XCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSetting, useServers, useServersByIds } from '../hooks/queries'
import { useUpdateSiteSettingMutation } from '../hooks/mutations'
import type { Server } from '../types'

interface ShowcaseCardsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ShowcaseCardsModal({ isOpen, onClose }: ShowcaseCardsModalProps) {
  const { profile } = useAuth()
  const { data: settingRow, isLoading: isLoadingSetting } = useSiteSetting('homepage_showcase_cards')
  const savedIds = (settingRow?.value as string[]) || []
  const updateSetting = useUpdateSiteSettingMutation()
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (settingRow && isOpen) {
      setSelectedIds(savedIds)
    } else if (!isLoadingSetting && isOpen) {
      setSelectedIds([])
    }
    setSearchQuery('')
  }, [settingRow, isLoadingSetting, isOpen])

  const { data: searchResults = [], isLoading: isSearching } = useServers({ 
    searchQuery: searchQuery || undefined, 
    limit: 20 
  })

  const { data: selectedServers = [] } = useServersByIds(selectedIds.length > 0 ? selectedIds : undefined)

  const toggleServer = (serverId: string) => {
    if (selectedIds.includes(serverId)) {
      setSelectedIds(prev => prev.filter(id => id !== serverId))
    } else {
      if (selectedIds.length >= 6) {
        toast.error('Maximum Reached', { description: 'You can only select up to 6 showcase cards.' })
        return
      }
      setSelectedIds(prev => [...prev, serverId])
    }
  }

  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'homepage_showcase_cards',
        value: selectedIds,
        adminId: profile?.id,
        adminName: profile?.discord_username
      })
      toast.success('Showcase Cards Updated', {
        description: 'The selected servers will now be displayed on the homepage.'
      })
      onClose()
    } catch (err: any) {
      toast.error('Failed to update', { description: err.message })
    }
  }

  if (!isOpen) return null

  const orderedSelectedServers = selectedIds.map(id => selectedServers.find(s => s.id === id)).filter(Boolean) as Server[]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-pixel text-white text-lg">Showcase Cards</h2>
                <p className="text-white/40 font-headline text-xs mt-1">Select up to 6 servers to feature on the homepage carousel</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
            {isLoadingSetting ? (
              <div className="flex items-center justify-center py-12 w-full">
                <div className="w-8 h-8 border-4 border-[#85fc7e]/30 border-t-[#85fc7e] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex-1 flex flex-col h-[500px]">
                  <h3 className="font-headline font-bold text-white text-sm mb-3">Search Servers</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by server name..."
                      className="w-full bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-headline text-sm focus:outline-none focus:border-[#85fc7e] transition-colors"
                    />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {isSearching ? (
                      <div className="flex justify-center p-4">
                         <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <p className="text-white/40 text-sm font-headline text-center mt-8">No servers found.</p>
                    ) : (
                      searchResults.map(server => (
                        <div 
                          key={server.id}
                          onClick={() => toggleServer(server.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedIds.includes(server.id)
                              ? 'bg-realm-green/10 border-realm-green'
                              : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-white/10">
                            {server.icon_url ? (
                              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40 font-pixel text-xs">
                                {server.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-headline font-bold text-sm truncate">{server.name}</h4>
                            <p className="text-white/40 font-headline text-[10px] uppercase truncate">{server.category}</p>
                          </div>
                          <div>
                            {selectedIds.includes(server.id) ? (
                              <CheckCircle2 className="w-5 h-5 text-realm-green" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-white/20" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="w-full md:w-72 flex flex-col h-[500px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-headline font-bold text-white text-sm">Selected Cards</h3>
                    <span className={`text-xs font-bold font-headline ${selectedIds.length === 6 ? 'text-realm-green' : 'text-white/40'}`}>
                      {selectedIds.length} / 6
                    </span>
                  </div>
                  
                  <div className="flex-1 bg-black border border-white/10 rounded-xl p-4 overflow-y-auto space-y-3 custom-scrollbar">
                    {orderedSelectedServers.length === 0 ? (
                      <p className="text-white/40 text-sm font-headline text-center mt-8">No servers selected yet.</p>
                    ) : (
                      orderedSelectedServers.map(server => (
                        <div key={server.id} className="relative group rounded-lg overflow-hidden border border-white/10">
                          {server.banner_url ? (
                            <img src={server.banner_url} alt="" className="w-full h-24 object-cover" />
                          ) : (
                            <div className="w-full h-24 bg-zinc-900" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-zinc-800 shrink-0">
                              {server.icon_url && <img src={server.icon_url} alt="" className="w-full h-full object-cover rounded" />}
                            </div>
                            <span className="text-white font-headline text-xs font-bold truncate">{server.name}</span>
                          </div>
                          
                          <button
                            onClick={() => toggleServer(server.id)}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500/80 rounded-full flex items-center justify-center text-white/80 hover:text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {selectedIds.length > 0 && (
                    <button
                      onClick={() => setSelectedIds([])}
                      className="mt-3 text-white/40 hover:text-red-400 font-headline text-xs font-bold uppercase transition-colors self-end"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={updateSetting.isPending}
              className="px-6 py-2.5 rounded-lg font-headline font-bold text-xs uppercase tracking-wider bg-[#85fc7e] hover:bg-[#85fc7e]/80 text-zinc-950 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateSetting.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
