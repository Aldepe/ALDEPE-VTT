import { describe, expect, it } from 'vitest'
import type { CampaignMember } from '@domain/entities/common'
import { canDeleteMap, canEditCharacter, canEditInventoryItem, canViewNote, canViewQuest, canViewSecret } from './permissions'
import { createBlankCharacter } from '@application/use-cases/workspaceFactories'

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
})
