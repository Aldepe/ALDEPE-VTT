import type { ID, ImageAsset, Visibility } from './common'

export interface Point {
  x: number
  y: number
}

export type DrawingShape = 'circle' | 'cone' | 'square' | 'line'

export type BattleAreaType = DrawingShape

export type PlacementMode = 'free' | 'cell-center' | 'grid-intersection'

export type MapAssetType =
  | 'wall'
  | 'door'
  | 'locked-door'
  | 'secret-door'
  | 'trap'
  | 'danger'
  | 'difficult-terrain'
  | 'cover'
  | 'obstacle'
  | 'chest-loot'
  | 'stairs'
  | 'water'
  | 'fire'
  | 'pit-hole'
  | 'altar-objective'
  | 'entry-exit'
  | 'switch-mechanism'
  | 'light-source'
  | 'darkness-zone'
  | 'barricade'
  | 'rubble'
  | 'statue'
  | 'rune-glyph'
  | 'poison-zone'
  | 'ice-zone'
  | 'lightning-zone'
  | 'column-pillar'
  | 'shrine'
  | 'portal'
  | 'magic-circle'
  | 'cage-prison'
  | 'bridge'
  | 'broken-bridge'
  | 'difficult-vegetation'
  | 'hazard-marker'
  | 'secret-passage'
  | 'ambush-marker'
  | 'campfire'
  | 'bedroll-camp'
  | 'lever'
  | 'sealed-door'
  | 'cracked-wall'
  | 'treasure-marker'
  | 'corpse-remains'
  | 'summoning-point'
  | 'spawn-point'
  | 'objective-marker'
  | 'interactable-prop'

export interface BattleMap {
  id: ID
  campaignId: ID
  name: string
  width: number
  height: number
  gridSize: number
  background: ImageAsset
  isActive: boolean
}

export interface TokenStats {
  maxHp: number
  currentHp: number
  temporaryHp: number
  armorClass: number
  temporaryArmorClass?: number
  initiative: number
  speed: number
  creatureType: string
  visibleNotes: string
  secretNotes: string
  notes: string
}

export type TokenKind = 'player' | 'monster' | 'npc' | 'custom'

export interface Token {
  id: ID
  mapId: ID
  ownerCharacterId?: ID
  ownerUserId?: ID
  characterId?: ID
  kind: TokenKind
  name: string
  image: ImageAsset
  x: number
  y: number
  size: number
  rotation: number
  scale: number
  accentColor: string
  borderColor: string
  visibility: Visibility
  conditions: string[]
  stats: TokenStats
  isLocked: boolean
  isInTurnOrder: boolean
  active: boolean
  createdBy?: ID
  updatedBy?: ID
}

export interface Drawing {
  id: ID
  mapId: ID
  createdByUserId: ID
  shape: DrawingShape
  start: Point
  end: Point
  color: string
  visibility: Visibility
}

export interface BattleArea {
  id: ID
  campaignId: ID
  mapId: ID
  type: BattleAreaType
  name: string
  x: number
  y: number
  start: Point
  end: Point
  width: number
  height: number
  radius: number
  length: number
  angle: number
  rotation: number
  color: string
  opacity: number
  strokeWidth: number
  placementMode: PlacementMode
  visibility: Visibility
  notes: string
  locked: boolean
  hidden: boolean
  createdByUserId: ID
  updatedByUserId: ID
  version: number
  createdAt: string
  updatedAt: string
}

export interface MapAsset {
  id: ID
  mapId: ID
  type: MapAssetType
  name: string
  category: string
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  visibility: Visibility
  notes: string
  color: string
  variant: string
  locked: boolean
}

export interface TurnEntry {
  id: ID
  tokenId?: ID
  name: string
  initiative: number
  kind: TokenKind
  visibility?: Visibility
  locked?: boolean
}

export interface TurnOrder {
  id: ID
  mapId: ID
  round: number
  currentIndex: number
  entries: TurnEntry[]
}
