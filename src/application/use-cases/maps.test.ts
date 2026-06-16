import { describe, expect, it } from 'vitest'
import { createDemoWorkspace } from '@infrastructure/local-demo/demoData'
import { DeleteMapUseCase, SetActiveMapAfterDeletionUseCase } from './maps'

describe('map use cases', () => {
  it('selects a fallback active map after deleting the current one', () => {
    const workspace = createDemoWorkspace()
    const activeMap = workspace.maps[0]
    const fallbackMap = { ...activeMap, id: 'map_fallback', name: 'Fallback', isActive: false }

    const nextWorkspace = DeleteMapUseCase(
      {
        ...workspace,
        maps: [activeMap, fallbackMap],
      },
      activeMap.id,
    )

    expect(nextWorkspace.campaign.activeMapId).toBe('map_fallback')
    expect(nextWorkspace.maps).toEqual([{ ...fallbackMap, isActive: true }])
  })

  it('removes map-owned references when a map is deleted', () => {
    const workspace = createDemoWorkspace()
    const activeMap = workspace.maps[0]
    const nextWorkspace = DeleteMapUseCase(workspace, activeMap.id)

    expect(nextWorkspace.tokens).toHaveLength(0)
    expect(nextWorkspace.battleAreas).toHaveLength(0)
    expect(nextWorkspace.mapAssets).toHaveLength(0)
    expect(nextWorkspace.turnOrders).toHaveLength(0)
    expect(nextWorkspace.notes.every((note) => !note.linkedMapIds.includes(activeMap.id))).toBe(true)
  })

  it('keeps the active map when deleting a different map', () => {
    const workspace = createDemoWorkspace()
    const activeMap = workspace.maps[0]
    const fallbackMap = { ...activeMap, id: 'map_fallback', name: 'Fallback', isActive: false }

    expect(SetActiveMapAfterDeletionUseCase([activeMap, fallbackMap], fallbackMap.id, activeMap.id)).toBe(activeMap.id)
  })
})
