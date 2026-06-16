import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Dice5,
  Eye,
  Footprints,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Swords,
  Trash2,
  Undo2,
  Zap,
} from 'lucide-react'
import clsx from 'clsx'
import type {
  ActionCost,
  Character,
  CharacterAction,
  CharacterAttack,
  CharacterFeature,
  CharacterSpell,
  CharacterTurnPlan,
  TurnPlanItem,
} from '@domain/entities/character'
import {
  type ActionOptionCostGroup,
  ComputeTurnPlanUseCase,
  CreateCharacterActionUseCase,
  CreateCharacterAttackUseCase,
  CreateTurnPlanUseCase,
  DeleteCharacterActionUseCase,
  DeleteCharacterAttackUseCase,
  DuplicateCharacterActionUseCase,
  DuplicateCharacterAttackUseCase,
  ListTurnActionOptionsByCostUseCase,
  manualRollTotal,
  RemoveTurnActionUseCase,
  RemoveTurnPlanItemsForDeletedActionUseCase,
  ResetTurnResourcesUseCase,
  SelectTurnActionUseCase,
  SummarizeTurnPlanResourcesUseCase,
  type TurnActionOption,
  UndoLastComputedTurnUseCase,
  UpdateCharacterActionUseCase,
  UpdateCharacterAttackUseCase,
  UpdateTurnPlanItemUseCase,
  ValidateTurnPlanUseCase,
} from '@application/use-cases/characterActions'
import { ListAvailableSpellsForActionUseCase, spellEffectCategoryLabels } from '@application/use-cases/characterSpells'
import { Field, NumberInput, SelectInput, TextInput } from '@ui/components/FormControls'
import { LineIcon } from '@ui/components/LineIcon'

interface CharacterActionsPanelProps {
  canEdit: boolean
  character: Character
  onChange: (character: Character) => void
}

type SelectionMode = 'attack' | 'spell' | 'feature' | undefined

const actionCostSections: Array<{ id: ActionOptionCostGroup; title: string; eyebrow: string; description: string }> = [
  { id: 'consumeAction', title: 'Action', eyebrow: 'Action', description: 'Ataque, spell o accion principal.' },
  { id: 'consumeBonusAction', title: 'Bonus', eyebrow: 'Bonus', description: 'Solo opciones reales disponibles.' },
  { id: 'freeAction', title: 'Free', eyebrow: 'Free', description: 'Opciones libres y rasgos pasivos.' },
]

function actionCostLabel(cost: ActionCost): string {
  const labels: Record<ActionCost, string> = {
    action: 'Action',
    bonusAction: 'Bonus Action',
    reaction: 'Reaction',
    movement: 'Movement',
    free: 'Free Action',
    passive: 'Passive',
  }
  return labels[cost]
}

function formatActionBonus(value: number): string {
  return value >= 0 ? `+${value}` : String(value)
}

function costClass(cost: ActionCost): string {
  return `cost-${cost.toLowerCase()}`
}

function resourceClass(state: 'ready' | 'pending' | 'spent'): string {
  return `is-${state}`
}

function isLegacyUseObjectAction(action: CharacterAction): boolean {
  const normalizedName = action.name.trim().toLowerCase()
  return normalizedName === 'use an object' || normalizedName === 'use object'
}

function patchAttack(character: Character, attack: CharacterAttack): Character {
  return {
    ...character,
    attacks: character.attacks.map((item) => (item.id === attack.id ? attack : item)),
  }
}

function patchAction(character: Character, action: CharacterAction): Character {
  return {
    ...character,
    actions: character.actions.map((item) => (item.id === action.id ? action : item)),
  }
}

function optionIcon(option: TurnActionOption): LucideIcon {
  const icons: Record<string, LucideIcon> = {
    attack: Swords,
    spell: BookOpen,
    dash: Footprints,
    disengage: ShieldAlert,
    hide: Eye,
    object: Sparkles,
    feature: Zap,
  }

  return icons[option.id] ?? Sparkles
}

function attackForItem(character: Character, item: TurnPlanItem): CharacterAttack | undefined {
  return character.attacks.find((attack) => attack.id === item.attackId)
}

function spellForItem(character: Character, item: TurnPlanItem): CharacterSpell | undefined {
  return character.spells.find((spell) => spell.id === item.spellId)
}

function hasAvailableSpellSlot(character: Character, spell: CharacterSpell, plan: CharacterTurnPlan): boolean {
  if (spell.spellLevel === 0) {
    return true
  }

  const pending = plan.items.filter((item) => item.type === 'spell' && item.spellSlotLevel === spell.spellLevel).length
  const slot = character.spellSlots.find((candidate) => candidate.spellLevel === spell.spellLevel)
  return Boolean(slot && slot.currentSlots - pending > 0)
}

export function CharacterActionsPanel({ canEdit, character, onChange }: CharacterActionsPanelProps) {
  const [turnPlan, setTurnPlan] = useState(() => CreateTurnPlanUseCase(character, character.ownerUserId))
  const [selectionMode, setSelectionMode] = useState<SelectionMode>()
  const [selectionCost, setSelectionCost] = useState<ActionCost | undefined>()
  const [movementDraft, setMovementDraft] = useState(() => ({ baseSpeed: character.speed, feet: character.speed }))
  const [editingAttackId, setEditingAttackId] = useState<string | undefined>()
  const [editingActionId, setEditingActionId] = useState<string | undefined>()
  const [lastComputedCharacter, setLastComputedCharacter] = useState<Character | undefined>()
  const [feedback, setFeedback] = useState('Elige opciones para planificar tu turno.')
  const movementDraftFeet = movementDraft.baseSpeed === character.speed ? movementDraft.feet : character.speed

  const resourceSummary = useMemo(() => SummarizeTurnPlanResourcesUseCase(character, turnPlan), [character, turnPlan])
  const previewValidation = useMemo(() => ValidateTurnPlanUseCase(character, turnPlan), [character, turnPlan])
  const preparedSpells = useMemo(() => ListAvailableSpellsForActionUseCase(character), [character])
  const filteredPreparedSpells = useMemo(
    () => preparedSpells.filter((spell) => !selectionCost || spell.castingTime === selectionCost),
    [preparedSpells, selectionCost],
  )
  const actionOptionsByCost = useMemo(() => ListTurnActionOptionsByCostUseCase(character, movementDraftFeet), [character, movementDraftFeet])
  const movementRemaining = Math.max(0, resourceSummary.movementAvailable - resourceSummary.movementPending)
  const configuredActions = useMemo(() => character.actions.filter((action) => !isLegacyUseObjectAction(action)), [character.actions])
  const sortedPlanItems = [...turnPlan.items].sort((left, right) => left.sortOrder - right.sortOrder)

  function addAttack() {
    onChange({ ...character, attacks: [CreateCharacterAttackUseCase(), ...character.attacks] })
  }

  function addCustomAction() {
    const action = CreateCharacterActionUseCase(character.id)
    onChange({ ...character, actions: [action, ...character.actions] })
    setEditingActionId(action.id)
  }

  function duplicateAction(action: CharacterAction) {
    onChange({ ...character, actions: [DuplicateCharacterActionUseCase(action), ...character.actions] })
  }

  function deleteAction(action: CharacterAction) {
    if (!window.confirm(`Borrar accion "${action.name}"? Tambien se quitara del plan actual si estaba seleccionada.`)) {
      return
    }

    onChange(DeleteCharacterActionUseCase(character, action.id))
    setTurnPlan((current) => RemoveTurnPlanItemsForDeletedActionUseCase(current, { actionId: action.id }))
    setEditingActionId(undefined)
    setFeedback(`${action.name} borrada.`)
  }

  function duplicateAttack(attack: CharacterAttack) {
    onChange({ ...character, attacks: [DuplicateCharacterAttackUseCase(attack), ...character.attacks] })
  }

  function deleteAttack(attack: CharacterAttack) {
    if (!window.confirm(`Borrar ataque "${attack.name}"? Tambien se quitara del plan actual si estaba seleccionado.`)) {
      return
    }

    onChange(DeleteCharacterAttackUseCase(character, attack.id))
    setTurnPlan((current) => RemoveTurnPlanItemsForDeletedActionUseCase(current, { attackId: attack.id }))
    setEditingAttackId(undefined)
    setFeedback(`${attack.name} borrado.`)
  }

  function addOption(option: TurnActionOption) {
    if (option.mode) {
      setSelectionMode(option.mode)
      setSelectionCost(option.cost)
      setFeedback(`Elige una opción de ${option.label}.`)
      return
    }

    if (option.movementCost !== undefined) {
      setTurnPlan((current) =>
        SelectTurnActionUseCase(current, {
          movementCost: option.movementCost,
          movementName: option.label,
          movementSummary: `${option.label}: ${option.movementCost} ft`,
        }),
      )
      setFeedback(`${option.label} anadido al plan.`)
      return
    }

    if (option.action) {
      setTurnPlan((current) => SelectTurnActionUseCase(current, { action: option.action }))
      setFeedback(`${option.label} anadido al plan.`)
      return
    }

    if (option.feature) {
      setTurnPlan((current) => SelectTurnActionUseCase(current, { feature: option.feature }))
      setFeedback(`${option.label} anadido al plan.`)
    }
  }

  function addPlannedAttack(attack: CharacterAttack) {
    setTurnPlan((current) => SelectTurnActionUseCase(current, { attack }))
    setSelectionCost(undefined)
    setFeedback(`${attack.name} anadido al plan.`)
  }

  function addPlannedSpell(spell: CharacterSpell) {
    setTurnPlan((current) => SelectTurnActionUseCase(current, { spell }))
    setSelectionCost(undefined)
    setFeedback(`${spell.name} anadido al plan.`)
  }

  function addPlannedFeature(feature: CharacterFeature) {
    setTurnPlan((current) => SelectTurnActionUseCase(current, { feature }))
    setSelectionCost(undefined)
    setFeedback(`${feature.name} anadido al plan.`)
  }

  function addMovementPlan() {
    const plannedFeet = Math.min(movementDraftFeet, movementRemaining)

    if (plannedFeet <= 0) {
      setFeedback('No queda movimiento disponible para planificar.')
      return
    }

    setTurnPlan((current) =>
      SelectTurnActionUseCase(current, {
        movementCost: plannedFeet,
        movementName: 'Move',
        movementSummary: `Move: ${plannedFeet} ft`,
      }),
    )
    setFeedback(`Movimiento de ${plannedFeet} ft anadido al plan.`)
  }

  function computeTurn() {
    const result = ComputeTurnPlanUseCase(character, turnPlan)
    setTurnPlan(result.plan)

    if (result.plan.status === 'computed') {
      setLastComputedCharacter(character)
      onChange(result.character)
      setTurnPlan(CreateTurnPlanUseCase(result.character, character.ownerUserId))
      setFeedback('Turno computado.')
      return
    }

    setFeedback('Revisa el plan: hay conflictos.')
  }

  function undoTurn() {
    if (!lastComputedCharacter) {
      return
    }

    onChange(UndoLastComputedTurnUseCase(character, lastComputedCharacter))
    setTurnPlan(CreateTurnPlanUseCase(lastComputedCharacter, character.ownerUserId))
    setLastComputedCharacter(undefined)
    setFeedback('Ultimo turno deshecho.')
  }

  function resetTurn() {
    const reset = ResetTurnResourcesUseCase(character)
    onChange(reset)
    setTurnPlan(CreateTurnPlanUseCase(reset, character.ownerUserId))
    setFeedback('Recursos de turno reiniciados.')
  }

  function updatePlanItem(itemId: string, patch: Partial<TurnPlanItem>) {
    setTurnPlan((current) => UpdateTurnPlanItemUseCase(current, itemId, patch))
  }

  return (
    <div className="actions-playmat">
      <section className="turn-resource-panel" aria-label="Recursos del turno">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Tu turno</p>
            <h3>Recursos disponibles</h3>
          </div>
          <div className="inline-actions">
            {lastComputedCharacter ? (
              <button className="ghost-button" onClick={undoTurn} type="button">
                <Undo2 size={16} aria-hidden="true" />
                Undo last computed turn
              </button>
            ) : null}
            <button className="ghost-button" onClick={resetTurn} type="button">
              <RotateCcw size={16} aria-hidden="true" />
              Reset Turn
            </button>
          </div>
        </div>
        <div className="turn-resource-grid planner-resource-grid">
          <article className={clsx('turn-resource-tile', resourceClass(resourceSummary.action))}>
            <Swords size={26} aria-hidden="true" />
            <strong>Action</strong>
            <span>{resourceSummary.actionRemaining}/{resourceSummary.actionLimit}</span>
          </article>
          <article className={clsx('turn-resource-tile', resourceSummary.attacksRemaining <= 0 ? 'is-spent' : resourceSummary.attacksPending ? 'is-pending' : 'is-ready')}>
            <Dice5 size={26} aria-hidden="true" />
            <strong>Ataques</strong>
            <span>{resourceSummary.attacksRemaining}/{resourceSummary.attacksLimit}</span>
          </article>
          <article className={clsx('turn-resource-tile', resourceSummary.movementPending ? 'is-pending' : movementRemaining <= 0 ? 'is-spent' : 'is-ready')}>
            <Footprints size={26} aria-hidden="true" />
            <strong>Movement</strong>
            <span>{movementRemaining} ft / {resourceSummary.movementLimit} ft{resourceSummary.dashPending ? ' (Dash)' : ''}</span>
          </article>
          <article className={clsx('turn-resource-tile', resourceClass(resourceSummary.bonusAction))}>
            <Sparkles size={26} aria-hidden="true" />
            <strong>Bonus Action</strong>
            <span>{resourceSummary.bonusActionRemaining}/{resourceSummary.bonusActionLimit}</span>
          </article>
          {character.spellcasting.isSpellcaster ? (
            <article className="turn-resource-tile spell-slot-resource is-ready">
              <BookOpen size={26} aria-hidden="true" />
              <strong>Spell Slots</strong>
              <div className="resource-spell-slot-list">
                {character.spellSlots.length ? character.spellSlots.map((slot) => {
                  const pending = resourceSummary.spellSlotsPendingByLevel[slot.spellLevel] ?? 0
                  const litCount = Math.max(0, slot.currentSlots - pending)
                  return (
                    <span key={slot.id} aria-label={`Level ${slot.spellLevel}: ${litCount} disponibles, ${pending} pendientes`}>
                      L{slot.spellLevel}
                      {Array.from({ length: slot.maxSlots }, (_, index) => (
                        <i
                          className={clsx(
                            'mini-spell-orb',
                            index < litCount && 'is-lit',
                            index >= litCount && index < slot.currentSlots && 'is-pending',
                          )}
                          key={`${slot.id}_${index}`}
                        />
                      ))}
                    </span>
                  )
                }) : <span>Sin slots</span>}
              </div>
            </article>
          ) : null}
        </div>
      </section>

      {canEdit ? (
        <details className="action-management-panel compact-action-management" aria-label="Acciones configuradas por el DM">
          <summary>Opciones avanzadas DM</summary>
          <div className="panel-heading compact-panel-heading">
            <div>
              <p className="eyebrow">Opcional</p>
              <h3>Acciones configuradas</h3>
            </div>
            <button className="ghost-button" onClick={addCustomAction} type="button">
              <Sparkles size={16} aria-hidden="true" />
              Nueva accion
            </button>
          </div>
          <div className="action-manager-list">
            {configuredActions.length ? configuredActions.map((action) => {
              const isEditing = editingActionId === action.id
              return (
                <article className="action-manager-card" key={action.id}>
                  <div className="action-card-title">
                    <LineIcon label={`Icono de ${action.name}`} name={action.actionCost === 'reaction' ? 'shield' : action.actionCost === 'bonusAction' ? 'spark' : 'blade'} />
                    <div>
                      <p className="eyebrow">{actionCostLabel(action.actionCost)}</p>
                      <h4>{action.name}</h4>
                    </div>
                    <span className={clsx('action-cost-pill', action.used ? 'is-spent' : 'is-ready')}>{action.used ? 'Usada' : 'Lista'}</span>
                  </div>
                  <p>{action.quickNotes || action.description || 'Accion configurable.'}</p>
                  <div className="action-stats">
                    <span>Range <strong>{action.range}</strong></span>
                    {action.hitBonus !== undefined ? <span>Hit <strong>{formatActionBonus(action.hitBonus)}</strong></span> : null}
                    {action.saveDc ? <span>DC <strong>{action.saveDc}</strong></span> : null}
                    {action.damageDice ? <span>Damage <strong>{action.damageDice} + {action.damageBonus ?? 0} {action.damageType}</strong></span> : null}
                  </div>
                  <div className="inline-actions">
                    <button className="ghost-button" onClick={() => setEditingActionId(isEditing ? undefined : action.id)} type="button">
                      {isEditing ? 'Cerrar' : 'Editar'}
                    </button>
                    <button className="icon-button" onClick={() => duplicateAction(action)} title="Duplicar accion" type="button">
                      <Sparkles size={15} aria-hidden="true" />
                    </button>
                    <button className="icon-button danger" onClick={() => deleteAction(action)} title="Borrar accion" type="button">
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                  {isEditing ? (
                    <div className="action-edit-grid">
                      <Field label="Nombre">
                        <TextInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { name: event.target.value })))} value={action.name} />
                      </Field>
                      <Field label="Consume">
                        <SelectInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { actionCost: event.target.value as ActionCost })))} value={action.actionCost}>
                          <option value="action">Action</option>
                          <option value="bonusAction">Bonus Action</option>
                          <option value="free">Free Action</option>
                          <option value="movement">Movement</option>
                          <option value="passive">Passive</option>
                        </SelectInput>
                      </Field>
                      <Field label="Range">
                        <TextInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { range: event.target.value })))} value={action.range} />
                      </Field>
                      <Field label="Hit bonus">
                        <NumberInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { hitBonus: Number(event.target.value) })))} value={action.hitBonus ?? 0} />
                      </Field>
                      <Field label="Save DC">
                        <NumberInput min={0} onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { saveDc: Number(event.target.value) })))} value={action.saveDc ?? 0} />
                      </Field>
                      <Field label="Damage dice">
                        <TextInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { damageDice: event.target.value })))} value={action.damageDice ?? ''} />
                      </Field>
                      <Field label="Damage bonus">
                        <NumberInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { damageBonus: Number(event.target.value) })))} value={action.damageBonus ?? 0} />
                      </Field>
                      <Field label="Damage type">
                        <TextInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { damageType: event.target.value })))} value={action.damageType ?? ''} />
                      </Field>
                      <Field label="Notas rapidas">
                        <TextInput onChange={(event) => onChange(patchAction(character, UpdateCharacterActionUseCase(action, { quickNotes: event.target.value })))} value={action.quickNotes} />
                      </Field>
                    </div>
                  ) : null}
                </article>
              )
            }) : (
              <div className="empty-state compact-empty">
                <Sparkles size={24} aria-hidden="true" />
                <strong>Sin acciones configuradas</strong>
                <p>Crea solo las acciones especiales que necesite esta ficha.</p>
              </div>
            )}
          </div>
        </details>
      ) : null}

      <section className="guided-action-section">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Turno</p>
            <h3>Elige que quieres hacer</h3>
          </div>
          <span className={clsx('turn-feedback-chip', turnPlan.status)}>{feedback}</span>
        </div>
        <div className="action-cost-section-grid">
          {actionCostSections.map((section) => (
            <section className={clsx('action-cost-section', `action-cost-${section.id}`)} key={section.id} aria-label={section.title}>
              <div className="action-cost-heading">
                <span>{section.eyebrow}</span>
                <strong>{section.title}</strong>
                <small>{section.description}</small>
              </div>
              <div className="action-type-grid">
                {actionOptionsByCost[section.id].length ? actionOptionsByCost[section.id].map((option) => {
                  const Icon = optionIcon(option)
                  return (
                    <button
                      className={clsx('action-type-card', selectionMode === option.mode && option.mode && 'is-active')}
                      key={option.id}
                      onClick={() => addOption(option)}
                      type="button"
                    >
                      <Icon size={24} aria-hidden="true" />
                      <strong>{option.label}</strong>
                      <small className={costClass(option.cost)}>{actionCostLabel(option.cost)}</small>
                      <span>{option.description}</span>
                    </button>
                  )
                }) : (
                  <div className="empty-state compact-empty action-empty-state">
                    <Sparkles size={22} aria-hidden="true" />
                    <strong>Sin opciones reales</strong>
                    <p>El DM puede configurar una opción para esta categoría.</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
        <div className="movement-planner-control">
          <label className="movement-planner-field">
            <span>Movimiento a planificar</span>
            <NumberInput max={movementRemaining} min={0} onChange={(event) => setMovementDraft({ baseSpeed: character.speed, feet: Number(event.target.value) })} value={Math.min(movementDraftFeet, movementRemaining)} />
            <small>ft</small>
          </label>
          <button className="ghost-button" disabled={movementRemaining <= 0} onClick={addMovementPlan} type="button">
            <Footprints size={16} aria-hidden="true" />
            Anadir movimiento
          </button>
          <small className="movement-planner-hint">
            Base {character.speed} ft{resourceSummary.dashPending ? ` - Dash activo: ${resourceSummary.movementLimit} ft disponibles` : ''}
          </small>
        </div>
      </section>

      {selectionMode === 'attack' ? (
        <section className="guided-action-section">
          <div className="panel-heading">
            <div>
            <p className="eyebrow">Ataque</p>
            <h3>Elige ataque</h3>
            </div>
            {canEdit ? <button className="ghost-button" onClick={addAttack} type="button">Nuevo ataque</button> : null}
          </div>
          <div className="action-card-grid">
            {character.attacks.map((attack) => {
              const isEditing = editingAttackId === attack.id
              return (
                <article className={clsx('guided-action-card', attack.used && 'is-spent')} key={attack.id}>
                  <div className="action-card-title">
                    <Swords size={24} aria-hidden="true" />
                    <div>
                      <p className="eyebrow">{actionCostLabel(attack.actionCost)}</p>
                      <h4>{attack.name}</h4>
                    </div>
                    <span className={clsx('action-cost-pill', attack.used ? 'is-spent' : 'is-ready')}>{attack.used ? 'Usado' : 'Listo'}</span>
                  </div>
                  <div className="action-stats">
                    <span>Range <strong>{attack.range}</strong></span>
                    <span>Hit <strong>{attack.hitBonus >= 0 ? `+${attack.hitBonus}` : attack.hitBonus}</strong></span>
                    {attack.saveDc ? <span>DC <strong>{attack.saveDc}</strong></span> : null}
                    <span>Damage <strong>{attack.damageDice} + {attack.damageBonus} {attack.damageType}</strong></span>
                  </div>
                  <p>{attack.quickNotes}</p>
                  <div className="inline-actions">
                    <button className="primary-button" onClick={() => addPlannedAttack(attack)} type="button">Anadir al plan</button>
                    {canEdit ? (
                      <>
                        <button className="ghost-button" onClick={() => setEditingAttackId(isEditing ? undefined : attack.id)} type="button">Editar</button>
                        <button className="icon-button" onClick={() => duplicateAttack(attack)} title="Duplicar ataque" type="button">
                          <Sparkles size={15} aria-hidden="true" />
                        </button>
                        <button className="icon-button danger" onClick={() => deleteAttack(attack)} title="Borrar ataque" type="button">
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </>
                    ) : null}
                  </div>
                  {isEditing ? (
                    <div className="action-edit-grid">
                      <Field label="Nombre">
                        <TextInput onChange={(event) => onChange(patchAttack(character, UpdateCharacterAttackUseCase(attack, { name: event.target.value })))} value={attack.name} />
                      </Field>
                      <Field label="Consume">
                        <SelectInput onChange={(event) => onChange(patchAttack(character, UpdateCharacterAttackUseCase(attack, { actionCost: event.target.value as ActionCost })))} value={attack.actionCost}>
                          <option value="action">Action</option>
                          <option value="bonusAction">Bonus Action</option>
                          <option value="free">Free Action</option>
                        </SelectInput>
                      </Field>
                      <Field label="Range">
                        <TextInput onChange={(event) => onChange(patchAttack(character, UpdateCharacterAttackUseCase(attack, { range: event.target.value })))} value={attack.range} />
                      </Field>
                      <Field label="Hit bonus">
                        <NumberInput onChange={(event) => onChange(patchAttack(character, UpdateCharacterAttackUseCase(attack, { hitBonus: Number(event.target.value) })))} value={attack.hitBonus} />
                      </Field>
                      <Field label="Damage dice">
                        <TextInput onChange={(event) => onChange(patchAttack(character, UpdateCharacterAttackUseCase(attack, { damageDice: event.target.value })))} value={attack.damageDice} />
                      </Field>
                      <Field label="Damage bonus">
                        <NumberInput onChange={(event) => onChange(patchAttack(character, UpdateCharacterAttackUseCase(attack, { damageBonus: Number(event.target.value) })))} value={attack.damageBonus} />
                      </Field>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {selectionMode === 'spell' && character.spellcasting.isSpellcaster ? (
        <section className="guided-action-section spell-picker-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Spell</p>
              <h3>Elige spell</h3>
            </div>
          </div>
          <div className="spell-action-grid">
            {filteredPreparedSpells.length ? filteredPreparedSpells.map((spell) => {
              const canCast = hasAvailableSpellSlot(character, spell, turnPlan)
              return (
                <article className={clsx('spell-action-card', !canCast && 'is-locked')} key={spell.id}>
                  <div className="spell-card-heading">
                    <span className={clsx('spell-effect-icon', `effect-${spell.effectCategory}`)}>
                      <LineIcon label={`Icono ${spellEffectCategoryLabels[spell.effectCategory]}`} name={spell.effectIcon} />
                    </span>
                    <div>
                      <p className="eyebrow">Level {spell.spellLevel} - {actionCostLabel(spell.castingTime)}</p>
                      <h4>{spell.name}</h4>
                    </div>
                  </div>
                  <p>{spell.summary}</p>
                  <div className="action-stats">
                    <span>{spellEffectCategoryLabels[spell.effectCategory]}</span>
                    <span>Range <strong>{spell.range}</strong></span>
                    {spell.hitBonus !== undefined ? <span>Hit <strong>{spell.hitBonus >= 0 ? `+${spell.hitBonus}` : spell.hitBonus}</strong></span> : null}
                    {spell.saveDc ? <span>DC <strong>{spell.saveDc}</strong></span> : null}
                    <span>{spell.damageOrHealing}</span>
                  </div>
                  {!canCast ? <p className="validation-message">No te quedan spell slots de nivel {spell.spellLevel}.</p> : null}
                  <button className="primary-button" disabled={!canCast} onClick={() => addPlannedSpell(spell)} type="button">Anadir al plan</button>
                </article>
              )
            }) : (
              <div className="empty-state compact-empty">
                <BookOpen size={28} />
                <strong>Sin spells disponibles</strong>
                <p>Marca conjuros como conocidos y preparados en el Libro.</p>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {selectionMode === 'feature' ? (
        <section className="guided-action-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Bonus y triggers</p>
              <h3>Features aplicables</h3>
            </div>
          </div>
          <div className="feature-rune-grid">
            {[...character.features, ...character.traits]
              .filter((feature) => !selectionCost || feature.type === selectionCost)
              .map((feature) => (
              <button
                className={clsx('feature-rune-card', feature.active && 'is-active')}
                key={feature.id}
                onClick={() => addPlannedFeature(feature)}
                type="button"
              >
                <Sparkles size={22} aria-hidden="true" />
                <strong>{feature.name}</strong>
                <span>{feature.summary}</span>
                <small>{actionCostLabel(feature.type)} - {feature.currentUses ?? '-'} / {feature.maxUses ?? '-'} usos</small>
              </button>
            ))}
            {(!selectionCost || selectionCost === 'reaction') ? character.triggers.map((trigger) => (
              <button
                className={clsx('trigger-rune', trigger.active && 'is-active')}
                key={trigger.id}
                onClick={() => {
                  setTurnPlan((current) => SelectTurnActionUseCase(current, { trigger }))
                  setSelectionCost(undefined)
                  setFeedback(`${trigger.name} anadido al plan.`)
                }}
                type="button"
              >
                <Sparkles size={15} aria-hidden="true" />
                <strong>{trigger.name}</strong>
                <span>{trigger.summary}</span>
              </button>
            )) : null}
          </div>
        </section>
      ) : null}

      <section className="turn-plan-panel" aria-label="Plan del turno">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Resolver</p>
            <h3>Plan del turno</h3>
          </div>
          <div className="inline-actions">
            <button className="ghost-button" onClick={() => setTurnPlan(CreateTurnPlanUseCase(character, character.ownerUserId))} type="button">Vaciar plan</button>
            <button className="primary-button" disabled={!turnPlan.items.length} onClick={computeTurn} type="button">
              <CheckCircle2 size={17} aria-hidden="true" />
              Computar turno
            </button>
          </div>
        </div>
        {previewValidation.validationErrors.length ? (
          <div className="validation-stack" role="alert">
            {previewValidation.validationErrors.map((error) => (
              <p className="validation-message" key={error}>
                <CircleAlert size={15} aria-hidden="true" />
                {error}
              </p>
            ))}
          </div>
        ) : null}
        <div className="turn-plan-list">
          {sortedPlanItems.length ? sortedPlanItems.map((item) => {
            const attack = attackForItem(character, item)
            const spell = spellForItem(character, item)
            const hitBonus = attack?.hitBonus ?? spell?.hitBonus ?? 0
            const damageBonus = attack?.damageBonus ?? 0
            const rollTotal = item.manualRoll !== undefined ? manualRollTotal(item.manualRoll, hitBonus) : undefined
            const damageTotal = item.manualDamageRoll !== undefined ? item.manualDamageRoll + damageBonus : undefined
            return (
              <article className="turn-plan-item" key={item.id}>
                <div className="turn-plan-item-main">
                  <Dice5 size={22} aria-hidden="true" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{actionCostLabel(item.costType)} - {item.summary}</span>
                  </div>
                  <button className="icon-button" onClick={() => setTurnPlan((current) => RemoveTurnActionUseCase(current, item.id))} title="Quitar del plan" type="button">
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                {item.type === 'movement' ? (
                  <label className="manual-roll-box compact-plan-field">
                    <strong>Movimiento</strong>
                    <NumberInput
                      max={character.speed}
                      min={0}
                      onChange={(event) => updatePlanItem(item.id, { movementCost: Number(event.target.value), costAmount: Number(event.target.value), summary: `Mover ${event.target.value} ft` })}
                      value={item.movementCost ?? 0}
                    />
                    <span>ft</span>
                  </label>
                ) : null}
                {item.type === 'attack' || item.type === 'spell' ? (
                  <div className="manual-roll-box plan-roll-grid">
                    <strong>Roll d20 {hitBonus >= 0 ? `+ ${hitBonus}` : `- ${Math.abs(hitBonus)}`}</strong>
                    <label>
                      <span>d20 fisico</span>
                      <NumberInput min={0} onChange={(event) => updatePlanItem(item.id, { manualRoll: Number(event.target.value) })} value={item.manualRoll ?? ''} />
                    </label>
                    <span>Total: <strong>{rollTotal ?? '-'}</strong></span>
                    <label>
                      <span>Hit/Miss</span>
                      <SelectInput onChange={(event) => updatePlanItem(item.id, { hitResult: event.target.value as TurnPlanItem['hitResult'] })} value={item.hitResult ?? 'unknown'}>
                        <option value="unknown">Pendiente</option>
                        <option value="hit">Hit</option>
                        <option value="miss">Miss</option>
                      </SelectInput>
                    </label>
                    <label>
                      <span>Daño/curación</span>
                      <NumberInput min={0} onChange={(event) => updatePlanItem(item.id, { manualDamageRoll: Number(event.target.value) })} value={item.manualDamageRoll ?? ''} />
                    </label>
                    <span>Total daño: <strong>{damageTotal ?? '-'}</strong></span>
                  </div>
                ) : null}
              </article>
            )
          }) : (
            <div className="empty-state compact-empty">
              <Sparkles size={28} />
              <strong>Plan vacío</strong>
              <p>Elige una accion arriba. Nada se gasta hasta computar.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
