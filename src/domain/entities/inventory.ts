import type { ID } from './common'

export interface InventoryContainer {
  id: ID
  characterId: ID
  name: string
  description: string
  weight?: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: ID
  characterId: ID
  containerId?: ID
  name: string
  type: string
  rarity: string
  requiresAttunement: boolean
  equipped: boolean
  quantity: number
  weight: number
  cost: string
  source: string
  description: string
  notes: string
  tags: string[]
  imageUrl?: string
  imagePath?: string
  imageAlt?: string
  createdAt: string
  updatedAt: string
}
