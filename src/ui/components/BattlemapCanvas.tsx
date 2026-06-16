import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent, WheelEvent } from 'react'
import type {
  BattleArea,
  BattleMap,
  Drawing,
  DrawingShape,
  MapAsset,
  MapAssetType,
  PlacementMode,
  Point,
  Token,
} from '@domain/entities/battlemap'
import type { CampaignMember, Visibility } from '@domain/entities/common'
import {
  canCreateDrawing,
  canEditBattleArea,
  canMoveToken,
  canViewBattleArea,
  canViewToken,
  canViewVisibility,
  isDm,
  isDmOnlyVisibility,
} from '@domain/services/permissions'
import { clamp, distanceFeet, moveBattleArea, snapPointByPlacementMode } from '@domain/services/battlemapGeometry'
import { CreateBattleAreaUseCase, UpdateBattleAreaUseCase } from '@application/use-cases/battleAreas'
import { createMapAsset } from '@application/use-cases/workspaceFactories'
import { getMapAssetDefinition, mapAssetDefinitions } from '@shared/constants/mapAssets'

export type BattleTool = 'pan' | 'select' | 'measure' | 'erase' | DrawingShape | MapAssetType

interface BattlemapCanvasProps {
  activeTool: BattleTool
  assetVisibility: Visibility
  battleAreas: BattleArea[]
  color: string
  drawings: Drawing[]
  focusPoint?: { x: number; y: number; nonce: number }
  map: BattleMap
  mapAssets: MapAsset[]
  onAddAsset: (asset: MapAsset) => void
  onAddBattleArea: (area: BattleArea) => void
  onDeleteArea: (areaId: string) => void
  onMeasure: (label: string) => void
  onMoveToken: (token: Token) => void
  onSelectArea: (areaId?: string) => void
  onSelectToken: (tokenId?: string) => void
  onUpdateBattleArea: (area: BattleArea) => void
  placementMode: PlacementMode
  selectedAreaId?: string
  selectedTokenId?: string
  tokens: Token[]
  viewerMember: CampaignMember
}

type Interaction =
  | { kind: 'none' }
  | { kind: 'pan'; origin: Point; viewportOrigin: Point }
  | { kind: 'draw'; start: Point; current: Point }
  | { kind: 'drag-area'; area: BattleArea; offset: Point }
  | { kind: 'drag-token'; token: Token; offset: Point }

type TokenImageCacheEntry =
  | { status: 'loading'; image: HTMLImageElement; src: string }
  | { status: 'loaded'; image: HTMLImageElement; src: string }
  | { status: 'error'; src: string }

const drawingTools: DrawingShape[] = ['circle', 'cone', 'square', 'line']
const assetTools = mapAssetDefinitions.map((definition) => definition.type)

function isDrawingTool(tool: BattleTool): tool is DrawingShape {
  return drawingTools.includes(tool as DrawingShape)
}

function isAssetTool(tool: BattleTool): tool is MapAssetType {
  return assetTools.includes(tool as MapAssetType)
}

function colorWithOpacity(color: string, opacity: number): string {
  const normalized = color.replace('#', '')
  if (normalized.length !== 6) {
    return color
  }

  const alpha = Math.round(clamp(opacity, 0, 1) * 255)
    .toString(16)
    .padStart(2, '0')
  return `#${normalized}${alpha}`
}

function drawGrid(context: CanvasRenderingContext2D, map: BattleMap) {
  context.save()
  context.shadowColor = 'rgba(34, 240, 200, 0.35)'
  context.shadowBlur = 4
  for (let x = 0; x <= map.width; x += map.gridSize) {
    const major = Math.round(x / map.gridSize) % 5 === 0
    context.strokeStyle = major ? 'rgba(34, 240, 200, 0.34)' : 'rgba(255,255,255,0.13)'
    context.lineWidth = major ? 1.6 : 0.8
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, map.height)
    context.stroke()
  }

  for (let y = 0; y <= map.height; y += map.gridSize) {
    const major = Math.round(y / map.gridSize) % 5 === 0
    context.strokeStyle = major ? 'rgba(182, 134, 255, 0.28)' : 'rgba(255,255,255,0.13)'
    context.lineWidth = major ? 1.6 : 0.8
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(map.width, y)
    context.stroke()
  }
  context.restore()
}

function drawBattleArea(context: CanvasRenderingContext2D, area: BattleArea, selected: boolean) {
  const centerX = area.type === 'square' ? area.start.x + (area.end.x - area.start.x) / 2 : area.start.x
  const centerY = area.type === 'square' ? area.start.y + (area.end.y - area.start.y) / 2 : area.start.y
  const isPrivate = isDmOnlyVisibility(area.visibility)

  context.save()
  context.globalAlpha = isPrivate ? 0.58 : 1
  context.translate(centerX, centerY)
  context.rotate((area.rotation * Math.PI) / 180)
  context.translate(-centerX, -centerY)
  context.strokeStyle = selected ? '#ffffff' : isPrivate ? '#ff4fa3' : area.color
  context.fillStyle = area.hidden ? 'transparent' : colorWithOpacity(area.color, area.opacity)
  context.lineWidth = selected ? area.strokeWidth + 2 : area.strokeWidth
  context.shadowColor = selected ? '#ffffff' : area.color
  context.shadowBlur = selected ? 22 : 12
  context.setLineDash(area.locked ? [12, 8] : isPrivate ? [8, 6] : [])
  context.lineCap = 'round'

  if (area.type === 'circle') {
    context.beginPath()
    context.arc(area.start.x, area.start.y, area.radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  }

  if (area.type === 'square') {
    const left = Math.min(area.start.x, area.end.x)
    const top = Math.min(area.start.y, area.end.y)
    context.fillRect(left, top, area.width, area.height)
    context.strokeRect(left, top, area.width, area.height)
  }

  if (area.type === 'line') {
    const angle = Math.atan2(area.end.y - area.start.y, area.end.x - area.start.x)
    const arrowLength = Math.max(18, area.strokeWidth * 4)
    context.beginPath()
    context.moveTo(area.start.x, area.start.y)
    context.lineTo(area.end.x, area.end.y)
    context.stroke()

    context.beginPath()
    context.moveTo(area.end.x, area.end.y)
    context.lineTo(
      area.end.x - arrowLength * Math.cos(angle - Math.PI / 7),
      area.end.y - arrowLength * Math.sin(angle - Math.PI / 7),
    )
    context.moveTo(area.end.x, area.end.y)
    context.lineTo(
      area.end.x - arrowLength * Math.cos(angle + Math.PI / 7),
      area.end.y - arrowLength * Math.sin(angle + Math.PI / 7),
    )
    context.stroke()
  }

  if (area.type === 'cone') {
    const angle = Math.atan2(area.end.y - area.start.y, area.end.x - area.start.x)
    context.beginPath()
    context.moveTo(area.start.x, area.start.y)
    context.arc(area.start.x, area.start.y, area.radius, angle - Math.PI / 6, angle + Math.PI / 6)
    context.closePath()
    context.fill()
    context.stroke()
  }

  context.fillStyle = '#ffffff'
  context.font = '700 17px Inter, system-ui'
  context.textAlign = 'left'
  context.shadowColor = area.color
  context.shadowBlur = 12
  context.fillText(`${area.notes || area.name || area.type}${isPrivate ? ' - DM' : ''}`, area.start.x + 12, area.start.y - 12)
  context.restore()
}

function wrapTextLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split(/\r?\n/)
  const lines: string[] = []

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      return
    }

    let line = ''
    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word
      if (line && context.measureText(nextLine).width > maxWidth) {
        lines.push(line)
        line = word
        return
      }

      line = nextLine
    })

    lines.push(line)
  })

  return lines.length ? lines : ['Texto del mapa']
}

function drawTextAsset(context: CanvasRenderingContext2D, asset: MapAsset, isPrivate: boolean) {
  const padding = clamp(Math.min(asset.width, asset.height) * 0.18, 10, 22)
  const fontSize = clamp(asset.height * 0.28, 14, 34)
  const lineHeight = fontSize * 1.22
  const maxTextWidth = Math.max(24, asset.width - padding * 2)
  const maxLines = Math.max(1, Math.floor(Math.max(1, asset.height - padding * 2) / lineHeight))

  context.lineWidth = 2.5
  context.setLineDash(isPrivate ? [10, 6] : [])
  context.strokeStyle = isPrivate ? '#ff4fa3' : asset.color
  context.fillStyle = isPrivate ? 'rgba(255, 79, 163, 0.13)' : 'rgba(2, 10, 22, 0.72)'
  context.shadowColor = asset.color
  context.shadowBlur = 18
  context.beginPath()
  context.roundRect(asset.x, asset.y, asset.width, asset.height, 10)
  context.fill()
  context.stroke()

  context.font = `800 ${fontSize}px Inter, system-ui`
  context.textAlign = 'left'
  context.textBaseline = 'top'
  const wrappedLines = wrapTextLines(context, asset.label.trim() || 'Texto del mapa', maxTextWidth)
  const visibleLines = wrappedLines.slice(0, maxLines)
  if (wrappedLines.length > visibleLines.length) {
    visibleLines[visibleLines.length - 1] = `${visibleLines[visibleLines.length - 1].replace(/\.*$/, '')}...`
  }

  context.fillStyle = '#f7fffb'
  context.shadowBlur = 10
  visibleLines.forEach((line, index) => {
    context.fillText(line, asset.x + padding, asset.y + padding + index * lineHeight)
  })

  if (isPrivate) {
    context.font = '800 11px Inter, system-ui'
    context.textAlign = 'right'
    context.textBaseline = 'bottom'
    context.shadowBlur = 0
    context.fillStyle = '#ffedf7'
    context.fillText('DM', asset.x + asset.width - padding, asset.y + asset.height - padding * 0.6)
  }
}

function drawAsset(context: CanvasRenderingContext2D, asset: MapAsset) {
  const definition = getMapAssetDefinition(asset.type)
  const isPrivate = isDmOnlyVisibility(asset.visibility)
  context.save()
  context.globalAlpha = isPrivate ? 0.62 : 1
  context.translate(asset.x + asset.width / 2, asset.y + asset.height / 2)
  context.rotate((asset.rotation * Math.PI) / 180)
  context.translate(-(asset.x + asset.width / 2), -(asset.y + asset.height / 2))
  context.lineWidth = 3
  context.setLineDash(isPrivate ? [10, 6] : [])
  context.strokeStyle = isPrivate ? '#ff4fa3' : asset.color
  context.fillStyle = colorWithOpacity(asset.color, 0.24)
  context.shadowColor = asset.color
  context.shadowBlur = 14

  if (asset.type === 'text-label') {
    drawTextAsset(context, asset, isPrivate)
    context.restore()
    return
  }

  if (asset.type.includes('door') || asset.type.includes('wall') || asset.type === 'barricade' || asset.type === 'bridge') {
    context.fillRect(asset.x, asset.y, asset.width, asset.height)
    context.strokeRect(asset.x, asset.y, asset.width, asset.height)
  } else {
    context.beginPath()
    context.roundRect(asset.x, asset.y, asset.width, asset.height, 10)
    context.fill()
    context.stroke()
  }

  context.fillStyle = '#ffffff'
  context.font = '800 22px Inter, system-ui'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.shadowColor = asset.color
  context.shadowBlur = 12
  context.fillText(definition.icon, asset.x + asset.width / 2, asset.y + asset.height / 2)
  context.shadowBlur = 0
  context.font = '600 12px Inter, system-ui'
  context.fillText(`${asset.label}${isPrivate ? ' - DM' : ''}`, asset.x + asset.width / 2, asset.y + asset.height + 14)
  context.restore()
}

function drawTokenImage(context: CanvasRenderingContext2D, image: HTMLImageElement, token: Token, radius: number) {
  const imageWidth = image.naturalWidth || image.width
  const imageHeight = image.naturalHeight || image.height
  if (!imageWidth || !imageHeight) {
    return
  }

  const diameter = radius * 2
  const scale = Math.max(diameter / imageWidth, diameter / imageHeight)
  const drawWidth = imageWidth * scale
  const drawHeight = imageHeight * scale
  const drawX = token.x - drawWidth / 2
  const drawY = token.y - drawHeight / 2

  context.save()
  context.beginPath()
  context.arc(token.x, token.y, radius, 0, Math.PI * 2)
  context.clip()
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight)

  const sheen = context.createRadialGradient(token.x - radius * 0.35, token.y - radius * 0.45, 0, token.x, token.y, radius)
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
  sheen.addColorStop(0.58, 'rgba(255, 255, 255, 0.02)')
  sheen.addColorStop(1, 'rgba(2, 6, 18, 0.34)')
  context.fillStyle = sheen
  context.fillRect(token.x - radius, token.y - radius, diameter, diameter)
  context.restore()
}

function drawToken(
  context: CanvasRenderingContext2D,
  token: Token,
  gridSize: number,
  selected: boolean,
  tokenImage?: HTMLImageElement,
) {
  const radius = Math.max(12, ((gridSize * token.size) / 2 - 6) * token.scale)
  const isPrivate = isDmOnlyVisibility(token.visibility)
  const hpRatio = token.stats.maxHp > 0 ? Math.max(0, Math.min(1, token.stats.currentHp / token.stats.maxHp)) : 0
  const tokenColor = token.accentColor || (token.kind === 'player' ? '#22f0c8' : token.kind === 'monster' ? '#ff4fa3' : '#b686ff')
  const hpColor = hpRatio <= 0.25 ? '#ff9b54' : hpRatio <= 0.5 ? '#f7e66f' : '#7cff6b'
  context.save()
  context.globalAlpha = isPrivate ? 0.64 : 1
  context.translate(token.x, token.y)
  context.rotate((token.rotation * Math.PI) / 180)
  context.translate(-token.x, -token.y)
  context.beginPath()
  context.arc(token.x, token.y, radius + 9, 0, Math.PI * 2)
  context.strokeStyle = token.kind === 'monster' ? '#ff4fa3' : token.kind === 'player' ? '#22f0c8' : '#b686ff'
  context.lineWidth = selected ? 4 : 2
  context.shadowColor = context.strokeStyle
  context.shadowBlur = selected ? 28 : 14
  context.stroke()

  context.beginPath()
  context.arc(token.x, token.y, radius, 0, Math.PI * 2)
  context.fillStyle = tokenColor
  context.shadowColor = context.fillStyle
  context.shadowBlur = selected ? 24 : 10
  context.fill()
  if (tokenImage) {
    drawTokenImage(context, tokenImage, token, radius)
  }
  context.shadowBlur = 0
  context.setLineDash(isPrivate ? [10, 5] : [])
  context.strokeStyle = selected ? '#ffffff' : token.borderColor || 'rgba(255,255,255,0.78)'
  context.lineWidth = selected ? 6 : 3
  context.stroke()

  context.beginPath()
  context.arc(token.x, token.y, radius + 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio)
  context.strokeStyle = hpColor
  context.lineWidth = 4
  context.shadowColor = hpColor
  context.shadowBlur = 12
  context.stroke()

  context.fillStyle = '#0b1020'
  context.font = '800 20px Inter, system-ui'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  if (!tokenImage) {
    const initials = token.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    context.fillText(initials, token.x, token.y)
  }
  if (isPrivate) {
    context.fillStyle = '#ffedf7'
    context.font = '800 11px Inter, system-ui'
    context.fillText('DM', token.x, token.y + radius + 13)
  }

  token.conditions.forEach((condition, index) => {
    context.beginPath()
    context.strokeStyle = index % 2 ? '#f7e66f' : '#7cff6b'
    context.lineWidth = 4
    context.arc(token.x, token.y, radius + 7 + index * 6, 0, Math.PI * 2)
    context.stroke()
    context.fillStyle = '#ffffff'
    context.font = '600 12px Inter, system-ui'
    context.fillText(condition.slice(0, 3).toUpperCase(), token.x, token.y + radius + 18 + index * 11)
  })
  context.restore()
}

export function BattlemapCanvas({
  activeTool,
  assetVisibility,
  battleAreas,
  color,
  drawings,
  focusPoint,
  map,
  mapAssets,
  onAddAsset,
  onAddBattleArea,
  onDeleteArea,
  onMeasure,
  onMoveToken,
  onSelectArea,
  onSelectToken,
  onUpdateBattleArea,
  placementMode,
  selectedAreaId,
  selectedTokenId,
  tokens,
  viewerMember,
}: BattlemapCanvasProps) {
  void drawings
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backgroundRef = useRef<HTMLImageElement | null>(null)
  const tokenImageCacheRef = useRef<Map<string, TokenImageCacheEntry>>(new Map())
  const moveFrameRef = useRef<number | undefined>(undefined)
  const pendingTokenRef = useRef<Token | null>(null)
  const areaFrameRef = useRef<number | undefined>(undefined)
  const pendingAreaRef = useRef<BattleArea | null>(null)
  const focusedNonceRef = useRef<number | undefined>(undefined)
  const [, setTokenImageVersion] = useState(0)
  const [viewport, setViewport] = useState({ x: 40, y: 40, scale: 0.55 })
  const [interaction, setInteraction] = useState<Interaction>({ kind: 'none' })

  const visibleTokens = useMemo(() => tokens.filter((token) => canViewToken(viewerMember, token)), [tokens, viewerMember])
  const visibleBattleAreas = useMemo(
    () => battleAreas.filter((area) => canViewBattleArea(viewerMember, area)),
    [battleAreas, viewerMember],
  )
  const visibleAssets = useMemo(
    () => mapAssets.filter((asset) => canViewVisibility(viewerMember, asset.visibility)),
    [mapAssets, viewerMember],
  )

  useEffect(() => {
    if (!map.background.url) {
      backgroundRef.current = null
      return
    }

    const image = new Image()
    image.src = map.background.url
    image.onload = () => {
      backgroundRef.current = image
    }
  }, [map.background.url])

  useEffect(() => {
    const cache = tokenImageCacheRef.current
    const visibleImageUrls = new Set(
      visibleTokens
        .map((token) => token.image.url)
        .filter((url): url is string => Boolean(url)),
    )

    Array.from(cache.keys()).forEach((url) => {
      if (!visibleImageUrls.has(url)) {
        cache.delete(url)
      }
    })

    visibleImageUrls.forEach((url) => {
      if (cache.has(url)) {
        return
      }

      const image = new Image()
      cache.set(url, { status: 'loading', image, src: url })
      image.onload = () => {
        cache.set(url, { status: 'loaded', image, src: url })
        setTokenImageVersion((version) => version + 1)
      }
      image.onerror = () => {
        cache.set(url, { status: 'error', src: url })
        setTokenImageVersion((version) => version + 1)
      }
      image.src = url
    })
  }, [visibleTokens])

  useEffect(() => {
    if (!focusPoint || focusedNonceRef.current === focusPoint.nonce) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const rect = canvas.getBoundingClientRect()
      focusedNonceRef.current = focusPoint.nonce
      setViewport((current) => ({
        ...current,
        x: rect.width / 2 - focusPoint.x * current.scale,
        y: rect.height / 2 - focusPoint.y * current.scale,
      }))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [focusPoint])

  const rawMapPointFromEvent = useCallback(
    (event: PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current
      if (!canvas) {
        return { x: 0, y: 0 }
      }

      const rect = canvas.getBoundingClientRect()
      const rawPoint = {
        x: (event.clientX - rect.left - viewport.x) / viewport.scale,
        y: (event.clientY - rect.top - viewport.y) / viewport.scale,
      }
      return rawPoint
    },
    [viewport.scale, viewport.x, viewport.y],
  )

  const snappedMapPointFromEvent = useCallback(
    (event: PointerEvent<HTMLCanvasElement>): Point => snapPointByPlacementMode(rawMapPointFromEvent(event), map.gridSize, placementMode),
    [map.gridSize, placementMode, rawMapPointFromEvent],
  )

  function drawScene() {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    canvas.width = Math.floor(rect.width * ratio)
    canvas.height = Math.floor(rect.height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, rect.width, rect.height)

    const gradient = context.createLinearGradient(0, 0, rect.width, rect.height)
    gradient.addColorStop(0, '#101731')
    gradient.addColorStop(0.45, '#102c35')
    gradient.addColorStop(1, '#311033')
    context.fillStyle = gradient
    context.fillRect(0, 0, rect.width, rect.height)

    context.save()
    context.translate(viewport.x, viewport.y)
    context.scale(viewport.scale, viewport.scale)

    if (backgroundRef.current) {
      context.drawImage(backgroundRef.current, 0, 0, map.width, map.height)
    } else {
      const mapGradient = context.createLinearGradient(0, 0, map.width, map.height)
      mapGradient.addColorStop(0, '#17213d')
      mapGradient.addColorStop(0.35, '#102d34')
      mapGradient.addColorStop(0.7, '#271a45')
      mapGradient.addColorStop(1, '#11182b')
      context.fillStyle = mapGradient
      context.fillRect(0, 0, map.width, map.height)
    }

    drawGrid(context, map)
    visibleBattleAreas.forEach((area) => drawBattleArea(context, area, area.id === selectedAreaId))
    visibleAssets.forEach((asset) => drawAsset(context, asset))
    visibleTokens.forEach((token) => {
      const imageEntry = token.image.url ? tokenImageCacheRef.current.get(token.image.url) : undefined
      const tokenImage = imageEntry?.status === 'loaded' ? imageEntry.image : undefined
      drawToken(context, token, map.gridSize, token.id === selectedTokenId, tokenImage)
    })

    if (interaction.kind === 'draw') {
      const preview = CreateBattleAreaUseCase({
        campaignId: map.campaignId,
        mapId: map.id,
        userId: viewerMember.userId,
        type: activeTool === 'measure' ? 'line' : activeTool as DrawingShape,
        start: interaction.start,
        end: interaction.current,
        color,
        visibility: assetVisibility,
        placementMode,
      })
      drawBattleArea(context, preview, false)

      if (activeTool === 'measure') {
        context.fillStyle = '#ffffff'
        context.font = '700 24px Inter, system-ui'
        context.fillText(`${distanceFeet(interaction.start, interaction.current, map.gridSize)} ft`, interaction.current.x + 16, interaction.current.y)
      }
    }

    context.strokeStyle = 'rgba(255,255,255,0.82)'
    context.lineWidth = 4
    context.strokeRect(0, 0, map.width, map.height)
    context.restore()
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(drawScene)
    return () => window.cancelAnimationFrame(frame)
  })

  function findToken(point: Point): Token | undefined {
    return [...visibleTokens].reverse().find((token) => Math.hypot(point.x - token.x, point.y - token.y) <= (map.gridSize * token.size) / 2)
  }

  function findArea(point: Point): BattleArea | undefined {
    return [...visibleBattleAreas].reverse().find((area) => {
      if (area.type === 'circle' || area.type === 'cone') {
        return Math.hypot(point.x - area.start.x, point.y - area.start.y) <= area.radius + 16
      }

      const minX = Math.min(area.start.x, area.end.x) - area.strokeWidth - 16
      const maxX = Math.max(area.start.x, area.end.x) + area.strokeWidth + 16
      const minY = Math.min(area.start.y, area.end.y) - area.strokeWidth - 16
      const maxY = Math.max(area.start.y, area.end.y) + area.strokeWidth + 16
      return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
    })
  }

  function scheduleTokenMove(token: Token) {
    pendingTokenRef.current = token
    if (moveFrameRef.current) {
      return
    }

    moveFrameRef.current = window.requestAnimationFrame(() => {
      if (pendingTokenRef.current) {
        onMoveToken(pendingTokenRef.current)
      }
      moveFrameRef.current = undefined
      pendingTokenRef.current = null
    })
  }

  function scheduleAreaMove(area: BattleArea) {
    pendingAreaRef.current = area
    if (areaFrameRef.current) {
      return
    }

    areaFrameRef.current = window.requestAnimationFrame(() => {
      if (pendingAreaRef.current) {
        onUpdateBattleArea(pendingAreaRef.current)
      }
      areaFrameRef.current = undefined
      pendingAreaRef.current = null
    })
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const rawPoint = rawMapPointFromEvent(event)
    const point = snapPointByPlacementMode(rawPoint, map.gridSize, placementMode)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (activeTool === 'pan' || event.button === 1) {
      setInteraction({ kind: 'pan', origin: { x: event.clientX, y: event.clientY }, viewportOrigin: { x: viewport.x, y: viewport.y } })
      return
    }

    if (activeTool === 'erase') {
      const area = findArea(rawPoint)
      if (area && canEditBattleArea(viewerMember, area)) {
        onDeleteArea(area.id)
      }
      return
    }

    if (activeTool === 'select') {
      const area = findArea(rawPoint)
      if (area) {
        onSelectArea(area.id)
        onSelectToken(undefined)
        if (canEditBattleArea(viewerMember, area)) {
          setInteraction({ kind: 'drag-area', area, offset: { x: rawPoint.x - area.start.x, y: rawPoint.y - area.start.y } })
        }
        return
      }

      const token = findToken(rawPoint)
      onSelectArea(undefined)
      onSelectToken(token?.id)
      if (token && canMoveToken(viewerMember, token)) {
        setInteraction({ kind: 'drag-token', token, offset: { x: rawPoint.x - token.x, y: rawPoint.y - token.y } })
      }
      return
    }

    if ((activeTool === 'measure' || isDrawingTool(activeTool)) && canCreateDrawing(viewerMember)) {
      setInteraction({ kind: 'draw', start: point, current: point })
      return
    }

    if (isAssetTool(activeTool) && isDm(viewerMember)) {
      const asset = createMapAsset(map.id, activeTool, point.x, point.y, assetVisibility)
      const factor = map.gridSize / 70
      onAddAsset({
        ...asset,
        width: asset.width * factor,
        height: asset.height * factor,
      })
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const rawPoint = rawMapPointFromEvent(event)
    const point = snappedMapPointFromEvent(event)

    if (interaction.kind === 'pan') {
      setViewport({
        ...viewport,
        x: interaction.viewportOrigin.x + event.clientX - interaction.origin.x,
        y: interaction.viewportOrigin.y + event.clientY - interaction.origin.y,
      })
    }

    if (interaction.kind === 'draw') {
      setInteraction({ ...interaction, current: point })
    }

    if (interaction.kind === 'drag-token') {
      const targetPoint = placementMode === 'free'
        ? { x: rawPoint.x - interaction.offset.x, y: rawPoint.y - interaction.offset.y }
        : rawPoint
      const nextCenter = snapPointByPlacementMode(
        targetPoint,
        map.gridSize,
        placementMode,
      )
      const nextToken = {
        ...interaction.token,
        x: nextCenter.x,
        y: nextCenter.y,
      }
      setInteraction({ ...interaction, token: nextToken })
      scheduleTokenMove(nextToken)
    }

    if (interaction.kind === 'drag-area') {
      const nextStart = snapPointByPlacementMode(
        { x: rawPoint.x - interaction.offset.x, y: rawPoint.y - interaction.offset.y },
        map.gridSize,
        placementMode,
      )
      const nextArea = UpdateBattleAreaUseCase(
        interaction.area,
        moveBattleArea(interaction.area, nextStart),
        viewerMember.userId,
      )
      setInteraction({ ...interaction, area: nextArea })
      scheduleAreaMove(nextArea)
    }
  }

  function handlePointerUp() {
    if (interaction.kind === 'draw') {
      if (activeTool === 'measure') {
        const label = `${distanceFeet(interaction.start, interaction.current, map.gridSize)} ft`
        onMeasure(label)
        onAddBattleArea({
          ...CreateBattleAreaUseCase({
            campaignId: map.campaignId,
            mapId: map.id,
            userId: viewerMember.userId,
            type: 'line',
            start: interaction.start,
            end: interaction.current,
            color,
            visibility: assetVisibility,
            placementMode,
          }),
          name: 'Measurement',
          notes: label,
          opacity: 0.1,
        })
      } else if (isDrawingTool(activeTool)) {
        onAddBattleArea(
          CreateBattleAreaUseCase({
            campaignId: map.campaignId,
            mapId: map.id,
            userId: viewerMember.userId,
            type: activeTool,
            start: interaction.start,
            end: interaction.current,
            color,
            visibility: assetVisibility,
            placementMode,
          }),
        )
      }
    }

    if (interaction.kind === 'drag-token') {
      onMoveToken(interaction.token)
    }

    if (interaction.kind === 'drag-area') {
      onUpdateBattleArea(interaction.area)
    }

    setInteraction({ kind: 'none' })
  }

  function handleWheel(event: WheelEvent<HTMLCanvasElement>) {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const mapPoint = {
      x: (mouse.x - viewport.x) / viewport.scale,
      y: (mouse.y - viewport.y) / viewport.scale,
    }
    const nextScale = clamp(viewport.scale * (event.deltaY > 0 ? 0.9 : 1.1), 0.2, 2.6)
    setViewport({
      scale: nextScale,
      x: mouse.x - mapPoint.x * nextScale,
      y: mouse.y - mapPoint.y * nextScale,
    })
  }

  return (
    <canvas
      aria-label="Battlemap interactivo"
      className="battle-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      ref={canvasRef}
      role="img"
    />
  )
}
