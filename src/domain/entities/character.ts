import type { ID, ImageAsset } from './common'

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export type SkillName =
  | 'acrobatics'
  | 'animalHandling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleightOfHand'
  | 'stealth'
  | 'survival'

export interface CharacterSkill {
  name: SkillName
  ability: AbilityKey
  proficient: boolean
  expertise: boolean
  bonus: number
}

export interface SavingThrow {
  ability: AbilityKey
  proficient: boolean
  bonus: number
}

export interface CharacterLore {
  alignment: string
  gender: string
  eyes: string
  size: string
  height: string
  faith: string
  hair: string
  skin: string
  age: string
  weight: string
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  appearance: string
  background: string
  organizations: string
  allies: string
  enemies: string
  backstory: string
  other: string
}

export type ActionCost = 'action' | 'bonusAction' | 'reaction' | 'movement' | 'free' | 'passive'

export type RecoveryType = 'shortRest' | 'longRest' | 'turn' | 'custom'

export type FeatureModifier = 'attack' | 'damage' | 'defense' | 'resistance' | 'movement' | 'utility'

export type FeatureSourceType = 'class' | 'subclass' | 'species' | 'background' | 'feat' | 'item' | 'spell' | 'condition' | 'dmGranted' | 'custom'

export type FeatureFunctionalType = 'combat' | 'exploration' | 'social' | 'defense' | 'healing' | 'movement' | 'resource' | 'passive' | 'utility'

export type SpellEffectCategory =
  | 'damage'
  | 'healing'
  | 'control'
  | 'buff'
  | 'debuff'
  | 'utility'
  | 'defense'
  | 'mobility'
  | 'summoning'
  | 'detection'
  | 'illusion'
  | 'charm'
  | 'area'
  | 'singleTarget'
  | 'concentration'
  | 'ritual'

export type TurnPlanStatus = 'draft' | 'valid' | 'invalid' | 'computed' | 'undone'

export type TurnPlanItemType = 'attack' | 'spell' | 'action' | 'feature' | 'movement' | 'reaction' | 'trigger'

export interface CharacterTurnState {
  actionSpent: boolean
  bonusActionSpent: boolean
  reactionSpent: boolean
  movementSpent: number
  attacksPerAction: number
  attacksSpent: number
  dashSpent: boolean
  disengageSpent: boolean
  dodgeSpent: boolean
  helpSpent: boolean
  hideSpent: boolean
  readySpent: boolean
  searchSpent: boolean
  useObjectSpent: boolean
}

export interface CharacterAction {
  id: ID
  name: string
  actionCost: ActionCost
  range: string
  hitBonus?: number
  saveDc?: number
  damageDice?: string
  damageBonus?: number
  damageType?: string
  description: string
  quickNotes: string
  applicableTriggerIds: ID[]
  used: boolean
}

export interface CharacterAttack {
  id: ID
  name: string
  actionCost: ActionCost
  range: string
  hitBonus: number
  saveDc?: number
  damageDice: string
  damageBonus: number
  damageType: string
  versatile?: string
  quickNotes: string
  applicableTriggerIds: ID[]
  equipped: boolean
  used: boolean
}

export interface CharacterTrigger {
  id: ID
  name: string
  appliesWhen: string
  summary: string
  active: boolean
  duration: string
  usesRemaining?: number
}

export interface CharacterFeature {
  id: ID
  name: string
  origin: FeatureSourceType
  sourceType: FeatureSourceType
  sourceClass?: string
  functionalType: FeatureFunctionalType
  icon: string
  type: ActionCost
  maxUses?: number
  currentUses?: number
  recovery: RecoveryType
  summary: string
  beginnerHint: string
  mechanicalEffect: string
  consumesTurnResource: boolean
  modifies: FeatureModifier[]
  active: boolean
  highlightForPlayer: boolean
  highlightedByDm: boolean
  tags: string[]
  createdBy?: ID
  updatedBy?: ID
}

export interface CharacterSpellSlot {
  id: ID
  spellLevel: number
  maxSlots: number
  currentSlots: number
  pendingSlots: number
}

export interface CharacterSpell {
  id: ID
  name: string
  spellLevel: number
  school: string
  schoolIcon: string
  castingTime: ActionCost
  range: string
  hitBonus?: number
  saveDc?: number
  components: string
  duration: string
  requiresConcentration: boolean
  summary: string
  damageOrHealing: string
  damageType: string
  known: boolean
  prepared: boolean
  effectCategory: SpellEffectCategory
  effectIcon: string
  secondaryCategories: SpellEffectCategory[]
  usageExamples: string[]
  sourceNotes: string
}

export interface TurnPlanItem {
  id: ID
  type: TurnPlanItemType
  name: string
  costType: ActionCost
  costAmount: number
  summary: string
  spellSlotLevel?: number
  attackId?: ID
  spellId?: ID
  featureId?: ID
  actionId?: ID
  triggerId?: ID
  movementCost?: number
  manualRoll?: number
  manualDamageRoll?: number
  hitResult?: 'unknown' | 'hit' | 'miss'
  notes?: string
  sortOrder: number
}

export interface CharacterTurnPlan {
  id: ID
  characterId: ID
  status: TurnPlanStatus
  validationErrors: string[]
  items: TurnPlanItem[]
  createdBy?: ID
  computedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CharacterTool {
  id: ID
  name: string
  proficient: boolean
  bonus: number
  notes: string
}

export interface CharacterWeapon {
  id: ID
  name: string
  type: string
  range: string
  hitBonus: number
  damage: string
  damageType: string
  properties: string[]
  equipped: boolean
}

export interface CharacterArmor {
  id: ID
  name: string
  type: string
  baseAc: number
  bonus: number
  equipped: boolean
  notes: string
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface HitDice {
  die: string
  total: number
  remaining: number
}

export interface SpellcastingInfo {
  isSpellcaster: boolean
  ability?: AbilityKey
  saveDc: number
  attackBonus: number
  knownSpells: number
  preparedSpells: number
}

export interface CharacterPassiveOverrides {
  perception?: number
  investigation?: number
  insight?: number
}

export interface CharacterCurrency {
  platinum: number
  gold: number
  electrum: number
  silver: number
  copper: number
}

export interface Character {
  id: ID
  campaignId: ID
  ownerUserId: ID
  isVisibleToPlayer: boolean
  name: string
  portrait: ImageAsset
  className: string
  subclassName: string
  level: number
  species: string
  backgroundName: string
  abilities: Record<AbilityKey, number>
  proficiencyBonus: number
  armorClass: number
  maxHp: number
  currentHp: number
  temporaryHp: number
  speed: number
  passivePerception: number
  passiveInvestigation: number
  passiveInsight: number
  passiveOverrides: CharacterPassiveOverrides
  initiativeBonus: number
  deathSaves: DeathSaves
  hitDice: HitDice
  exhaustion: number
  savingThrows: SavingThrow[]
  skills: CharacterSkill[]
  languages: string[]
  proficiencies: string[]
  tools: CharacterTool[]
  weapons: CharacterWeapon[]
  armor: CharacterArmor[]
  resistances: string[]
  immunities: string[]
  vulnerabilities: string[]
  conditions: string[]
  senses: string[]
  equipment: string[]
  currency: CharacterCurrency
  spellsAndFeatures: string
  turnState: CharacterTurnState
  actions: CharacterAction[]
  attacks: CharacterAttack[]
  triggers: CharacterTrigger[]
  features: CharacterFeature[]
  traits: CharacterFeature[]
  spellSlots: CharacterSpellSlot[]
  spells: CharacterSpell[]
  spellcasting: SpellcastingInfo
  lore: CharacterLore
  updatedAt: string
}
