import type { BattleArea, BattleMap, Drawing, MapAsset, Token, TurnOrder } from '@domain/entities/battlemap'
import type { CampaignMember, ID } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import type { LoreEntry } from '@domain/entities/lore'
import type { CampaignNote } from '@domain/entities/note'
import type { Quest, TimelineSession } from '@domain/entities/timeline'
import type { CampaignRepository, CampaignWorkspace } from '@domain/repositories/campaignRepository'
import { DeleteMapUseCase } from '@application/use-cases/maps'
import { NormalizeTokenUseCase } from '@application/use-cases/battlemapTokens'
import { createDemoWorkspace } from './demoData'
import { hydrateCharacterDefaults } from '@application/use-cases/workspaceFactories'
import {
  withBattleArea,
  withCampaignMember,
  withCharacter,
  withDrawing,
  withInventoryContainer,
  withInventoryItem,
  withLoreEntry,
  withMap,
  withMapAsset,
  withNote,
  withQuest,
  withSession,
  withToken,
  withTurnOrder,
  withoutBattleArea,
  withoutCharacterCascade,
  withoutInventoryContainer,
  withoutInventoryItem,
  withoutNote,
  withoutMapAsset,
  withoutQuest,
  withoutSession,
  withoutToken,
} from '@application/use-cases/workspaceMutations'

const workspaceKey = 'aldepe-vtt-demo-workspace'
const demoFeatureVersion = 6

type StoredWorkspace = Partial<CampaignWorkspace> & { demoFeatureVersion?: number }

function mergeArrayDefault<T>(current: T[] | undefined, fallback: T[]): T[] {
  return current?.length ? current : fallback
}

function mergeDemoCharacterDefaults(character: Character, defaultCharacter: Character | undefined, shouldSeedDemoFields: boolean): Character {
  const hydrated = hydrateCharacterDefaults(character)
  if (!shouldSeedDemoFields || !defaultCharacter) {
    return hydrated
  }

  const spells = mergeArrayDefault(hydrated.spells, defaultCharacter.spells)
  const spellSlots = mergeArrayDefault(hydrated.spellSlots, defaultCharacter.spellSlots)

  return hydrateCharacterDefaults({
    ...hydrated,
    tools: mergeArrayDefault(hydrated.tools, defaultCharacter.tools),
    weapons: mergeArrayDefault(hydrated.weapons, defaultCharacter.weapons),
    armor: mergeArrayDefault(hydrated.armor, defaultCharacter.armor),
    resistances: mergeArrayDefault(hydrated.resistances, defaultCharacter.resistances),
    immunities: mergeArrayDefault(hydrated.immunities, defaultCharacter.immunities),
    vulnerabilities: mergeArrayDefault(hydrated.vulnerabilities, defaultCharacter.vulnerabilities),
    conditions: mergeArrayDefault(hydrated.conditions, defaultCharacter.conditions),
    senses: mergeArrayDefault(hydrated.senses, defaultCharacter.senses),
    actions: mergeArrayDefault(hydrated.actions, defaultCharacter.actions),
    attacks: mergeArrayDefault(hydrated.attacks, defaultCharacter.attacks),
    triggers: mergeArrayDefault(hydrated.triggers, defaultCharacter.triggers),
    features: mergeArrayDefault(hydrated.features, defaultCharacter.features),
    traits: mergeArrayDefault(hydrated.traits, defaultCharacter.traits),
    spellSlots,
    spells,
    spellcasting: hydrated.spellcasting.isSpellcaster ? hydrated.spellcasting : defaultCharacter.spellcasting,
  })
}

function readWorkspace(): CampaignWorkspace {
  const stored = localStorage.getItem(workspaceKey)
  if (!stored) {
    const workspace = createDemoWorkspace()
    localStorage.setItem(workspaceKey, JSON.stringify(workspace))
    return workspace
  }

  const workspace = JSON.parse(stored) as StoredWorkspace
  const defaults = createDemoWorkspace()
  const needsFeatureMigration = workspace.demoFeatureVersion !== demoFeatureVersion
  const migrated = {
    ...defaults,
    ...workspace,
    characters: (workspace.characters ?? defaults.characters).map((character) =>
      mergeDemoCharacterDefaults(
        character,
        defaults.characters.find((defaultCharacter) => defaultCharacter.id === character.id),
        needsFeatureMigration,
      ),
    ),
    sessions: (workspace.sessions ?? defaults.sessions).map((session) => ({
      ...session,
      sessionImageHoloEnabled: session.sessionImageHoloEnabled ?? true,
    })),
    battleAreas: needsFeatureMigration && !workspace.battleAreas?.length ? defaults.battleAreas : workspace.battleAreas ?? defaults.battleAreas,
    tokens: (workspace.tokens ?? defaults.tokens).map(NormalizeTokenUseCase),
    inventoryContainers:
      needsFeatureMigration && !workspace.inventoryContainers?.length
        ? defaults.inventoryContainers
        : workspace.inventoryContainers ?? defaults.inventoryContainers,
    inventoryItems:
      needsFeatureMigration && !workspace.inventoryItems?.length ? defaults.inventoryItems : workspace.inventoryItems ?? defaults.inventoryItems,
    notes: needsFeatureMigration && !workspace.notes?.length ? defaults.notes : workspace.notes ?? defaults.notes,
    mapAssets: (workspace.mapAssets ?? defaults.mapAssets).map((asset) => ({
      ...defaults.mapAssets[0],
      ...asset,
      name: asset.name ?? asset.label,
      category: asset.category ?? 'marker',
      rotation: asset.rotation ?? 0,
      color: asset.color ?? '#f7e66f',
      variant: asset.variant ?? 'default',
      locked: asset.locked ?? false,
    })),
    demoFeatureVersion,
  } as CampaignWorkspace & { demoFeatureVersion: number }

  if (needsFeatureMigration) {
    localStorage.setItem(workspaceKey, JSON.stringify(migrated))
  }

  return migrated
}

function persistWorkspace(workspace: CampaignWorkspace): CampaignWorkspace {
  localStorage.setItem(workspaceKey, JSON.stringify(workspace))
  return workspace
}

export class LocalCampaignRepository implements CampaignRepository {
  async loadWorkspace(userId: ID, preferredRole: CampaignMember['role'], displayName?: string): Promise<CampaignWorkspace> {
    const workspace = readWorkspace()
    const expectedUserId = preferredRole === 'dm' ? 'demo-dm' : 'demo-player'
    if (userId === expectedUserId) {
      return workspace
    }

    return {
      ...workspace,
      members: workspace.members.map((member) =>
        member.role === preferredRole
          ? { ...member, userId, displayName: displayName || (preferredRole === 'dm' ? 'DM Local' : 'Player Local') }
          : member,
      ),
      characters: workspace.characters.map((character) =>
        preferredRole === 'player' ? { ...character, ownerUserId: userId } : character,
      ),
    }
  }

  async saveCampaignMember(member: CampaignMember): Promise<CampaignMember> {
    persistWorkspace(withCampaignMember(readWorkspace(), member))
    return member
  }

  async saveCharacter(character: Character): Promise<Character> {
    persistWorkspace(withCharacter(readWorkspace(), character))
    return character
  }

  async deleteCharacter(characterId: ID): Promise<void> {
    persistWorkspace(withoutCharacterCascade(readWorkspace(), characterId))
  }

  async saveSession(session: TimelineSession): Promise<TimelineSession> {
    persistWorkspace(withSession(readWorkspace(), session))
    return session
  }

  async deleteSession(sessionId: ID): Promise<void> {
    persistWorkspace(withoutSession(readWorkspace(), sessionId))
  }

  async saveQuest(quest: Quest): Promise<Quest> {
    persistWorkspace(withQuest(readWorkspace(), quest))
    return quest
  }

  async deleteQuest(questId: ID): Promise<void> {
    persistWorkspace(withoutQuest(readWorkspace(), questId))
  }

  async saveLoreEntry(entry: LoreEntry): Promise<LoreEntry> {
    persistWorkspace(withLoreEntry(readWorkspace(), entry))
    return entry
  }

  async deleteLoreEntry(entryId: ID): Promise<void> {
    const workspace = readWorkspace()
    persistWorkspace({
      ...workspace,
      loreEntries: workspace.loreEntries
        .filter((entry) => entry.id !== entryId)
        .map((entry) => ({ ...entry, linkedEntryIds: entry.linkedEntryIds.filter((id) => id !== entryId) })),
    })
  }

  async saveMap(map: BattleMap): Promise<BattleMap> {
    persistWorkspace(withMap(readWorkspace(), map))
    return map
  }

  async deleteMap(mapId: ID): Promise<void> {
    persistWorkspace(DeleteMapUseCase(readWorkspace(), mapId))
  }

  async saveToken(token: Token): Promise<Token> {
    persistWorkspace(withToken(readWorkspace(), token))
    return token
  }

  async deleteToken(tokenId: ID): Promise<void> {
    persistWorkspace(withoutToken(readWorkspace(), tokenId))
  }

  async saveDrawing(drawing: Drawing): Promise<Drawing> {
    persistWorkspace(withDrawing(readWorkspace(), drawing))
    return drawing
  }

  async saveBattleArea(area: BattleArea): Promise<BattleArea> {
    persistWorkspace(withBattleArea(readWorkspace(), area))
    return area
  }

  async deleteBattleArea(areaId: ID): Promise<void> {
    persistWorkspace(withoutBattleArea(readWorkspace(), areaId))
  }

  async saveMapAsset(asset: MapAsset): Promise<MapAsset> {
    persistWorkspace(withMapAsset(readWorkspace(), asset))
    return asset
  }

  async deleteMapAsset(assetId: ID): Promise<void> {
    persistWorkspace(withoutMapAsset(readWorkspace(), assetId))
  }

  async saveNote(note: CampaignNote): Promise<CampaignNote> {
    persistWorkspace(withNote(readWorkspace(), note))
    return note
  }

  async deleteNote(noteId: ID): Promise<void> {
    persistWorkspace(withoutNote(readWorkspace(), noteId))
  }

  async saveInventoryContainer(container: InventoryContainer): Promise<InventoryContainer> {
    persistWorkspace(withInventoryContainer(readWorkspace(), container))
    return container
  }

  async deleteInventoryContainer(containerId: ID): Promise<void> {
    persistWorkspace(withoutInventoryContainer(readWorkspace(), containerId))
  }

  async saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    persistWorkspace(withInventoryItem(readWorkspace(), item))
    return item
  }

  async deleteInventoryItem(itemId: ID): Promise<void> {
    persistWorkspace(withoutInventoryItem(readWorkspace(), itemId))
  }

  async saveTurnOrder(turnOrder: TurnOrder): Promise<TurnOrder> {
    persistWorkspace(withTurnOrder(readWorkspace(), turnOrder))
    return turnOrder
  }
}
