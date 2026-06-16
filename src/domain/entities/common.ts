export type ID = string

export type CampaignRole = 'dm' | 'player'

export type Visibility = 'dm' | 'dm_only' | 'public'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface UserProfile {
  id: ID
  email: string
  displayName: string
}

export interface Campaign {
  id: ID
  name: string
  description: string
  activeMapId?: ID
}

export interface CampaignMember {
  id: ID
  campaignId: ID
  userId: ID
  role: CampaignRole
  displayName: string
  characterId?: ID | null
  canDrawOnMap: boolean
}

export interface ImageAsset {
  url?: string
  alt?: string
}
