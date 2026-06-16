import type { ID } from '@domain/entities/common'
import type { BattleMap } from '@domain/entities/battlemap'

export interface MapRepository {
  saveMap(map: BattleMap): Promise<BattleMap>
  deleteMap(mapId: ID): Promise<void>
}
