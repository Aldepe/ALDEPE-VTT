import type { MapAssetType } from '@domain/entities/battlemap'

export interface MapAssetDefinition {
  type: MapAssetType
  name: string
  category: 'structure' | 'hazard' | 'terrain' | 'loot' | 'marker' | 'magic' | 'camp'
  icon: string
  color: string
  baseWidthCells: number
  baseHeightCells: number
}

export const mapAssetDefinitions: MapAssetDefinition[] = [
  { type: 'wall', name: 'Wall', category: 'structure', icon: '▰', color: '#8bd3ff', baseWidthCells: 2, baseHeightCells: 0.25 },
  { type: 'door', name: 'Door', category: 'structure', icon: '▯', color: '#f0b35f', baseWidthCells: 1, baseHeightCells: 0.25 },
  { type: 'locked-door', name: 'Locked door', category: 'structure', icon: '▣', color: '#ff9a4d', baseWidthCells: 1, baseHeightCells: 0.25 },
  { type: 'secret-door', name: 'Secret door', category: 'structure', icon: '?', color: '#ff4fa3', baseWidthCells: 1, baseHeightCells: 0.25 },
  { type: 'trap', name: 'Trap', category: 'hazard', icon: '◇', color: '#ff4fa3', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'danger', name: 'Danger', category: 'hazard', icon: '!', color: '#ff6a78', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'difficult-terrain', name: 'Difficult terrain', category: 'terrain', icon: '≈', color: '#bdff58', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'cover', name: 'Cover', category: 'terrain', icon: '▤', color: '#f7e66f', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'obstacle', name: 'Obstacle', category: 'terrain', icon: '⬢', color: '#d6d2ff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'chest-loot', name: 'Chest / loot', category: 'loot', icon: '$', color: '#f7e66f', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'stairs', name: 'Stairs', category: 'structure', icon: '≋', color: '#aebcff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'water', name: 'Water', category: 'terrain', icon: '~', color: '#22b6ff', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'fire', name: 'Fire', category: 'hazard', icon: '♨', color: '#ff7a35', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'pit-hole', name: 'Pit / hole', category: 'hazard', icon: '○', color: '#1b1026', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'altar-objective', name: 'Altar / objective', category: 'marker', icon: '✦', color: '#b686ff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'entry-exit', name: 'Entry / exit', category: 'marker', icon: '⇄', color: '#22f0c8', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'switch-mechanism', name: 'Switch / mechanism', category: 'marker', icon: '⌁', color: '#f0b35f', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'light-source', name: 'Light source', category: 'magic', icon: '☼', color: '#fff275', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'darkness-zone', name: 'Darkness zone', category: 'magic', icon: '◐', color: '#6c5cff', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'barricade', name: 'Barricade', category: 'structure', icon: '▧', color: '#c98d60', baseWidthCells: 2, baseHeightCells: 0.5 },
  { type: 'rubble', name: 'Rubble', category: 'terrain', icon: '∴', color: '#a9a3a0', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'statue', name: 'Statue', category: 'structure', icon: '♜', color: '#d6d2ff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'rune-glyph', name: 'Rune / glyph', category: 'magic', icon: '✺', color: '#ff4fa3', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'poison-zone', name: 'Poison zone', category: 'hazard', icon: '☣', color: '#72ff58', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'ice-zone', name: 'Ice zone', category: 'hazard', icon: '❄', color: '#8be9ff', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'lightning-zone', name: 'Lightning zone', category: 'hazard', icon: 'ϟ', color: '#e8ff58', baseWidthCells: 2, baseHeightCells: 1 },
  { type: 'column-pillar', name: 'Column / pillar', category: 'structure', icon: '●', color: '#d6d2ff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'shrine', name: 'Shrine', category: 'magic', icon: '✧', color: '#b686ff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'portal', name: 'Portal', category: 'magic', icon: '◎', color: '#22f0c8', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'magic-circle', name: 'Magic circle', category: 'magic', icon: '◉', color: '#ff4fa3', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'cage-prison', name: 'Cage / prison', category: 'structure', icon: '#', color: '#aebcff', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'bridge', name: 'Bridge', category: 'structure', icon: '=', color: '#d7985b', baseWidthCells: 2, baseHeightCells: 1 },
  { type: 'broken-bridge', name: 'Broken bridge', category: 'structure', icon: '≠', color: '#b56f4c', baseWidthCells: 2, baseHeightCells: 1 },
  { type: 'difficult-vegetation', name: 'Difficult vegetation', category: 'terrain', icon: '♣', color: '#54ff8b', baseWidthCells: 2, baseHeightCells: 2 },
  { type: 'hazard-marker', name: 'Hazard marker', category: 'marker', icon: '△', color: '#ff6a78', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'secret-passage', name: 'Secret passage', category: 'marker', icon: '…', color: '#ff4fa3', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'ambush-marker', name: 'Ambush marker', category: 'marker', icon: '⌖', color: '#ff9a4d', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'campfire', name: 'Campfire', category: 'camp', icon: '♨', color: '#ff9a4d', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'bedroll-camp', name: 'Bedroll / camp', category: 'camp', icon: '▱', color: '#75ffd8', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'lever', name: 'Lever', category: 'marker', icon: '⌐', color: '#f0b35f', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'sealed-door', name: 'Sealed door', category: 'structure', icon: '▨', color: '#b686ff', baseWidthCells: 1, baseHeightCells: 0.25 },
  { type: 'cracked-wall', name: 'Cracked wall', category: 'structure', icon: '╳', color: '#ff9a4d', baseWidthCells: 2, baseHeightCells: 0.25 },
  { type: 'treasure-marker', name: 'Treasure marker', category: 'loot', icon: '◆', color: '#f7e66f', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'corpse-remains', name: 'Corpse / remains', category: 'marker', icon: '✕', color: '#ccd0d5', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'summoning-point', name: 'Summoning point', category: 'magic', icon: '✹', color: '#ff4fa3', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'spawn-point', name: 'Spawn point', category: 'marker', icon: '⊕', color: '#22f0c8', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'objective-marker', name: 'Objective marker', category: 'marker', icon: '★', color: '#f7e66f', baseWidthCells: 1, baseHeightCells: 1 },
  { type: 'interactable-prop', name: 'Interactable prop', category: 'marker', icon: '✜', color: '#75ffd8', baseWidthCells: 1, baseHeightCells: 1 },
]

export function getMapAssetDefinition(type: MapAssetType): MapAssetDefinition {
  return mapAssetDefinitions.find((definition) => definition.type === type) ?? mapAssetDefinitions[0]
}
