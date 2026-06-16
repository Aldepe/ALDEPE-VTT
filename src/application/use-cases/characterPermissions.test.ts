import { describe, expect, it } from 'vitest'
import type { CampaignMember } from '@domain/entities/common'
import { createBlankCharacter } from './workspaceFactories'
import { ValidateCharacterEditPermissionsUseCase } from './characterPermissions'

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

describe('character permissions use cases', () => {
  it('allows DM edits and scopes player edits to their own character', () => {
    const ownCharacter = { ...createBlankCharacter('campaign', 'player'), id: 'character_own' }
    const otherCharacter = createBlankCharacter('campaign', 'other')

    expect(ValidateCharacterEditPermissionsUseCase(dm, otherCharacter)).toBe(true)
    expect(ValidateCharacterEditPermissionsUseCase(player, ownCharacter)).toBe(true)
    expect(ValidateCharacterEditPermissionsUseCase(player, otherCharacter)).toBe(false)
  })
})
