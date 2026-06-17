import type { BattleArea, MapAsset, Point, Token, TurnEntry, TurnOrder } from '@domain/entities/battlemap'
import type { CampaignMember, ID, Visibility } from '@domain/entities/common'
import type { Character } from '@domain/entities/character'
import {
  canCreateMonsterToken,
  canDeleteToken,
  canEditBattleArea,
  canEditToken,
  canMoveToken,
  canSetOwnInitiative,
  canSetTokenVisibility,
  canToggleBattleAreaLock,
  canViewBattleArea,
  canViewToken,
  canViewVisibility,
  isDm,
} from '@domain/services/permissions'
import { distanceFeet, sortTurnEntries } from '@domain/services/battlemapGeometry'
import { createMonsterToken, createPlayerToken } from './workspaceFactories'
import { DuplicateBattleAreaUseCase } from './battleAreas'
import { createId } from '@shared/utils/id'

export interface BattlemapPermissionSummary {
  canCreateMonster: boolean
  canManageAllTokens: boolean
  canManageMapElements: boolean
  canMoveOwnToken: boolean
  canSetOwnInitiative: boolean
  canDrawAreas: boolean
}

export function NormalizeTokenUseCase(token: Token): Token {
  return {
    ...token,
    ownerUserId: token.ownerUserId,
    characterId: token.characterId ?? token.ownerCharacterId,
    rotation: token.rotation ?? 0,
    scale: token.scale ?? 1,
    accentColor: token.accentColor ?? (token.kind === 'player' ? '#22f0c8' : '#ff4fa3'),
    borderColor: token.borderColor ?? (token.kind === 'player' ? '#e7fff9' : '#160611'),
    isLocked: token.isLocked ?? false,
    isInTurnOrder: token.isInTurnOrder ?? true,
    active: token.active ?? true,
    stats: {
      ...token.stats,
      temporaryHp: token.stats.temporaryHp ?? 0,
      temporaryArmorClass: token.stats.temporaryArmorClass,
      creatureType: token.stats.creatureType ?? (token.kind === 'player' ? 'Player character' : 'Monster'),
      visibleNotes: token.stats.visibleNotes ?? token.stats.notes ?? '',
      secretNotes: token.stats.secretNotes ?? '',
      notes: token.stats.notes ?? '',
    },
  }
}

export function CreateMonsterTokenUseCase(mapId: ID, member: CampaignMember, patch: Partial<Token> = {}): Token {
  if (!canCreateMonsterToken(member)) {
    throw new Error('Solo el DM puede crear monstruos.')
  }

  return NormalizeTokenUseCase({
    ...createMonsterToken(mapId),
    ...patch,
    id: patch.id ?? createId('token'),
    kind: patch.kind ?? 'monster',
    createdBy: member.userId,
    updatedBy: member.userId,
  })
}

export function CreatePlayerTokenUseCase(mapId: ID, character: Character, member: CampaignMember, patch: Partial<Token> = {}): Token {
  if (!isDm(member)) {
    throw new Error('Solo el DM puede crear tokens de players.')
  }

  return NormalizeTokenUseCase({
    ...createPlayerToken(mapId, character),
    ...patch,
    id: patch.id ?? createId('token'),
    kind: 'player',
    ownerCharacterId: character.id,
    ownerUserId: character.ownerUserId,
    characterId: character.id,
    name: patch.name ?? character.name,
    image: patch.image ?? character.portrait,
    createdBy: member.userId,
    updatedBy: member.userId,
  })
}

export function UpdateMonsterTokenUseCase(token: Token, patch: Partial<Token>, member: CampaignMember): Token {
  if (!canEditToken(member, token) || token.kind === 'player') {
    throw new Error('No puedes editar este monstruo.')
  }

  return NormalizeTokenUseCase({ ...token, ...patch, updatedBy: member.userId })
}

export function UpdatePlayerTokenUseCase(token: Token, patch: Partial<Token>, member: CampaignMember): Token {
  if (!canEditToken(member, token) || token.kind !== 'player') {
    throw new Error('Solo el DM puede editar tokens de players.')
  }

  return NormalizeTokenUseCase({ ...token, ...patch, updatedBy: member.userId })
}

export function MoveOwnPlayerTokenUseCase(token: Token, point: Point, member: CampaignMember): Token {
  if (!canMoveToken(member, token)) {
    throw new Error('Solo puedes mover tu propia ficha.')
  }

  return NormalizeTokenUseCase({ ...token, x: point.x, y: point.y, updatedBy: member.userId })
}

export function SetOwnInitiativeUseCase(token: Token, turnOrder: TurnOrder, initiative: number, member: CampaignMember): TurnOrder {
  if (!canSetOwnInitiative(member, token)) {
    throw new Error('Solo puedes modificar tu propia iniciativa.')
  }

  const entryId = `turn_${token.id}`
  const nextEntry: TurnEntry = {
    id: entryId,
    tokenId: token.id,
    name: token.name,
    initiative,
    kind: token.kind,
    visibility: token.visibility,
  }
  const withoutCurrent = turnOrder.entries.filter((entry) => entry.tokenId !== token.id && entry.id !== entryId)
  return {
    ...turnOrder,
    entries: sortTurnEntries([...withoutCurrent, nextEntry]),
  }
}

export function SetTokenVisibilityUseCase(token: Token, visibility: Visibility, member: CampaignMember): Token {
  if (!canSetTokenVisibility(member)) {
    throw new Error('Solo el DM puede cambiar visibilidad.')
  }

  return NormalizeTokenUseCase({ ...token, visibility, updatedBy: member.userId })
}

export function DeleteMonsterTokenUseCase(
  tokens: Token[],
  turnOrder: TurnOrder,
  tokenId: ID,
  member: CampaignMember,
): { tokens: Token[]; turnOrder: TurnOrder; deletedToken?: Token; feedback: string } {
  const token = tokens.find((item) => item.id === tokenId)
  if (!token) {
    return { tokens, turnOrder, feedback: 'Token no encontrado.' }
  }

  if (!canDeleteToken(member, token) || token.kind === 'player') {
    throw new Error('Solo el DM puede borrar monstruos/NPCs/custom tokens.')
  }

  const nextEntries = turnOrder.entries.filter((entry) => entry.tokenId !== tokenId && entry.id !== `turn_${tokenId}`)
  const currentWasDeleted = turnOrder.entries[turnOrder.currentIndex]?.tokenId === tokenId
  const currentIndex = nextEntries.length ? Math.min(turnOrder.currentIndex, nextEntries.length - 1) : 0

  return {
    tokens: tokens.filter((item) => item.id !== tokenId),
    deletedToken: token,
    turnOrder: {
      ...turnOrder,
      entries: nextEntries,
      currentIndex,
    },
    feedback: currentWasDeleted ? 'Monstruo borrado; turno actual recalculado.' : 'Monstruo borrado.',
  }
}

export function DuplicateTokenUseCase(token: Token, member: CampaignMember): Token {
  if (!canEditToken(member, token)) {
    throw new Error('No puedes duplicar este token.')
  }

  return NormalizeTokenUseCase({
    ...token,
    id: createId('token'),
    name: `${token.name} copy`,
    x: token.x + 40,
    y: token.y + 40,
    isInTurnOrder: false,
    createdBy: member.userId,
    updatedBy: member.userId,
  })
}

export function ListVisibleMapElementsUseCase<T extends Token | BattleArea | MapAsset>(
  elements: T[],
  member: CampaignMember,
): T[] {
  return elements.filter((element) => {
    if ('stats' in element) {
      return canViewToken(member, element)
    }

    if ('strokeWidth' in element) {
      return canViewBattleArea(member, element)
    }

    return canViewVisibility(member, element.visibility)
  })
}

export function ListDmMapElementsUseCase<T extends Token | BattleArea | MapAsset>(elements: T[], member: CampaignMember): T[] {
  return isDm(member) ? elements : ListVisibleMapElementsUseCase(elements, member)
}

export function DeleteMapElementUseCase<T extends { id: ID }>(elements: T[], elementId: ID): T[] {
  return elements.filter((element) => element.id !== elementId)
}

export function CreatePlayerAreaUseCase(area: BattleArea, member: CampaignMember): BattleArea {
  return {
    ...area,
    visibility: isDm(member) ? area.visibility : 'public',
    createdByUserId: member.userId,
    updatedByUserId: member.userId,
  }
}

export function UpdatePlayerAreaUseCase(area: BattleArea, patch: Partial<BattleArea>, member: CampaignMember): BattleArea {
  const patchKeys = Object.keys(patch)
  const isLockOnlyPatch = patchKeys.length === 1 && patchKeys[0] === 'locked'

  if (isLockOnlyPatch && !canToggleBattleAreaLock(member, area)) {
    throw new Error('No puedes bloquear o desbloquear esta area.')
  }

  if (!isLockOnlyPatch && !canEditBattleArea(member, area)) {
    throw new Error('No puedes editar esta area.')
  }

  return {
    ...area,
    ...patch,
    visibility: isDm(member) ? patch.visibility ?? area.visibility : 'public',
    updatedByUserId: member.userId,
  }
}

export function DeleteOwnPlayerAreaUseCase(areas: BattleArea[], areaId: ID, member: CampaignMember): BattleArea[] {
  const area = areas.find((item) => item.id === areaId)
  if (!area || !canEditBattleArea(member, area)) {
    throw new Error('No puedes borrar esta area.')
  }

  return areas.filter((item) => item.id !== areaId)
}

export function DuplicateMapAreaForMemberUseCase(area: BattleArea, member: CampaignMember): BattleArea {
  if (!canEditBattleArea(member, area)) {
    throw new Error('No puedes duplicar esta area.')
  }

  return DuplicateBattleAreaUseCase(area, member.userId)
}

export function MeasureDistanceUseCase(start: Point, end: Point, gridSize: number): string {
  return `${distanceFeet(start, end, gridSize)} ft`
}

export function ValidateBattlemapPermissionsUseCase(member: CampaignMember, ownToken?: Token): BattlemapPermissionSummary {
  return {
    canCreateMonster: canCreateMonsterToken(member),
    canManageAllTokens: isDm(member),
    canManageMapElements: isDm(member),
    canMoveOwnToken: Boolean(ownToken && canMoveToken(member, ownToken)),
    canSetOwnInitiative: Boolean(ownToken && canSetOwnInitiative(member, ownToken)),
    canDrawAreas: Boolean(member),
  }
}
