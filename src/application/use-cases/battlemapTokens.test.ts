import { describe, expect, it } from 'vitest'
import type { BattleArea, Token, TurnOrder } from '@domain/entities/battlemap'
import type { CampaignMember } from '@domain/entities/common'
import { CreateBattleAreaUseCase } from './battleAreas'
import { createBlankCharacter } from './workspaceFactories'
import {
  CreateMonsterTokenUseCase,
  CreatePlayerTokenUseCase,
  CreatePlayerAreaUseCase,
  DeleteMonsterTokenUseCase,
  DeleteOwnPlayerAreaUseCase,
  DuplicateTokenUseCase,
  ListDmMapElementsUseCase,
  ListVisibleMapElementsUseCase,
  MeasureDistanceUseCase,
  MoveOwnPlayerTokenUseCase,
  SetOwnInitiativeUseCase,
  SetTokenVisibilityUseCase,
  UpdateMonsterTokenUseCase,
  UpdatePlayerAreaUseCase,
  UpdatePlayerTokenUseCase,
  ValidateBattlemapPermissionsUseCase,
} from './battlemapTokens'

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
  characterId: 'character_player',
  canDrawOnMap: true,
}

function token(kind: Token['kind'], patch: Partial<Token> = {}): Token {
  return {
    id: `${kind}_token`,
    mapId: 'map',
    ownerCharacterId: kind === 'player' ? 'character_player' : undefined,
    ownerUserId: kind === 'player' ? 'player' : undefined,
    characterId: kind === 'player' ? 'character_player' : undefined,
    kind,
    name: kind,
    image: {},
    x: 10,
    y: 20,
    size: 1,
    rotation: 0,
    scale: 1,
    accentColor: '#22f0c8',
    borderColor: '#e7fff9',
    visibility: 'public',
    conditions: [],
    isLocked: false,
    isInTurnOrder: true,
    active: true,
    stats: {
      maxHp: 20,
      currentHp: 12,
      temporaryHp: 0,
      armorClass: 14,
      initiative: 2,
      speed: 30,
      creatureType: kind === 'player' ? 'Player character' : 'Monster',
      visibleNotes: '',
      secretNotes: '',
      notes: '',
    },
    ...patch,
  }
}

function area(patch: Partial<BattleArea> = {}): BattleArea {
  return {
    ...CreateBattleAreaUseCase({
      campaignId: 'campaign',
      mapId: 'map',
      userId: 'player',
      type: 'circle',
      start: { x: 0, y: 0 },
      end: { x: 70, y: 0 },
      color: '#22f0c8',
      visibility: 'public',
      placementMode: 'free',
    }),
    ...patch,
  }
}

describe('battlemap token use cases', () => {
  it('lets the DM create, update, duplicate, hide and delete monster tokens', () => {
    const monster = CreateMonsterTokenUseCase('map', dm, { name: 'Gloom sentinel', image: { url: 'data:image/png;base64,monster', alt: 'Gloom sentinel' } })
    const updated = UpdateMonsterTokenUseCase(monster, { name: 'Gloom sentinel elite' }, dm)
    const hidden = SetTokenVisibilityUseCase(updated, 'dm_only', dm)
    const duplicate = DuplicateTokenUseCase(hidden, dm)
    const turnOrder: TurnOrder = {
      id: 'turns',
      mapId: 'map',
      round: 1,
      currentIndex: 0,
      entries: [{ id: `turn_${hidden.id}`, tokenId: hidden.id, name: hidden.name, initiative: 12, kind: 'monster' }],
    }

    const result = DeleteMonsterTokenUseCase([hidden, duplicate], turnOrder, hidden.id, dm)

    expect(hidden.visibility).toBe('dm_only')
    expect(hidden.image).toMatchObject({ url: 'data:image/png;base64,monster', alt: 'Gloom sentinel' })
    expect(duplicate.id).not.toBe(hidden.id)
    expect(result.tokens).toEqual([duplicate])
    expect(result.turnOrder.entries).toHaveLength(0)
  })

  it('lets the DM create player tokens from character sheets', () => {
    const character = {
      ...createBlankCharacter('campaign', 'player'),
      id: 'character_player',
      name: 'Lira',
      ownerUserId: 'player',
      portrait: { url: 'data:image/png;base64,player', alt: 'Lira portrait' },
    }
    const playerToken = CreatePlayerTokenUseCase('map', character, dm)

    expect(playerToken).toMatchObject({
      kind: 'player',
      name: 'Lira',
      ownerCharacterId: 'character_player',
      ownerUserId: 'player',
      stats: {
        currentHp: character.currentHp,
        maxHp: character.maxHp,
        armorClass: character.armorClass,
      },
    })
    expect(playerToken.image).toMatchObject({ url: 'data:image/png;base64,player', alt: 'Lira portrait' })
    expect(() => CreatePlayerTokenUseCase('map', character, player)).toThrow('Solo el DM')
  })

  it('blocks players from creating or editing monsters and from editing player tokens directly', () => {
    const monster = token('monster')
    const playerToken = token('player')

    expect(() => CreateMonsterTokenUseCase('map', player)).toThrow('Solo el DM')
    expect(() => UpdateMonsterTokenUseCase(monster, { name: 'Nope' }, player)).toThrow()
    expect(() => UpdatePlayerTokenUseCase(playerToken, { name: 'Nope' }, player)).toThrow()
  })

  it('allows players to move only their own unlocked player token', () => {
    const ownToken = token('player')
    const lockedToken = token('player', { isLocked: true })
    const otherToken = token('player', { id: 'other', ownerCharacterId: 'other_character' })

    expect(MoveOwnPlayerTokenUseCase(ownToken, { x: 80, y: 90 }, player)).toMatchObject({ x: 80, y: 90 })
    expect(() => MoveOwnPlayerTokenUseCase(lockedToken, { x: 80, y: 90 }, player)).toThrow()
    expect(() => MoveOwnPlayerTokenUseCase(otherToken, { x: 80, y: 90 }, player)).toThrow()
  })

  it('lets players set only their own initiative entry', () => {
    const ownToken = token('player', { id: 'own_token', name: 'Lira' })
    const otherToken = token('player', { id: 'other_token', ownerCharacterId: 'other_character' })
    const turnOrder: TurnOrder = { id: 'turns', mapId: 'map', round: 1, currentIndex: 0, entries: [] }

    const nextTurnOrder = SetOwnInitiativeUseCase(ownToken, turnOrder, 18, player)

    expect(nextTurnOrder.entries[0]).toMatchObject({ tokenId: 'own_token', initiative: 18 })
    expect(() => SetOwnInitiativeUseCase(otherToken, turnOrder, 18, player)).toThrow()
  })

  it('filters DM-only elements from players but keeps them in the DM layer list', () => {
    const publicToken = token('monster', { id: 'public_token' })
    const hiddenToken = token('monster', { id: 'hidden_token', visibility: 'dm_only' })

    expect(ListVisibleMapElementsUseCase([publicToken, hiddenToken], player)).toEqual([publicToken])
    expect(ListDmMapElementsUseCase([publicToken, hiddenToken], dm)).toEqual([publicToken, hiddenToken])
  })

  it('forces player-created areas to public and scopes edits/deletes to their own areas', () => {
    const tablePlayer = { ...player, canDrawOnMap: false }
    const ownArea = CreatePlayerAreaUseCase(area({ visibility: 'dm_only' }), tablePlayer)
    const updatedArea = UpdatePlayerAreaUseCase(ownArea, { name: 'Safe line', visibility: 'dm_only' }, tablePlayer)
    const otherArea = area({ id: 'other_area', createdByUserId: 'other_player' })

    expect(ownArea.visibility).toBe('public')
    expect(updatedArea).toMatchObject({ name: 'Safe line', visibility: 'public' })
    expect(DeleteOwnPlayerAreaUseCase([ownArea], ownArea.id, tablePlayer)).toEqual([])
    expect(() => DeleteOwnPlayerAreaUseCase([otherArea], otherArea.id, tablePlayer)).toThrow()
  })

  it('summarizes battlemap permissions and measures grid distance', () => {
    const ownToken = token('player')
    const summary = ValidateBattlemapPermissionsUseCase(player, ownToken)

    expect(summary).toMatchObject({ canMoveOwnToken: true, canSetOwnInitiative: true, canDrawAreas: true })
    expect(ValidateBattlemapPermissionsUseCase({ ...player, canDrawOnMap: false }, ownToken).canDrawAreas).toBe(true)
    expect(MeasureDistanceUseCase({ x: 0, y: 0 }, { x: 140, y: 0 }, 70)).toBe('10 ft')
  })
})
