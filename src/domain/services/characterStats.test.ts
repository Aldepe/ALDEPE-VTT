import { describe, expect, it } from 'vitest'
import { createBlankCharacter } from '@application/use-cases/workspaceFactories'
import { recalculateCharacterBonuses } from './characterStats'

describe('characterStats', () => {
  it('recalculates proficiency and expertise bonuses immediately', () => {
    const character = createBlankCharacter('campaign', 'player')
    const athletics = character.skills.find((skill) => skill.name === 'athletics')

    const recalculated = recalculateCharacterBonuses({
      ...character,
      skills: character.skills.map((skill) =>
        skill.name === 'athletics' ? { ...skill, proficient: true, expertise: true } : skill,
      ),
    })
    const nextAthletics = recalculated.skills.find((skill) => skill.name === 'athletics')

    expect(athletics?.bonus).toBe(0)
    expect(nextAthletics?.bonus).toBe(4)
  })

  it('honors passive score overrides while recalculating other passives', () => {
    const character = createBlankCharacter('campaign', 'player')
    const recalculated = recalculateCharacterBonuses({
      ...character,
      passiveOverrides: { perception: 18 },
      skills: character.skills.map((skill) =>
        skill.name === 'investigation' ? { ...skill, proficient: true } : skill,
      ),
    })

    expect(recalculated.passivePerception).toBe(18)
    expect(recalculated.passiveInvestigation).toBe(12)
  })

  it('applies exhaustion penalties to d20 stats and derived passives', () => {
    const character = createBlankCharacter('campaign', 'player')
    const recalculated = recalculateCharacterBonuses({
      ...character,
      exhaustion: 1,
    })

    expect(recalculated.savingThrows.find((save) => save.ability === 'str')?.bonus).toBe(-2)
    expect(recalculated.skills.find((skill) => skill.name === 'acrobatics')?.bonus).toBe(-2)
    expect(recalculated.initiativeBonus).toBe(-2)
    expect(recalculated.passivePerception).toBe(8)
  })
})
