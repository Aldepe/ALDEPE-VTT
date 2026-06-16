import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { BookMarked, ImagePlus, Link2, Search, Trash2 } from 'lucide-react'
import type { CampaignMember } from '@domain/entities/common'
import type { LoreEntry, LoreType } from '@domain/entities/lore'
import { canViewLore } from '@domain/services/permissions'
import { createBlankLoreEntry } from '@application/use-cases/workspaceFactories'
import { loreFieldTemplates, loreTypeLabels } from '@shared/constants/lore'
import { fileToDataUrl } from '@shared/utils/fileToDataUrl'
import { Field, SelectInput, TextArea, TextInput } from '@ui/components/FormControls'
import { EmptyState } from '@ui/components/EmptyState'

interface LorePageProps {
  campaignId: string
  entries: LoreEntry[]
  isDm: boolean
  onDelete: (entryId: string) => Promise<void>
  onSave: (entry: LoreEntry) => Promise<void>
  viewerMember: CampaignMember
}

const loreTypes = Object.keys(loreTypeLabels) as LoreType[]

function publicFieldLabel(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())
}

export function LorePage({ campaignId, entries, isDm, onDelete, onSave, viewerMember }: LorePageProps) {
  const [selectedType, setSelectedType] = useState<LoreType | 'all'>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(entries[0]?.id)
  const selectedEntry = entries.find((entry) => entry.id === selectedId)
  const [draft, setDraft] = useState<LoreEntry>(() => selectedEntry ?? createBlankLoreEntry(campaignId, 'artifact'))

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

  function changeType(type: LoreType) {
    setDraft((current) => {
      const nextFields = Object.fromEntries(loreFieldTemplates[type].map((field) => [field, current.publicFields[field] ?? '']))
      return {
        ...current,
        type,
        publicFields: nextFields,
        updatedAt: new Date().toISOString(),
      }
    })
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
          <p className="eyebrow">Wiki de campana</p>
          <h2 id="lore-title">Lore</h2>
          <p>Entradas publicas, secretos de DM y vinculos internos.</p>
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
            <button className="lore-list-item" key={entry.id} onClick={() => selectEntry(entry)} type="button">
              <span>{loreTypeLabels[entry.type]}</span>
              <strong>{entry.name || 'Entrada sin nombre'}</strong>
              {!entry.isVisibleToPlayers ? <small>Oculta</small> : null}
            </button>
          ))
        ) : (
          <EmptyState icon={<BookMarked size={32} />} message="No hay entradas visibles para este filtro." title="Sin lore" />
        )}
      </aside>

      <article className="lore-detail scroll-panel">
        {detailEntry ? (
          <>
            <div className="detail-hero">
              {detailEntry.image.url ? (
                <img alt={detailEntry.image.alt || detailEntry.name} src={detailEntry.image.url} />
              ) : (
                <BookMarked size={44} aria-hidden="true" />
              )}
              <div>
                <p className="eyebrow">{loreTypeLabels[detailEntry.type]}</p>
                <h3>{detailEntry.name || 'Entrada sin nombre'}</h3>
              </div>
            </div>
            <div className="detail-fields">
              {Object.entries(detailEntry.publicFields).map(([field, value]) => (
                <section key={field}>
                  <h4>{publicFieldLabel(field)}</h4>
                  <p>{value || 'Sin contenido publico.'}</p>
                </section>
              ))}
              {isDm && detailEntry.secret ? (
                <section className="secret-box">
                  <h4>Secret</h4>
                  <p>{detailEntry.secret}</p>
                </section>
              ) : null}
              {linkedEntries?.length ? (
                <section>
                  <h4>Vinculos</h4>
                  <div className="link-list">
                    {linkedEntries.map((entry) => (
                      <button className="ghost-button" key={entry.id} onClick={() => selectEntry(entry)} type="button">
                        <Link2 size={15} aria-hidden="true" />
                        {entry.name}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        ) : (
          <EmptyState icon={<BookMarked size={32} />} message="Crea una entrada para verla aqui." title="Detalle vacio" />
        )}
      </article>

      {isDm ? (
        <form className="editor-panel lore-editor" onSubmit={submitEntry}>
          <div className="panel-heading">
            <h3>Editor</h3>
            <button className="icon-button danger" onClick={() => selectedEntry && confirmDelete(selectedEntry.id)} title="Borrar lore" type="button">
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="segmented wrap" role="group" aria-label="Crear entrada por tipo">
            {loreTypes.map((type) => (
              <button key={type} onClick={() => startNewEntry(type)} type="button">
                {loreTypeLabels[type]}
              </button>
            ))}
          </div>
          <Field label="Tipo">
            <SelectInput onChange={(event) => changeType(event.target.value as LoreType)} value={draft.type}>
              {loreTypes.map((type) => (
                <option key={type} value={type}>
                  {loreTypeLabels[type]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Nombre">
            <TextInput onChange={(event) => setDraft({ ...draft, name: event.target.value })} value={draft.name} />
          </Field>
          <label className="upload-row">
            <ImagePlus size={18} aria-hidden="true" />
            <span>Cargar imagen</span>
            <input accept="image/*" onChange={uploadImage} type="file" />
          </label>
          {Object.keys(draft.publicFields).map((field) => (
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
