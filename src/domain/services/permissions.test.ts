import { describe, expect, it } from 'vitest'
import type { CampaignMember } from '@domain/entities/common'
import { canCreateDrawing, canDeleteMap, canEditBattleArea, canEditCharacter, canEditInventoryItem, canViewLore, canViewNote, canViewQuest, canViewSecret } from './permissions'
import { createBlankCharacter, createBlankLoreEntry } from '@application/use-cases/workspaceFactories'
import { CreateBattleAreaUseCase } from '@application/use-cases/battleAreas'

const dm: CampaignMember = {
  id: 'member_dm',
  campaignId: 'campaign',
  userId: 'dm',
  role: 'dm',
  displayName: 'DM',
  canDrawOnMap: true,
}

const player: CampaignMember = {
  id: 'member_player',
  campaignId: 'campaign',
  userId: 'player',
  role: 'player',
  displayName: 'Player',
  characterId: 'character_own',
  canDrawOnMap: true,
}

describe('permissions', () => {
  it('allows the DM to edit any character', () => {
    const character = createBlankCharacter('campaign', 'another-player')

    expect(canEditCharacter(dm, character)).toBe(true)
  })

  it('keeps player character editing scoped to the owner', () => {
    const ownCharacter = { ...createBlankCharacter('campaign', 'player'), id: 'character_own' }
    const otherCharacter = createBlankCharacter('campaign', 'other')

    expect(canEditCharacter(player, ownCharacter)).toBe(true)
    expect(canEditCharacter(player, otherCharacter)).toBe(false)
  })

  it('hides secret-only content from players', () => {
    expect(canViewSecret(dm)).toBe(true)
    expect(canViewSecret(player)).toBe(false)
    expect(
      canViewQuest(player, {
        id: 'quest',
        campaignId: 'campaign',
        title: 'Hidden',
        description: '',
        status: 'hidden',
        steps: [],
        challenges: '',
        secret: 'secret',
      }),
    ).toBe(false)
  })

  it('allows inventory edits only to the owner or DM', () => {
    const ownCharacter = { ...createBlankCharacter('campaign', 'player'), id: 'character_own' }
    const otherCharacter = createBlankCharacter('campaign', 'other')

    expect(canEditInventoryItem(player, ownCharacter)).toBe(true)
    expect(canEditInventoryItem(player, otherCharacter)).toBe(false)
    expect(canEditInventoryItem(dm, otherCharacter)).toBe(true)
  })

  it('scopes map deletion and note visibility by role', () => {
    const dmNote = {
      id: 'note_dm',
      campaignId: 'campaign',
      title: 'Secret',
      content: '',
      tags: [],
      type: 'dm' as const,
      authorUserId: 'dm',
      authorName: 'DM',
      pinned: false,
      linkedCharacterIds: [],
      linkedLoreEntryIds: [],
      linkedMapIds: [],
      createdAt: '',
      updatedAt: '',
    }
    const partyNote = { ...dmNote, id: 'note_party', type: 'party' as const }

    expect(canDeleteMap(dm)).toBe(true)
    expect(canDeleteMap(player)).toBe(false)
    expect(canViewNote(player, partyNote)).toBe(true)
    expect(canViewNote(player, dmNote)).toBe(false)
    expect(canViewNote(dm, dmNote)).toBe(true)
  })

  it('can restrict lore visibility to selected players', () => {
    const lore = { ...createBlankLoreEntry('campaign', 'artifact'), visibleToPlayerIds: ['player'] }
    const otherPlayer = { ...player, id: 'member_other', userId: 'other', characterId: 'other_character' }

    expect(canViewLore(dm, lore)).toBe(true)
    expect(canViewLore(player, lore)).toBe(true)
    expect(canViewLore(otherPlayer, lore)).toBe(false)
    expect(canViewLore(player, { ...lore, visibleToPlayerIds: [] })).toBe(true)
  })

  it('lets every campaign member create measurements and edit their own public areas', () => {
    const tablePlayer = { ...player, canDrawOnMap: false }
    const ownArea = {
      ...CreateBattleAreaUseCase({
        campaignId: 'campaign',
        mapId: 'map',
        userId: tablePlayer.userId,
        type: 'line',
        start: { x: 0, y: 0 },
        end: { x: 70, y: 0 },
        color: '#22f0c8',
        visibility: 'public',
        placementMode: 'free',
      }),
      createdByUserId: tablePlayer.userId,
    }

    expect(canCreateDrawing(tablePlayer)).toBe(true)
    expect(canEditBattleArea(tablePlayer, ownArea)).toBe(true)
  })
})
