import { describe, expect, it } from 'vitest'
import {
  CreateInventoryContainerUseCase,
  CreateInventoryItemUseCase,
  MoveInventoryItemToContainerUseCase,
  RemoveInventoryItemImageUseCase,
  SetInventoryItemImageUseCase,
  ToggleInventoryItemEquippedUseCase,
} from './inventory'

describe('inventory use cases', () => {
  it('creates containers and moves items into and out of them', () => {
    const container = CreateInventoryContainerUseCase('character', 1)
    const item = CreateInventoryItemUseCase('character')
    const moved = MoveInventoryItemToContainerUseCase(item, container.id)
    const loose = MoveInventoryItemToContainerUseCase(moved, undefined)

    expect(container.characterId).toBe('character')
    expect(moved.containerId).toBe(container.id)
    expect(loose.containerId).toBeUndefined()
  })

  it('toggles equipped state', () => {
    const item = CreateInventoryItemUseCase('character')

    expect(ToggleInventoryItemEquippedUseCase(item).equipped).toBe(true)
  })

  it('sets and removes item images', () => {
    const item = CreateInventoryItemUseCase('character')
    const withImage = SetInventoryItemImageUseCase(item, { imageUrl: 'data:image/png;base64,abc', fileName: 'orb.png' })

    expect(withImage.imageUrl).toContain('data:image')
    expect(withImage.imagePath).toContain(`${item.id}/orb.png`)
    expect(RemoveInventoryItemImageUseCase(withImage).imageUrl).toBeUndefined()
  })
})
