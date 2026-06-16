import type { CampaignMember, ID, Visibility } from '../entities/common'
import type { Character } from '../entities/character'
import type { LoreEntry } from '../entities/lore'
import type { CampaignNote } from '../entities/note'
import type { Quest } from '../entities/timeline'
import type { BattleArea, Drawing, MapAsset, Token } from '../entities/battlemap'
import type { InventoryContainer, InventoryItem } from '../entities/inventory'

export function isDm(member?: CampaignMember): boolean {
  return member?.role === 'dm'
}

export function canEditCharacter(member: CampaignMember | undefined, character: Character): boolean {
  if (!member) {
    return false
  }

  return isDm(member) || character.ownerUserId === member.userId
}

export function canViewCharacter(member: CampaignMember | undefined, character: Character): boolean {
  if (!member) {
    return false
  }

  if (isDm(member)) {
    return true
  }

  return (character.isVisibleToPlayer ?? true) && (character.ownerUserId === member.userId || member.characterId === character.id)
}

export function canManageWorld(member?: CampaignMember): boolean {
  return isDm(member)
}

export function canViewSecret(member?: CampaignMember): boolean {
  return isDm(member)
}

export function canViewQuest(member: CampaignMember | undefined, quest: Quest): boolean {
  return isDm(member) || quest.status !== 'hidden'
}

export function canViewLore(member: CampaignMember | undefined, entry: LoreEntry): boolean {
  if (isDm(member)) {
    return true
  }

  if (!member || !entry.isVisibleToPlayers) {
    return false
  }

  const visibleToPlayerIds = entry.visibleToPlayerIds ?? []
  return visibleToPlayerIds.length === 0 || visibleToPlayerIds.includes(member.userId)
}

export function canViewVisibility(member: CampaignMember | undefined, visibility: Visibility): boolean {
  return visibility === 'public' || isDm(member)
}

export function isDmOnlyVisibility(visibility: Visibility): boolean {
  return visibility === 'dm' || visibility === 'dm_only'
}

export function canMoveToken(member: CampaignMember | undefined, token: Token): boolean {
  if (!member) {
    return false
  }

  return isDm(member) || (token.kind === 'player' && !token.isLocked && token.ownerCharacterId === member.characterId)
}

export function canEditToken(member: CampaignMember | undefined, token: Token): boolean {
  void token
  return isDm(member)
}

export function canCreateMonsterToken(member: CampaignMember | undefined): boolean {
  return isDm(member)
}

export function canDeleteToken(member: CampaignMember | undefined, token: Token): boolean {
  void token
  return isDm(member)
}

export function canSetTokenVisibility(member: CampaignMember | undefined): boolean {
  return isDm(member)
}

export function canSetOwnInitiative(member: CampaignMember | undefined, token: Token): boolean {
  if (!member) {
    return false
  }

  return isDm(member) || (token.kind === 'player' && token.ownerCharacterId === member.characterId)
}

export function canCreateDrawing(member?: CampaignMember): boolean {
  return Boolean(member)
}

export function canEditBattleArea(member: CampaignMember | undefined, area: BattleArea): boolean {
  if (!member || area.locked) {
    return false
  }

  return isDm(member) || (area.visibility === 'public' && area.createdByUserId === member.userId)
}

export function canViewBattleArea(member: CampaignMember | undefined, area: BattleArea): boolean {
  return !area.hidden && canViewVisibility(member, area.visibility)
}

export function canEditMapAsset(member: CampaignMember | undefined, asset: MapAsset): boolean {
  return Boolean(member && !asset.locked && isDm(member))
}

export function canDeleteMap(member: CampaignMember | undefined): boolean {
  return isDm(member)
}

export function canViewNote(member: CampaignMember | undefined, note: CampaignNote): boolean {
  if (!member) {
    return false
  }

  if (isDm(member)) {
    return true
  }

  if (note.type === 'party') {
    return member.campaignId === note.campaignId
  }

  if (note.type === 'personal') {
    return note.authorUserId === member.userId
  }

  return false
}

export function canEditNote(member: CampaignMember | undefined, note: CampaignNote): boolean {
  if (!member) {
    return false
  }

  if (isDm(member)) {
    return true
  }

  return note.authorUserId === member.userId && note.type !== 'dm'
}

export function canViewDrawing(member: CampaignMember | undefined, drawing: Drawing): boolean {
  return canViewVisibility(member, drawing.visibility)
}

export function canViewToken(member: CampaignMember | undefined, token: Token): boolean {
  return canViewVisibility(member, token.visibility)
}

export function canEditInventoryContainer(member: CampaignMember | undefined, character: Character): boolean {
  return canEditCharacter(member, character)
}

export function canEditInventoryItem(member: CampaignMember | undefined, character: Character): boolean {
  return canEditCharacter(member, character)
}

export function containerBelongsToCharacter(container: InventoryContainer, character: Character): boolean {
  return container.characterId === character.id
}

export function itemBelongsToCharacter(item: InventoryItem, character: Character): boolean {
  return item.characterId === character.id
}

export function findMemberByUserId(members: CampaignMember[], userId: ID): CampaignMember | undefined {
  return members.find((member) => member.userId === userId)
}
