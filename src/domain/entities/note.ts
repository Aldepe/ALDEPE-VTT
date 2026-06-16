import type { ID } from './common'

export type NoteType = 'personal' | 'party' | 'dm'

export interface CampaignNote {
  id: ID
  campaignId: ID
  title: string
  content: string
  tags: string[]
  type: NoteType
  authorUserId: ID
  authorName: string
  pinned: boolean
  linkedCharacterIds: ID[]
  linkedLoreEntryIds: ID[]
  linkedMapIds: ID[]
  createdAt: string
  updatedAt: string
}
