import type { BattleArea, BattleAreaType, PlacementMode, Point } from '@domain/entities/battlemap'
import type { ID, Visibility } from '@domain/entities/common'
import { distancePixels } from '@domain/services/battlemapGeometry'
import { createId } from '@shared/utils/id'

export interface CreateBattleAreaInput {
  campaignId: ID
  mapId: ID
  userId: ID
  type: BattleAreaType
  start: Point
  end: Point
  color: string
  visibility: Visibility
  placementMode: PlacementMode
}

function angleBetween(start: Point, end: Point): number {
  return Math.round((Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI)
}

function normalizeAreaMetrics(area: BattleArea): BattleArea {
  const width = Math.abs(area.end.x - area.start.x)
  const height = Math.abs(area.end.y - area.start.y)
  const length = distancePixels(area.start, area.end)
  const radius = area.type === 'circle' || area.type === 'cone' ? length : Math.max(width, height) / 2
  const angle = angleBetween(area.start, area.end)

  return {
    ...area,
    x: area.start.x,
    y: area.start.y,
    width: Math.round(width),
    height: Math.round(height),
    radius: Math.round(radius),
    length: Math.round(length),
    angle,
    updatedAt: new Date().toISOString(),
  }
}

export function CreateBattleAreaUseCase(input: CreateBattleAreaInput): BattleArea {
  const now = new Date().toISOString()
  return normalizeAreaMetrics({
    id: createId('area'),
    campaignId: input.campaignId,
    mapId: input.mapId,
    type: input.type,
    name: `${input.type} area`,
    x: input.start.x,
    y: input.start.y,
    start: input.start,
    end: input.end,
    width: 0,
    height: 0,
    radius: 0,
    length: 0,
    angle: 0,
    rotation: 0,
    color: input.color,
    opacity: 0.26,
    strokeWidth: 5,
    placementMode: input.placementMode,
    visibility: input.visibility,
    notes: '',
    locked: false,
    hidden: false,
    createdByUserId: input.userId,
    updatedByUserId: input.userId,
    version: 1,
    createdAt: now,
    updatedAt: now,
  })
}

export function UpdateBattleAreaUseCase(area: BattleArea, patch: Partial<BattleArea>, userId: ID): BattleArea {
  return normalizeAreaMetrics({
    ...area,
    ...patch,
    updatedByUserId: userId,
    version: area.version + 1,
    updatedAt: new Date().toISOString(),
  })
}

export function DeleteBattleAreaUseCase(areaId: ID): ID {
  return areaId
}

export function DuplicateBattleAreaUseCase(area: BattleArea, userId: ID): BattleArea {
  const now = new Date().toISOString()
  return normalizeAreaMetrics({
    ...area,
    id: createId('area'),
    name: `${area.name || area.type} copy`,
    start: { x: area.start.x + 30, y: area.start.y + 30 },
    end: { x: area.end.x + 30, y: area.end.y + 30 },
    x: area.x + 30,
    y: area.y + 30,
    createdByUserId: userId,
    updatedByUserId: userId,
    version: 1,
    createdAt: now,
    updatedAt: now,
  })
}

export function SetBattleAreaPlacementModeUseCase(mode: PlacementMode): PlacementMode {
  return mode
}

export function RotateBattleAreaUseCase(area: BattleArea, degrees: number, userId: ID): BattleArea {
  return UpdateBattleAreaUseCase(area, { rotation: (area.rotation + degrees) % 360 }, userId)
}

export function ListBattleAreasUseCase(areas: BattleArea[], mapId: ID): BattleArea[] {
  return areas.filter((area) => area.mapId === mapId && !area.hidden)
}
