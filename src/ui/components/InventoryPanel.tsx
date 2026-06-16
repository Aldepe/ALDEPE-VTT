import { useMemo, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import { Archive, Boxes, CheckCircle2, ImageOff, ImagePlus, Plus, Search, Trash2 } from 'lucide-react'
import type { CharacterCurrency } from '@domain/entities/character'
import type { ID } from '@domain/entities/common'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import {
  CreateInventoryContainerUseCase,
  CreateInventoryItemUseCase,
  MoveInventoryItemToContainerUseCase,
  RemoveInventoryItemImageUseCase,
  SetInventoryItemImageUseCase,
  ToggleInventoryItemEquippedUseCase,
  UpdateInventoryContainerUseCase,
  UpdateInventoryItemUseCase,
} from '@application/use-cases/inventory'
import { fileToDataUrl } from '@shared/utils/fileToDataUrl'
import { CurrencyBar } from './CurrencyBar'
import { EmptyState } from './EmptyState'
import { Field, NumberInput, SelectInput, TextArea, TextInput } from './FormControls'
import { inventoryVisualTheme } from './inventoryVisualTheme'
import { LineIcon } from './LineIcon'
import { rarityTone } from './rarityTone'
import { RarityBadge } from './VisualBadges'

interface InventoryPanelProps {
  canEdit: boolean
  characterId: ID
  containers: InventoryContainer[]
  currency: CharacterCurrency
  items: InventoryItem[]
  onCurrencyChange: (currency: CharacterCurrency) => void
  onDeleteContainer: (containerId: ID) => Promise<void>
  onDeleteItem: (itemId: ID) => Promise<void>
  onSaveContainer: (container: InventoryContainer) => Promise<void>
  onSaveItem: (item: InventoryItem) => Promise<void>
}

function containerName(containers: InventoryContainer[], containerId?: ID): string {
  if (!containerId) {
    return 'Loose inventory'
  }

  return containers.find((container) => container.id === containerId)?.name ?? 'Unknown container'
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

const inventoryBackgroundStyle = {
  '--inventory-background-image': `url("${inventoryVisualTheme.backgroundImageUrl}")`,
} as CSSProperties

export function InventoryPanel({
  canEdit,
  characterId,
  containers,
  currency,
  items,
  onCurrencyChange,
  onDeleteContainer,
  onDeleteItem,
  onSaveContainer,
  onSaveItem,
}: InventoryPanelProps) {
  const [viewMode, setViewMode] = useState<'containers' | 'flat'>('containers')
  const [query, setQuery] = useState('')
  const [selectedContainerId, setSelectedContainerId] = useState<ID | 'loose' | undefined>(containers[0]?.id ?? 'loose')
  const [selectedItemId, setSelectedItemId] = useState<ID | undefined>(items[0]?.id)

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return items.filter((item) =>
      normalizedQuery
        ? `${item.name} ${item.type} ${item.rarity} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(normalizedQuery)
        : true,
    )
  }, [items, query])

  const selectedContainer =
    selectedContainerId && selectedContainerId !== 'loose'
      ? containers.find((container) => container.id === selectedContainerId)
      : undefined
  const selectedItem = items.find((item) => item.id === selectedItemId)
  const looseItems = filteredItems.filter((item) => !item.containerId)
  const visibleItems =
    viewMode === 'flat'
      ? filteredItems
      : filteredItems.filter((item) =>
          selectedContainerId === 'loose' ? !item.containerId : item.containerId === selectedContainerId,
        )

  async function createContainer() {
    const container = CreateInventoryContainerUseCase(characterId, containers.length + 1)
    await onSaveContainer(container)
    setSelectedContainerId(container.id)
  }

  async function createItem(containerId?: ID) {
    const item = CreateInventoryItemUseCase(characterId, containerId)
    await onSaveItem(item)
    setSelectedItemId(item.id)
  }

  async function deleteContainer(container: InventoryContainer) {
    if (window.confirm(`Borrar contenedor "${container.name}"? Los objetos quedaran fuera de contenedor.`)) {
      await onDeleteContainer(container.id)
      setSelectedContainerId('loose')
    }
  }

  async function deleteItem(item: InventoryItem) {
    if (window.confirm(`Borrar item "${item.name}"?`)) {
      await onDeleteItem(item.id)
      setSelectedItemId(undefined)
    }
  }

  async function patchContainer(container: InventoryContainer, patch: Partial<InventoryContainer>) {
    await onSaveContainer(UpdateInventoryContainerUseCase(container, patch))
  }

  async function patchItem(item: InventoryItem, patch: Partial<InventoryItem>) {
    await onSaveItem(UpdateInventoryItemUseCase(item, patch))
  }

  async function moveItem(item: InventoryItem, containerId: string) {
    await onSaveItem(MoveInventoryItemToContainerUseCase(item, containerId === 'loose' ? undefined : containerId))
  }

  async function uploadItemImage(item: InventoryItem, event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) {
      return
    }

    const imageUrl = await fileToDataUrl(file)
    await onSaveItem(SetInventoryItemImageUseCase(item, { imageUrl, fileName: file.name, alt: `Imagen de ${item.name}` }))
    input.value = ''
  }

  return (
    <div
      aria-description={inventoryVisualTheme.backgroundDescription}
      className="inventory-panel inventory-visual-shell"
      style={inventoryBackgroundStyle}
    >
      <div className="panel-heading">
        <div>
          <h3>Inventario</h3>
          <p>Contenedores, equipo, objetos personalizados y monedas.</p>
        </div>
        {canEdit ? (
          <div className="inline-actions">
            <button className="ghost-button" onClick={createContainer} type="button">
              <Boxes size={15} aria-hidden="true" />
              Contenedor
            </button>
            <button className="primary-button" onClick={() => createItem(selectedContainerId === 'loose' ? undefined : selectedContainerId)} type="button">
              <Plus size={15} aria-hidden="true" />
              Item
            </button>
          </div>
        ) : null}
      </div>

      <div className="inventory-toolbar">
        <CurrencyBar canEdit={canEdit} currency={currency} onChange={onCurrencyChange} />
        <div className="segmented" role="group" aria-label="Vista de inventario">
          <button className={viewMode === 'containers' ? 'is-active' : ''} onClick={() => setViewMode('containers')} type="button">
            <Archive size={15} aria-hidden="true" />
            Contenedores
          </button>
          <button className={viewMode === 'flat' ? 'is-active' : ''} onClick={() => setViewMode('flat')} type="button">
            <Boxes size={15} aria-hidden="true" />
            Plano
          </button>
        </div>
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Buscar inventario</span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar objetos" value={query} />
        </label>
      </div>

      <div className="inventory-layout">
        <aside className="container-list">
          {viewMode === 'containers' ? (
            <>
              <button
                className={selectedContainerId === 'loose' ? 'container-card is-active' : 'container-card'}
                onClick={() => setSelectedContainerId('loose')}
                type="button"
              >
                <strong>Loose inventory</strong>
                <small>{looseItems.length} item(s) fuera de contenedor</small>
              </button>
              {containers
                .slice()
                .sort((left, right) => left.sortOrder - right.sortOrder)
                .map((container) => {
                  const count = filteredItems.filter((item) => item.containerId === container.id).length
                  return (
                    <button
                      className={selectedContainerId === container.id ? 'container-card is-active' : 'container-card'}
                      key={container.id}
                      onClick={() => setSelectedContainerId(container.id)}
                      type="button"
                    >
                      <strong>{container.name}</strong>
                      <small>{count} item(s)</small>
                      {container.description ? <span>{container.description}</span> : null}
                    </button>
                  )
                })}
            </>
          ) : (
            <div className="flat-hint">
              <strong>Vista plana</strong>
              <span>{filteredItems.length} objetos encontrados</span>
            </div>
          )}
        </aside>

        <section className="item-list">
          {visibleItems.length ? (
            visibleItems.map((item) => (
              <button
                className={selectedItemId === item.id ? `item-card is-active rarity-${rarityTone(item.rarity)}` : `item-card rarity-${rarityTone(item.rarity)}`}
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                type="button"
              >
                <span className="item-card-image" aria-hidden="true">
                  {item.imageUrl ? <img alt="" src={item.imageUrl} /> : <Archive size={24} />}
                </span>
                <span className="item-card-top">
                  <strong>{item.name}</strong>
                  {item.equipped ? <CheckCircle2 size={17} aria-hidden="true" /> : null}
                </span>
                <span className="item-card-badges">
                  <RarityBadge rarity={item.rarity} />
                  <small>{item.type}</small>
                </span>
                <span>In {containerName(containers, item.containerId)}</span>
                <em>Qty {item.quantity} - {item.weight} lb</em>
              </button>
            ))
          ) : (
            <EmptyState icon={<Archive size={30} />} message="No hay objetos en esta vista." title="Inventario vacío" />
          )}
        </section>

        <section className="inventory-inspector">
          {selectedContainer && viewMode === 'containers' ? (
            <div className="inventory-editor">
              <div className="panel-heading">
                <h4>Contenedor</h4>
                {canEdit ? (
                  <button className="icon-button danger" onClick={() => deleteContainer(selectedContainer)} title="Borrar contenedor" type="button">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {canEdit ? (
                <fieldset>
                  <Field label="Nombre">
                    <TextInput onChange={(event) => patchContainer(selectedContainer, { name: event.target.value })} value={selectedContainer.name} />
                  </Field>
                  <Field label="Descripcion">
                    <TextArea onChange={(event) => patchContainer(selectedContainer, { description: event.target.value })} value={selectedContainer.description} />
                  </Field>
                  <div className="form-grid compact">
                    <Field label="Peso propio">
                      <NumberInput onChange={(event) => patchContainer(selectedContainer, { weight: Number(event.target.value) })} value={selectedContainer.weight ?? 0} />
                    </Field>
                    <Field label="Orden">
                      <NumberInput onChange={(event) => patchContainer(selectedContainer, { sortOrder: Number(event.target.value) })} value={selectedContainer.sortOrder} />
                    </Field>
                  </div>
                </fieldset>
              ) : (
                <div className="readonly-inventory-detail">
                  <strong>{selectedContainer.name}</strong>
                  <p>{selectedContainer.description || 'Sin descripcion'}</p>
                  <span>Peso propio: {selectedContainer.weight ?? 0} lb</span>
                </div>
              )}
            </div>
          ) : null}

          {selectedItem ? (
            <div className="inventory-editor item-editor">
              <div className="panel-heading">
                <h4>Ficha de objeto</h4>
                <RarityBadge rarity={selectedItem.rarity} />
                {canEdit ? (
                  <button className="icon-button danger" onClick={() => deleteItem(selectedItem)} title="Borrar item" type="button">
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              {canEdit ? (
                <fieldset>
                  <div className="item-image-editor">
                    <div className="item-image-preview">
                      {selectedItem.imageUrl ? (
                        <img alt={selectedItem.imageAlt || selectedItem.name} src={selectedItem.imageUrl} />
                      ) : (
                        <div className="item-image-placeholder">
                          <ImageOff size={30} aria-hidden="true" />
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="inline-actions">
                      <label className="ghost-button image-upload-button">
                        <ImagePlus size={15} aria-hidden="true" />
                        Cambiar imagen
                        <input accept="image/*" onChange={(event) => uploadItemImage(selectedItem, event)} type="file" />
                      </label>
                      {selectedItem.imageUrl ? (
                        <button className="ghost-button" onClick={() => onSaveItem(RemoveInventoryItemImageUseCase(selectedItem))} type="button">
                          Quitar
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <Field label="Name">
                    <TextInput onChange={(event) => patchItem(selectedItem, { name: event.target.value })} value={selectedItem.name} />
                  </Field>
                  <div className="form-grid compact">
                    <Field label="Type">
                      <TextInput onChange={(event) => patchItem(selectedItem, { type: event.target.value })} value={selectedItem.type} />
                    </Field>
                    <Field label="Rarity">
                      <TextInput onChange={(event) => patchItem(selectedItem, { rarity: event.target.value })} value={selectedItem.rarity} />
                    </Field>
                    <Field label="Container / Location">
                      <SelectInput onChange={(event) => moveItem(selectedItem, event.target.value)} value={selectedItem.containerId ?? 'loose'}>
                        <option value="loose">Loose inventory</option>
                        {containers.map((container) => (
                          <option key={container.id} value={container.id}>
                            {container.name}
                          </option>
                        ))}
                      </SelectInput>
                    </Field>
                    <Field label="Quantity">
                      <NumberInput min={0} onChange={(event) => patchItem(selectedItem, { quantity: Number(event.target.value) })} value={selectedItem.quantity} />
                    </Field>
                    <Field label="Weight">
                      <NumberInput min={0} onChange={(event) => patchItem(selectedItem, { weight: Number(event.target.value) })} step={0.1} value={selectedItem.weight} />
                    </Field>
                    <Field label="Cost">
                      <TextInput onChange={(event) => patchItem(selectedItem, { cost: event.target.value })} value={selectedItem.cost} />
                    </Field>
                    <Field label="Source">
                      <TextInput onChange={(event) => patchItem(selectedItem, { source: event.target.value })} value={selectedItem.source} />
                    </Field>
                    <Field label="Tags">
                      <TextInput onChange={(event) => patchItem(selectedItem, { tags: parseTags(event.target.value) })} value={selectedItem.tags.join(', ')} />
                    </Field>
                  </div>
                  <div className="inline-actions">
                    <label className="check-row inventory-toggle">
                      <input
                        checked={selectedItem.requiresAttunement}
                        onChange={(event) => patchItem(selectedItem, { requiresAttunement: event.target.checked })}
                        type="checkbox"
                      />
                      Requires attunement
                    </label>
                    <button className="ghost-button" onClick={() => onSaveItem(ToggleInventoryItemEquippedUseCase(selectedItem))} type="button">
                      {selectedItem.equipped ? 'Unequip' : 'Equip'}
                    </button>
                  </div>
                  <Field label="Description">
                    <TextArea onChange={(event) => patchItem(selectedItem, { description: event.target.value })} value={selectedItem.description} />
                  </Field>
                  <Field label="Notes / Customize">
                    <TextArea onChange={(event) => patchItem(selectedItem, { notes: event.target.value })} value={selectedItem.notes} />
                  </Field>
                </fieldset>
              ) : (
                <div className="readonly-inventory-detail item-readonly-detail">
                  <div className="item-image-preview">
                    {selectedItem.imageUrl ? (
                      <img alt={selectedItem.imageAlt || selectedItem.name} src={selectedItem.imageUrl} />
                    ) : (
                      <div className="item-image-placeholder">
                        <ImageOff size={30} aria-hidden="true" />
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="readonly-chip-list">
                    <span className="readonly-chip"><LineIcon className="chip-line-icon" label="Tipo" name="tag" />{selectedItem.type}</span>
                    <span className="readonly-chip"><LineIcon className="chip-line-icon" label="Contenedor" name="container" />{containerName(containers, selectedItem.containerId)}</span>
                    {selectedItem.equipped ? <span className="readonly-chip"><LineIcon className="chip-line-icon" label="Equipado" name="check" />Equipped</span> : null}
                    {selectedItem.requiresAttunement ? <span className="readonly-chip"><LineIcon className="chip-line-icon" label="Attunement" name="attunement" />Attunement</span> : null}
                  </div>
                  <div className="readonly-stat-grid">
                    <span>Qty <strong>{selectedItem.quantity}</strong></span>
                    <span>Weight <strong>{selectedItem.weight} lb</strong></span>
                    <span>Cost <strong>{selectedItem.cost || '-'}</strong></span>
                    <span>Source <strong>{selectedItem.source || '-'}</strong></span>
                  </div>
                  <p>{selectedItem.description || 'Sin descripcion'}</p>
                  {selectedItem.notes ? <p className="note-strip">{selectedItem.notes}</p> : null}
                  {selectedItem.tags.length ? (
                    <div className="readonly-chip-list">
                      {selectedItem.tags.map((tag) => <span className="readonly-chip" key={tag}><LineIcon className="chip-line-icon" label="Tag" name="tag" />{tag}</span>)}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
