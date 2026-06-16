import { describe, expect, it } from 'vitest'
import {
  CreateBattleAreaUseCase,
  DeleteBattleAreaUseCase,
  DuplicateBattleAreaUseCase,
  RotateBattleAreaUseCase,
  SetBattleAreaPlacementModeUseCase,
  UpdateBattleAreaUseCase,
} from './battleAreas'

const baseArea = CreateBattleAreaUseCase({
  campaignId: 'campaign',
  mapId: 'map',
  userId: 'dm',
  type: 'circle',
  start: { x: 0, y: 0 },
  end: { x: 70, y: 0 },
  color: '#22f0c8',
  visibility: 'public',
  placementMode: 'free',
})

describe('battle area use cases', () => {
  it('creates an area with calculated radius and version', () => {
    expect(baseArea.radius).toBe(70)
    expect(baseArea.version).toBe(1)
  })

  it('edits manual parameters and increments version', () => {
    const updated = UpdateBattleAreaUseCase(baseArea, { name: 'Moon bloom', opacity: 0.5 }, 'dm')

    expect(updated.name).toBe('Moon bloom')
    expect(updated.opacity).toBe(0.5)
    expect(updated.version).toBe(2)
  })

  it('deletes by returning the target id', () => {
    expect(DeleteBattleAreaUseCase(baseArea.id)).toBe(baseArea.id)
  })

  it('changes placement mode and rotates areas', () => {
    expect(SetBattleAreaPlacementModeUseCase('cell-center')).toBe('cell-center')
    expect(RotateBattleAreaUseCase(baseArea, 15, 'dm').rotation).toBe(15)
  })

  it('duplicates an area with a new id', () => {
    const copy = DuplicateBattleAreaUseCase(baseArea, 'dm')

    expect(copy.id).not.toBe(baseArea.id)
    expect(copy.name).toContain('copy')
  })
})
