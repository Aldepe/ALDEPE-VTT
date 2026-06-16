import { useMemo, useState } from 'react'
import { BookMarked, Plus, Save, Search, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { CampaignMember } from '@domain/entities/common'
import type { CampaignNote, NoteType } from '@domain/entities/note'
import { canEditNote, isDm } from '@domain/services/permissions'
import { CreateNoteUseCase, ListNotesUseCase, UpdateNoteUseCase } from '@application/use-cases/notes'
import { Field, SelectInput, TextArea, TextInput } from '@ui/components/FormControls'
import { EmptyState } from '@ui/components/EmptyState'

interface NotesPageProps {
  campaignId: string
  notes: CampaignNote[]
  onDelete: (noteId: string) => Promise<void>
  onSave: (note: CampaignNote) => Promise<void>
  viewerMember: CampaignMember
}

const noteTypes: Array<{ label: string; value: NoteType }> = [
  { label: 'Personal', value: 'personal' },
  { label: 'Party', value: 'party' },
  { label: 'DM', value: 'dm' },
]

function noteTypeLabel(type: NoteType): string {
  return noteTypes.find((option) => option.value === type)?.label ?? type
}

function splitTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function joinTags(tags: string[]): string {
  return tags.join(', ')
}

interface NoteEditorProps {
  note: CampaignNote
  onDelete: (noteId: string) => Promise<void>
  onSave: (note: CampaignNote) => Promise<void>
  viewerMember: CampaignMember
}

function NoteEditor({ note, onDelete, onSave, viewerMember }: NoteEditorProps) {
  const [draft, setDraft] = useState<CampaignNote>(note)
  const editable = canEditNote(viewerMember, note)
  const typeOptions = isDm(viewerMember) ? noteTypes : noteTypes.filter((type) => type.value !== 'dm')

  function patch(patchValue: Partial<CampaignNote>) {
    setDraft((current) => UpdateNoteUseCase(current, patchValue))
  }

  async function deleteNote() {
    if (window.confirm(`Borrar la nota "${note.title}"?`)) {
      await onDelete(note.id)
    }
  }

  return (
    <section className="note-editor editor-panel" aria-labelledby="note-editor-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{noteTypeLabel(draft.type)}</p>
          <h3 id="note-editor-title">{draft.title || 'Nota sin titulo'}</h3>
        </div>
        <div className="inline-actions">
          {editable ? (
            <button className="primary-button" onClick={() => void onSave(draft)} type="button">
              <Save size={16} aria-hidden="true" />
              Guardar
            </button>
          ) : null}
          {editable ? (
            <button className="icon-button danger" onClick={() => void deleteNote()} title="Borrar nota" type="button">
              <Trash2 size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <fieldset disabled={!editable}>
        <Field label="Titulo">
          <TextInput onChange={(event) => patch({ title: event.target.value })} value={draft.title} />
        </Field>
        <Field label="Contenido">
          <TextArea onChange={(event) => patch({ content: event.target.value })} value={draft.content} />
        </Field>
        <div className="form-grid compact">
          <Field label="Tipo">
            <SelectInput onChange={(event) => patch({ type: event.target.value as NoteType })} value={draft.type}>
              {typeOptions.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Tags">
            <TextInput onChange={(event) => patch({ tags: splitTags(event.target.value) })} value={joinTags(draft.tags)} />
          </Field>
          <label className="check-row pinned-row">
            <input checked={draft.pinned} onChange={(event) => patch({ pinned: event.target.checked })} type="checkbox" />
            <span>Fijada</span>
          </label>
        </div>
      </fieldset>

      <div className="note-meta">
        <span>Autor: {draft.authorName}</span>
        <span>Actualizada: {draft.updatedAt.slice(0, 16).replace('T', ' ')}</span>
      </div>
    </section>
  )
}

export function NotesPage({ campaignId, notes, onDelete, onSave, viewerMember }: NotesPageProps) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>('all')
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>()
  const visibleNotes = useMemo(
    () => ListNotesUseCase(notes, viewerMember, query, typeFilter === 'all' ? undefined : typeFilter),
    [notes, query, typeFilter, viewerMember],
  )
  const selectedNote = visibleNotes.find((note) => note.id === selectedNoteId) ?? visibleNotes[0]
  const createType: NoteType = isDm(viewerMember) ? 'party' : 'personal'

  async function createNote() {
    const nextNote = CreateNoteUseCase({
      campaignId,
      authorUserId: viewerMember.userId,
      authorName: viewerMember.displayName,
      type: createType,
    })
    await onSave(nextNote)
    setSelectedNoteId(nextNote.id)
  }

  return (
    <section className="page-grid notes-page" aria-labelledby="notes-title">
      <header className="page-header">
        <div>
          <p className="eyebrow">Notas de campaña</p>
          <h2 id="notes-title">Notas</h2>
          <p>Notas personales, compartidas y de DM con búsqueda y tags.</p>
        </div>
        <button className="primary-button" onClick={() => void createNote()} type="button">
          <Plus size={17} aria-hidden="true" />
          Nueva nota
        </button>
      </header>

      <aside className="notes-list scroll-panel">
        <div className="search-box">
          <Search size={17} aria-hidden="true" />
          <input aria-label="Buscar notas" onChange={(event) => setQuery(event.target.value)} placeholder="Buscar" value={query} />
        </div>
        <div className="segmented wrap" role="group" aria-label="Filtro de notas">
          <button className={typeFilter === 'all' ? 'is-active' : ''} onClick={() => setTypeFilter('all')} type="button">
            Todas
          </button>
          {noteTypes
            .filter((type) => isDm(viewerMember) || type.value !== 'dm')
            .map((type) => (
              <button
                className={typeFilter === type.value ? 'is-active' : ''}
                key={type.value}
                onClick={() => setTypeFilter(type.value)}
                type="button"
              >
                {type.label}
              </button>
            ))}
        </div>
        {visibleNotes.length ? (
          visibleNotes.map((note) => (
            <button
              className={clsx('note-list-card', selectedNote?.id === note.id && 'is-active')}
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              type="button"
            >
              <BookMarked size={18} aria-hidden="true" />
              <strong>{note.title || 'Nota sin titulo'}</strong>
              <small>{noteTypeLabel(note.type)} - {note.authorName}</small>
              <span>{note.tags.join(', ') || 'Sin tags'}</span>
            </button>
          ))
        ) : (
          <EmptyState icon={<BookMarked size={30} />} message="No hay notas que coincidan con el filtro." title="Sin notas visibles" />
        )}
      </aside>

      {selectedNote ? (
        <NoteEditor
          key={selectedNote.id}
          note={selectedNote}
          onDelete={onDelete}
          onSave={onSave}
          viewerMember={viewerMember}
        />
      ) : (
        <EmptyState icon={<BookMarked size={30} />} message="Crea una nota para empezar." title="Cuaderno vacío" />
      )}
    </section>
  )
}
