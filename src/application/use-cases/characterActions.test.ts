import { describe, expect, it } from 'vitest'
import { createBlankCharacter, createDefaultSpell, createDefaultSpellSlot } from './workspaceFactories'
import {
  ActivateCharacterTriggerUseCase,
  ComputeTurnPlanUseCase,
  CreateTurnPlanUseCase,
  DeleteCharacterActionUseCase,
  ListTurnActionOptionsByCostUseCase,
  ListCharacterActionsUseCase,
  manualRollTotal,
  RemoveTurnPlanItemsForDeletedActionUseCase,
  ResetTurnResourcesUseCase,
  SelectTurnActionUseCase,
  ToggleCharacterFeatureUseCase,
  UndoLastComputedTurnUseCase,
  UseCharacterActionUseCase,
  ValidateTurnPlanUseCase,
} from './characterActions'

describe('character action use cases', () => {
  it('lists guided actions and weapon attacks', () => {
    const character = createBlankCharacter('campaign', 'player')
    const actions = ListCharacterActionsUseCase(character)

    expect(actions.some((action) => action.name === 'Use an Object')).toBe(true)
    expect(actions.some((action) => action.name === 'Arma principal')).toBe(true)
  })

  it('spends action, bonus action and reaction resources', () => {
    const character = createBlankCharacter('campaign', 'player')

    expect(UseCharacterActionUseCase(character, 'action').turnState.actionSpent).toBe(true)
    expect(UseCharacterActionUseCase(character, 'bonusAction').turnState.bonusActionSpent).toBe(true)
    expect(UseCharacterActionUseCase(character, 'reaction').turnState.reactionSpent).toBe(true)
  })

  it('resets turn resources', () => {
    const character = UseCharacterActionUseCase(createBlankCharacter('campaign', 'player'), 'action')
    const reset = ResetTurnResourcesUseCase(character)

    expect(reset.turnState.actionSpent).toBe(false)
    expect(reset.turnState.bonusActionSpent).toBe(false)
    expect(reset.turnState.reactionSpent).toBe(false)
  })

  it('activates triggers and features', () => {
    const character = createBlankCharacter('campaign', 'player')

    expect(ActivateCharacterTriggerUseCase(character.triggers[0]).active).toBe(true)
    expect(ToggleCharacterFeatureUseCase(character.features[0]).active).toBe(true)
  })

  it('calculates manual physical roll totals', () => {
    expect(manualRollTotal(14, 5)).toBe(19)
  })

  it('plans actions before computing and rejects Dash plus Attack with one Action', () => {
    const character = createBlankCharacter('campaign', 'player')
    const dash = character.actions[0]
    const plan = SelectTurnActionUseCase(
      SelectTurnActionUseCase(CreateTurnPlanUseCase(character), { attack: character.attacks[0] }),
      { action: { ...dash, name: 'Dash', actionCost: 'action' } },
    )
    const validated = ValidateTurnPlanUseCase(character, plan)

    expect(validated.status).toBe('invalid')
    expect(validated.validationErrors[0]).toContain('Dash y Attack')
    expect(character.turnState.actionSpent).toBe(false)
  })

  it('deletes custom actions and removes them from the draft plan', () => {
    const character = createBlankCharacter('campaign', 'player')
    const action = character.actions[0]
    const plan = SelectTurnActionUseCase(CreateTurnPlanUseCase(character), { action })

    const nextCharacter = DeleteCharacterActionUseCase(character, action.id)
    const nextPlan = RemoveTurnPlanItemsForDeletedActionUseCase(plan, { actionId: action.id })

    expect(nextCharacter.actions.some((candidate) => candidate.id === action.id)).toBe(false)
    expect(nextPlan.items).toHaveLength(0)
  })

  it('groups planning options by cost and hides Cast Spell for non spellcasters', () => {
    const character = createBlankCharacter('campaign', 'player')
    const options = ListTurnActionOptionsByCostUseCase(character, 15)
    const actionLabels = options.consumeAction.map((option) => option.label)

    expect(actionLabels).toEqual(expect.arrayContaining(['Attack', 'Dash', 'Disengage', 'Hide', 'Use Object']))
    expect(actionLabels).not.toEqual(expect.arrayContaining(['Cast Spell', 'Dodge', 'Help', 'Ready', 'Search']))
    expect('freeAction' in options).toBe(false)
    expect(options.movement.map((option) => option.label)).toEqual(expect.arrayContaining(['Move', 'Climb', 'Swim', 'Jump', 'Stand up']))
  })

  it('only exposes Cast Spell when spellcasting is enabled and prepared spells exist', () => {
    const character = {
      ...createBlankCharacter('campaign', 'player'),
      spellcasting: { isSpellcaster: true, ability: 'cha' as const, saveDc: 12, attackBonus: 4, knownSpells: 1, preparedSpells: 1 },
      spellSlots: [{ ...createDefaultSpellSlot(), id: 'slot_1', spellLevel: 1, maxSlots: 1, currentSlots: 1 }],
      spells: [{ ...createDefaultSpell(), id: 'spell_1', castingTime: 'action' as const, known: true, prepared: true }],
    }
    const options = ListTurnActionOptionsByCostUseCase(character, 15)

    expect(options.consumeAction.map((option) => option.label)).toContain('Cast Spell')
  })

  it('computes a valid spell plan and undo restores the previous slot', () => {
    const character = {
      ...createBlankCharacter('campaign', 'player'),
      spellcasting: { isSpellcaster: true, ability: 'cha' as const, saveDc: 12, attackBonus: 4, knownSpells: 1, preparedSpells: 1 },
      spellSlots: [{ ...createDefaultSpellSlot(), id: 'slot_1', spellLevel: 1, maxSlots: 2, currentSlots: 2 }],
      spells: [{ ...createDefaultSpell(), id: 'spell_1' }],
    }
    const plan = SelectTurnActionUseCase(CreateTurnPlanUseCase(character), { spell: character.spells[0] })
    const result = ComputeTurnPlanUseCase(character, plan)

    expect(result.plan.status).toBe('computed')
    expect(result.character.turnState.actionSpent).toBe(true)
    expect(result.character.spellSlots[0].currentSlots).toBe(1)
    expect(UndoLastComputedTurnUseCase(result.character, character).spellSlots[0].currentSlots).toBe(2)
  })
})
