export type UserRole = 'explorer' | 'moderator' | 'admin'
export type ServerCategory = 'factions' | 'kitpvp' | 'skyblock' | 'smp' | 'modded' | 'other'
export type ServerType = 'server' | 'realm'
export type ServerStatus = 'pending' | 'approved' | 'rejected' | 'emailed' | 'Review Icon' | 'Review Cover' | 'Review Icon & Cover'

export interface Profile {
  id: string
  discord_username: string | null
  discord_avatar: string | null
  discord_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Server {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  type: ServerType
  category: ServerCategory
  ip_or_code: string | null
  website_url: string | null
  discord_url: string | null
  banner_url: string | null
  icon_url: string | null
  tags: string[]
  status: ServerStatus
  featured: boolean
  votes: number
  average_rating: number
  rating_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface ServerRating {
  id: string
  user_id: string
  server_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export interface ServerMessage {
  id: string
  server_id: string
  sender_id: string | null
  subject: string
  message: string
  type: 'contact' | 'rejection'
  created_at: string
}

export type OTMCategory = 'realm' | 'server' | 'developer' | 'builder'

export interface OTMWinner {
  id: string
  month: string
  category: OTMCategory
  server_id: string | null
  winner_name: string | null
  winner_image_url: string | null
  description: string | null
  created_at: string
  servers?: Server
}

export interface OTMCompetitor {
  id: string
  category: OTMCategory
  server_id: string
  vote_url: string
  month?: string
  created_at: string
  servers?: {
    name: string
    description: string
    icon_url: string
  }
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean | null
  related_id: string | null
  created_at: string | null
}
