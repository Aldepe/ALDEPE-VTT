import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Copy, Plus, RotateCcw, Search, Sparkles, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { AbilityKey, ActionCost, Character, CharacterSpell, SpellEffectCategory } from '@domain/entities/character'
import type { SaveStatus } from '@domain/entities/common'
import { abilityLabels, formatSigned } from '@domain/services/characterStats'
import {
  CreateCharacterSpellUseCase,
  DeleteCharacterSpellUseCase,
  DuplicateCharacterSpellUseCase,
  ListCharacterSpellsUseCase,
  RestoreSpellSlotsUseCase,
  SchoolIconForSpellSchoolUseCase,
  SpendSpellSlotUseCase,
  UpdateCharacterSpellUseCase,
  spellEffectCategoryLabels,
  spellEffectIconLabels,
  spellSchoolIconLabels,
} from '@application/use-cases/characterSpells'
import { Field, NumberInput, SelectInput, TextArea, TextInput } from '@ui/components/FormControls'
import { abilityOptions } from '@shared/constants/dnd'
import { LineIcon } from '@ui/components/LineIcon'
import { spellbookVisualTheme } from './spellbookVisualTheme'

interface SpellbookPanelProps {
  canEdit: boolean
  character: Character
  onChange: (character: Character) => void
  saveStatus: SaveStatus
}

function patchSpell(character: Character, spell: CharacterSpell): Character {
  return {
    ...character,
    spells: character.spells.map((item) => (item.id === spell.id ? spell : item)),
  }
}

const spellbookBackgroundStyle = {
  '--spellbook-background-image': `url("${spellbookVisualTheme.backgroundImageUrl}")`,
} as CSSProperties

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function joinLines(values: string[]): string {
  return values.join('\n')
}

function saveStatusLabel(status: SaveStatus): string {
  if (status === 'saving') return 'Guardando'
  if (status === 'saved') return 'Guardado'
  if (status === 'error') return 'Error'
  return 'Editable'
}

function preparedNow(character: Character): number {
  return character.spells.filter((spell) => spell.known && spell.prepared).length
}

function patchSpellcasting(character: Character, patch: Partial<Character['spellcasting']>): Character {
  return {
    ...character,
    spellcasting: {
      ...character.spellcasting,
      ...patch,
    },
  }
}

function SpellcastingFocusPanel({
  canEdit,
  character,
  onChange,
  saveStatus,
}: {
  canEdit: boolean
  character: Character
  onChange: (character: Character) => void
  saveStatus: SaveStatus
}) {
  const ability = character.spellcasting.ability ?? 'cha'
  const focusItems: Array<{
    icon: string
    key: 'saveDc' | 'attackBonus' | 'knownSpells' | 'preparedSpells'
    label: string
    signed?: boolean
    value: number
  }> = [
    { key: 'saveDc', label: 'Spell Save DC', icon: 'spellDc', value: character.spellcasting.saveDc },
    { key: 'attackBonus', label: 'Spell Attack Bonus', icon: 'spellAttack', value: character.spellcasting.attackBonus, signed: true },
    { key: 'knownSpells', label: 'Known Spells', icon: 'knownSpells', value: character.spellcasting.knownSpells },
    { key: 'preparedSpells', label: 'Can Prepare', icon: 'canPrepare', value: character.spellcasting.preparedSpells },
  ]

  return (
    <section className="spellcasting-focus-panel" aria-label="Spellcasting summary">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Foco arcano</p>
          <h3>Spellcasting</h3>
        </div>
        <span className={clsx('mini-save-state', saveStatus)}>{canEdit ? saveStatusLabel(saveStatus) : 'Solo lectura'}</span>
      </div>
      <div className="spellcasting-focus-grid">
        <article className="spellcasting-focus-card">
          <LineIcon label="Spellcasting ability" name="spellAbility" />
          <span>Spellcasting Ability</span>
          {canEdit ? (
            <SelectInput
              aria-label="Spellcasting Ability"
              onChange={(event) => onChange(patchSpellcasting(character, { ability: event.target.value as AbilityKey }))}
              value={ability}
            >
              {abilityOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
            </SelectInput>
          ) : (
            <strong>{abilityLabels[ability]}</strong>
          )}
        </article>
        {focusItems.map((item) => (
          <article className="spellcasting-focus-card" key={item.key}>
            <LineIcon label={item.label} name={item.icon} />
            <span>{item.label}</span>
            {canEdit ? (
              <NumberInput
                aria-label={item.label}
                min={item.key === 'attackBonus' ? undefined : 0}
                onChange={(event) => onChange(patchSpellcasting(character, { [item.key]: Number(event.target.value) } as Partial<Character['spellcasting']>))}
                value={item.value}
              />
            ) : (
              <strong>{item.signed ? formatSigned(item.value) : item.value}</strong>
            )}
          </article>
        ))}
        <article className="spellcasting-focus-card is-derived">
          <LineIcon label="Prepared Now" name="preparedNow" />
          <span>Prepared Now</span>
          <strong>{preparedNow(character)}</strong>
        </article>
      </div>
    </section>
  )
}

export function SpellbookPanel({ canEdit, character, onChange, saveStatus }: SpellbookPanelProps) {
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | SpellEffectCategory>('all')
  const [preparedOnly, setPreparedOnly] = useState(false)
  const [selectedSpellId, setSelectedSpellId] = useState<string | undefined>()
  const filteredSpells = useMemo(
    () =>
      ListCharacterSpellsUseCase(
        character,
        query,
        levelFilter === 'all' ? undefined : Number(levelFilter),
        preparedOnly,
        categoryFilter === 'all' ? undefined : categoryFilter,
      ),
    [categoryFilter, character, levelFilter, preparedOnly, query],
  )
  const selectedSpell = filteredSpells.find((spell) => spell.id === selectedSpellId) ?? filteredSpells[0]
  const selectedIndex = selectedSpell ? filteredSpells.findIndex((spell) => spell.id === selectedSpell.id) : -1
  const spellLevels = Array.from(new Set(character.spells.map((spell) => spell.spellLevel))).sort((left, right) => left - right)

  function addSpell() {
    const spell = CreateCharacterSpellUseCase()
    onChange({ ...character, spells: [spell, ...character.spells] })
    setSelectedSpellId(spell.id)
  }

  function duplicateSpell(spell: CharacterSpell) {
    const duplicate = DuplicateCharacterSpellUseCase(spell)
    onChange({ ...character, spells: [duplicate, ...character.spells] })
    setSelectedSpellId(duplicate.id)
  }

  function deleteSpell(spell: CharacterSpell) {
    const nextSpells = DeleteCharacterSpellUseCase(character.spells, spell.id)
    onChange({ ...character, spells: nextSpells })
    setSelectedSpellId(nextSpells[0]?.id)
  }

  function turnPage(direction: -1 | 1) {
    if (!filteredSpells.length) {
      return
    }

    const nextIndex = (selectedIndex + direction + filteredSpells.length) % filteredSpells.length
    setSelectedSpellId(filteredSpells[nextIndex]?.id)
  }

  return (
    <div className="spellbook-panel">
      <SpellcastingFocusPanel canEdit={canEdit} character={character} onChange={onChange} saveStatus={saveStatus} />
      <section className="spell-slot-orb-panel" aria-label="Spell slots">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Slots</p>
            <h3>Orbes de magia</h3>
          </div>
          {canEdit ? (
            <button className="ghost-button" onClick={() => onChange({ ...character, spellSlots: RestoreSpellSlotsUseCase(character.spellSlots) })} type="button">
              <RotateCcw size={16} aria-hidden="true" />
              Long rest
            </button>
          ) : null}
        </div>
        <div className="spell-slot-levels">
          {character.spellSlots.map((slot) => (
            <div className="spell-slot-row" key={slot.id}>
              <strong>Level {slot.spellLevel}</strong>
              <div className="spell-orb-list" aria-label={`Level ${slot.spellLevel}: ${slot.currentSlots} de ${slot.maxSlots} slots`}>
                {Array.from({ length: slot.maxSlots }, (_, index) => (
                  canEdit ? (
                    <button
                      aria-label={`Slot ${index + 1} level ${slot.spellLevel}`}
                      className={clsx('spell-slot-orb', index < slot.currentSlots && 'is-lit')}
                      key={`${slot.id}_${index}`}
                      onClick={() => onChange({ ...character, spellSlots: SpendSpellSlotUseCase(character.spellSlots, slot.spellLevel) })}
                      type="button"
                    />
                  ) : (
                    <span
                      aria-label={`Slot ${index + 1} level ${slot.spellLevel}`}
                      className={clsx('spell-slot-orb', index < slot.currentSlots && 'is-lit')}
                      key={`${slot.id}_${index}`}
                      role="img"
                    />
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-description={spellbookVisualTheme.backgroundDescription}
        aria-labelledby="spellbook-title"
        className="spellbook-shell"
        style={spellbookBackgroundStyle}
      >
        <div className="spellbook-toolbar">
          <div>
            <p className="eyebrow">Libro de magia</p>
            <h3 id="spellbook-title">Grimorio</h3>
          </div>
          {canEdit ? (
            <button className="ghost-button" onClick={addSpell} type="button">
              <Plus size={16} aria-hidden="true" />
              Spell
            </button>
          ) : null}
        </div>
        <div className="spellbook-filters">
          <label className="search-box">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Buscar spell</span>
            <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar spell" value={query} />
          </label>
          <SelectInput aria-label="Nivel de spell" onChange={(event) => setLevelFilter(event.target.value)} value={levelFilter}>
            <option value="all">Todos los niveles</option>
            {spellLevels.map((level) => <option key={level} value={level}>Level {level}</option>)}
          </SelectInput>
          <SelectInput
            aria-label="Categoria de spell"
            onChange={(event) => setCategoryFilter(event.target.value as 'all' | SpellEffectCategory)}
            value={categoryFilter}
          >
            <option value="all">Todas las categorias</option>
            {Object.entries(spellEffectCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </SelectInput>
          <label className="check-row spell-prepared-filter">
            <input checked={preparedOnly} onChange={(event) => setPreparedOnly(event.target.checked)} type="checkbox" />
            <span>Preparados</span>
          </label>
        </div>

        <div className="open-book">
          <aside className="spell-index-page">
            <h4>Indice</h4>
            <div className="spell-index-list">
              {filteredSpells.map((spell) => (
                <button
                  className={clsx(selectedSpell?.id === spell.id && 'is-active')}
                  key={spell.id}
                  onClick={() => setSelectedSpellId(spell.id)}
                  type="button"
                >
                  <BookOpen size={15} aria-hidden="true" />
                  <i className={clsx('spell-effect-dot', `effect-${spell.effectCategory}`)} aria-hidden="true">
                    <LineIcon label="" name={spell.effectIcon} />
                  </i>
                  <span>{spell.name}</span>
                  <small>L{spell.spellLevel}</small>
                </button>
              ))}
            </div>
          </aside>

          <article className="spell-detail-page">
            <div className="spell-page-controls">
              <button className="icon-button" onClick={() => turnPage(-1)} title="Pagina anterior" type="button">
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <button className="icon-button" onClick={() => turnPage(1)} title="Pagina siguiente" type="button">
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
            {selectedSpell ? (
              <>
                <div className="spell-detail-heading">
                  <span
                    className={clsx('spell-school-rune', `school-${SchoolIconForSpellSchoolUseCase(selectedSpell.school)}`)}
                    aria-label={`Escuela ${selectedSpell.school}`}
                  >
                    <LineIcon label="" name={selectedSpell.schoolIcon} />
                  </span>
                  <div>
                    <p className="eyebrow">Level {selectedSpell.spellLevel} - {selectedSpell.school}</p>
                    <h4>{selectedSpell.name}</h4>
                  </div>
                  <span className={clsx('spell-effect-icon', `effect-${selectedSpell.effectCategory}`)} aria-label={`Icono ${spellEffectCategoryLabels[selectedSpell.effectCategory]}`}>
                    <LineIcon label="" name={selectedSpell.effectIcon} />
                  </span>
                </div>
                <div className="spell-pill-grid">
                  <span>Categoria <strong>{spellEffectCategoryLabels[selectedSpell.effectCategory]}</strong></span>
                  <span>Estado <strong>{selectedSpell.known ? 'Known' : 'Unknown'} / {selectedSpell.prepared ? 'Prepared' : 'Not prepared'}</strong></span>
                  <span>Consume <strong>{selectedSpell.castingTime}</strong></span>
                  <span>Range <strong>{selectedSpell.range}</strong></span>
                  {selectedSpell.hitBonus !== undefined ? <span>Hit <strong>{selectedSpell.hitBonus >= 0 ? `+${selectedSpell.hitBonus}` : selectedSpell.hitBonus}</strong></span> : null}
                  {selectedSpell.saveDc ? <span>DC <strong>{selectedSpell.saveDc}</strong></span> : null}
                  <span>Duration <strong>{selectedSpell.duration}</strong></span>
                  <span>{selectedSpell.requiresConcentration ? 'Concentration' : 'No concentration'}</span>
                </div>
                <p>{selectedSpell.summary}</p>
                <p className="note-strip">{selectedSpell.damageOrHealing} {selectedSpell.damageType}</p>
                <div className="usage-example-grid">
                  <h5>Ejemplos de uso</h5>
                  {selectedSpell.usageExamples.map((example) => (
                    <span key={example}>
                      <Sparkles size={14} aria-hidden="true" />
                      {example}
                    </span>
                  ))}
                </div>
                <div className="inline-actions">
                  {canEdit ? (
                    <>
                      <button
                        className={clsx('ghost-button', selectedSpell.prepared && 'is-active')}
                        onClick={() => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { prepared: !selectedSpell.prepared })))}
                        type="button"
                      >
                        {selectedSpell.prepared ? 'Preparado' : 'Preparar'}
                      </button>
                      <button
                        className={clsx('ghost-button', selectedSpell.known && 'is-active')}
                        onClick={() => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { known: !selectedSpell.known })))}
                        type="button"
                      >
                        {selectedSpell.known ? 'Known' : 'Marcar known'}
                      </button>
                      <button className="primary-button" onClick={() => onChange({ ...character, spellSlots: SpendSpellSlotUseCase(character.spellSlots, selectedSpell.spellLevel) })} type="button">
                        Lanzar
                      </button>
                      <button className="ghost-button" onClick={() => duplicateSpell(selectedSpell)} type="button">
                        <Copy size={15} aria-hidden="true" />
                        Duplicar
                      </button>
                      <button className="ghost-button danger" onClick={() => deleteSpell(selectedSpell)} type="button">
                        <Trash2 size={15} aria-hidden="true" />
                        Borrar
                      </button>
                    </>
                  ) : null}
                </div>
                {canEdit ? (
                  <div className="spell-edit-grid">
                    <Field label="Nombre">
                      <TextInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { name: event.target.value })))} value={selectedSpell.name} />
                    </Field>
                    <Field label="Nivel">
                      <NumberInput min={0} onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { spellLevel: Number(event.target.value) })))} value={selectedSpell.spellLevel} />
                    </Field>
                    <Field label="Escuela">
                      <SelectInput
                        onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { school: event.target.value })))}
                        value={selectedSpell.school}
                      >
                        <option value="Abjuration">Abjuration</option>
                        <option value="Conjuration">Conjuration</option>
                        <option value="Divination">Divination</option>
                        <option value="Enchantment">Enchantment</option>
                        <option value="Evocation">Evocation</option>
                        <option value="Illusion">Illusion</option>
                        <option value="Necromancy">Necromancy</option>
                        <option value="Transmutation">Transmutation</option>
                      </SelectInput>
                    </Field>
                    <Field label="Runa escuela">
                      <SelectInput
                        onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { schoolIcon: event.target.value })))}
                        value={selectedSpell.schoolIcon}
                      >
                        {Object.entries(spellSchoolIconLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </SelectInput>
                    </Field>
                    <Field label="Consume">
                      <SelectInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { castingTime: event.target.value as ActionCost })))} value={selectedSpell.castingTime}>
                        <option value="action">Action</option>
                        <option value="bonusAction">Bonus Action</option>
                        <option value="reaction">Reaction</option>
                      </SelectInput>
                    </Field>
                    <Field label="Categoria">
                      <SelectInput
                        onChange={(event) =>
                          onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { effectCategory: event.target.value as SpellEffectCategory })))
                        }
                        value={selectedSpell.effectCategory}
                      >
                        {Object.entries(spellEffectCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </SelectInput>
                    </Field>
                    <Field label="Icono">
                      <SelectInput
                        onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { effectIcon: event.target.value })))}
                        value={selectedSpell.effectIcon}
                      >
                        {Object.entries(spellEffectIconLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </SelectInput>
                    </Field>
                    <Field label="Range">
                      <TextInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { range: event.target.value })))} value={selectedSpell.range} />
                    </Field>
                    <Field label="Hit bonus">
                      <NumberInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { hitBonus: Number(event.target.value) })))} value={selectedSpell.hitBonus ?? 0} />
                    </Field>
                    <Field label="Save DC">
                      <NumberInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { saveDc: Number(event.target.value) })))} value={selectedSpell.saveDc ?? 0} />
                    </Field>
                    <Field label="Damage / healing">
                      <TextInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { damageOrHealing: event.target.value })))} value={selectedSpell.damageOrHealing} />
                    </Field>
                    <Field label="Damage type">
                      <TextInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { damageType: event.target.value })))} value={selectedSpell.damageType} />
                    </Field>
                    <Field label="Components">
                      <TextInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { components: event.target.value })))} value={selectedSpell.components} />
                    </Field>
                    <Field label="Duration">
                      <TextInput onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { duration: event.target.value })))} value={selectedSpell.duration} />
                    </Field>
                    <label className="check-row spell-prepared-filter">
                      <input
                        checked={selectedSpell.requiresConcentration}
                        onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { requiresConcentration: event.target.checked })))}
                        type="checkbox"
                      />
                      <span>Concentration</span>
                    </label>
                    <Field label="Resumen">
                      <TextArea onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { summary: event.target.value })))} value={selectedSpell.summary} />
                    </Field>
                    <Field label="Ejemplos">
                      <TextArea onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { usageExamples: splitLines(event.target.value) })))} value={joinLines(selectedSpell.usageExamples)} />
                    </Field>
                    <Field label="Fuente / notas">
                      <TextArea onChange={(event) => onChange(patchSpell(character, UpdateCharacterSpellUseCase(selectedSpell, { sourceNotes: event.target.value })))} value={selectedSpell.sourceNotes} />
                    </Field>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="empty-state">
                <BookOpen size={32} />
                <strong>Sin spells</strong>
                <p>Anade spells para abrir el grimorio.</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  )
}
