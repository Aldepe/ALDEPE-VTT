import type { BattleMap } from '@domain/entities/battlemap'
import type { ID } from '@domain/entities/common'
import type { CampaignWorkspace } from '@domain/repositories/campaignRepository'

export function SetActiveMapAfterDeletionUseCase(
  maps: BattleMap[],
  deletedMapId: ID,
  activeMapId?: ID,
): ID | undefined {
  if (activeMapId && activeMapId !== deletedMapId) {
    return activeMapId
  }

  return maps.find((map) => map.id !== deletedMapId)?.id
}

export function DeleteMapUseCase(workspace: CampaignWorkspace, mapId: ID): CampaignWorkspace {
  const nextActiveMapId = SetActiveMapAfterDeletionUseCase(workspace.maps, mapId, workspace.campaign.activeMapId)
  const maps = workspace.maps
    .filter((map) => map.id !== mapId)
    .map((map) => ({ ...map, isActive: map.id === nextActiveMapId }))

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
