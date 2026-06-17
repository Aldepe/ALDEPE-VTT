import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { BookMarked, BookOpen, EyeOff, ImagePlus, Link2, Search, Sparkles, Trash2, Users } from 'lucide-react'
import type { CampaignMember } from '@domain/entities/common'
import type { LoreEntry, LoreType } from '@domain/entities/lore'
import { canViewLore } from '@domain/services/permissions'
import { createBlankLoreEntry } from '@application/use-cases/workspaceFactories'
import { loreCompactFieldNames, loreFieldDisplayOrder, loreLongFieldNames, loreTypeLabels } from '@shared/constants/lore'
import { fileToDataUrl } from '@shared/utils/fileToDataUrl'
import { Field, SelectInput, TextArea, TextInput } from '@ui/components/FormControls'
import { EmptyState } from '@ui/components/EmptyState'

interface LorePageProps {
  campaignId: string
  entries: LoreEntry[]
  isDm: boolean
  members: CampaignMember[]
  onDelete: (entryId: string) => Promise<void>
  onSave: (entry: LoreEntry) => Promise<void>
  viewerMember: CampaignMember
}

const loreTypes = Object.keys(loreTypeLabels) as LoreType[]

function publicFieldLabel(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
}

const compactPublicFields = new Set(loreCompactFieldNames)
const longPublicFields = new Set(loreLongFieldNames)
const publicFieldOrderIndex = new Map(loreFieldDisplayOrder.map((field, index) => [field, index]))

function isCompactPublicField(field: string, value: string): boolean {
  return compactPublicFields.has(field) || (!longPublicFields.has(field) && value.length <= 150)
}

function getOrderedPublicFields(fields: Record<string, string>): [string, string][] {
  return Object.entries(fields).sort(([leftField], [rightField]) => {
    const leftIndex = publicFieldOrderIndex.get(leftField) ?? Number.MAX_SAFE_INTEGER
    const rightIndex = publicFieldOrderIndex.get(rightField) ?? Number.MAX_SAFE_INTEGER

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex
    }

    return publicFieldLabel(leftField).localeCompare(publicFieldLabel(rightField), 'es')
  })
}

function fieldId(field: string): string {
  return `lore-field-${field
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
}

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function getEntrySummary(entry: LoreEntry): string {
  const summarySource =
    entry.publicFields['Descripción'] ??
    entry.publicFields.descripcion ??
    entry.publicFields.Historia ??
    entry.publicFields.historia ??
    Object.values(entry.publicFields).find((value) => value.trim().length > 0) ??
    ''

  return splitParagraphs(summarySource)[0] ?? 'Entrada pendiente de desarrollar.'
}

export function LorePage({ campaignId, entries, isDm, members, onDelete, onSave, viewerMember }: LorePageProps) {
  const [selectedType, setSelectedType] = useState<LoreType | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(entries[0]?.id)
  const selectedEntry = entries.find((entry) => entry.id === selectedId)
  const [draft, setDraft] = useState<LoreEntry>(() => selectedEntry ?? createBlankLoreEntry(campaignId, 'artifact'))
  const playerMembers = useMemo(() => members.filter((member) => member.role === 'player'), [members])

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return entries
      .filter((entry) => canViewLore(viewerMember, entry))
      .filter((entry) => (selectedType === 'all' ? true : entry.type === selectedType))
      .filter((entry) =>
        normalizedQuery
          ? `${entry.name} ${Object.values(entry.publicFields).join(' ')}`.toLowerCase().includes(normalizedQuery)
          : true,
      )
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [entries, query, selectedType, viewerMember])

  const detailEntry = selectedEntry && canViewLore(viewerMember, selectedEntry) ? selectedEntry : visibleEntries[0]
  const linkedEntries = detailEntry?.linkedEntryIds
    .map((linkedId) => entries.find((entry) => entry.id === linkedId))
    .filter((entry): entry is LoreEntry => Boolean(entry && canViewLore(viewerMember, entry)))
  const detailPublicFields = detailEntry ? getOrderedPublicFields(detailEntry.publicFields) : []
  const compactDetailFields = detailPublicFields.filter(([field, value]) => isCompactPublicField(field, value))
  const longDetailFields = detailPublicFields.filter(([field, value]) => !isCompactPublicField(field, value))
  const draftPublicFields = getOrderedPublicFields(draft.publicFields)
  const compactDraftFields = draftPublicFields.filter(([field, value]) => isCompactPublicField(field, value))
  const longDraftFields = draftPublicFields.filter(([field, value]) => !isCompactPublicField(field, value))
  const detailSummary = detailEntry ? getEntrySummary(detailEntry) : ''

  function startNewEntry(type: LoreType) {
    const nextEntry = createBlankLoreEntry(campaignId, type)
    setSelectedId(undefined)
    setDraft(nextEntry)
  }

  function selectEntry(entry: LoreEntry) {
    setSelectedId(entry.id)
    setDraft(entry)
  }

  function patchField(field: string, value: string) {
    setDraft((current) => ({
      ...current,
      publicFields: { ...current.publicFields, [field]: value },
      updatedAt: new Date().toISOString(),
    }))
  }

  function toggleLinkedEntry(entryId: string) {
    setDraft((current) => ({
      ...current,
      linkedEntryIds: current.linkedEntryIds.includes(entryId)
        ? current.linkedEntryIds.filter((linkedId) => linkedId !== entryId)
        : [...current.linkedEntryIds, entryId],
      updatedAt: new Date().toISOString(),
    }))
  }

  function togglePlayerVisibility(userId: string) {
    setDraft((current) => {
      const playerIds = playerMembers.map((member) => member.userId)
      const currentIds = current.visibleToPlayerIds ?? []
      const selectedIds = new Set(currentIds.length ? currentIds : playerIds)

      if (selectedIds.has(userId)) {
        selectedIds.delete(userId)
      } else {
        selectedIds.add(userId)
      }

      const nextIds = selectedIds.size === playerIds.length ? [] : playerIds.filter((playerId) => selectedIds.has(playerId))
      return {
        ...current,
        visibleToPlayerIds: nextIds,
        updatedAt: new Date().toISOString(),
      }
    })
  }

  function playerCanSeeDraft(userId: string): boolean {
    const visibleToPlayerIds = draft.visibleToPlayerIds ?? []
    return draft.isVisibleToPlayers && (visibleToPlayerIds.length === 0 || visibleToPlayerIds.includes(userId))
  }

  function makeVisibleToEveryPlayer() {
    setDraft((current) => ({ ...current, visibleToPlayerIds: [], updatedAt: new Date().toISOString() }))
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const url = await fileToDataUrl(file)
    setDraft((current) => ({ ...current, image: { url, alt: current.name }, updatedAt: new Date().toISOString() }))
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSave(draft)
    setSelectedId(draft.id)
  }

  async function confirmDelete(entryId: string) {
    if (window.confirm('Borrar esta entrada de lore?')) {
      await onDelete(entryId)
      setSelectedId(undefined)
      setDraft(createBlankLoreEntry(campaignId, 'artifact'))
    }
  }

  return (
    <section className="page-grid lore-page" aria-labelledby="lore-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">Wiki de campaña</p>
          <h2 id="lore-title">Lore</h2>
          <p>Entradas públicas, secretos de DM y vínculos internos.</p>
        </div>
        <div className="toolbar-line">
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Buscar lore</span>
            <input onChange={(event) => setQuery(event.target.value)} placeholder="Buscar lore" value={query} />
          </label>
          <label className="field inline-field">
            <span>Tipo</span>
            <SelectInput onChange={(event) => setSelectedType(event.target.value as LoreType | 'all')} value={selectedType}>
              <option value="all">Todos</option>
              {loreTypes.map((type) => (
                <option key={type} value={type}>
                  {loreTypeLabels[type]}
                </option>
              ))}
            </SelectInput>
          </label>
        </div>
      </header>

      <aside className="lore-list scroll-panel" aria-label="Entradas de lore">
        {visibleEntries.length ? (
          visibleEntries.map((entry) => (
            <button
              className={detailEntry?.id === entry.id ? 'lore-list-item is-active' : 'lore-list-item'}
              key={entry.id}
              onClick={() => selectEntry(entry)}
              type="button"
            >
              <span>{loreTypeLabels[entry.type]}</span>
              <strong>{entry.name || 'Entrada sin nombre'}</strong>
              <em>{getEntrySummary(entry)}</em>
              {!entry.isVisibleToPlayers ? <small>Oculta</small> : entry.visibleToPlayerIds?.length ? <small>Visibilidad parcial</small> : null}
            </button>
          ))
        ) : (
          <EmptyState icon={<BookMarked size={32} />} message="No hay entradas visibles para este filtro." title="Sin lore" />
        )}
      </aside>

      <article className="lore-detail scroll-panel">
        {detailEntry ? (
          <>
            <header className="detail-hero lore-article-hero">
              <div className="lore-hero-media">
                {detailEntry.image.url ? (
                  <img alt={detailEntry.image.alt || detailEntry.name} src={detailEntry.image.url} />
                ) : (
                  <div className="lore-hero-placeholder" aria-hidden="true">
                    <BookMarked size={42} />
                  </div>
                )}
              </div>
              <div className="lore-hero-copy">
                <div className="lore-article-kicker">
                  <span className="lore-type-pill">{loreTypeLabels[detailEntry.type]}</span>
                  {!detailEntry.isVisibleToPlayers ? (
                    <span className="lore-secret-pill">
                      <EyeOff size={14} aria-hidden="true" />
                      Oculta
                    </span>
                  ) : detailEntry.visibleToPlayerIds?.length ? (
                    <span className="lore-secret-pill">Visibilidad parcial</span>
                  ) : null}
                </div>
                <h3>{detailEntry.name || 'Entrada sin nombre'}</h3>
                <p className="lore-article-summary">{detailSummary}</p>
                <div className="lore-article-meta" aria-label="Resumen de entrada">
                  <span>
                    <BookOpen size={14} aria-hidden="true" />
                    {longDetailFields.length} secciones
                  </span>
                  <span>
                    <Sparkles size={14} aria-hidden="true" />
                    {compactDetailFields.length} datos rápidos
                  </span>
                  <span>
                    <Link2 size={14} aria-hidden="true" />
                    {linkedEntries?.length ?? 0} vínculos
                  </span>
                </div>
              </div>
            </header>
            <div className="detail-fields lore-article-body">
              {compactDetailFields.length ? (
                <section className="wiki-card">
                  <div className="wiki-section-heading">
                    <span>Ficha rápida</span>
                    <small>{loreTypeLabels[detailEntry.type]}</small>
                  </div>
                  <div className="detail-field-matrix" aria-label="Campos rápidos">
                  {compactDetailFields.map(([field, value]) => (
                    <div className="matrix-field" key={field}>
                      <span>{publicFieldLabel(field)}</span>
                      <strong>{value || 'Sin dato.'}</strong>
                    </div>
                  ))}
                  </div>
                </section>
              ) : null}
              {longDetailFields.length ? (
                <nav className="lore-section-index" aria-label="Índice del artículo">
                  {longDetailFields.map(([field]) => (
                    <a href={`#${fieldId(field)}`} key={field}>
                      {publicFieldLabel(field)}
                    </a>
                  ))}
                  {isDm && detailEntry.secret ? <a href="#lore-field-secret">Secret DM</a> : null}
                  {linkedEntries?.length ? <a href="#lore-field-links">Vínculos</a> : null}
                </nav>
              ) : null}
              {longDetailFields.map(([field, value]) => (
                <section className="wiki-card lore-article-section" id={fieldId(field)} key={field}>
                  <h4>{publicFieldLabel(field)}</h4>
                  {splitParagraphs(value || 'Sin contenido público.').map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
              {isDm && detailEntry.secret ? (
                <section className="secret-box wiki-card lore-article-section" id="lore-field-secret">
                  <h4>Secret DM</h4>
                  {splitParagraphs(detailEntry.secret).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ) : null}
              {linkedEntries?.length ? (
                <section className="wiki-card lore-article-section" id="lore-field-links">
                  <h4>Vínculos</h4>
                  <div className="link-list lore-link-grid">
                    {linkedEntries.map((entry) => (
                      <button className="ghost-button" key={entry.id} onClick={() => selectEntry(entry)} type="button">
                        <Link2 size={15} aria-hidden="true" />
                        <span>
                          <strong>{entry.name}</strong>
                          <small>{loreTypeLabels[entry.type]}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : (
          <EmptyState icon={<BookMarked size={32} />} message="Crea una entrada para verla aquí." title="Detalle vacío" />
        )}
      </article>

      {isDm ? (
        <form className="editor-panel lore-editor" onSubmit={submitEntry}>
          <div className="panel-heading">
            <h3>Editor</h3>
            <button className="icon-button danger" onClick={() => selectedEntry && confirmDelete(selectedEntry.id)} title="Borrar lore" type="button">
              <Trash2 size={16} aria-hidden="true" />
            </button>
            <button className="ghost-button" onClick={() => startNewEntry(selectedType === 'all' ? draft.type : selectedType)} type="button">
              Nueva entrada
            </button>
          </div>
          <p className="lore-editor-type-note">Tipo actual: {loreTypeLabels[draft.type]}. Usa el selector superior para crear otro tipo.</p>
          <Field label="Nombre">
            <TextInput onChange={(event) => setDraft({ ...draft, name: event.target.value })} value={draft.name} />
          </Field>
          <label className="upload-row">
            <ImagePlus size={18} aria-hidden="true" />
            <span>Cargar imagen</span>
            <input accept="image/*" onChange={uploadImage} type="file" />
          </label>
          {compactDraftFields.length ? (
            <div className="lore-editor-matrix">
              {compactDraftFields.map(([field]) => (
                <Field key={field} label={publicFieldLabel(field)}>
                  <TextInput onChange={(event) => patchField(field, event.target.value)} value={draft.publicFields[field]} />
                </Field>
              ))}
            </div>
          ) : null}
          {longDraftFields.map(([field]) => (
            <Field key={field} label={publicFieldLabel(field)}>
              <TextArea onChange={(event) => patchField(field, event.target.value)} value={draft.publicFields[field]} />
            </Field>
          ))}
          <Field label="Secret">
            <TextArea onChange={(event) => setDraft({ ...draft, secret: event.target.value })} value={draft.secret} />
          </Field>
          <label className="check-row">
            <input
              checked={draft.isVisibleToPlayers}
              onChange={(event) => setDraft({ ...draft, isVisibleToPlayers: event.target.checked })}
              type="checkbox"
            />
            Visible para players
          </label>
          {draft.isVisibleToPlayers ? (
            <div className="player-visibility-picker">
              <div className="panel-heading compact-panel-heading">
                <span><Users size={16} aria-hidden="true" /> Players que lo ven</span>
                <button className="ghost-button" onClick={makeVisibleToEveryPlayer} type="button">Todos</button>
              </div>
              {playerMembers.length ? (
                <div className="player-visibility-list">
                  {playerMembers.map((member) => (
                    <label className="check-row" key={member.id}>
                      <input
                        checked={playerCanSeeDraft(member.userId)}
                        onChange={() => togglePlayerVisibility(member.userId)}
                        type="checkbox"
                      />
                      <span>{member.displayName}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="muted-line">No hay players vinculados todavia.</p>
              )}
            </div>
          ) : null}
          <div className="linked-picker">
            <span>Vinculos</span>
            <div>
              {entries
                .filter((entry) => entry.id !== draft.id)
                .map((entry) => (
                  <label className="check-row" key={entry.id}>
                    <input
                      checked={draft.linkedEntryIds.includes(entry.id)}
                      onChange={() => toggleLinkedEntry(entry.id)}
                      type="checkbox"
                    />
                    {entry.name || 'Entrada sin nombre'}
                  </label>
                ))}
            </div>
          </div>
          <button className="primary-button" type="submit">
            Guardar lore
          </button>
        </form>
      ) : null}
    </section>
  )
}
