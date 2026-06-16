import type { Character, CharacterFeature, RecoveryType } from '@domain/entities/character'
import { ClearPendingSpellSlotsUseCase, RestoreSpellSlotsUseCase } from './characterSpells'
import { createDefaultTurnState } from './workspaceFactories'

export type CharacterRestType = 'short' | 'long'

export interface CharacterRestResult {
  character: Character
  summary: string[]
}

function restoreFeature(feature: CharacterFeature, recoveries: RecoveryType[]): CharacterFeature {
  if (!recoveries.includes(feature.recovery)) {
    return feature
  }

  return {
    ...feature,
    active: false,
    currentUses: feature.maxUses ?? feature.currentUses,
  }
}

function restoreFeatures(features: CharacterFeature[], recoveries: RecoveryType[]): CharacterFeature[] {
  return features.map((feature) => restoreFeature(feature, recoveries))
}

function restoreOneSpentSpellSlotPerLevel(character: Character): Character['spellSlots'] {
  return character.spellSlots.map((slot) => ({
    ...slot,
    currentSlots: Math.min(slot.maxSlots, slot.currentSlots + (slot.currentSlots < slot.maxSlots ? 1 : 0)),
    pendingSlots: 0,
  }))
}

function resetTurnResources(character: Character): Pick<Character, 'actions' | 'attacks' | 'triggers' | 'turnState'> {
  return {
    turnState: createDefaultTurnState(character.speed, character.turnState.attacksPerAction),
    actions: character.actions.map((action) => ({ ...action, used: false })),
    attacks: character.attacks.map((attack) => ({ ...attack, used: false })),
    triggers: character.triggers.map((trigger) => ({ ...trigger, active: false })),
  }
}

export function ApplyShortRestUseCase(character: Character): CharacterRestResult {
  const healedHp = Math.min(character.maxHp, character.currentHp + Math.ceil(character.maxHp / 2))
  const turnResources = resetTurnResources(character)

  return {
    character: {
      ...character,
      ...turnResources,
      currentHp: healedHp,
      deathSaves: { successes: 0, failures: 0 },
      features: restoreFeatures(character.features, ['turn', 'shortRest']),
      traits: restoreFeatures(character.traits, ['turn', 'shortRest']),
      spellSlots: restoreOneSpentSpellSlotPerLevel(character),
    },
    summary: ['HP parcial', 'features de short rest', 'slots parcialmente recargados'],
  }
}

export function ApplyLongRestUseCase(character: Character): CharacterRestResult {
  const turnResources = resetTurnResources(character)

  return {
    character: {
      ...character,
      ...turnResources,
      currentHp: character.maxHp,
      temporaryHp: 0,
      deathSaves: { successes: 0, failures: 0 },
      exhaustion: Math.max(0, character.exhaustion - 1),
      hitDice: { ...character.hitDice, remaining: character.hitDice.total },
      features: restoreFeatures(character.features, ['turn', 'shortRest', 'longRest']),
      traits: restoreFeatures(character.traits, ['turn', 'shortRest', 'longRest']),
      spellSlots: RestoreSpellSlotsUseCase(ClearPendingSpellSlotsUseCase(character.spellSlots)),
    },
    summary: ['HP completo', 'spell slots completos', 'features y traits recargados'],
  }
}
