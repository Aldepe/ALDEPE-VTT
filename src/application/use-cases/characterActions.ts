import type {
  ActionCost,
  Character,
  CharacterAction,
  CharacterAttack,
  CharacterFeature,
  CharacterSpell,
  CharacterTrigger,
  CharacterTurnPlan,
  TurnPlanItem,
  TurnPlanItemType,
} from '@domain/entities/character'
import { createDefaultAction, createDefaultAttack, createDefaultTurnState } from './workspaceFactories'
import { ClearPendingSpellSlotsUseCase, ListAvailableSpellsForActionUseCase, SpendSpellSlotUseCase } from './characterSpells'
import { createId } from '@shared/utils/id'

export function ListCharacterActionsUseCase(character: Character): CharacterAction[] {
  const weaponActions = character.attacks
    .filter((attack) => attack.equipped)
    .map<CharacterAction>((attack) => ({
      id: attack.id,
      name: attack.name,
      actionCost: attack.actionCost,
      range: attack.range,
      hitBonus: attack.hitBonus,
      saveDc: attack.saveDc,
      damageDice: attack.damageDice,
      damageBonus: attack.damageBonus,
      damageType: attack.damageType,
      description: attack.quickNotes,
      quickNotes: attack.versatile ? `Versatile: ${attack.versatile}` : attack.quickNotes,
      applicableTriggerIds: attack.applicableTriggerIds,
      used: attack.used,
    }))

  return [...character.actions, ...weaponActions]
}

export function ResetTurnResourcesUseCase(character: Character): Character {
  return {
    ...character,
    turnState: createDefaultTurnState(character.speed, character.turnState.attacksPerAction),
    attacks: character.attacks.map((attack) => ({ ...attack, used: false })),
    actions: character.actions.map((action) => ({ ...action, used: false })),
    triggers: character.triggers.map((trigger) => ({ ...trigger, active: false })),
    spellSlots: ClearPendingSpellSlotsUseCase(character.spellSlots),
  }
}

export function UseCharacterActionUseCase(character: Character, actionCost: ActionCost, actionId?: string): Character {
  const nextTurnState = { ...character.turnState }

  if (actionCost === 'action') {
    nextTurnState.actionSpent = true
  }

  if (actionCost === 'bonusAction') {
    nextTurnState.bonusActionSpent = true
  }

  if (actionCost === 'reaction') {
    nextTurnState.reactionSpent = true
  }

  if (actionCost === 'movement') {
    nextTurnState.movementSpent = character.speed
  }

  return {
    ...character,
    turnState: nextTurnState,
    actions: character.actions.map((action) => (action.id === actionId ? { ...action, used: true } : action)),
    attacks: character.attacks.map((attack) => (attack.id === actionId ? { ...attack, used: true } : attack)),
  }
}

export function MarkAttackUsedUseCase(character: Character, attackId: string): Character {
  return {
    ...character,
    turnState: {
      ...character.turnState,
      attacksSpent: Math.min(character.turnState.attacksPerAction, character.turnState.attacksSpent + 1),
      actionSpent: character.turnState.attacksSpent + 1 >= character.turnState.attacksPerAction,
    },
    attacks: character.attacks.map((attack) => (attack.id === attackId ? { ...attack, used: true } : attack)),
  }
}

export function CreateCharacterAttackUseCase(): CharacterAttack {
  return createDefaultAttack()
}

export function DuplicateCharacterAttackUseCase(attack: CharacterAttack): CharacterAttack {
  return {
    ...attack,
    id: createId('attack'),
    name: `${attack.name} copy`,
    used: false,
  }
}

export function DeleteCharacterAttackUseCase(character: Character, attackId: string): Character {
  return {
    ...character,
    attacks: character.attacks.filter((attack) => attack.id !== attackId),
  }
}

export function UpdateCharacterAttackUseCase(attack: CharacterAttack, patch: Partial<CharacterAttack>): CharacterAttack {
  return {
    ...attack,
    ...patch,
    id: attack.id,
  }
}

export function CreateCharacterActionUseCase(characterId: string): CharacterAction {
  return createDefaultAction(characterId)
}

export function UpdateCharacterActionUseCase(action: CharacterAction, patch: Partial<CharacterAction>): CharacterAction {
  return {
    ...action,
    ...patch,
    id: action.id,
  }
}

export function DuplicateCharacterActionUseCase(action: CharacterAction): CharacterAction {
  return {
    ...action,
    id: createId('action'),
    name: `${action.name} copy`,
    used: false,
  }
}

export function DeleteCharacterActionUseCase(character: Character, actionId: string): Character {
  return {
    ...character,
    actions: character.actions.filter((action) => action.id !== actionId),
  }
}

export function ActivateCharacterTriggerUseCase(trigger: CharacterTrigger): CharacterTrigger {
  return {
    ...trigger,
    active: true,
    usesRemaining: trigger.usesRemaining === undefined ? undefined : Math.max(0, trigger.usesRemaining - 1),
  }
}

export function DeactivateCharacterTriggerUseCase(trigger: CharacterTrigger): CharacterTrigger {
  return {
    ...trigger,
    active: false,
  }
}

export function ToggleCharacterFeatureUseCase(feature: CharacterFeature): CharacterFeature {
  const canSpendUse = !feature.active && feature.currentUses !== undefined
  return {
    ...feature,
    active: !feature.active,
    currentUses: canSpendUse ? Math.max(0, (feature.currentUses ?? 0) - 1) : feature.currentUses,
  }
}

export function manualRollTotal(d20Result: number, bonus?: number): number {
  return d20Result + (bonus ?? 0)
}

export function CreateTurnPlanUseCase(character: Character, createdBy?: string): CharacterTurnPlan {
  const now = new Date().toISOString()
  return {
    id: createId('turn_plan'),
    characterId: character.id,
    status: 'draft',
    validationErrors: [],
    items: [],
    createdBy,
    createdAt: now,
    updatedAt: now,
  }
}

interface SelectTurnActionInput {
  attack?: CharacterAttack
  feature?: CharacterFeature
  trigger?: CharacterTrigger
  action?: CharacterAction
  spell?: CharacterSpell
  movementCost?: number
  movementName?: string
  movementSummary?: string
  type?: TurnPlanItemType
}

function actionSummary(action: CharacterAction): string {
  return action.quickNotes || action.description || 'Accion configurable.'
}

function nextSortOrder(plan: CharacterTurnPlan): number {
  return plan.items.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1
}

function withPlanItem(plan: CharacterTurnPlan, item: TurnPlanItem): CharacterTurnPlan {
  return {
    ...plan,
    status: 'draft',
    validationErrors: [],
    items: [...plan.items, item],
    updatedAt: new Date().toISOString(),
  }
}

export function SelectTurnActionUseCase(plan: CharacterTurnPlan, input: SelectTurnActionInput): CharacterTurnPlan {
  if (input.attack) {
    return withPlanItem(plan, {
      id: createId('turn_item'),
      type: 'attack',
      name: input.attack.name,
      costType: input.attack.actionCost,
      costAmount: 1,
      summary: `${input.attack.range} - Hit ${input.attack.hitBonus >= 0 ? '+' : ''}${input.attack.hitBonus} - ${input.attack.damageDice} + ${input.attack.damageBonus} ${input.attack.damageType}`,
      attackId: input.attack.id,
      hitResult: 'unknown',
      sortOrder: nextSortOrder(plan),
    })
  }

  if (input.spell) {
    return withPlanItem(plan, {
      id: createId('turn_item'),
      type: 'spell',
      name: input.spell.name,
      costType: input.spell.castingTime,
      costAmount: 1,
      summary: `${input.spell.range} - ${input.spell.damageOrHealing || input.spell.summary}`,
      spellId: input.spell.id,
      spellSlotLevel: input.spell.spellLevel > 0 ? input.spell.spellLevel : undefined,
      hitResult: 'unknown',
      sortOrder: nextSortOrder(plan),
    })
  }

  if (input.feature) {
    return withPlanItem(plan, {
      id: createId('turn_item'),
      type: 'feature',
      name: input.feature.name,
      costType: input.feature.type,
      costAmount: input.feature.type === 'passive' ? 0 : 1,
      summary: input.feature.summary,
      featureId: input.feature.id,
      sortOrder: nextSortOrder(plan),
    })
  }

  if (input.trigger) {
    return withPlanItem(plan, {
      id: createId('turn_item'),
      type: 'trigger',
      name: input.trigger.name,
      costType: 'reaction',
      costAmount: 1,
      summary: input.trigger.summary,
      triggerId: input.trigger.id,
      sortOrder: nextSortOrder(plan),
    })
  }

  if (input.action) {
    return withPlanItem(plan, {
      id: createId('turn_item'),
      type: input.type ?? 'action',
      name: input.action.name,
      costType: input.action.actionCost,
      costAmount: input.action.actionCost === 'free' || input.action.actionCost === 'passive' ? 0 : 1,
      summary: actionSummary(input.action),
      actionId: input.action.id,
      sortOrder: nextSortOrder(plan),
    })
  }

  return withPlanItem(plan, {
    id: createId('turn_item'),
    type: 'movement',
    name: input.movementName ?? 'Move',
    costType: 'movement',
    costAmount: input.movementCost ?? 0,
    movementCost: input.movementCost ?? 0,
    summary: input.movementSummary ?? `Mover ${input.movementCost ?? 0} ft`,
    sortOrder: nextSortOrder(plan),
  })
}

export function RemoveTurnActionUseCase(plan: CharacterTurnPlan, itemId: string): CharacterTurnPlan {
  return {
    ...plan,
    status: 'draft',
    validationErrors: [],
    items: plan.items.filter((item) => item.id !== itemId),
    updatedAt: new Date().toISOString(),
  }
}

export function RemoveTurnPlanItemsForDeletedActionUseCase(
  plan: CharacterTurnPlan,
  deleted: { actionId?: string; attackId?: string },
): CharacterTurnPlan {
  return {
    ...plan,
    status: 'draft',
    validationErrors: [],
    items: plan.items.filter((item) => {
      if (deleted.actionId && item.actionId === deleted.actionId) {
        return false
      }

      if (deleted.attackId && item.attackId === deleted.attackId) {
        return false
      }

      return true
    }),
    updatedAt: new Date().toISOString(),
  }
}

export function UpdateTurnPlanItemUseCase(plan: CharacterTurnPlan, itemId: string, patch: Partial<TurnPlanItem>): CharacterTurnPlan {
  return {
    ...plan,
    status: 'draft',
    validationErrors: [],
    items: plan.items.map((item) => (item.id === itemId ? { ...item, ...patch, id: item.id } : item)),
    updatedAt: new Date().toISOString(),
  }
}

export interface TurnResourceSummary {
  action: 'ready' | 'pending' | 'spent'
  bonusAction: 'ready' | 'pending' | 'spent'
  reaction: 'ready' | 'pending' | 'spent'
  movementPending: number
  spellSlotsPendingByLevel: Record<number, number>
}

export type ActionOptionCostGroup = 'consumeAction' | 'consumeBonusAction' | 'consumeReaction' | 'movement'

export interface TurnActionOption {
  id: string
  label: string
  cost: ActionCost
  costGroup: ActionOptionCostGroup
  description: string
  mode?: 'attack' | 'spell' | 'feature'
  action?: CharacterAction
  movementCost?: number
  movementKind?: 'move' | 'climb' | 'swim' | 'jump' | 'stand'
}

function makeBasicAction(name: string, actionCost: ActionCost, description: string): CharacterAction {
  return {
    id: `basic_${name.toLowerCase().replace(/\s+/g, '_')}`,
    name,
    actionCost,
    range: 'Self',
    description,
    quickNotes: description,
    applicableTriggerIds: [],
    used: false,
  }
}

export function ListTurnActionOptionsByCostUseCase(character: Character, movementCost = 10): Record<ActionOptionCostGroup, TurnActionOption[]> {
  const availableSpells = ListAvailableSpellsForActionUseCase(character)
  const consumeAction: TurnActionOption[] = [
    { id: 'attack', label: 'Attack', cost: 'action', costGroup: 'consumeAction', description: 'Elige uno de tus ataques.', mode: 'attack' },
    { id: 'dash', label: 'Dash', cost: 'action', costGroup: 'consumeAction', description: 'Anade movimiento adicional.', action: makeBasicAction('Dash', 'action', 'Anade movimiento adicional este turno.') },
    { id: 'disengage', label: 'Disengage', cost: 'action', costGroup: 'consumeAction', description: 'Evita ataques al moverte.', action: makeBasicAction('Disengage', 'action', 'Sales de alcance con cuidado.') },
    { id: 'hide', label: 'Hide', cost: 'action', costGroup: 'consumeAction', description: 'Intentas ocultarte.', action: makeBasicAction('Hide', 'action', 'Busca cobertura y tira sigilo si aplica.') },
    { id: 'object', label: 'Use Object', cost: 'action', costGroup: 'consumeAction', description: 'Manipulas un objeto importante.', action: makeBasicAction('Use an Object', 'action', 'Usas pocion, palanca, artefacto u objeto complejo.') },
  ]

  if (availableSpells.some((spell) => spell.castingTime === 'action')) {
    consumeAction.splice(1, 0, { id: 'spell', label: 'Cast Spell', cost: 'action', costGroup: 'consumeAction', description: 'Abre spells disponibles.', mode: 'spell' })
  }

  const customActions = character.actions
    .filter((action) => !['dash', 'disengage', 'hide', 'use object', 'use an object', 'dodge', 'help', 'ready', 'search', 'hablar', 'speak'].includes(action.name.trim().toLowerCase()))
    .filter((action) => action.actionCost !== 'free' && action.actionCost !== 'passive' && action.actionCost !== 'movement')
    .map<TurnActionOption>((action) => ({
      id: action.id,
      label: action.name,
      cost: action.actionCost,
      costGroup: action.actionCost === 'bonusAction' ? 'consumeBonusAction' : action.actionCost === 'reaction' ? 'consumeReaction' : 'consumeAction',
      description: action.quickNotes || action.description,
      action,
    }))

  const hasBonusFeatures = [...character.features, ...character.traits].some((feature) => feature.type === 'bonusAction')
  const hasReactionFeatures = [...character.features, ...character.traits].some((feature) => feature.type === 'reaction') || character.triggers.length > 0
  const hasBonusSpells = availableSpells.some((spell) => spell.castingTime === 'bonusAction')
  const hasReactionSpells = availableSpells.some((spell) => spell.castingTime === 'reaction')

  return {
    consumeAction: [...consumeAction, ...customActions.filter((option) => option.cost === 'action')],
    consumeBonusAction: customActions.some((option) => option.cost === 'bonusAction') || hasBonusFeatures || hasBonusSpells
      ? [
          ...customActions.filter((option) => option.cost === 'bonusAction'),
          ...(hasBonusSpells ? [{ id: 'spell_bonus', label: 'Cast Bonus Spell', cost: 'bonusAction' as const, costGroup: 'consumeBonusAction' as const, description: 'Elige un spell configurado como Bonus Action.', mode: 'spell' as const }] : []),
          ...(hasBonusFeatures ? [{ id: 'feature_bonus', label: 'Bonus features', cost: 'bonusAction' as const, costGroup: 'consumeBonusAction' as const, description: 'Elige una Bonus Action real del personaje.', mode: 'feature' as const }] : []),
        ]
      : [],
    consumeReaction: customActions.some((option) => option.cost === 'reaction') || hasReactionFeatures || hasReactionSpells
      ? [
          ...customActions.filter((option) => option.cost === 'reaction'),
          ...(hasReactionSpells ? [{ id: 'spell_reaction', label: 'Cast Reaction Spell', cost: 'reaction' as const, costGroup: 'consumeReaction' as const, description: 'Elige un spell configurado como Reaction.', mode: 'spell' as const }] : []),
          ...(hasReactionFeatures ? [{ id: 'feature_reaction', label: 'Reactions/triggers', cost: 'reaction' as const, costGroup: 'consumeReaction' as const, description: 'Elige una reaccion o trigger real.', mode: 'feature' as const }] : []),
        ]
      : [],
    movement: [
      { id: 'move', label: 'Move', cost: 'movement', costGroup: 'movement', description: 'Reserva pies de movimiento.', movementCost, movementKind: 'move' },
      { id: 'climb', label: 'Climb', cost: 'movement', costGroup: 'movement', description: 'Trepar usando movimiento.', movementCost, movementKind: 'climb' },
      { id: 'swim', label: 'Swim', cost: 'movement', costGroup: 'movement', description: 'Nadar usando movimiento.', movementCost, movementKind: 'swim' },
      { id: 'jump', label: 'Jump', cost: 'movement', costGroup: 'movement', description: 'Saltar una distancia pactada.', movementCost, movementKind: 'jump' },
      { id: 'stand', label: 'Stand up', cost: 'movement', costGroup: 'movement', description: 'Levantarte del suelo.', movementCost: Math.ceil(movementCost / 2), movementKind: 'stand' },
    ],
  }
}

type TurnBooleanFlag =
  | 'dashSpent'
  | 'disengageSpent'
  | 'dodgeSpent'
  | 'helpSpent'
  | 'hideSpent'
  | 'readySpent'
  | 'searchSpent'
  | 'useObjectSpent'

function countPendingCost(plan: CharacterTurnPlan, cost: ActionCost): number {
  if (cost === 'action') {
    const hasAttack = plan.items.some((item) => item.type === 'attack')
    const nonAttackActionCosts = plan.items.filter((item) => item.type !== 'attack' && item.costType === 'action').length
    return (hasAttack ? 1 : 0) + nonAttackActionCosts
  }

  return plan.items.filter((item) => item.costType === cost).reduce((sum, item) => sum + item.costAmount, 0)
}

export function SummarizeTurnPlanResourcesUseCase(character: Character, plan: CharacterTurnPlan): TurnResourceSummary {
  const pendingSpellSlots = plan.items.reduce<Record<number, number>>((levels, item) => {
    if (item.type === 'spell' && item.spellSlotLevel) {
      levels[item.spellSlotLevel] = (levels[item.spellSlotLevel] ?? 0) + 1
    }
    return levels
  }, {})

  const stateFor = (spent: boolean, pending: number): 'ready' | 'pending' | 'spent' => {
    if (spent) {
      return 'spent'
    }

    return pending > 0 ? 'pending' : 'ready'
  }

  return {
    action: stateFor(character.turnState.actionSpent, countPendingCost(plan, 'action')),
    bonusAction: stateFor(character.turnState.bonusActionSpent, countPendingCost(plan, 'bonusAction')),
    reaction: stateFor(character.turnState.reactionSpent, countPendingCost(plan, 'reaction')),
    movementPending: plan.items.reduce((sum, item) => sum + (item.movementCost ?? 0), 0),
    spellSlotsPendingByLevel: pendingSpellSlots,
  }
}

function availableActionCount(character: Character): number {
  return character.turnState.actionSpent ? 0 : 1
}

function availableBonusActionCount(character: Character): number {
  return character.turnState.bonusActionSpent ? 0 : 1
}

function availableReactionCount(character: Character): number {
  return character.turnState.reactionSpent ? 0 : 1
}

export function ValidateTurnPlanUseCase(character: Character, plan: CharacterTurnPlan): CharacterTurnPlan {
  const errors: string[] = []
  const actionCost = countPendingCost(plan, 'action')
  const bonusCost = countPendingCost(plan, 'bonusAction')
  const reactionCost = countPendingCost(plan, 'reaction')
  const attackCount = plan.items.filter((item) => item.type === 'attack').length
  const movementCost = plan.items.reduce((sum, item) => sum + (item.movementCost ?? 0), 0)
  const movementAvailable = Math.max(0, character.speed - character.turnState.movementSpent)

  if (actionCost > availableActionCount(character)) {
    errors.push('No puedes hacer Dash y Attack u otras opciones que consumen Action en el mismo turno.')
  }

  if (bonusCost > availableBonusActionCount(character)) {
    errors.push('No te quedan Bonus Actions.')
  }

  if (reactionCost > availableReactionCount(character)) {
    errors.push('Ya gastaste tu Reaction.')
  }

  if (attackCount > character.turnState.attacksPerAction) {
    errors.push(`Has seleccionado ${attackCount} ataques, pero solo tienes ${character.turnState.attacksPerAction} ataques por Action.`)
  }

  if (movementCost > movementAvailable) {
    errors.push('No tienes suficiente movimiento.')
  }

  if (plan.items.some((item) => item.type === 'spell') && !character.spellcasting.isSpellcaster) {
    errors.push('Este personaje no tiene spellcasting habilitado.')
  }

  const spellSlotCosts = plan.items.reduce<Record<number, number>>((levels, item) => {
    if (item.type === 'spell' && item.spellSlotLevel) {
      levels[item.spellSlotLevel] = (levels[item.spellSlotLevel] ?? 0) + 1
    }
    return levels
  }, {})

  Object.entries(spellSlotCosts).forEach(([level, cost]) => {
    const slot = character.spellSlots.find((candidate) => candidate.spellLevel === Number(level))
    if (!slot || slot.currentSlots < cost) {
      errors.push(`No te quedan spell slots de nivel ${level}.`)
    }
  })

  ;[...character.features, ...character.traits]
    .filter((feature) => plan.items.some((item) => item.featureId === feature.id))
    .forEach((feature) => {
      if ((feature.currentUses ?? 1) <= 0) {
        errors.push('Esta feature no tiene usos disponibles.')
      }
    })

  return {
    ...plan,
    status: errors.length ? 'invalid' : 'valid',
    validationErrors: errors,
    updatedAt: new Date().toISOString(),
  }
}

function actionFlagForPlanItem(item: TurnPlanItem): TurnBooleanFlag | undefined {
  const normalized = item.name.toLowerCase()
  if (normalized.includes('dash')) return 'dashSpent'
  if (normalized.includes('disengage')) return 'disengageSpent'
  if (normalized.includes('dodge')) return 'dodgeSpent'
  if (normalized.includes('help')) return 'helpSpent'
  if (normalized.includes('hide')) return 'hideSpent'
  if (normalized.includes('ready')) return 'readySpent'
  if (normalized.includes('search')) return 'searchSpent'
  if (normalized.includes('object')) return 'useObjectSpent'
  return undefined
}

interface ComputedTurnResult {
  character: Character
  plan: CharacterTurnPlan
}

export function ComputeTurnPlanUseCase(character: Character, plan: CharacterTurnPlan): ComputedTurnResult {
  const validated = ValidateTurnPlanUseCase(character, plan)
  if (validated.validationErrors.length) {
    return { character, plan: validated }
  }

  const actionCost = countPendingCost(plan, 'action')
  const bonusCost = countPendingCost(plan, 'bonusAction')
  const reactionCost = countPendingCost(plan, 'reaction')
  const movementCost = plan.items.reduce((sum, item) => sum + (item.movementCost ?? 0), 0)
  const attackItems = plan.items.filter((item) => item.type === 'attack')
  const nextTurnState = { ...character.turnState }

  nextTurnState.actionSpent = character.turnState.actionSpent || actionCost > 0
  nextTurnState.bonusActionSpent = character.turnState.bonusActionSpent || bonusCost > 0
  nextTurnState.reactionSpent = character.turnState.reactionSpent || reactionCost > 0
  nextTurnState.movementSpent = Math.min(character.speed, character.turnState.movementSpent + movementCost)
  nextTurnState.attacksSpent = Math.min(character.turnState.attacksPerAction, character.turnState.attacksSpent + attackItems.length)

  plan.items.forEach((item) => {
    const flag = actionFlagForPlanItem(item)
    if (flag) {
      nextTurnState[flag] = true
    }
  })

  const spellSlots = plan.items
    .filter((item) => item.type === 'spell' && item.spellSlotLevel)
    .reduce((slots, item) => SpendSpellSlotUseCase(slots, item.spellSlotLevel ?? 0), character.spellSlots)
    .map((slot) => ({ ...slot, pendingSlots: 0 }))

  const nextCharacter = {
    ...character,
    turnState: nextTurnState,
    spellSlots,
    attacks: character.attacks.map((attack) =>
      attackItems.some((item) => item.attackId === attack.id) ? { ...attack, used: true } : attack,
    ),
    actions: character.actions.map((action) =>
      plan.items.some((item) => item.name === action.name) ? { ...action, used: true } : action,
    ),
    features: character.features.map((feature) => {
      const used = plan.items.some((item) => item.featureId === feature.id)
      return used && feature.currentUses !== undefined
        ? { ...feature, active: true, currentUses: Math.max(0, feature.currentUses - 1) }
        : feature
    }),
    traits: character.traits.map((feature) => {
      const used = plan.items.some((item) => item.featureId === feature.id)
      return used && feature.currentUses !== undefined
        ? { ...feature, active: true, currentUses: Math.max(0, feature.currentUses - 1) }
        : feature
    }),
    triggers: character.triggers.map((trigger) =>
      plan.items.some((item) => item.triggerId === trigger.id) ? { ...trigger, active: true } : trigger,
    ),
  }

  return {
    character: nextCharacter,
    plan: {
      ...validated,
      status: 'computed',
      computedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }
}

export function UndoLastComputedTurnUseCase(_current: Character, previous: Character): Character {
  return {
    ...previous,
    spellSlots: ClearPendingSpellSlotsUseCase(previous.spellSlots),
  }
}
