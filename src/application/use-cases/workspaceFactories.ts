import type { BattleMap, DrawingShape, MapAsset, MapAssetType, Token, TurnOrder } from '@domain/entities/battlemap'
import type { CampaignMember, ID, Visibility } from '@domain/entities/common'
import type { LoreEntry, LoreType } from '@domain/entities/lore'
import type { TimelineSession, Quest } from '@domain/entities/timeline'
import type {
  CharacterAction,
  Character as CharacterSheet,
  CharacterAttack,
  CharacterArmor,
  CharacterCurrency,
  CharacterFeature,
  CharacterSpell,
  CharacterSpellSlot,
  CharacterTool,
  CharacterTrigger,
  CharacterTurnState,
  CharacterWeapon,
  DeathSaves,
  HitDice,
  SpellcastingInfo,
} from '@domain/entities/character'
import { createDefaultSavingThrows, createDefaultSkills, recalculateCharacterBonuses } from '@domain/services/characterStats'
import { loreFieldTemplates } from '@shared/constants/lore'
import { getMapAssetDefinition } from '@shared/constants/mapAssets'
import { createId } from '@shared/utils/id'

const baseAbilities = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
} satisfies CharacterSheet['abilities']

export function createDefaultTurnState(speed = 30, attacksPerAction = 1): CharacterTurnState {
  void speed
  return {
    actionSpent: false,
    bonusActionSpent: false,
    reactionSpent: false,
    actionsSpent: 0,
    bonusActionsSpent: 0,
    movementSpent: 0,
    attacksPerAction,
    attacksSpent: 0,
    dashSpent: false,
    disengageSpent: false,
    dodgeSpent: false,
    helpSpent: false,
    hideSpent: false,
    readySpent: false,
    searchSpent: false,
    useObjectSpent: false,
  }
}

function createDefaultDeathSaves(): DeathSaves {
  return { successes: 0, failures: 0 }
}

function createDefaultHitDice(level = 1): HitDice {
  return { die: 'd8', total: level, remaining: level }
}

function createDefaultSpellcasting(): SpellcastingInfo {
  return {
    isSpellcaster: false,
    saveDc: 10,
    attackBonus: 0,
    knownSpells: 0,
    preparedSpells: 0,
  }
}

function createDefaultCurrency(): CharacterCurrency {
  return {
    platinum: 0,
    gold: 0,
    electrum: 0,
    silver: 0,
    copper: 0,
  }
}

export function createDefaultAction(characterId: ID): CharacterAction {
  void characterId
  return {
    id: createId('action'),
    name: 'Use an Object',
    actionCost: 'action',
    range: 'Self / touch',
    description: 'Interactúa con un objeto importante del encuentro.',
    quickNotes: 'El DM confirma el coste exacto antes de computar el turno.',
    applicableTriggerIds: [],
    used: false,
  }
}

export function createDefaultAttack(): CharacterAttack {
  return {
    id: createId('attack'),
    name: 'Arma principal',
    actionCost: 'action',
    range: '5 ft',
    hitBonus: 4,
    damageDice: '1d8',
    damageBonus: 2,
    damageType: 'slashing',
    versatile: '1d10 + 2 slashing',
    quickNotes: 'Tira d20 y suma el bonus al hit.',
    applicableTriggerIds: [],
    equipped: true,
    used: false,
  }
}

export function createDefaultTrigger(): CharacterTrigger {
  return {
    id: createId('trigger'),
    name: 'Advantage / Disadvantage',
    appliesWhen: 'Cuando una condición, posición o ayuda cambie la tirada.',
    summary: 'Tira dos d20 y usa el mejor o peor resultado según el caso.',
    active: false,
    duration: 'Esta tirada',
  }
}

export function createDefaultFeature(): CharacterFeature {
  return {
    id: createId('feature'),
    name: 'Second Wind',
    origin: 'class',
    sourceType: 'class',
    sourceClass: 'Fighter',
    functionalType: 'healing',
    icon: 'spark',
    type: 'bonusAction',
    maxUses: 1,
    currentUses: 1,
    recovery: 'shortRest',
    summary: 'Recupera energía en mitad del combate.',
    beginnerHint: 'Recuérdalo cuando estés herido y aún tengas tu Bonus Action.',
    mechanicalEffect: 'Configurable: curación o recurso según clase.',
    consumesTurnResource: true,
    resourceBonuses: {
      actions: 0,
      bonusActions: 0,
      attacks: 0,
    },
    modifies: ['defense'],
    active: false,
    highlightForPlayer: true,
    highlightedByDm: false,
    tags: ['survival'],
  }
}

export function createDefaultSpellSlot(): CharacterSpellSlot {
  return {
    id: createId('slot'),
    spellLevel: 1,
    maxSlots: 2,
    currentSlots: 2,
    pendingSlots: 0,
  }
}

export function createDefaultSpell(): CharacterSpell {
  return {
    id: createId('spell'),
    name: 'Luz prismatica',
    spellLevel: 1,
    school: 'Evocation',
    schoolIcon: 'evocation',
    castingTime: 'action',
    range: '60 ft',
    hitBonus: 4,
    components: 'V, S',
    duration: 'Instantáneo',
    requiresConcentration: false,
    summary: 'Ataque mágico editable de ejemplo. No contiene texto oficial.',
    damageOrHealing: '1d8 + 2',
    damageType: 'radiant',
    known: true,
    prepared: true,
    effectCategory: 'damage',
    effectIcon: 'spark',
    secondaryCategories: ['singleTarget'],
    usageExamples: ['Úsalo cuando necesitas daño seguro a distancia.', 'Úsalo para rematar un objetivo debilitado.'],
    sourceNotes: 'Custom campaign',
  }
}

export function createDefaultTool(): CharacterTool {
  return { id: createId('tool'), name: 'Cartographer tools', proficient: true, bonus: 4, notes: 'Mapas y rutas.' }
}

export function createDefaultWeapon(): CharacterWeapon {
  return {
    id: createId('weapon'),
    name: 'Longsword',
    type: 'Martial melee',
    range: '5 ft',
    hitBonus: 5,
    damage: '1d8 + 3',
    damageType: 'slashing',
    properties: ['versatile'],
    equipped: true,
  }
}

export function createDefaultArmor(): CharacterArmor {
  return { id: createId('armor'), name: 'Leather armor', type: 'Light', baseAc: 11, bonus: 3, equipped: true, notes: 'Editable.' }
}

export function hydrateCharacterDefaults(character: CharacterSheet): CharacterSheet {
  const hydratedTurnState = {
    ...createDefaultTurnState(character.speed, character.turnState?.attacksPerAction ?? 1),
    ...character.turnState,
    actionsSpent: character.turnState?.actionsSpent ?? (character.turnState?.actionSpent ? 1 : 0),
    bonusActionsSpent: character.turnState?.bonusActionsSpent ?? (character.turnState?.bonusActionSpent ? 1 : 0),
  }

  const hydrated = {
    ...character,
    isVisibleToPlayer: character.isVisibleToPlayer ?? true,
    passiveInvestigation: character.passiveInvestigation ?? 10,
    passiveInsight: character.passiveInsight ?? 10,
    passiveOverrides: character.passiveOverrides ?? {},
    deathSaves: character.deathSaves ?? createDefaultDeathSaves(),
    hitDice: character.hitDice ?? createDefaultHitDice(character.level),
    exhaustion: character.exhaustion ?? 0,
    tools: character.tools ?? [],
    weapons: character.weapons ?? [],
    armor: character.armor ?? [],
    resistances: character.resistances ?? [],
    immunities: character.immunities ?? [],
    vulnerabilities: character.vulnerabilities ?? [],
    conditions: character.conditions ?? [],
    senses: character.senses ?? [],
    currency: character.currency ?? createDefaultCurrency(),
    turnState: hydratedTurnState,
    actions: character.actions ?? [],
    attacks: character.attacks ?? [],
    triggers: character.triggers ?? [],
    features: (character.features ?? []).map((feature) => ({
      ...feature,
      sourceType: feature.sourceType ?? feature.origin ?? 'custom',
      sourceClass: feature.sourceClass ?? '',
      functionalType: feature.functionalType ?? (feature.type === 'passive' ? 'passive' : 'utility'),
      icon: feature.icon ?? 'spark',
      beginnerHint: feature.beginnerHint ?? '',
      resourceBonuses: feature.resourceBonuses ?? {},
      highlightForPlayer: feature.highlightForPlayer ?? false,
      highlightedByDm: feature.highlightedByDm ?? false,
    })),
    traits: (character.traits ?? []).map((feature) => ({
      ...feature,
      sourceType: feature.sourceType ?? feature.origin ?? 'custom',
      sourceClass: feature.sourceClass ?? '',
      functionalType: feature.functionalType ?? (feature.type === 'passive' ? 'passive' : 'utility'),
      icon: feature.icon ?? 'spark',
      beginnerHint: feature.beginnerHint ?? '',
      resourceBonuses: feature.resourceBonuses ?? {},
      highlightForPlayer: feature.highlightForPlayer ?? false,
      highlightedByDm: feature.highlightedByDm ?? false,
    })),
    spellSlots: (character.spellSlots ?? []).map((slot) => ({ ...slot, pendingSlots: slot.pendingSlots ?? 0 })),
    spells: (character.spells ?? []).map((spell) => ({
      ...spell,
      effectCategory: spell.effectCategory ?? 'utility',
      effectIcon: spell.effectIcon ?? 'spark',
      schoolIcon: spell.schoolIcon ?? 'universal',
      known: spell.known ?? true,
      secondaryCategories: spell.secondaryCategories ?? [],
    })),
    spellcasting: character.spellcasting ?? createDefaultSpellcasting(),
  }

  return recalculateCharacterBonuses(hydrated)
}

export function createBlankCharacter(campaignId: ID, ownerUserId: ID): CharacterSheet {
  const partial = {
    id: createId('character'),
    campaignId,
    ownerUserId,
    isVisibleToPlayer: true,
    name: 'Nuevo aventurero',
    portrait: {},
    className: '',
    subclassName: '',
    level: 1,
    species: '',
    backgroundName: '',
    abilities: baseAbilities,
    proficiencyBonus: 2,
    armorClass: 10,
    maxHp: 8,
    currentHp: 8,
    temporaryHp: 0,
    speed: 30,
    passivePerception: 10,
    passiveInvestigation: 10,
    passiveInsight: 10,
    passiveOverrides: {},
    initiativeBonus: 0,
    deathSaves: createDefaultDeathSaves(),
    hitDice: createDefaultHitDice(1),
    exhaustion: 0,
    savingThrows: [],
    skills: [],
    languages: [],
    proficiencies: [],
    tools: [],
    weapons: [createDefaultWeapon()],
    armor: [createDefaultArmor()],
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    conditions: [],
    senses: ['Passive Perception 10'],
    equipment: [],
    currency: createDefaultCurrency(),
    spellsAndFeatures: '',
    turnState: createDefaultTurnState(30),
    actions: [createDefaultAction(ownerUserId)],
    attacks: [createDefaultAttack()],
    triggers: [createDefaultTrigger()],
    features: [createDefaultFeature()],
    traits: [],
    spellSlots: [],
    spells: [],
    spellcasting: createDefaultSpellcasting(),
    lore: {
      alignment: '',
      gender: '',
      eyes: '',
      size: '',
      height: '',
      faith: '',
      hair: '',
      skin: '',
      age: '',
      weight: '',
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      appearance: '',
      background: '',
      organizations: '',
      allies: '',
      enemies: '',
      backstory: '',
      other: '',
    },
    updatedAt: new Date().toISOString(),
  } satisfies CharacterSheet

  return recalculateCharacterBonuses({
    ...partial,
    savingThrows: createDefaultSavingThrows(partial),
    skills: createDefaultSkills(partial),
  })
}

export function createBlankSession(campaignId: ID, nextNumber: number): TimelineSession {
  return {
    id: createId('session'),
    campaignId,
    sessionNumber: nextNumber,
    playedAt: new Date().toISOString().slice(0, 10),
    title: '',
    summary: '',
    visibleNotes: '',
    sessionImageHoloEnabled: true,
  }
}

export function createBlankQuest(campaignId: ID): Quest {
  return {
    id: createId('quest'),
    campaignId,
    title: '',
    description: '',
    status: 'pending',
    steps: [],
    challenges: '',
    secret: '',
  }
}

export function createBlankLoreEntry(campaignId: ID, type: LoreType): LoreEntry {
  const publicFields = Object.fromEntries(loreFieldTemplates[type].map((field) => [field, '']))
  return {
    id: createId('lore'),
    campaignId,
    type,
    name: '',
    image: {},
    publicFields,
    secret: '',
    linkedEntryIds: [],
    isVisibleToPlayers: true,
    visibleToPlayerIds: [],
    updatedAt: new Date().toISOString(),
  }
}

export function createBlankMap(campaignId: ID): BattleMap {
  return {
    id: createId('map'),
    campaignId,
    name: 'Mapa nuevo',
    width: 2400,
    height: 1600,
    gridSize: 70,
    background: {},
    isActive: false,
  }
}

export function createMonsterToken(mapId: ID): Token {
  return {
    id: createId('token'),
    mapId,
    ownerUserId: undefined,
    characterId: undefined,
    kind: 'monster',
    name: 'Rival',
    image: {},
    x: 420,
    y: 350,
    size: 1,
    rotation: 0,
    scale: 1,
    accentColor: '#ff4fa3',
    borderColor: '#2b0618',
    visibility: 'public',
    conditions: [],
    isLocked: false,
    isInTurnOrder: true,
    active: true,
    stats: {
      maxHp: 18,
      currentHp: 18,
      temporaryHp: 0,
      armorClass: 13,
      initiative: 0,
      speed: 30,
      creatureType: 'Monster',
      visibleNotes: '',
      secretNotes: '',
      notes: '',
    },
  }
}

export function createPlayerToken(mapId: ID, character: CharacterSheet): Token {
  return {
    id: createId('token'),
    mapId,
    ownerCharacterId: character.id,
    ownerUserId: character.ownerUserId,
    characterId: character.id,
    kind: 'player',
    name: character.name,
    image: character.portrait,
    x: 210,
    y: 210,
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
      maxHp: character.maxHp,
      currentHp: character.currentHp,
      temporaryHp: character.temporaryHp,
      armorClass: character.armorClass,
      initiative: character.initiativeBonus,
      speed: character.speed,
      creatureType: 'Player character',
      visibleNotes: '',
      secretNotes: '',
      notes: '',
    },
  }
}

export function createMapAsset(mapId: ID, type: MapAssetType, x: number, y: number, visibility: Visibility): MapAsset {
  const definition = getMapAssetDefinition(type)
  return {
    id: createId('asset'),
    mapId,
    type,
    name: definition.name,
    category: definition.category,
    label: definition.name,
    x,
    y,
    width: definition.baseWidthCells * 70,
    height: definition.baseHeightCells * 70,
    rotation: 0,
    visibility,
    notes: '',
    color: definition.color,
    variant: 'default',
    locked: false,
  }
}

export function createEmptyTurnOrder(mapId: ID): TurnOrder {
  return {
    id: createId('turns'),
    mapId,
    round: 1,
    currentIndex: 0,
    entries: [],
  }
}

export function memberOwnsCharacter(member: CampaignMember, character: CharacterSheet): boolean {
  return member.characterId === character.id
}

export const drawingToolToShape: Record<string, DrawingShape | undefined> = {
  circle: 'circle',
  cone: 'cone',
  square: 'square',
  line: 'line',
}
