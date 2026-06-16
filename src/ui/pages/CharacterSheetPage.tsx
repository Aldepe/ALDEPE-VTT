import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Archive, BookOpen, Copy, Eye, ImagePlus, Save, Sparkles, Swords, Trash2, UserRound, WandSparkles } from 'lucide-react'
import type {
  AbilityKey,
  Character,
  CharacterArmor,
  CharacterFeature,
  FeatureFunctionalType,
  FeatureSourceType,
  CharacterLore,
  CharacterSkill,
  CharacterTool,
  CharacterWeapon,
  SavingThrow,
} from '@domain/entities/character'
import type { SaveStatus } from '@domain/entities/common'
import type { InventoryContainer, InventoryItem } from '@domain/entities/inventory'
import { abilityLabels, formatSigned, recalculateCharacterBonuses, skillLabels } from '@domain/services/characterStats'
import {
  createDefaultArmor,
  createDefaultTool,
  createDefaultWeapon,
} from '@application/use-cases/workspaceFactories'
import {
  CreateCharacterFeatureUseCase,
  DeleteCharacterFeatureUseCase,
  DuplicateCharacterFeatureUseCase,
  HighlightFeatureForPlayerUseCase,
  UpdateCharacterFeatureUseCase,
  featureIconLabels,
} from '@application/use-cases/characterFeatures'
import { ApplyLongRestUseCase, ApplyShortRestUseCase, type CharacterRestType } from '@application/use-cases/characterRests'
import { SetCharacterSpellcastingEnabledUseCase } from '@application/use-cases/characterSpells'
import {
  abilityOptions,
  armorProficiencyPresetOptions,
  conditionPresetOptions,
  damageTypePresetOptions,
  languagePresetOptions,
  toolPresetOptions,
  weaponProficiencyPresetOptions,
  type VisualPresetOption,
} from '@shared/constants/dnd'
import { fileToDataUrl } from '@shared/utils/fileToDataUrl'
import { CharacterActionsPanel } from '@ui/components/character/CharacterActionsPanel'
import {
  AbilityScoreCard,
  ArmorClassShield,
  CharacterStatBadge,
  HitPointOrb,
  SkillBadge,
  StatIcon,
} from '@ui/components/character/CharacterStatVisuals'
import { SpellbookPanel } from '@ui/components/character/SpellbookPanel'
import { Field, NumberInput, SelectInput, TextArea, TextInput } from '@ui/components/FormControls'
import { InventoryPanel } from '@ui/components/InventoryPanel'
import { LineIcon, type LineIconName } from '@ui/components/LineIcon'

interface CharacterSheetPageProps {
  canEdit: boolean
  character: Character
  inventoryContainers: InventoryContainer[]
  inventoryItems: InventoryItem[]
  onDeleteInventoryContainer: (containerId: string) => Promise<void>
  onDeleteInventoryItem: (itemId: string) => Promise<void>
  onSaveInventoryContainer: (container: InventoryContainer) => Promise<void>
  onSaveInventoryItem: (item: InventoryItem) => Promise<void>
  onSave: (character: Character) => Promise<void>
  saveStatus: SaveStatus
  viewerIsDm: boolean
}

type SheetTab = 'overview' | 'actions' | 'spellbook' | 'details' | 'inventory' | 'features' | 'lore'

const loreFields: Array<{ key: keyof CharacterLore; label: string; long?: boolean }> = [
  { key: 'alignment', label: 'Alignment' },
  { key: 'gender', label: 'Gender' },
  { key: 'eyes', label: 'Eyes' },
  { key: 'size', label: 'Size' },
  { key: 'height', label: 'Height' },
  { key: 'faith', label: 'Faith' },
  { key: 'hair', label: 'Hair' },
  { key: 'skin', label: 'Skin' },
  { key: 'age', label: 'Age' },
  { key: 'weight', label: 'Weight' },
  { key: 'personalityTraits', label: 'Personality traits', long: true },
  { key: 'ideals', label: 'Ideals', long: true },
  { key: 'bonds', label: 'Bonds', long: true },
  { key: 'flaws', label: 'Flaws', long: true },
  { key: 'appearance', label: 'Appearance', long: true },
  { key: 'background', label: 'Background', long: true },
  { key: 'organizations', label: 'Organizations', long: true },
  { key: 'allies', label: 'Allies', long: true },
  { key: 'enemies', label: 'Enemies', long: true },
  { key: 'backstory', label: 'Backstory', long: true },
  { key: 'other', label: 'Other', long: true },
]

const loreLongFields = loreFields.filter((field) => field.long)
const loreShortFields = loreFields.filter((field) => !field.long)

const featureSourceOptions: Array<{ value: FeatureSourceType; label: string }> = [
  { value: 'class', label: 'Class' },
  { value: 'subclass', label: 'Subclass' },
  { value: 'species', label: 'Species' },
  { value: 'background', label: 'Background' },
  { value: 'feat', label: 'Feat' },
  { value: 'item', label: 'Item' },
  { value: 'spell', label: 'Spell' },
  { value: 'condition', label: 'Condition' },
  { value: 'dmGranted', label: 'DM granted' },
  { value: 'custom', label: 'Custom' },
]

const featureFunctionalOptions: Array<{ value: FeatureFunctionalType; label: string }> = [
  { value: 'combat', label: 'Combat' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'social', label: 'Social' },
  { value: 'defense', label: 'Defense' },
  { value: 'healing', label: 'Healing' },
  { value: 'movement', label: 'Movement' },
  { value: 'resource', label: 'Resource' },
  { value: 'passive', label: 'Passive' },
  { value: 'utility', label: 'Utility' },
]

const conditionVisuals = {
  conditions: { icon: 'condition', label: 'Conditions', tone: 'condition' },
  resistances: { icon: 'resistance', label: 'Resistances', tone: 'resistance' },
  immunities: { icon: 'immunity', label: 'Immunities', tone: 'immunity' },
  vulnerabilities: { icon: 'vulnerability', label: 'Vulnerabilities', tone: 'vulnerability' },
} as const

const featureIconNames: Record<keyof typeof featureIconLabels, LineIconName> = {
  spark: 'spark',
  shield: 'shield',
  blade: 'blade',
  boots: 'boots',
  heart: 'heart',
  eye: 'eye',
  crown: 'crown',
  book: 'book',
  star: 'star',
  rune: 'rune',
}

function lineIconName(icon: string | undefined, fallback: LineIconName = 'spark'): LineIconName {
  return (featureIconNames[icon as keyof typeof featureIconNames] ?? icon ?? fallback) as LineIconName
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinLines(value: string[]): string {
  return value.join('\n')
}

function loreIconForField(key: keyof CharacterLore): LineIconName {
  const iconByField: Partial<Record<keyof CharacterLore, LineIconName>> = {
    personalityTraits: 'personality',
    ideals: 'star',
    bonds: 'heart',
    flaws: 'vulnerability',
    appearance: 'appearance',
    background: 'background',
    organizations: 'organization',
    allies: 'allies',
    enemies: 'enemy',
    backstory: 'book',
    other: 'rune',
  }

  return iconByField[key] ?? 'scroll'
}

function statusLabel(status: SaveStatus): string {
  if (status === 'saving') {
    return 'Guardando'
  }

  if (status === 'saved') {
    return 'Guardado'
  }

  if (status === 'error') {
    return 'Error al guardar'
  }

  return 'Sin cambios pendientes'
}

function abilityModifier(value: number): string {
  return formatSigned(Math.floor((value - 10) / 2))
}

interface DeathSaveTrackerProps {
  canEdit: boolean
  failures: number
  onChange: (successes: number, failures: number) => void
  successes: number
}

function DeathSaveTracker({ canEdit, failures, onChange, successes }: DeathSaveTrackerProps) {
  return (
    <article className="death-save-card">
      <StatIcon label="Icono de death saves" type="hp" />
      <div>
        <span>Death Saves</span>
        <div className="death-save-row" aria-label="Death save successes">
          <strong>Successes</strong>
          {[1, 2, 3].map((value) => (
            canEdit ? (
              <button
                aria-pressed={successes >= value}
                className={successes >= value ? 'is-marked success' : ''}
                key={`success_${value}`}
                onClick={() => onChange(successes >= value ? value - 1 : value, failures)}
                type="button"
              />
            ) : (
              <span aria-hidden="true" className={successes >= value ? 'is-marked success' : ''} key={`success_${value}`} />
            )
          ))}
        </div>
        <div className="death-save-row" aria-label="Death save failures">
          <strong>Failures</strong>
          {[1, 2, 3].map((value) => (
            canEdit ? (
              <button
                aria-pressed={failures >= value}
                className={failures >= value ? 'is-marked failure' : ''}
                key={`failure_${value}`}
                onClick={() => onChange(successes, failures >= value ? value - 1 : value)}
                type="button"
              />
            ) : (
              <span aria-hidden="true" className={failures >= value ? 'is-marked failure' : ''} key={`failure_${value}`} />
            )
          ))}
        </div>
        {canEdit ? <button className="ghost-button small-button" onClick={() => onChange(0, 0)} type="button">
          Reset
        </button> : null}
      </div>
    </article>
  )
}

interface DetailListCardProps {
  canEdit: boolean
  icon: 'skill' | 'proficiency' | 'perception'
  items: string[]
  label: string
  onChange: (items: string[]) => void
  presets?: VisualPresetOption[]
}

function PresetPicker({
  label,
  onAdd,
  presets,
}: {
  label: string
  onAdd: (value: string) => void
  presets: VisualPresetOption[]
}) {
  const [selected, setSelected] = useState(presets[0]?.label ?? 'Custom')

  return (
    <div className="preset-picker">
      <SelectInput aria-label={`${label} preset`} onChange={(event) => setSelected(event.target.value)} value={selected}>
        {presets.map((preset) => (
          <option key={preset.label} value={preset.label}>
            {preset.label}
          </option>
        ))}
      </SelectInput>
      <button className="ghost-button small-button" onClick={() => onAdd(selected)} type="button">
        Anadir
      </button>
    </div>
  )
}

function ReadOnlyChipList({ items, presets }: { items: string[]; presets?: VisualPresetOption[] }) {
  return (
    <div className="readonly-chip-list">
      {items.length ? items.map((item) => {
        const preset = presets?.find((option) => option.label.toLowerCase() === item.toLowerCase())
        return (
          <span className="readonly-chip" key={item} style={{ borderColor: preset?.color }}>
            <LineIcon className="chip-line-icon" label={`Icono de ${item}`} name={lineIconName(preset?.icon)} />
            {item}
          </span>
        )
      }) : <span className="readonly-chip is-empty">Sin entradas</span>}
    </div>
  )
}

function addUnique(items: string[], item: string): string[] {
  return items.some((value) => value.toLowerCase() === item.toLowerCase()) ? items : [...items, item]
}

function DetailListCard({ canEdit, icon, items, label, onChange, presets }: DetailListCardProps) {
  return (
    <article className="detail-list-card">
      <div className="detail-list-heading">
        <StatIcon label={`Icono de ${label}`} type={icon} />
        <h3>{label}</h3>
      </div>
      <ReadOnlyChipList items={items} presets={presets} />
      {canEdit && presets ? <PresetPicker label={label} onAdd={(item) => onChange(addUnique(items, item))} presets={presets} /> : null}
      {canEdit ? <TextArea onChange={(event) => onChange(splitLines(event.target.value))} value={joinLines(items)} /> : null}
    </article>
  )
}

interface VisualTextListCardProps {
  canEdit: boolean
  icon: LineIconName
  items: string[]
  label: string
  onChange: (items: string[]) => void
  presets?: VisualPresetOption[]
  tone: string
}

function VisualTextListCard({ canEdit, icon, items, label, onChange, presets, tone }: VisualTextListCardProps) {
  return (
    <article className={`visual-detail-card tone-${tone}`}>
      <div className="detail-list-heading">
        <LineIcon className="condition-symbol" label={`Icono de ${label}`} name={icon} />
        <h3>{label}</h3>
      </div>
      <div className="condition-chip-list" aria-label={`${label} actuales`}>
        {items.length ? items.map((item) => (
          <span className="condition-chip" key={item}>
            <LineIcon className="chip-line-icon" label={`Icono de ${item}`} name={icon} />
            {item}
          </span>
        )) : <span className="condition-chip is-empty">Sin entradas</span>}
      </div>
      {canEdit && presets ? <PresetPicker label={label} onAdd={(item) => onChange(addUnique(items, item))} presets={presets} /> : null}
      {canEdit ? <TextArea onChange={(event) => onChange(splitLines(event.target.value))} value={joinLines(items)} /> : null}
    </article>
  )
}

interface LoreWikiPageProps {
  canEdit: boolean
  character: Character
  onLoreChange: (key: keyof CharacterLore, value: string) => void
}

function LoreWikiPage({ canEdit, character, onLoreChange }: LoreWikiPageProps) {
  return (
    <section className={character.portrait.url ? 'lore-wiki-page has-portrait' : 'lore-wiki-page'} aria-label="Historia del personaje">
      <div className="lore-top-band">
        {character.portrait.url ? (
          <aside className="lore-wiki-portrait">
            <img alt={character.portrait.alt || character.name} src={character.portrait.url} />
          </aside>
        ) : null}
        <article className="lore-wiki-article">
          <header className="lore-wiki-header">
            <LineIcon className="lore-title-icon" label="Icono de historia" name="book" />
            <div>
              <p className="eyebrow">Historia</p>
              <h3>{character.name}</h3>
              <p>{character.className || 'Clase editable'} - {character.backgroundName || 'Trasfondo editable'}</p>
            </div>
          </header>

          <aside className="lore-infobox" aria-label="Resumen de personaje">
            {loreShortFields.map((field) => (
              canEdit ? (
                <label className="lore-fact-row" key={field.key}>
                  <LineIcon className="chip-line-icon" label={`Icono de ${field.label}`} name="scroll" />
                  <span>{field.label}</span>
                  <TextInput onChange={(event) => onLoreChange(field.key, event.target.value)} value={character.lore[field.key]} />
                </label>
              ) : (
                <div className="lore-fact-row lore-readonly-row" key={field.key}>
                  <LineIcon className="chip-line-icon" label={`Icono de ${field.label}`} name="scroll" />
                  <span>{field.label}</span>
                  <strong>{character.lore[field.key] || 'Sin definir'}</strong>
                </div>
              )
            ))}
          </aside>
        </article>
      </div>

      <div className="lore-article-section-list">
        {loreLongFields.map((field) => (
          <section className="lore-article-section" key={field.key}>
            <div className="lore-section-title">
              <LineIcon className="condition-symbol" label={`Icono de ${field.label}`} name={loreIconForField(field.key)} />
              <h4>{field.label}</h4>
            </div>
            {canEdit ? (
              <TextArea onChange={(event) => onLoreChange(field.key, event.target.value)} value={character.lore[field.key]} />
            ) : (
              <p className="lore-readonly-text">{character.lore[field.key] || 'Sin notas'}</p>
            )}
          </section>
        ))}
      </div>
    </section>
  )
}

interface FeatureEditorCardProps {
  canEdit: boolean
  collectionLabel: string
  feature: CharacterFeature
  onDelete: () => void
  onDuplicate: () => void
  onPatch: (feature: CharacterFeature) => void
  viewerIsDm: boolean
}

function FeatureEditorCard({
  canEdit,
  collectionLabel,
  feature,
  onDelete,
  onDuplicate,
  onPatch,
  viewerIsDm,
}: FeatureEditorCardProps) {
  const highlighted = feature.highlightForPlayer || feature.highlightedByDm

  function update(patch: Partial<CharacterFeature>) {
    onPatch(UpdateCharacterFeatureUseCase(feature, patch))
  }

  return (
    <article className={highlighted ? 'feature-list-card is-reminder' : feature.active ? 'feature-list-card is-active' : 'feature-list-card'}>
      <div className="feature-list-main">
        <span className="feature-icon-orb" aria-label={`Icono ${featureIconLabels[feature.icon as keyof typeof featureIconLabels] ?? feature.icon}`}>
          <LineIcon label="" name={lineIconName(feature.icon)} />
        </span>
        <div>
          {canEdit ? <TextInput onChange={(event) => update({ name: event.target.value })} value={feature.name} /> : <h4>{feature.name}</h4>}
          <small>{collectionLabel} - {feature.sourceType} - {feature.functionalType} - {feature.type}</small>
        </div>
        <div className="inline-actions">
          {canEdit ? (
            <>
              <button className="ghost-button" onClick={() => update({ active: !feature.active })} type="button">
                {feature.active ? 'Activo' : 'Activar'}
              </button>
              <button className="icon-button" onClick={onDuplicate} title="Duplicar feature" type="button">
                <Copy size={15} aria-hidden="true" />
              </button>
              <button className="icon-button danger" onClick={onDelete} title="Borrar feature" type="button">
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <>
          <div className="feature-edit-grid">
            <Field label="Icono">
              <SelectInput onChange={(event) => update({ icon: event.target.value })} value={feature.icon}>
                {Object.entries(featureIconLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Fuente">
              <SelectInput
                onChange={(event) => update({ origin: event.target.value as FeatureSourceType, sourceType: event.target.value as FeatureSourceType })}
                value={feature.sourceType}
              >
                {featureSourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Clase / source">
              <TextInput onChange={(event) => update({ sourceClass: event.target.value })} value={feature.sourceClass ?? ''} />
            </Field>
            <Field label="Tipo funcional">
              <SelectInput onChange={(event) => update({ functionalType: event.target.value as FeatureFunctionalType })} value={feature.functionalType}>
                {featureFunctionalOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Coste">
              <SelectInput onChange={(event) => update({ type: event.target.value as CharacterFeature['type'] })} value={feature.type}>
                <option value="action">Action</option>
                <option value="bonusAction">Bonus Action</option>
                <option value="reaction">Reaction</option>
                <option value="movement">Movement</option>
                <option value="passive">Passive</option>
              </SelectInput>
            </Field>
            <Field label="Recovery">
              <SelectInput onChange={(event) => update({ recovery: event.target.value as CharacterFeature['recovery'] })} value={feature.recovery}>
                <option value="turn">Turn</option>
                <option value="shortRest">Short rest</option>
                <option value="longRest">Long rest</option>
                <option value="custom">Custom</option>
              </SelectInput>
            </Field>
            <Field label="Usos max">
              <NumberInput min={0} onChange={(event) => update({ maxUses: Number(event.target.value) })} value={feature.maxUses ?? 0} />
            </Field>
            <Field label="Usos actuales">
              <NumberInput min={0} onChange={(event) => update({ currentUses: Number(event.target.value) })} value={feature.currentUses ?? 0} />
            </Field>
          </div>

          <div className="feature-toggle-row">
            <label className="check-row">
              <input checked={feature.consumesTurnResource} onChange={(event) => update({ consumesTurnResource: event.target.checked })} type="checkbox" />
              <span>Consume recurso del turno</span>
            </label>
            <label className="check-row">
              <input
                checked={highlighted}
                disabled={!viewerIsDm}
                onChange={(event) => onPatch(HighlightFeatureForPlayerUseCase(feature, event.target.checked))}
                type="checkbox"
              />
              <span>Recuerda esto</span>
            </label>
          </div>

          <Field label="Resumen">
            <TextArea onChange={(event) => update({ summary: event.target.value })} value={feature.summary} />
          </Field>
          <Field label="Explicacion principiante">
            <TextArea onChange={(event) => update({ beginnerHint: event.target.value })} value={feature.beginnerHint} />
          </Field>
          <Field label="Efecto mecanico">
            <TextArea onChange={(event) => update({ mechanicalEffect: event.target.value })} value={feature.mechanicalEffect} />
          </Field>
          <Field label="Tags">
            <TextInput onChange={(event) => update({ tags: splitLines(event.target.value.replaceAll(',', '\n')) })} value={feature.tags.join(', ')} />
          </Field>
        </>
      ) : (
        <div className="feature-readonly-body">
          <p>{feature.beginnerHint || feature.summary}</p>
          {feature.mechanicalEffect ? <small>{feature.mechanicalEffect}</small> : null}
          <div className="readonly-chip-list">
            <span className="readonly-chip"><LineIcon className="chip-line-icon" label={`Icono de ${feature.type}`} name={lineIconName(feature.icon)} />{feature.type}</span>
            {feature.currentUses !== undefined ? <span className="readonly-chip"><LineIcon className="chip-line-icon" label="Usos" name="star" />{feature.currentUses}/{feature.maxUses ?? '-'}</span> : null}
            {feature.tags.map((tag) => <span className="readonly-chip" key={tag}><LineIcon className="chip-line-icon" label="Tag" name="tag" />{tag}</span>)}
          </div>
        </div>
      )}
    </article>
  )
}

function CompactPlayerDetails({ character }: { character: Character }) {
  const groups: Array<{ label: string; icon: LineIconName; items: string[]; presets?: VisualPresetOption[] }> = [
    { label: 'Languages', icon: 'language' as const, items: character.languages, presets: languagePresetOptions },
    { label: 'Senses', icon: 'eye' as const, items: character.senses },
    { label: 'Conditions', icon: 'condition' as const, items: character.conditions, presets: conditionPresetOptions },
    { label: 'Resistances', icon: 'resistance' as const, items: character.resistances, presets: damageTypePresetOptions },
    { label: 'Immunities', icon: 'immunity' as const, items: character.immunities, presets: damageTypePresetOptions },
    { label: 'Vulnerabilities', icon: 'vulnerability' as const, items: character.vulnerabilities, presets: damageTypePresetOptions },
  ]

  return (
    <section className="section-panel player-detail-overview" aria-label="Detalles del personaje">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Detalles</p>
          <h3>Rasgos visibles</h3>
        </div>
        <span className="readonly-chip"><LineIcon className="chip-line-icon" label="Solo lectura" name="eye" />Solo lectura</span>
      </div>
      <div className="player-detail-chip-grid">
        {groups.map((group) => (
          <article className="player-detail-chip-panel" key={group.label}>
            <div className="detail-list-heading">
              <LineIcon label={`Icono de ${group.label}`} name={group.icon} />
              <h3>{group.label}</h3>
            </div>
            <ReadOnlyChipList items={group.items} presets={group.presets} />
          </article>
        ))}
      </div>
      <div className="player-proficiency-strip">
        {character.tools.map((tool) => (
          <span className="readonly-chip" key={tool.id}>
            <LineIcon className="chip-line-icon" label="Tool" name="tool" />
            {tool.name} {formatSigned(tool.bonus)}
          </span>
        ))}
        {character.weapons.map((weapon) => (
          <span className="readonly-chip" key={weapon.id}>
            <LineIcon className="chip-line-icon" label="Weapon" name="weapon" />
            {weapon.name}
          </span>
        ))}
        {character.armor.map((armor) => (
          <span className="readonly-chip" key={armor.id}>
            <LineIcon className="chip-line-icon" label="Armor" name="armor" />
            {armor.name}
          </span>
        ))}
      </div>
    </section>
  )
}

export function CharacterSheetPage({
  canEdit,
  character,
  inventoryContainers,
  inventoryItems,
  onDeleteInventoryContainer,
  onDeleteInventoryItem,
  onSave,
  onSaveInventoryContainer,
  onSaveInventoryItem,
  saveStatus,
  viewerIsDm,
}: CharacterSheetPageProps) {
  const [draft, setDraft] = useState<Character>(character)
  const [activeSheetTab, setActiveSheetTab] = useState<SheetTab>('overview')
  const [restFeedback, setRestFeedback] = useState('Sin descanso aplicado todavia.')
  const canConfigure = viewerIsDm && canEdit
  const [selectedToolPreset, setSelectedToolPreset] = useState(toolPresetOptions[0].label)
  const [selectedWeaponPreset, setSelectedWeaponPreset] = useState(weaponProficiencyPresetOptions[0].label)
  const [selectedArmorPreset, setSelectedArmorPreset] = useState(armorProficiencyPresetOptions[0].label)

  const sheetTabs = useMemo(
    () =>
      [
        { id: 'overview' as const, label: 'Resumen', icon: UserRound },
        { id: 'actions' as const, label: 'Acciones', icon: Swords },
        ...(draft.spellcasting.isSpellcaster ? [{ id: 'spellbook' as const, label: 'Libro de magia', icon: BookOpen }] : []),
        { id: 'details' as const, label: 'Detalles', icon: Eye },
        { id: 'inventory' as const, label: 'Inventario', icon: Archive },
        { id: 'features' as const, label: 'Features & Traits', icon: Sparkles },
        { id: 'lore' as const, label: 'Historia', icon: BookOpen },
      ],
    [draft.spellcasting.isSpellcaster],
  )

  const characterSummary = useMemo(
    () => `${draft.className || 'Clase editable'} ${draft.level} - ${draft.species || 'Especie editable'}`,
    [draft.className, draft.level, draft.species],
  )

  function replaceDraft(nextCharacter: Character) {
    const updatedCharacter = { ...nextCharacter, updatedAt: new Date().toISOString() }
    setDraft(updatedCharacter)
    if (!canConfigure && canEdit) {
      void onSave(updatedCharacter)
    }
  }

  function patch(nextPatch: Partial<Character>) {
    setDraft((current) => ({ ...current, ...nextPatch, updatedAt: new Date().toISOString() }))
  }

  function patchRecalculated(nextPatch: Partial<Character>) {
    setDraft((current) => recalculateCharacterBonuses({ ...current, ...nextPatch, updatedAt: new Date().toISOString() }))
  }

  function patchLore(key: keyof CharacterLore, value: string) {
    setDraft((current) => ({
      ...current,
      lore: { ...current.lore, [key]: value },
      updatedAt: new Date().toISOString(),
    }))
  }

  function patchAbility(key: AbilityKey, value: number) {
    setDraft((current) =>
      recalculateCharacterBonuses({
        ...current,
        abilities: { ...current.abilities, [key]: value },
        updatedAt: new Date().toISOString(),
      }),
    )
  }

  function patchSavingThrow(nextSave: SavingThrow) {
    setDraft((current) =>
      recalculateCharacterBonuses({
        ...current,
        savingThrows: current.savingThrows.map((save) => (save.ability === nextSave.ability ? nextSave : save)),
        updatedAt: new Date().toISOString(),
      }),
    )
  }

  function patchSkill(nextSkill: CharacterSkill) {
    setDraft((current) =>
      recalculateCharacterBonuses({
        ...current,
        skills: current.skills.map((skill) => (skill.name === nextSkill.name ? nextSkill : skill)),
        updatedAt: new Date().toISOString(),
      }),
    )
  }

  function patchPassiveScore(key: keyof Character['passiveOverrides'], value: number) {
    patchRecalculated({
      passiveOverrides: {
        ...draft.passiveOverrides,
        [key]: value,
      },
    })
  }

  function applyRest(restType: CharacterRestType) {
    const result = restType === 'short' ? ApplyShortRestUseCase(draft) : ApplyLongRestUseCase(draft)
    const updatedCharacter = { ...result.character, updatedAt: new Date().toISOString() }

    setDraft(updatedCharacter)
    setRestFeedback(`${restType === 'short' ? 'Short Rest' : 'Long Rest'}: ${result.summary.join(', ')}.`)
    if (canEdit) {
      void onSave(updatedCharacter)
    }
  }

  function patchTool(tool: CharacterTool) {
    patch({ tools: draft.tools.map((item) => (item.id === tool.id ? tool : item)) })
  }

  function patchWeapon(weapon: CharacterWeapon) {
    patch({ weapons: draft.weapons.map((item) => (item.id === weapon.id ? weapon : item)) })
  }

  function patchArmor(armor: CharacterArmor) {
    patch({ armor: draft.armor.map((item) => (item.id === armor.id ? armor : item)) })
  }

  function patchFeature(feature: CharacterFeature, collection: 'features' | 'traits') {
    patch({ [collection]: draft[collection].map((item) => (item.id === feature.id ? feature : item)) })
  }

  function deleteFeature(featureId: string, collection: 'features' | 'traits') {
    patch({ [collection]: DeleteCharacterFeatureUseCase(draft[collection], featureId) })
  }

  function duplicateFeature(feature: CharacterFeature, collection: 'features' | 'traits') {
    patch({ [collection]: [DuplicateCharacterFeatureUseCase(feature), ...draft[collection]] })
  }

  function toggleSpellcasting(isSpellcaster: boolean) {
    const nextCharacter = SetCharacterSpellcastingEnabledUseCase(draft, isSpellcaster)
    replaceDraft(nextCharacter)
    if (!isSpellcaster && activeSheetTab === 'spellbook') {
      setActiveSheetTab('overview')
    }
  }

  function addToolPreset() {
    patch({ tools: [{ ...createDefaultTool(), name: selectedToolPreset }, ...draft.tools] })
  }

  function addWeaponPreset() {
    patch({ weapons: [{ ...createDefaultWeapon(), name: selectedWeaponPreset, type: 'Proficiency' }, ...draft.weapons] })
  }

  function addArmorPreset() {
    patch({ armor: [{ ...createDefaultArmor(), name: selectedArmorPreset, type: 'Proficiency' }, ...draft.armor] })
  }

  async function uploadPortrait(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const url = await fileToDataUrl(file)
    patch({ portrait: { url, alt: `Retrato de ${draft.name}` } })
  }

  return (
    <section className="page-grid character-page" aria-labelledby="character-title">
      <header className="page-header">
        <div className="portrait-shell">
          {draft.portrait.url ? (
            <img alt={draft.portrait.alt || draft.name} src={draft.portrait.url} />
          ) : (
            <WandSparkles size={42} aria-hidden="true" />
          )}
          {canConfigure ? (
            <label className="icon-upload" title="Cargar retrato">
              <ImagePlus size={18} aria-hidden="true" />
              <input accept="image/*" onChange={uploadPortrait} type="file" />
            </label>
          ) : null}
        </div>
        <div>
          <p className="eyebrow">{viewerIsDm ? 'Vista DM' : 'Mi personaje'}</p>
          <h2 id="character-title">{draft.name}</h2>
          <p>{characterSummary}</p>
        </div>
        <div className="page-actions">
          <span className="save-chip idle">{statusLabel(saveStatus)}</span>
          {canConfigure ? (
            <button className="primary-button" onClick={() => onSave(draft)} type="button">
              <Save size={17} aria-hidden="true" />
              Guardar ficha
            </button>
          ) : null}
        </div>
      </header>

      <div className="sheet-tab-list" role="tablist" aria-label="Secciones de ficha">
        {sheetTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              aria-selected={activeSheetTab === tab.id}
              className={activeSheetTab === tab.id ? 'is-active' : ''}
              key={tab.id}
              onClick={() => setActiveSheetTab(tab.id)}
              role="tab"
              type="button"
            >
              <Icon size={17} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="scroll-panel">
        {activeSheetTab === 'overview' ? (
          <>
            {canConfigure ? (
              <>
                <details className="section-panel" open>
                  <summary>Identidad</summary>
                  <div className="form-grid">
                    <Field label="Nombre del personaje">
                      <TextInput onChange={(event) => patch({ name: event.target.value })} value={draft.name} />
                    </Field>
                    <Field label="Clase">
                      <TextInput onChange={(event) => patch({ className: event.target.value })} value={draft.className} />
                    </Field>
                    <Field label="Subclase">
                      <TextInput onChange={(event) => patch({ subclassName: event.target.value })} value={draft.subclassName} />
                    </Field>
                    <Field label="Nivel">
                      <NumberInput min={1} onChange={(event) => patchRecalculated({ level: Number(event.target.value) })} value={draft.level} />
                    </Field>
                    <Field label="Especie/raza">
                      <TextInput onChange={(event) => patch({ species: event.target.value })} value={draft.species} />
                    </Field>
                    <Field label="Trasfondo">
                      <TextInput onChange={(event) => patch({ backgroundName: event.target.value })} value={draft.backgroundName} />
                    </Field>
                    <label className="check-row sheet-visibility-toggle">
                      <input checked={draft.isVisibleToPlayer} onChange={(event) => patch({ isVisibleToPlayer: event.target.checked })} type="checkbox" />
                      <span>Visible para su jugador</span>
                    </label>
                  </div>
                </details>

                <details className="section-panel spellcasting-config-panel" open>
                  <summary>Spellcasting</summary>
                  <div className="spellcasting-config-card">
                    <label className="check-row spellcasting-toggle">
                      <input
                        checked={draft.spellcasting.isSpellcaster}
                        onChange={(event) => toggleSpellcasting(event.target.checked)}
                        type="checkbox"
                      />
                      <span>Spellcasting enabled</span>
                    </label>
                    {draft.spellcasting.isSpellcaster ? (
                      <div className="form-grid">
                        <Field label="Spellcasting ability">
                          <SelectInput
                            onChange={(event) => patch({ spellcasting: { ...draft.spellcasting, ability: event.target.value as AbilityKey } })}
                            value={draft.spellcasting.ability ?? 'cha'}
                          >
                            {abilityOptions.map((ability) => <option key={ability.key} value={ability.key}>{ability.label}</option>)}
                          </SelectInput>
                        </Field>
                        <Field label="Spell save DC">
                          <NumberInput min={0} onChange={(event) => patch({ spellcasting: { ...draft.spellcasting, saveDc: Number(event.target.value) } })} value={draft.spellcasting.saveDc} />
                        </Field>
                        <Field label="Spell attack bonus">
                          <NumberInput onChange={(event) => patch({ spellcasting: { ...draft.spellcasting, attackBonus: Number(event.target.value) } })} value={draft.spellcasting.attackBonus} />
                        </Field>
                        <Field label="Known spells">
                          <NumberInput min={0} onChange={(event) => patch({ spellcasting: { ...draft.spellcasting, knownSpells: Number(event.target.value) } })} value={draft.spellcasting.knownSpells} />
                        </Field>
                        <Field label="Prepared spells">
                          <NumberInput min={0} onChange={(event) => patch({ spellcasting: { ...draft.spellcasting, preparedSpells: Number(event.target.value) } })} value={draft.spellcasting.preparedSpells} />
                        </Field>
                      </div>
                    ) : (
                      <p className="muted-line">Sin spellcasting: se ocultan Libro, slots, Cast Spell y campos mágicos vacíos.</p>
                    )}
                  </div>
                </details>
              </>
            ) : null}

            <section className="rest-command-panel" aria-label="Descansos del personaje">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Resumen</p>
                  <h3>Descansos</h3>
                </div>
                <span className="rest-feedback-chip" aria-live="polite">{restFeedback}</span>
              </div>
              <div className="rest-command-grid">
                <button className="rest-command-card short-rest" disabled={!canEdit} onClick={() => applyRest('short')} type="button">
                  <LineIcon label="Icono de short rest" name="heart" />
                  <strong>Short Rest</strong>
                  <span>HP parcial, recursos cortos y slots parciales</span>
                </button>
                <button className="rest-command-card long-rest" disabled={!canEdit} onClick={() => applyRest('long')} type="button">
                  <LineIcon label="Icono de long rest" name="book" />
                  <strong>Long Rest</strong>
                  <span>HP, spells, hit dice y features completas</span>
                </button>
              </div>
            </section>

            <details className="section-panel" open>
              <summary>Combate y atributos</summary>
              <h3 className="stat-row-title">Ability Scores</h3>
              <div className="ability-card-grid">
                {abilityOptions.map((ability) => (
                  <AbilityScoreCard
                    ability={ability.key}
                    canEdit={canConfigure}
                    key={ability.key}
                    label={ability.label}
                    modifier={abilityModifier(draft.abilities[ability.key])}
                    onChange={(value) => patchAbility(ability.key, value)}
                    saveStatus={saveStatus}
                    value={draft.abilities[ability.key]}
                  />
                ))}
              </div>

              <h3 className="stat-row-title">Combat Core</h3>
              <div className="combat-core-grid">
                <ArmorClassShield canEdit={canConfigure} onChange={(value) => patch({ armorClass: value })} value={draft.armorClass} />
                <HitPointOrb
                  canEdit={canConfigure}
                  current={draft.currentHp}
                  max={draft.maxHp}
                  onCurrentChange={(value) => patch({ currentHp: value })}
                  onMaxChange={(value) => patch({ maxHp: value })}
                  onTempChange={(value) => patch({ temporaryHp: value })}
                  temporary={draft.temporaryHp}
                />
                <CharacterStatBadge icon="initiative" label="Iniciativa" value={formatSigned(draft.initiativeBonus)} />
                <CharacterStatBadge canEdit={canConfigure} icon="speed" label="Velocidad" onChange={(value) => patch({ speed: value })} suffix="ft" value={draft.speed} />
                <CharacterStatBadge icon="proficiency" label="Competencia" value={formatSigned(draft.proficiencyBonus)} />
              </div>

              <h3 className="stat-row-title">Passive Scores</h3>
              <div className="passive-score-grid">
                <CharacterStatBadge canEdit={canConfigure} icon="perception" label="Percepcion pasiva" onChange={(value) => patchPassiveScore('perception', value)} value={draft.passivePerception} />
                <CharacterStatBadge canEdit={canConfigure} icon="perception" label="Investigation pasiva" onChange={(value) => patchPassiveScore('investigation', value)} value={draft.passiveInvestigation} />
                <CharacterStatBadge canEdit={canConfigure} icon="perception" label="Insight pasiva" onChange={(value) => patchPassiveScore('insight', value)} value={draft.passiveInsight} />
              </div>

              <h3 className="stat-row-title">Survival / Rest / Death</h3>
              <div className="survival-stat-grid">
                <article className="character-stat-badge survival-stat-card">
                  <StatIcon label="Icono de hit dice" type="skill" />
                  <div>
                    <span>Hit Dice</span>
                    {canConfigure ? (
                      <TextInput
                        onChange={(event) => patch({ hitDice: { ...draft.hitDice, die: event.target.value } })}
                        value={draft.hitDice.die}
                      />
                    ) : (
                      <strong className="readonly-stat-value">{draft.hitDice.die}</strong>
                    )}
                  </div>
                </article>
                <article className="character-stat-badge survival-stat-card">
                  <StatIcon label="Icono de hit dice restantes" type="proficiency" />
                  <div>
                    <span>Hit Dice Remaining</span>
                    {canConfigure ? (
                      <NumberInput
                        min={0}
                        onChange={(event) => patch({ hitDice: { ...draft.hitDice, remaining: Number(event.target.value) } })}
                        value={draft.hitDice.remaining}
                      />
                    ) : (
                      <strong className="readonly-stat-value">{draft.hitDice.remaining}</strong>
                    )}
                  </div>
                </article>
                <article className="character-stat-badge survival-stat-card">
                  <StatIcon label="Icono de exhaustion" type="tempHp" />
                  <div>
                    <span>Exhaustion</span>
                    {canConfigure ? (
                      <NumberInput
                        max={6}
                        min={0}
                        onChange={(event) => patch({ exhaustion: Number(event.target.value) })}
                        value={draft.exhaustion}
                      />
                    ) : (
                      <strong className="readonly-stat-value">{draft.exhaustion}</strong>
                    )}
                  </div>
                </article>
                <DeathSaveTracker
                  canEdit={canConfigure}
                  failures={draft.deathSaves.failures}
                  onChange={(successes, failures) => patch({ deathSaves: { successes, failures } })}
                  successes={draft.deathSaves.successes}
                />
              </div>
            </details>

            <details className="section-panel">
              <summary>Saving throws y skills</summary>
              <div className="dual-list">
                <div className="mini-list">
                  <h3>Saving throws</h3>
                  {draft.savingThrows.map((save) => (
                    <SkillBadge
                      ability={save.ability}
                      bonus={formatSigned(save.bonus)}
                      canEdit={canConfigure}
                      key={save.ability}
                      label={abilityLabels[save.ability]}
                      onProficientChange={(value) => patchSavingThrow({ ...save, proficient: value })}
                      proficient={save.proficient}
                      subtitle="Saving throw"
                    />
                  ))}
                </div>
                <div className="mini-list scroll-list">
                  <h3>Skills</h3>
                  {draft.skills.map((skill) => (
                    <SkillBadge
                      ability={skill.ability}
                      bonus={formatSigned(skill.bonus)}
                      canEdit={canConfigure}
                      expertise={skill.expertise}
                      key={skill.name}
                      label={skillLabels[skill.name]}
                      onExpertiseChange={(value) => patchSkill({ ...skill, expertise: value })}
                      onProficientChange={(value) => patchSkill({ ...skill, proficient: value })}
                      proficient={skill.proficient}
                      subtitle={abilityLabels[skill.ability]}
                    />
                  ))}
                </div>
              </div>
            </details>
          </>
        ) : null}

        {activeSheetTab === 'actions' ? <CharacterActionsPanel canEdit={canConfigure} character={draft} onChange={replaceDraft} /> : null}

        {activeSheetTab === 'spellbook' && draft.spellcasting.isSpellcaster ? <SpellbookPanel canEdit={canConfigure} character={draft} onChange={replaceDraft} saveStatus={saveStatus} /> : null}

        {activeSheetTab === 'details' ? (
          canConfigure ? (
          <>
            <details className="section-panel" open>
              <summary>Languages, proficiencies y senses</summary>
              <div className="detail-list-row">
                <DetailListCard canEdit={canConfigure} icon="skill" items={draft.languages} label="Languages" onChange={(items) => patch({ languages: items })} presets={languagePresetOptions} />
                <DetailListCard canEdit={canConfigure} icon="perception" items={draft.senses} label="Senses" onChange={(items) => patch({ senses: items })} />
              </div>
              <div className="visual-detail-grid">
                <VisualTextListCard
                  canEdit={canConfigure}
                  icon={conditionVisuals.conditions.icon}
                  items={draft.conditions}
                  label={conditionVisuals.conditions.label}
                  onChange={(items) => patch({ conditions: items })}
                  presets={conditionPresetOptions}
                  tone={conditionVisuals.conditions.tone}
                />
                <VisualTextListCard
                  canEdit={canConfigure}
                  icon={conditionVisuals.resistances.icon}
                  items={draft.resistances}
                  label={conditionVisuals.resistances.label}
                  onChange={(items) => patch({ resistances: items })}
                  presets={damageTypePresetOptions}
                  tone={conditionVisuals.resistances.tone}
                />
                <VisualTextListCard
                  canEdit={canConfigure}
                  icon={conditionVisuals.immunities.icon}
                  items={draft.immunities}
                  label={conditionVisuals.immunities.label}
                  onChange={(items) => patch({ immunities: items })}
                  presets={damageTypePresetOptions}
                  tone={conditionVisuals.immunities.tone}
                />
                <VisualTextListCard
                  canEdit={canConfigure}
                  icon={conditionVisuals.vulnerabilities.icon}
                  items={draft.vulnerabilities}
                  label={conditionVisuals.vulnerabilities.label}
                  onChange={(items) => patch({ vulnerabilities: items })}
                  presets={damageTypePresetOptions}
                  tone={conditionVisuals.vulnerabilities.tone}
                />
              </div>
            </details>

            <details className="section-panel" open>
              <summary>Tools, Weapons y Armor proficiencies</summary>
              <div className="gear-section-grid">
                <section className="gear-panel">
                  <div className="panel-heading">
                    <h3>Tools Proficiencies</h3>
                    {canConfigure ? (
                      <div className="preset-picker compact-preset-picker">
                        <SelectInput aria-label="Tool proficiency preset" onChange={(event) => setSelectedToolPreset(event.target.value)} value={selectedToolPreset}>
                          {toolPresetOptions.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}
                        </SelectInput>
                        <button className="ghost-button" onClick={addToolPreset} type="button">Tool</button>
                      </div>
                    ) : null}
                  </div>
                  {draft.tools.map((tool) => (
                    <article className="gear-card" key={tool.id}>
                      {canConfigure ? (
                        <>
                          <TextInput onChange={(event) => patchTool({ ...tool, name: event.target.value })} value={tool.name} />
                          <label className="check-row">
                            <input checked={tool.proficient} onChange={(event) => patchTool({ ...tool, proficient: event.target.checked })} type="checkbox" />
                            <span>Proficient</span>
                            <strong>{formatSigned(tool.bonus)}</strong>
                          </label>
                          <TextArea onChange={(event) => patchTool({ ...tool, notes: event.target.value })} value={tool.notes} />
                        </>
                      ) : (
                        <div className="readonly-proficiency-card">
                          <LineIcon label="Tool" name="tool" />
                          <strong>{tool.name}</strong>
                          <small>{tool.proficient ? 'Proficient' : 'Not proficient'} - {formatSigned(tool.bonus)}</small>
                          {tool.notes ? <p>{tool.notes}</p> : null}
                        </div>
                      )}
                    </article>
                  ))}
                </section>

                <section className="gear-panel">
                  <div className="panel-heading">
                    <h3>Weapons Proficiencies</h3>
                    {canConfigure ? (
                      <div className="preset-picker compact-preset-picker">
                        <SelectInput aria-label="Weapon proficiency preset" onChange={(event) => setSelectedWeaponPreset(event.target.value)} value={selectedWeaponPreset}>
                          {weaponProficiencyPresetOptions.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}
                        </SelectInput>
                        <button className="ghost-button" onClick={addWeaponPreset} type="button">Weapon</button>
                      </div>
                    ) : null}
                  </div>
                  {draft.weapons.map((weapon) => (
                    <article className="gear-card" key={weapon.id}>
                      {canConfigure ? (
                        <>
                          <TextInput onChange={(event) => patchWeapon({ ...weapon, name: event.target.value })} value={weapon.name} />
                          <div className="form-grid compact">
                            <TextInput onChange={(event) => patchWeapon({ ...weapon, type: event.target.value })} value={weapon.type} />
                            <TextInput
                              onChange={(event) => patchWeapon({ ...weapon, properties: splitLines(event.target.value) })}
                              value={joinLines(weapon.properties)}
                            />
                          </div>
                          <label className="check-row">
                            <input checked={weapon.equipped} onChange={(event) => patchWeapon({ ...weapon, equipped: event.target.checked })} type="checkbox" />
                            <span>Proficiency registrada</span>
                          </label>
                        </>
                      ) : (
                        <div className="readonly-proficiency-card">
                          <LineIcon label="Weapon" name="weapon" />
                          <strong>{weapon.name}</strong>
                          <small>{weapon.type || 'Weapon proficiency'}</small>
                          {weapon.properties.length ? <p>{weapon.properties.join(', ')}</p> : null}
                        </div>
                      )}
                    </article>
                  ))}
                </section>

                <section className="gear-panel">
                  <div className="panel-heading">
                    <h3>Armor Proficiencies</h3>
                    {canConfigure ? (
                      <div className="preset-picker compact-preset-picker">
                        <SelectInput aria-label="Armor proficiency preset" onChange={(event) => setSelectedArmorPreset(event.target.value)} value={selectedArmorPreset}>
                          {armorProficiencyPresetOptions.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}
                        </SelectInput>
                        <button className="ghost-button" onClick={addArmorPreset} type="button">Armor</button>
                      </div>
                    ) : null}
                  </div>
                  {draft.armor.map((armor) => (
                    <article className="gear-card" key={armor.id}>
                      {canConfigure ? (
                        <>
                          <TextInput onChange={(event) => patchArmor({ ...armor, name: event.target.value })} value={armor.name} />
                          <div className="form-grid compact">
                            <TextInput onChange={(event) => patchArmor({ ...armor, type: event.target.value })} value={armor.type} />
                            <TextInput onChange={(event) => patchArmor({ ...armor, notes: event.target.value })} value={armor.notes} />
                          </div>
                          <label className="check-row">
                            <input checked={armor.equipped} onChange={(event) => patchArmor({ ...armor, equipped: event.target.checked })} type="checkbox" />
                            <span>Proficiency registrada</span>
                          </label>
                        </>
                      ) : (
                        <div className="readonly-proficiency-card">
                          <LineIcon label="Armor" name="armor" />
                          <strong>{armor.name}</strong>
                          <small>{armor.type || 'Armor proficiency'}</small>
                          {armor.notes ? <p>{armor.notes}</p> : null}
                        </div>
                      )}
                    </article>
                  ))}
                </section>
              </div>
            </details>
          </>
          ) : (
            <CompactPlayerDetails character={draft} />
          )
        ) : null}

        {activeSheetTab === 'inventory' ? (
          <details className="section-panel" open>
            <summary>Inventario</summary>
            <InventoryPanel
              canEdit={canConfigure}
              characterId={draft.id}
              containers={inventoryContainers}
              currency={draft.currency}
              items={inventoryItems}
              onCurrencyChange={(currency) => patch({ currency })}
              onDeleteContainer={onDeleteInventoryContainer}
              onDeleteItem={onDeleteInventoryItem}
              onSaveContainer={onSaveInventoryContainer}
              onSaveItem={onSaveInventoryItem}
            />
          </details>
        ) : null}

        {activeSheetTab === 'features' ? (
          <section className="section-panel feature-list-section" aria-label="Features and traits">
            <div className="panel-heading nested-heading">
              <h3>Features activables</h3>
              {canConfigure ? <button className="ghost-button" onClick={() => patch({ features: [CreateCharacterFeatureUseCase(), ...draft.features] })} type="button">Feature</button> : null}
            </div>
            <div className="feature-vertical-list">
              {draft.features.map((feature) => (
                <FeatureEditorCard
                  canEdit={canConfigure}
                  collectionLabel="Feature"
                  feature={feature}
                  key={feature.id}
                  onDelete={() => deleteFeature(feature.id, 'features')}
                  onDuplicate={() => duplicateFeature(feature, 'features')}
                  onPatch={(nextFeature) => patchFeature(nextFeature, 'features')}
                  viewerIsDm={viewerIsDm}
                />
              ))}
            </div>

            <div className="panel-heading nested-heading">
              <h3>Traits</h3>
              {canConfigure ? <button className="ghost-button" onClick={() => patch({ traits: [CreateCharacterFeatureUseCase({ name: 'Custom trait', origin: 'custom', sourceType: 'custom', type: 'passive', functionalType: 'passive' }), ...draft.traits] })} type="button">Trait</button> : null}
            </div>
            <div className="feature-vertical-list">
              {draft.traits.map((trait) => (
                <FeatureEditorCard
                  canEdit={canConfigure}
                  collectionLabel="Trait"
                  feature={trait}
                  key={trait.id}
                  onDelete={() => deleteFeature(trait.id, 'traits')}
                  onDuplicate={() => duplicateFeature(trait, 'traits')}
                  onPatch={(nextFeature) => patchFeature(nextFeature, 'traits')}
                  viewerIsDm={viewerIsDm}
                />
              ))}
            </div>
          </section>
        ) : null}

        {activeSheetTab === 'lore' ? (
          <details className="section-panel" open>
            <summary>Historia / Lore</summary>
            <LoreWikiPage canEdit={canConfigure} character={draft} onLoreChange={patchLore} />
          </details>
        ) : null}
      </div>
    </section>
  )
}
