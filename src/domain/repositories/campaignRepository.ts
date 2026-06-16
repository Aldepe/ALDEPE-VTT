import type { BattleArea, BattleMap, Drawing, MapAsset, Token, TurnOrder } from '../entities/battlemap'
import type { Campaign, CampaignMember, ID } from '../entities/common'
import type { Character } from '../entities/character'
import type { InventoryContainer, InventoryItem } from '../entities/inventory'
import type { LoreEntry } from '../entities/lore'
import type { CampaignNote } from '../entities/note'
import type { Quest, TimelineSession } from '../entities/timeline'
import type { MapRepository } from './mapRepository'
import type { NoteRepository } from './noteRepository'

export interface CampaignWorkspace {
  campaign: Campaign
  members: CampaignMember[]
  characters: Character[]
  sessions: TimelineSession[]
  quests: Quest[]
  loreEntries: LoreEntry[]
  maps: BattleMap[]
  tokens: Token[]
  drawings: Drawing[]
  battleAreas: BattleArea[]
  mapAssets: MapAsset[]
  notes: CampaignNote[]
  inventoryContainers: InventoryContainer[]
  inventoryItems: InventoryItem[]
  turnOrders: TurnOrder[]
}

export interface CampaignRepository extends MapRepository, NoteRepository {
  loadWorkspace(userId: ID, preferredRole: CampaignMember['role'], displayName?: string): Promise<CampaignWorkspace>
  saveCampaignMember(member: CampaignMember): Promise<CampaignMember>
  saveCharacter(character: Character): Promise<Character>
  deleteCharacter(characterId: ID): Promise<void>
  saveSession(session: TimelineSession): Promise<TimelineSession>
  deleteSession(sessionId: ID): Promise<void>
  saveQuest(quest: Quest): Promise<Quest>
  deleteQuest(questId: ID): Promise<void>
  saveLoreEntry(entry: LoreEntry): Promise<LoreEntry>
  deleteLoreEntry(entryId: ID): Promise<void>
  saveToken(token: Token): Promise<Token>
  deleteToken(tokenId: ID): Promise<void>
  saveDrawing(drawing: Drawing): Promise<Drawing>
  saveBattleArea(area: BattleArea): Promise<BattleArea>
  deleteBattleArea(areaId: ID): Promise<void>
  saveMapAsset(asset: MapAsset): Promise<MapAsset>
  deleteMapAsset(assetId: ID): Promise<void>
  saveInventoryContainer(container: InventoryContainer): Promise<InventoryContainer>
  deleteInventoryContainer(containerId: ID): Promise<void>
  saveInventoryItem(item: InventoryItem): Promise<InventoryItem>
  deleteInventoryItem(itemId: ID): Promise<void>
  saveTurnOrder(turnOrder: TurnOrder): Promise<TurnOrder>
}
