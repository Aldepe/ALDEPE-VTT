import type { BattleArea, BattleMap, Drawing, MapAsset, Token, TurnOrder } from '@domain/entities/battlemap'
import type { CampaignMember, ID } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import type { LoreEntry } from '@domain/entities/lore'
import type { CampaignNote } from '@domain/entities/note'
import type { Quest, TimelineSession } from '@domain/entities/timeline'
import type { CampaignWorkspace } from '@domain/repositories/campaignRepository'
import { SetActiveMapAfterDeletionUseCase } from './maps'

function replaceById<T extends { id: ID }>(items: T[], nextItem: T): T[] {
  return items.some((item) => item.id === nextItem.id)
    ? items.map((item) => (item.id === nextItem.id ? nextItem : item))
    : [nextItem, ...items]
}

function removeById<T extends { id: ID }>(items: T[], id: ID): T[] {
  return items.filter((item) => item.id !== id)
}

export function withCharacter(workspace: CampaignWorkspace, character: Character): CampaignWorkspace {
  return { ...workspace, characters: replaceById(workspace.characters, character) }
}

export function withCampaignMember(workspace: CampaignWorkspace, member: CampaignMember): CampaignWorkspace {
  return { ...workspace, members: replaceById(workspace.members, member) }
}

export function withSession(workspace: CampaignWorkspace, session: TimelineSession): CampaignWorkspace {
  return { ...workspace, sessions: replaceById(workspace.sessions, session) }
}

export function withoutSession(workspace: CampaignWorkspace, sessionId: ID): CampaignWorkspace {
  return { ...workspace, sessions: removeById(workspace.sessions, sessionId) }
}

export function withQuest(workspace: CampaignWorkspace, quest: Quest): CampaignWorkspace {
  return { ...workspace, quests: replaceById(workspace.quests, quest) }
}

export function withoutQuest(workspace: CampaignWorkspace, questId: ID): CampaignWorkspace {
  return { ...workspace, quests: removeById(workspace.quests, questId) }
}

export function withLoreEntry(workspace: CampaignWorkspace, entry: LoreEntry): CampaignWorkspace {
  return { ...workspace, loreEntries: replaceById(workspace.loreEntries, entry) }
}

export function withoutLoreEntry(workspace: CampaignWorkspace, entryId: ID): CampaignWorkspace {
  return {
    ...workspace,
    loreEntries: removeById(workspace.loreEntries, entryId).map((entry) => ({
      ...entry,
      linkedEntryIds: entry.linkedEntryIds.filter((linkedId) => linkedId !== entryId),
    })),
  }
}

export function withMap(workspace: CampaignWorkspace, map: BattleMap): CampaignWorkspace {
  return {
    ...workspace,
    campaign: map.isActive ? { ...workspace.campaign, activeMapId: map.id } : workspace.campaign,
    maps: replaceById(workspace.maps.map((item) => (map.isActive ? { ...item, isActive: item.id === map.id } : item)), map),
  }
}

export function withoutMapCascade(workspace: CampaignWorkspace, mapId: ID): CampaignWorkspace {
  const nextActiveMapId = SetActiveMapAfterDeletionUseCase(workspace.maps, mapId, workspace.campaign.activeMapId)
  const maps = removeById(workspace.maps, mapId).map((map) => ({
    ...map,
    isActive: map.id === nextActiveMapId,
  }))

  return {
    ...workspace,
    campaign: { ...workspace.campaign, activeMapId: nextActiveMapId },
    maps,
    tokens: workspace.tokens.filter((token) => token.mapId !== mapId),
    drawings: workspace.drawings.filter((drawing) => drawing.mapId !== mapId),
    battleAreas: workspace.battleAreas.filter((area) => area.mapId !== mapId),
    mapAssets: workspace.mapAssets.filter((asset) => asset.mapId !== mapId),
    turnOrders: workspace.turnOrders.filter((turnOrder) => turnOrder.mapId !== mapId),
    notes: workspace.notes.map((note) => ({
      ...note,
      linkedMapIds: note.linkedMapIds.filter((linkedMapId) => linkedMapId !== mapId),
    })),
  }
}

export function withToken(workspace: CampaignWorkspace, token: Token): CampaignWorkspace {
  return { ...workspace, tokens: replaceById(workspace.tokens, token) }
}

export function withoutToken(workspace: CampaignWorkspace, tokenId: ID): CampaignWorkspace {
  return {
    ...workspace,
    tokens: removeById(workspace.tokens, tokenId),
    turnOrders: workspace.turnOrders.map((turnOrder) => {
      const entries = turnOrder.entries.filter((entry) => entry.tokenId !== tokenId && entry.id !== `turn_${tokenId}`)
      return {
        ...turnOrder,
        entries,
        currentIndex: entries.length ? Math.min(turnOrder.currentIndex, entries.length - 1) : 0,
      }
    }),
  }
}

export function withDrawing(workspace: CampaignWorkspace, drawing: Drawing): CampaignWorkspace {
  return { ...workspace, drawings: replaceById(workspace.drawings, drawing) }
}

export function withBattleArea(workspace: CampaignWorkspace, area: BattleArea): CampaignWorkspace {
  return { ...workspace, battleAreas: replaceById(workspace.battleAreas, area) }
}

export function withoutBattleArea(workspace: CampaignWorkspace, areaId: ID): CampaignWorkspace {
  return { ...workspace, battleAreas: removeById(workspace.battleAreas, areaId) }
}

export function withMapAsset(workspace: CampaignWorkspace, asset: MapAsset): CampaignWorkspace {
  return { ...workspace, mapAssets: replaceById(workspace.mapAssets, asset) }
}

export function withoutMapAsset(workspace: CampaignWorkspace, assetId: ID): CampaignWorkspace {
  return { ...workspace, mapAssets: removeById(workspace.mapAssets, assetId) }
}

export function withNote(workspace: CampaignWorkspace, note: CampaignNote): CampaignWorkspace {
  return { ...workspace, notes: replaceById(workspace.notes, note) }
}

export function withoutNote(workspace: CampaignWorkspace, noteId: ID): CampaignWorkspace {
  return { ...workspace, notes: removeById(workspace.notes, noteId) }
}

export function withInventoryContainer(workspace: CampaignWorkspace, container: InventoryContainer): CampaignWorkspace {
  return { ...workspace, inventoryContainers: replaceById(workspace.inventoryContainers, container) }
}

export function withoutInventoryContainer(workspace: CampaignWorkspace, containerId: ID): CampaignWorkspace {
  return {
    ...workspace,
    inventoryContainers: removeById(workspace.inventoryContainers, containerId),
    inventoryItems: workspace.inventoryItems.map((item) =>
      item.containerId === containerId ? { ...item, containerId: undefined } : item,
    ),
  }
}

export function withInventoryItem(workspace: CampaignWorkspace, item: InventoryItem): CampaignWorkspace {
  return { ...workspace, inventoryItems: replaceById(workspace.inventoryItems, item) }
}

export function withoutInventoryItem(workspace: CampaignWorkspace, itemId: ID): CampaignWorkspace {
  return { ...workspace, inventoryItems: removeById(workspace.inventoryItems, itemId) }
}

export function withTurnOrder(workspace: CampaignWorkspace, turnOrder: TurnOrder): CampaignWorkspace {
  return { ...workspace, turnOrders: replaceById(workspace.turnOrders, turnOrder) }
}
