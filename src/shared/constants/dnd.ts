import type { AbilityKey } from '@domain/entities/character'
import { abilityLabels } from '@domain/services/characterStats'

export const abilityOrder: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const abilityOptions = abilityOrder.map((key) => ({
  key,
  label: abilityLabels[key],
}))

export const conditionOptions = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Exhaustion',
]

export interface VisualPresetOption {
  color: string
  icon: string
  label: string
  summary: string
}

export const conditionPresetOptions: VisualPresetOption[] = conditionOptions.map((label) => ({
  label,
  icon: label === 'Poisoned' ? 'poison' : label === 'Invisible' ? 'eye' : label === 'Exhaustion' ? 'hourglass' : 'condition',
  color: label === 'Poisoned' ? '#7cff6b' : label === 'Exhaustion' ? '#f7e66f' : '#b686ff',
  summary: 'Estado breve editable por el DM.',
}))

export const languagePresetOptions: VisualPresetOption[] = [
  'Common',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
  'Abyssal',
  'Celestial',
  'Draconic',
  'Deep Speech',
  'Infernal',
  'Primordial',
  'Sylvan',
  'Undercommon',
  'Custom',
].map((label) => ({ label, icon: 'language', color: '#22f0c8', summary: 'Lengua o dialecto conocido.' }))

export const toolPresetOptions: VisualPresetOption[] = [
  "Thieves' Tools",
  'Herbalism Kit',
  'Disguise Kit',
  'Forgery Kit',
  "Poisoner's Kit",
  "Navigator's Tools",
  "Smith's Tools",
  "Tinker's Tools",
  "Carpenter's Tools",
  "Mason's Tools",
  "Brewer's Supplies",
  "Cook's Utensils",
  'Musical Instrument',
  'Gaming Set',
  'Vehicles',
  'Custom',
].map((label) => ({ label, icon: 'tool', color: '#f7e66f', summary: 'Proficiency de herramienta.' }))

export const weaponProficiencyPresetOptions: VisualPresetOption[] = [
  'Simple Weapons',
  'Martial Weapons',
  'Clubs',
  'Daggers',
  'Greatclubs',
  'Handaxes',
  'Javelins',
  'Light Hammers',
  'Maces',
  'Quarterstaffs',
  'Sickles',
  'Spears',
  'Crossbows',
  'Shortbows',
  'Longbows',
  'Swords',
  'Axes',
  'Custom',
].map((label) => ({ label, icon: 'weapon', color: '#ff4fa3', summary: 'Proficiency de arma o grupo.' }))

export const armorProficiencyPresetOptions: VisualPresetOption[] = [
  'Light Armor',
  'Medium Armor',
  'Heavy Armor',
  'Shields',
  'Custom',
].map((label) => ({ label, icon: 'armor', color: '#69a7ff', summary: 'Proficiency defensiva.' }))

export const damageTypePresetOptions: VisualPresetOption[] = [
  { label: 'Acid', icon: 'acid', color: '#7cff6b', summary: 'Corrosion y alquimia.' },
  { label: 'Bludgeoning', icon: 'hammer', color: '#d6c0a0', summary: 'Impacto contundente.' },
  { label: 'Cold', icon: 'snowflake', color: '#69a7ff', summary: 'Hielo y escarcha.' },
  { label: 'Fire', icon: 'flame', color: '#ff7a4f', summary: 'Llama y calor.' },
  { label: 'Force', icon: 'force', color: '#b686ff', summary: 'Energia arcana pura.' },
  { label: 'Lightning', icon: 'lightning', color: '#22f0c8', summary: 'Rayos y electricidad.' },
  { label: 'Necrotic', icon: 'necrotic', color: '#8f7aa8', summary: 'Sombra vital.' },
  { label: 'Piercing', icon: 'piercing', color: '#f7e66f', summary: 'Puntas y perforacion.' },
  { label: 'Poison', icon: 'poison', color: '#7cff6b', summary: 'Toxinas.' },
  { label: 'Psychic', icon: 'mind', color: '#ff4fa3', summary: 'Mente y presion psiquica.' },
  { label: 'Radiant', icon: 'radiant', color: '#f7e66f', summary: 'Luz intensa.' },
  { label: 'Slashing', icon: 'slashing', color: '#ff8ab8', summary: 'Cortes y filos.' },
  { label: 'Thunder', icon: 'thunder', color: '#69a7ff', summary: 'Onda sonora.' },
  { label: 'Custom', icon: 'spark', color: '#ffffff', summary: 'Tipo personalizado.' },
]
