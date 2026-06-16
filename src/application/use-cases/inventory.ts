import type { ID } from '@domain/entities/common'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import { createId } from '@shared/utils/id'

function now(): string {
  return new Date().toISOString()
}

export function CreateInventoryContainerUseCase(characterId: ID, sortOrder = 0): InventoryContainer {
  const timestamp = now()
  return {
    id: createId('container'),
    characterId,
    name: 'New container',
    description: '',
    weight: 0,
    sortOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function UpdateInventoryContainerUseCase(
  container: InventoryContainer,
  patch: Partial<InventoryContainer>,
): InventoryContainer {
  return { ...container, ...patch, updatedAt: now() }
}

export function DeleteInventoryContainerUseCase(containerId: ID): ID {
  return containerId
}

export function CreateInventoryItemUseCase(characterId: ID, containerId?: ID): InventoryItem {
  const timestamp = now()
  return {
    id: createId('item'),
    characterId,
    containerId,
    name: 'New item',
    type: 'Adventuring gear',
    rarity: 'Common',
    requiresAttunement: false,
    equipped: false,
    quantity: 1,
    weight: 0,
    cost: '',
    source: 'Custom',
    description: '',
    notes: '',
    tags: [],
    imageUrl: undefined,
    imagePath: undefined,
    imageAlt: 'Imagen de New item',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function UpdateInventoryItemUseCase(item: InventoryItem, patch: Partial<InventoryItem>): InventoryItem {
  return { ...item, ...patch, updatedAt: now() }
}

export function MoveInventoryItemToContainerUseCase(item: InventoryItem, containerId?: ID): InventoryItem {
  return UpdateInventoryItemUseCase(item, { containerId })
}

export function ToggleInventoryItemEquippedUseCase(item: InventoryItem): InventoryItem {
  return UpdateInventoryItemUseCase(item, { equipped: !item.equipped })
}

interface InventoryItemImageInput {
  alt?: string
  fileName?: string
  imageUrl: string
}

export function SetInventoryItemImageUseCase(item: InventoryItem, input: InventoryItemImageInput): InventoryItem {
  return UpdateInventoryItemUseCase(item, {
    imageUrl: input.imageUrl,
    imagePath: input.fileName ? `${item.characterId}/${item.id}/${input.fileName}` : item.imagePath,
    imageAlt: input.alt ?? `Imagen de ${item.name}`,
  })
}

export function RemoveInventoryItemImageUseCase(item: InventoryItem): InventoryItem {
  return UpdateInventoryItemUseCase(item, {
    imageUrl: undefined,
    imagePath: undefined,
    imageAlt: undefined,
  })
}
