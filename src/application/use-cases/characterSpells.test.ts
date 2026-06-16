import { describe, expect, it } from 'vitest'
import { createBlankCharacter, createDefaultSpell, createDefaultSpellSlot } from './workspaceFactories'
import {
  DeleteCharacterSpellUseCase,
  DuplicateCharacterSpellUseCase,
  ListAvailableSpellsForActionUseCase,
  ListCharacterSpellsUseCase,
  MarkSpellSlotPendingUseCase,
  RestoreSpellSlotsUseCase,
  SetCharacterSpellcastingEnabledUseCase,
  SpendSpellSlotUseCase,
} from './characterSpells'

describe('character spell use cases', () => {
  it('filters prepared spells and spends/restores spell slots', () => {
    const spell = createDefaultSpell()
    const character = {
      ...createBlankCharacter('campaign', 'player'),
      spells: [spell, { ...spell, id: 'spell_two', name: 'Dormant spell', prepared: false, effectCategory: 'utility' as const }],
      spellSlots: [{ ...createDefaultSpellSlot(), spellLevel: 1, maxSlots: 3, currentSlots: 3 }],
    }

    expect(ListCharacterSpellsUseCase(character, '', undefined, true)).toHaveLength(1)
    expect(ListCharacterSpellsUseCase(character, '', undefined, false, 'damage')).toHaveLength(1)
    expect(MarkSpellSlotPendingUseCase(character.spellSlots, 1)[0].pendingSlots).toBe(1)
    expect(SpendSpellSlotUseCase(character.spellSlots, 1)[0].currentSlots).toBe(2)
    expect(RestoreSpellSlotsUseCase([{ ...character.spellSlots[0], currentSlots: 0 }])[0].currentSlots).toBe(3)
  })

  it('filters action spell choices by spellcasting, known and prepared state', () => {
    const spell = createDefaultSpell()
    const dormant = { ...spell, id: 'spell_two', name: 'Dormant spell', prepared: false, known: true }
    const character = {
      ...SetCharacterSpellcastingEnabledUseCase(createBlankCharacter('campaign', 'player'), true),
      spells: [spell, dormant],
    }

    expect(ListAvailableSpellsForActionUseCase(character).map((item) => item.name)).toEqual(['Luz prismatica'])
    expect(ListAvailableSpellsForActionUseCase(SetCharacterSpellcastingEnabledUseCase(character, false))).toHaveLength(0)
  })

  it('duplicates and deletes editable spells', () => {
    const spell = createDefaultSpell()
    const duplicate = DuplicateCharacterSpellUseCase(spell)

    expect(duplicate.id).not.toBe(spell.id)
    expect(duplicate.prepared).toBe(false)
    expect(DeleteCharacterSpellUseCase([spell, duplicate], spell.id)).toEqual([duplicate])
  })
})
