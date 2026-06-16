import type { BattleArea, Drawing, DrawingShape, PlacementMode, Point } from '../entities/battlemap'
import type { ID, Visibility } from '../entities/common'

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function distancePixels(start: Point, end: Point): number {
  return Math.hypot(end.x - start.x, end.y - start.y)
}

export function distanceFeet(start: Point, end: Point, gridSize: number): number {
  return Math.round((distancePixels(start, end) / gridSize) * 5)
}

export function snapPoint(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  }
}

export function snapPointByPlacementMode(point: Point, gridSize: number, mode: PlacementMode): Point {
  if (mode === 'free') {
    return point
  }

  if (mode === 'cell-center') {
    return {
      x: Math.floor(point.x / gridSize) * gridSize + gridSize / 2,
      y: Math.floor(point.y / gridSize) * gridSize + gridSize / 2,
    }
  }

  return snapPoint(point, gridSize)
}

export function createDrawing(params: {
  id: ID
  mapId: ID
  userId: ID
  shape: DrawingShape
  start: Point
  end: Point
  color: string
  visibility: Visibility
}): Drawing {
  return {
    id: params.id,
    mapId: params.mapId,
    createdByUserId: params.userId,
    shape: params.shape,
    start: params.start,
    end: params.end,
    color: params.color,
    visibility: params.visibility,
  }
}

export function sortTurnEntries<T extends { initiative: number; name: string }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    if (right.initiative !== left.initiative) {
      return right.initiative - left.initiative
    }

    return left.name.localeCompare(right.name)
  })
}

export function moveBattleArea(area: BattleArea, nextStart: Point): BattleArea {
  const deltaX = nextStart.x - area.start.x
  const deltaY = nextStart.y - area.start.y
  return {
    ...area,
    x: nextStart.x,
    y: nextStart.y,
    start: nextStart,
    end: {
      x: area.end.x + deltaX,
      y: area.end.y + deltaY,
    },
  }
}
