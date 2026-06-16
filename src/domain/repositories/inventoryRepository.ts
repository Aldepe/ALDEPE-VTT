import type { ID } from '@domain/entities/common'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'

export interface InventoryRepository {
  listInventory(characterId: ID): Promise<{ containers: InventoryContainer[]; items: InventoryItem[] }>
  createInventoryContainer(container: InventoryContainer): Promise<InventoryContainer>
  updateInventoryContainer(container: InventoryContainer): Promise<InventoryContainer>
  deleteInventoryContainer(containerId: ID): Promise<void>
  createInventoryItem(item: InventoryItem): Promise<InventoryItem>
  updateInventoryItem(item: InventoryItem): Promise<InventoryItem>
  moveInventoryItemToContainer(itemId: ID, containerId?: ID): Promise<InventoryItem>
  toggleInventoryItemEquipped(itemId: ID): Promise<InventoryItem>
}
