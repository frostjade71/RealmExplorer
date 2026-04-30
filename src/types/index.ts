export type UserRole = 'explorer' | 'moderator' | 'admin'
export type ServerCategory = 'factions' | 'kitpvp' | 'skyblock' | 'smp' | 'modded' | 'skygen' | 'other'
export type ServerType = 'server' | 'realm'
export type ServerStatus = 'pending' | 'approved' | 'rejected' | 'emailed' | 'Review Icon' | 'Review Cover' | 'Review Icon & Cover' | 'Review Gallery' | 'Review Icon & Gallery' | 'Review Cover & Gallery' | 'Review All Assets'

export interface Profile {
  id: string
  discord_username: string | null
  discord_avatar: string | null
  discord_banner: string | null
  discord_id: string | null
  role: UserRole
  social_links: SocialLink[] | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type SocialPlatform = 'website' | 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'twitch' | 'email' | 'discord'

export interface SocialLink {
  platform: SocialPlatform
  url: string
}

export interface Server {
  id: string
  owner_id: string | null
  name: string
  description: string | null
  type: ServerType
  category: ServerCategory
  ip_or_code: string | null
  port: number | null
  bedrock_ip: string | null
  website_url: string | null
  discord_url: string | null
  banner_url: string | null
  icon_url: string | null
  gallery: string[]
  slug: string
  tags: string[]
  status: ServerStatus
  featured: boolean
  votes: number
  average_rating: number
  weighted_rating: number
  rating_count: number
  social_links: SocialLink[] | null
  submitter_role: string | null
  verify_discord: boolean | null
  last_edited_at: string
  created_at: string
  updated_at: string
  yesterday_vote_rank?: number | null
  yesterday_rating_rank?: number | null
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




export type OTMCategory = 'realm' | 'server' | 'developer' | 'builder'

export interface OTMWinner {
  id: string
  month: string
  category: OTMCategory
  server_id: string | null
  user_id?: string | null
  winner_name: string | null
  winner_image_url: string | null
  description: string | null
  created_at: string
  servers?: Server
  profiles?: Profile
}

export interface OTMCompetitor {
  id: string
  category: OTMCategory
  server_id: string | null
  user_id?: string | null
  month?: string
  total_votes?: number
  created_at: string
  servers?: {
    name: string
    description: string | null
    icon_url: string | null
    slug: string | null
    banner_url?: string | null
    type?: string | null
  }
  profiles?: Profile
}

export interface OTMVote {
  id: string
  user_id: string
  server_id: string | null
  target_user_id: string | null
  category: OTMCategory
  created_at: string
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

export interface CategoryRequest {
  id: string
  requester_id: string
  subject: string
  description: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  profiles?: Profile
}

export interface TeamMember {
  id: string
  user_id: string
  role_title: string
  display_order: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface SiteSetting {
  key: string
  value: any
  updated_at: string
}

export interface OTMConfig {
  competition_status: {
    realm: boolean
    server: boolean
    developer: boolean
    builder: boolean
  }
  next_start_times: {
    realm: string | null
    server: string | null
    developer: string | null
    builder: string | null
  }
  end_times: {
    realm: string | null
    server: string | null
    developer: string | null
    builder: string | null
  }
}

export interface Report {
  id: string
  reporter_id: string
  server_id: string
  subject: string
  message: string
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  created_at: string
  updated_at: string
  profiles?: Profile
  servers?: {
    name: string
    slug: string
  }
}

export interface BlogPost {
  id: string
  author_id: string | null
  title: string
  slug: string
  content: string | null
  image_url: string | null
  status: 'draft' | 'published'
  is_featured: boolean
  category: 'Server Spotlight' | 'Event/News' | 'Changelog'
  created_at: string
  updated_at: string
  profiles?: Profile
}
