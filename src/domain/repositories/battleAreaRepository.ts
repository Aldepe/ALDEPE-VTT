import type { BattleArea, PlacementMode } from '@domain/entities/battlemap'
import type { ID } from '@domain/entities/common'

export interface BattleAreaRepository {
  listBattleAreas(mapId: ID): Promise<BattleArea[]>
  createBattleArea(area: BattleArea): Promise<BattleArea>
  updateBattleArea(area: BattleArea): Promise<BattleArea>
  deleteBattleArea(areaId: ID): Promise<void>
  duplicateBattleArea(area: BattleArea): Promise<BattleArea>
  setBattleAreaPlacementMode(mode: PlacementMode): Promise<PlacementMode>
}
