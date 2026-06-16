import type { ID, ImageAsset } from './common'

export type LoreType =
  | 'artifact'
  | 'person'
  | 'zone'
  | 'creature'
  | 'ethnicity'
  | 'event'
  | 'myth'
  | 'organization'

export interface LoreEntry {
  id: ID
  campaignId: ID
  type: LoreType
  name: string
  image: ImageAsset
  publicFields: Record<string, string>
  secret: string
  linkedEntryIds: ID[]
  isVisibleToPlayers: boolean
  visibleToPlayerIds?: ID[]
  updatedAt: string
}
