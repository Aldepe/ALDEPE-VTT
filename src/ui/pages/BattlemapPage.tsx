import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  BrickWall,
  Circle,
  Copy,
  Crosshair,
  Eraser,
  Eye,
  EyeOff,
  Hand,
  ImagePlus,
  Layers,
  Lock,
  Move,
  MousePointer2,
  RotateCw,
  Ruler,
  Square,
  Swords,
  Trash2,
  Triangle,
  Unlock,
  User,
} from 'lucide-react'
import clsx from 'clsx'
import type {
  BattleArea,
  BattleAreaType,
  BattleMap,
  Drawing,
  MapAsset,
  MapAssetType,
  PlacementMode,
  Token,
  TurnEntry,
  TurnOrder,
} from '@domain/entities/battlemap'
import type { Campaign, CampaignMember, Visibility } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import {
  canDeleteMap,
  canEditBattleArea,
  canEditMapAsset,
  canEditToken,
  isDmOnlyVisibility,
} from '@domain/services/permissions'
import { sortTurnEntries } from '@domain/services/battlemapGeometry'
import { RotateBattleAreaUseCase, UpdateBattleAreaUseCase } from '@application/use-cases/battleAreas'
import { createBlankMap, createEmptyTurnOrder } from '@application/use-cases/workspaceFactories'
import {
  CreatePlayerAreaUseCase,
  CreateMonsterTokenUseCase,
  CreatePlayerTokenUseCase,
  DeleteOwnPlayerAreaUseCase,
  DeleteMonsterTokenUseCase,
  DuplicateMapAreaForMemberUseCase,
  DuplicateTokenUseCase,
  ListDmMapElementsUseCase,
  ListVisibleMapElementsUseCase,
  MoveOwnPlayerTokenUseCase,
  NormalizeTokenUseCase,
  SetOwnInitiativeUseCase,
  SetTokenVisibilityUseCase,
  UpdatePlayerAreaUseCase,
  UpdateMonsterTokenUseCase,
  UpdatePlayerTokenUseCase,
  ValidateBattlemapPermissionsUseCase,
} from '@application/use-cases/battlemapTokens'
import { conditionOptions } from '@shared/constants/dnd'
import { getMapAssetDefinition, mapAssetDefinitions } from '@shared/constants/mapAssets'
import { fileToDataUrl } from '@shared/utils/fileToDataUrl'
import { createId } from '@shared/utils/id'
import { Field, NumberInput, SelectInput, TextArea, TextInput } from '@ui/components/FormControls'
import { BattlemapCanvas, type BattleTool } from '@ui/components/BattlemapCanvas'
import { EmptyState } from '@ui/components/EmptyState'

interface BattlemapPageProps {
  battleAreas: BattleArea[]
  campaign: Campaign
  characters: Character[]
  drawings: Drawing[]
  isDm: boolean
  mapAssets: MapAsset[]
  maps: BattleMap[]
  onDeleteBattleArea: (areaId: string) => Promise<void>
  onDeleteMap: (mapId: string) => Promise<void>
  onDeleteMapAsset: (assetId: string) => Promise<void>
  onDeleteToken: (tokenId: string) => Promise<void>
  onSaveBattleArea: (area: BattleArea) => Promise<void>
  onSaveMap: (map: BattleMap) => Promise<void>
  onSaveMapAsset: (asset: MapAsset) => Promise<void>
  onSaveToken: (token: Token) => Promise<void>
  onSaveTurnOrder: (turnOrder: TurnOrder) => Promise<void>
  selectedCharacter?: Character
  tokens: Token[]
  turnOrders: TurnOrder[]
  viewerMember: CampaignMember
}

const toolButtons: Array<{ id: BattleTool; label: string; icon: typeof Hand }> = [
  { id: 'pan', label: 'Pan', icon: Hand },
  { id: 'select', label: 'Seleccionar/mover', icon: Move },
  { id: 'measure', label: 'Medir persistente', icon: Ruler },
  { id: 'circle', label: 'Circulo', icon: Circle },
  { id: 'cone', label: 'Cono', icon: Triangle },
  { id: 'square', label: 'Cubo', icon: Square },
  { id: 'line', label: 'Linea', icon: Crosshair },
  { id: 'erase', label: 'Borrar area', icon: Eraser },
]

const placementModes: Array<{ id: PlacementMode; label: string }> = [
  { id: 'free', label: 'Libre' },
  { id: 'cell-center', label: 'Centro' },
  { id: 'grid-intersection', label: 'Esquinas' },
]

type BattlemapMode = 'use' | 'edit'
type PlacementLayer = 'tokens' | 'areas' | 'assets' | 'dm'
type BattleSidePanel = 'combat' | 'layers' | 'tokens' | 'areas' | 'assets' | 'map'

const placementLayers: Array<{ id: PlacementLayer; label: string }> = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'areas', label: 'Areas y medidas' },
  { id: 'assets', label: 'Assets tacticos' },
  { id: 'dm', label: 'Capa DM' },
]

const battleSidePanels: Array<{ id: BattleSidePanel; label: string }> = [
  { id: 'combat', label: 'Combate' },
  { id: 'layers', label: 'Capas' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'areas', label: 'Areas' },
  { id: 'assets', label: 'Assets' },
  { id: 'map', label: 'Mapa' },
]

function visibilityLabel(visibility: Visibility): string {
  return isDmOnlyVisibility(visibility) ? 'Solo DM' : 'Visible'
}

function nextVisibility(visibility: Visibility): Visibility {
  return isDmOnlyVisibility(visibility) ? 'public' : 'dm_only'
}

function formatInitiativeBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

function ensureTurnOrder(mapId: string, turnOrders: TurnOrder[]): TurnOrder {
  return turnOrders.find((turnOrder) => turnOrder.mapId === mapId) ?? createEmptyTurnOrder(mapId)
}

function updateAreaPoint(area: BattleArea, field: 'start' | 'end', axis: 'x' | 'y', value: number, userId: string): BattleArea {
  return UpdateBattleAreaUseCase(area, { [field]: { ...area[field], [axis]: value } }, userId)
}

function updateAreaSize(area: BattleArea, patch: Partial<Pick<BattleArea, 'width' | 'height' | 'radius' | 'length'>>, userId: string): BattleArea {
  if (patch.radius !== undefined || patch.length !== undefined) {
    const length = patch.radius ?? patch.length ?? area.length
    return UpdateBattleAreaUseCase(area, { end: { x: area.start.x + length, y: area.start.y } }, userId)
  }

  return UpdateBattleAreaUseCase(
    area,
    {
      end: {
        x: area.start.x + (patch.width ?? area.width),
        y: area.start.y + (patch.height ?? area.height),
      },
    },
    userId,
  )
}

export function BattlemapPage({
  battleAreas,
  campaign,
  characters,
  drawings,
  isDm,
  mapAssets,
  maps,
  onDeleteBattleArea,
  onDeleteMap,
  onDeleteMapAsset,
  onDeleteToken,
  onSaveBattleArea,
  onSaveMap,
  onSaveMapAsset,
  onSaveToken,
  onSaveTurnOrder,
  selectedCharacter,
  tokens,
  turnOrders,
  viewerMember,
}: BattlemapPageProps) {
  const activeMap = maps.find((map) => map.id === campaign.activeMapId) ?? maps[0]
  const [selectedMapId, setSelectedMapId] = useState<string | undefined>(activeMap?.id)
  const map = maps.find((item) => item.id === selectedMapId) ?? activeMap
  const [activeTool, setActiveTool] = useState<BattleTool>('pan')
  const [selectedAssetType, setSelectedAssetType] = useState<MapAssetType>('wall')
  const [battlemapMode, setBattlemapMode] = useState<BattlemapMode>('use')
  const [sidePanel, setSidePanel] = useState<BattleSidePanel>('combat')
  const [placementLayer, setPlacementLayer] = useState<PlacementLayer>('tokens')
  const [color, setColor] = useState('#22f0c8')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [placementMode, setPlacementMode] = useState<PlacementMode>('free')
  const [measureLabel, setMeasureLabel] = useState('0 ft')
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>()
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>()
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>()
  const [selectedPlayerTokenCharacterId, setSelectedPlayerTokenCharacterId] = useState('')
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number; nonce: number } | undefined>()
  const [newTurnName, setNewTurnName] = useState('')
  const [newTurnInitiative, setNewTurnInitiative] = useState(10)
  const [initiativeRoll, setInitiativeRoll] = useState(10)
  const [battleFeedback, setBattleFeedback] = useState('Battlemap listo.')

  const mapTokens = useMemo(
    () => tokens
      .filter((token) => token.mapId === map?.id)
      .map(NormalizeTokenUseCase)
      .map((token) => {
        if (token.kind !== 'player' || token.image.url) {
          return token
        }

        const character = characters.find((candidate) => candidate.id === (token.ownerCharacterId ?? token.characterId))
        return character?.portrait.url ? { ...token, image: { ...character.portrait, alt: character.portrait.alt || token.name } } : token
      }),
    [characters, map?.id, tokens],
  )
  const mapDrawings = useMemo(() => drawings.filter((drawing) => drawing.mapId === map?.id), [drawings, map?.id])
  const mapAreas = useMemo(() => battleAreas.filter((area) => area.mapId === map?.id), [battleAreas, map?.id])
  const assets = useMemo(() => mapAssets.filter((asset) => asset.mapId === map?.id), [map?.id, mapAssets])
  const visibleTokens = ListVisibleMapElementsUseCase(mapTokens, viewerMember)
  const visibleAreas = ListVisibleMapElementsUseCase(mapAreas, viewerMember)
  const visibleAssets = ListVisibleMapElementsUseCase(assets, viewerMember)
  const dmLayerTokens = ListDmMapElementsUseCase(mapTokens, viewerMember)
  const dmLayerAreas = ListDmMapElementsUseCase(mapAreas, viewerMember)
  const dmLayerAssets = ListDmMapElementsUseCase(assets, viewerMember)
  const availablePlayerTokenCharacters = useMemo(() => {
    const characterIdsOnMap = new Set(
      mapTokens
        .filter((token) => token.kind === 'player')
        .flatMap((token) => [token.ownerCharacterId, token.characterId])
        .filter(Boolean),
    )

    return characters.filter((character) => !characterIdsOnMap.has(character.id))
  }, [characters, mapTokens])
  const playerTokenCharacterId = selectedPlayerTokenCharacterId || availablePlayerTokenCharacters[0]?.id || ''
  const selectedPlayerTokenCharacter = availablePlayerTokenCharacters.find((character) => character.id === playerTokenCharacterId)
  const selectedToken = mapTokens.find((token) => token.id === selectedTokenId)
  const selectedArea = mapAreas.find((area) => area.id === selectedAreaId)
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId)
  const turnOrder = map ? ensureTurnOrder(map.id, turnOrders) : undefined
  const ownToken = mapTokens.find((token) => token.ownerCharacterId === viewerMember.characterId)
  const permissionSummary = ValidateBattlemapPermissionsUseCase(viewerMember, ownToken)
  const initiativeBonus = selectedCharacter?.initiativeBonus ?? 0
  const initiativeTotal = initiativeRoll + initiativeBonus
  const isEditingMap = isDm && battlemapMode === 'edit'
  const gridColumns = map ? Math.max(1, Math.round(map.width / map.gridSize)) : 1
  const gridRows = map ? Math.max(1, Math.round(map.height / map.gridSize)) : 1
  const availableTools = toolButtons.filter((tool) => {
    if (tool.id === 'measure' || tool.id === 'circle' || tool.id === 'cone' || tool.id === 'square' || tool.id === 'line' || tool.id === 'erase') {
      return permissionSummary.canDrawAreas
    }

    return true
  })

  function changeBattlemapMode(mode: BattlemapMode) {
    setBattlemapMode(mode)

    if (mode === 'use') {
      setActiveTool('pan')
      setSidePanel('combat')
      return
    }

    setSidePanel('layers')
  }

  async function createMap() {
    const nextMap = createBlankMap(campaign.id)
    await onSaveMap({ ...nextMap, isActive: maps.length === 0 })
    setSelectedMapId(nextMap.id)
  }

  async function setMapActive(nextMap: BattleMap) {
    await onSaveMap({ ...nextMap, isActive: true })
  }

  async function setMapHidden(nextMap: BattleMap) {
    await onSaveMap({ ...nextMap, isActive: false })
  }

  async function updateGridColumns(columns: number) {
    if (!map) {
      return
    }

    await onSaveMap({ ...map, width: Math.max(1, columns) * map.gridSize })
  }

  async function updateGridRows(rows: number) {
    if (!map) {
      return
    }

    await onSaveMap({ ...map, height: Math.max(1, rows) * map.gridSize })
  }

  async function updateGridSize(gridSize: number) {
    if (!map) {
      return
    }

    const nextGridSize = Math.max(16, gridSize)
    await onSaveMap({
      ...map,
      gridSize: nextGridSize,
      width: gridColumns * nextGridSize,
      height: gridRows * nextGridSize,
    })
  }

  function selectPlacementLayer(layer: PlacementLayer) {
    setPlacementLayer(layer)

    if (layer === 'tokens') {
      setActiveTool('select')
    }

    if (layer === 'areas') {
      setActiveTool('measure')
      setVisibility('public')
    }

    if (layer === 'assets') {
      setActiveTool(selectedAssetType)
      setVisibility('public')
    }

    if (layer === 'dm') {
      setActiveTool('select')
      setVisibility('dm_only')
    }
  }

  async function deleteCurrentMap() {
    if (!map || !canDeleteMap(viewerMember)) {
      return
    }

    if (!window.confirm(`Borrar mapa "${map.name}" y todos sus tokens, areas, assets e iniciativas?`)) {
      return
    }

    const nextMapId = maps.find((item) => item.id !== map.id)?.id
    await onDeleteMap(map.id)
    setSelectedMapId(nextMapId)
    setSelectedAreaId(undefined)
    setSelectedAssetId(undefined)
    setSelectedTokenId(undefined)
  }

  async function uploadMapBackground(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !map) {
      return
    }

    const url = await fileToDataUrl(file)
    await onSaveMap({ ...map, background: { url, alt: map.name } })
  }

  async function addMonsterToken() {
    if (!map) {
      return
    }

    const token = CreateMonsterTokenUseCase(map.id, viewerMember)
    await onSaveToken(token)
    setSelectedTokenId(token.id)
    setSelectedAreaId(undefined)
    setBattleFeedback('Monstruo creado.')
  }

  async function addPlayerToken() {
    if (!map || !selectedPlayerTokenCharacter) {
      return
    }

    const playerTokenCount = mapTokens.filter((token) => token.kind === 'player').length
    const token = CreatePlayerTokenUseCase(map.id, selectedPlayerTokenCharacter, viewerMember, {
      x: 210 + playerTokenCount * 42,
      y: 210 + playerTokenCount * 42,
    })
    await onSaveToken(token)
    setSelectedTokenId(token.id)
    setSelectedAreaId(undefined)
    setSelectedPlayerTokenCharacterId('')
    setBattleFeedback(`Token de ${selectedPlayerTokenCharacter.name} creado.`)
  }

  async function patchToken(token: Token, patch: Partial<Token>) {
    const nextToken = token.kind === 'player'
      ? UpdatePlayerTokenUseCase(token, patch, viewerMember)
      : UpdateMonsterTokenUseCase(token, patch, viewerMember)
    await onSaveToken(nextToken)
  }

  async function patchTokenStats(token: Token, patch: Partial<Token['stats']>) {
    await patchToken(token, { stats: { ...token.stats, ...patch } })
  }

  async function toggleCondition(token: Token, condition: string) {
    await patchToken(token, {
      conditions: token.conditions.includes(condition)
        ? token.conditions.filter((item) => item !== condition)
        : [...token.conditions, condition],
    })
  }

  async function uploadTokenImage(token: Token, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const url = await fileToDataUrl(file)
    await patchToken(token, { image: { url, alt: token.name } })
  }

  async function deleteToken(token: Token) {
    if (!turnOrder || !window.confirm(`Borrar token "${token.name}"?`)) {
      return
    }

    const result = DeleteMonsterTokenUseCase(mapTokens, turnOrder, token.id, viewerMember)
    await onSaveTurnOrder(result.turnOrder)
    await onDeleteToken(token.id)
    setSelectedTokenId(undefined)
    setBattleFeedback(result.feedback)
  }

  async function duplicateToken(token: Token) {
    const copy = DuplicateTokenUseCase(token, viewerMember)
    await onSaveToken(copy)
    setSelectedTokenId(copy.id)
    setBattleFeedback(`${token.name} duplicado.`)
  }

  function centerOnToken(token: Token) {
    setFocusPoint((current) => ({ x: token.x, y: token.y, nonce: (current?.nonce ?? 0) + 1 }))
    setSelectedTokenId(token.id)
  }

  async function submitOwnInitiative() {
    if (!turnOrder || !ownToken) {
      return
    }

    const nextTurnOrder = SetOwnInitiativeUseCase(ownToken, turnOrder, initiativeTotal, viewerMember)
    await onSaveTurnOrder(nextTurnOrder)
    await onSaveToken({ ...ownToken, stats: { ...ownToken.stats, initiative: initiativeTotal } })
    setBattleFeedback(`Has sacado ${initiativeRoll} + ${initiativeBonus >= 0 ? `+${initiativeBonus}` : initiativeBonus} = ${initiativeTotal}.`)
  }

  async function toggleTokenTurnOrder(token: Token) {
    if (!turnOrder || !canEditToken(viewerMember, token)) {
      return
    }

    const entryId = `turn_${token.id}`
    const exists = turnOrder.entries.some((entry) => entry.tokenId === token.id || entry.id === entryId)
    const entries = exists
      ? turnOrder.entries.filter((entry) => entry.tokenId !== token.id && entry.id !== entryId)
      : sortTurnEntries([
          ...turnOrder.entries,
          {
            id: entryId,
            tokenId: token.id,
            name: token.name,
            initiative: token.stats.initiative,
            kind: token.kind,
            visibility: token.visibility,
          },
        ])
    await onSaveTurnOrder({ ...turnOrder, entries, currentIndex: entries.length ? Math.min(turnOrder.currentIndex, entries.length - 1) : 0 })
    await patchToken(token, { isInTurnOrder: !exists })
    setBattleFeedback(exists ? `${token.name} fuera del turn order.` : `${token.name} en turn order.`)
  }

  async function toggleTokenVisibility(token: Token) {
    const nextToken = SetTokenVisibilityUseCase(token, nextVisibility(token.visibility), viewerMember)
    await onSaveToken(nextToken)
    setBattleFeedback(`${token.name}: ${visibilityLabel(nextToken.visibility)}.`)
  }

  async function patchArea(area: BattleArea, patch: Partial<BattleArea>) {
    await onSaveBattleArea(UpdatePlayerAreaUseCase(area, patch, viewerMember))
  }

  async function deleteArea(area: BattleArea) {
    if (window.confirm(`Borrar el area "${area.name || area.type}"?`)) {
      DeleteOwnPlayerAreaUseCase(mapAreas, area.id, viewerMember)
      await onDeleteBattleArea(area.id)
      setSelectedAreaId(undefined)
      setBattleFeedback('Area borrada.')
    }
  }

  async function duplicateArea(area: BattleArea) {
    const copy = DuplicateMapAreaForMemberUseCase(area, viewerMember)
    await onSaveBattleArea(copy)
    setSelectedAreaId(copy.id)
    setBattleFeedback('Area duplicada.')
  }

  async function centerOnArea(area: BattleArea) {
    setFocusPoint((current) => ({ x: area.start.x, y: area.start.y, nonce: (current?.nonce ?? 0) + 1 }))
    setSelectedAreaId(area.id)
  }

  async function patchAsset(asset: MapAsset, patch: Partial<MapAsset>) {
    if (!canEditMapAsset(viewerMember, asset)) {
      return
    }

    await onSaveMapAsset({ ...asset, ...patch })
  }

  async function deleteAsset(asset: MapAsset) {
    if (canEditMapAsset(viewerMember, asset) && window.confirm(`Borrar asset "${asset.label}"?`)) {
      await onDeleteMapAsset(asset.id)
      setSelectedAssetId(undefined)
      setBattleFeedback('Asset borrado.')
    }
  }

  async function addTurnEntry() {
    if (!turnOrder || !newTurnName.trim()) {
      return
    }

    const nextEntry: TurnEntry = {
      id: createId('turn'),
      name: newTurnName.trim(),
      initiative: newTurnInitiative,
      kind: 'monster',
    }
    await onSaveTurnOrder({ ...turnOrder, entries: sortTurnEntries([...turnOrder.entries, nextEntry]) })
    setNewTurnName('')
  }

  async function syncTokensToTurnOrder() {
    if (!turnOrder) {
      return
    }

    const entries = mapTokens.filter((token) => token.active && token.isInTurnOrder).map<TurnEntry>((token) => ({
      id: `turn_${token.id}`,
      tokenId: token.id,
      name: token.name,
      initiative: token.stats.initiative,
      kind: token.kind,
      visibility: token.visibility,
      locked: token.isLocked,
    }))
    await onSaveTurnOrder({ ...turnOrder, entries: sortTurnEntries(entries), currentIndex: 0 })
  }

  async function advanceTurn() {
    if (!turnOrder || !turnOrder.entries.length) {
      return
    }

    const nextIndex = (turnOrder.currentIndex + 1) % turnOrder.entries.length
    await onSaveTurnOrder({
      ...turnOrder,
      currentIndex: nextIndex,
      round: nextIndex === 0 ? turnOrder.round + 1 : turnOrder.round,
    })
  }

  function selectToken(token: Token) {
    setSelectedTokenId(token.id)
    setSelectedAreaId(undefined)
    setSelectedAssetId(undefined)
    if (isEditingMap) {
      setSidePanel('tokens')
    }
  }

  function selectArea(area: BattleArea) {
    setSelectedAreaId(area.id)
    setSelectedAssetId(undefined)
    setSelectedTokenId(undefined)
    if (isEditingMap) {
      setSidePanel('areas')
    }
  }

  function selectAsset(asset: MapAsset) {
    setSelectedAssetId(asset.id)
    setSelectedAreaId(undefined)
    setSelectedTokenId(undefined)
    if (isEditingMap) {
      setSidePanel('assets')
    }
  }

  function renderTokenLayerItem(token: Token) {
    return (
      <article className={clsx('layer-row', selectedTokenId === token.id && 'is-active')} key={token.id}>
        <button onClick={() => selectToken(token)} type="button">
          <User size={15} aria-hidden="true" />
          <span>
            <strong>{token.name}</strong>
            <small>{token.kind} - HP {token.stats.currentHp}/{token.stats.maxHp} - {visibilityLabel(token.visibility)}</small>
          </span>
        </button>
        <div className="inline-actions">
          <button className="icon-button" onClick={() => centerOnToken(token)} title="Centrar token" type="button">
            <Crosshair size={15} />
          </button>
          <button className="icon-button" onClick={() => void toggleTokenTurnOrder(token)} title="Turn order" type="button">
            <Swords size={15} className={token.isInTurnOrder ? 'accented-icon' : undefined} />
          </button>
          <button className="icon-button" onClick={() => void toggleTokenVisibility(token)} title="Cambiar visibilidad" type="button">
            {isDmOnlyVisibility(token.visibility) ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          {token.kind !== 'player' ? (
            <>
              <button className="icon-button" onClick={() => void duplicateToken(token)} title="Duplicar token" type="button">
                <Copy size={15} />
              </button>
              <button className="icon-button danger" onClick={() => void deleteToken(token)} title="Borrar token" type="button">
                <Trash2 size={15} />
              </button>
            </>
          ) : null}
        </div>
      </article>
    )
  }

  function renderAreaLayerItem(area: BattleArea) {
    return (
      <article className={clsx('layer-row', selectedAreaId === area.id && 'is-active')} key={area.id}>
        <button onClick={() => selectArea(area)} type="button">
          <span className="area-color" style={{ background: area.color }} />
          <span>
            <strong>{area.name || area.type}</strong>
            <small>{area.type} - {area.locked ? 'Bloqueada' : 'Editable'} - {visibilityLabel(area.visibility)}</small>
          </span>
        </button>
        <div className="inline-actions">
          <button className="icon-button" onClick={() => void centerOnArea(area)} title="Centrar area" type="button">
            <Crosshair size={15} />
          </button>
          <button className="icon-button" onClick={() => void duplicateArea(area)} title="Duplicar area" type="button">
            <Copy size={15} />
          </button>
          <button className="icon-button" onClick={() => void patchArea(area, { visibility: nextVisibility(area.visibility) })} title="Cambiar visibilidad" type="button">
            {isDmOnlyVisibility(area.visibility) ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button className="icon-button danger" onClick={() => void deleteArea(area)} title="Borrar area" type="button">
            <Trash2 size={15} />
          </button>
        </div>
      </article>
    )
  }

  function renderAssetLayerItem(asset: MapAsset) {
    return (
      <article className={clsx('layer-row', selectedAssetId === asset.id && 'is-active')} key={asset.id}>
        <button onClick={() => selectAsset(asset)} type="button">
          <span className="asset-icon" style={{ color: asset.color }}>{getMapAssetDefinition(asset.type).icon}</span>
          <span>
            <strong>{asset.label}</strong>
            <small>{getMapAssetDefinition(asset.type).name} - {visibilityLabel(asset.visibility)}</small>
          </span>
        </button>
        <div className="inline-actions">
          <button className="icon-button" onClick={() => {
            setFocusPoint((current) => ({ x: asset.x + asset.width / 2, y: asset.y + asset.height / 2, nonce: (current?.nonce ?? 0) + 1 }))
            selectAsset(asset)
          }} title="Centrar asset" type="button">
            <Crosshair size={15} />
          </button>
          <button className="icon-button" onClick={() => void patchAsset(asset, { visibility: nextVisibility(asset.visibility) })} title="Cambiar visibilidad" type="button">
            {isDmOnlyVisibility(asset.visibility) ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button className="icon-button danger" onClick={() => void deleteAsset(asset)} title="Borrar asset" type="button">
            <Trash2 size={15} />
          </button>
        </div>
      </article>
    )
  }

  if (!map || !turnOrder) {
    return (
      <section className="page-grid battlemap-page">
        <EmptyState icon={<Swords size={32} />} message="Crea un mapa para empezar el combate." title="Sin mapas" />
        {isDm ? (
          <button className="primary-button" onClick={createMap} type="button">
            Crear mapa
          </button>
        ) : null}
      </section>
    )
  }

  return (
    <section className="page-grid battlemap-page" aria-labelledby="battlemap-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">Mesa tactica</p>
          <h2 id="battlemap-title">Battlemap</h2>
          <p>{map.name} - {map.width}x{map.height}px - Grid {map.gridSize}px - Snap: {placementModes.find((mode) => mode.id === placementMode)?.label}</p>
          <span className="battle-feedback-chip" role="status">{battleFeedback}</span>
        </div>
        <div className="toolbar-line">
          <label className="field inline-field">
            <span>Mapa</span>
            <SelectInput onChange={(event) => setSelectedMapId(event.target.value)} value={map.id}>
              {maps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </SelectInput>
          </label>
          {isDm ? (
            <>
              <div className="segmented battle-mode-tabs" role="tablist" aria-label="Modo del battlemap">
                <button className={battlemapMode === 'use' ? 'is-active' : ''} onClick={() => changeBattlemapMode('use')} type="button">Uso</button>
                <button className={battlemapMode === 'edit' ? 'is-active' : ''} onClick={() => changeBattlemapMode('edit')} type="button">Edicion</button>
              </div>
              <button className="ghost-button" onClick={createMap} type="button">Nuevo mapa</button>
              {map.isActive ? (
                <button className="ghost-button" onClick={() => void setMapHidden(map)} type="button">Ocultar a players</button>
              ) : (
                <button className="ghost-button" onClick={() => setMapActive(map)} type="button">Mostrar a players</button>
              )}
            </>
          ) : null}
        </div>
      </header>

      <div className={clsx('battle-layout', !isEditingMap && 'battle-layout-use')}>
        <div className="battle-toolbar" aria-label="Herramientas de mapa">
          {availableTools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                className={clsx('icon-button', activeTool === tool.id && 'is-active')}
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id)
                  if (isEditingMap && (tool.id === 'measure' || tool.id === 'circle' || tool.id === 'cone' || tool.id === 'square' || tool.id === 'line' || tool.id === 'erase')) {
                    setSidePanel('areas')
                  }
                }}
                title={tool.label}
                type="button"
              >
                <Icon size={18} aria-hidden="true" />
              </button>
            )
          })}
          {permissionSummary.canDrawAreas ? (
            <>
              <label className="color-swatch" title="Color de area">
                <span className="sr-only">Color</span>
                <input onChange={(event) => setColor(event.target.value)} type="color" value={color} />
              </label>
              {isDm ? (
                <button className="icon-button" onClick={() => setVisibility(nextVisibility(visibility))} title="Visibilidad" type="button">
                  {visibility === 'public' ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
                </button>
              ) : null}
              <div className="tool-splitter" />
            </>
          ) : null}
          {placementModes.map((mode) => (
            <button
              className={clsx('icon-button text-icon', placementMode === mode.id && 'is-active')}
              key={mode.id}
              onClick={() => setPlacementMode(mode.id)}
              title={`Snap: ${mode.label}`}
              type="button"
            >
              {mode.id === 'free' ? <MousePointer2 size={16} /> : mode.id === 'cell-center' ? <Square size={16} /> : <Crosshair size={16} />}
            </button>
          ))}
          <span className="measure-readout">{measureLabel}</span>
        </div>

        <BattlemapCanvas
          activeTool={activeTool}
          assetVisibility={isDm ? visibility : 'public'}
          battleAreas={mapAreas}
          color={color}
          drawings={mapDrawings}
          focusPoint={focusPoint}
          map={map}
          mapAssets={assets}
          onAddAsset={(asset) => {
            if (isDm) {
              void onSaveMapAsset(asset)
            }
          }}
          onAddBattleArea={(area) => void onSaveBattleArea(CreatePlayerAreaUseCase(area, viewerMember))}
          onDeleteArea={(areaId) => {
            const area = mapAreas.find((item) => item.id === areaId)
            if (area) {
              void deleteArea(area)
            }
          }}
          onMeasure={setMeasureLabel}
          onMoveToken={(token) => void onSaveToken(MoveOwnPlayerTokenUseCase(token, { x: token.x, y: token.y }, viewerMember))}
          onSelectArea={(areaId) => {
            setSelectedAreaId(areaId)
            setSelectedAssetId(undefined)
            setSelectedTokenId(undefined)
            if (areaId && isEditingMap) {
              setSidePanel('areas')
            }
          }}
          onSelectToken={(tokenId) => {
            setSelectedTokenId(tokenId)
            setSelectedAreaId(undefined)
            setSelectedAssetId(undefined)
            if (tokenId && isEditingMap) {
              setSidePanel('tokens')
            }
          }}
          onUpdateBattleArea={(area) => void onSaveBattleArea(UpdatePlayerAreaUseCase(area, {}, viewerMember))}
          placementMode={placementMode}
          selectedAreaId={selectedAreaId}
          selectedTokenId={selectedTokenId}
          tokens={mapTokens}
          viewerMember={viewerMember}
        />

        <aside className={clsx('battle-side scroll-panel', !isEditingMap && 'battle-side-use')}>
          {isEditingMap ? (
            <div className="battle-side-tabs" role="tablist" aria-label="Panel del battlemap">
              {battleSidePanels.map((panel) => (
                <button
                  className={sidePanel === panel.id ? 'is-active' : ''}
                  key={panel.id}
                  onClick={() => setSidePanel(panel.id)}
                  type="button"
                >
                  {panel.label}
                </button>
              ))}
            </div>
          ) : null}

          {isEditingMap && sidePanel === 'map' ? (
            <section className="map-settings-panel" aria-label="Grid del mapa">
              <div className="panel-heading">
                <h3>Grid</h3>
                <span>{gridColumns} x {gridRows}</span>
              </div>
              <Field label="Capa activa">
                <SelectInput onChange={(event) => selectPlacementLayer(event.target.value as PlacementLayer)} value={placementLayer}>
                  {placementLayers.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <div className="form-grid compact">
                <Field label="Cuadrados horizontal">
                  <NumberInput min={1} onChange={(event) => void updateGridColumns(Number(event.target.value))} value={gridColumns} />
                </Field>
                <Field label="Cuadrados vertical">
                  <NumberInput min={1} onChange={(event) => void updateGridRows(Number(event.target.value))} value={gridRows} />
                </Field>
                <Field label="Grid px">
                  <NumberInput min={16} onChange={(event) => void updateGridSize(Number(event.target.value))} value={map.gridSize} />
                </Field>
              </div>
              <label className="upload-row compact-upload">
                <ImagePlus size={18} aria-hidden="true" />
                <span>Fondo del mapa</span>
                <input accept="image/*" onChange={uploadMapBackground} type="file" />
              </label>
              <button className="ghost-button danger-button" onClick={() => void deleteCurrentMap()} type="button">
                <Trash2 size={16} aria-hidden="true" />
                Borrar mapa
              </button>
            </section>
          ) : null}

          {isEditingMap && sidePanel === 'layers' ? (
            <section className="layer-panel" aria-label="Capas del battlemap">
              <div className="panel-heading">
                <h3><Layers size={17} aria-hidden="true" /> Capas</h3>
                <span>{dmLayerTokens.length + dmLayerAreas.length + dmLayerAssets.length}</span>
              </div>
              <div className="layer-section">
                <strong>Players</strong>
                {dmLayerTokens.filter((token) => token.kind === 'player').map(renderTokenLayerItem)}
              </div>
              <div className="layer-section">
                <strong>Monstruos</strong>
                {dmLayerTokens.filter((token) => token.kind === 'monster').map(renderTokenLayerItem)}
              </div>
              <div className="layer-section">
                <strong>NPCs y custom</strong>
                {dmLayerTokens.filter((token) => token.kind === 'npc' || token.kind === 'custom').map(renderTokenLayerItem)}
              </div>
              <div className="layer-section">
                <strong>Areas</strong>
                {dmLayerAreas.filter((area) => area.name !== 'Measurement').map(renderAreaLayerItem)}
              </div>
              <div className="layer-section">
                <strong>Mediciones</strong>
                {dmLayerAreas.filter((area) => area.name === 'Measurement').map(renderAreaLayerItem)}
              </div>
              <div className="layer-section">
                <strong>Muros, trampas y assets</strong>
                {dmLayerAssets.map(renderAssetLayerItem)}
              </div>
              <div className="layer-section dm-private-layer">
                <strong>Hidden / DM only</strong>
                {dmLayerTokens.filter((token) => isDmOnlyVisibility(token.visibility)).map(renderTokenLayerItem)}
                {dmLayerAreas.filter((area) => isDmOnlyVisibility(area.visibility) || area.hidden).map(renderAreaLayerItem)}
                {dmLayerAssets.filter((asset) => isDmOnlyVisibility(asset.visibility)).map(renderAssetLayerItem)}
              </div>
            </section>
          ) : null}

          {(!isEditingMap || sidePanel === 'combat') && !isDm && ownToken ? (
            <section className="player-initiative-panel">
              <div className="panel-heading">
                <h3>Mi iniciativa</h3>
                <span>{ownToken.name}</span>
              </div>
              <div className="initiative-roll-grid">
                <Field label="D20 fisico">
                  <NumberInput max={40} min={1} onChange={(event) => setInitiativeRoll(Number(event.target.value))} value={initiativeRoll} />
                </Field>
                <div className="initiative-total">
                  <small>Bonus</small>
                  <strong>{formatInitiativeBonus(initiativeBonus)}</strong>
                </div>
                <div className="initiative-total">
                  <small>Total</small>
                  <strong>{initiativeTotal}</strong>
                </div>
              </div>
              <button className="primary-button" disabled={!permissionSummary.canSetOwnInitiative} onClick={() => void submitOwnInitiative()} type="button">
                Guardar iniciativa
              </button>
            </section>
          ) : null}

          {isEditingMap && sidePanel === 'areas' ? (
          <>
          <section>
            <div className="panel-heading">
              <h3>Areas activas</h3>
              <span>{visibleAreas.length}</span>
            </div>
            <div className="area-list">
              {visibleAreas.map((area) => {
                const editable = canEditBattleArea(viewerMember, area)
                return (
                  <article className={clsx('area-card', selectedAreaId === area.id && 'is-active')} key={area.id}>
                    <button onClick={() => selectArea(area)} type="button">
                      <span className="area-color" style={{ background: area.color }} />
                      <strong>{area.name || area.type}</strong>
                      <small>{area.type} - {visibilityLabel(area.visibility)}</small>
                    </button>
                    <div className="inline-actions">
                      <button className="icon-button" onClick={() => void centerOnArea(area)} title="Centrar camara" type="button">
                        <Crosshair size={15} />
                      </button>
                      <button className="icon-button" disabled={!editable} onClick={() => void duplicateArea(area)} title="Duplicar area" type="button">
                        <Copy size={15} />
                      </button>
                      <button className="icon-button" disabled={!editable} onClick={() => void patchArea(area, { locked: !area.locked })} title="Bloquear" type="button">
                        {area.locked ? <Lock size={15} /> : <Unlock size={15} />}
                      </button>
                      <button className="icon-button" disabled={!isDm} onClick={() => void patchArea(area, { hidden: !area.hidden })} title="Ocultar" type="button">
                        {area.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button className="icon-button danger" disabled={!editable} onClick={() => void deleteArea(area)} title="Borrar area" type="button">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {selectedArea ? (
            <section className="area-inspector">
              <div className="panel-heading">
                <h3>Inspector de area</h3>
                <button className="ghost-button" disabled={!canEditBattleArea(viewerMember, selectedArea)} onClick={() => void onSaveBattleArea(RotateBattleAreaUseCase(selectedArea, 15, viewerMember.userId))} type="button">
                  <RotateCw size={15} />
                  Rotar
                </button>
              </div>
              <fieldset disabled={!canEditBattleArea(viewerMember, selectedArea)}>
                <Field label="Nombre">
                  <TextInput onChange={(event) => void patchArea(selectedArea, { name: event.target.value })} value={selectedArea.name} />
                </Field>
                <div className="form-grid compact">
                  <Field label="Tipo">
                    <SelectInput onChange={(event) => void patchArea(selectedArea, { type: event.target.value as BattleAreaType })} value={selectedArea.type}>
                      <option value="circle">Circulo</option>
                      <option value="cone">Cono</option>
                      <option value="square">Cubo/cuadrado</option>
                      <option value="line">Linea</option>
                    </SelectInput>
                  </Field>
                  <Field label="Visibilidad">
                    <SelectInput onChange={(event) => void patchArea(selectedArea, { visibility: event.target.value as Visibility })} value={selectedArea.visibility}>
                      <option value="public">Visible</option>
                      <option value="dm_only">Solo DM</option>
                      <option value="dm">Solo DM legacy</option>
                    </SelectInput>
                  </Field>
                  <Field label="Placement">
                    <SelectInput onChange={(event) => void patchArea(selectedArea, { placementMode: event.target.value as PlacementMode })} value={selectedArea.placementMode}>
                      {placementModes.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
                    </SelectInput>
                  </Field>
                  <Field label="Color">
                    <TextInput onChange={(event) => void patchArea(selectedArea, { color: event.target.value })} type="color" value={selectedArea.color} />
                  </Field>
                  <Field label="Opacidad">
                    <NumberInput max={1} min={0} onChange={(event) => void patchArea(selectedArea, { opacity: Number(event.target.value) })} step={0.05} value={selectedArea.opacity} />
                  </Field>
                  <Field label="Borde">
                    <NumberInput min={1} onChange={(event) => void patchArea(selectedArea, { strokeWidth: Number(event.target.value) })} value={selectedArea.strokeWidth} />
                  </Field>
                  <Field label="Start X">
                    <NumberInput onChange={(event) => void onSaveBattleArea(updateAreaPoint(selectedArea, 'start', 'x', Number(event.target.value), viewerMember.userId))} value={Math.round(selectedArea.start.x)} />
                  </Field>
                  <Field label="Start Y">
                    <NumberInput onChange={(event) => void onSaveBattleArea(updateAreaPoint(selectedArea, 'start', 'y', Number(event.target.value), viewerMember.userId))} value={Math.round(selectedArea.start.y)} />
                  </Field>
                  <Field label="End X">
                    <NumberInput onChange={(event) => void onSaveBattleArea(updateAreaPoint(selectedArea, 'end', 'x', Number(event.target.value), viewerMember.userId))} value={Math.round(selectedArea.end.x)} />
                  </Field>
                  <Field label="End Y">
                    <NumberInput onChange={(event) => void onSaveBattleArea(updateAreaPoint(selectedArea, 'end', 'y', Number(event.target.value), viewerMember.userId))} value={Math.round(selectedArea.end.y)} />
                  </Field>
                  <Field label="Radio">
                    <NumberInput min={0} onChange={(event) => void onSaveBattleArea(updateAreaSize(selectedArea, { radius: Number(event.target.value) }, viewerMember.userId))} value={Math.round(selectedArea.radius)} />
                  </Field>
                  <Field label="Ancho">
                    <NumberInput min={0} onChange={(event) => void onSaveBattleArea(updateAreaSize(selectedArea, { width: Number(event.target.value) }, viewerMember.userId))} value={Math.round(selectedArea.width)} />
                  </Field>
                  <Field label="Alto">
                    <NumberInput min={0} onChange={(event) => void onSaveBattleArea(updateAreaSize(selectedArea, { height: Number(event.target.value) }, viewerMember.userId))} value={Math.round(selectedArea.height)} />
                  </Field>
                  <Field label="Longitud">
                    <NumberInput min={0} onChange={(event) => void onSaveBattleArea(updateAreaSize(selectedArea, { length: Number(event.target.value) }, viewerMember.userId))} value={Math.round(selectedArea.length)} />
                  </Field>
                  <Field label="Angulo">
                    <NumberInput disabled value={Math.round(selectedArea.angle)} />
                  </Field>
                  <Field label="Rotacion">
                    <NumberInput onChange={(event) => void patchArea(selectedArea, { rotation: Number(event.target.value) })} value={Math.round(selectedArea.rotation)} />
                  </Field>
                </div>
                <Field label="Notas">
                  <TextArea onChange={(event) => void patchArea(selectedArea, { notes: event.target.value })} value={selectedArea.notes} />
                </Field>
              </fieldset>
            </section>
          ) : null}
          </>
          ) : null}

          {isEditingMap && sidePanel === 'assets' ? (
          <>
          <section>
            <div className="panel-heading">
              <h3>Assets tacticos</h3>
              {isDm ? (
                <button className="ghost-button" onClick={() => setActiveTool(selectedAssetType)} type="button">
                  <BrickWall size={15} />
                  Colocar
                </button>
              ) : null}
            </div>
            {isDm ? (
              <Field label="Tipo de asset">
                <SelectInput onChange={(event) => {
                  const nextType = event.target.value as MapAssetType
                  setSelectedAssetType(nextType)
                  if (placementLayer === 'assets') {
                    setActiveTool(nextType)
                  }
                }} value={selectedAssetType}>
                  {mapAssetDefinitions.map((definition) => (
                    <option key={definition.type} value={definition.type}>
                      {definition.icon} {definition.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            ) : null}
            <div className="asset-list">
              {visibleAssets.map((asset) => (
                <button className={clsx('asset-card', selectedAssetId === asset.id && 'is-active')} key={asset.id} onClick={() => selectAsset(asset)} type="button">
                  <span className="asset-icon" style={{ color: asset.color }}>{getMapAssetDefinition(asset.type).icon}</span>
                  <strong>{asset.label}</strong>
                  <small>{getMapAssetDefinition(asset.type).name} - {visibilityLabel(asset.visibility)}</small>
                </button>
              ))}
            </div>
          </section>

          {selectedAsset ? (
            <section className="asset-inspector">
              <div className="panel-heading">
                <h3>Inspector de asset</h3>
                {isDm ? (
                  <button className="icon-button danger" onClick={() => void deleteAsset(selectedAsset)} title="Borrar asset" type="button">
                    <Trash2 size={15} />
                  </button>
                ) : null}
              </div>
              <fieldset disabled={!canEditMapAsset(viewerMember, selectedAsset)}>
                <Field label="Nombre">
                  <TextInput onChange={(event) => void patchAsset(selectedAsset, { label: event.target.value, name: event.target.value })} value={selectedAsset.label} />
                </Field>
                <div className="form-grid compact">
                  <Field label="X">
                    <NumberInput onChange={(event) => void patchAsset(selectedAsset, { x: Number(event.target.value) })} value={Math.round(selectedAsset.x)} />
                  </Field>
                  <Field label="Y">
                    <NumberInput onChange={(event) => void patchAsset(selectedAsset, { y: Number(event.target.value) })} value={Math.round(selectedAsset.y)} />
                  </Field>
                  <Field label="Ancho">
                    <NumberInput onChange={(event) => void patchAsset(selectedAsset, { width: Number(event.target.value) })} value={Math.round(selectedAsset.width)} />
                  </Field>
                  <Field label="Alto">
                    <NumberInput onChange={(event) => void patchAsset(selectedAsset, { height: Number(event.target.value) })} value={Math.round(selectedAsset.height)} />
                  </Field>
                  <Field label="Rotacion">
                    <NumberInput onChange={(event) => void patchAsset(selectedAsset, { rotation: Number(event.target.value) })} value={Math.round(selectedAsset.rotation)} />
                  </Field>
                  <Field label="Color">
                    <TextInput onChange={(event) => void patchAsset(selectedAsset, { color: event.target.value })} type="color" value={selectedAsset.color} />
                  </Field>
                </div>
                <Field label="Visibilidad">
                  <SelectInput onChange={(event) => void patchAsset(selectedAsset, { visibility: event.target.value as Visibility })} value={selectedAsset.visibility}>
                    <option value="public">Visible</option>
                    <option value="dm_only">Solo DM</option>
                    <option value="dm">Solo DM legacy</option>
                  </SelectInput>
                </Field>
                <Field label="Notas">
                  <TextArea onChange={(event) => void patchAsset(selectedAsset, { notes: event.target.value })} value={selectedAsset.notes} />
                </Field>
              </fieldset>
            </section>
          ) : null}
          </>
          ) : null}

          {isEditingMap && sidePanel === 'tokens' ? (
          <>
          <section>
            <div className="panel-heading">
              <h3>Tokens</h3>
              {isDm ? <button className="ghost-button" onClick={addMonsterToken} type="button">Monstruo</button> : null}
            </div>
            {isDm ? (
              <div className="battlemap-player-token-tools" aria-label="Crear token de player">
                <Field label="Player">
                  <SelectInput
                    aria-label="Ficha para token de player"
                    disabled={!availablePlayerTokenCharacters.length}
                    onChange={(event) => setSelectedPlayerTokenCharacterId(event.target.value)}
                    value={playerTokenCharacterId}
                  >
                    {availablePlayerTokenCharacters.length ? (
                      availablePlayerTokenCharacters.map((character) => (
                        <option key={character.id} value={character.id}>
                          {character.name}
                        </option>
                      ))
                    ) : (
                      <option value="">Todos los players tienen token</option>
                    )}
                  </SelectInput>
                </Field>
                <button className="primary-button" disabled={!selectedPlayerTokenCharacter} onClick={addPlayerToken} type="button">
                  Anadir player
                </button>
              </div>
            ) : null}
            <div className="token-list">
              {visibleTokens.map((token) => (
                <button className={clsx('token-card', selectedTokenId === token.id && 'is-active')} key={token.id} onClick={() => selectToken(token)} type="button">
                  <strong>{token.name}</strong>
                  <span>HP {token.stats.currentHp}/{token.stats.maxHp} - AC {token.stats.armorClass}</span>
                  <small>{token.kind} - {visibilityLabel(token.visibility)}</small>
                </button>
              ))}
            </div>
          </section>

          {selectedToken ? (
            <section className="token-editor">
              <div className="panel-heading">
                <div>
                  <h3>{selectedToken.name}</h3>
                  <p>{selectedCharacter && selectedToken.ownerCharacterId === selectedCharacter.id ? 'Token asociado a la ficha seleccionada.' : `${selectedToken.kind} - ${visibilityLabel(selectedToken.visibility)}`}</p>
                </div>
                {canEditToken(viewerMember, selectedToken) ? (
                  <div className="inline-actions">
                    <button className="icon-button" onClick={() => void toggleTokenTurnOrder(selectedToken)} title="Turn order" type="button">
                      <Swords size={15} className={selectedToken.isInTurnOrder ? 'accented-icon' : undefined} />
                    </button>
                    <button className="icon-button" onClick={() => void toggleTokenVisibility(selectedToken)} title="Visibilidad" type="button">
                      {isDmOnlyVisibility(selectedToken.visibility) ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {selectedToken.kind !== 'player' ? (
                      <>
                        <button className="icon-button" onClick={() => void duplicateToken(selectedToken)} title="Duplicar token" type="button">
                          <Copy size={15} />
                        </button>
                        <button className="icon-button danger" onClick={() => void deleteToken(selectedToken)} title="Borrar token" type="button">
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {selectedToken.image.url ? (
                <img alt={selectedToken.image.alt || selectedToken.name} className="token-editor-image" src={selectedToken.image.url} />
              ) : (
                <div className="token-editor-image token-editor-image-empty" aria-label={`Token ${selectedToken.name}`}>
                  {selectedToken.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              {canEditToken(viewerMember, selectedToken) ? (
              <fieldset>
                <Field label="Nombre">
                  <TextInput onChange={(event) => void patchToken(selectedToken, { name: event.target.value })} value={selectedToken.name} />
                </Field>
                <div className="form-grid compact">
                  <Field label="Tipo">
                    <SelectInput
                      disabled={selectedToken.kind === 'player'}
                      onChange={(event) => void patchToken(selectedToken, { kind: event.target.value as Token['kind'] })}
                      value={selectedToken.kind}
                    >
                      <option value="player">Player</option>
                      <option value="monster">Monster</option>
                      <option value="npc">NPC</option>
                      <option value="custom">Custom</option>
                    </SelectInput>
                  </Field>
                  <Field label="Creature type">
                    <TextInput onChange={(event) => void patchTokenStats(selectedToken, { creatureType: event.target.value })} value={selectedToken.stats.creatureType} />
                  </Field>
                  <Field label="HP max">
                    <NumberInput onChange={(event) => void patchTokenStats(selectedToken, { maxHp: Number(event.target.value) })} value={selectedToken.stats.maxHp} />
                  </Field>
                  <Field label="HP actual">
                    <NumberInput onChange={(event) => void patchTokenStats(selectedToken, { currentHp: Number(event.target.value) })} value={selectedToken.stats.currentHp} />
                  </Field>
                  <Field label="HP temporal">
                    <NumberInput min={0} onChange={(event) => void patchTokenStats(selectedToken, { temporaryHp: Number(event.target.value) })} value={selectedToken.stats.temporaryHp} />
                  </Field>
                  <Field label="AC">
                    <NumberInput onChange={(event) => void patchTokenStats(selectedToken, { armorClass: Number(event.target.value) })} value={selectedToken.stats.armorClass} />
                  </Field>
                  <Field label="AC temporal">
                    <NumberInput min={0} onChange={(event) => void patchTokenStats(selectedToken, { temporaryArmorClass: Number(event.target.value) || undefined })} value={selectedToken.stats.temporaryArmorClass ?? 0} />
                  </Field>
                  <Field label="Iniciativa">
                    <NumberInput onChange={(event) => void patchTokenStats(selectedToken, { initiative: Number(event.target.value) })} value={selectedToken.stats.initiative} />
                  </Field>
                  <Field label="Velocidad">
                    <NumberInput onChange={(event) => void patchTokenStats(selectedToken, { speed: Number(event.target.value) })} value={selectedToken.stats.speed} />
                  </Field>
                  <Field label="Tamano">
                    <NumberInput max={6} min={0.25} onChange={(event) => void patchToken(selectedToken, { size: Number(event.target.value) })} step={0.25} value={selectedToken.size} />
                  </Field>
                  <Field label="X">
                    <NumberInput onChange={(event) => void patchToken(selectedToken, { x: Number(event.target.value) })} value={Math.round(selectedToken.x)} />
                  </Field>
                  <Field label="Y">
                    <NumberInput onChange={(event) => void patchToken(selectedToken, { y: Number(event.target.value) })} value={Math.round(selectedToken.y)} />
                  </Field>
                  <Field label="Rotacion">
                    <NumberInput onChange={(event) => void patchToken(selectedToken, { rotation: Number(event.target.value) })} value={selectedToken.rotation} />
                  </Field>
                  <Field label="Escala visual">
                    <NumberInput max={2.5} min={0.4} onChange={(event) => void patchToken(selectedToken, { scale: Number(event.target.value) })} step={0.05} value={selectedToken.scale} />
                  </Field>
                  <Field label="Acento">
                    <TextInput onChange={(event) => void patchToken(selectedToken, { accentColor: event.target.value })} type="color" value={selectedToken.accentColor} />
                  </Field>
                  <Field label="Borde">
                    <TextInput onChange={(event) => void patchToken(selectedToken, { borderColor: event.target.value })} type="color" value={selectedToken.borderColor} />
                  </Field>
                  <Field label="Visibilidad">
                    <SelectInput onChange={(event) => void patchToken(selectedToken, { visibility: event.target.value as Visibility })} value={selectedToken.visibility}>
                      <option value="public">Visible para todos</option>
                      <option value="dm_only">Solo DM</option>
                      <option value="dm">Solo DM legacy</option>
                    </SelectInput>
                  </Field>
                </div>
                <div className="token-state-row">
                  <label className="check-row">
                    <input checked={selectedToken.active} onChange={(event) => void patchToken(selectedToken, { active: event.target.checked })} type="checkbox" />
                    Activo
                  </label>
                  <label className="check-row">
                    <input checked={selectedToken.isLocked} onChange={(event) => void patchToken(selectedToken, { isLocked: event.target.checked })} type="checkbox" />
                    Bloquear movimiento
                  </label>
                  <label className="check-row">
                    <input checked={selectedToken.isInTurnOrder} onChange={() => void toggleTokenTurnOrder(selectedToken)} type="checkbox" />
                    En turn order
                  </label>
                </div>
                <label className="upload-row">
                  <ImagePlus size={18} aria-hidden="true" />
                  <span>Imagen del token</span>
                  <input accept="image/*" onChange={(event) => void uploadTokenImage(selectedToken, event)} type="file" />
                </label>
                <Field label="Notas visibles">
                  <TextArea onChange={(event) => void patchTokenStats(selectedToken, { visibleNotes: event.target.value })} value={selectedToken.stats.visibleNotes} />
                </Field>
                <Field label="Notas secretas DM">
                  <TextArea onChange={(event) => void patchTokenStats(selectedToken, { secretNotes: event.target.value })} value={selectedToken.stats.secretNotes} />
                </Field>
                <Field label="Notas mecanicas">
                  <TextArea onChange={(event) => void patchTokenStats(selectedToken, { notes: event.target.value })} value={selectedToken.stats.notes} />
                </Field>
                <div className="condition-grid">
                  {conditionOptions.map((condition) => (
                    <label className="check-row" key={condition}>
                      <input
                        checked={selectedToken.conditions.includes(condition)}
                        onChange={() => void toggleCondition(selectedToken, condition)}
                        type="checkbox"
                      />
                      {condition}
                    </label>
                  ))}
                </div>
              </fieldset>
              ) : (
                <div className="limited-token-view">
                  <span>HP {selectedToken.stats.currentHp}/{selectedToken.stats.maxHp}</span>
                  <span>AC {selectedToken.stats.armorClass}</span>
                  <span>Velocidad {selectedToken.stats.speed} ft</span>
                  {selectedToken.stats.visibleNotes ? <p>{selectedToken.stats.visibleNotes}</p> : null}
                  {selectedToken.conditions.length ? <small>Condiciones: {selectedToken.conditions.join(', ')}</small> : null}
                </div>
              )}
            </section>
          ) : null}
          </>
          ) : null}

          {(!isEditingMap || sidePanel === 'combat') ? (
          <section className="turn-panel">
            <div className="panel-heading">
              <h3>Turn order</h3>
              <span>Ronda {turnOrder.round}</span>
            </div>
            <ol className="turn-list">
              {turnOrder.entries.map((entry, index) => (
                <li className={index === turnOrder.currentIndex ? 'is-current' : ''} key={entry.id}>
                  <span>{entry.name}</span>
                  <strong>{entry.initiative}</strong>
                </li>
              ))}
            </ol>
            {isDm ? (
              <div className="turn-actions">
                <button className="ghost-button" onClick={syncTokensToTurnOrder} type="button">Sincronizar</button>
                <button className="primary-button" onClick={advanceTurn} type="button">Avanzar turno</button>
                <div className="form-grid compact">
                  <Field label="Nombre">
                    <TextInput onChange={(event) => setNewTurnName(event.target.value)} value={newTurnName} />
                  </Field>
                  <Field label="Iniciativa">
                    <NumberInput onChange={(event) => setNewTurnInitiative(Number(event.target.value))} value={newTurnInitiative} />
                  </Field>
                </div>
                <button className="ghost-button" onClick={addTurnEntry} type="button">Anadir iniciativa</button>
              </div>
            ) : null}
          </section>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
