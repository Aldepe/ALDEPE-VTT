import type { AbilityKey, Character, CharacterSkill, SavingThrow, SkillName } from '../entities/character'

export const abilityLabels: Record<AbilityKey, string> = {
  str: 'Fuerza',
  dex: 'Destreza',
  con: 'Constitucion',
  int: 'Inteligencia',
  wis: 'Sabiduria',
  cha: 'Carisma',
}

export const skillLabels: Record<SkillName, string> = {
  acrobatics: 'Acrobacias',
  animalHandling: 'Trato con animales',
  arcana: 'Arcana',
  athletics: 'Atletismo',
  deception: 'Engano',
  history: 'Historia',
  insight: 'Perspicacia',
  intimidation: 'Intimidacion',
  investigation: 'Investigacion',
  medicine: 'Medicina',
  nature: 'Naturaleza',
  perception: 'Percepcion',
  performance: 'Interpretacion',
  persuasion: 'Persuasion',
  religion: 'Religion',
  sleightOfHand: 'Juego de manos',
  stealth: 'Sigilo',
  survival: 'Supervivencia',
}

const skillAbilityMap: Record<SkillName, AbilityKey> = {
  acrobatics: 'dex',
  animalHandling: 'wis',
  arcana: 'int',
  athletics: 'str',
  deception: 'cha',
  history: 'int',
  insight: 'wis',
  intimidation: 'cha',
  investigation: 'int',
  medicine: 'wis',
  nature: 'int',
  perception: 'wis',
  performance: 'cha',
  persuasion: 'cha',
  religion: 'int',
  sleightOfHand: 'dex',
  stealth: 'dex',
  survival: 'wis',
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonusForLevel(level: number): number {
  return 2 + Math.floor((Math.max(1, level) - 1) / 4)
}

export function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value)
}

export function exhaustionStatPenalty(exhaustion: number): number {
  return Math.max(0, exhaustion) * 2
}

export function createDefaultSavingThrows(character: Pick<Character, 'abilities' | 'proficiencyBonus'>): SavingThrow[] {
  return (Object.keys(character.abilities) as AbilityKey[]).map((ability) => ({
    ability,
    proficient: false,
    bonus: abilityModifier(character.abilities[ability]),
  }))
}

export function createDefaultSkills(character: Pick<Character, 'abilities' | 'proficiencyBonus'>): CharacterSkill[] {
  return (Object.keys(skillAbilityMap) as SkillName[]).map((name) => {
    const ability = skillAbilityMap[name]
    return {
      name,
      ability,
      proficient: false,
      expertise: false,
      bonus: abilityModifier(character.abilities[ability]),
    }
  })
}

export function recalculateCharacterBonuses(character: Character): Character {
  const proficiencyBonus = proficiencyBonusForLevel(character.level)
  const statPenalty = exhaustionStatPenalty(character.exhaustion)
  const savingThrows = character.savingThrows.map((save) => ({
    ...save,
    bonus: abilityModifier(character.abilities[save.ability]) + (save.proficient ? proficiencyBonus : 0) - statPenalty,
  }))
  const skills = character.skills.map((skill) => ({
    ...skill,
    bonus:
      abilityModifier(character.abilities[skill.ability]) +
      (skill.proficient ? proficiencyBonus : 0) +
      (skill.expertise ? proficiencyBonus : 0) -
      statPenalty,
  }))
  const computedPassivePerception =
    10 + (skills.find((skill) => skill.name === 'perception')?.bonus ?? abilityModifier(character.abilities.wis))
  const computedPassiveInvestigation =
    10 + (skills.find((skill) => skill.name === 'investigation')?.bonus ?? abilityModifier(character.abilities.int))
  const computedPassiveInsight =
    10 + (skills.find((skill) => skill.name === 'insight')?.bonus ?? abilityModifier(character.abilities.wis))

  return {
    ...character,
    proficiencyBonus,
    passivePerception: character.passiveOverrides?.perception ?? computedPassivePerception,
    passiveInvestigation: character.passiveOverrides?.investigation ?? computedPassiveInvestigation,
    passiveInsight: character.passiveOverrides?.insight ?? computedPassiveInsight,
    initiativeBonus: abilityModifier(character.abilities.dex) - statPenalty,
    spellcasting: character.spellcasting,
    savingThrows,
    skills,
    updatedAt: new Date().toISOString(),
  }
}
