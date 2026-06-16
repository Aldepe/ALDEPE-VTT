import type { Character, CharacterSpell, CharacterSpellSlot, SpellEffectCategory } from '@domain/entities/character'
import { createDefaultSpell } from './workspaceFactories'
import { createId } from '@shared/utils/id'

export const spellEffectCategoryLabels: Record<SpellEffectCategory, string> = {
  damage: 'Damage',
  healing: 'Healing',
  control: 'Control',
  buff: 'Buff',
  debuff: 'Debuff',
  utility: 'Utility',
  defense: 'Defense',
  mobility: 'Mobility',
  summoning: 'Summoning',
  detection: 'Detection',
  illusion: 'Illusion',
  charm: 'Charm',
  area: 'Area of Effect',
  singleTarget: 'Single Target',
  concentration: 'Concentration',
  ritual: 'Ritual',
}

export const spellEffectIconLabels = {
  spark: 'Destello',
  flame: 'Llama',
  leaf: 'Hoja vital',
  shield: 'Escudo',
  boots: 'Movimiento',
  mask: 'Ilusion',
  heart: 'Encanto',
  portal: 'Portal',
  eye: 'Deteccion',
  rune: 'Runa',
} as const

export const spellSchoolIconLabels = {
  abjuration: 'Escudo arcano',
  conjuration: 'Portal',
  divination: 'Ojo estelar',
  enchantment: 'Corazon hipnotico',
  evocation: 'Explosion prismatica',
  illusion: 'Mascara lunar',
  necromancy: 'Calavera luminosa',
  transmutation: 'Espiral alquimica',
  universal: 'Runa abierta',
} as const

const normalizedSchoolIcon: Record<string, keyof typeof spellSchoolIconLabels> = {
  abjuration: 'abjuration',
  conjuration: 'conjuration',
  divination: 'divination',
  enchantment: 'enchantment',
  evocation: 'evocation',
  illusion: 'illusion',
  necromancy: 'necromancy',
  transmutation: 'transmutation',
}

export function SchoolIconForSpellSchoolUseCase(school: string): keyof typeof spellSchoolIconLabels {
  return normalizedSchoolIcon[school.trim().toLowerCase()] ?? 'universal'
}

export function SetCharacterSpellcastingEnabledUseCase(character: Character, isSpellcaster: boolean): Character {
  return {
    ...character,
    spellcasting: {
      ...character.spellcasting,
      isSpellcaster,
      ability: isSpellcaster ? character.spellcasting.ability ?? 'cha' : character.spellcasting.ability,
    },
  }
}

export function ListCharacterSpellsUseCase(
  character: Character,
  query = '',
  spellLevel?: number,
  preparedOnly = false,
  category?: SpellEffectCategory,
): CharacterSpell[] {
  const normalizedQuery = query.trim().toLowerCase()
  return character.spells
    .filter((spell) => (spellLevel === undefined ? true : spell.spellLevel === spellLevel))
    .filter((spell) => (preparedOnly ? spell.prepared : true))
    .filter((spell) => (category ? spell.effectCategory === category || spell.secondaryCategories.includes(category) : true))
    .filter((spell) => {
      if (!normalizedQuery) {
        return true
      }

      return `${spell.name} ${spell.school} ${spell.summary} ${spell.effectCategory}`.toLowerCase().includes(normalizedQuery)
    })
    .sort((left, right) => left.spellLevel - right.spellLevel || left.name.localeCompare(right.name))
}

export function ListAvailableSpellsForActionUseCase(character: Character): CharacterSpell[] {
  if (!character.spellcasting.isSpellcaster) {
    return []
  }

  return character.spells
    .filter((spell) => spell.known && (spell.prepared || spell.spellLevel === 0))
    .sort((left, right) => left.spellLevel - right.spellLevel || left.name.localeCompare(right.name))
}

export function SpendSpellSlotUseCase(slots: CharacterSpellSlot[], spellLevel: number): CharacterSpellSlot[] {
  return slots.map((slot) =>
    slot.spellLevel === spellLevel
      ? { ...slot, currentSlots: Math.max(0, slot.currentSlots - 1), pendingSlots: Math.max(0, slot.pendingSlots - 1) }
      : slot,
  )
}

export function RestoreSpellSlotsUseCase(slots: CharacterSpellSlot[]): CharacterSpellSlot[] {
  return slots.map((slot) => ({ ...slot, currentSlots: slot.maxSlots, pendingSlots: 0 }))
}

export function MarkSpellSlotPendingUseCase(slots: CharacterSpellSlot[], spellLevel: number): CharacterSpellSlot[] {
  return slots.map((slot) =>
    slot.spellLevel === spellLevel
      ? { ...slot, pendingSlots: Math.min(slot.currentSlots, slot.pendingSlots + 1) }
      : slot,
  )
}

export function ClearPendingSpellSlotsUseCase(slots: CharacterSpellSlot[]): CharacterSpellSlot[] {
  return slots.map((slot) => ({ ...slot, pendingSlots: 0 }))
}

export function CreateCharacterSpellUseCase(): CharacterSpell {
  return createDefaultSpell()
}

export function UpdateCharacterSpellUseCase(spell: CharacterSpell, patch: Partial<CharacterSpell>): CharacterSpell {
  const nextSchool = patch.school ?? spell.school
  return {
    ...spell,
    ...patch,
    id: spell.id,
    schoolIcon: patch.schoolIcon ?? SchoolIconForSpellSchoolUseCase(nextSchool),
  }
}

export function DuplicateCharacterSpellUseCase(spell: CharacterSpell): CharacterSpell {
  return {
    ...spell,
    id: createId('spell'),
    name: `${spell.name} copy`,
    prepared: false,
  }
}

export function DeleteCharacterSpellUseCase(spells: CharacterSpell[], spellId: string): CharacterSpell[] {
  return spells.filter((spell) => spell.id !== spellId)
}
