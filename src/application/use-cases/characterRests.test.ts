import { describe, expect, it } from 'vitest'
import { createBlankCharacter, createDefaultSpellSlot } from './workspaceFactories'
import { ApplyLongRestUseCase, ApplyShortRestUseCase } from './characterRests'

describe('character rest use cases', () => {
  it('applies a short rest with partial healing, short-rest features and partial slot recovery', () => {
    const character = createBlankCharacter('campaign', 'player')
    const feature = { ...character.features[0], currentUses: 0, maxUses: 1, recovery: 'shortRest' as const, active: true }
    const spentSlot = { ...createDefaultSpellSlot(), spellLevel: 1, maxSlots: 2, currentSlots: 0, pendingSlots: 1 }

    const result = ApplyShortRestUseCase({
      ...character,
      currentHp: 1,
      features: [feature],
      spellSlots: [spentSlot],
      turnState: { ...character.turnState, actionSpent: true },
    }).character

    expect(result.currentHp).toBe(5)
    expect(result.features[0]).toMatchObject({ currentUses: 1, active: false })
    expect(result.spellSlots[0]).toMatchObject({ currentSlots: 1, pendingSlots: 0 })
    expect(result.turnState.actionSpent).toBe(false)
  })

  it('applies a long rest with full healing, full spells, hit dice and long-rest traits', () => {
    const character = createBlankCharacter('campaign', 'player')
    const trait = { ...character.features[0], id: 'trait_1', currentUses: 0, maxUses: 2, recovery: 'longRest' as const, active: true }
    const spentSlot = { ...createDefaultSpellSlot(), spellLevel: 1, maxSlots: 2, currentSlots: 0, pendingSlots: 1 }

    const result = ApplyLongRestUseCase({
      ...character,
      currentHp: 1,
      temporaryHp: 4,
      exhaustion: 2,
      hitDice: { ...character.hitDice, total: 4, remaining: 0 },
      traits: [trait],
      spellSlots: [spentSlot],
    }).character

    expect(result.currentHp).toBe(character.maxHp)
    expect(result.temporaryHp).toBe(0)
    expect(result.exhaustion).toBe(1)
    expect(result.hitDice.remaining).toBe(4)
    expect(result.traits[0]).toMatchObject({ currentUses: 2, active: false })
    expect(result.spellSlots[0]).toMatchObject({ currentSlots: 2, pendingSlots: 0 })
  })
})
